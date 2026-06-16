import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  streak_days: number;
  last_active_at: string | null;
  preferences: { pomodoroMinutes: number; breakMinutes: number; theme: string };
  onboarding_completed: boolean;
  current_mode: "work" | "home" | "family" | "travel" | "none";
  mode_auto_suggest: boolean;
};

export const useProfile = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
};

export const useUpdateProfile = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const { error } = await supabase.from("profiles").update(patch as any).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
};

export const useAddXp = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      const { data: p } = await supabase.from("profiles").select("xp").eq("id", user!.id).single();
      const newXp = (p?.xp ?? 0) + amount;
      const newLevel = Math.max(1, Math.floor(Math.sqrt(newXp / 100)) + 1);
      await supabase.from("profiles").update({ xp: newXp, level: newLevel }).eq("id", user!.id);
      return { xp: newXp, level: newLevel, gained: amount };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
};
