import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type FocusSession = {
  id: string;
  identity_id: string | null;
  mission_id: string | null;
  duration_minutes: number;
  pomodoros_completed: number;
  notes: string | null;
  completed_at: string;
};

export const useFocusSessions = (limit = 50) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["focus_sessions", user?.id, limit],
    enabled: !!user,
    queryFn: async (): Promise<FocusSession[]> => {
      const { data, error } = await supabase
        .from("focus_sessions")
        .select("*")
        .eq("user_id", user!.id)
        .order("completed_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as any;
    },
  });
};

export const useLogFocusSession = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { identity_id?: string | null; mission_id?: string | null; duration_minutes: number; pomodoros_completed?: number }) => {
      const { error } = await supabase.from("focus_sessions").insert({
        user_id: user!.id,
        identity_id: input.identity_id ?? null,
        mission_id: input.mission_id ?? null,
        duration_minutes: input.duration_minutes,
        pomodoros_completed: input.pomodoros_completed ?? 1,
      } as any);
      if (error) throw error;
      // sumar XP a la identidad
      if (input.identity_id) {
        const { data: id } = await supabase.from("identities").select("total_xp").eq("id", input.identity_id).single();
        const newXp = (id?.total_xp ?? 0) + Math.round(input.duration_minutes * 2);
        await supabase.from("identities").update({ total_xp: newXp }).eq("id", input.identity_id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["focus_sessions"] });
      qc.invalidateQueries({ queryKey: ["identities"] });
    },
  });
};
