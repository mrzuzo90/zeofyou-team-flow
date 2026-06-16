import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Milestone = {
  id: string;
  mission_id: string;
  user_id: string;
  title: string;
  done: boolean;
  weight: number;
  position: number;
  created_at: string;
};

export const useMilestones = (missionId: string | null | undefined) => {
  return useQuery({
    queryKey: ["milestones", missionId],
    enabled: !!missionId,
    queryFn: async (): Promise<Milestone[]> => {
      const { data, error } = await (supabase as any)
        .from("mission_milestones")
        .select("*")
        .eq("mission_id", missionId)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useCreateMilestone = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ missionId, title, weight = 1 }: { missionId: string; title: string; weight?: number }) => {
      const { error } = await (supabase as any).from("mission_milestones").insert({
        user_id: user!.id,
        mission_id: missionId,
        title,
        weight,
      });
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["milestones", v.missionId] });
      qc.invalidateQueries({ queryKey: ["missions"] });
    },
  });
};

export const useToggleMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, done }: { id: string; missionId: string; done: boolean }) => {
      const { error } = await (supabase as any).from("mission_milestones").update({ done }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["milestones", v.missionId] });
      qc.invalidateQueries({ queryKey: ["missions"] });
    },
  });
};

export const useDeleteMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; missionId: string }) => {
      const { error } = await (supabase as any).from("mission_milestones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["milestones", v.missionId] });
      qc.invalidateQueries({ queryKey: ["missions"] });
    },
  });
};
