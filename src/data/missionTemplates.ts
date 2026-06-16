import type { ModeKey } from "@/lib/modes";

export type MissionTemplate = {
  id: string;
  emoji: string;
  name: string;
  title: string;
  description: string;
  horizon: "week" | "month" | "quarter" | "year";
  target_hours: number;
  progress_mode: "manual" | "time";
  context?: ModeKey;
  priority: "low" | "medium" | "high";
  milestones: string[];
};

export const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: "language",
    emoji: "🗣️",
    name: "Aprender un idioma",
    title: "Aprender un idioma nuevo",
    description: "Dedicar tiempo constante a un idioma a lo largo del trimestre.",
    horizon: "quarter",
    target_hours: 60,
    progress_mode: "time",
    priority: "medium",
    milestones: [
      "Elegir método y nivel de partida",
      "Hacer 20 sesiones de práctica",
      "Mantener una conversación de 15 minutos",
      "Leer un texto corto sin traducir",
    ],
  },
  {
    id: "book",
    emoji: "📖",
    name: "Leer un libro",
    title: "Terminar un libro",
    description: "Sumar capítulos hasta acabar el libro.",
    horizon: "month",
    target_hours: 12,
    progress_mode: "manual",
    context: "home",
    priority: "low",
    milestones: ["Primer tercio", "Mitad", "Dos tercios", "Final + reseña"],
  },
  {
    id: "habit",
    emoji: "🌱",
    name: "Crear un hábito",
    title: "Consolidar un hábito diario",
    description: "30 días seguidos haciendo lo mismo, sin saltarme más de 1.",
    horizon: "month",
    target_hours: 10,
    progress_mode: "manual",
    priority: "medium",
    milestones: ["Día 7", "Día 14", "Día 21", "Día 30"],
  },
  {
    id: "project",
    emoji: "🚀",
    name: "Lanzar un proyecto",
    title: "Lanzar mi proyecto",
    description: "De la idea al lanzamiento público.",
    horizon: "quarter",
    target_hours: 80,
    progress_mode: "time",
    context: "work",
    priority: "high",
    milestones: ["Validar idea", "MVP funcional", "Beta cerrada", "Lanzamiento público"],
  },
  {
    id: "fitness",
    emoji: "💪",
    name: "Plan de entrenamiento",
    title: "Plan de entrenamiento de 3 meses",
    description: "Constancia primero, intensidad después.",
    horizon: "quarter",
    target_hours: 50,
    progress_mode: "time",
    context: "home",
    priority: "medium",
    milestones: ["Mes 1: base", "Mes 2: progresión", "Mes 3: pico", "Evaluación final"],
  },
  {
    id: "saving",
    emoji: "💰",
    name: "Objetivo de ahorro",
    title: "Alcanzar mi objetivo de ahorro",
    description: "Llegar a la meta del año con aportaciones mensuales.",
    horizon: "year",
    target_hours: 0,
    progress_mode: "manual",
    priority: "medium",
    milestones: ["25%", "50%", "75%", "100%"],
  },
];
