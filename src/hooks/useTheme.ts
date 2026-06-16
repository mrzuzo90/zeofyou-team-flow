import { useCallback, useEffect, useState } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { MODES, type ModeKey } from "@/lib/modes";

export type ThemeName = "light" | "dark";
export type ThemeByMode = Record<ModeKey, ThemeName>;

const STORAGE_KEY = "zeofyou.themeByMode";

function systemDefault(): ThemeName {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function readLocal(): Partial<ThemeByMode> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<ThemeByMode>) : {};
  } catch {
    return {};
  }
}

function writeLocal(map: ThemeByMode) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function fullMap(partial: Partial<ThemeByMode>, fallback: ThemeName): ThemeByMode {
  const out = {} as ThemeByMode;
  for (const m of MODES) {
    out[m.key] = (partial[m.key] as ThemeName) ?? fallback;
  }
  return out;
}

/** Selector claro/oscuro por modo de contexto, con persistencia local + perfil. */
export function useTheme() {
  const { mode } = useCurrentMode();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();

  const [map, setMap] = useState<ThemeByMode>(() => {
    const local = readLocal();
    if (Object.keys(local).length) return fullMap(local, systemDefault());
    return fullMap({}, systemDefault());
  });

  // Hidratar desde el perfil la primera vez que llega
  useEffect(() => {
    if (!profile) return;
    const prefs = (profile.preferences ?? {}) as any;
    const remote = prefs.themeByMode as Partial<ThemeByMode> | undefined;
    const legacy = prefs.theme as ThemeName | undefined;
    if (remote && Object.keys(remote).length) {
      const merged = fullMap(remote, legacy ?? systemDefault());
      setMap(merged);
      writeLocal(merged);
    } else if (legacy) {
      const local = readLocal();
      if (!Object.keys(local).length) {
        const merged = fullMap({}, legacy);
        setMap(merged);
        writeLocal(merged);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const theme = map[mode] ?? "dark";

  // Aplicar al <html>
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const setThemeForMode = useCallback(
    (m: ModeKey, t: ThemeName) => {
      setMap((prev) => {
        const next = { ...prev, [m]: t };
        writeLocal(next);
        // Sync al perfil (no bloqueante)
        const prefs = (profile?.preferences ?? {}) as any;
        update.mutate({
          preferences: { ...prefs, themeByMode: next, theme: t },
        } as any);
        return next;
      });
    },
    [profile, update],
  );

  const toggleTheme = useCallback(() => {
    setThemeForMode(mode, theme === "dark" ? "light" : "dark");
  }, [mode, theme, setThemeForMode]);

  return { theme, themeByMode: map, mode, toggleTheme, setThemeForMode };
}
