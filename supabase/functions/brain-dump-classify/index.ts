import { generateText } from "npm:ai";
import { createLovableAiGatewayProvider, corsHeaders } from "../_shared/ai-gateway.ts";

const KINDS = ["mission", "idea", "worry", "note"];

function extractJson(text: string): any {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Missing text" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const system = `Eres un asistente que clasifica notas mentales en español. Devuelve ÚNICAMENTE un JSON válido con la forma:
{ "items": [ { "content": string, "kind": "mission" | "idea" | "worry" | "note" } ] }
Reglas:
- "mission": algo accionable, una tarea concreta a ejecutar.
- "idea": pensamiento creativo, posibilidad, propuesta a desarrollar.
- "worry": preocupación, miedo, algo emocional que pesa.
- "note": observación neutra, recordatorio, dato.
- Conserva la frase casi tal cual, sin reformular salvo arreglar puntuación.
- Si una línea contiene varias cosas, sepáralas en items distintos.
- Devuelve solo el JSON, sin markdown.`;

    const prompt = `Clasifica estas líneas:\n\n${text}`;

    const { text: out } = await generateText({
      model, system, prompt, maxOutputTokens: 1500,
    });

    const parsed = extractJson(out);
    const items = (parsed.items ?? []).map((i: any) => ({
      content: String(i.content ?? "").trim(),
      kind: KINDS.includes(i.kind) ? i.kind : "note",
    })).filter((i: any) => i.content);

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    const msg = err?.message || String(err);
    const status = msg.includes("429") ? 429 : msg.includes("402") ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
