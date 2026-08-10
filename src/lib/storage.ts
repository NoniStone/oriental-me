// Legacy localStorage layer — now only used for date helpers and
// one-time migration of pre-account data into Supabase.

export interface LocalProfile {
  archetypeId: string;
  completedAt: string;
}

export interface CheckIn {
  feeling: string;
  need: string;
}

export interface LocalReflection {
  date: string;
  context: string;
  text: string;
}

export interface LocalChallengeProgress {
  joinedAt: string;
  daysDone: number[];
}

const read = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

// A "daily" product should follow the user's calendar, not UTC midnight.
export const todayKey = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

export const dayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
};

export const getLocalProfile = () => read<LocalProfile>("om.profile");
export const getLocalCheckIns = () =>
  read<Record<string, CheckIn>>("om.checkins") ?? {};
export const getLocalRitualDates = () => read<string[]>("om.rituals") ?? [];
export const getLocalReflections = () =>
  read<LocalReflection[]>("om.reflections") ?? [];
export const getLocalChallenges = () =>
  read<Record<string, LocalChallengeProgress>>("om.challenges") ?? {};

export const isMigrated = () => localStorage.getItem("om.migrated") === "1";
export const markMigrated = () => localStorage.setItem("om.migrated", "1");
