import { useState } from "react";
import Layout from "@/components/Layout/Layout";
import { IdentityAvatar } from "@/components/UI/IdentityAvatar";
import { EnergyRing } from "@/components/UI/EnergyRing";
import {
  useIdentities,
  useUpdateIdentityStatus,
  useCreateIdentity,
  useDeleteIdentity,
  useUpdateIdentity,
  type Identity,
} from "@/hooks/useIdentities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Play, Pause, Moon, Trash2, Palette } from "lucide-react";
import { statusLabel } from "@/lib/zeofyou";
import { toast } from "sonner";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { ContextBadge } from "@/components/Mode/ContextBadge";
import { getMode } from "@/lib/modes";
import { TiltCard } from "@/components/Motion/TiltCard";
import { AnimatedNumber } from "@/components/Motion/AnimatedNumber";
import { PersonaSurface } from "@/components/Identity/PersonaSurface";
import {
  PERSONA_LIST,
  PERSONAS,
  personaCSSVars,
  personaFontClass,
  personaFontStyle,
  resolvePersona,
  type PersonaKey,
  type PersonaPreset,
} from "@/lib/personas";
import { cn } from "@/lib/utils";

const emptyForm = {
  name: "",
  role: "",
  description: "",
  specialty: "",
  persona: "strategist" as PersonaKey,
};

function PersonaPickerCard({
  preset,
  active,
  onClick,
}: {
  preset: PersonaPreset;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={personaCSSVars(preset)}
      className={cn(
        "persona-card text-left p-3 transition-all",
        `persona-card--${preset.cardStyle}`,
        active ? "scale-[1.02]" : "opacity-90 hover:opacity-100",
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className="h-9 w-9 rounded-lg shadow-sm"
          style={{
            background: `linear-gradient(135deg, hsl(${preset.gradientFrom}), hsl(${preset.gradientTo}))`,
          }}
        />
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-tight" style={personaFontStyle(preset)}>
            {preset.label}
          </div>
          <div className="text-[10px] text-muted-foreground">{preset.tagline}</div>
        </div>
      </div>
    </button>
  );
}

export default function Identities() {
  const { data: allIdentities = [] } = useIdentities();
  const { mode } = useCurrentMode();
  const updateStatus = useUpdateIdentityStatus();
  const updateIdent = useUpdateIdentity();
  const createId = useCreateIdentity();
  const del = useDeleteIdentity();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPersona, setEditPersona] = useState<PersonaKey>("strategist");

  const filterByMode = mode !== "none" && !showAll;
  const identities = filterByMode
    ? allIdentities.filter((i) => !i.context || i.context === mode)
    : allIdentities;
  const hiddenCount = allIdentities.length - identities.length;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const preset = PERSONAS[form.persona];
    await createId.mutateAsync({
      name: form.name,
      role: form.role,
      description: form.description,
      specialty: form.specialty,
      persona: form.persona,
      // Mantenemos color por compat; el preset manda visualmente.
      color: preset.key,
      preferences: {},
    } as any);
    setOpen(false);
    setForm(emptyForm);
    toast.success("Identidad incorporada al equipo");
  };

  const startEdit = (id: Identity) => {
    setEditingId(id.id);
    setEditPersona((id.persona as PersonaKey) || (resolvePersona(id).key as PersonaKey));
  };

  const applyEdit = async () => {
    if (!editingId) return;
    await updateIdent.mutateAsync({
      id: editingId,
      patch: { persona: editPersona } as any,
    });
    setEditingId(null);
    toast.success("Look actualizado");
  };

  return (
    <Layout
      title="Tu equipo interno"
      subtitle="Cada identidad con su propio carácter visual"
      seo={{
        title: "Identidades internas | Zeofyou",
        description: "Gestiona tus identidades internas: cada una con su propio look — color, tipografía y estilo.",
        path: "/identidades",
      }}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full bg-success/10 px-2.5 py-1 text-success">
            ● {identities.filter((i) => i.status === "active").length} activos
          </span>
          <span className="rounded-full bg-muted/40 px-2.5 py-1 text-muted-foreground">
            ● {identities.filter((i) => i.status === "resting").length} descansando
          </span>
          {filterByMode && hiddenCount > 0 && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAll(true)}>
              Modo {getMode(mode).label} · ver todas ({hiddenCount} ocultas)
            </Button>
          )}
          {!filterByMode && mode !== "none" && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAll(false)}>
              Filtrar por modo {getMode(mode).label}
            </Button>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-emerald text-primary-foreground">
              <Plus className="h-4 w-4" /> Nueva identidad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Incorpora una identidad al equipo</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-5">
              <div>
                <Label className="mb-2 block">Arquetipo visual</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PERSONA_LIST.map((p) => (
                    <PersonaPickerCard
                      key={p.key}
                      preset={p}
                      active={form.persona === p.key}
                      onClick={() => setForm({ ...form, persona: p.key })}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Nombre</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="El Negociador"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Rol</Label>
                  <Input
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="Mediador de conflictos"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Especialidad</Label>
                <Input
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  placeholder="Comunicación"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-emerald text-primary-foreground">
                Incorporar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {identities.map((id) => {
          const preset = resolvePersona(id);
          return (
            <TiltCard key={id.id} intensity={5} className="rounded-3xl">
              <PersonaSurface identity={id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <IdentityAvatar identity={id} name={id.name} status={id.status} size="lg" />
                    <div>
                      <div className="text-lg font-bold leading-tight" style={personaFontStyle(preset)}>
                        {id.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{id.role}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="persona-chip">{preset.label}</span>
                        {id.specialty && (
                          <span className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {id.specialty}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <EnergyRing value={id.energy} size={44} color={id.color}>
                    <span className="text-[10px] font-bold tabular-nums">
                      <AnimatedNumber value={id.energy} />
                    </span>
                  </EnergyRing>
                </div>

                {id.description && (
                  <p className="mt-4 text-sm text-muted-foreground line-clamp-3">{id.description}</p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {statusLabel[id.status]}
                  </span>
                  <ContextBadge
                    value={id.context}
                    onChange={(c) => updateIdent.mutate({ id: id.id, patch: { context: c as any } })}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => startEdit(id)}
                  >
                    <Palette className="h-3.5 w-3.5" /> Personalizar look
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      aria-label={`Activar identidad ${id.name}`}
                      variant={id.status === "active" ? "default" : "ghost"}
                      className="h-8 w-8"
                      onClick={() => updateStatus.mutate({ id: id.id, status: "active" })}
                      title="Activar"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      aria-label={`Poner a descansar ${id.name}`}
                      variant={id.status === "resting" ? "default" : "ghost"}
                      className="h-8 w-8"
                      onClick={() => updateStatus.mutate({ id: id.id, status: "resting" })}
                      title="Descansar"
                    >
                      <Moon className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      aria-label={`Pausar identidad ${id.name}`}
                      variant={id.status === "paused" ? "default" : "ghost"}
                      className="h-8 w-8"
                      onClick={() => updateStatus.mutate({ id: id.id, status: "paused" })}
                      title="Pausar"
                    >
                      <Pause className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      aria-label={`Eliminar identidad ${id.name}`}
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => del.mutate(id.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </PersonaSurface>
            </TiltCard>
          );
        })}
      </div>

      {/* Diálogo personalizar look */}
      <Dialog open={!!editingId} onOpenChange={(o) => !o && setEditingId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Personalizar look</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Arquetipo visual</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PERSONA_LIST.map((p) => (
                <PersonaPickerCard
                  key={p.key}
                  preset={p}
                  active={editPersona === p.key}
                  onClick={() => setEditPersona(p.key)}
                />
              ))}
            </div>
            <Button onClick={applyEdit} className="w-full bg-gradient-emerald text-primary-foreground">
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
