import { supabase } from "@/integrations/supabase/client";
import {
  todayKey,
  isMigrated,
  markMigrated,
  getLocalProfile,
  getLocalCheckIns,
  getLocalRitualDates,
  getLocalReflections,
  getLocalChallenges,
  type CheckIn,
} from "@/lib/storage";

export interface CloudProfile {
  id: string;
  display_name: string | null;
  archetype_id: string | null;
}

export interface CloudReflection {
  id: string;
  context: string;
  text: string;
  created_at: string;
}

export interface CloudChallengeProgress {
  challenge_id: string;
  joined_at: string;
  days_done: number[];
}

export interface Stats {
  checkIns: number;
  rituals: number;
  reflections: number;
  challenges: number;
}

// ---- Profile ----

export const fetchProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, archetype_id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as CloudProfile | null) ?? null;
};

export const saveArchetype = async (
  userId: string,
  archetypeId: string,
  completedAt = new Date().toISOString(),
) => {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    archetype_id: archetypeId,
    archetype_completed_at: completedAt,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
};

// ---- Daily check-ins ----

export const fetchTodayCheckIn = async (
  userId: string,
): Promise<CheckIn | null> => {
  const { data, error } = await supabase
    .from("check_ins")
    .select("feeling, need")
    .eq("user_id", userId)
    .eq("date", todayKey())
    .maybeSingle();
  if (error) throw error;
  return (data as CheckIn | null) ?? null;
};

export const saveCheckInCloud = async (userId: string, checkIn: CheckIn) => {
  const { error } = await supabase
    .from("check_ins")
    .upsert(
      { user_id: userId, date: todayKey(), ...checkIn },
      { onConflict: "user_id,date" },
    );
  if (error) throw error;
};

// ---- Ritual completions ----

export const fetchRitualDoneToday = async (userId: string) => {
  const { data, error } = await supabase
    .from("ritual_completions")
    .select("id")
    .eq("user_id", userId)
    .eq("date", todayKey())
    .maybeSingle();
  if (error) throw error;
  return !!data;
};

export const markRitualDoneCloud = async (userId: string, ritualId: string) => {
  const { error } = await supabase
    .from("ritual_completions")
    .upsert(
      { user_id: userId, date: todayKey(), ritual_id: ritualId },
      { onConflict: "user_id,date" },
    );
  if (error) throw error;
};

// ---- Reflections ----

export const fetchReflections = async (userId: string, limit = 5) => {
  const { data, error } = await supabase
    .from("reflections")
    .select("id, context, text, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as CloudReflection[]) ?? [];
};

export const addReflectionCloud = async (
  userId: string,
  context: string,
  text: string,
) => {
  const { error } = await supabase
    .from("reflections")
    .insert({ user_id: userId, context, text });
  if (error) throw error;
};

// ---- Challenges ----

export const fetchChallengeProgressAll = async (userId: string) => {
  const { data, error } = await supabase
    .from("challenge_progress")
    .select("challenge_id, joined_at, days_done")
    .eq("user_id", userId);
  if (error) throw error;
  return (data as CloudChallengeProgress[]) ?? [];
};

export const fetchChallengeProgress = async (
  userId: string,
  challengeId: string,
) => {
  const { data, error } = await supabase
    .from("challenge_progress")
    .select("challenge_id, joined_at, days_done")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .maybeSingle();
  if (error) throw error;
  return (data as CloudChallengeProgress | null) ?? null;
};

export const joinChallengeCloud = async (
  userId: string,
  challengeId: string,
) => {
  const { error } = await supabase
    .from("challenge_progress")
    .upsert(
      { user_id: userId, challenge_id: challengeId },
      { onConflict: "user_id,challenge_id", ignoreDuplicates: true },
    );
  if (error) throw error;
};

export const setChallengeDays = async (
  userId: string,
  challengeId: string,
  daysDone: number[],
) => {
  const { error } = await supabase
    .from("challenge_progress")
    .update({ days_done: daysDone })
    .eq("user_id", userId)
    .eq("challenge_id", challengeId);
  if (error) throw error;
};

// ---- Stats ----

const countRows = async (table: string, userId: string) => {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw error;
  return count ?? 0;
};

export const fetchStats = async (userId: string): Promise<Stats> => {
  const [checkIns, rituals, reflections, challenges] = await Promise.all([
    countRows("check_ins", userId),
    countRows("ritual_completions", userId),
    countRows("reflections", userId),
    countRows("challenge_progress", userId),
  ]);
  return { checkIns, rituals, reflections, challenges };
};

// ---- One-time migration of pre-account localStorage data ----

export const migrateLocalData = async (userId: string) => {
  if (isMigrated()) return;

  const localProfile = getLocalProfile();
  if (localProfile?.archetypeId) {
    const remote = await fetchProfile(userId);
    if (!remote?.archetype_id) {
      await saveArchetype(
        userId,
        localProfile.archetypeId,
        localProfile.completedAt,
      );
    }
  }

  const checkInRows = Object.entries(getLocalCheckIns()).map(
    ([date, c]) => ({ user_id: userId, date, feeling: c.feeling, need: c.need }),
  );
  if (checkInRows.length > 0) {
    await supabase
      .from("check_ins")
      .upsert(checkInRows, { onConflict: "user_id,date", ignoreDuplicates: true });
  }

  const ritualRows = getLocalRitualDates().map((date) => ({
    user_id: userId,
    date,
  }));
  if (ritualRows.length > 0) {
    await supabase
      .from("ritual_completions")
      .upsert(ritualRows, { onConflict: "user_id,date", ignoreDuplicates: true });
  }

  const reflectionRows = getLocalReflections().map((r) => ({
    user_id: userId,
    context: r.context,
    text: r.text,
    created_at: r.date,
  }));
  if (reflectionRows.length > 0) {
    await supabase.from("reflections").insert(reflectionRows);
  }

  const challengeRows = Object.entries(getLocalChallenges()).map(
    ([challengeId, p]) => ({
      user_id: userId,
      challenge_id: challengeId,
      joined_at: p.joinedAt,
      days_done: p.daysDone,
    }),
  );
  if (challengeRows.length > 0) {
    await supabase.from("challenge_progress").upsert(challengeRows, {
      onConflict: "user_id,challenge_id",
      ignoreDuplicates: true,
    });
  }

  markMigrated();
};
