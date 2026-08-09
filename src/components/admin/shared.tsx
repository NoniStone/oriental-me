import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Season } from "@/lib/season";
import type { ContentStatus } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </Label>
    {children}
  </div>
);

export const StatusBadge = ({ status }: { status: ContentStatus }) => (
  <span
    className={cn(
      "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
      status === "published"
        ? "bg-jade-soft text-primary"
        : "bg-[hsl(42_60%_88%)] text-[hsl(30_55%_32%)]",
    )}
  >
    {status === "published" ? "● Published" : "○ Draft"}
  </span>
);

export const SeasonSelect = ({
  value,
  onChange,
}: {
  value: Season | null;
  onChange: (s: Season | null) => void;
}) => (
  <Select
    value={value ?? "all"}
    onValueChange={(v) => onChange(v === "all" ? null : (v as Season))}
  >
    <SelectTrigger className="rounded-xl">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All seasons</SelectItem>
      <SelectItem value="spring">🌸 Spring only</SelectItem>
      <SelectItem value="summer">☀️ Summer only</SelectItem>
      <SelectItem value="autumn">🍂 Autumn only</SelectItem>
      <SelectItem value="winter">❄️ Winter only</SelectItem>
    </SelectContent>
  </Select>
);

export const StatusSelect = ({
  value,
  onChange,
}: {
  value: ContentStatus;
  onChange: (s: ContentStatus) => void;
}) => (
  <Select value={value} onValueChange={(v) => onChange(v as ContentStatus)}>
    <SelectTrigger className="rounded-xl">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="draft">○ Draft (hidden from users)</SelectItem>
      <SelectItem value="published">● Published (live)</SelectItem>
    </SelectContent>
  </Select>
);
