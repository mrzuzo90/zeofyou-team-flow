// Helpers de XP / niveles
export const xpForLevel = (level: number) => 100 * level * level;
export const levelFromXp = (xp: number) => Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);
export const xpProgress = (xp: number) => {
  const level = levelFromXp(xp);
  const current = xpForLevel(level - 1);
  const next = xpForLevel(level);
  return {
    level,
    current: xp - current,
    needed: next - current,
    pct: Math.min(100, Math.round(((xp - current) / (next - current)) * 100)),
  };
};

export const colorMap: Record<string, { ring: string; bg: string; text: string; from: string; to: string }> = {
  emerald: { ring: "ring-primary/40", bg: "bg-primary/15", text: "text-primary", from: "from-primary", to: "to-accent" },
  violet: { ring: "ring-violet-400/40", bg: "bg-violet-500/15", text: "text-violet-300", from: "from-violet-500", to: "to-fuchsia-500" },
  sky: { ring: "ring-sky-400/40", bg: "bg-sky-500/15", text: "text-sky-300", from: "from-sky-500", to: "to-cyan-400" },
  amber: { ring: "ring-amber-400/40", bg: "bg-amber-500/15", text: "text-amber-300", from: "from-amber-500", to: "to-orange-500" },
  rose: { ring: "ring-rose-400/40", bg: "bg-rose-500/15", text: "text-rose-300", from: "from-rose-500", to: "to-pink-500" },
};

export const getColor = (c?: string | null) => colorMap[c ?? "emerald"] ?? colorMap.emerald;

export const statusLabel: Record<string, string> = {
  active: "Activo",
  resting: "Descansando",
  paused: "En pausa",
};

export const priorityLabel: Record<string, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

export const missionStatusLabel: Record<string, string> = {
  pending: "Por hacer",
  in_progress: "En progreso",
  completed: "Completada",
  archived: "Archivada",
};
