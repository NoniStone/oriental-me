import { supabase } from "@/integrations/supabase/client";
import { todayKey } from "@/lib/storage";

export const AI_DAILY_LIMIT = 3;

export interface AiPatternReading {
  patternName: string;
  reading: string;
  traditional: string;
  modern: string;
  experiment: string;
}

export interface AiPlanDay {
  day: number;
  theme: string;
  morning: string;
  food: string;
  movement: string;
  evening: string;
}

export interface AiPlan {
  title: string;
  intro: string;
  days: AiPlanDay[];
}

interface AiResponse<T> {
  result?: T;
  remaining?: number;
  error?: string;
}

export const invokeAi = async <T>(
  mode: "pattern" | "reflection" | "plan" | "trend",
  payload: Record<string, unknown>,
): Promise<AiResponse<T>> => {
  const { data, error } = await supabase.functions.invoke("ai-yangsheng", {
    body: { mode, payload },
  });
  if (error) return { error: "network" };
  return data as AiResponse<T>;
};

export const fetchAiRemaining = async (userId: string) => {
  const { count, error } = await supabase
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("date", todayKey());
  if (error) return AI_DAILY_LIMIT;
  return Math.max(0, AI_DAILY_LIMIT - (count ?? 0));
};

export const aiErrorMessage = (error: string) => {
  switch (error) {
    case "limit_reached":
      return "You've used today's AI readings — they refresh tomorrow.";
    case "missing_key":
      return "AI isn't configured yet — the DEEPSEEK_API_KEY secret is missing.";
    default:
      return "The AI couldn't respond just now — please try again.";
  }
};
