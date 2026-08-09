import { useState } from "react";
import { Button } from "@/components/ui/button";
import { saveCheckIn, type CheckIn as CheckInType } from "@/lib/storage";
import { cn } from "@/lib/utils";

const feelings = [
  { id: "energetic", label: "Energetic", emoji: "⚡" },
  { id: "tired", label: "Tired", emoji: "🌫️" },
  { id: "restless", label: "Restless", emoji: "🌀" },
  { id: "calm", label: "Calm", emoji: "🍃" },
  { id: "stressed", label: "Stressed", emoji: "🌩️" },
  { id: "social", label: "Social", emoji: "🎈" },
  { id: "withdrawn", label: "Withdrawn", emoji: "🌙" },
];

const needs = [
  { id: "movement", label: "Movement", emoji: "🚶" },
  { id: "rest", label: "Rest", emoji: "😴" },
  { id: "warmth", label: "Warmth", emoji: "🍵" },
  { id: "food", label: "Food", emoji: "🥣" },
  { id: "quiet", label: "Quiet", emoji: "🤫" },
  { id: "connection", label: "Connection", emoji: "💬" },
];

export const patternNames: Record<string, string> = {
  energetic: "Rising Fire",
  tired: "Low Reserve",
  restless: "Scattered Wind",
  calm: "Steady Flow",
  stressed: "Compressed Spring",
  social: "Outward Tide",
  withdrawn: "Inward Moon",
};

const feelingLines: Record<string, string> = {
  energetic:
    "There's plenty of spark in you today — the question is where you'll direct it.",
  tired:
    "Your reserves are reading low. Today is a day for spending less, not pushing harder.",
  restless:
    "Your energy is moving but not landing. It's looking for a channel, not a critic.",
  calm: "You're arriving in balance — a good day to protect your rhythm rather than fix it.",
  stressed:
    "Something is pressing on you. The traditional instinct here is to soften first, then act.",
  social: "Your energy is flowing outward toward people today. Let it.",
  withdrawn:
    "You're turned inward today. In traditional thinking, that's a season, not a fault.",
};

const needLines: Record<string, string> = {
  movement: "Honour it gently — a slow walk counts more than you'd think.",
  rest: "Give rest before the day takes it from you. Even ten deliberate minutes counts.",
  warmth: "Seek literal warmth: warm food, warm drink, warm light on your face.",
  food: "Feed yourself properly and slowly — nourishment is the day's foundation, not its reward.",
  quiet: "Protect one pocket of silence today, however small.",
  connection: "One real conversation will do more than an hour of feeds.",
};

export const readPattern = (checkIn: CheckInType) => ({
  name: patternNames[checkIn.feeling] ?? "Your Pattern",
  reading: `${feelingLines[checkIn.feeling] ?? ""} ${needLines[checkIn.need] ?? ""}`,
});

const Chip = ({
  selected,
  onClick,
  emoji,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
      selected
        ? "border-primary bg-primary text-primary-foreground shadow-sm"
        : "border-border bg-card hover:border-primary/50",
    )}
  >
    <span>{emoji}</span>
    {label}
  </button>
);

const CheckIn = ({ onComplete }: { onComplete: (c: CheckInType) => void }) => {
  const [feeling, setFeeling] = useState<string | null>(null);
  const [need, setNeed] = useState<string | null>(null);

  const submit = () => {
    if (!feeling || !need) return;
    const checkIn = { feeling, need };
    saveCheckIn(checkIn);
    onComplete(checkIn);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 font-medium">How are you arriving today?</p>
        <div className="flex flex-wrap gap-2">
          {feelings.map((f) => (
            <Chip
              key={f.id}
              selected={feeling === f.id}
              onClick={() => setFeeling(f.id)}
              emoji={f.emoji}
              label={f.label}
            />
          ))}
        </div>
      </div>

      {feeling && (
        <div className="animate-fade-up">
          <p className="mb-3 font-medium">What do you feel you need today?</p>
          <div className="flex flex-wrap gap-2">
            {needs.map((n) => (
              <Chip
                key={n.id}
                selected={need === n.id}
                onClick={() => setNeed(n.id)}
                emoji={n.emoji}
                label={n.label}
              />
            ))}
          </div>
        </div>
      )}

      {feeling && need && (
        <Button onClick={submit} className="w-full rounded-full animate-fade-up">
          Read my pattern
        </Button>
      )}
    </div>
  );
};

export default CheckIn;
