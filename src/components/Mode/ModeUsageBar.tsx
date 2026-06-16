import { useModeSessions, aggregateByMode } from "@/hooks/useModeSessions";
import { GlassCard } from "@/components/UI/GlassCard";
import { getMode, MODES } from "@/lib/modes";
import { cn } from "@/lib/utils";

const BAR_COLOR: Record<string, string> = {
  emerald: "bg-primary",
  amber: "bg-warning",
  violet: "bg-accent",
  sky: "bg-secondary",
  muted: "bg-muted-foreground",
};

export function ModeUsageBar() {
  const { data: sessions = [] } = useModeSessions(7);
  const totals = aggregateByMode(sessions);
  const sum = Object.values(totals).reduce((a, b) => a + b, 0);
  const items = MODES.filter((m) => totals[m.key] > 0).map((m) => ({
    ...m,
    minutes: totals[m.key],
    pct: sum ? Math.round((totals[m.key] / sum) * 100) : 0,
  }));

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold">Tus modos esta semana</h3>
        <span className="text-xs text-muted-foreground">últimos 7 días</span>
      </div>
      {sum === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Cambia de modo unas cuantas veces para ver tu reparto aquí.</p>
      ) : (
        <>
          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-muted/40">
            {items.map((m) => (
              <div key={m.key} className={cn("h-full", BAR_COLOR[m.color] ?? BAR_COLOR.muted)} style={{ width: `${m.pct}%` }} title={`${m.label} ${m.pct}%`} />
            ))}
          </div>
          <ul className="mt-4 space-y-1.5 text-sm">
            {items.map((m) => {
              const Icon = m.icon;
              const h = Math.floor(m.minutes / 60);
              const min = m.minutes % 60;
              return (
                <li key={m.key} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{m.label}</span>
                  </span>
                  <span className="text-muted-foreground">{m.pct}% · {h > 0 ? `${h}h ` : ""}{min}m</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </GlassCard>
  );
}
