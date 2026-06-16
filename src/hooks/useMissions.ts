import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Mission = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_primary: boolean;
  assigned_identity_id: string | null;
  status: "pending" | "in_progress" | "completed" | "archived";
  priority: "low" | "medium" | "high";
  category: string | null;
  due_date: string | null;
  xp_reward: number;
  context: "work" | "home" | "family" | "travel" | null;
};

export const useMissions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["missions", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Mission[]> => {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .eq("user_id", user!.id)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any;
    },
  });
};

export const useCreateMission = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Mission> & { title: string }) => {
      // Si la marcamos como principal, desmarcar las demás
      if (input.is_primary) {
        await supabase.from("missions").update({ is_primary: false }).eq("user_id", user!.id);
      }
      const { error } = await supabase.from("missions").insert({
        user_id: user!.id,
        title: input.title,
        description: input.description ?? null,
        is_primary: input.is_primary ?? false,
        assigned_identity_id: input.assigned_identity_id ?? null,
        priority: input.priority ?? "medium",
        category: input.category ?? null,
        xp_reward: input.xp_reward ?? 50,
        status: input.status ?? "pending",
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["missions"] }),
  });
};

export const useUpdateMission = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Mission> }) => {
      if (patch.is_primary) {
        await supabase.from("missions").update({ is_primary: false }).eq("user_id", user!.id);
      }
      const { error } = await supabase.from("missions").update(patch as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["missions"] }),
  });
};

export const useDeleteMission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("missions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["missions"] }),
  });
};
