import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ModeKey } from "@/lib/modes";

export type ModeSession = {
  id: string;
  user_id: string;
  mode: ModeKey;
  started_at: string;
  ended_at: string | null;
};

export const useModeSessions = (days = 7) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["mode_sessions", user?.id, days],
    enabled: !!user,
    queryFn: async (): Promise<ModeSession[]> => {
      const since = new Date(Date.now() - days * 86400_000).toISOString();
      const { data, error } = await supabase
        .from("mode_sessions")
        .select("*")
        .eq("user_id", user!.id)
        .gte("started_at", since)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any;
    },
  });
};

export const useRecordModeChange = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (newMode: ModeKey) => {
      if (!user) return;
      const now = new Date().toISOString();
      // Cerrar sesiones abiertas
      await supabase
        .from("mode_sessions")
        .update({ ended_at: now })
        .eq("user_id", user.id)
        .is("ended_at", null);
      // Abrir nueva
      await supabase.from("mode_sessions").insert({
        user_id: user.id,
        mode: newMode,
        started_at: now,
      } as any);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mode_sessions"] }),
  });
};

/** Calcula minutos por modo en las sesiones cargadas, considerando 'now' para sesiones abiertas. */
export function aggregateByMode(sessions: ModeSession[]) {
  const now = Date.now();
  const totals: Record<string, number> = {};
  for (const s of sessions) {
    const start = new Date(s.started_at).getTime();
    const end = s.ended_at ? new Date(s.ended_at).getTime() : now;
    const minutes = Math.max(0, Math.round((end - start) / 60000));
    totals[s.mode] = (totals[s.mode] ?? 0) + minutes;
  }
  return totals;
}
