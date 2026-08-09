import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/auth/AuthProvider";
import { addReflectionCloud } from "@/lib/cloud";
import { toast } from "sonner";

interface TwoLensesProps {
  traditional: string;
  modern: string;
  experiment?: string;
  reflectPrompt?: string;
  reflectContext?: string;
}

const TwoLenses = ({
  traditional,
  modern,
  experiment,
  reflectPrompt,
  reflectContext = "Reflection",
}: TwoLensesProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveReflection = async () => {
    if (!text.trim() || !user) return;
    setSaving(true);
    try {
      await addReflectionCloud(user.id, reflectContext, text.trim());
      queryClient.invalidateQueries({ queryKey: ["reflections"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setSaved(true);
      setText("");
      toast.success("Reflection saved to your Journey");
    } catch {
      toast.error("Couldn't save your reflection — please try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-jade-soft p-4">
        <p className="mb-1.5 text-sm font-semibold text-primary">
          🌿 Traditional Lens
        </p>
        <p className="text-sm leading-relaxed text-secondary-foreground">
          {traditional}
        </p>
      </div>

      <div className="rounded-2xl bg-[hsl(38_45%_92%)] p-4">
        <p className="mb-1.5 text-sm font-semibold text-[hsl(28_50%_32%)]">
          🔬 Modern Lens
        </p>
        <p className="text-sm leading-relaxed text-[hsl(28_30%_25%)]">
          {modern}
        </p>
      </div>

      {experiment && (
        <div className="rounded-2xl border-2 border-dashed border-terracotta/50 bg-terracotta/5 p-4">
          <p className="mb-1.5 text-sm font-semibold text-terracotta">🧪 Try</p>
          <p className="text-sm leading-relaxed">{experiment}</p>
        </div>
      )}

      {reflectPrompt && (
        <div className="rounded-2xl bg-muted/70 p-4">
          <p className="mb-1.5 text-sm font-semibold">✍️ Reflect</p>
          <p className="mb-3 text-sm text-muted-foreground">{reflectPrompt}</p>
          {saved ? (
            <p className="text-sm font-medium text-primary">
              Saved to your Journey ✓
            </p>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What did you notice?"
                className="min-h-20 rounded-xl bg-card"
              />
              <Button
                size="sm"
                onClick={saveReflection}
                disabled={!text.trim() || saving}
                className="rounded-full"
              >
                {saving ? "Saving…" : "Save reflection"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TwoLenses;
