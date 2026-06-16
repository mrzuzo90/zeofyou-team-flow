import { Check, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { MODES, getMode } from "@/lib/modes";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { cn } from "@/lib/utils";

const COLOR_BG: Record<string, string> = {
  emerald: "bg-primary/15 text-primary",
  amber: "bg-warning/15 text-warning",
  violet: "bg-accent/15 text-accent",
  sky: "bg-secondary/15 text-secondary",
  muted: "bg-muted/40 text-muted-foreground",
};

export function ModeSwitcher({ compact = false }: { compact?: boolean }) {
  const { mode, autoSuggest, setMode, setAutoSuggest } = useCurrentMode();
  const nav = useNavigate();
  const current = getMode(mode);
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-90",
            COLOR_BG[current.color] ?? COLOR_BG.muted,
          )}
          aria-label={`Modo actual: ${current.label}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {!compact && <span>{current.short}</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Cambia tu modo
        </DropdownMenuLabel>
        {MODES.map((m) => {
          const MIcon = m.icon;
          const active = m.key === mode;
          return (
            <DropdownMenuItem
              key={m.key}
              onClick={() => setMode(m.key)}
              className="flex items-start gap-3 py-2.5"
            >
              <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", COLOR_BG[m.color] ?? COLOR_BG.muted)}>
                <MIcon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{m.label}</span>
                  {active && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">{m.description}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => nav("/manos-libres")} className="flex items-center gap-2 text-sm">
          <Car className="h-3.5 w-3.5" /> Modo manos libres
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between gap-3 px-2 py-2">
          <div className="min-w-0">
            <div className="text-xs font-semibold">Sugerencias por hora</div>
            <div className="text-[11px] text-muted-foreground">Avisa cuando convenga cambiar</div>
          </div>
          <Switch checked={autoSuggest} onCheckedChange={setAutoSuggest} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
