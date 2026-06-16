import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/UI/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AmbitionsInput } from "@/components/Onboarding/AmbitionsInput";
import { IdentitySuggestionCard, MissionSuggestionCard } from "@/components/Onboarding/SuggestionCard";
import { useAuth } from "@/contexts/AuthContext";
import { useFetchSuggestions, useCompleteOnboarding, fallbackSuggestions, type OnboardingAnswers, type Suggestions } from "@/hooks/useOnboarding";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ArrowLeft, Loader2, Sparkles, Check, Wand2 } from "lucide-react";
import { toast } from "sonner";

const TOTAL = 5;

export default function Onboarding() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const fetchSuggestions = useFetchSuggestions();
  const complete = useCompleteOnboarding();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    name: user?.user_metadata?.display_name || user?.user_metadata?.full_name || "",
    role: "",
    life_context: "",
    ambitions: [],
    current_projects: "",
    concerns: "",
  });
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);

  const patch = (p: Partial<OnboardingAnswers>) => setAnswers((a) => ({ ...a, ...p }));

  const canAdvance = () => {
    if (step === 0) return answers.name.trim().length >= 2;
    if (step === 2) return answers.ambitions.length >= 1;
    return true;
  };

  const next = async () => {
    if (!canAdvance()) return;
    if (step < 3) return setStep(step + 1);
    if (step === 3) {
      // generar sugerencias
      setStep(4);
      try {
        const s = await fetchSuggestions.mutateAsync(answers);
        setSuggestions(s);
      } catch (e: any) {
        toast.error("La IA no respondió, usamos sugerencias por defecto");
        setSuggestions(fallbackSuggestions(answers));
      }
    }
  };

  const skipAi = () => {
    setSuggestions(fallbackSuggestions(answers));
    setStep(4);
  };

  const finish = async () => {
    if (!suggestions) return;
    try {
      await complete.mutateAsync({ answers, suggestions });
      await qc.invalidateQueries();
      toast.success(`¡Tu equipo está listo, ${answers.name}!`);
      nav("/", { replace: true });
    } catch (e: any) {
      toast.error(e?.message || "No se pudo guardar tu onboarding");
    }
  };

  const updateIdentity = (i: number, p: Partial<Suggestions["identities"][number]>) =>
    setSuggestions((s) => s && ({ ...s, identities: s.identities.map((it, idx) => idx === i ? { ...it, ...p } : it) }));
  const removeIdentity = (i: number) =>
    setSuggestions((s) => s && ({ ...s, identities: s.identities.filter((_, idx) => idx !== i) }));
  const updatePrimary = (p: Partial<Suggestions["primary_mission"]>) =>
    setSuggestions((s) => s && ({ ...s, primary_mission: { ...s.primary_mission, ...p } }));
  const updateSecondary = (i: number, p: Partial<Suggestions["secondary_missions"][number]>) =>
    setSuggestions((s) => s && ({ ...s, secondary_missions: s.secondary_missions.map((m, idx) => idx === i ? { ...m, ...p } : m) }));
  const removeSecondary = (i: number) =>
    setSuggestions((s) => s && ({ ...s, secondary_missions: s.secondary_missions.filter((_, idx) => idx !== i) }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex justify-center gap-1.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-10 bg-primary" : i < step ? "w-6 bg-primary/40" : "w-6 bg-muted"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <GlassCard glow="emerald" className="p-6 md:p-10">
              {step === 0 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-emerald shadow-glow-emerald"><Sparkles className="h-7 w-7 text-primary-foreground" /></div>
                    <h1 className="font-display text-2xl font-bold md:text-3xl">Hola, vamos a conocerte</h1>
                    <p className="mt-2 text-muted-foreground">Con tus respuestas configuraremos tu equipo interno y tu primera misión.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">¿Cómo te llamamos?</Label>
                    <Input id="name" value={answers.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Tu nombre" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="role">¿A qué te dedicas?</Label>
                    <Input id="role" value={answers.role} onChange={(e) => patch({ role: e.target.value })} placeholder="Ej. Diseñador freelance, estudiante, fundador..." />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-bold">Tu contexto vital</h2>
                  <p className="text-muted-foreground">Cuéntanos quién te rodea, tu situación familiar o cualquier cosa relevante. Sirve para que las identidades encajen con tu vida real.</p>
                  <Textarea
                    value={answers.life_context}
                    onChange={(e) => patch({ life_context: e.target.value })}
                    placeholder="Ej. Vivo con mi pareja y mi hija de 3 años. Trabajo desde casa..."
                    rows={6}
                    maxLength={600}
                  />
                  <p className="text-right text-xs text-muted-foreground">{answers.life_context.length}/600</p>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-bold">Tus ambiciones</h2>
                  <p className="text-muted-foreground">¿Qué quieres conseguir en los próximos meses o años? Añade entre 1 y 5.</p>
                  <AmbitionsInput value={answers.ambitions} onChange={(v) => patch({ ambitions: v })} />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="font-display text-2xl font-bold">Proyectos y preocupaciones</h2>
                  <div className="space-y-1.5">
                    <Label htmlFor="proj">Proyectos en curso</Label>
                    <Textarea id="proj" value={answers.current_projects} onChange={(e) => patch({ current_projects: e.target.value })} rows={3} placeholder="Ej. Estoy creando un curso online, renovando la casa..." maxLength={500} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="conc">¿Qué te preocupa o te bloquea?</Label>
                    <Textarea id="conc" value={answers.concerns} onChange={(e) => patch({ concerns: e.target.value })} rows={3} placeholder="Ej. Procrastinación, falta de tiempo, dudas sobre el rumbo..." maxLength={500} />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-emerald shadow-glow-emerald"><Wand2 className="h-6 w-6 text-primary-foreground" /></div>
                    <h2 className="font-display text-2xl font-bold">Tu equipo personalizado</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Edita o quita lo que no encaje antes de empezar.</p>
                  </div>

                  {fetchSuggestions.isPending || !suggestions ? (
                    <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-sm">Diseñando tu equipo...</span>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div>
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Identidades</h3>
                        <div className="space-y-2">
                          {suggestions.identities.map((id, i) => (
                            <IdentitySuggestionCard key={i} identity={id} onChange={(p) => updateIdentity(i, p)} onRemove={() => removeIdentity(i)} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Misión principal</h3>
                        <MissionSuggestionCard mission={suggestions.primary_mission} primary onChange={updatePrimary} />
                      </div>
                      <div>
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Misiones secundarias</h3>
                        <div className="space-y-2">
                          {suggestions.secondary_missions.map((m, i) => (
                            <MissionSuggestionCard key={i} mission={m} onChange={(p) => updateSecondary(i, p)} onRemove={() => removeSecondary(i)} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            {step > 0 && step < 4 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)} className="gap-2"><ArrowLeft className="h-4 w-4" /> Atrás</Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step === 3 && (
              <Button variant="ghost" onClick={skipAi}>Saltar IA</Button>
            )}
            {step < 4 ? (
              <Button onClick={next} disabled={!canAdvance() || fetchSuggestions.isPending} className="gap-2 bg-gradient-emerald text-primary-foreground">
                {step === 3 ? "Generar mi equipo" : "Siguiente"} <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={finish} disabled={!suggestions || complete.isPending || suggestions.identities.length < 2} className="gap-2 bg-gradient-emerald text-primary-foreground">
                {complete.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Empezar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
