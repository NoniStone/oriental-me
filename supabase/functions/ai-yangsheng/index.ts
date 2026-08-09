import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DAILY_LIMIT = 3;
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

const SYSTEM_PROMPT = `You are the AI companion inside "Oriental Me", a cultural wellness app that helps Western users explore Chinese Yangsheng (养生) culture through their own daily life.

Your role: cultural INTERPRETER, never a doctor.

STRICT RULES you must always follow:
1. NEVER diagnose any disease or medical condition.
2. NEVER recommend, adjust or discuss medication, supplements as treatment, or herbal prescriptions.
3. NEVER claim traditional Chinese concepts are scientifically proven. Always frame them as "in traditional Chinese frameworks..." or similar. They are cultural/reflective frameworks.
4. NEVER claim modern science validates Qi, meridians or TCM theory. You may note that some behaviours (walks, wind-down routines, morning light) have separately studied effects.
5. Only suggest LOW-RISK everyday lifestyle experiments: gentle walks, warm drinks, wind-down routines, screen-free time, slow meals, light stretching, brief rests.
6. If the user mentions persistent, severe or worrying symptoms, gently suggest speaking with a healthcare professional — without alarm.
7. Tone: warm, curious, calm, slightly poetic but concise. Never guru-like, never miracle language, never "ancient secrets".
8. Respond in English.
9. Output ONLY valid JSON matching the requested schema. No markdown, no extra text.`;

interface Payload {
  mode: "pattern" | "reflection" | "plan" | "trend";
  payload: Record<string, unknown>;
}

const buildPrompt = (mode: string, p: Record<string, unknown>): string => {
  if (mode === "pattern") {
    return `The user just completed their daily check-in.

Their Oriental Archetype (a reflective lifestyle framework, not medical): ${p.archetypeName ?? "not set"} — ${p.archetypeTagline ?? ""}
Today they feel: ${p.feeling}
Today they say they need: ${p.need}
Recent check-ins (most recent first): ${JSON.stringify(p.recent ?? [])}

Write a personalised "pattern reading" for today. Notice trends across recent days if any (e.g. several tired days in a row).

Return JSON with exactly these keys:
{
  "patternName": "evocative 2-3 word name for today's pattern, nature-inspired",
  "reading": "2-3 warm personal sentences about their current pattern, referencing their archetype and recent trend if relevant",
  "traditional": "2-3 sentences: how traditional Chinese wellness frameworks might see this pattern, clearly framed as a traditional perspective",
  "modern": "2-3 sentences: what modern behavioural/health science says about related lifestyle factors",
  "experiment": "one specific low-risk experiment for TODAY, one sentence, tailored to their stated need"
}`;
  }

  if (mode === "reflection") {
    return `The user wrote a reflection in their wellness journal.

Context: ${p.context}
Their reflection: "${p.text}"

Write ONE warm, brief response (1-2 sentences). Acknowledge what they noticed, and optionally end with one gentle question that deepens their curiosity. Do not give advice unless they asked. Do not use exclamation marks excessively.

Return JSON: { "response": "your 1-2 sentence response" }`;
  }

  if (mode === "trend") {
    return `You are drafting a new limited-time Challenge for the app, inspired by a trend the editorial team spotted on Chinese social media.

Trend title: ${p.title}
Platform: ${p.platform || "Chinese social media"}
Editor notes: ${p.notes || "none"}

Design a gentle, low-risk lifestyle challenge (3-7 days) that translates this trend for Western users. Daily tasks must be everyday actions (walks, warm drinks, screen-free time, slow meals, gentle movement, rest). The "inspiration" field MUST mention the platform, describe it as a contemporary interpretation of the trend, and state it is not medical advice.

Return JSON with exactly these keys:
{
  "title": "catchy challenge name",
  "emoji": "one emoji",
  "durationDays": 3-7,
  "tag": "2-4 word category tag",
  "summary": "1-2 sentence appealing description",
  "inspiration": "1-2 sentences: source platform, contemporary interpretation, not medical advice",
  "days": [ { "day": 1, "title": "short title", "task": "one-sentence task" }, ... one per day, length equals durationDays ],
  "shareText": "2-3 short lines a user would share after completing it, ending with: Oriental Me · 养生"
}`;
  }

  // plan
  return `Create a personalised 7-day Yangsheng plan for this user.

Their Oriental Archetype: ${p.archetypeName ?? "not set"} — ${p.archetypeTagline ?? ""}
Wake/sleep rhythm: ${p.rhythm}
Daily life: ${p.work}
Movement preference: ${p.movement}
Food habits: ${p.food}
Main goal: ${p.goal}
Extra notes: ${p.notes || "none"}

Design 7 days. Each day has a theme and four small moments. Keep every item SHORT (max 12 words), practical, low-risk, and inspired by everyday Yangsheng culture (warm water, slow walks, tea, seasonal food, wind-down, brief rests). Progress gently across the week. Tailor to their goal and rhythm.

Return JSON with exactly these keys:
{
  "title": "short evocative plan title",
  "intro": "1-2 sentences introducing the plan, personal to their goal",
  "days": [
    { "day": 1, "theme": "short theme", "morning": "...", "food": "...", "movement": "...", "evening": "..." },
    ... exactly 7 days
  ]
}`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[ai-yangsheng] missing auth header");
      return json({ error: "unauthorized" });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) {
      console.error("[ai-yangsheng] invalid token");
      return json({ error: "unauthorized" });
    }

    const { mode, payload } = (await req.json()) as Payload;
    if (!["pattern", "reflection", "plan", "trend"].includes(mode)) {
      return json({ error: "bad_mode" });
    }
    console.log("[ai-yangsheng] request", { userId: user.id, mode });

    const admin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: profileRow } = await admin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    const isAdmin = !!profileRow?.is_admin;

    if (mode === "trend" && !isAdmin) {
      console.error("[ai-yangsheng] non-admin trend request", {
        userId: user.id,
      });
      return json({ error: "forbidden" });
    }

    const today = new Date().toISOString().slice(0, 10);
    let used = 0;
    if (!isAdmin) {
      const { count } = await admin
        .from("ai_usage")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("date", today);

      used = count ?? 0;
      if (used >= DAILY_LIMIT) {
        console.log("[ai-yangsheng] daily limit reached", { userId: user.id });
        return json({ error: "limit_reached", remaining: 0 });
      }
    }

    const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!apiKey) {
      console.error("[ai-yangsheng] DEEPSEEK_API_KEY not configured");
      return json({ error: "missing_key" });
    }

    const aiRes = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildPrompt(mode, payload ?? {}) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.9,
        max_tokens: 4000,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("[ai-yangsheng] deepseek error", {
        status: aiRes.status,
        errText: errText.slice(0, 500),
      });
      return json({ error: "ai_failed" });
    }

    const aiData = await aiRes.json();
    const text: string | undefined = aiData?.choices?.[0]?.message?.content;
    if (!text) {
      console.error("[ai-yangsheng] empty deepseek response");
      return json({ error: "ai_failed" });
    }

    let result: unknown;
    try {
      result = JSON.parse(text);
    } catch {
      console.error("[ai-yangsheng] deepseek returned non-JSON", {
        text: text.slice(0, 300),
      });
      return json({ error: "ai_failed" });
    }

    if (!isAdmin) {
      await admin
        .from("ai_usage")
        .insert({ user_id: user.id, date: today, action: mode });
    }

    console.log("[ai-yangsheng] success", { userId: user.id, mode });
    return json({
      result,
      remaining: isAdmin ? DAILY_LIMIT : DAILY_LIMIT - used - 1,
    });
  } catch (e) {
    console.error("[ai-yangsheng] unexpected error", { message: String(e) });
    return json({ error: "unexpected" });
  }
});
