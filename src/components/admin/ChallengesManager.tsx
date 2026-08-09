import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  SeasonSelect,
  StatusBadge,
  StatusSelect,
} from "@/components/admin/shared";
import {
  adminFetchChallenges,
  upsertChallenge,
  deleteChallenge,
  type Challenge,
} from "@/lib/content";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyChallenge = (): Challenge => ({
  id: crypto.randomUUID(),
  title: "",
  emoji: "🌿",
  durationDays: 7,
  tag: "",
  featured: false,
  summary: "",
  inspiration: "",
  days: [],
  shareText: "",
  season: null,
  status: "draft",
});

const daysToText = (c: Challenge) =>
  c.days.map((d) => `${d.title} | ${d.task}`).join("\n");

const textToDays = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [title, ...rest] = line.split("|");
      return {
        day: i + 1,
        title: title.trim(),
        task: rest.join("|").trim(),
      };
    });

const ChallengesManager = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Challenge | null>(null);
  const [daysText, setDaysText] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ["admin-challenges"],
    queryFn: adminFetchChallenges,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-challenges"] });
    queryClient.invalidateQueries({ queryKey: ["challenges"] });
  };

  const open = (c: Challenge) => {
    setEditing(c);
    setDaysText(daysToText(c));
  };

  const save = async () => {
    if (!editing || !editing.title.trim()) return;
    const days = textToDays(daysText);
    if (days.length === 0) {
      toast.error("Add at least one day (one line per day).");
      return;
    }
    setSaving(true);
    try {
      await upsertChallenge({ ...editing, days, durationDays: days.length });
      invalidate();
      setEditing(null);
      toast.success("Challenge saved");
    } catch {
      toast.error("Couldn't save — please try again");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this challenge permanently?")) return;
    try {
      await deleteChallenge(id);
      invalidate();
      toast.success("Challenge deleted");
    } catch {
      toast.error("Couldn't delete — please try again");
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={() => open(emptyChallenge())}
        className="rounded-full"
        size="sm"
      >
        <Plus className="mr-1 h-4 w-4" />
        New challenge
      </Button>

      {items.map((c) => (
        <div key={c.id} className="paper-card flex items-center gap-3 p-4">
          <span className="text-2xl">{c.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {c.featured && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-terracotta">
                  <Star className="h-3 w-3" /> Week
                </span>
              )}
              <StatusBadge status={c.status} />
              <span className="text-[11px] text-muted-foreground">
                {c.durationDays} days{c.season ? ` · ${c.season}` : ""}
              </span>
            </div>
            <p className="mt-0.5 truncate font-display text-base font-semibold">
              {c.title}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => open(c)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-destructive"
            onClick={() => remove(c.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-3xl">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">
                  {items.some((i) => i.id === editing.id)
                    ? "Edit challenge"
                    : "New challenge"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-[1fr_5rem] gap-3">
                  <Field label="Title">
                    <Input
                      className="rounded-xl"
                      value={editing.title}
                      onChange={(e) =>
                        setEditing({ ...editing, title: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Emoji">
                    <Input
                      className="rounded-xl text-center"
                      value={editing.emoji}
                      onChange={(e) =>
                        setEditing({ ...editing, emoji: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <Field label="Tag">
                  <Input
                    className="rounded-xl"
                    placeholder="Sleep & Rhythm"
                    value={editing.tag}
                    onChange={(e) =>
                      setEditing({ ...editing, tag: e.target.value })
                    }
                  />
                </Field>
                <Field label="Summary">
                  <Textarea
                    className="rounded-xl"
                    value={editing.summary}
                    onChange={(e) =>
                      setEditing({ ...editing, summary: e.target.value })
                    }
                  />
                </Field>
                <Field label="Inspiration / source note">
                  <Textarea
                    className="rounded-xl"
                    value={editing.inspiration}
                    onChange={(e) =>
                      setEditing({ ...editing, inspiration: e.target.value })
                    }
                  />
                </Field>
                <Field label={`Days — one per line: "Title | Task" (${textToDays(daysText).length} days)`}>
                  <Textarea
                    className="min-h-40 rounded-xl font-mono text-xs"
                    placeholder={"The First Walk | Take one 10-minute walk.\nMorning Movement | 5 minutes of stretching."}
                    value={daysText}
                    onChange={(e) => setDaysText(e.target.value)}
                  />
                </Field>
                <Field label="Share text">
                  <Textarea
                    className="rounded-xl"
                    value={editing.shareText}
                    onChange={(e) =>
                      setEditing({ ...editing, shareText: e.target.value })
                    }
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Season">
                    <SeasonSelect
                      value={editing.season}
                      onChange={(s) => setEditing({ ...editing, season: s })}
                    />
                  </Field>
                  <Field label="Status">
                    <StatusSelect
                      value={editing.status}
                      onChange={(s) => setEditing({ ...editing, status: s })}
                    />
                  </Field>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">
                      Challenge of the Week
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Featured on the home page (replaces the current one)
                    </p>
                  </div>
                  <Switch
                    checked={editing.featured}
                    onCheckedChange={(v) =>
                      setEditing({ ...editing, featured: v })
                    }
                  />
                </div>
                <Button
                  onClick={save}
                  disabled={saving || !editing.title.trim()}
                  className="w-full rounded-full"
                >
                  {saving ? "Saving…" : "Save challenge"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChallengesManager;
