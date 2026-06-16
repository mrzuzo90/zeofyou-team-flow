import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import { GlassCard } from "@/components/UI/GlassCard";
import { useProfile } from "@/hooks/useProfile";
import { useIdentities } from "@/hooks/useIdentities";
import { useMissions } from "@/hooks/useMissions";
import { useFocusSessions } from "@/hooks/useFocusSessions";
import { EnergyRing } from "@/components/UI/EnergyRing";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, Timer, AlertTriangle, Heart, CheckCircle2, Play } from "lucide-react";
import { motion } from "framer-motion";
import { statusLabel } from "@/lib/zeofyou";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { getMode } from "@/lib/modes";
import { TwoMinWidget } from "@/components/Dashboard/TwoMinWidget";
import { cn } from "@/lib/utils";
import { KineticHeading } from "@/components/Motion/KineticHeading";
import { AnimatedNumber } from "@/components/Motion/AnimatedNumber";
import { TiltCard } from "@/components/Motion/TiltCard";
import { MagneticButton } from "@/components/Motion/MagneticButton";

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

  const roles = ["Estratega", "Creativo", "Conector", "Sabio", "Guardián", "Explorador", "Sanador", "Constructor"];

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
              🔥 <AnimatedNumber value={profile.streak_days} /> {profile.streak_days === 1 ? "día" : "días"}
            </span>
            <span className="flex shrink-0 items-center gap-2 rounded-full bg-card/60 border border-border/60 px-4 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em]">
              Nv <AnimatedNumber value={profile.level} />
            </span>
          </>
        )}
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* HERO con halo aurora + borde animado */}
        <GlassCard
          halo
          className="lg:col-span-2 overflow-hidden p-0 bg-gradient-night aurora-border"
        >
          <div className="relative p-6 md:p-10">
            {/* Marquee de roles muy sutil al fondo */}
            <div className="pointer-events-none absolute inset-x-0 top-2 marquee opacity-[0.06]">
              <div className="flex shrink-0 gap-12 font-serif text-6xl italic md:text-8xl">
                {[...roles, ...roles].map((r, i) => (
                  <span key={i}>{r}</span>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                </span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                  Misión principal de hoy
                </span>
              </div>
              {primary ? (
                <>
                  <KineticHeading
                    text={primary.title}
                    as="h2"
                    splitBy="word"
                    className="font-display text-3xl font-bold leading-[1.05] md:text-5xl text-balance"
                  />
                  {primary.description && (
                    <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">{primary.description}</p>
                  )}
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <MagneticButton
                      onClick={() => nav("/enfoque")}
                      cursorLabel="Focus"
                      className="ios-tap inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-aurora px-6 font-display text-sm font-bold text-background shadow-aurora"
                    >
                      <Play className="h-4 w-4 fill-background" /> Entrar en Focus
                    </MagneticButton>
                    <MagneticButton
                      onClick={() => nav("/proyectos")}
                      cursorLabel="Ver"
                      className="ios-tap inline-flex h-12 items-center gap-2 rounded-2xl border border-border/60 bg-card/40 px-5 text-sm font-semibold"
                    >
                      Ver misiones <ArrowRight className="h-4 w-4" />
                    </MagneticButton>
                  </div>
                </>
              ) : (
                <>
                  <KineticHeading
                    text="Aún no hay misión principal"
                    as="h2"
                    splitBy="word"
                    className="font-display text-3xl font-bold md:text-5xl text-balance"
                  />
                  <p className="mt-3 max-w-md text-sm text-muted-foreground md:text-base">
                    Elige una misión clave para hoy y bloquea el ruido de las demás.
                  </p>
                  <MagneticButton
                    onClick={() => nav("/proyectos")}
                    cursorLabel="Definir"
                    className="ios-tap mt-7 inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-aurora px-6 font-display text-sm font-bold text-background shadow-aurora"
                  >
                    <Target className="h-4 w-4" /> Definir misión principal
                  </MagneticButton>
                </>
              )}
            </div>
          </div>
        </GlassCard>

        {/* KPI tiles bento */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <KpiTile
            icon={<Heart className="h-4 w-4 text-primary" />}
            iconWrap="bg-primary/15"
            label="Energía equipo"
            value={<><AnimatedNumber value={teamEnergy} />%</>}
            ring={teamEnergy}
            ringColor="primary"
          />
          <KpiTile
            icon={<Timer className="h-4 w-4 text-secondary" />}
            iconWrap="bg-secondary/15"
            label="Focus hoy"
            value={
              <>
                <AnimatedNumber value={focusToday} />
                <span className="ml-1 text-sm font-normal text-muted-foreground">min</span>
              </>
            }
          />
          <KpiTile
            icon={<CheckCircle2 className="h-4 w-4 text-accent" />}
            iconWrap="bg-accent/15"
            label="Completadas"
            value={<AnimatedNumber value={completedMissions} />}
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
      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
              · 02 / Identidades
            </p>
            <h2 className="font-serif text-3xl font-semibold italic md:text-4xl">
              Tu <span className="gradient-text">equipo</span>
            </h2>
          </div>
          <MagneticButton
            onClick={() => nav("/identidades")}
            cursorLabel="Ver"
            className="ios-tap inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-accent"
          >
            Ver todo <ArrowRight className="h-3 w-3" />
          </MagneticButton>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
    <TiltCard className={cn("rounded-[1.75rem]", className)} intensity={5}>
      <GlassCard className="flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", iconWrap)}>{icon}</span>
          {ring !== undefined && (
            <EnergyRing value={ring} size={42} stroke={4} color={ringColor}>
              <span className="font-mono text-[9px] font-bold">{ring}</span>
            </EnergyRing>
          )}
        </div>
        <div className="mt-3">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
          <p className="font-display text-3xl font-bold tracking-tight">{value}</p>
        </div>
      </GlassCard>
    </TiltCard>
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
    <TiltCard intensity={6} className="rounded-[1.75rem]">
      <GlassCard
        data-cursor="view"
        data-cursor-label="Abrir"
        className="ios-tap cursor-pointer p-5 hover:bg-card/70"
        onClick={onOpen}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-display font-bold text-background shadow-lg"
              style={{ background: `linear-gradient(135deg, ${identity.color}, ${identity.color}cc)` }}
            >
              {initial}
            </div>
            <span
              className={cn(
                "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background",
                isActive ? "bg-primary" : "bg-muted",
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="truncate font-serif text-lg italic">{identity.name}</h4>
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {identity.role}
            </p>
          </div>
          <EnergyRing value={identity.energy} size={40} stroke={3} color={identity.color}>
            <span className="font-mono text-[9px] font-bold">{identity.energy}</span>
          </EnergyRing>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-primary" : "bg-muted-foreground/40")} />
            <span
              className={cn(
                "font-mono text-[9px] font-bold uppercase tracking-[0.2em]",
                isActive ? "text-primary" : "text-muted-foreground/60",
              )}
            >
              {statusLabel[identity.status as keyof typeof statusLabel]}
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
            #{identity.id.slice(0, 4)}
          </span>
        </div>
      </GlassCard>
    </TiltCard>
  );
}
