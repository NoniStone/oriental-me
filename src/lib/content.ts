import { supabase } from "@/integrations/supabase/client";
import { getCurrentSeason, type Season } from "@/lib/season";

export type ContentStatus = "draft" | "published";

// ---------- Types ----------

export interface Ritual {
  id: string;
  title: string;
  chinese: string;
  emoji: string;
  category: string;
  minutes: number;
  difficulty: string;
  intro: string;
  steps: string[];
  traditionalLens: string;
  modernLens: string;
  reflectPrompt: string;
  season: Season | null;
  status: ContentStatus;
}

export interface ChallengeDay {
  day: number;
  title: string;
  task: string;
}

export interface Challenge {
  id: string;
  title: string;
  emoji: string;
  durationDays: number;
  tag: string;
  featured: boolean;
  summary: string;
  inspiration: string;
  days: ChallengeDay[];
  shareText: string;
  season: Season | null;
  status: ContentStatus;
}

export interface ArticleSource {
  platform: string;
  creator: string;
  date: string;
  note: string;
}

export interface Article {
  id: string;
  type: "daily" | "pulse";
  title: string;
  excerpt: string;
  evidence: string;
  readMinutes: number;
  image: string | null;
  body: string[];
  bodyRaw: string;
  source: ArticleSource | null;
  season: Season | null;
  status: ContentStatus;
}

export interface Discovery {
  id: string;
  question: string;
  traditional: string;
  modern: string;
  experiment: string;
  reflectPrompt: string;
  season: Season | null;
  status: ContentStatus;
}

// ---------- Row mappers ----------

/* eslint-disable @typescript-eslint/no-explicit-any */

const mapRitual = (r: any): Ritual => ({
  id: r.id,
  title: r.title,
  chinese: r.chinese,
  emoji: r.emoji,
  category: r.category,
  minutes: r.minutes,
  difficulty: r.difficulty,
  intro: r.intro,
  steps: (r.steps as string[]) ?? [],
  traditionalLens: r.traditional_lens,
  modernLens: r.modern_lens,
  reflectPrompt: r.reflect_prompt,
  season: r.season,
  status: r.status,
});

const mapChallenge = (r: any): Challenge => ({
  id: r.id,
  title: r.title,
  emoji: r.emoji,
  durationDays: r.duration_days,
  tag: r.tag,
  featured: r.featured,
  summary: r.summary,
  inspiration: r.inspiration,
  days: (r.days as ChallengeDay[]) ?? [],
  shareText: r.share_text,
  season: r.season,
  status: r.status,
});

const mapArticle = (r: any): Article => ({
  id: r.id,
  type: r.type,
  title: r.title,
  excerpt: r.excerpt,
  evidence: r.evidence,
  readMinutes: r.read_minutes,
  image: r.image_url,
  bodyRaw: r.body,
  body: (r.body as string)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean),
  source: r.source_platform
    ? {
        platform: r.source_platform,
        creator: r.source_creator ?? "",
        date: r.source_date ?? "",
        note: r.source_note ?? "",
      }
    : null,
  season: r.season,
  status: r.status,
});

const mapDiscovery = (r: any): Discovery => ({
  id: r.id,
  question: r.question,
  traditional: r.traditional,
  modern: r.modern,
  experiment: r.experiment,
  reflectPrompt: r.reflect_prompt,
  season: r.season,
  status: r.status,
});

/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------- User-facing fetchers (published + in-season only) ----------

const inSeason = `season.is.null,season.eq.${getCurrentSeason()}`;

export const fetchRituals = async (): Promise<Ritual[]> => {
  const { data, error } = await supabase
    .from("rituals")
    .select("*")
    .eq("status", "published")
    .or(inSeason)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRitual);
};

export const fetchChallenges = async (): Promise<Challenge[]> => {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("status", "published")
    .or(inSeason)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapChallenge);
};

export const fetchChallengeById = async (
  id: string,
): Promise<Challenge | null> => {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapChallenge(data) : null;
};

export const fetchArticles = async (): Promise<Article[]> => {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .or(inSeason)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapArticle);
};

export const fetchDiscoveries = async (): Promise<Discovery[]> => {
  const { data, error } = await supabase
    .from("discoveries")
    .select("*")
    .eq("status", "published")
    .or(inSeason)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapDiscovery);
};

// ---------- Admin fetchers (everything incl. drafts) ----------

export const adminFetchRituals = async (): Promise<Ritual[]> => {
  const { data, error } = await supabase
    .from("rituals")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRitual);
};

export const adminFetchChallenges = async (): Promise<Challenge[]> => {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapChallenge);
};

export const adminFetchArticles = async (): Promise<Article[]> => {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapArticle);
};

export const adminFetchDiscoveries = async (): Promise<Discovery[]> => {
  const { data, error } = await supabase
    .from("discoveries")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapDiscovery);
};

// ---------- Admin mutations ----------

export const upsertRitual = async (r: Ritual) => {
  const { error } = await supabase.from("rituals").upsert({
    id: r.id,
    title: r.title,
    chinese: r.chinese,
    emoji: r.emoji,
    category: r.category,
    minutes: r.minutes,
    difficulty: r.difficulty,
    intro: r.intro,
    steps: r.steps,
    traditional_lens: r.traditionalLens,
    modern_lens: r.modernLens,
    reflect_prompt: r.reflectPrompt,
    season: r.season,
    status: r.status,
  });
  if (error) throw error;
};

export const deleteRitual = async (id: string) => {
  const { error } = await supabase.from("rituals").delete().eq("id", id);
  if (error) throw error;
};

export const upsertChallenge = async (c: Challenge) => {
  if (c.featured) {
    await supabase.from("challenges").update({ featured: false }).neq("id", c.id);
  }
  const { error } = await supabase.from("challenges").upsert({
    id: c.id,
    title: c.title,
    emoji: c.emoji,
    duration_days: c.durationDays,
    tag: c.tag,
    featured: c.featured,
    summary: c.summary,
    inspiration: c.inspiration,
    days: c.days,
    share_text: c.shareText,
    season: c.season,
    status: c.status,
  });
  if (error) throw error;
};

export const deleteChallenge = async (id: string) => {
  const { error } = await supabase.from("challenges").delete().eq("id", id);
  if (error) throw error;
};

export const upsertArticle = async (a: Article) => {
  const row = {
    type: a.type,
    title: a.title,
    excerpt: a.excerpt,
    evidence: a.evidence,
    read_minutes: a.readMinutes,
    image_url: a.image || null,
    body: a.bodyRaw,
    source_platform: a.source?.platform || null,
    source_creator: a.source?.creator || null,
    source_date: a.source?.date || null,
    source_note: a.source?.note || null,
    season: a.season,
    status: a.status,
    updated_at: new Date().toISOString(),
  };
  const { error } = a.id
    ? await supabase.from("articles").update(row).eq("id", a.id)
    : await supabase.from("articles").insert(row);
  if (error) throw error;
};

export const deleteArticle = async (id: string) => {
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) throw error;
};

export const upsertDiscovery = async (d: Discovery) => {
  const { error } = await supabase.from("discoveries").upsert({
    id: d.id,
    question: d.question,
    traditional: d.traditional,
    modern: d.modern,
    experiment: d.experiment,
    reflect_prompt: d.reflectPrompt,
    season: d.season,
    status: d.status,
  });
  if (error) throw error;
};

export const deleteDiscovery = async (id: string) => {
  const { error } = await supabase.from("discoveries").delete().eq("id", id);
  if (error) throw error;
};

// ---------- Trend Radar ----------

export interface Trend {
  id: string;
  title: string;
  sourcePlatform: string;
  sourceUrl: string | null;
  notes: string;
  status: "idea" | "drafted" | "published" | "archived";
  draft: Partial<Challenge> | null;
  createdAt: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const mapTrend = (r: any): Trend => ({
  id: r.id,
  title: r.title,
  sourcePlatform: r.source_platform,
  sourceUrl: r.source_url,
  notes: r.notes,
  status: r.status,
  draft: r.draft,
  createdAt: r.created_at,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

export const adminFetchTrends = async (): Promise<Trend[]> => {
  const { data, error } = await supabase
    .from("trends")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTrend);
};

export const addTrend = async (
  title: string,
  sourcePlatform: string,
  sourceUrl: string,
  notes: string,
) => {
  const { error } = await supabase.from("trends").insert({
    title,
    source_platform: sourcePlatform,
    source_url: sourceUrl || null,
    notes,
  });
  if (error) throw error;
};

export const updateTrend = async (
  id: string,
  fields: { status?: string; draft?: unknown },
) => {
  const { error } = await supabase.from("trends").update(fields).eq("id", id);
  if (error) throw error;
};

export const deleteTrend = async (id: string) => {
  const { error } = await supabase.from("trends").delete().eq("id", id);
  if (error) throw error;
};
