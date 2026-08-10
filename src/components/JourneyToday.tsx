import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchTodayRecommendation, fetchTodayTaskCompletions, invokeAgent, setTaskCompleted, type DailyRecommendation } from "@/lib/v2";
import { toast } from "sonner";

export const JourneyToday = () => {
  const { user } = useAuth();
  const client = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const { data: recommendation } = useQuery({ queryKey: ["daily-recommendation"], queryFn: () => fetchTodayRecommendation(user!.id), enabled: !!user });
  const { data: completions = new Map<string, boolean>() } = useQuery({ queryKey: ["journey-task-completions"], queryFn: () => fetchTodayTaskCompletions(user!.id), enabled: !!user && !!recommendation });
  const generate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      await invokeAgent<DailyRecommendation>("daily", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      client.invalidateQueries({ queryKey: ["daily-recommendation"] });
    } catch {
      toast.error("Your Journey could not be prepared just now — please try again shortly.");
    } finally { setGenerating(false); }
  };
  const toggle = async (id: string, completed: boolean) => {
    if (!user) return;
    await setTaskCompleted(user.id, id, !completed);
    client.invalidateQueries({ queryKey: ["journey-task-completions"] });
  };
  if (!recommendation) return <section className="paper-card overflow-hidden"><div className="bg-primary p-5 text-primary-foreground"><p className="text-xs font-semibold uppercase tracking-wider opacity-80">Today with your companion</p><h2 className="mt-1 font-display text-xl font-semibold">One small plan, shaped by your rhythm.</h2></div><div className="p-5"><p className="text-sm text-muted-foreground">After your Current Rhythm check-in, ask your companion to connect today with what it has learned so far.</p><Button onClick={generate} disabled={generating} className="mt-4 w-full rounded-full">{generating ? "Observing your rhythm…" : <><Sparkles className="mr-1.5 h-4 w-4" />Create today’s Journey</>}</Button></div></section>;
  return <section className="paper-card overflow-hidden"><div className="bg-primary p-5 text-primary-foreground"><p className="text-xs font-semibold uppercase tracking-wider opacity-80">Today’s Journey</p><h2 className="mt-1 font-display text-2xl font-semibold">{recommendation.headline}</h2><p className="mt-2 text-sm opacity-90">{recommendation.observation}</p></div><div className="space-y-3 p-5"><p className="text-sm leading-relaxed">{recommendation.recommendation}</p><div className="rounded-xl bg-jade-soft p-3 text-xs leading-relaxed text-secondary-foreground"><span className="font-semibold">Why this, today? </span>Your companion connected today’s rhythm with your profile, recent check-ins, reflections and the tasks you have actually completed.</div>{recommendation.gentleHumour && <p className="rounded-xl bg-muted/70 p-3 text-sm italic text-muted-foreground">{recommendation.gentleHumour}</p>}<div className="space-y-2">{recommendation.tasks.map((task) => { const done = completions.get(task.id) === true; return <button key={task.id} onClick={() => toggle(task.id, done)} className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${done ? "border-primary/50 bg-jade-soft" : "border-border"}`}><span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${done ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{done && <Check className="h-3.5 w-3.5" />}</span><span><span className="block text-xs font-semibold uppercase tracking-wide text-terracotta">{task.category}</span><span className="font-medium">{task.title}</span><span className="mt-0.5 block text-sm text-muted-foreground">{task.detail}</span></span></button>; })}</div></div></section>;
};
