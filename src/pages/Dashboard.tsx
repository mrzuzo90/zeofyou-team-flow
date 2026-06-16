import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import { GlassCard } from "@/components/UI/GlassCard";
import { useProfile } from "@/hooks/useProfile";
import { useIdentities } from "@/hooks/useIdentities";
import { useMissions } from "@/hooks/useMissions";
import { useFocusSessions } from "@/hooks/useFocusSessions";
import { EnergyRing } from "@/components/UI/EnergyRing";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, Timer, AlertTriangle, Zap, Heart, CheckCircle2, Play } from "lucide-react";
import { motion } from "framer-motion";
import { statusLabel } from "@/lib/zeofyou";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { getMode } from "@/lib/modes";
import { TwoMinWidget } from "@/components/Dashboard/TwoMinWidget";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Dashboard() {
  const nav = useNavigate();
  const { data: profile } = useProfile();
  const { data: allIdentities = [] } = useIdentities();
  const { data: allMissions = [] } = useMissions();
  const { data: sessions = [] } = useFocusSessions(20);
  const { mode } = useCurrentMode();
  const currentMode = getMode(mode);

  const inMode = (ctx: string | null) => mode === "none" || !ctx || ctx === mode;
  const identities = allIdentities.filter((i) => inMode(i.context));
  const missions = allMissions.filter((m) => inMode(m.context));

  const primary = missions.find((m) => m.is_primary && m.status !== "completed" && m.status !== "archived");
  const activeIdentities = identities.filter((i) => i.status === "active");
  const teamEnergy = identities.length ? Math.round(identities.reduce((a, b) => a + b.energy, 0) / identities.length) : 0;
  const focusToday = sessions
    .filter((s) => new Date(s.completed_at).toDateString() === new Date().toDateString())
    .reduce((a, b) => a + b.duration_minutes, 0);
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
    <Layout
      title={`Panel · ${greeting}, ${profile?.display_name ?? "tú"}`}
      subtitle={mode === "none" ? "Así está hoy tu equipo" : `Modo ${currentMode.label} · ${currentMode.description}`}
      seo={{
        title: "Panel de control | Zeofyou",
        description: "Tu equipo interno de un vistazo: misión principal, energía del equipo y focus del día.",
        path: "/",
      }}
    >
      {/* Píldoras de contexto */}
      <motion.div {...fadeUp} className="mb-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="flex shrink-0 items-center gap-2 rounded-full bg-card/60 border border-border/60 px-4 py-2 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" /> Modo {currentMode.label}
        </span>
        {profile && (
          <>
            <span className="flex shrink-0 items-center gap-2 rounded-full bg-card/60 border border-border/60 px-4 py-2 text-xs font-semibold">
              🔥 {profile.streak_days} {profile.streak_days === 1 ? "día" : "días"}
            </span>
            <span className="flex shrink-0 items-center gap-2 rounded-full bg-card/60 border border-border/60 px-4 py-2 text-[10px] font-black uppercase tracking-widest">
              Nv {profile.level}
            </span>
          </>
        )}
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* HERO con halo aurora */}
        <GlassCard
          halo
          className="lg:col-span-2 overflow-hidden p-0 bg-gradient-night"
        >
          <div className="relative p-6 md:p-8">
            <div className="mb-4 inline-flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Misión principal de hoy</span>
            </div>
            {primary ? (
              <>
                <h2 className="font-display text-2xl font-bold leading-tight md:text-3xl text-balance">{primary.title}</h2>
                {primary.description && <p className="mt-2 text-sm text-muted-foreground">{primary.description}</p>}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    onClick={() => nav("/enfoque")}
                    className="ios-tap gap-2 rounded-2xl bg-gradient-aurora text-background font-display font-bold shadow-aurora hover:opacity-95"
                  >
                    <Play className="h-4 w-4 fill-background" /> Entrar en Focus
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => nav("/proyectos")}
                    className="ios-tap rounded-2xl border-border/60 bg-card/40"
                  >
                    Ver misiones <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold md:text-3xl">Aún no hay misión principal</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Elige una misión clave para hoy y bloquea el ruido de las demás.
                </p>
                <Button
                  onClick={() => nav("/proyectos")}
                  size="lg"
                  className="ios-tap mt-6 w-full gap-2 rounded-2xl bg-gradient-aurora font-display font-bold text-background shadow-aurora hover:opacity-95 sm:w-auto"
                >
                  <Target className="h-4 w-4" /> Definir misión principal
                </Button>
              </>
            )}
          </div>
        </GlassCard>

        {/* KPI tiles bento */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <KpiTile
            icon={<Heart className="h-4 w-4 text-primary" />}
            iconWrap="bg-primary/15"
            label="Energía equipo"
            value={`${teamEnergy}%`}
            ring={teamEnergy}
            ringColor="primary"
          />
          <KpiTile
            icon={<Timer className="h-4 w-4 text-secondary" />}
            iconWrap="bg-secondary/15"
            label="Focus hoy"
            value={
              <>
                {focusToday}
                <span className="ml-1 text-sm font-normal text-muted-foreground">min</span>
              </>
            }
          />
          <KpiTile
            icon={<CheckCircle2 className="h-4 w-4 text-accent" />}
            iconWrap="bg-accent/15"
            label="Completadas"
            value={completedMissions}
            className="col-span-2 lg:col-span-1"
          />
        </div>
      </div>

      {/* Alerta de conflicto */}
      {conflict && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <GlassCard className="flex items-start gap-3 border border-warning/30 bg-warning/5 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="flex-1">
              <div className="font-semibold text-foreground">Demasiadas identidades activas</div>
              <p className="text-sm text-muted-foreground">
                Tienes {activeIdentities.length} identidades activas a la vez. Considera poner alguna en descanso para mantener el foco.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => nav("/identidades")}>
              Gestionar
            </Button>
          </GlassCard>
        </motion.div>
      )}

      {/* Acción de 2 minutos */}
      <section className="mt-4">
        <TwoMinWidget />
      </section>

      {/* Equipo */}
      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Identidades</p>
            <h2 className="font-display text-xl font-bold">Tu equipo</h2>
          </div>
          <button
            onClick={() => nav("/identidades")}
            className="ios-tap inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-accent"
          >
            Ver todo <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {identities.map((id) => (
            <IdentityTile key={id.id} identity={id} onOpen={() => nav("/identidades")} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

function KpiTile({
  icon,
  iconWrap,
  label,
  value,
  ring,
  ringColor,
  className,
}: {
  icon: React.ReactNode;
  iconWrap: string;
  label: string;
  value: React.ReactNode;
  ring?: number;
  ringColor?: string;
  className?: string;
}) {
  return (
    <GlassCard className={cn("flex flex-col justify-between p-4", className)}>
      <div className="flex items-start justify-between">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", iconWrap)}>{icon}</span>
        {ring !== undefined && (
          <EnergyRing value={ring} size={42} stroke={4} color={ringColor}>
            <span className="text-[9px] font-bold">{ring}</span>
          </EnergyRing>
        )}
      </div>
      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="font-display text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </GlassCard>
  );
}

function IdentityTile({
  identity,
  onOpen,
}: {
  identity: { id: string; name: string; role: string; color: string; status: string; energy: number };
  onOpen: () => void;
}) {
  const initial = identity.name[0]?.toUpperCase() ?? "?";
  const isActive = identity.status === "active";
  return (
    <GlassCard
      className="ios-tap cursor-pointer p-4 hover:bg-card/70"
      onClick={onOpen}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-display font-bold text-background shadow-lg"
            style={{ background: `linear-gradient(135deg, ${identity.color}, ${identity.color}cc)` }}
          >
            {initial}
          </div>
          <span
            className={cn(
              "absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background",
              isActive ? "bg-primary" : "bg-muted",
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="truncate font-display text-sm font-bold">{identity.name}</h4>
          <p className="truncate text-[11px] text-muted-foreground">{identity.role}</p>
        </div>
        <EnergyRing value={identity.energy} size={36} stroke={3} color={identity.color}>
          <span className="text-[9px] font-bold">{identity.energy}</span>
        </EnergyRing>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-primary" : "bg-muted-foreground/40")} />
        <span
          className={cn(
            "text-[9px] font-bold uppercase tracking-widest",
            isActive ? "text-primary" : "text-muted-foreground/60",
          )}
        >
          {statusLabel[identity.status as keyof typeof statusLabel]}
        </span>
      </div>
    </GlassCard>
  );
}
