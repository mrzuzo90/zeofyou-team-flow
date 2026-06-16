import { generateText } from "npm:ai";
import { createLovableAiGatewayProvider, corsHeaders } from "../_shared/ai-gateway.ts";

const COLORS = ["emerald", "violet", "sky", "amber", "rose", "indigo"];

type Suggestions = {
  identities: { name: string; role: string; specialty: string; description: string; color: string; energy: number }[];
  primary_mission: { title: string; description: string; category: string; priority: string; xp_reward: number };
  secondary_missions: { title: string; description: string; category: string; priority: string; xp_reward: number }[];
};

function extractJson(text: string): any {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function sanitize(s: any): Suggestions {
  const norm = (p: string) => ["low", "medium", "high"].includes(p) ? p : "medium";
  const color = (c: string) => COLORS.includes(c) ? c : COLORS[Math.floor(Math.random() * COLORS.length)];
  return {
    identities: (s.identities ?? []).slice(0, 5).map((i: any) => ({
      name: String(i.name ?? "Identidad"),
      role: String(i.role ?? ""),
      specialty: String(i.specialty ?? ""),
      description: String(i.description ?? ""),
      color: color(i.color),
      energy: Math.max(40, Math.min(100, Number(i.energy) || 80)),
    })),
    primary_mission: {
      title: String(s.primary_mission?.title ?? "Misión principal"),
      description: String(s.primary_mission?.description ?? ""),
      category: String(s.primary_mission?.category ?? "personal"),
      priority: norm(s.primary_mission?.priority),
      xp_reward: Math.max(20, Math.min(200, Number(s.primary_mission?.xp_reward) || 100)),
    },
    secondary_missions: (s.secondary_missions ?? []).slice(0, 4).map((m: any) => ({
      title: String(m.title ?? "Misión"),
      description: String(m.description ?? ""),
      category: String(m.category ?? "general"),
      priority: norm(m.priority),
      xp_reward: Math.max(20, Math.min(150, Number(m.xp_reward) || 60)),
    })),
  };
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

    const input = await req.json();
    const ambitions: string[] = Array.isArray(input.ambitions) ? input.ambitions : [];

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const system = `Eres un coach de productividad. Devuelve ÚNICAMENTE un objeto JSON válido sin markdown ni texto extra, con esta forma exacta:
{
  "identities": [{ "name": string, "role": string, "specialty": string, "description": string, "color": "emerald"|"violet"|"sky"|"amber"|"rose"|"indigo", "energy": number(40-100) }],
  "primary_mission": { "title": string, "description": string, "category": string, "priority": "low"|"medium"|"high", "xp_reward": number(20-200) },
  "secondary_missions": [{ "title": string, "description": string, "category": string, "priority": "low"|"medium"|"high", "xp_reward": number(20-150) }]
}
Reglas: 3-5 identidades, 2-4 misiones secundarias, español, tono cálido, conecta con la realidad del usuario (familia, trabajo, ambiciones, preocupaciones). Misiones SMART y ejecutables este mes.`;

    const prompt = `Datos del usuario:
- Nombre: ${input.name ?? ""}
- Rol/ocupación: ${input.role || "no indicado"}
- Contexto vital: ${input.life_context || "no indicado"}
- Ambiciones: ${ambitions.length ? ambitions.join(" | ") : "no indicadas"}
- Proyectos actuales: ${input.current_projects || "no indicados"}
- Preocupaciones: ${input.concerns || "no indicadas"}

Responde solo con el JSON.`;

    const { text } = await generateText({
      model,
      system,
      prompt,
      maxOutputTokens: 2000,
    });

    const parsed = sanitize(extractJson(text));

    return new Response(JSON.stringify(parsed), {
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
