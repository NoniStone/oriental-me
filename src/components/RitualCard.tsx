import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TwoLenses from "@/components/TwoLenses";
import { isRitualDoneToday, markRitualDone } from "@/lib/storage";
import type { Ritual } from "@/data/rituals";
import { Check, Clock } from "lucide-react";
import { toast } from "sonner";

const RitualCard = ({
  ritual,
  highlight = false,
}: {
  ritual: Ritual;
  highlight?: boolean;
}) => {
  const [done, setDone] = useState(highlight && isRitualDoneToday());

  const complete = () => {
    markRitualDone();
    setDone(true);
    toast.success("Ritual complete — beautifully done 🌿");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="paper-card w-full p-5 text-left transition-transform hover:-translate-y-0.5">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-2xl">
              {ritual.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-semibold">
                  {ritual.title}
                </h3>
                {done && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{ritual.chinese}</p>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                {ritual.intro}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="rounded-full font-normal">
                  {ritual.category}
                </Badge>
                <Badge variant="secondary" className="rounded-full font-normal">
                  <Clock className="mr-1 h-3 w-3" />
                  {ritual.minutes} min
                </Badge>
                <Badge variant="secondary" className="rounded-full font-normal">
                  {ritual.difficulty}
                </Badge>
              </div>
            </div>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-3xl">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-2xl">
            {ritual.emoji} {ritual.title}
            <span className="ml-2 text-base font-normal text-muted-foreground">
              {ritual.chinese}
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            {ritual.intro}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl bg-muted/70 p-4">
            <p className="mb-2 text-sm font-semibold">How it works</p>
            <ol className="space-y-2">
              {ritual.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <TwoLenses
            traditional={ritual.traditionalLens}
            modern={ritual.modernLens}
            reflectPrompt={ritual.reflectPrompt}
            reflectContext={`Ritual · ${ritual.title}`}
          />

          {highlight &&
            (done ? (
              <p className="text-center text-sm font-medium text-primary">
                Completed today ✓
              </p>
            ) : (
              <Button onClick={complete} className="w-full rounded-full">
                Mark today's ritual as done
              </Button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RitualCard;
