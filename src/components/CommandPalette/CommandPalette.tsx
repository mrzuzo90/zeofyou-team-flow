import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  Users,
  Target,
  Timer,
  Calendar,
  BarChart3,
  User as UserIcon,
  Plus,
  Sparkles,
  Briefcase,
  Plane,
  Brain,
} from "lucide-react";
import { useMissions } from "@/hooks/useMissions";
import { useIdentities } from "@/hooks/useIdentities";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { MODES, type ModeKey } from "@/lib/modes";

export function CommandPalette({
  open,
  onOpenChange,
  onOpenCoach,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onOpenCoach?: () => void;
}) {
  const nav = useNavigate();
  const { data: missions = [] } = useMissions();
  const { data: identities = [] } = useIdentities();
  const { setMode } = useCurrentMode();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = (path: string) => {
    onOpenChange(false);
    nav(path);
  };

  const visibleMissions = useMemo(() => missions.slice(0, 8), [missions]);
  const visibleIdentities = useMemo(() => identities.slice(0, 8), [identities]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Buscar o ir a… (⌘K)"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>

        <CommandGroup heading="Acciones rápidas">
          <CommandItem onSelect={() => go("/proyectos?new=1")}>
            <Plus className="mr-2 h-4 w-4" /> Nueva misión
            <span className="ml-auto text-[10px] text-muted-foreground">N</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/enfoque")}>
            <Timer className="mr-2 h-4 w-4" /> Iniciar focus
            <span className="ml-auto text-[10px] text-muted-foreground">F</span>
          </CommandItem>
          {onOpenCoach && (
            <CommandItem
              onSelect={() => {
                onOpenChange(false);
                onOpenCoach();
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" /> Hablar con el coach
              <span className="ml-auto text-[10px] text-muted-foreground">C</span>
            </CommandItem>
          )}
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              window.dispatchEvent(new CustomEvent("zeofyou:brain-dump"));
            }}
          >
            <Brain className="mr-2 h-4 w-4" /> Brain dump
            <span className="ml-auto text-[10px] text-muted-foreground">B</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Cambiar de modo">
          {MODES.filter((m) => m.key !== "none").map((m) => (
            <CommandItem
              key={m.key}
              onSelect={() => {
                onOpenChange(false);
                setMode(m.key as ModeKey);
              }}
            >
              <m.icon className="mr-2 h-4 w-4" /> Modo {m.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Ir a">
          <CommandItem onSelect={() => go("/")}><Home className="mr-2 h-4 w-4" /> Panel</CommandItem>
          <CommandItem onSelect={() => go("/identidades")}><Users className="mr-2 h-4 w-4" /> Equipo</CommandItem>
          <CommandItem onSelect={() => go("/proyectos")}><Target className="mr-2 h-4 w-4" /> Misiones</CommandItem>
          <CommandItem onSelect={() => go("/enfoque")}><Timer className="mr-2 h-4 w-4" /> Focus</CommandItem>
          <CommandItem onSelect={() => go("/planificacion")}><Calendar className="mr-2 h-4 w-4" /> Agenda</CommandItem>
          <CommandItem onSelect={() => go("/insights")}><BarChart3 className="mr-2 h-4 w-4" /> Insights</CommandItem>
          <CommandItem onSelect={() => go("/perfil")}><UserIcon className="mr-2 h-4 w-4" /> Perfil</CommandItem>
        </CommandGroup>

        {visibleMissions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Misiones">
              {visibleMissions.map((m) => (
                <CommandItem key={m.id} value={`mis ${m.title}`} onSelect={() => go("/proyectos")}>
                  <Target className="mr-2 h-4 w-4" /> {m.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {visibleIdentities.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Identidades">
              {visibleIdentities.map((i) => (
                <CommandItem key={i.id} value={`id ${i.name}`} onSelect={() => go("/identidades")}>
                  <Briefcase className="mr-2 h-4 w-4" /> {i.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
