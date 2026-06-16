import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Options = {
  onOpenPalette: () => void;
  onOpenCoach?: () => void;
};

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;
}

export function useGlobalHotkeys({ onOpenPalette, onOpenCoach }: Options) {
  const nav = useNavigate();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenPalette();
        return;
      }
      if (isTyping(e.target)) return;
      if (e.altKey || e.metaKey || e.ctrlKey) return;
      switch (e.key.toLowerCase()) {
        case "n":
          nav("/proyectos?new=1");
          break;
        case "f":
          nav("/enfoque");
          break;
        case "m":
          nav("/perfil#modo");
          break;
        case "b":
          window.dispatchEvent(new CustomEvent("zeofyou:brain-dump"));
          break;
        case "c":
          onOpenCoach?.();
          break;
        case "?":
          onOpenPalette();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [nav, onOpenPalette, onOpenCoach]);
}
