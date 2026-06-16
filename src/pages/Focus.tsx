import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "@/components/Layout/Layout";
import { GlassCard } from "@/components/UI/GlassCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIdentities } from "@/hooks/useIdentities";
import { useMissions } from "@/hooks/useMissions";
import { useProfile } from "@/hooks/useProfile";
import { useLogFocusSession } from "@/hooks/useFocusSessions";
import { useAddXp } from "@/hooks/useProfile";
import { usePrivacy } from "@/contexts/PrivacyContext";
import { IdentityAvatar } from "@/components/UI/IdentityAvatar";
import { Play, Pause, RotateCcw, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { MagneticButton } from "@/components/Motion/MagneticButton";
import { cn } from "@/lib/utils";
import { resolvePersona, personaFontClass } from "@/lib/personas";

export default function Focus() {
  const { data: identities = [] } = useIdentities();
  const { data: missions = [] } = useMissions();
  const { data: profile } = useProfile();
  const logSession = useLogFocusSession();
  const addXp = useAddXp();
  const { enable } = usePrivacy();

  const primary = missions.find((m) => m.is_primary && m.status !== "completed");
  const [identityId, setIdentityId] = useState<string>("");
  const [missionId, setMissionId] = useState<string>(primary?.id ?? "");
  const [duration, setDuration] = useState<number>(profile?.preferences?.pomodoroMinutes ?? 25);
  const [secondsLeft, setSecondsLeft] = useState(duration * 60);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSecondsLeft(duration * 60);
  }, [duration]);

  useEffect(() => {
    if (!identityId && identities.length) setIdentityId(identities.find((i) => i.status === "active")?.id ?? identities[0].id);
  }, [identities, identityId]);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(ref.current!);
            setRunning(false);
            void finish();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const finish = async () => {
    await logSession.mutateAsync({ identity_id: identityId || null, mission_id: missionId || null, duration_minutes: duration });
    const xp = duration * 3;
    await addXp.mutateAsync(xp);
    toast.success(`¡Sesión completada! +${xp} XP`);
    setSecondsLeft(duration * 60);
  };

  const reset = () => { setRunning(false); setSecondsLeft(duration * 60); };

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");
  const totalSecs = duration * 60;
  const progress = ((totalSecs - secondsLeft) / totalSecs) * 100;

  const activeIdentity = useMemo(() => identities.find((i) => i.id === identityId), [identities, identityId]);
  const preset = activeIdentity ? resolvePersona(activeIdentity) : null;

  return (
    <Layout title="Focus" subtitle="Una identidad, una misión, un bloque de tiempo" seo={{ title: "Focus · sesión profunda | Zeofyou", description: "Entra en focus con una identidad y una misión: pomodoros, modo privacidad y registro automático.", path: "/enfoque" }}>
      <div className="mx-auto max-w-2xl">
        <GlassCard glow="emerald" className="p-6 md:p-10">
          {/* Selectores */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Identidad activa</label>
              <Select value={identityId} onValueChange={setIdentityId}>
                <SelectTrigger><SelectValue placeholder="Elige identidad" /></SelectTrigger>
                <SelectContent>
                  {identities.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Misión</label>
              <Select value={missionId} onValueChange={setMissionId}>
                <SelectTrigger><SelectValue placeholder="Sin misión" /></SelectTrigger>
                <SelectContent>
                  {missions.filter(m => m.status !== "completed").map((m) => <SelectItem key={m.id} value={m.id}>{m.is_primary ? "★ " : ""}{m.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pomodoro circular */}
          <div className="my-10 flex flex-col items-center">
            <div className="relative">
              <svg width="280" height="280" className="-rotate-90">
                <circle cx="140" cy="140" r="120" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" opacity="0.3" />
                <circle
                  cx="140" cy="140" r="120"
                  stroke="url(#focusGrad)"
                  strokeWidth="10" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 - (progress / 100) * 2 * Math.PI * 120}
                  className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="focusGrad">
                    <stop offset="0%" stopColor={preset ? `hsl(${preset.gradientFrom})` : "hsl(var(--primary))"} />
                    <stop offset="100%" stopColor={preset ? `hsl(${preset.gradientTo})` : "hsl(var(--accent))"} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {activeIdentity && (
                  <div className="mb-3"><IdentityAvatar identity={activeIdentity} name={activeIdentity.name} status={activeIdentity.status} /></div>
                )}
                <div
                  className={cn("text-6xl font-bold tabular-nums", running && "drop-shadow-[0_0_20px_hsl(var(--primary)/0.6)]", preset ? personaFontClass(preset) : "font-display")}
                  style={preset && running ? { textShadow: `0 0 24px hsl(${preset.accent} / 0.55)` } : undefined}
                >{mm}:{ss}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{running ? "En foco" : "Listo para empezar"}</div>
              </div>
            </div>

            {/* Selector de duración */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {[15, 25, 45, 60].map((d) => (
                <Button key={d} size="sm" variant={duration === d ? "default" : "outline"} onClick={() => { setDuration(d); }} disabled={running}>{d} min</Button>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button size="lg" aria-label="Reiniciar temporizador" variant="outline" onClick={reset} disabled={!running && secondsLeft === duration * 60}><RotateCcw className="h-4 w-4" /></Button>
              <MagneticButton
                aria-label={running ? "Pausar sesión de focus" : "Iniciar sesión de focus"}
                cursorLabel={running ? "Pausar" : "Empezar"}
                onClick={() => setRunning((r) => !r)}
                className={cn(
                  "ios-tap inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-emerald px-8 text-base font-semibold text-primary-foreground shadow-glow-emerald hover:opacity-95",
                  running && "animate-[pulse_2.4s_ease-in-out_infinite]",
                )}
              >
                {running ? <><Pause className="h-5 w-5" /> Pausar</> : <><Play className="h-5 w-5" /> {secondsLeft === duration * 60 ? "Empezar" : "Reanudar"}</>}
              </MagneticButton>
              <Button size="lg" aria-label="Activar pausa privada" variant="outline" onClick={enable} title="Pausa privada"><EyeOff className="h-4 w-4" /></Button>
            </div>
          </div>
        </GlassCard>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          ¿Te interrumpen? Pulsa el ojo o usa <kbd className="rounded bg-muted px-1.5 py-0.5">Shift</kbd> + <kbd className="rounded bg-muted px-1.5 py-0.5">Esc</kbd> para activar Pausa privada.
        </p>
      </div>
    </Layout>
  );
}
