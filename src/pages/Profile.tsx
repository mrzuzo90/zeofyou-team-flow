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
import { LogOut, Trophy, Flame } from "lucide-react";
import { toast } from "sonner";
import { xpProgress } from "@/lib/zeofyou";
import { cn } from "@/lib/utils";

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
    <Layout title="Perfil" subtitle="Tu nivel, tus logros y tus preferencias">
      <div className="grid gap-5 lg:grid-cols-3">
        <GlassCard glow="emerald" className="p-6 lg:col-span-2">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-emerald text-3xl font-display font-bold text-primary-foreground shadow-glow-emerald">
              {(profile?.display_name ?? "T")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-2xl font-bold truncate">{profile?.display_name ?? "Usuario"}</div>
              <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">Nivel {level}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning"><Flame className="h-3 w-3" /> {profile?.streak_days ?? 0} días</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary"><Trophy className="h-3 w-3" /> {unlocked.length}/{achievements.length}</span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <XPBar xp={profile?.xp ?? 0} />
            <div className="mt-1 text-xs text-muted-foreground">{current} / {needed} XP para nivel {level + 1}</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="mb-4 font-display font-bold">Preferencias</h3>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Nombre</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Duración Pomodoro: {pomodoro} min</Label>
              <Slider value={[pomodoro]} onValueChange={(v) => setPomodoro(v[0])} min={10} max={90} step={5} />
            </div>
            <Button onClick={save} className="w-full bg-gradient-emerald text-primary-foreground">Guardar</Button>
            <Button variant="outline" onClick={signOut} className="w-full gap-2"><LogOut className="h-4 w-4" /> Cerrar sesión</Button>
          </div>
        </GlassCard>
      </div>

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
