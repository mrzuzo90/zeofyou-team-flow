import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MODES, getMode, type ModeKey } from "@/lib/modes";
import { cn } from "@/lib/utils";

const COLOR_BG: Record<string, string> = {
  emerald: "bg-primary/15 text-primary",
  amber: "bg-warning/15 text-warning",
  violet: "bg-accent/15 text-accent",
  sky: "bg-secondary/15 text-secondary",
  muted: "bg-muted/40 text-muted-foreground",
};

const CONTEXT_OPTIONS: ModeKey[] = ["work", "home", "family", "travel"];

export function ContextBadge({
  value,
  onChange,
  size = "sm",
}: {
  value: string | null | undefined;
  onChange?: (next: ModeKey | null) => void;
  size?: "sm" | "xs";
}) {
  const def = value ? getMode(value) : null;
  const Icon = def?.icon;
  const cls = def ? COLOR_BG[def.color] ?? COLOR_BG.muted : "bg-muted/30 text-muted-foreground";
  const padding = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]";

  const trigger = (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold transition-colors hover:opacity-90",
        padding,
        cls,
      )}
    >
      {Icon ? <Icon className="h-3 w-3" /> : null}
      <span>{def ? def.short : "Cualquier modo"}</span>
    </button>
  );

  if (!onChange) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={() => onChange(null)} className="flex items-center justify-between text-sm">
          Cualquier modo
          {!value && <Check className="h-3.5 w-3.5" />}
        </DropdownMenuItem>
        {CONTEXT_OPTIONS.map((k) => {
          const m = getMode(k);
          const MIcon = m.icon;
          const active = value === k;
          return (
            <DropdownMenuItem key={k} onClick={() => onChange(k)} className="flex items-center gap-2 text-sm">
              <MIcon className="h-3.5 w-3.5" />
              <span className="flex-1">{m.label}</span>
              {active && <Check className="h-3.5 w-3.5" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
