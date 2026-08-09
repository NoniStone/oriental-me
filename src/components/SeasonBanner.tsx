import { useState } from "react";
import { getCurrentSeason, seasonInfo } from "@/lib/season";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SeasonBanner = () => {
  const [open, setOpen] = useState(false);
  const season = seasonInfo[getCurrentSeason()];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="paper-card overflow-hidden">
        <CollapsibleTrigger className="flex w-full items-center gap-4 p-5 text-left">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-2xl">
            {season.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-terracotta">
              Seasonal Yangsheng
            </p>
            <h2 className="font-display text-lg font-semibold">
              The season of {season.name}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {season.chinese}
              </span>
            </h2>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 px-5 pb-5">
            <div className="rounded-2xl bg-jade-soft p-4">
              <p className="mb-1.5 text-sm font-semibold text-primary">
                🌿 Traditional Lens
              </p>
              <p className="text-sm leading-relaxed text-secondary-foreground">
                {season.traditional}
              </p>
            </div>
            <div className="rounded-2xl bg-[hsl(38_45%_92%)] p-4">
              <p className="mb-1.5 text-sm font-semibold text-[hsl(28_50%_32%)]">
                🔬 Modern Lens
              </p>
              <p className="text-sm leading-relaxed text-[hsl(28_30%_25%)]">
                {season.modern}
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default SeasonBanner;
