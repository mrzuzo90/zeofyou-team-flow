import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Identity = {
  id: string;
  user_id: string;
  name: string;
  role: string;
  description: string | null;
  specialty: string | null;
  color: string;
  avatar: string | null;
  energy: number;
  status: "active" | "resting" | "paused";
  total_xp: number;
  context: "work" | "home" | "family" | "travel" | null;
};

export const useIdentities = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["identities", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Identity[]> => {
      const { data, error } = await supabase
        .from("identities")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as any;
    },
  });
};

export const useUpdateIdentityStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Identity["status"] }) => {
      const { error } = await supabase.from("identities").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["identities"] }),
  });
};

export const useCreateIdentity = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Identity> & { name: string; role: string }) => {
      const { error } = await supabase.from("identities").insert({
        user_id: user!.id,
        name: input.name,
        role: input.role,
        description: input.description ?? null,
        specialty: input.specialty ?? null,
        color: input.color ?? "emerald",
        status: input.status ?? "resting",
        energy: input.energy ?? 80,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["identities"] }),
  });
};

export const useDeleteIdentity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("identities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["identities"] }),
  });
};
