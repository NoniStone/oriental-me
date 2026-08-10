import { supabase } from "@/integrations/supabase/client";

export type ProfileIntake = {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  interests: string[];
  wakeTime: string;
  sleepTime: string;
  workRhythm: string;
  consentGiven: boolean;
};

export type DailyTask = {
  id: string;
  title: string;
  detail: string;
  category: "morning" | "food" | "movement" | "evening" | "reflection";
  completed?: boolean;
};

export type DailyRecommendation = {
  id: string;
  date: string;
  headline: string;
  observation: string;
  recommendation: string;
  gentleHumour?: string;
  tasks: DailyTask[];
};

export const localDate = () => new Intl.DateTimeFormat("en-CA").format(new Date());

export const saveProfileIntake = async (userId: string, intake: ProfileIntake) => {
  const { error } = await supabase.from("profile_intakes").upsert({
    user_id: userId,
    birth_date: intake.birthDate || null,
    birth_time: intake.birthTime || null,
    birth_place: intake.birthPlace || null,
    interests: intake.interests,
    wake_time: intake.wakeTime || null,
    sleep_time: intake.sleepTime || null,
    work_rhythm: intake.workRhythm || null,
    consent_given_at: intake.consentGiven ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
};

export const fetchProfileIntake = async (userId: string): Promise<ProfileIntake | null> => {
  const { data, error } = await supabase
    .from("profile_intakes")
    .select("birth_date, birth_time, birth_place, interests, wake_time, sleep_time, work_rhythm, consent_given_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    birthDate: data.birth_date ?? "",
    birthTime: data.birth_time ?? "",
    birthPlace: data.birth_place ?? "",
    interests: data.interests ?? [],
    wakeTime: data.wake_time ?? "",
    sleepTime: data.sleep_time ?? "",
    workRhythm: data.work_rhythm ?? "",
    consentGiven: !!data.consent_given_at,
  };
};

export const invokeAgent = async <T>(
  action: "profile" | "daily" | "feedback",
  payload: Record<string, unknown>,
) => {
  const { data, error } = await supabase.functions.invoke("yangsheng-agent", {
    body: { action, payload },
  });
  if (error) throw error;
  return data as { result?: T; error?: string };
};

export const fetchTodayRecommendation = async (userId: string) => {
  const { data, error } = await supabase
    .from("daily_recommendations")
    .select("id, date, headline, observation, recommendation, gentle_humour, tasks")
    .eq("user_id", userId)
    .eq("date", localDate())
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    date: data.date,
    headline: data.headline,
    observation: data.observation,
    recommendation: data.recommendation,
    gentleHumour: data.gentle_humour,
    tasks: (data.tasks ?? []) as DailyTask[],
  } as DailyRecommendation;
};

export const setTaskCompleted = async (userId: string, taskId: string, completed: boolean) => {
  const { error } = await supabase.from("journey_task_completions").upsert(
    { user_id: userId, task_id: taskId, date: localDate(), completed, completed_at: completed ? new Date().toISOString() : null },
    { onConflict: "user_id,task_id,date" },
  );
  if (error) throw error;
};

export const fetchTodayTaskCompletions = async (userId: string) => {
  const { data, error } = await supabase.from("journey_task_completions")
    .select("task_id, completed")
    .eq("user_id", userId).eq("date", localDate());
  if (error) throw error;
  return new Map((data ?? []).map((row) => [row.task_id, row.completed]));
};
