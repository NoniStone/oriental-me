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
  Field,
  SeasonSelect,
  StatusBadge,
  StatusSelect,
} from "@/components/admin/shared";
import {
  adminFetchDiscoveries,
  upsertDiscovery,
  deleteDiscovery,
  type Discovery,
} from "@/lib/content";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyDiscovery = (): Discovery => ({
  id: crypto.randomUUID(),
  question: "",
  traditional: "",
  modern: "",
  experiment: "",
  reflectPrompt: "",
  season: null,
  status: "draft",
});

const DiscoveriesManager = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Discovery | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ["admin-discoveries"],
    queryFn: adminFetchDiscoveries,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-discoveries"] });
    queryClient.invalidateQueries({ queryKey: ["discoveries"] });
  };

  const save = async () => {
    if (!editing || !editing.question.trim()) return;
    setSaving(true);
    try {
      await upsertDiscovery(editing);
      invalidate();
      setEditing(null);
      toast.success("Discovery saved");
    } catch {
      toast.error("Couldn't save — please try again");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this discovery permanently?")) return;
    try {
      await deleteDiscovery(id);
      invalidate();
      toast.success("Discovery deleted");
    } catch {
      toast.error("Couldn't delete — please try again");
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={() => setEditing(emptyDiscovery())}
        className="rounded-full"
        size="sm"
      >
        <Plus className="mr-1 h-4 w-4" />
        New discovery
      </Button>

      {items.map((d) => (
        <div key={d.id} className="paper-card flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={d.status} />
              {d.season && (
                <span className="text-[11px] text-muted-foreground">
                  {d.season}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate font-display text-base font-semibold">
              {d.question}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setEditing(d)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-destructive"
            onClick={() => remove(d.id)}
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
                    ? "Edit discovery"
                    : "New discovery"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Field label="Question">
                  <Input
                    className="rounded-xl"
                    placeholder="Why does…?"
                    value={editing.question}
                    onChange={(e) =>
                      setEditing({ ...editing, question: e.target.value })
                    }
                  />
                </Field>
                <Field label="🌿 Traditional Lens">
                  <Textarea
                    className="min-h-24 rounded-xl"
                    value={editing.traditional}
                    onChange={(e) =>
                      setEditing({ ...editing, traditional: e.target.value })
                    }
                  />
                </Field>
                <Field label="🔬 Modern Lens">
                  <Textarea
                    className="min-h-24 rounded-xl"
                    value={editing.modern}
                    onChange={(e) =>
                      setEditing({ ...editing, modern: e.target.value })
                    }
                  />
                </Field>
                <Field label="🧪 Experiment">
                  <Textarea
                    className="rounded-xl"
                    value={editing.experiment}
                    onChange={(e) =>
                      setEditing({ ...editing, experiment: e.target.value })
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
                  disabled={saving || !editing.question.trim()}
                  className="w-full rounded-full"
                >
                  {saving ? "Saving…" : "Save discovery"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiscoveriesManager;
