import { useNavigate } from "react-router-dom";
import { Timer, ArrowLeft, Star } from "lucide-react";
import { useMissions } from "@/hooks/useMissions";
import { useProfile } from "@/hooks/useProfile";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { getMode } from "@/lib/modes";

export default function HandsFree() {
  const nav = useNavigate();
  const { data: profile } = useProfile();
  const { data: missions = [] } = useMissions();
  const { mode } = useCurrentMode();
  const primary = missions.find((m) => m.is_primary && m.status !== "completed" && m.status !== "archived");
  const currentMode = getMode(mode);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground" style={{ background: "var(--gradient-hero)" }}>
      <div className="flex items-center justify-between p-4">
        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Salir
        </button>
        <div className="text-sm text-muted-foreground">Manos libres · {currentMode.label}</div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Hola {profile?.display_name ?? ""}
        </div>
        {primary ? (
          <>
            <Star className="mb-4 h-8 w-8 text-warning" />
            <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">{primary.title}</h1>
            {primary.description && (
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">{primary.description}</p>
            )}
          </>
        ) : (
          <>
            <h1 className="font-display text-4xl font-bold md:text-6xl">Sin misión principal</h1>
            <p className="mt-4 text-lg text-muted-foreground">Define una desde el dashboard.</p>
          </>
        )}

        <button
          onClick={() => nav("/enfoque")}
          className="mt-12 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-emerald text-primary-foreground shadow-glow-emerald transition-transform hover:scale-105 md:h-40 md:w-40"
        >
          <div className="flex flex-col items-center">
            <Timer className="h-10 w-10 md:h-12 md:w-12" />
            <span className="mt-1 text-xs font-bold uppercase tracking-wider md:text-sm">Focus</span>
          </div>
        </button>
      </div>
    </div>
  );
}
