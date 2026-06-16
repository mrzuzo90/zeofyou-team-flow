import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import { GlassCard } from "@/components/UI/GlassCard";
import { useProfile } from "@/hooks/useProfile";
import { useIdentities } from "@/hooks/useIdentities";
import { useMissions } from "@/hooks/useMissions";
import { useFocusSessions } from "@/hooks/useFocusSessions";
import { IdentityAvatar } from "@/components/UI/IdentityAvatar";
import { EnergyRing } from "@/components/UI/EnergyRing";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, Timer, AlertTriangle, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { statusLabel } from "@/lib/zeofyou";

export default function Dashboard() {
  const nav = useNavigate();
  const { data: profile } = useProfile();
  const { data: identities = [] } = useIdentities();
  const { data: missions = [] } = useMissions();
  const { data: sessions = [] } = useFocusSessions(20);

  const primary = missions.find((m) => m.is_primary && m.status !== "completed" && m.status !== "archived");
  const activeIdentities = identities.filter((i) => i.status === "active");
  const teamEnergy = identities.length ? Math.round(identities.reduce((a, b) => a + b.energy, 0) / identities.length) : 0;
  const focusToday = sessions.filter((s) => new Date(s.completed_at).toDateString() === new Date().toDateString()).reduce((a, b) => a + b.duration_minutes, 0);
  const completedMissions = missions.filter((m) => m.status === "completed").length;
  const conflict = activeIdentities.length > 3;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return "Buenas noches";
    if (h < 13) return "Buenos días";
    if (h < 20) return "Buenas tardes";
    return "Buenas noches";
  })();

  return (
    <Layout title={`${greeting}, ${profile?.display_name ?? "tú"}`} subtitle="Así está hoy tu equipo">
      <div className="grid gap-5 lg:grid-cols-3">
        {/* HERO con misión principal */}
        <GlassCard glow="emerald" className="lg:col-span-2 overflow-hidden p-0">
          <div className="relative p-6 md:p-8">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-glow opacity-50 blur-2xl" />
            <div className="relative">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3 w-3" /> Misión principal de hoy
              </div>
              {primary ? (
                <>
                  <h2 className="font-display text-2xl font-bold leading-tight md:text-3xl text-balance">{primary.title}</h2>
                  {primary.description && <p className="mt-2 text-sm text-muted-foreground">{primary.description}</p>}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Button size="lg" onClick={() => nav("/enfoque")} className="gap-2 bg-gradient-emerald font-semibold text-primary-foreground hover:opacity-90">
                      <Timer className="h-4 w-4" /> Entrar en Focus
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => nav("/proyectos")}>
                      Ver misiones <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-display text-2xl font-bold">Aún no hay misión principal</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Elige una misión clave para hoy y bloquea el ruido de las demás.</p>
                  <Button onClick={() => nav("/proyectos")} className="mt-5 gap-2 bg-gradient-emerald text-primary-foreground hover:opacity-90">
                    <Target className="h-4 w-4" /> Definir misión principal
                  </Button>
                </>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Métricas rápidas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <GlassCard className="flex items-center gap-4 p-5">
            <EnergyRing value={teamEnergy} size={64}>
              <span className="text-sm font-display font-bold">{teamEnergy}</span>
            </EnergyRing>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Energía del equipo</div>
              <div className="font-display text-xl font-bold">{teamEnergy}%</div>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-4 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/15 text-secondary"><Timer className="h-6 w-6" /></div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Focus hoy</div>
              <div className="font-display text-xl font-bold">{focusToday}<span className="text-sm font-normal text-muted-foreground"> min</span></div>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-4 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/15 text-warning"><Zap className="h-6 w-6" /></div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Misiones completadas</div>
              <div className="font-display text-xl font-bold">{completedMissions}</div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Alerta de conflicto */}
      {conflict && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <GlassCard className="flex items-start gap-3 border border-warning/30 bg-warning/5 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="flex-1">
              <div className="font-semibold text-foreground">Demasiadas identidades activas</div>
              <p className="text-sm text-muted-foreground">Tienes {activeIdentities.length} identidades activas a la vez. Considera poner alguna en descanso para mantener el foco.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => nav("/identidades")}>Gestionar</Button>
          </GlassCard>
        </motion.div>
      )}

      {/* Equipo */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Tu equipo</h2>
          <Button variant="ghost" size="sm" onClick={() => nav("/identidades")}>Ver todo <ArrowRight className="ml-1 h-3 w-3" /></Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {identities.map((id) => (
            <GlassCard key={id.id} className="p-4 hover-lift cursor-pointer" onClick={() => nav("/identidades")}>
              <div className="flex items-start gap-3">
                <IdentityAvatar name={id.name} color={id.color} status={id.status} />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold truncate">{id.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{id.role}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{statusLabel[id.status]}</span>
                <EnergyRing value={id.energy} size={32} stroke={3} color={id.color}>
                  <span className="text-[9px] font-bold">{id.energy}</span>
                </EnergyRing>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </Layout>
  );
}
