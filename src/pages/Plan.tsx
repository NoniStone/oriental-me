import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/auth/AuthProvider";
import { getArchetype } from "@/data/archetypes";
import {
  fetchPlan,
  fetchProfile,
  upsertPlan,
  setPlanDaysDone,
} from "@/lib/cloud";
import {
  invokeAi,
  fetchAiRemaining,
  aiErrorMessage,
  type AiPlan,
} from "@/lib/ai";
import { todayKey } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Check, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

const fields: {
  key: string;
  label: string;
  options: { value: string; emoji: string }[];
}[] = [
  {
    key: "rhythm",
    label: "Your natural rhythm",
    options: [
      { value: "Early bird", emoji: "🌅" },
      { value: "Night owl", emoji: "🌙" },
      { value: "Irregular", emoji: "🎲" },
    ],
  },
  {
    key: "work",
    label: "Your days are mostly…",
    options: [
      { value: "Desk work", emoji: "💻" },
      { value: "On my feet", emoji: "🏃" },
      { value: "Studying", emoji: "📚" },
      { value: "Shifts / changing", emoji: "🔄" },
    ],
  },
  {
    key: "movement",
    label: "Movement you actually enjoy",
    options: [
      { value: "Slow walks", emoji: "🚶" },
      { value: "Gym sessions", emoji: "🏋️" },
      { value: "Gentle stretching", emoji: "🧘" },
      { value: "Dancing", emoji: "💃" },
    ],
  },
  {
    key: "food",
    label: "Your food habits",
    options: [
      { value: "Cook at home", emoji: "🍳" },
      { value: "Eat out often", emoji: "🥡" },
      { value: "Sometimes skip meals", emoji: "⏭️" },
      { value: "Irregular", emoji: "🎲" },
    ],
  },
  {
    key: "goal",
    label: "What matters most right now",
    options: [
      { value: "Better sleep", emoji: "😴" },
      { value: "More energy", emoji: "⚡" },
      { value: "Less stress", emoji: "🌿" },
      { value: "A steadier routine", emoji: "📆" },
    ],
  },
];

const dayRows = [
  { key: "morning", emoji: "🌅", label: "Morning" },
  { key: "food", emoji: "🍵", label: "Food" },
  { key: "movement", emoji: "🚶", label: "Movement" },
  { key: "evening", emoji: "🌙", label: "Evening" },
] as const;

const Plan = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);

  const { data: planRow, isLoading } = useQuery({
    queryKey: ["plan"],
    queryFn: () => fetchPlan(user!.id),
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  const { data: aiRemaining } = useQuery({
    queryKey: ["ai-remaining", todayKey()],
    queryFn: () => fetchAiRemaining(user!.id),
    enabled: !!user,
  });

  const archetype = getArchetype(profile?.archetype_id ?? undefined);
  const allChosen = fields.every((f) => inputs[f.key]);

  const startEditing = () => {
    setInputs(planRow?.inputs ?? {});
    setNotes(planRow?.inputs?.notes ?? "");
    setEditing(true);
  };

  const generate = async () => {
    if (!user || !allChosen) return;
    setGenerating(true);
    try {
      const fullInputs = { ...inputs, notes: notes.trim() };
      const res = await invokeAi<AiPlan>("plan", {
        ...fullInputs,
        archetypeName: archetype?.name,
        archetypeTagline: archetype?.tagline,
      });
      queryClient.invalidateQueries({ queryKey: ["ai-remaining"] });
      if (res.result?.days?.length) {
        await upsertPlan(user.id, fullInputs, res.result);
        queryClient.invalidateQueries({ queryKey: ["plan"] });
        setEditing(false);
        toast.success("Your Yangsheng plan is ready 🌿");
      } else {
        toast.error(aiErrorMessage(res.error ?? "unknown"));
      }
    } catch {
      toast.error(aiErrorMessage("unknown"));
    } finally {
      setGenerating(false);
    }
  };

  const toggleDay = async (day: number) => {
    if (!user || !planRow) return;
    const current = planRow.days_done;
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    try {
      await setPlanDaysDone(user.id, next);
      queryClient.invalidateQueries({ queryKey: ["plan"] });
    } catch {
      toast.error("Couldn't save — please try again");
    }
  };

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

  const showForm = editing || !planRow;

  if (showForm) {
    return (
      <div className="space-y-6">
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Personal Yangsheng Plan · 养生计划
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Seven days, shaped around you.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Answer five quick questions and your companion will compose a
            gentle 7-day plan — everyday Yangsheng, fitted to your real life.
            Not a medical programme.
          </p>
        </section>

        {fields.map((field) => (
          <section key={field.key} className="paper-card p-5">
            <p className="mb-3 font-medium">{field.label}</p>
            <div className="flex flex-wrap gap-2">
              {field.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    setInputs((prev) => ({ ...prev, [field.key]: opt.value }))
                  }
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                    inputs[field.key] === opt.value
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card hover:border-primary/50",
                  )}
                >
                  <span>{opt.emoji}</span>
                  {opt.value}
                </button>
              ))}
            </div>
          </section>
        ))}

        <section className="paper-card p-5">
          <p className="mb-3 font-medium">
            Anything else your plan should know?{" "}
            <span className="text-sm font-normal text-muted-foreground">
              (optional)
            </span>
          </p>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. I work late shifts on weekends, I don't drink caffeine…"
            className="min-h-20 rounded-xl bg-card"
          />
        </section>

        <div className="space-y-2">
          <Button
            onClick={generate}
            disabled={!allChosen || generating || (aiRemaining ?? 0) === 0}
            className="w-full rounded-full"
            size="lg"
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            {generating
              ? "Composing your plan…"
              : planRow
                ? "Regenerate my plan"
                : "Create my plan"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {(aiRemaining ?? 0) === 0
              ? "You've used today's AI allowance — it refreshes tomorrow."
              : `Uses 1 of your ${aiRemaining} remaining AI calls today.`}
          </p>
          {editing && planRow && (
            <Button
              variant="ghost"
              className="w-full rounded-full text-muted-foreground"
              onClick={() => setEditing(false)}
            >
              Keep my current plan
            </Button>
          )}
        </div>
      </div>
    );
  }

  const plan = planRow.plan;
  const doneCount = planRow.days_done.length;
  const percent = Math.round((doneCount / 7) * 100);

  return (
    <div className="space-y-6">
      <section className="paper-card overflow-hidden">
        <div className="bg-primary p-6 text-primary-foreground">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
            Personal Yangsheng Plan · 养生计划
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold">
            {plan.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed opacity-90">
            {plan.intro}
          </p>
        </div>
        <div className="p-5">
          <div className="mb-1.5 flex items-baseline justify-between">
            <p className="text-sm font-semibold">{doneCount}/7 days</p>
            <p className="text-xs text-muted-foreground">{percent}%</p>
          </div>
          <Progress value={percent} className="h-2" />
        </div>
      </section>

      <section className="space-y-3">
        {plan.days.map((d) => {
          const done = planRow.days_done.includes(d.day);
          return (
            <div
              key={d.day}
              className={cn(
                "paper-card p-4 transition-colors",
                done && "border-primary/50 bg-jade-soft",
              )}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleDay(d.day)}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : d.day}
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
                    Day {d.day}
                  </p>
                  <h3 className="font-display text-base font-semibold">
                    {d.theme}
                  </h3>
                </div>
              </div>
              <div className="mt-3 grid gap-1.5 pl-11">
                {dayRows.map((row) => (
                  <p key={row.key} className="text-sm leading-relaxed">
                    <span className="mr-1.5">{row.emoji}</span>
                    <span className="text-muted-foreground">{row.label}:</span>{" "}
                    {d[row.key]}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <div className="space-y-2">
        <Button
          variant="outline"
          onClick={startEditing}
          className="w-full rounded-full"
        >
          <RefreshCw className="mr-1.5 h-4 w-4" />
          Adjust & regenerate
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Created{" "}
          {new Date(planRow.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
          })}
          . A gentle lifestyle plan — not medical advice.
        </p>
      </div>
    </div>
  );
};

export default Plan;
