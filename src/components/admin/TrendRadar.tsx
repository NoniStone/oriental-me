import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/admin/shared";
import {
  adminFetchTrends,
  addTrend,
  updateTrend,
  deleteTrend,
  upsertChallenge,
  type Trend,
  type Challenge,
  type ChallengeDay,
} from "@/lib/content";
import { invokeAi, aiErrorMessage } from "@/lib/ai";
import { cn } from "@/lib/utils";
import { Plus, Radar, Rocket, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

const statusStyle: Record<string, string> = {
  idea: "bg-muted text-muted-foreground",
  drafted: "bg-[hsl(42_60%_88%)] text-[hsl(30_55%_32%)]",
  published: "bg-jade-soft text-primary",
};

const TrendRadar = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    platform: "",
    url: "",
    notes: "",
  });
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: trends = [] } = useQuery({
    queryKey: ["admin-trends"],
    queryFn: adminFetchTrends,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-trends"] });

  const add = async () => {
    if (!form.title.trim()) return;
    try {
      await addTrend(form.title, form.platform, form.url, form.notes);
      setForm({ title: "", platform: "", url: "", notes: "" });
      invalidate();
      toast.success("Trend logged");
    } catch {
      toast.error("Couldn't save — please try again");
    }
  };

  const draftChallenge = async (trend: Trend) => {
    setBusyId(trend.id);
    try {
      const res = await invokeAi<Partial<Challenge>>("trend", {
        title: trend.title,
        platform: trend.sourcePlatform,
        notes: trend.notes,
      });
      if (res.result) {
        await updateTrend(trend.id, { draft: res.result, status: "drafted" });
        invalidate();
        toast.success("AI draft ready — review it below");
      } else {
        toast.error(aiErrorMessage(res.error ?? "unknown"));
      }
    } catch {
      toast.error(aiErrorMessage("unknown"));
    } finally {
      setBusyId(null);
    }
  };

  const publish = async (trend: Trend) => {
    if (!trend.draft) return;
    const d = trend.draft;
    const days = (d.days as ChallengeDay[] | undefined) ?? [];
    if (days.length === 0) {
      toast.error("Draft has no days — regenerate it.");
      return;
    }
    setBusyId(trend.id);
    try {
      await upsertChallenge({
        id: crypto.randomUUID(),
        title: d.title ?? trend.title,
        emoji: d.emoji ?? "🌿",
        durationDays: days.length,
        tag: d.tag ?? "Trend",
        featured: false,
        summary: d.summary ?? "",
        inspiration: d.inspiration ?? "",
        days,
        shareText: d.shareText ?? "",
        season: null,
        status: "draft",
      });
      await updateTrend(trend.id, { status: "published" });
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["admin-challenges"] });
      toast.success(
        "Draft challenge created — edit & publish it in the Challenges tab",
      );
    } catch {
      toast.error("Couldn't create the challenge — please try again");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this trend?")) return;
    try {
      await deleteTrend(id);
      invalidate();
    } catch {
      toast.error("Couldn't delete — please try again");
    }
  };

  return (
    <div className="space-y-5">
      <div className="paper-card space-y-3 p-5">
        <div className="flex items-center gap-2">
          <Radar className="h-4 w-4 text-primary" />
          <h3 className="font-display text-base font-semibold">
            Log a new trend
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Trend title">
            <Input
              className="rounded-xl"
              placeholder="Chinese Grandpa Walk"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Platform">
            <Input
              className="rounded-xl"
              placeholder="Xiaohongshu 小红书"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Source URL (optional)">
          <Input
            className="rounded-xl"
            placeholder="https://…"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
        </Field>
        <Field label="Notes — what is the trend about? Why is it interesting?">
          <Textarea
            className="rounded-xl"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </Field>
        <Button
          onClick={add}
          disabled={!form.title.trim()}
          size="sm"
          className="rounded-full"
        >
          <Plus className="mr-1 h-4 w-4" />
          Log trend
        </Button>
      </div>

      {trends.map((t) => (
        <div key={t.id} className="paper-card space-y-3 p-5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
                    statusStyle[t.status] ?? statusStyle.idea,
                  )}
                >
                  {t.status}
                </span>
                {t.sourcePlatform && (
                  <span className="text-[11px] text-muted-foreground">
                    via {t.sourcePlatform}
                  </span>
                )}
              </div>
              <h3 className="mt-1 font-display text-lg font-semibold">
                {t.title}
              </h3>
              {t.notes && (
                <p className="mt-1 text-sm text-muted-foreground">{t.notes}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-destructive"
              onClick={() => remove(t.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {t.draft && (
            <div className="rounded-2xl bg-muted/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
                AI draft
              </p>
              <p className="mt-1 font-display text-base font-semibold">
                {t.draft.emoji} {t.draft.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.draft.summary}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {(t.draft.days?.length ?? 0)} days · tag: {t.draft.tag}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={busyId === t.id}
              onClick={() => draftChallenge(t)}
            >
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              {busyId === t.id
                ? "Working…"
                : t.draft
                  ? "Redraft with AI"
                  : "Draft challenge with AI"}
            </Button>
            {t.draft && t.status !== "published" && (
              <Button
                size="sm"
                className="rounded-full"
                disabled={busyId === t.id}
                onClick={() => publish(t)}
              >
                <Rocket className="mr-1 h-3.5 w-3.5" />
                Create challenge from draft
              </Button>
            )}
          </div>
        </div>
      ))}

      {trends.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No trends logged yet. Spot something on Chinese social media? Log it
          above.
        </p>
      )}
    </div>
  );
};

export default TrendRadar;
