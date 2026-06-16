import { cn } from "@/lib/utils";
import { getColor } from "@/lib/zeofyou";
import {
  personaCSSVars,
  personaFontStyle,
  resolvePersona,
  type IdentityLike,
  type PersonaPreset,
} from "@/lib/personas";

const INITIALS = (name: string) =>
  name
    .replace(/^El\s+|^La\s+/, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

interface Props {
  name: string;
  color?: string | null;
  identity?: IdentityLike | null;
  persona?: PersonaPreset;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "active" | "resting" | "paused";
  className?: string;
}

const sizes = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-24 w-24 text-xl",
};

// Radio según cardStyle
const radiusFor = (style: string) => {
  switch (style) {
    case "mono":
    case "brutalist":
      return "rounded-md";
    case "organic":
    case "aurora":
      return "rounded-[40%]";
    default:
      return "rounded-2xl";
  }
};

export const IdentityAvatar = ({
  name,
  color,
  identity,
  persona,
  size = "md",
  status,
  className,
}: Props) => {
  // Si hay persona/identity → usar preset; si no, fallback al colorMap legacy.
  const usePersona = !!(persona || identity);
  const preset = usePersona ? (persona ?? resolvePersona(identity ?? null)) : null;
  const tone = !usePersona ? getColor(color ?? undefined) : null;

  return (
    <div className={cn("relative", className)} style={preset ? personaCSSVars(preset) : undefined}>
      <div
        className={cn(
          "flex items-center justify-center font-bold text-primary-foreground shadow-lg",
          sizes[size],
          preset ? radiusFor(preset.cardStyle) : cn("rounded-2xl bg-gradient-to-br font-display", tone!.from, tone!.to),
        )}
        style={
          preset
            ? {
                background: `linear-gradient(135deg, hsl(${preset.gradientFrom}), hsl(${preset.gradientTo}))`,
                boxShadow: `0 10px 24px -10px hsl(${preset.accent} / 0.6)`,
                ...personaFontStyle(preset),
              }
            : undefined
        }
      >
        {INITIALS(name)}
      </div>
      {status && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
            status === "active" && "bg-success animate-pulse-glow",
            status === "resting" && "bg-muted-foreground",
            status === "paused" && "bg-warning",
          )}
        />
      )}
    </div>
  );
};
