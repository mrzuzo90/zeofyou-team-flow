import { generateText } from "npm:ai";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createLovableAiGatewayProvider, corsHeaders } from "../_shared/ai-gateway.ts";

const MODE_IDENTITY: Record<string, string> = {
  work: "El Estratega",
  home: "El Coach",
  family: "El Coach",
  travel: "El Organizador",
  none: "El Estratega",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supa.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Missing message" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Contexto del usuario
    const sinceIso = new Date(Date.now() - 7 * 86400_000).toISOString();
    const [profileRes, missionsRes, identitiesRes, focusRes, energyRes, historyRes] = await Promise.all([
      supa.from("profiles").select("display_name, current_mode").eq("id", user.id).maybeSingle(),
      supa.from("missions").select("title, status, is_primary, progress, kind").eq("user_id", user.id).neq("status", "archived"),
      supa.from("identities").select("name, status, energy"),
      supa.from("focus_sessions").select("duration_minutes, completed_at").eq("user_id", user.id).gte("completed_at", sinceIso),
      supa.from("energy_checkins").select("level").eq("user_id", user.id).gte("created_at", sinceIso),
      supa.from("coach_messages").select("role, content").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    ]);

    const mode = (profileRes.data as any)?.current_mode ?? "work";
    const voice = MODE_IDENTITY[mode] ?? "El Estratega";
    const focusMin = (focusRes.data ?? []).reduce((a: number, b: any) => a + (b.duration_minutes ?? 0), 0);
    const primary = (missionsRes.data ?? []).find((m: any) => m.is_primary && m.status !== "completed");
    const completed = (missionsRes.data ?? []).filter((m: any) => m.status === "completed").length;
    const avgEnergy = energyRes.data?.length ? Math.round(energyRes.data.reduce((a: number, b: any) => a + b.level, 0) / energyRes.data.length * 10) / 10 : null;
    const history = (historyRes.data ?? []).reverse();

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const system = `Eres ${voice}, una identidad interna del usuario en su sistema Zeofyou. Hablas en español, en primera persona, cercano, directo y útil. Respuestas cortas (2-5 frases) salvo que pidan análisis profundo. Usa los datos concretos del contexto cuando aporten. No inventes datos. Nunca menciones que eres una IA.

Contexto del usuario:
- Nombre: ${(profileRes.data as any)?.display_name ?? "(sin nombre)"}
- Modo actual: ${mode}
- Misión principal: ${primary ? `"${primary.title}" (${primary.progress ?? 0}%)` : "sin definir"}
- Misiones completadas (totales): ${completed}
- Focus últimos 7 días: ${focusMin} minutos
- Energía media últimos 7 días (1-5): ${avgEnergy ?? "sin datos"}
- Equipo: ${(identitiesRes.data ?? []).map((i: any) => `${i.name} (${i.status}, ${i.energy}%)`).join(", ")}`;

    const conversation = [
      ...history.map((h: any) => `${h.role === "user" ? "Usuario" : voice}: ${h.content}`),
      `Usuario: ${message}`,
      `${voice}:`,
    ].join("\n");

    const { text } = await generateText({ model, system, prompt: conversation, maxOutputTokens: 400 });
    const answer = text.trim();

    // Guardar
    await supa.from("coach_messages").insert([
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content: answer, identity_voice: voice },
    ] as any);

    return new Response(JSON.stringify({ answer, voice }), {
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
