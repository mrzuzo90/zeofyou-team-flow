import { useState } from "react";
import Layout from "@/components/Layout/Layout";
import { GlassCard } from "@/components/UI/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Star, Lock, Trash2, Check, Play, Pause } from "lucide-react";
import { useMissions, useCreateMission, useUpdateMission, useDeleteMission, Mission } from "@/hooks/useMissions";
import { useIdentities } from "@/hooks/useIdentities";
import { useAddXp } from "@/hooks/useProfile";
import { IdentityAvatar } from "@/components/UI/IdentityAvatar";
import { cn } from "@/lib/utils";
import { priorityLabel, missionStatusLabel } from "@/lib/zeofyou";
import { toast } from "sonner";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { ContextBadge } from "@/components/Mode/ContextBadge";
import { getMode, type ModeKey } from "@/lib/modes";

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-warning/15 text-warning",
  low: "bg-muted/40 text-muted-foreground",
};

export default function Missions() {
  const { data: missions = [] } = useMissions();
  const { data: identities = [] } = useIdentities();
  const create = useCreateMission();
  const update = useUpdateMission();
  const del = useDeleteMission();
  const addXp = useAddXp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", is_primary: false, priority: "medium", assigned_identity_id: "", xp_reward: 50 });

  const primary = missions.find((m) => m.is_primary && m.status !== "completed" && m.status !== "archived");
  const others = missions.filter((m) => m.id !== primary?.id);
  const locked = !!primary; // bloquea cambios en secundarias mientras hay principal activa

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      title: form.title,
      description: form.description,
      is_primary: form.is_primary,
      priority: form.priority as any,
      assigned_identity_id: form.assigned_identity_id || null,
      xp_reward: Number(form.xp_reward),
    });
    setOpen(false);
    setForm({ title: "", description: "", is_primary: false, priority: "medium", assigned_identity_id: "", xp_reward: 50 });
    toast.success("Misión creada");
  };

  const complete = async (m: Mission) => {
    await update.mutateAsync({ id: m.id, patch: { status: "completed" } });
    await addXp.mutateAsync(m.xp_reward);
    toast.success(`+${m.xp_reward} XP`);
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
              <span className="text-[10px] text-primary">+{m.xp_reward} XP</span>
            </div>
            <h3 className="font-display font-semibold leading-tight">{m.title}</h3>
            {m.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{m.description}</p>}
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
          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => del.mutate(m.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </GlassCard>
    );
  };

  return (
    <Layout title="Misiones" subtitle="Una principal, las demás esperan su turno">
      <div className="mb-6 flex justify-end">
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
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_primary} onChange={(e) => setForm({ ...form, is_primary: e.target.checked })} className="h-4 w-4 rounded accent-primary" />
                Marcar como misión principal
              </label>
              <Button type="submit" className="w-full bg-gradient-emerald text-primary-foreground">Crear misión</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {primary && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-warning" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Misión principal</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2"><div className="relative"><div className="absolute -inset-px rounded-2xl bg-gradient-emerald opacity-40 blur-md" />{renderCard(primary)}</div></div>
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
