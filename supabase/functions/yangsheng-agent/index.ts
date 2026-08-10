import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const DAILY_AI_LIMIT = 3;
const trim = (value: unknown, limit = 900) => String(value ?? "").slice(0, limit);

const system = `You are Oriental Me's Yangsheng Agent: calm, intelligent, observant, interactive, lightly humorous and culturally grounded. You are a cultural interpreter, never a doctor. Never diagnose, prescribe, discuss medication or claim TCM theory is scientifically proven. Only offer low-risk everyday experiments. Write concise English. Return only valid JSON.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) return json({ error: "unauthorized" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const client = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authorization } } });
    const { data: { user } } = await client.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { action, payload = {} } = await req.json();
    if (!['profile','daily','feedback','reflection','review'].includes(action)) return json({ error: "bad_action" }, 400);
    if (!payload || typeof payload !== "object" || JSON.stringify(payload).length > 6000) return json({ error: "payload_too_large" }, 413);
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: String(payload.timeZone || 'UTC') }).format(new Date());
    if (action === 'daily') {
      const { data: existing } = await admin.from('daily_recommendations').select('*').eq('user_id', user.id).eq('date', today).maybeSingle();
      if (existing) return json({ result: existing, reused: true });
    }
    const [{ data: profile }, { data: intake }, { data: memory }, { data: checkins }, { data: reflections }, { data: completions }] = await Promise.all([
      admin.from('profiles').select('display_name, archetype_id').eq('id', user.id).maybeSingle(),
      admin.from('profile_intakes').select('birth_date,birth_time,birth_place,interests,wake_time,sleep_time,work_rhythm,consent_given_at').eq('user_id', user.id).maybeSingle(),
      admin.from('ai_memory_items').select('kind,content,confidence').eq('user_id', user.id).or('expires_at.is.null,expires_at.gt.now()').order('updated_at', { ascending: false }).limit(30),
      admin.from('check_ins').select('date,feeling,need').eq('user_id', user.id).order('date', { ascending: false }).limit(14),
      admin.from('reflections').select('context,text,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(8),
      admin.from('journey_task_completions').select('task_id,date,completed').eq('user_id', user.id).order('date', { ascending: false }).limit(30),
    ]);
    const context = {
      profile,
      // Optional personal context only leaves Supabase after explicit consent.
      intake: intake?.consent_given_at ? intake : null,
      memory: (memory ?? []).map((item) => ({ ...item, content: trim(item.content, 360) })),
      recentCheckins: checkins,
      recentReflections: (reflections ?? []).map((item) => ({ ...item, text: trim(item.text, 900) })),
      recentTaskCompletions: completions,
      current: payload,
    };
    if (action === 'review' && (checkins?.length ?? 0) < 4) return json({ error: 'insufficient_history' }, 422);
    const { count, error: usageError } = await admin.from('ai_usage').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('date', today);
    if (usageError) return json({ error: 'usage_unavailable' }, 503);
    if ((count ?? 0) >= DAILY_AI_LIMIT) return json({ error: 'limit_reached' }, 429);
    const { error: reserveError } = await admin.from('ai_usage').insert({ user_id: user.id, date: today, action });
    if (reserveError) return json({ error: 'usage_unavailable' }, 503);
    const requested = action === 'daily'
      ? `Using this unified user context, create today's recommendation. Return {"headline":"...","observation":"...","recommendation":"...","gentleHumour":"...","tasks":[{"id":"short-slug","title":"...","detail":"...","category":"morning|food|movement|evening|reflection"}]}. Make exactly 3 practical tasks. Context: ${JSON.stringify(context)}`
      : action === 'reflection'
      ? `Respond to the user's reflection warmly in 1-2 sentences, then extract up to 2 durable non-medical memories. Return {"response":"...","memories":[{"kind":"reflection|preference|pattern","content":"...","confidence":0.0}]}. Context: ${JSON.stringify(context)}`
      : action === 'review'
      ? `Create a concise personal weekly rhythm review from this unified context. Return {"title":"...","summary":"2-3 sentences","pattern":"one observed non-medical pattern","experiment":"one gentle experiment for next week"}. Context: ${JSON.stringify(context)}`
      : `Extract only durable, useful, non-medical personalization facts from this context. Return {"memories":[{"kind":"profile|pattern|preference|reflection|completion","content":"...","confidence":0.0}]}. Do not repeat sensitive birth details. Context: ${JSON.stringify(context)}`;
    const ai = await fetch('https://api.deepseek.com/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}` }, body: JSON.stringify({ model: 'deepseek-chat', response_format: { type: 'json_object' }, temperature: 0.65, max_tokens: 900, messages: [{ role: 'system', content: system }, { role: 'user', content: requested }] }) });
    if (!ai.ok) return json({ error: 'ai_failed' }, 502);
    const parsed = JSON.parse((await ai.json()).choices?.[0]?.message?.content || '{}');
    if (action === 'daily') {
      const tasks = Array.isArray(parsed.tasks) ? parsed.tasks.slice(0, 3).map((task) => ({ id: trim(task?.id, 80), title: trim(task?.title, 120), detail: trim(task?.detail, 360), category: task?.category })) : [];
      if (tasks.length !== 3 || tasks.some((task) => !task.id || !task.title || !task.detail || !['morning', 'food', 'movement', 'evening', 'reflection'].includes(task.category))) return json({ error: 'invalid_ai_response' }, 502);
      const row = { user_id: user.id, date: today, headline: trim(parsed.headline, 160), observation: trim(parsed.observation, 700), recommendation: trim(parsed.recommendation, 900), gentle_humour: trim(parsed.gentleHumour, 280) || null, tasks, context_version: 'v2-agent-1' };
      const { data, error } = await admin.from('daily_recommendations').insert(row).select().single();
      if (error?.code === '23505') {
        const { data: existing, error: existingError } = await admin.from('daily_recommendations').select('*').eq('user_id', user.id).eq('date', today).single();
        if (!existingError && existing) return json({ result: existing, reused: true });
      }
      if (error) return json({ error: 'save_failed' }, 500);
      return json({ result: data });
    }
    if (action === 'reflection' && (!parsed.response || typeof parsed.response !== 'string')) return json({ error: 'invalid_ai_response' }, 502);
    const memories = Array.isArray(parsed.memories) ? parsed.memories.slice(0, 5).filter((memory) => ['profile', 'pattern', 'preference', 'reflection', 'completion'].includes(memory?.kind) && typeof memory?.content === 'string').map((memory) => ({ ...memory, content: trim(memory.content, 360), confidence: Math.min(1, Math.max(0, Number(memory.confidence) || 0.7)) })) : [];
    if (memories.length) await admin.from('ai_memory_items').insert(memories.map((m: { kind: string; content: string; confidence: number }) => ({ user_id: user.id, kind: m.kind, content: m.content, confidence: m.confidence, source: action })));
    return json({ result: action === 'reflection' ? { response: parsed.response, saved: memories.length } : action === 'review' ? parsed : { saved: memories.length } });
  } catch (error) { console.error(error); return json({ error: 'unexpected' }, 500); }
});
