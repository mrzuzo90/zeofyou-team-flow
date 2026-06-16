import { generateText, Output } from "npm:ai";
import { z } from "npm:zod";
import { createLovableAiGatewayProvider, corsHeaders } from "../_shared/ai-gateway.ts";

const InputSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().default(""),
  life_context: z.string().optional().default(""),
  ambitions: z.array(z.string()).default([]),
  current_projects: z.string().optional().default(""),
  concerns: z.string().optional().default(""),
});

const COLORS = ["emerald", "violet", "sky", "amber", "rose", "indigo"] as const;

const OutputSchema = z.object({
  identities: z.array(z.object({
    name: z.string(),
    role: z.string(),
    specialty: z.string(),
    description: z.string(),
    color: z.enum(COLORS),
    energy: z.number().min(40).max(100),
  })).min(3).max(5),
  primary_mission: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    priority: z.enum(["low", "medium", "high"]),
    xp_reward: z.number().min(20).max(200),
  }),
  secondary_missions: z.array(z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    priority: z.enum(["low", "medium", "high"]),
    xp_reward: z.number().min(20).max(150),
  })).min(2).max(4),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = await req.json();
    const input = InputSchema.parse(raw);

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const system = `Eres un coach de productividad y desarrollo personal. Tu tarea es analizar el contexto de un usuario y proponerle:
1. Entre 3 y 5 "identidades internas" personalizadas (facetas de sí mismo, como un equipo directivo). Cada una con rol, especialidad, descripción breve y color.
2. Una misión principal accionable para los próximos 30 días, derivada de sus ambiciones y proyectos.
3. 2 a 4 misiones secundarias complementarias.

Tono: cálido, específico, en español. Evita genéricos. Conecta cada identidad con la realidad concreta del usuario (familia, profesión, preocupaciones, proyectos). Las misiones deben ser SMART y ejecutables esta semana o este mes.`;

    const prompt = `Datos del usuario:
- Nombre: ${input.name}
- Rol/ocupación: ${input.role || "no indicado"}
- Contexto vital (familia, situación): ${input.life_context || "no indicado"}
- Ambiciones: ${input.ambitions.length ? input.ambitions.join(" | ") : "no indicadas"}
- Proyectos actuales: ${input.current_projects || "no indicados"}
- Preocupaciones/bloqueos: ${input.concerns || "no indicados"}

Devuelve identidades coherentes con su vida real y misiones que ayuden a destrabar sus preocupaciones y avanzar sus ambiciones.`;

    const { experimental_output } = await generateText({
      model,
      system,
      prompt,
      experimental_output: Output.object({ schema: OutputSchema }),
    });

    return new Response(JSON.stringify(experimental_output), {
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
