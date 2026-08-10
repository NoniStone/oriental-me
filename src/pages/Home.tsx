import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CheckIn, { readPattern } from "@/components/CheckIn";
import RitualCard from "@/components/RitualCard";
import TwoLenses from "@/components/TwoLenses";
import SeasonBanner from "@/components/SeasonBanner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { getArchetype } from "@/data/archetypes";
import {
  fetchRituals,
  fetchDiscoveries,
  fetchChallenges,
} from "@/lib/content";
import {
  fetchProfile,
  fetchTodayCheckIn,
  fetchRecentCheckIns,
  saveCheckInCloud,
  saveCheckInReading,
} from "@/lib/cloud";
import {
  invokeAi,
  fetchAiRemaining,
  aiErrorMessage,
  type AiPatternReading,
} from "@/lib/ai";
import { dayOfYear, todayKey, type CheckIn as CheckInType } from "@/lib/storage";
import { ArrowRight, Sparkles, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { JourneyToday } from "@/components/JourneyToday";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Home = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localCheckIn, setLocalCheckIn] = useState<CheckInType | null>(null);
  const [aiReading, setAiReading] = useState<AiPatternReading | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  const { data: cloudCheckIn, isLoading: checkInLoading } = useQuery({
    queryKey: ["checkin", todayKey()],
    queryFn: () => fetchTodayCheckIn(user!.id),
    enabled: !!user,
  });

  const { data: aiRemaining } = useQuery({
    queryKey: ["ai-remaining", todayKey()],
    queryFn: () => fetchAiRemaining(user!.id),
    enabled: !!user,
  });

  const { data: ritualList = [] } = useQuery({
    queryKey: ["rituals"],
    queryFn: fetchRituals,
  });

  const { data: discoveryList = [] } = useQuery({
    queryKey: ["discoveries"],
    queryFn: fetchDiscoveries,
  });

  const { data: challengeList = [] } = useQuery({
    queryKey: ["challenges"],
    queryFn: fetchChallenges,
  });

  const checkIn = localCheckIn ?? cloudCheckIn ?? null;
  const archetype = getArchetype(profile?.archetype_id ?? undefined);
  const reading = aiReading ?? cloudCheckIn?.ai_reading ?? null;

  const requestReading = async (c: CheckInType) => {
    if (!user) return;
    setAiLoading(true);
    setAiNote(null);
    try {
      const recent = await fetchRecentCheckIns(user.id, 7);
      const res = await invokeAi<AiPatternReading>("pattern", {
        feeling: c.feeling,
        need: c.need,
        archetypeName: archetype?.name,
        archetypeTagline: archetype?.tagline,
        recent,
      });
      if (res.result) {
        setAiReading(res.result);
        await saveCheckInReading(user.id, res.result);
        queryClient.invalidateQueries({ queryKey: ["checkin"] });
      } else {
        setAiNote(aiErrorMessage(res.error ?? "unknown"));
      }
      queryClient.invalidateQueries({ queryKey: ["ai-remaining"] });
    } catch {
      setAiNote(aiErrorMessage("unknown"));
    } finally {
      setAiLoading(false);
    }
  };

  const checkInMutation = useMutation({
    mutationFn: (c: CheckInType) => saveCheckInCloud(user!.id, c),
    onSuccess: (_data, c) => {
      queryClient.invalidateQueries({ queryKey: ["checkin"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      requestReading(c);
    },
    onError: () => toast.error("Couldn't save your check-in — please try again"),
  });

  const day = dayOfYear();

  const archetypePool = archetype
    ? archetype.ritualIds
        .map((id) => ritualList.find((r) => r.id === id))
        .filter((r): r is NonNullable<typeof r> => !!r)
    : [];
  const ritualPool = archetypePool.length > 0 ? archetypePool : ritualList;
  const todaysRitual =
    ritualPool.length > 0 ? ritualPool[day % ritualPool.length] : null;

  const discovery =
    discoveryList.length > 0 ? discoveryList[day % discoveryList.length] : null;
  const featured =
    challengeList.find((c) => c.featured) ?? challengeList[0] ?? null;
  const staticPattern = checkIn ? readPattern(checkIn) : null;

  const handleCheckIn = (c: CheckInType) => {
    setLocalCheckIn(c);
    checkInMutation.mutate(c);
  };

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {greeting()}.
        </h1>
        {archetype ? (
          <Link
            to="/journey"
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-secondary-foreground"
          >
            {archetype.emoji} {archetype.name} · {archetype.chinese}
          </Link>
        ) : (
          <Link
            to="/quiz"
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-foreground"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Discover your archetype
          </Link>
        )}
      </section>

      <SeasonBanner />

      <section className="paper-card p-5">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">
            Your current rhythm
          </h2>
          {typeof aiRemaining === "number" && (
            <span className="text-[11px] text-muted-foreground">
              ✨ {aiRemaining} AI reading{aiRemaining === 1 ? "" : "s"} left
              today
            </span>
          )}
        </div>

        {checkInLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        ) : !checkIn ? (
          <div className="mt-3">
            <CheckIn onComplete={handleCheckIn} />
          </div>
        ) : aiLoading ? (
          <div className="mt-3 animate-fade-up rounded-2xl bg-jade-soft p-4">
            <p className="text-sm font-medium text-primary">
              ✨ Your companion is reading your pattern…
            </p>
            <div className="mt-3 space-y-2">
              <div className="h-3 w-3/4 animate-pulse rounded-full bg-primary/15" />
              <div className="h-3 w-full animate-pulse rounded-full bg-primary/10" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-primary/15" />
            </div>
          </div>
        ) : reading ? (
          <div className="animate-fade-up space-y-4">
            <div>
              <p className="mt-2 inline-block rounded-full bg-primary px-3.5 py-1 text-sm font-semibold text-primary-foreground">
                ✨ {reading.patternName}
              </p>
              <p className="mt-3 text-sm leading-relaxed">{reading.reading}</p>
            </div>
            <TwoLenses
              traditional={reading.traditional}
              modern={reading.modern}
              experiment={reading.experiment}
            />
          </div>
        ) : (
          <div className="animate-fade-up">
            <p className="mt-2 inline-block rounded-full bg-primary px-3.5 py-1 text-sm font-semibold text-primary-foreground">
              {staticPattern?.name}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {staticPattern?.reading}
            </p>
            {aiNote && (
              <p className="mt-3 rounded-xl bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
                {aiNote}
              </p>
            )}
            {(aiRemaining ?? 0) > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3 rounded-full"
                onClick={() => checkIn && requestReading(checkIn)}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Get your AI reading
              </Button>
            )}
          </div>
        )}
      </section>

      <JourneyToday />

      <section className="paper-card overflow-hidden">
        <Link
          to="/plan"
          className="flex items-center gap-4 p-5 transition-colors hover:bg-jade-soft/50"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary">
            <ScrollText className="h-5 w-5 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold">
              Your Yangsheng Plan
            </h2>
            <p className="text-sm text-muted-foreground">
              A 7-day personal plan, crafted by AI around your rhythm.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      </section>

      {todaysRitual && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">
              Today's ritual
            </h2>
            <span className="text-xs text-muted-foreground">
              chosen for your rhythm
            </span>
          </div>
          <RitualCard ritual={todaysRitual} highlight />
        </section>
      )}

      {discovery && (
        <section>
          <div className="mb-3">
            <h2 className="font-display text-lg font-semibold">
              Today's discovery
            </h2>
            <p className="text-xs text-muted-foreground">
              One question, two lenses
            </p>
          </div>
          <div className="paper-card p-5">
            <h3 className="mb-4 font-display text-xl font-semibold leading-snug">
              {discovery.question}
            </h3>
            <TwoLenses
              traditional={discovery.traditional}
              modern={discovery.modern}
              experiment={discovery.experiment}
              reflectPrompt={discovery.reflectPrompt}
              reflectContext={`Discovery · ${discovery.question}`}
            />
          </div>
        </section>
      )}

      {featured && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">
            Challenge of the week
          </h2>
          <Link
            to={`/challenges/${featured.id}`}
            className="paper-card block overflow-hidden transition-transform hover:-translate-y-0.5"
          >
            <div className="bg-primary p-5 text-primary-foreground">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                {featured.tag}
              </p>
              <h3 className="mt-1 font-display text-2xl font-semibold">
                {featured.emoji} {featured.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed opacity-90">
                {featured.summary}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-3.5 py-1.5 text-xs font-semibold">
                {featured.durationDays} days · Join the challenge
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        </section>
      )}

      <section className="text-center">
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/discover">
            Explore Oriental Me Daily
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
};

export default Home;
