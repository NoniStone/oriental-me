import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { invokeAgent } from "@/lib/v2";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchRecentCheckIns } from "@/lib/cloud";
import { useQuery } from "@tanstack/react-query";

type Review = { title: string; summary: string; pattern: string; experiment: string };
const WeeklyReview = () => {
  const { user } = useAuth();
  const [review, setReview] = useState<Review | null>(null); const [loading, setLoading] = useState(false);
  const { data: checkIns = [] } = useQuery({ queryKey: ["weekly-checkins"], queryFn: () => fetchRecentCheckIns(user!.id, 7), enabled: !!user });
  const enoughHistory = checkIns.length >= 4;
  const create = async () => { setLoading(true); try { const result = await invokeAgent<Review>("review", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }); if (result.result) setReview(result.result); } finally { setLoading(false); } };
  return <section className="paper-card p-5"><h2 className="font-display text-lg font-semibold">AI Rhythm Review</h2><p className="mt-1 text-sm text-muted-foreground">A weekly reflection on the signals you have chosen to share.</p>{review ? <div className="mt-4 space-y-3"><p className="font-display text-xl font-semibold text-primary">{review.title}</p><p className="text-sm leading-relaxed">{review.summary}</p><p className="rounded-xl bg-jade-soft p-3 text-sm"><b>Pattern noticed · </b>{review.pattern}</p><p className="rounded-xl bg-muted/70 p-3 text-sm"><b>Try next · </b>{review.experiment}</p></div> : <><Button onClick={create} disabled={loading || !enoughHistory} variant="outline" className="mt-4 rounded-full">{loading ? "Reading your week…" : <><Sparkles className="mr-1.5 h-4 w-4" />Create my review</>}</Button>{!enoughHistory && <p className="mt-3 text-xs text-muted-foreground">Check in on at least 4 different days first. You have {checkIns.length}/4 so far — a week needs a little weather.</p>}</>}</section>;
};
export default WeeklyReview;
