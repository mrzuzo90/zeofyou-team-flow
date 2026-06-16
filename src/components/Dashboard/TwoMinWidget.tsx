import { useState } from "react";
import { GlassCard } from "@/components/UI/GlassCard";
import { Button } from "@/components/ui/button";
import { Zap, RefreshCw, Check } from "lucide-react";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { useLastEnergyCheckins } from "@/hooks/useEnergyCheckIn";
import { useAddXp } from "@/hooks/useProfile";
import { pickMicroAction } from "@/lib/micro-actions";
import { toast } from "sonner";

export function TwoMinWidget() {
  const { mode } = useCurrentMode();
  const { data: checkins = [] } = useLastEnergyCheckins();
  const addXp = useAddXp();
  const lastEnergy = checkins[0]?.level;
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100));
  const action = pickMicroAction(mode, lastEnergy, seed);

  const done = async () => {
    await addXp.mutateAsync(5);
    toast.success("+5 XP · siguiente acción cargada");
    setSeed(Math.floor(Math.random() * 1000));
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Zap className="h-3.5 w-3.5 text-warning" /> Acción de 2 minutos
      </div>
      <p className="mt-3 font-display text-base font-semibold leading-snug">{action.text}</p>
      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={done} className="gap-1.5 bg-gradient-emerald text-primary-foreground">
          <Check className="h-3.5 w-3.5" /> Hecho
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setSeed(Math.floor(Math.random() * 1000))} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Otra
        </Button>
      </div>
    </GlassCard>
  );
}
