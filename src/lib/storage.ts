export interface Profile {
  archetypeId: string;
  completedAt: string;
}

export interface CheckIn {
  feeling: string;
  need: string;
}

export interface Reflection {
  date: string;
  context: string;
  text: string;
}

export interface ChallengeProgress {
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

const write = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const todayKey = () => new Date().toISOString().slice(0, 10);

export const dayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
};

// Profile
export const getProfile = () => read<Profile>("om.profile");
export const saveProfile = (archetypeId: string) =>
  write("om.profile", { archetypeId, completedAt: new Date().toISOString() });
export const clearProfile = () => localStorage.removeItem("om.profile");

// Daily check-ins
export const getCheckIns = () =>
  read<Record<string, CheckIn>>("om.checkins") ?? {};
export const getTodayCheckIn = (): CheckIn | null =>
  getCheckIns()[todayKey()] ?? null;
export const saveCheckIn = (checkIn: CheckIn) => {
  const all = getCheckIns();
  all[todayKey()] = checkIn;
  write("om.checkins", all);
};

// Rituals done
export const getRitualsDone = () => read<string[]>("om.rituals") ?? [];
export const isRitualDoneToday = () => getRitualsDone().includes(todayKey());
export const markRitualDone = () => {
  const all = getRitualsDone();
  if (!all.includes(todayKey())) write("om.rituals", [...all, todayKey()]);
};

// Reflections
export const getReflections = () => read<Reflection[]>("om.reflections") ?? [];
export const addReflection = (context: string, text: string) => {
  const all = getReflections();
  write("om.reflections", [
    { date: new Date().toISOString(), context, text },
    ...all,
  ]);
};

// Challenges
export const getChallengeState = () =>
  read<Record<string, ChallengeProgress>>("om.challenges") ?? {};
export const getChallengeProgress = (id: string): ChallengeProgress | null =>
  getChallengeState()[id] ?? null;
export const joinChallenge = (id: string) => {
  const all = getChallengeState();
  if (!all[id]) {
    all[id] = { joinedAt: new Date().toISOString(), daysDone: [] };
    write("om.challenges", all);
  }
};
export const toggleChallengeDay = (id: string, day: number) => {
  const all = getChallengeState();
  const progress = all[id];
  if (!progress) return;
  progress.daysDone = progress.daysDone.includes(day)
    ? progress.daysDone.filter((d) => d !== day)
    : [...progress.daysDone, day];
  write("om.challenges", all);
};
