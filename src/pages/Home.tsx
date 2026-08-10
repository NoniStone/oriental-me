import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CheckIn, { readPattern } from "@/components/CheckIn";
import RitualCard from "@/components/RitualCard";
import TwoLenses from "@/components/TwoLenses";
import SeasonBanner from "@/components/SeasonBanner";
import { useAuth } from "@/components/auth/AuthProvider";
import { getArchetype } from "@/data/archetypes";
import { fetchRituals } from "@/lib/content";
import {
  fetchProfile,
  fetchTodayCheckIn,
  saveCheckInCloud,
} from "@/lib/cloud";
import { invokeAgent } from "@/lib/v2";
import { dayOfYear, todayKey, type CheckIn as CheckInType } from "@/lib/storage";
import { Sparkles } from "lucide-react";
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

  const { data: ritualList = [] } = useQuery({
    queryKey: ["rituals"],
    queryFn: fetchRituals,
  });


  const checkIn = localCheckIn ?? cloudCheckIn ?? null;
  const archetype = getArchetype(profile?.archetype_id ?? undefined);
  const reading = cloudCheckIn?.ai_reading ?? null;

  const requestReading = async (c: CheckInType) => {
    if (!user) return;
    setAiLoading(true);
    setAiNote(null);
    try {
      await invokeAgent("daily", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, feeling: c.feeling, need: c.need });
      queryClient.invalidateQueries({ queryKey: ["daily-recommendation"] });
    } catch {
      setAiNote("Your Journey could not be prepared just now — please try again shortly.");
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
              ✨ Your companion is connecting today with what it knows about you…
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
          </div>
        )}
      </section>

      <JourneyToday />

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

    </div>
  );
};

export default Home;
