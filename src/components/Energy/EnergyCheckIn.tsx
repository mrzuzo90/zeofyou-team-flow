import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSaveEnergyCheckin, useShouldPromptEnergyCheckin } from "@/hooks/useEnergyCheckIn";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const LEVELS = [
  { v: 1, emoji: "😩", label: "Vacío" },
  { v: 2, emoji: "😕", label: "Bajo" },
  { v: 3, emoji: "😐", label: "Normal" },
  { v: 4, emoji: "🙂", label: "Bien" },
  { v: 5, emoji: "🔥", label: "On fire" },
];

export function EnergyCheckInPrompt() {
  const { open, setOpen, dismiss } = useShouldPromptEnergyCheckin();
  const { mode } = useCurrentMode();
  const save = useSaveEnergyCheckin();
  const [level, setLevel] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const submit = async () => {
    if (!level) return;
    const mood = LEVELS.find((l) => l.v === level)?.label;
    await save.mutateAsync({ level, mood, note: note || undefined, mode });
    toast.success("Check-in registrado");
    setLevel(null);
    setNote("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : dismiss())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Cómo está tu energía?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.v}
                onClick={() => setLevel(l.v)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border border-border p-3 text-xs transition-all hover:border-primary",
                  level === l.v && "border-primary bg-primary/10",
                )}
              >
                <span className="text-2xl">{l.emoji}</span>
                <span className="text-[10px] text-muted-foreground">{l.label}</span>
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Algo que añadir (opcional)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={dismiss} className="flex-1">Ahora no</Button>
            <Button onClick={submit} disabled={!level || save.isPending} className="flex-1 bg-gradient-emerald text-primary-foreground">
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
