import { useState } from "react";
import Layout from "@/components/Layout/Layout";
import { GlassCard } from "@/components/UI/GlassCard";
import { IdentityAvatar } from "@/components/UI/IdentityAvatar";
import { EnergyRing } from "@/components/UI/EnergyRing";
import { useIdentities, useUpdateIdentityStatus, useCreateIdentity, useDeleteIdentity } from "@/hooks/useIdentities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Play, Pause, Moon, Trash2 } from "lucide-react";
import { statusLabel } from "@/lib/zeofyou";
import { toast } from "sonner";

export default function Identities() {
  const { data: identities = [] } = useIdentities();
  const updateStatus = useUpdateIdentityStatus();
  const createId = useCreateIdentity();
  const del = useDeleteIdentity();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", description: "", specialty: "", color: "emerald" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createId.mutateAsync(form);
    setOpen(false);
    setForm({ name: "", role: "", description: "", specialty: "", color: "emerald" });
    toast.success("Identidad incorporada al equipo");
  };

  return (
    <Layout title="Tu equipo interno" subtitle="Activa, pausa o crea nuevas identidades">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-3 text-xs">
          <span className="rounded-full bg-success/10 px-2.5 py-1 text-success">● {identities.filter(i => i.status === "active").length} activos</span>
          <span className="rounded-full bg-muted/40 px-2.5 py-1 text-muted-foreground">● {identities.filter(i => i.status === "resting").length} descansando</span>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-emerald text-primary-foreground"><Plus className="h-4 w-4" /> Nueva identidad</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Incorpora una identidad al equipo</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5"><Label>Nombre</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="El Negociador" /></div>
              <div className="space-y-1.5"><Label>Rol</Label><Input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Mediador de conflictos" /></div>
              <div className="space-y-1.5"><Label>Especialidad</Label><Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Comunicación" /></div>
              <div className="space-y-1.5"><Label>Descripción</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <Select value={form.color} onValueChange={(v) => setForm({ ...form, color: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emerald">Esmeralda</SelectItem>
                    <SelectItem value="violet">Violeta</SelectItem>
                    <SelectItem value="sky">Azul</SelectItem>
                    <SelectItem value="amber">Ámbar</SelectItem>
                    <SelectItem value="rose">Rosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-gradient-emerald text-primary-foreground">Incorporar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {identities.map((id) => (
          <GlassCard key={id.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <IdentityAvatar name={id.name} color={id.color} status={id.status} size="lg" />
                <div>
                  <div className="font-display text-lg font-bold leading-tight">{id.name}</div>
                  <div className="text-xs text-muted-foreground">{id.role}</div>
                  {id.specialty && <div className="mt-1 inline-block rounded-full bg-muted/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{id.specialty}</div>}
                </div>
              </div>
              <EnergyRing value={id.energy} size={44} color={id.color}>
                <span className="text-[10px] font-bold">{id.energy}</span>
              </EnergyRing>
            </div>

            {id.description && <p className="mt-4 text-sm text-muted-foreground line-clamp-3">{id.description}</p>}

            <div className="mt-5 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{statusLabel[id.status]}</span>
              <div className="flex gap-1">
                <Button size="icon" variant={id.status === "active" ? "default" : "ghost"} className="h-8 w-8" onClick={() => updateStatus.mutate({ id: id.id, status: "active" })} title="Activar">
                  <Play className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant={id.status === "resting" ? "default" : "ghost"} className="h-8 w-8" onClick={() => updateStatus.mutate({ id: id.id, status: "resting" })} title="Descansar">
                  <Moon className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant={id.status === "paused" ? "default" : "ghost"} className="h-8 w-8" onClick={() => updateStatus.mutate({ id: id.id, status: "paused" })} title="Pausar">
                  <Pause className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => del.mutate(id.id)} title="Eliminar">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </Layout>
  );
}
