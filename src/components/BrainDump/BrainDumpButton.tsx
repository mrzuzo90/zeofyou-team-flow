import { useEffect, useState } from "react";
import { Brain, Lightbulb, AlertCircle, StickyNote, Target, Loader2, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { useCreateMission } from "@/hooks/useMissions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Item = { content: string; kind: "mission" | "idea" | "worry" | "note"; keep: boolean };

const KIND_META: Record<string, { label: string; icon: any; color: string }> = {
  mission: { label: "Misión", icon: Target, color: "text-primary bg-primary/10" },
  idea: { label: "Idea", icon: Lightbulb, color: "text-warning bg-warning/10" },
  worry: { label: "Preocupación", icon: AlertCircle, color: "text-destructive bg-destructive/10" },
  note: { label: "Nota", icon: StickyNote, color: "text-muted-foreground bg-muted/40" },
};

export function BrainDumpButton() {
  const { user } = useAuth();
  const { mode } = useCurrentMode();
  const createMission = useCreateMission();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    const open = () => setOpen(true);
    window.addEventListener("zeofyou:brain-dump", open);
    return () => window.removeEventListener("zeofyou:brain-dump", open);
  }, []);

  const classify = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("brain-dump-classify", { body: { text } });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      const classified = (data?.items ?? []).map((it: any) => ({
        content: String(it.content ?? "").trim(),
        kind: ["mission", "idea", "worry", "note"].includes(it.kind) ? it.kind : "note",
        keep: true,
      })).filter((i: Item) => i.content);
      setItems(classified);
    } catch (e: any) {
      // Fallback: cada línea como "nota"
      const lines = text.split("\n").map((s) => s.trim()).filter(Boolean);
      setItems(lines.map((c) => ({ content: c, kind: "note" as const, keep: true })));
      toast.error("IA no disponible · clasificadas como notas");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!items || !user) return;
    const kept = items.filter((i) => i.keep);
    if (!kept.length) { setOpen(false); return; }
    // Guardar todas como brain_dumps
    await supabase.from("brain_dumps").insert(
      kept.map((i) => ({
        user_id: user.id,
        content: i.content,
        kind: i.kind,
        context: mode === "none" ? null : mode,
      })) as any,
    );
    // Convertir misiones aprobadas en misiones reales
    const missions = kept.filter((i) => i.kind === "mission");
    for (const m of missions) {
      await createMission.mutateAsync({
        title: m.content,
        priority: "medium",
        xp_reward: 50,
        context: mode === "none" ? null : (mode as any),
      } as any);
    }
    toast.success(`${kept.length} entradas guardadas${missions.length ? ` · ${missions.length} misión(es) creada(s)` : ""}`);
    setText("");
    setItems(null);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-emerald text-primary-foreground shadow-glow-emerald transition-transform hover:scale-105 lg:bottom-6"
          aria-label="Vaciar la cabeza"
        >
          <Brain className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Vacía la cabeza</SheetTitle>
        </SheetHeader>
        {!items ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">Escribe todo lo que te ronda. Una idea por línea. La IA lo ordena en misiones, ideas, preocupaciones o notas.</p>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder={"Tareas, ideas, preocupaciones…\nNo te censures.\nUna por línea."}
            />
            <Button onClick={classify} disabled={loading || !text.trim()} className="w-full bg-gradient-emerald text-primary-foreground">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ordenar con IA"}
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground">Revisa, ajusta y guarda. Las marcadas como misión se crearán automáticamente.</p>
            {items.map((it, i) => {
              const meta = KIND_META[it.kind];
              const Icon = meta.icon;
              return (
                <div key={i} className={cn("flex items-start gap-2 rounded-lg border border-border p-3 text-sm", !it.keep && "opacity-40")}>
                  <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", meta.color)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{meta.label}</div>
                    <div className="break-words">{it.content}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(["mission", "idea", "worry", "note"] as const).map((k) => (
                        <button
                          key={k}
                          onClick={() => setItems(items.map((x, j) => j === i ? { ...x, kind: k } : x))}
                          className={cn("rounded-full px-2 py-0.5 text-[10px]", it.kind === k ? KIND_META[k].color : "bg-muted/40 text-muted-foreground")}
                        >
                          {KIND_META[k].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setItems(items.map((x, j) => j === i ? { ...x, keep: !x.keep } : x))} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" onClick={() => setItems(null)} className="flex-1">Volver</Button>
              <Button onClick={save} className="flex-1 bg-gradient-emerald text-primary-foreground">Guardar</Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
