import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useRecordModeChange } from "@/hooks/useModeSessions";
import { type ModeKey } from "@/lib/modes";

export function useCurrentMode() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const record = useRecordModeChange();
  const nav = useNavigate();
  const lastMode = useRef<ModeKey | null>(null);

  const mode = ((profile as any)?.current_mode ?? "work") as ModeKey;
  const autoSuggest = ((profile as any)?.mode_auto_suggest ?? true) as boolean;
  const ritualEnabled = ((profile as any)?.transition_ritual_enabled ?? true) as boolean;

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    // Detectar cambio real de modo (no la primera carga) y registrar
    if (lastMode.current && lastMode.current !== mode) {
      record.mutate(mode);
    }
    lastMode.current = mode;
  }, [mode]);

  /** Llama esto desde el selector para activar el ritual si procede. */
  const setMode = async (next: ModeKey, opts?: { skipRitual?: boolean }) => {
    if (next === mode) return;
    if (ritualEnabled && !opts?.skipRitual && next !== "none" && mode !== "none") {
      nav(`/transicion?from=${mode}&to=${next}`);
      return;
    }
    await update.mutateAsync({ current_mode: next } as any);
  };

  const setAutoSuggest = (v: boolean) => update.mutate({ mode_auto_suggest: v } as any);
  const setRitualEnabled = (v: boolean) => update.mutate({ transition_ritual_enabled: v } as any);

  return { mode, autoSuggest, ritualEnabled, setMode, setAutoSuggest, setRitualEnabled };
}
