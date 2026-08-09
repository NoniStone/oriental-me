import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Cultural: "bg-jade-soft text-primary",
  "Traditional theory": "bg-[hsl(42_60%_88%)] text-[hsl(30_55%_32%)]",
  "Wellness practice": "bg-[hsl(42_60%_88%)] text-[hsl(30_55%_32%)]",
};

const dots: Record<string, string> = {
  Cultural: "🟢",
  "Traditional theory": "🟡",
  "Wellness practice": "🟡",
};

const EvidenceBadge = ({ evidence }: { evidence: string }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
      styles[evidence] ?? "bg-muted text-muted-foreground",
    )}
  >
    <span className="text-[8px]">{dots[evidence]}</span>
    {evidence}
  </span>
);

export default EvidenceBadge;
