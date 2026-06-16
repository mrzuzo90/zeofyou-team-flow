import { useMemo } from "react";
import type { FocusSession } from "@/hooks/useFocusSessions";

const WEEKS = 26; // últimos 6 meses ≈ legible en móvil
const DAYS = 7;

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function FocusHeatmap({ sessions }: { sessions: FocusSession[] }) {
  const { cells, max } = useMemo(() => {
    const totals = new Map<string, number>();
    for (const s of sessions) {
      const k = dateKey(new Date(s.completed_at));
      totals.set(k, (totals.get(k) ?? 0) + (s.duration_minutes ?? 0));
    }
    // Construir grid empezando en el lunes de hace WEEKS semanas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Reposicionar al final de esta semana (domingo)
    const end = new Date(today);
    const dow = (end.getDay() + 6) % 7; // 0 = lunes
    end.setDate(end.getDate() - dow + 6);

    const start = new Date(end);
    start.setDate(end.getDate() - WEEKS * DAYS + 1);

    const cells: { date: Date; minutes: number }[] = [];
    let max = 0;
    for (let i = 0; i < WEEKS * DAYS; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const mins = totals.get(dateKey(d)) ?? 0;
      max = Math.max(max, mins);
      cells.push({ date: d, minutes: mins });
    }
    return { cells, max };
  }, [sessions]);

  const colorFor = (m: number) => {
    if (m === 0) return "bg-muted/30";
    const ratio = max ? m / max : 0;
    if (ratio < 0.25) return "bg-primary/20";
    if (ratio < 0.5) return "bg-primary/40";
    if (ratio < 0.75) return "bg-primary/65";
    return "bg-primary";
  };

  // Render por columnas (semanas)
  const weeks: typeof cells[] = [];
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(cells.slice(w * DAYS, (w + 1) * DAYS));
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((c, di) => (
              <div
                key={di}
                className={`h-3 w-3 rounded-[3px] ${colorFor(c.minutes)}`}
                title={`${c.date.toLocaleDateString("es-ES")}: ${c.minutes} min`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Menos</span>
        <div className="h-3 w-3 rounded-[3px] bg-muted/30" />
        <div className="h-3 w-3 rounded-[3px] bg-primary/20" />
        <div className="h-3 w-3 rounded-[3px] bg-primary/40" />
        <div className="h-3 w-3 rounded-[3px] bg-primary/65" />
        <div className="h-3 w-3 rounded-[3px] bg-primary" />
        <span>Más</span>
      </div>
    </div>
  );
}
