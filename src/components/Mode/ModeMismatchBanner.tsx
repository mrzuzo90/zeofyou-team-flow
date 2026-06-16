import { AlertTriangle } from "lucide-react";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { getMode, type ModeKey } from "@/lib/modes";
import { GlassCard } from "@/components/UI/GlassCard";

/** Banner amable cuando entras a una pantalla cuyo contenido es de otro modo. */
export function ModeMismatchBanner({ pageContext }: { pageContext: ModeKey }) {
  const { mode } = useCurrentMode();
  if (mode === "none" || mode === pageContext) return null;
  const current = getMode(mode);
  const target = getMode(pageContext);
  return (
    <GlassCard className="mb-5 flex items-start gap-3 border border-warning/30 bg-warning/5 p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
      <div className="flex-1">
        <div className="font-semibold text-foreground">Ahora estás en modo {current.label}</div>
        <p className="text-sm text-muted-foreground">
          Estás mirando contenido de <span className="font-medium">{target.label}</span>. Si quieres desconectar, vuelve cuando estés en ese modo.
        </p>
      </div>
    </GlassCard>
  );
}
