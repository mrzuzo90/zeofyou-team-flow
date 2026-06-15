import { xpProgress } from "@/lib/zeofyou";
import { cn } from "@/lib/utils";

export const XPBar = ({ xp, compact = false, className }: { xp: number; compact?: boolean; className?: string }) => {
  const { level, current, needed, pct } = xpProgress(xp);
  return (
    <div className={cn("w-full", className)}>
      {!compact && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-display font-semibold text-foreground">Nivel {level}</span>
          <span className="text-muted-foreground">{current} / {needed} XP</span>
        </div>
      )}
      <div className="relative h-2 overflow-hidden rounded-full bg-muted/40">
        <div
          className="h-full rounded-full bg-gradient-emerald transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
