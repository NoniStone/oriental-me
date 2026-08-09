import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchChallengeById } from "@/lib/content";
import {
  fetchChallengeProgress,
  joinChallengeCloud,
  setChallengeDays,
} from "@/lib/cloud";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, Copy, PartyPopper } from "lucide-react";
import { toast } from "sonner";

const ChallengeDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: challenge = null, isLoading: challengeLoading } = useQuery({
    queryKey: ["challenge-content", id],
    queryFn: () => fetchChallengeById(id!),
    enabled: !!id,
  });

  const { data: progress = null, isLoading } = useQuery({
    queryKey: ["challenge", id],
    queryFn: () => fetchChallengeProgress(user!.id, id!),
    enabled: !!user && !!challenge,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["challenge", id] });
    queryClient.invalidateQueries({ queryKey: ["challenges-progress"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  };

  const joinMutation = useMutation({
    mutationFn: () => joinChallengeCloud(user!.id, challenge!.id),
    onSuccess: () => {
      invalidate();
      toast.success(`You've joined ${challenge!.title} ${challenge!.emoji}`);
    },
    onError: () => toast.error("Couldn't join — please try again"),
  });

  const toggleMutation = useMutation({
    mutationFn: (day: number) => {
      const current = progress?.days_done ?? [];
      const next = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day];
      return setChallengeDays(user!.id, challenge!.id, next);
    },
    onSuccess: invalidate,
    onError: () => toast.error("Couldn't save — please try again"),
  });

  if (challengeLoading) {
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

  if (!challenge) {
    return (
      <div className="paper-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Challenge not found.</p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link to="/challenges">Back to challenges</Link>
        </Button>
      </div>
    );
  }

  const doneCount = progress?.days_done.length ?? 0;
  const percent = Math.round((doneCount / challenge.durationDays) * 100);
  const completed = doneCount === challenge.durationDays;

  const copyShare = async () => {
    await navigator.clipboard.writeText(challenge.shareText);
    toast.success("Share text copied — paste it anywhere");
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 rounded-full">
        <Link to="/challenges">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Challenges
        </Link>
      </Button>

      <section className="paper-card overflow-hidden">
        <div className="bg-primary p-6 text-primary-foreground">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
            {challenge.tag} · {challenge.durationDays} days
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold">
            {challenge.emoji} {challenge.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed opacity-90">
            {challenge.summary}
          </p>
        </div>
        <div className="p-5">
          {progress ? (
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <p className="text-sm font-semibold">
                  {doneCount}/{challenge.durationDays} days
                </p>
                <p className="text-xs text-muted-foreground">{percent}%</p>
              </div>
              <Progress value={percent} className="h-2" />
            </div>
          ) : (
            <Button
              onClick={() => joinMutation.mutate()}
              disabled={isLoading || joinMutation.isPending}
              className="w-full rounded-full"
            >
              {joinMutation.isPending ? "Joining…" : "Join this challenge"}
            </Button>
          )}
        </div>
      </section>

      {completed && (
        <section className="paper-card border-primary/40 p-6 text-center animate-fade-up">
          <PartyPopper className="mx-auto h-8 w-8 text-terracotta" />
          <h2 className="mt-2 font-display text-xl font-semibold">
            Challenge complete!
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Small experiments, finished. Tell a friend what you noticed —
            curiosity is contagious.
          </p>
          <Button onClick={copyShare} className="mt-4 rounded-full">
            <Copy className="mr-1.5 h-4 w-4" />
            Copy share text
          </Button>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">The days</h2>
        {challenge.days.map((day) => {
          const done = progress?.days_done.includes(day.day) ?? false;
          return (
            <button
              key={day.day}
              disabled={!progress || toggleMutation.isPending}
              onClick={() => toggleMutation.mutate(day.day)}
              className={cn(
                "paper-card flex w-full items-start gap-4 p-4 text-left transition-all",
                progress && "hover:-translate-y-0.5",
                !progress && "opacity-70",
                done && "border-primary/50 bg-jade-soft",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : day.day}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
                  Day {day.day}
                </p>
                <h3 className="font-display text-base font-semibold">
                  {day.title}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {day.task}
                </p>
              </div>
            </button>
          );
        })}
        {!progress && !isLoading && (
          <p className="text-center text-xs text-muted-foreground">
            Join the challenge to start checking off days.
          </p>
        )}
      </section>

      <section className="rounded-2xl bg-muted/70 p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold">Where this comes from · </span>
          {challenge.inspiration}
        </p>
      </section>
    </div>
  );
};

export default ChallengeDetail;
