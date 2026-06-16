import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import { GlassCard } from "@/components/UI/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Star, Lock, Trash2, Check, Play, Pause, Sparkles } from "lucide-react";
import { useMissions, useCreateMission, useUpdateMission, useDeleteMission, Mission } from "@/hooks/useMissions";
import { useCreateMilestone } from "@/hooks/useMilestones";
import { useIdentities } from "@/hooks/useIdentities";
import { useAddXp } from "@/hooks/useProfile";
import { IdentityAvatar } from "@/components/UI/IdentityAvatar";
import { cn } from "@/lib/utils";
import { priorityLabel, missionStatusLabel } from "@/lib/zeofyou";
import { toast } from "sonner";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { ContextBadge } from "@/components/Mode/ContextBadge";
import { MissionProgress } from "@/components/Missions/MissionProgress";
import { getMode, type ModeKey } from "@/lib/modes";
import { celebrate } from "@/lib/confetti";
import { MISSION_TEMPLATES, type MissionTemplate } from "@/data/missionTemplates";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TiltCard } from "@/components/Motion/TiltCard";
import { AnimatedNumber } from "@/components/Motion/AnimatedNumber";
import { MagneticButton } from "@/components/Motion/MagneticButton";

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-warning/15 text-warning",
  low: "bg-muted/40 text-muted-foreground",
};

export default function Missions() {
  const { data: allMissions = [] } = useMissions();
  const { data: identities = [] } = useIdentities();
  const { mode } = useCurrentMode();
  const { user } = useAuth();
  const create = useCreateMission();
  const update = useUpdateMission();
  const del = useDeleteMission();
  const addXp = useAddXp();
  const createMilestone = useCreateMilestone();
  const [open, setOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [params, setParams] = useSearchParams();
  const [form, setForm] = useState({
    title: "",
    description: "",
    is_primary: false,
    priority: "medium",
    assigned_identity_id: "",
    xp_reward: 50,
    context: "" as "" | ModeKey,
    kind: "task" as "task" | "long_term",
    horizon: "month" as "week" | "month" | "quarter" | "year",
    target_hours: "",
    progress_mode: "manual" as "manual" | "time",
  });

  // ?new=1 abre directamente el formulario
  useEffect(() => {
    if (params.get("new") === "1") {
      setOpen(true);
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  // Filtro por modo: si hay modo activo (≠ none) y no se fuerza ver todo, ocultar las que tengan contexto distinto.
  const filterByMode = mode !== "none" && !showAll;
  const missions = filterByMode
    ? allMissions.filter((m) => !m.context || m.context === mode)
    : allMissions;

  const primary = missions.find((m) => m.is_primary && m.status !== "completed" && m.status !== "archived");
  const others = missions.filter((m) => m.id !== primary?.id);
  const locked = !!primary; // bloquea cambios en secundarias mientras hay principal activa
  const hiddenCount = allMissions.length - missions.length;

  const resetForm = () => setForm({ title: "", description: "", is_primary: false, priority: "medium", assigned_identity_id: "", xp_reward: 50, context: "", kind: "task", horizon: "month", target_hours: "", progress_mode: "manual" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetMin = form.kind === "long_term" && form.target_hours ? Math.round(Number(form.target_hours) * 60) : null;
    await create.mutateAsync({
      title: form.title,
      description: form.description,
      is_primary: form.is_primary,
      priority: form.priority as any,
      assigned_identity_id: form.assigned_identity_id || null,
      xp_reward: Number(form.xp_reward),
      context: (form.context || null) as any,
      kind: form.kind,
      horizon: form.kind === "long_term" ? form.horizon : null,
      target_minutes: targetMin,
      progress_mode: form.kind === "long_term" ? form.progress_mode : "manual",
    });
    setOpen(false);
    resetForm();
    toast.success("Misión creada");
  };

  const applyTemplate = async (t: MissionTemplate) => {
    setTemplatesOpen(false);
    // Crear misión long_term y sus hitos
    const { data, error } = await (supabase as any).from("missions").insert({
      user_id: user!.id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      kind: "long_term",
      horizon: t.horizon,
      target_minutes: t.target_hours ? Math.round(t.target_hours * 60) : null,
      progress_mode: t.progress_mode,
      context: t.context ?? null,
      xp_reward: 100,
    }).select("id").single();
    if (error) { toast.error("No se pudo crear la misión"); return; }
    for (const title of t.milestones) {
      await createMilestone.mutateAsync({ missionId: data.id, title });
    }
    toast.success(`Plantilla "${t.name}" aplicada`);
  };

  const complete = async (m: Mission) => {
    await update.mutateAsync({ id: m.id, patch: { status: "completed" } });
    await addXp.mutateAsync(m.xp_reward);
    celebrate();
    toast.success(`+${m.xp_reward} XP`);
  };

  const handleDelete = (m: Mission) => {
    const snapshot = m;
    del.mutate(m.id);
    toast("Misión eliminada", {
      action: {
        label: "Deshacer",
        onClick: async () => {
          await (supabase as any).from("missions").insert({
            ...snapshot,
            id: undefined,
            created_at: undefined,
            updated_at: undefined,
          });
          toast.success("Restaurada");
        },
      },
    });
  };

  const toggleStatus = (m: Mission) => {
    const next = m.status === "in_progress" ? "pending" : "in_progress";
    update.mutate({ id: m.id, patch: { status: next } });
  };

  const renderCard = (m: Mission, opts?: { secondary?: boolean }) => {
    const ident = identities.find((i) => i.id === m.assigned_identity_id);
    const isLocked = opts?.secondary && locked && m.status !== "in_progress";
    return (
      <GlassCard key={m.id} className={cn("p-5 relative", isLocked && "opacity-50")}>
        {isLocked && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-warning/15 px-2 py-1 text-[10px] font-semibold text-warning">
            <Lock className="h-3 w-3" /> Bloqueada
          </div>
        )}
        <div className="flex items-start gap-3">
          {ident && <IdentityAvatar name={ident.name} color={ident.color} size="sm" />}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", PRIORITY_COLOR[m.priority])}>{priorityLabel[m.priority]}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{missionStatusLabel[m.status]}</span>
              <span className="text-[10px] text-primary">+<AnimatedNumber value={m.xp_reward} /> XP</span>
              <ContextBadge value={m.context} size="xs" onChange={(c) => update.mutate({ id: m.id, patch: { context: c as any } })} />
            </div>
            <h3 className="font-display font-semibold leading-tight">{m.title}</h3>
            {m.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{m.description}</p>}
            {m.kind === "long_term" && (
              <div className="mt-3">
                <MissionProgress mission={m} />
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex gap-1">
            {m.status !== "completed" && (
              <>
                <Button size="sm" variant="ghost" disabled={isLocked} onClick={() => toggleStatus(m)} className="h-8 gap-1.5 text-xs">
                  {m.status === "in_progress" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  {m.status === "in_progress" ? "Pausar" : "Empezar"}
                </Button>
                <Button size="sm" variant="ghost" disabled={isLocked} onClick={() => complete(m)} className="h-8 gap-1.5 text-xs text-success">
                  <Check className="h-3 w-3" /> Completar
                </Button>
              </>
            )}
            {!m.is_primary && m.status !== "completed" && (
              <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: m.id, patch: { is_primary: true } })} className="h-8 gap-1.5 text-xs">
                <Star className="h-3 w-3" /> Marcar principal
              </Button>
            )}
          </div>
          <Button size="icon" aria-label={`Eliminar misión ${m.title}`} variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(m)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </GlassCard>
    );
  };

  return (
    <Layout title="Misiones" subtitle="Una principal, las demás esperan su turno" seo={{ title: "Misiones y proyectos | Zeofyou", description: "Tu misión principal y el resto de proyectos en curso. Largo plazo con progreso 0-100.", path: "/proyectos" }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {filterByMode ? (
            <>
              <span>Mostrando misiones de modo <span className="font-semibold text-foreground">{getMode(mode).label}</span></span>
              {hiddenCount > 0 && (
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAll(true)}>
                  Ver todas ({hiddenCount} ocultas)
                </Button>
              )}
            </>
          ) : (
            <>
              <span>Mostrando todas las misiones</span>
              {mode !== "none" && (
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAll(false)}>
                  Filtrar por modo actual
                </Button>
              )}
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2"><Sparkles className="h-4 w-4" /> Plantillas</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Plantillas de misión</DialogTitle></DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                {MISSION_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className="group flex items-start gap-3 rounded-xl border border-border/60 p-4 text-left transition-colors hover:border-primary/60 hover:bg-primary/5"
                  >
                    <div className="text-2xl">{t.emoji}</div>
                    <div className="flex-1">
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.description}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t.horizon} · {t.target_hours ? `${t.target_hours}h` : "manual"} · {t.milestones.length} hitos
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2 bg-gradient-emerald text-primary-foreground"><Plus className="h-4 w-4" /> Nueva misión</Button></DialogTrigger>
            <DialogContent>
            <DialogHeader><DialogTitle>Crear misión</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5"><Label>Título</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Descripción</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Prioridad</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>XP</Label><Input type="number" min={10} max={500} value={form.xp_reward} onChange={(e) => setForm({ ...form, xp_reward: Number(e.target.value) })} /></div>
              </div>
              <div className="space-y-1.5">
                <Label>Asignar a</Label>
                <Select value={form.assigned_identity_id} onValueChange={(v) => setForm({ ...form, assigned_identity_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Ninguna" /></SelectTrigger>
                  <SelectContent>
                    {identities.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Contexto / modo</Label>
                <Select value={form.context || "none"} onValueChange={(v) => setForm({ ...form, context: (v === "none" ? "" : v) as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Cualquier modo</SelectItem>
                    <SelectItem value="work">Trabajo</SelectItem>
                    <SelectItem value="home">Casa</SelectItem>
                    <SelectItem value="family">Familia</SelectItem>
                    <SelectItem value="travel">Viaje</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_primary} onChange={(e) => setForm({ ...form, is_primary: e.target.checked })} className="h-4 w-4 rounded accent-primary" />
                Marcar como misión principal
              </label>
              <label className="flex items-center gap-2 text-sm border-t border-border/50 pt-3">
                <input type="checkbox" checked={form.kind === "long_term"} onChange={(e) => setForm({ ...form, kind: e.target.checked ? "long_term" : "task" })} className="h-4 w-4 rounded accent-primary" />
                Misión de largo plazo (con progreso)
              </label>
              {form.kind === "long_term" && (
                <div className="space-y-3 rounded-lg bg-muted/30 p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Horizonte</Label>
                      <Select value={form.horizon} onValueChange={(v) => setForm({ ...form, horizon: v as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Semana</SelectItem>
                          <SelectItem value="month">Mes</SelectItem>
                          <SelectItem value="quarter">Trimestre</SelectItem>
                          <SelectItem value="year">Año</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Horas objetivo (opcional)</Label>
                      <Input type="number" min={0} step={0.5} placeholder="Ej. 40" value={form.target_hours} onChange={(e) => setForm({ ...form, target_hours: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Modo de progreso</Label>
                    <Select value={form.progress_mode} onValueChange={(v) => setForm({ ...form, progress_mode: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual (yo muevo la barra)</SelectItem>
                        <SelectItem value="time" disabled={!form.target_hours}>Automático por tiempo dedicado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full bg-gradient-emerald text-primary-foreground">Crear misión</Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>


      {primary && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-warning" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Misión principal</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2"><TiltCard intensity={4} className="relative rounded-3xl"><div className="absolute -inset-px rounded-3xl bg-gradient-aurora opacity-50 blur-md" />{renderCard(primary)}</TiltCard></div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Otras misiones {locked && "(bloqueadas)"}</h2>
        </div>
        {others.length === 0 ? (
          <GlassCard className="p-8 text-center text-sm text-muted-foreground">No tienes otras misiones todavía.</GlassCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((m) => renderCard(m, { secondary: true }))}
          </div>
        )}
      </section>
    </Layout>
  );
}
