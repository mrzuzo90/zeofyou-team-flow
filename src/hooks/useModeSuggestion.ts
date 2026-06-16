import { useEffect } from "react";
import { toast } from "sonner";
import { suggestMode, getMode } from "@/lib/modes";
import { useCurrentMode } from "@/hooks/useCurrentMode";

const STORAGE_KEY = "zeofyou:mode-suggestion-dismissed";

export function useModeSuggestion() {
  const { mode, autoSuggest, setMode } = useCurrentMode();

  useEffect(() => {
    if (!autoSuggest) return;
    const suggested = suggestMode();
    if (!suggested || suggested === mode) return;

    const dismissedFor = sessionStorage.getItem(STORAGE_KEY);
    if (dismissedFor === suggested) return;

    const def = getMode(suggested);
    const id = setTimeout(() => {
      toast(`¿Activar modo ${def.label}?`, {
        description: def.description,
        duration: 10000,
        action: {
          label: "Activar",
          onClick: () => setMode(suggested),
        },
        onDismiss: () => sessionStorage.setItem(STORAGE_KEY, suggested),
        onAutoClose: () => sessionStorage.setItem(STORAGE_KEY, suggested),
      });
    }, 800);
    return () => clearTimeout(id);
  }, [mode, autoSuggest, setMode]);
}
