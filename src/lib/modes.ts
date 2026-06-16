import { Briefcase, Home, Users, Plane, Circle, type LucideIcon } from "lucide-react";

export type ModeKey = "work" | "home" | "family" | "travel" | "none";

export type ModeDef = {
  key: ModeKey;
  label: string;
  short: string;
  description: string;
  icon: LucideIcon;
  color: string; // tailwind token alias
};

export const MODES: ModeDef[] = [
  { key: "work", label: "Trabajo", short: "Trabajo", description: "Foco profesional, misiones laborales", icon: Briefcase, color: "emerald" },
  { key: "home", label: "Casa", short: "Casa", description: "Desconecta del trabajo, descansa", icon: Home, color: "amber" },
  { key: "family", label: "Familia", short: "Familia", description: "Tiempo de calidad, sin trabajo", icon: Users, color: "violet" },
  { key: "travel", label: "Viaje", short: "Viaje", description: "Lo esencial mientras te mueves", icon: Plane, color: "sky" },
  { key: "none", label: "Sin modo", short: "Todo", description: "Ver todo sin filtros", icon: Circle, color: "muted" },
];

export const getMode = (k: string | null | undefined): ModeDef =>
  MODES.find((m) => m.key === k) ?? MODES[0];

/** Sugerencia por horario (hora local del cliente). Devuelve null si no hay franja clara. */
export function suggestMode(now: Date = new Date()): ModeKey | null {
  const day = now.getDay(); // 0 dom .. 6 sáb
  const h = now.getHours();
  const isWeekend = day === 0 || day === 6;
  const isFriEvening = day === 5 && h >= 20 && h < 23;
  const isWeekendFamily = isWeekend && h >= 10 && h < 14;

  if (isFriEvening || isWeekendFamily) return "family";
  if (!isWeekend && h >= 9 && h < 18) return "work";
  if (!isWeekend && h >= 18 && h < 22) return "home";
  if (isWeekend && h >= 10 && h < 20) return "home";
  return null;
}

/** Heurística: inferir contexto a partir de la categoría de una misión. */
export function inferContextFromCategory(category?: string | null): ModeKey | null {
  if (!category) return null;
  const c = category.toLowerCase();
  if (/trabajo|work|profesional|carrera|negocio|cliente/.test(c)) return "work";
  if (/familia|pareja|hijos|hijas|amig/.test(c)) return "family";
  if (/casa|hogar|descanso|ocio|sue|bienestar|salud|hábito|habito/.test(c)) return "home";
  if (/viaje|nómada|nomada|movil/.test(c)) return "travel";
  return null;
}
