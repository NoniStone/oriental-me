import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CheckIn, { readPattern } from "@/components/CheckIn";
import RitualCard from "@/components/RitualCard";
import TwoLenses from "@/components/TwoLenses";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { getArchetype } from "@/data/archetypes";
import { rituals, getRitual } from "@/data/rituals";
import { getTodaysDiscovery } from "@/data/discoveries";
import { challenges } from "@/data/challenges";
import {
  fetchProfile,
  fetchTodayCheckIn,
  saveCheckInCloud,
} from "@/lib/cloud";
import { dayOfYear, todayKey, type CheckIn as CheckInType } from "@/lib/storage";
import { ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

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

  const checkInMutation = useMutation({
    mutationFn: (c: CheckInType) => saveCheckInCloud(user!.id, c),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkin"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: () => toast.error("Couldn't save your check-in — please try again"),
  });

  const checkIn = localCheckIn ?? cloudCheckIn ?? null;
  const archetype = getArchetype(profile?.archetype_id ?? undefined);
  const day = dayOfYear();

  const todaysRitual = archetype
    ? (getRitual(archetype.ritualIds[day % archetype.ritualIds.length]) ??
      rituals[day % rituals.length])
    : rituals[day % rituals.length];

  const discovery = getTodaysDiscovery(day);
  const featured = challenges.find((c) => c.featured) ?? challenges[0];
  const pattern = checkIn ? readPattern(checkIn) : null;

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

      <section className="paper-card p-5">
        <h2 className="mb-1 font-display text-lg font-semibold">
          Your current rhythm
        </h2>
        {pattern ? (
          <div className="animate-fade-up">
            <p className="mt-2 inline-block rounded-full bg-primary px-3.5 py-1 text-sm font-semibold text-primary-foreground">
              {pattern.name}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {pattern.reading}
            </p>
          </div>
        ) : checkInLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="mt-3">
            <CheckIn onComplete={handleCheckIn} />
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold">Today's ritual</h2>
          <span className="text-xs text-muted-foreground">
            chosen for your rhythm
          </span>
        </div>
        <RitualCard ritual={todaysRitual} highlight />
      </section>

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
