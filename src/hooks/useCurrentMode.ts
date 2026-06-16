import { useEffect } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { type ModeKey } from "@/lib/modes";

export function useCurrentMode() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();

  const mode = ((profile as any)?.current_mode ?? "work") as ModeKey;
  const autoSuggest = ((profile as any)?.mode_auto_suggest ?? true) as boolean;

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  const setMode = (next: ModeKey) => update.mutate({ current_mode: next } as any);
  const setAutoSuggest = (v: boolean) => update.mutate({ mode_auto_suggest: v } as any);

  return { mode, autoSuggest, setMode, setAutoSuggest };
}
