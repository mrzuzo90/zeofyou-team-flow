import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export type EnergyCheckin = {
  id: string;
  level: number;
  mood: string | null;
  note: string | null;
  mode: string | null;
  created_at: string;
};

const DISMISS_KEY = "zeofyou:energy-checkin-dismissed";

/** Devuelve el último checkin y la media de los últimos 5. */
export const useLastEnergyCheckins = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["energy_checkins", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<EnergyCheckin[]> => {
      const { data, error } = await supabase
        .from("energy_checkins")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as any;
    },
  });
};

export const useSaveEnergyCheckin = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { level: number; mood?: string; note?: string; mode?: string }) => {
      const { error } = await supabase.from("energy_checkins").insert({
        user_id: user!.id,
        level: input.level,
        mood: input.mood ?? null,
        note: input.note ?? null,
        mode: input.mode ?? null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["energy_checkins"] }),
  });
};

/** Decide si mostrar el modal: 2 ventanas (mañana 9-11, tarde 17-19) y solo 1 vez por ventana. */
export function useShouldPromptEnergyCheckin() {
  const { data: profile } = useProfile();
  const { data: checkins = [] } = useLastEnergyCheckins();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!profile || !(profile as any).energy_checkin_enabled) return;
    const now = new Date();
    const h = now.getHours();
    const window = h >= 9 && h < 11 ? "am" : h >= 17 && h < 19 ? "pm" : null;
    if (!window) return;

    const todayWindowKey = `${now.toDateString()}-${window}`;
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (dismissed === todayWindowKey) return;

    // ¿ya hay un checkin hoy en esta ventana?
    const exists = checkins.some((c) => {
      const d = new Date(c.created_at);
      if (d.toDateString() !== now.toDateString()) return false;
      const ch = d.getHours();
      return (window === "am" && ch >= 9 && ch < 11) || (window === "pm" && ch >= 17 && ch < 19);
    });
    if (exists) return;

    const id = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(id);
  }, [profile, checkins]);

  const dismiss = () => {
    const now = new Date();
    const h = now.getHours();
    const window = h >= 9 && h < 11 ? "am" : h >= 17 && h < 19 ? "pm" : "x";
    sessionStorage.setItem(DISMISS_KEY, `${now.toDateString()}-${window}`);
    setOpen(false);
  };

  return { open, setOpen, dismiss };
}
