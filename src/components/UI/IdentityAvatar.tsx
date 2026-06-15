import { cn } from "@/lib/utils";
import { getColor } from "@/lib/zeofyou";

const INITIALS = (name: string) =>
  name
    .replace(/^El\s+|^La\s+/, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const IdentityAvatar = ({
  name,
  color,
  size = "md",
  status,
  className,
}: {
  name: string;
  color?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "active" | "resting" | "paused";
  className?: string;
}) => {
  const tone = getColor(color ?? undefined);
  const sizes = { sm: "h-9 w-9 text-xs", md: "h-12 w-12 text-sm", lg: "h-16 w-16 text-base", xl: "h-24 w-24 text-xl" };
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-gradient-to-br font-display font-bold text-primary-foreground shadow-lg",
          tone.from,
          tone.to,
          sizes[size],
        )}
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
