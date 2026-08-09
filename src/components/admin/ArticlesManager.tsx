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
  adminFetchArticles,
  upsertArticle,
  deleteArticle,
  type Article,
} from "@/lib/content";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyArticle = (): Article => ({
  id: "",
  type: "daily",
  title: "",
  excerpt: "",
  evidence: "Cultural",
  readMinutes: 3,
  image: null,
  body: [],
  bodyRaw: "",
  source: null,
  season: null,
  status: "draft",
});

const ArticlesManager = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: adminFetchArticles,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    queryClient.invalidateQueries({ queryKey: ["articles"] });
  };

  const save = async () => {
    if (!editing || !editing.title.trim()) return;
    setSaving(true);
    try {
      await upsertArticle(editing);
      invalidate();
      setEditing(null);
      toast.success("Article saved");
    } catch {
      toast.error("Couldn't save — please try again");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this article permanently?")) return;
    try {
      await deleteArticle(id);
      invalidate();
      toast.success("Article deleted");
    } catch {
      toast.error("Couldn't delete — please try again");
    }
  };

  const setSource = (key: string, value: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      source: {
        platform: "",
        creator: "",
        date: "",
        note: "",
        ...editing.source,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={() => setEditing(emptyArticle())}
        className="rounded-full"
        size="sm"
      >
        <Plus className="mr-1 h-4 w-4" />
        New article
      </Button>

      {items.map((a) => (
        <div key={a.id} className="paper-card flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-terracotta">
                {a.type === "pulse" ? "🇨🇳 Pulse" : "Daily"}
              </span>
              <StatusBadge status={a.status} />
              {a.season && (
                <span className="text-[11px] text-muted-foreground">
                  {a.season}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate font-display text-base font-semibold">
              {a.title}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setEditing(a)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-destructive"
            onClick={() => remove(a.id)}
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
                  {editing.id ? "Edit article" : "New article"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Field label="Type">
                  <Select
                    value={editing.type}
                    onValueChange={(v) =>
                      setEditing({ ...editing, type: v as "daily" | "pulse" })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Oriental Me Daily</SelectItem>
                      <SelectItem value="pulse">
                        🇨🇳 China Internet Pulse
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Title">
                  <Input
                    className="rounded-xl"
                    value={editing.title}
                    onChange={(e) =>
                      setEditing({ ...editing, title: e.target.value })
                    }
                  />
                </Field>
                <Field label="Excerpt">
                  <Textarea
                    className="rounded-xl"
                    value={editing.excerpt}
                    onChange={(e) =>
                      setEditing({ ...editing, excerpt: e.target.value })
                    }
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Evidence class">
                    <Select
                      value={editing.evidence}
                      onValueChange={(v) =>
                        setEditing({ ...editing, evidence: v })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cultural">🟢 Cultural</SelectItem>
                        <SelectItem value="Traditional theory">
                          🟡 Traditional theory
                        </SelectItem>
                        <SelectItem value="Wellness practice">
                          🟡 Wellness practice
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Read minutes">
                    <Input
                      type="number"
                      min={1}
                      className="rounded-xl"
                      value={editing.readMinutes}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          readMinutes: Number(e.target.value) || 1,
                        })
                      }
                    />
                  </Field>
                </div>
                <Field label="Image URL (optional)">
                  <Input
                    className="rounded-xl"
                    value={editing.image ?? ""}
                    placeholder="/assets/… or https://…"
                    onChange={(e) =>
                      setEditing({ ...editing, image: e.target.value || null })
                    }
                  />
                </Field>
                <Field label="Body (separate paragraphs with a blank line)">
                  <Textarea
                    className="min-h-48 rounded-xl"
                    value={editing.bodyRaw}
                    onChange={(e) =>
                      setEditing({ ...editing, bodyRaw: e.target.value })
                    }
                  />
                </Field>
                {editing.type === "pulse" && (
                  <div className="space-y-3 rounded-2xl bg-muted/60 p-4">
                    <p className="text-xs font-semibold">
                      Source transparency (required for Pulse)
                    </p>
                    <Field label="Platform">
                      <Input
                        className="rounded-xl bg-card"
                        value={editing.source?.platform ?? ""}
                        placeholder="Xiaohongshu 小红书"
                        onChange={(e) => setSource("platform", e.target.value)}
                      />
                    </Field>
                    <Field label="Creator">
                      <Input
                        className="rounded-xl bg-card"
                        value={editing.source?.creator ?? ""}
                        onChange={(e) => setSource("creator", e.target.value)}
                      />
                    </Field>
                    <Field label="Date">
                      <Input
                        className="rounded-xl bg-card"
                        value={editing.source?.date ?? ""}
                        placeholder="This month"
                        onChange={(e) => setSource("date", e.target.value)}
                      />
                    </Field>
                    <Field label="Editorial note">
                      <Textarea
                        className="rounded-xl bg-card"
                        value={editing.source?.note ?? ""}
                        onChange={(e) => setSource("note", e.target.value)}
                      />
                    </Field>
                  </div>
                )}
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
                  {saving ? "Saving…" : "Save article"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArticlesManager;
