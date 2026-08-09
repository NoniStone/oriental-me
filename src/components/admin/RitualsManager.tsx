import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  SeasonSelect,
  StatusBadge,
  StatusSelect,
} from "@/components/admin/shared";
import {
  adminFetchRituals,
  upsertRitual,
  deleteRitual,
  type Ritual,
} from "@/lib/content";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyRitual = (): Ritual => ({
  id: crypto.randomUUID(),
  title: "",
  chinese: "",
  emoji: "🌿",
  category: "Morning",
  minutes: 10,
  difficulty: "Gentle",
  intro: "",
  steps: [],
  traditionalLens: "",
  modernLens: "",
  reflectPrompt: "",
  season: null,
  status: "draft",
});

const RitualsManager = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Ritual | null>(null);
  const [stepsText, setStepsText] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ["admin-rituals"],
    queryFn: adminFetchRituals,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-rituals"] });
    queryClient.invalidateQueries({ queryKey: ["rituals"] });
  };

  const open = (r: Ritual) => {
    setEditing(r);
    setStepsText(r.steps.join("\n"));
  };

  const save = async () => {
    if (!editing || !editing.title.trim()) return;
    const steps = stepsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setSaving(true);
    try {
      await upsertRitual({ ...editing, steps });
      invalidate();
      setEditing(null);
      toast.success("Ritual saved");
    } catch {
      toast.error("Couldn't save — please try again");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this ritual permanently?")) return;
    try {
      await deleteRitual(id);
      invalidate();
      toast.success("Ritual deleted");
    } catch {
      toast.error("Couldn't delete — please try again");
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={() => open(emptyRitual())}
        className="rounded-full"
        size="sm"
      >
        <Plus className="mr-1 h-4 w-4" />
        New ritual
      </Button>

      {items.map((r) => (
        <div key={r.id} className="paper-card flex items-center gap-3 p-4">
          <span className="text-2xl">{r.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={r.status} />
              <span className="text-[11px] text-muted-foreground">
                {r.category} · {r.minutes} min
                {r.season ? ` · ${r.season}` : ""}
              </span>
            </div>
            <p className="mt-0.5 truncate font-display text-base font-semibold">
              {r.title}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {r.chinese}
              </span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => open(r)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-destructive"
            onClick={() => remove(r.id)}
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
                    ? "Edit ritual"
                    : "New ritual"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-[1fr_6rem_5rem] gap-3">
                  <Field label="Title">
                    <Input
                      className="rounded-xl"
                      value={editing.title}
                      onChange={(e) =>
                        setEditing({ ...editing, title: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Chinese">
                    <Input
                      className="rounded-xl"
                      value={editing.chinese}
                      onChange={(e) =>
                        setEditing({ ...editing, chinese: e.target.value })
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
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Category">
                    <Select
                      value={editing.category}
                      onValueChange={(v) =>
                        setEditing({ ...editing, category: v })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Morning",
                          "Evening",
                          "Food",
                          "Movement",
                          "Mind",
                          "Rest",
                          "Seasonal",
                          "Social",
                        ].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Minutes">
                    <Input
                      type="number"
                      min={1}
                      className="rounded-xl"
                      value={editing.minutes}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          minutes: Number(e.target.value) || 1,
                        })
                      }
                    />
                  </Field>
                  <Field label="Difficulty">
                    <Select
                      value={editing.difficulty}
                      onValueChange={(v) =>
                        setEditing({ ...editing, difficulty: v })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gentle">Gentle</SelectItem>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Intro">
                  <Textarea
                    className="rounded-xl"
                    value={editing.intro}
                    onChange={(e) =>
                      setEditing({ ...editing, intro: e.target.value })
                    }
                  />
                </Field>
                <Field label="Steps (one per line)">
                  <Textarea
                    className="min-h-32 rounded-xl"
                    value={stepsText}
                    onChange={(e) => setStepsText(e.target.value)}
                  />
                </Field>
                <Field label="🌿 Traditional Lens">
                  <Textarea
                    className="rounded-xl"
                    value={editing.traditionalLens}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        traditionalLens: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="🔬 Modern Lens">
                  <Textarea
                    className="rounded-xl"
                    value={editing.modernLens}
                    onChange={(e) =>
                      setEditing({ ...editing, modernLens: e.target.value })
                    }
                  />
                </Field>
                <Field label="✍️ Reflect prompt">
                  <Input
                    className="rounded-xl"
                    value={editing.reflectPrompt}
                    onChange={(e) =>
                      setEditing({ ...editing, reflectPrompt: e.target.value })
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
                <Button
                  onClick={save}
                  disabled={saving || !editing.title.trim()}
                  className="w-full rounded-full"
                >
                  {saving ? "Saving…" : "Save ritual"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RitualsManager;
