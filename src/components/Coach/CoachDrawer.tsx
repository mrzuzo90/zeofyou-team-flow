import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Sparkles, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Msg = { id: string; role: "user" | "assistant"; content: string; identity_voice?: string | null };

export function CoachDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["coach_messages", user?.id],
    enabled: !!user && open,
    queryFn: async (): Promise<Msg[]> => {
      const { data, error } = await (supabase as any)
        .from("coach_messages")
        .select("id, role, content, identity_voice")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("coach-chat", { body: { message: text } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      qc.invalidateQueries({ queryKey: ["coach_messages"] });
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.includes("402")) toast.error("Sin créditos de IA. Añade créditos para seguir hablando.");
      else if (msg.includes("429")) toast.error("Demasiadas peticiones. Prueba en unos segundos.");
      else toast.error("No se pudo responder ahora mismo");
    } finally {
      setSending(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    await (supabase as any).from("coach_messages").delete().eq("user_id", user.id);
    qc.invalidateQueries({ queryKey: ["coach_messages"] });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/50 p-4">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Coach de tu equipo
          </SheetTitle>
          <SheetDescription className="text-xs">
            Habla con la identidad dominante de tu modo actual.
          </SheetDescription>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && !sending && (
            <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
              Pregunta algo como "¿en qué me debería enfocar hoy?" o "¿cómo voy esta semana?".
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-foreground",
                )}
              >
                {m.role === "assistant" && m.identity_voice && (
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-primary">{m.identity_voice}</div>
                )}
                <div className="whitespace-pre-line leading-relaxed">{m.content}</div>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted/60 px-3 py-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border/50 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2"
          >
            <Input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe a tu equipo…"
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={sending || !input.trim()} aria-label="Enviar">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" /> Borrar historial
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
