import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { inferContextFromCategory } from "@/lib/modes";

export type OnboardingAnswers = {
  name: string;
  role: string;
  life_context: string;
  ambitions: string[];
  current_projects: string;
  concerns: string;
};

export type SuggestedIdentity = {
  name: string;
  role: string;
  specialty: string;
  description: string;
  color: string;
  energy: number;
};

export type SuggestedMission = {
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  xp_reward: number;
};

export type Suggestions = {
  identities: SuggestedIdentity[];
  primary_mission: SuggestedMission;
  secondary_missions: SuggestedMission[];
};

const FALLBACK_COLORS = ["emerald", "violet", "sky", "amber"];

export function fallbackSuggestions(a: OnboardingAnswers): Suggestions {
  const primaryTitle = a.ambitions[0] ? `Avanzar: ${a.ambitions[0]}` : "Definir mi misión principal del mes";
  return {
    identities: [
      { name: "El Estratega", role: "Planificador principal", specialty: "Estrategia", description: "Visión a largo plazo y decisiones clave.", color: "emerald", energy: 85 },
      { name: "El Creativo", role: "Director de innovación", specialty: "Creatividad", description: "Genera ideas y soluciones originales.", color: "violet", energy: 75 },
      { name: "El Organizador", role: "Gestor de procesos", specialty: "Organización", description: "Estructura tu día y tus proyectos.", color: "sky", energy: 80 },
      { name: "El Coach", role: "Bienestar personal", specialty: "Bienestar", description: "Cuida tu energía y motivación.", color: "amber", energy: 90 },
    ],
    primary_mission: {
      title: primaryTitle, description: "Primer paso concreto esta semana.", category: "personal", priority: "high", xp_reward: 100,
    },
    secondary_missions: [
      { title: "Diseñar mi rutina ideal", description: "Bloques de focus y descanso.", category: "hábitos", priority: "medium", xp_reward: 60 },
      { title: "Revisar mis preocupaciones actuales", description: "Anotarlas y priorizar.", category: "claridad", priority: "medium", xp_reward: 50 },
    ],
  };
}

export const useFetchSuggestions = () =>
  useMutation({
    mutationFn: async (answers: OnboardingAnswers): Promise<Suggestions> => {
      const { data, error } = await supabase.functions.invoke("onboarding-suggest", { body: answers });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as Suggestions;
    },
  });

export const useCompleteOnboarding = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ answers, suggestions }: { answers: OnboardingAnswers; suggestions: Suggestions }) => {
      const uid = user!.id;

      // 1. Guardar respuestas
      await supabase.from("onboarding_profiles").upsert({
        user_id: uid,
        role: answers.role,
        life_context: answers.life_context,
        ambitions: answers.ambitions,
        current_projects: answers.current_projects,
        concerns: answers.concerns,
        raw_answers: answers as any,
      });

      // 2. Reemplazar identidades semilla
      await supabase.from("identities").delete().eq("user_id", uid);
      const identityRows = suggestions.identities.map((id, i) => ({
        user_id: uid,
        name: id.name,
        role: id.role,
        description: id.description,
        specialty: id.specialty,
        color: id.color,
        energy: id.energy,
        status: i === 0 ? "active" : "resting",
      }));
      const { error: idErr } = await supabase.from("identities").insert(identityRows as any);
      if (idErr) throw idErr;

      // 3. Insertar misiones (con contexto inferido a partir de la categoría)
      const withCtx = (m: any) => ({ ...m, context: inferContextFromCategory(m.category) });
      const missionRows = [
        { ...withCtx(suggestions.primary_mission), is_primary: true, user_id: uid, status: "pending" },
        ...suggestions.secondary_missions.map((m) => ({ ...withCtx(m), is_primary: false, user_id: uid, status: "pending" })),
      ];
      const { error: mErr } = await supabase.from("missions").insert(missionRows as any);
      if (mErr) throw mErr;

      // 4. Marcar perfil completado
      await supabase.from("profiles").update({
        display_name: answers.name,
        onboarding_completed: true,
      }).eq("id", uid);
    },
  });
};
