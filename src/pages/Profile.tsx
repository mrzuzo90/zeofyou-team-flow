import { useEffect, useState } from "react";
import Layout from "@/components/Layout/Layout";
import { GlassCard } from "@/components/UI/GlassCard";
import { XPBar } from "@/components/UI/XPBar";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { LogOut, Trophy, Flame, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { xpProgress } from "@/lib/zeofyou";
import { cn } from "@/lib/utils";
import { ModeUsageBar } from "@/components/Mode/ModeUsageBar";
import { Switch } from "@/components/ui/switch";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { useTheme } from "@/hooks/useTheme";
import { MODES } from "@/lib/modes";
import { AnimatedNumber } from "@/components/Motion/AnimatedNumber";
import { TiltCard } from "@/components/Motion/TiltCard";
import { MagneticButton } from "@/components/Motion/MagneticButton";

const RARITY: Record<string, string> = {
  common: "bg-muted/40 text-muted-foreground border-muted",
  rare: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  epic: "bg-violet-500/15 text-violet-300 border-violet-500/40",
  legendary: "bg-warning/15 text-warning border-warning/40",
};

export default function Profile() {
  const { signOut, user } = useAuth();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const { ritualEnabled, setRitualEnabled } = useCurrentMode();
  const { themeByMode, setThemeForMode } = useTheme();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [pomodoro, setPomodoro] = useState(profile?.preferences?.pomodoroMinutes ?? 25);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [unlocked, setUnlocked] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setName(profile.display_name ?? "");
      setPomodoro(profile.preferences?.pomodoroMinutes ?? 25);
    }
  }, [profile]);

  useEffect(() => {
    const load = async () => {
      const { data: all } = await supabase.from("achievements").select("*");
      const { data: mine } = await supabase.from("user_achievements").select("achievement_id").eq("user_id", user!.id);
      setAchievements(all ?? []);
      setUnlocked((mine ?? []).map((m: any) => m.achievement_id));
    };
    if (user) load();
  }, [user]);

  const save = async () => {
    await update.mutateAsync({
      display_name: name,
      preferences: { ...(profile?.preferences ?? {}), pomodoroMinutes: pomodoro, breakMinutes: profile?.preferences?.breakMinutes ?? 5, theme: profile?.preferences?.theme ?? "dark" },
    });
    toast.success("Guardado");
  };

  const { level, current, needed } = xpProgress(profile?.xp ?? 0);

  return (
    <Layout title="Perfil" subtitle="Tu nivel, tus logros y tus preferencias" seo={{ title: "Perfil y preferencias | Zeofyou", description: "Revisa tu nivel, logros desbloqueados y configura las preferencias de Zeofyou.", path: "/perfil" }}>
      <div className="grid gap-5 lg:grid-cols-3">
        <TiltCard intensity={5} className="rounded-3xl lg:col-span-2">
          <GlassCard glow="emerald" className="p-6">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-emerald text-3xl font-display font-bold text-primary-foreground shadow-glow-emerald">
                {(profile?.display_name ?? "T")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-2xl font-bold truncate">{profile?.display_name ?? "Usuario"}</div>
                <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">Nivel <AnimatedNumber value={level} /></span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning"><Flame className="h-3 w-3" /> <AnimatedNumber value={profile?.streak_days ?? 0} /> días</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary"><Trophy className="h-3 w-3" /> <AnimatedNumber value={unlocked.length} />/<AnimatedNumber value={achievements.length} /></span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <XPBar xp={profile?.xp ?? 0} />
              <div className="mt-1 text-xs text-muted-foreground"><AnimatedNumber value={current} /> / <AnimatedNumber value={needed} /> XP para nivel {level + 1}</div>
            </div>
          </GlassCard>
        </TiltCard>

        <GlassCard className="p-6">
          <h3 className="mb-4 font-display font-bold">Preferencias</h3>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Nombre</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Duración Pomodoro: {pomodoro} min</Label>
              <Slider value={[pomodoro]} onValueChange={(v) => setPomodoro(v[0])} min={10} max={90} step={5} />
            </div>
            <div className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Ritual de transición entre modos</Label>
                <Switch checked={ritualEnabled} onCheckedChange={setRitualEnabled} />
              </div>
              <p className="text-xs text-muted-foreground">Respiración + intención al cambiar de modo (~45s)</p>
              <div className="flex items-center justify-between pt-2">
                <Label className="text-sm">Check-ins de energía</Label>
                <Switch checked={(profile as any)?.energy_checkin_enabled ?? true} onCheckedChange={(v) => update.mutate({ energy_checkin_enabled: v } as any)} />
              </div>
              <p className="text-xs text-muted-foreground">2 veces al día, sin avasallar</p>
            </div>
            <MagneticButton
              onClick={save}
              cursorLabel="Guardar"
              className="ios-tap inline-flex h-10 w-full items-center justify-center rounded-full bg-gradient-emerald text-sm font-semibold text-primary-foreground shadow-glow-emerald hover:opacity-95"
            >
              Guardar
            </MagneticButton>
            <MagneticButton
              onClick={signOut}
              cursorLabel="Salir"
              className="ios-tap inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-border bg-card/60 text-sm font-medium text-foreground hover:bg-card"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </MagneticButton>
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-3">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display font-bold">Tema por modo</h3>
              <p className="text-xs text-muted-foreground">
                Cada contexto recuerda su tema. Trabajo en oscuro, familia en claro… tú decides.
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {MODES.map((m) => {
              const t = themeByMode[m.key] ?? "dark";
              const Icon = m.icon;
              return (
                <div
                  key={m.key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/50 p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 text-foreground/80">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{m.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {t === "dark" ? "Oscuro" : "Claro"}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex rounded-full border border-border/60 bg-background/60 p-0.5">
                    <button
                      type="button"
                      onClick={() => setThemeForMode(m.key, "light")}
                      aria-label={`Tema claro para ${m.label}`}
                      className={cn(
                        "ios-tap inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                        t === "light"
                          ? "bg-gradient-aurora text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Sun className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeForMode(m.key, "dark")}
                      aria-label={`Tema oscuro para ${m.label}`}
                      className={cn(
                        "ios-tap inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                        t === "dark"
                          ? "bg-gradient-aurora text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Moon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>


      <section className="mt-8">
        <ModeUsageBar />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-lg font-bold">Logros</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => {
            const has = unlocked.includes(a.id);
            return (
              <GlassCard key={a.id} className={cn("p-4 border", !has && "opacity-50", has && (RARITY[a.rarity] ?? RARITY.common))}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-xl">{has ? "🏆" : "🔒"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-display font-semibold leading-tight">{a.name}</div>
                      <span className="text-[10px] uppercase tracking-wider opacity-70">{a.rarity}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
                    <div className="mt-1 text-[10px] text-primary">+{a.xp_reward} XP</div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
