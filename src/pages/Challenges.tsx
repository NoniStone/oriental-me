import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/auth/AuthProvider";
import { challenges } from "@/data/challenges";
import { fetchChallengeProgressAll } from "@/lib/cloud";
import { ArrowRight } from "lucide-react";

const Challenges = () => {
  const { user } = useAuth();
  const featured = challenges.find((c) => c.featured) ?? challenges[0];
  const rest = challenges.filter((c) => c.id !== featured.id);

  const { data: progressRows = [] } = useQuery({
    queryKey: ["challenges-progress"],
    queryFn: () => fetchChallengeProgressAll(user!.id),
    enabled: !!user,
  });

  const progressFor = (id: string, total: number) => {
    const row = progressRows.find((r) => r.challenge_id === id);
    return row ? Math.round((row.days_done.length / total) * 100) : null;
  };

  const featuredProgress = progressFor(featured.id, featured.durationDays);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Challenges</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Limited-time experiments inspired by Chinese lifestyle culture. Try
          something. Notice what changes.
        </p>
      </section>

      <Link
        to={`/challenges/${featured.id}`}
        className="paper-card block overflow-hidden transition-transform hover:-translate-y-0.5"
      >
        <div className="bg-primary p-6 text-primary-foreground">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
            {featured.tag}
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold">
            {featured.emoji} {featured.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed opacity-90">
            {featured.summary}
          </p>
          {featuredProgress !== null ? (
            <div className="mt-4">
              <Progress
                value={featuredProgress}
                className="h-2 bg-primary-foreground/20"
              />
              <p className="mt-1.5 text-xs opacity-90">
                {featuredProgress}% complete — keep going
              </p>
            </div>
          ) : (
            <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-3.5 py-1.5 text-xs font-semibold">
              {featured.durationDays} days · Join now
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </Link>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">More experiments</h2>
        {rest.map((challenge) => {
          const progress = progressFor(challenge.id, challenge.durationDays);
          return (
            <Link
              key={challenge.id}
              to={`/challenges/${challenge.id}`}
              className="paper-card flex items-start gap-4 p-5 transition-transform hover:-translate-y-0.5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-2xl">
                {challenge.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-terracotta">
                  {challenge.tag} · {challenge.durationDays} days
                </p>
                <h3 className="font-display text-lg font-semibold">
                  {challenge.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {challenge.summary}
                </p>
                {progress !== null && (
                  <Progress value={progress} className="mt-3 h-1.5" />
                )}
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
};

export default Challenges;
