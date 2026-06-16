// Personalidad visual por identidad: arquetipos + overrides.
// Cada preset expone tokens HSL + tipografía display + estilo de tarjeta.

import type { CSSProperties } from "react";

export type PersonaKey =
  | "strategist"
  | "creator"
  | "analyst"
  | "caregiver"
  | "explorer"
  | "negotiator"
  | "warrior"
  | "dreamer";

export type CardStyle =
  | "minimal"
  | "editorial"
  | "mono"
  | "organic"
  | "topo"
  | "duotone"
  | "brutalist"
  | "aurora";

export type FontKey =
  | "sora"
  | "playfair"
  | "jetbrains"
  | "manrope"
  | "space-grotesk"
  | "inter-tight"
  | "archivo-black"
  | "cormorant";

export interface PersonaPreset {
  key: PersonaKey;
  label: string;
  tagline: string;
  accent: string; // HSL "H S% L%"
  accentSoft: string; // HSL
  gradientFrom: string; // HSL
  gradientTo: string; // HSL
  font: FontKey;
  cardStyle: CardStyle;
}

export const FONT_CLASS: Record<FontKey, string> = {
  sora: "font-[Sora]",
  playfair: "font-[Playfair_Display]",
  jetbrains: "font-[JetBrains_Mono]",
  manrope: "font-[Manrope]",
  "space-grotesk": "font-[Space_Grotesk]",
  "inter-tight": "font-[Inter_Tight]",
  "archivo-black": "font-[Archivo_Black]",
  cormorant: "font-[Cormorant_Garamond]",
};

export const FONT_FAMILY: Record<FontKey, string> = {
  sora: '"Sora", system-ui, sans-serif',
  playfair: '"Playfair Display", Georgia, serif',
  jetbrains: '"JetBrains Mono", ui-monospace, monospace',
  manrope: '"Manrope", system-ui, sans-serif',
  "space-grotesk": '"Space Grotesk", system-ui, sans-serif',
  "inter-tight": '"Inter Tight", system-ui, sans-serif',
  "archivo-black": '"Archivo Black", Impact, sans-serif',
  cormorant: '"Cormorant Garamond", Georgia, serif',
};

export const PERSONAS: Record<PersonaKey, PersonaPreset> = {
  strategist: {
    key: "strategist",
    label: "Estratega",
    tagline: "Visión y decisiones",
    accent: "234 76% 64%",
    accentSoft: "234 76% 78%",
    gradientFrom: "234 76% 64%",
    gradientTo: "260 70% 70%",
    font: "sora",
    cardStyle: "minimal",
  },
  creator: {
    key: "creator",
    label: "Creativo",
    tagline: "Ideas que respiran",
    accent: "338 80% 66%",
    accentSoft: "20 90% 75%",
    gradientFrom: "338 80% 66%",
    gradientTo: "28 90% 68%",
    font: "playfair",
    cardStyle: "editorial",
  },
  analyst: {
    key: "analyst",
    label: "Analítico",
    tagline: "Datos y precisión",
    accent: "199 90% 58%",
    accentSoft: "188 80% 70%",
    gradientFrom: "199 90% 58%",
    gradientTo: "188 80% 60%",
    font: "jetbrains",
    cardStyle: "mono",
  },
  caregiver: {
    key: "caregiver",
    label: "Cuidador",
    tagline: "Calma y equilibrio",
    accent: "152 60% 52%",
    accentSoft: "152 50% 72%",
    gradientFrom: "152 60% 52%",
    gradientTo: "172 55% 60%",
    font: "manrope",
    cardStyle: "organic",
  },
  explorer: {
    key: "explorer",
    label: "Explorador",
    tagline: "Mapa y movimiento",
    accent: "38 92% 60%",
    accentSoft: "30 85% 72%",
    gradientFrom: "38 92% 60%",
    gradientTo: "18 90% 60%",
    font: "space-grotesk",
    cardStyle: "topo",
  },
  negotiator: {
    key: "negotiator",
    label: "Negociador",
    tagline: "Palabra y puente",
    accent: "262 80% 70%",
    accentSoft: "292 80% 78%",
    gradientFrom: "262 80% 70%",
    gradientTo: "300 80% 72%",
    font: "inter-tight",
    cardStyle: "duotone",
  },
  warrior: {
    key: "warrior",
    label: "Guerrero",
    tagline: "Fuerza y empuje",
    accent: "0 80% 60%",
    accentSoft: "12 80% 68%",
    gradientFrom: "0 80% 60%",
    gradientTo: "20 85% 56%",
    font: "archivo-black",
    cardStyle: "brutalist",
  },
  dreamer: {
    key: "dreamer",
    label: "Soñador",
    tagline: "Aurora y posibilidad",
    accent: "292 80% 72%",
    accentSoft: "210 90% 78%",
    gradientFrom: "292 80% 72%",
    gradientTo: "210 90% 70%",
    font: "cormorant",
    cardStyle: "aurora",
  },
};

export const PERSONA_LIST: PersonaPreset[] = Object.values(PERSONAS);

// Fallback por color heredado (compat con identidades viejas sin persona)
const COLOR_TO_PERSONA: Record<string, PersonaKey> = {
  emerald: "caregiver",
  violet: "negotiator",
  sky: "analyst",
  amber: "explorer",
  rose: "creator",
};

export interface PersonaOverrides {
  font?: FontKey;
  style?: CardStyle;
  accent?: string; // HSL
}

export interface IdentityLike {
  persona?: string | null;
  color?: string | null;
  preferences?: PersonaOverrides | Record<string, unknown> | null;
}

export function resolvePersona(identity: IdentityLike | null | undefined): PersonaPreset {
  if (!identity) return PERSONAS.strategist;
  const base =
    (identity.persona && PERSONAS[identity.persona as PersonaKey]) ||
    PERSONAS[COLOR_TO_PERSONA[identity.color ?? ""] ?? "strategist"];
  const ov = (identity.preferences ?? {}) as PersonaOverrides;
  return {
    ...base,
    font: ov.font ?? base.font,
    cardStyle: ov.style ?? base.cardStyle,
    accent: ov.accent ?? base.accent,
  };
}

export function personaCSSVars(p: PersonaPreset): CSSProperties {
  return {
    // consumidas por .persona-card y derivadas
    ["--persona-accent" as any]: p.accent,
    ["--persona-accent-soft" as any]: p.accentSoft,
    ["--persona-from" as any]: p.gradientFrom,
    ["--persona-to" as any]: p.gradientTo,
  };
}

export function personaCardClass(p: PersonaPreset): string {
  return `persona-card persona-card--${p.cardStyle}`;
}

export function personaFontClass(p: PersonaPreset): string {
  return FONT_CLASS[p.font];
}
