import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMode, type ModeKey } from "@/lib/modes";
import { useCurrentMode } from "@/hooks/useCurrentMode";

export default function Transition() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { setMode } = useCurrentMode();
  const from = (params.get("from") || "none") as ModeKey;
  const to = (params.get("to") || "work") as ModeKey;
  const fromDef = getMode(from);
  const toDef = getMode(to);

  const [step, setStep] = useState(0); // 0 respiración, 1 dejar, 2 traer
  const [leaving, setLeaving] = useState("");
  const [bringing, setBringing] = useState("");
  const [breathPhase, setBreathPhase] = useState<"in" | "hold" | "out">("in");
  const [breathCycle, setBreathCycle] = useState(0);

  // Animación de respiración 4-7-8 simplificada (4-4-6), 3 ciclos
  useEffect(() => {
    if (step !== 0) return;
    let cancelled = false;
    const run = async () => {
      for (let c = 0; c < 3 && !cancelled; c++) {
        setBreathCycle(c);
        setBreathPhase("in"); await new Promise((r) => setTimeout(r, 4000));
        if (cancelled) return;
        setBreathPhase("hold"); await new Promise((r) => setTimeout(r, 4000));
        if (cancelled) return;
        setBreathPhase("out"); await new Promise((r) => setTimeout(r, 6000));
      }
      if (!cancelled) setStep(1);
    };
    run();
    return () => { cancelled = true; };
  }, [step]);

  const finish = async () => {
    if (user) {
      await supabase.from("transition_notes").insert({
        user_id: user.id,
        from_mode: from === "none" ? null : from,
        to_mode: to,
        leaving: leaving || null,
        bringing: bringing || null,
      } as any);
    }
    setMode(to);
    nav("/");
  };

  const skipAll = () => {
    setMode(to);
    nav("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6">
      <button onClick={skipAll} className="absolute right-4 top-4 text-xs text-muted-foreground hover:text-foreground">
        Saltar
      </button>
      <div className="absolute top-4 left-4 text-xs text-muted-foreground">
        {fromDef.label} → <span className="font-semibold text-foreground">{toDef.label}</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="breath" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
            <motion.div
              className="flex h-48 w-48 items-center justify-center rounded-full bg-gradient-emerald shadow-glow-emerald"
              animate={{ scale: breathPhase === "in" ? 1.4 : breathPhase === "hold" ? 1.4 : 0.8 }}
              transition={{ duration: breathPhase === "in" ? 4 : breathPhase === "out" ? 6 : 4, ease: "easeInOut" }}
            >
              <span className="text-2xl font-display font-bold text-primary-foreground">
                {breathPhase === "in" ? "Inhala" : breathPhase === "hold" ? "Mantén" : "Exhala"}
              </span>
            </motion.div>
            <p className="mt-8 text-sm text-muted-foreground">Respiración guiada · ciclo {breathCycle + 1} de 3</p>
            <button onClick={() => setStep(1)} className="mt-6 text-xs text-muted-foreground underline">
              Continuar
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="leave" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-md">
            <h2 className="text-center font-display text-2xl font-bold">¿Qué dejas atrás?</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Una idea, una preocupación, una tarea. Soltarla la mantiene fuera de tu cabeza.
            </p>
            <Input
              autoFocus
              value={leaving}
              onChange={(e) => setLeaving(e.target.value)}
              placeholder="Esa reunión, ese email pendiente…"
              className="mt-6 text-center text-lg"
            />
            <Button onClick={() => setStep(2)} className="mt-6 w-full bg-gradient-emerald text-primary-foreground">
              Siguiente
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="bring" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-md">
            <h2 className="text-center font-display text-2xl font-bold">¿Qué traes al modo {toDef.label}?</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Una intención simple para los próximos momentos.
            </p>
            <Input
              autoFocus
              value={bringing}
              onChange={(e) => setBringing(e.target.value)}
              placeholder="Estar presente, escuchar, descansar…"
              className="mt-6 text-center text-lg"
            />
            <Button onClick={finish} className="mt-6 w-full bg-gradient-emerald text-primary-foreground">
              Estoy aquí
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
