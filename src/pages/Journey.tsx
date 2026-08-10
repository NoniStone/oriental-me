import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import RitualCard from "@/components/RitualCard";
import TwoLenses from "@/components/TwoLenses";
import { useAuth } from "@/components/auth/AuthProvider";
import { getArchetype } from "@/data/archetypes";
import { fetchRituals } from "@/lib/content";
import { fetchProfile, fetchReflections, fetchStats } from "@/lib/cloud";
import { Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { JourneyToday } from "@/components/JourneyToday";

const Journey = () => {
  const [params] = useSearchParams();
  const isWelcome = params.get("welcome") === "1";
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => fetchStats(user!.id),
    enabled: !!user,
  });

  const { data: reflections = [] } = useQuery({
    queryKey: ["reflections"],
    queryFn: () => fetchReflections(user!.id, 5),
    enabled: !!user,
  });

  const { data: ritualList = [] } = useQuery({
    queryKey: ["rituals"],
    queryFn: fetchRituals,
  });

  const archetype = getArchetype(profile?.archetype_id ?? undefined);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <img
          src="/assets/logo.png"
          alt=""
          className="h-10 w-10 animate-pulse rounded-full"
        />
      </div>
    );
  }

  if (!archetype) {
    return (
      <div className="paper-card p-8 text-center">
        <p className="text-4xl">🏮</p>
        <h1 className="mt-3 text-2xl font-semibold">Your journey awaits</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Take the two-minute quiz to discover your Oriental Archetype and
          begin building your own rhythm.
        </p>
        <Button asChild className="mt-5 rounded-full">
          <Link to="/quiz">
            <Sparkles className="mr-1 h-4 w-4" />
            Discover your archetype
          </Link>
        </Button>
      </div>
    );
  }

  const statItems = [
    { label: "Check-ins", value: stats?.checkIns ?? 0 },
    { label: "Rituals done", value: stats?.rituals ?? 0 },
    { label: "Reflections", value: stats?.reflections ?? 0 },
    { label: "Challenges", value: stats?.challenges ?? 0 },
  ];

  const shareText = `Apparently I'm a ${archetype.name} ${archetype.emoji}\n\n${archetype.tagline}\n\nOriental Me · 养生`;

  const copyShare = async () => {
    await navigator.clipboard.writeText(shareText);
    toast.success("Share text copied — paste it anywhere");
  };

  return (
    <div className="space-y-8">
      <section className="paper-card overflow-hidden">
        <div className="relative">
          <img
            src={archetype.image}
            alt={`${archetype.name} archetype illustration`}
            className="aspect-[16/9] w-full object-cover"
          />
          {isWelcome && (
            <span className="absolute left-4 top-4 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-foreground animate-fade-in">
              ✨ Your result
            </span>
          )}
        </div>
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Your Oriental Archetype
          </p>
          <h1 className="mt-1 text-3xl font-semibold">
            {archetype.emoji} {archetype.name}
            <span className="ml-2 text-xl font-normal text-muted-foreground">
              {archetype.chinese}
            </span>
          </h1>
          <p className="mt-1 font-display text-base italic text-terracotta">
            {archetype.tagline}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {archetype.description}
          </p>
          <p className="mt-4 rounded-xl bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
            A reflective lifestyle framework inspired by traditional Chinese
            concepts — not a medical constitution or diagnosis.
          </p>
        </div>
      </section>

      <section className="paper-card p-5">
        <h2 className="mb-4 font-display text-lg font-semibold">
          Your pattern, two ways
        </h2>
        <TwoLenses
          traditional={archetype.traditionalLens}
          modern={archetype.modernLens}
        />
      </section>

      <JourneyToday />

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="paper-card p-5">
          <h3 className="mb-3 font-display text-base font-semibold">
            You tend to…
          </h3>
          <ul className="space-y-2">
            {archetype.tendencies.map((t) => (
              <li key={t} className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-primary">·</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="paper-card p-5">
          <h3 className="mb-3 font-display text-base font-semibold">
            Your rhythm needs more…
          </h3>
          <div className="flex flex-wrap gap-2">
            {archetype.needsMore.map((n) => (
              <span
                key={n}
                className="rounded-full bg-secondary px-3.5 py-1.5 text-sm font-medium text-secondary-foreground"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">
          Rituals for your rhythm
        </h2>
        <div className="space-y-3">
          {archetype.ritualIds.map((id) => {
            const ritual = ritualList.find((r) => r.id === id);
            return ritual ? <RitualCard key={id} ritual={ritual} /> : null;
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">
          Your journey so far
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {statItems.map((s) => (
            <div key={s.label} className="paper-card p-3 text-center">
              <p className="font-display text-2xl font-semibold text-primary">
                {s.value}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {reflections.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">
            Recent reflections
          </h2>
          <div className="space-y-3">
            {reflections.map((r) => (
              <div key={r.id} className="paper-card p-4">
                <p className="text-xs font-medium text-primary">{r.context}</p>
                <p className="mt-1 text-sm leading-relaxed">{r.text}</p>
                {r.ai_response && (
                  <p className="mt-2 rounded-xl bg-jade-soft px-3 py-2 text-sm italic leading-relaxed text-secondary-foreground">
                    🍃 {r.ai_response}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="paper-card overflow-hidden">
        <div className="bg-foreground p-6 text-background">
          <p className="text-xs uppercase tracking-wider opacity-70">
            Share card
          </p>
          <p className="mt-3 font-display text-xl font-semibold leading-snug">
            Apparently I'm a {archetype.name} {archetype.emoji}
          </p>
          <p className="mt-2 text-sm opacity-80">{archetype.tagline}</p>
          <p className="mt-5 text-xs opacity-60">Oriental Me · 养生</p>
        </div>
        <div className="p-4">
          <Button onClick={copyShare} variant="outline" className="w-full rounded-full">
            <Copy className="mr-1.5 h-4 w-4" />
            Copy share text
          </Button>
        </div>
      </section>

      <div className="text-center">
        <Button asChild variant="ghost" className="rounded-full text-muted-foreground">
          <Link to="/quiz">Retake the quiz</Link>
        </Button>
      </div>
    </div>
  );
};

export default Journey;
