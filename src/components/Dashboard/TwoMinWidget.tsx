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
    <GlassCard className="relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-6 -top-6 opacity-10">
        <Zap className="h-24 w-24 text-warning" />
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-warning">
        <Zap className="h-3 w-3" /> Acción de 2 minutos
      </div>
      <p className="mt-3 font-display text-base font-semibold leading-snug">{action.text}</p>
      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={done} className="ios-tap gap-1.5 rounded-xl bg-foreground text-background hover:bg-foreground/90">
          <Check className="h-3.5 w-3.5" /> Hecho
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setSeed(Math.floor(Math.random() * 1000))}
          className="ios-tap gap-1.5 rounded-xl border border-border/60 bg-card/40"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Otra
        </Button>
      </div>
    </GlassCard>
  );
}
