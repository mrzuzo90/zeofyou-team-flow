import { useMemo, useState } from "react";
import Layout from "@/components/Layout/Layout";
import { GlassCard } from "@/components/UI/GlassCard";
import { Button } from "@/components/ui/button";
import { useFocusSessions } from "@/hooks/useFocusSessions";
import { useIdentities } from "@/hooks/useIdentities";
import { useMissions } from "@/hooks/useMissions";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from "recharts";
import { getColor } from "@/lib/zeofyou";
import { IdentityAvatar } from "@/components/UI/IdentityAvatar";
import { Sparkles, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { FocusHeatmap } from "@/components/Insights/FocusHeatmap";
import { AnimatedNumber } from "@/components/Motion/AnimatedNumber";
import { TiltCard } from "@/components/Motion/TiltCard";
import { MagneticButton } from "@/components/Motion/MagneticButton";

export default function Insights() {
  const { data: sessions = [] } = useFocusSessions(200);
  const { data: identities = [] } = useIdentities();
  const { data: missions = [] } = useMissions();
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  const last7 = useMemo(() => {
    const out: { day: string; minutos: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const mins = sessions.filter((s) => new Date(s.completed_at).toDateString() === key).reduce((a, b) => a + b.duration_minutes, 0);
      out.push({ day: d.toLocaleDateString("es-ES", { weekday: "short" }), minutos: mins });
    }
    return out;
  }, [sessions]);

  const radar = identities.map((i) => ({ identity: i.name.replace("El ", ""), valor: i.energy }));

  const balance = identities.map((i) => {
    const mins = sessions.filter((s) => s.identity_id === i.id).reduce((a, b) => a + b.duration_minutes, 0);
    return { name: i.name.replace("El ", ""), minutos: mins, color: getColor(i.color).text };
  });

  const totalFocus = sessions.reduce((a, b) => a + b.duration_minutes, 0);
  const totalMissions = missions.filter((m) => m.status === "completed").length;

  const generateAI = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("weekly-summary", { body: { force: true } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const sugg = Array.isArray(data?.suggestions) ? data.suggestions : [];
      const full = [data?.summary, sugg.length ? "\n\nSugerencias:\n• " + sugg.join("\n• ") : ""].filter(Boolean).join("");
      setAiSummary(full || "Sin datos suficientes todavía.");
    } catch (e: any) {
      toast.error(e?.message?.includes("402") ? "Sin créditos de IA" : "No se pudo generar el resumen IA");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Layout title="Insights" subtitle="Tu semana, tus patrones, tus áreas de mejora" seo={{ title: "Insights semanales | Zeofyou", description: "Patrones de energía, focus y misiones de tu semana en Zeofyou.", path: "/insights" }}>
      <div className="grid gap-4 sm:grid-cols-3">
        <TiltCard intensity={5} className="rounded-3xl">
          <GlassCard className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Focus acumulado</div>
            <div className="mt-1 font-display text-3xl font-bold tabular-nums">
              <AnimatedNumber value={Math.floor(totalFocus / 60)} /><span className="text-base font-normal text-muted-foreground">h </span>
              <AnimatedNumber value={totalFocus % 60} /><span className="text-base font-normal text-muted-foreground">m</span>
            </div>
          </GlassCard>
        </TiltCard>
        <TiltCard intensity={5} className="rounded-3xl">
          <GlassCard className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Sesiones</div>
            <div className="mt-1 font-display text-3xl font-bold tabular-nums"><AnimatedNumber value={sessions.length} /></div>
          </GlassCard>
        </TiltCard>
        <TiltCard intensity={5} className="rounded-3xl">
          <GlassCard className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Misiones completadas</div>
            <div className="mt-1 font-display text-3xl font-bold tabular-nums"><AnimatedNumber value={totalMissions} /></div>
          </GlassCard>
        </TiltCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h3 className="mb-4 font-display font-bold">Focus en los últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Line type="monotone" dataKey="minutos" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="mb-4 font-display font-bold">Energía del equipo</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radar}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="identity" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" fontSize={10} angle={90} domain={[0, 100]} />
              <Radar dataKey="valor" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-2">
          <h3 className="mb-4 font-display font-bold">Tiempo invertido por identidad</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={balance}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Bar dataKey="minutos" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard className="mt-5 p-5">
        <h3 className="mb-4 inline-flex items-center gap-2 font-display font-bold">
          <Calendar className="h-4 w-4 text-primary" /> Mapa de focus (últimas 26 semanas)
        </h3>
        <FocusHeatmap sessions={sessions} />
      </GlassCard>


      <GlassCard className="mt-5 p-5" glow="emerald">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-display font-bold">Resumen IA semanal</h3>
          </div>
          <MagneticButton
            onClick={generateAI}
            disabled={aiLoading}
            cursorLabel="Generar"
            className="ios-tap inline-flex h-9 items-center justify-center rounded-full bg-gradient-emerald px-4 text-sm font-semibold text-primary-foreground shadow-glow-emerald disabled:opacity-60"
          >
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generar"}
          </MagneticButton>
        </div>
        {aiSummary ? (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground">{aiSummary}</p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Pulsa "Generar" para obtener un análisis personalizado de tu semana.</p>
        )}
      </GlassCard>
    </Layout>
  );
}
