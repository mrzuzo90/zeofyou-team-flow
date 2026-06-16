import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/UI/GlassCard";
import { Button } from "@/components/ui/button";
import { IdentityAvatar } from "@/components/UI/IdentityAvatar";
import { useIdentities } from "@/hooks/useIdentities";
import { useUpdateProfile } from "@/hooks/useProfile";
import { ArrowRight, Users, Target, Timer, Sparkles, Check } from "lucide-react";

const steps = [
  {
    icon: Sparkles,
    title: "Bienvenido a Zeofyou",
    description: "Tu mente funciona como un equipo. Cada faceta tuya tiene un rol: estratega, creativo, organizador, coach. Aquí los coordinas como un director.",
  },
  {
    icon: Users,
    title: "Tu equipo ya está listo",
    description: "Hemos creado 4 identidades iniciales para empezar. Podrás añadir o quitar las que quieras desde la pantalla de Equipo.",
  },
  {
    icon: Target,
    title: "Una misión principal a la vez",
    description: "Elige siempre una misión clave del día. Las demás quedan bloqueadas para que no compitan por tu atención.",
  },
  {
    icon: Timer,
    title: "Focus con Pomodoro",
    description: "Cada sesión de Focus suma XP a tu identidad activa. Si te interrumpen, activa la Pausa privada con un toque.",
  },
];

export default function Onboarding() {
  const nav = useNavigate();
  const { data: identities = [] } = useIdentities();
  const update = useUpdateProfile();
  const [i, setI] = useState(0);
  const Icon = steps[i].icon;

  const finish = async () => {
    await update.mutateAsync({ onboarding_completed: true });
    nav("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex justify-center gap-1.5">
          {steps.map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-10 bg-primary" : idx < i ? "w-6 bg-primary/40" : "w-6 bg-muted"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <GlassCard glow="emerald" className="p-8 md:p-12 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-emerald shadow-glow-emerald">
                <Icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold md:text-4xl text-balance">{steps[i].title}</h1>
              <p className="mx-auto mt-4 max-w-md text-balance text-base text-muted-foreground">{steps[i].description}</p>

              {i === 1 && (
                <div className="mt-8 flex justify-center gap-4">
                  {identities.slice(0, 4).map((id) => (
                    <div key={id.id} className="flex flex-col items-center gap-2">
                      <IdentityAvatar name={id.name} color={id.color} size="lg" />
                      <span className="text-xs font-medium">{id.name.replace("El ", "")}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex justify-between gap-3">
          {i > 0 ? (
            <Button variant="ghost" onClick={() => setI(i - 1)}>Atrás</Button>
          ) : <span />}
          {i < steps.length - 1 ? (
            <Button onClick={() => setI(i + 1)} className="gap-2 bg-gradient-emerald text-primary-foreground">Siguiente <ArrowRight className="h-4 w-4" /></Button>
          ) : (
            <Button onClick={finish} className="gap-2 bg-gradient-emerald text-primary-foreground"><Check className="h-4 w-4" /> Empezar</Button>
          )}
        </div>
      </div>
    </div>
  );
}
