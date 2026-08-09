export interface Archetype {
  id: string;
  name: string;
  emoji: string;
  chinese: string;
  image: string;
  tagline: string;
  description: string;
  traditionalLens: string;
  modernLens: string;
  tendencies: string[];
  needsMore: string[];
  ritualIds: string[];
  color: string;
}

export const archetypes: Archetype[] = [
  {
    id: "firestarter",
    name: "Firestarter",
    emoji: "🔥",
    chinese: "火",
    image: "/assets/archetype-firestarter.png",
    tagline: "Bright, fast, easily lit — and easily burned out.",
    description:
      "You move through the world with intensity. Ideas arrive fast, plans start strong, and stimulation finds you everywhere. Your pattern tends toward high output and low recovery — the flame burns beautifully, but it needs fuel and rest to keep burning.",
    traditionalLens:
      "In traditional Chinese frameworks, Fire (火) is associated with warmth, expression and outward movement — and with the idea that intense activity should be balanced by cooling, quieting practices. This is a reflective framework inspired by the Five Phases, not a medical constitution.",
    modernLens:
      "Behavioural research links sustained high stimulation — caffeine, screens, back-to-back commitments — with reduced sleep quality and slower recovery. Deliberate wind-down periods are one of the most studied lifestyle levers.",
    tendencies: [
      "Sparks projects and conversations easily",
      "Runs on stimulation: coffee, screens, momentum",
      "Evenings often stay as bright as mornings",
      "Rest can feel like losing time",
    ],
    needsMore: ["Cooling rituals", "Evening wind-down", "Slow mornings"],
    ritualIds: ["digital-sunset", "evening-tea", "grandpa-walk"],
    color: "hsl(16 60% 50%)",
  },
  {
    id: "water",
    name: "Water",
    emoji: "🌊",
    chinese: "水",
    image: "/assets/archetype-water.png",
    tagline: "Adaptive and deep — flowing wherever the week pulls you.",
    description:
      "You adapt easily and feel things deeply. Your energy follows the shape of whatever container the day gives it — which is a gift, until the container keeps changing. Your pattern tends toward high sensitivity and low rhythm.",
    traditionalLens:
      "In traditional Chinese frameworks, Water (水) is associated with depth, stillness and storage — the season of winter, and the idea that flowing strength comes from a settled source. This is a reflective framework inspired by the Five Phases, not a medical constitution.",
    modernLens:
      "Modern behavioural science emphasises the stabilising role of consistent anchors — regular wake times, meals and light exposure — especially for people whose schedules and moods vary a lot.",
    tendencies: [
      "Reads rooms and people effortlessly",
      "Schedule and energy shift week to week",
      "Absorbs other people's moods",
      "Deep focus arrives in waves, not on demand",
    ],
    needsMore: ["Daily anchors", "Warmth and routine", "Protected quiet"],
    ritualIds: ["morning-water", "slow-breakfast", "midday-pause"],
    color: "hsl(190 40% 40%)",
  },
  {
    id: "grounded",
    name: "Grounded",
    emoji: "🌿",
    chinese: "土",
    image: "/assets/archetype-grounded.png",
    tagline: "Steady and nourishing — the person others lean on.",
    description:
      "You are the stable centre of your circles: consistent, dependable, comfortable with routine. Your pattern tends toward steadiness with low novelty — the roots are strong, but the branches sometimes forget to reach.",
    traditionalLens:
      "In traditional Chinese frameworks, Earth (土) is associated with nourishment, digestion and the centre — and with the idea that stability supports every other kind of movement. This is a reflective framework inspired by the Five Phases, not a medical constitution.",
    modernLens:
      "Research on wellbeing consistently finds that gentle novelty — new routes, new foods, new environments — supports mood and cognitive flexibility, especially for people with strong routines.",
    tendencies: [
      "Keeps routines others abandon",
      "Comfort and food are love languages",
      "Prefers the familiar path",
      "Change feels heavier than it needs to",
    ],
    needsMore: ["Gentle novelty", "Movement outdoors", "Seasonal variation"],
    ritualIds: ["grandpa-walk", "seasonal-stretch", "evening-tea"],
    color: "hsl(150 30% 36%)",
  },
  {
    id: "nightmoon",
    name: "Night Moon",
    emoji: "🌙",
    chinese: "月",
    image: "/assets/archetype-nightmoon.png",
    tagline: "Reflective and nocturnal — most alive when the world sleeps.",
    description:
      "Your best thinking happens after dark. You are introspective, imaginative and quietly intense — but the late hours borrow energy from the mornings. Your pattern tends toward rich inner life and inverted rhythm.",
    traditionalLens:
      "Traditional Chinese wellness places great emphasis on rhythm — sleeping with the night, rising with the light, and the idea that rest is when the body quietly restores itself. This is a reflective framework inspired by traditional concepts, not a medical assessment.",
    modernLens:
      "Sleep research highlights the influence of light timing on circadian rhythm: morning light advances the body clock, while late-night screens delay it. Small shifts in evening routine are among the best-studied experiments.",
    tendencies: [
      "Second wind arrives at 11pm",
      "Mornings feel like a foreign country",
      "Rich inner world, journals and rabbit holes",
      "Sleep debt quietly accumulates",
    ],
    needsMore: ["Morning light", "Earlier wind-down", "Gentler evenings"],
    ritualIds: ["morning-water", "digital-sunset", "midday-pause"],
    color: "hsl(288 18% 38%)",
  },
];

export const getArchetype = (id: string | undefined) =>
  archetypes.find((a) => a.id === id);
