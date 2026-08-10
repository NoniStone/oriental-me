import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { invokeAgent } from "@/lib/v2";

type Review = { title: string; summary: string; pattern: string; experiment: string };
const WeeklyReview = () => {
  const [review, setReview] = useState<Review | null>(null); const [loading, setLoading] = useState(false);
  const create = async () => { setLoading(true); try { const result = await invokeAgent<Review>("review", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }); if (result.result) setReview(result.result); } finally { setLoading(false); } };
  return <section className="paper-card p-5"><h2 className="font-display text-lg font-semibold">AI Rhythm Review</h2><p className="mt-1 text-sm text-muted-foreground">A weekly reflection on the signals you have chosen to share.</p>{review ? <div className="mt-4 space-y-3"><p className="font-display text-xl font-semibold text-primary">{review.title}</p><p className="text-sm leading-relaxed">{review.summary}</p><p className="rounded-xl bg-jade-soft p-3 text-sm"><b>Pattern noticed · </b>{review.pattern}</p><p className="rounded-xl bg-muted/70 p-3 text-sm"><b>Try next · </b>{review.experiment}</p></div> : <Button onClick={create} disabled={loading} variant="outline" className="mt-4 rounded-full">{loading ? "Reading your week…" : <><Sparkles className="mr-1.5 h-4 w-4" />Create my review</>}</Button>}</section>;
};
export default WeeklyReview;
