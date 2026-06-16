import Layout from "@/components/Layout/Layout";
import { GlassCard } from "@/components/UI/GlassCard";
import { useIdentities } from "@/hooks/useIdentities";
import { useMissions } from "@/hooks/useMissions";
import { IdentityAvatar } from "@/components/UI/IdentityAvatar";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const BLOCKS = ["Mañana", "Tarde", "Noche"];

export default function Planning() {
  const { data: identities = [] } = useIdentities();
  const { data: missions = [] } = useMissions();

  // Asignación demo: rotamos identidades activas por bloques
  const active = identities.filter((i) => i.status === "active");
  const cell = (d: number, b: number) => active[(d + b) % Math.max(1, active.length)];

  return (
    <Layout title="Agenda semanal" subtitle="Equilibra qué identidad lleva cada bloque del día">
      <GlassCard className="p-4 md:p-6 overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-8 gap-2">
          <div />
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground py-2">{d}</div>
          ))}
          {BLOCKS.map((block, bi) => (
            <>
              <div key={block} className="flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">{block}</div>
              {DAYS.map((_, di) => {
                const id = cell(di, bi);
                return (
                  <div key={`${bi}-${di}`} className="aspect-square rounded-xl border border-border bg-card/40 p-2 transition-all hover:border-primary/40 hover:bg-card">
                    {id && (
                      <div className="flex h-full flex-col items-center justify-center gap-1">
                        <IdentityAvatar name={id.name} color={id.color} size="sm" />
                        <span className="text-[9px] font-medium text-center leading-tight">{id.name.replace("El ", "")}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="mt-5 p-5">
        <h3 className="mb-4 font-display font-bold">Equilibrio de la semana</h3>
        <div className="space-y-3">
          {identities.map((i) => {
            const count = Array.from({ length: 21 }).filter((_, idx) => active[idx % Math.max(1, active.length)]?.id === i.id).length;
            const pct = Math.round((count / 21) * 100);
            return (
              <div key={i.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{i.name}</span>
                  <span className="text-xs text-muted-foreground">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                  <div className="h-full rounded-full bg-gradient-emerald transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {missions.length > 0 && (
        <GlassCard className="mt-5 p-5">
          <h3 className="mb-3 font-display font-bold">Misiones programadas</h3>
          <ul className="space-y-2">
            {missions.filter(m => m.status !== "completed").slice(0, 6).map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded-xl border border-border bg-card/30 px-4 py-3">
                <span className="font-medium">{m.is_primary ? "★ " : ""}{m.title}</span>
                <span className="text-xs text-muted-foreground">{m.due_date ?? "sin fecha"}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}
    </Layout>
  );
}
