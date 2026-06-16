import { generateText } from "npm:ai";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createLovableAiGatewayProvider, corsHeaders } from "../_shared/ai-gateway.ts";

function isoWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

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

    const week = isoWeek(new Date());

    // Cache hit
    const { data: cached } = await supa
      .from("weekly_summaries")
      .select("*")
      .eq("user_id", user.id)
      .eq("iso_week", week)
      .maybeSingle();

    let force = false;
    try { const body = await req.json(); force = !!body?.force; } catch { /* sin body */ }

    if (cached && !force) {
      return new Response(JSON.stringify({ summary: cached.summary, suggestions: cached.suggestions, metrics: cached.metrics, cached: true, week }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Recoger métricas de la semana
    const sinceIso = new Date(Date.now() - 7 * 86400_000).toISOString();
    const [missionsRes, focusRes, energyRes, modesRes, identitiesRes] = await Promise.all([
      supa.from("missions").select("title, status, context, updated_at").eq("user_id", user.id),
      supa.from("focus_sessions").select("duration_minutes, completed_at, identity_id").eq("user_id", user.id).gte("completed_at", sinceIso),
      supa.from("energy_checkins").select("level, created_at").eq("user_id", user.id).gte("created_at", sinceIso),
      supa.from("mode_sessions").select("mode, started_at, ended_at").eq("user_id", user.id).gte("started_at", sinceIso),
      supa.from("identities").select("name, status, energy"),
    ]);

    const completed = (missionsRes.data ?? []).filter((m: any) => m.status === "completed" && new Date(m.updated_at) >= new Date(sinceIso));
    const pending = (missionsRes.data ?? []).filter((m: any) => m.status !== "completed" && m.status !== "archived");
    const focusMin = (focusRes.data ?? []).reduce((a: number, b: any) => a + (b.duration_minutes ?? 0), 0);
    const avgEnergy = energyRes.data?.length ? Math.round(energyRes.data.reduce((a: number, b: any) => a + b.level, 0) / energyRes.data.length * 10) / 10 : null;

    const now = Date.now();
    const modeTotals: Record<string, number> = {};
    for (const s of (modesRes.data ?? [])) {
      const start = new Date(s.started_at).getTime();
      const end = s.ended_at ? new Date(s.ended_at).getTime() : now;
      modeTotals[s.mode] = (modeTotals[s.mode] ?? 0) + Math.max(0, Math.round((end - start) / 60000));
    }

    const metrics = {
      focus_minutes: focusMin,
      completed_missions: completed.length,
      pending_missions: pending.length,
      avg_energy: avgEnergy,
      mode_minutes: modeTotals,
      identities: identitiesRes.data ?? [],
    };

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const system = `Eres un coach personal cálido y directo. Devuelve ÚNICAMENTE un JSON con la forma:
{ "summary": string (3-4 frases, español, cercano, mencionando 1-2 datos concretos), "suggestions": [string, string, string] (3 sugerencias accionables para la próxima semana) }
Sin markdown, sin texto extra.`;

    const prompt = `Métricas de la semana del usuario:
- Minutos de focus: ${focusMin}
- Misiones completadas: ${completed.length} (${completed.slice(0, 5).map((m: any) => m.title).join(" | ") || "ninguna"})
- Misiones pendientes: ${pending.length}
- Energía media (1-5): ${avgEnergy ?? "sin datos"}
- Minutos por modo: ${JSON.stringify(modeTotals)}
- Identidades: ${(identitiesRes.data ?? []).map((i: any) => `${i.name} (${i.status}, ${i.energy}%)`).join(", ")}

Hazle un resumen honesto y motivador. Si hay desequilibrios (mucho trabajo, poco descanso, baja energía), menciónalo con cariño.`;

    const { text: out } = await generateText({ model, system, prompt, maxOutputTokens: 800 });
    const parsed = extractJson(out);
    const summary = String(parsed.summary ?? "");
    const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5).map(String) : [];

    await supa.from("weekly_summaries").upsert({
      user_id: user.id, iso_week: week, summary, suggestions, metrics,
    } as any, { onConflict: "user_id,iso_week" });

    return new Response(JSON.stringify({ summary, suggestions, metrics, cached: false, week }), {
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
