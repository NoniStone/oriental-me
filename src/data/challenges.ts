export interface ChallengeDay {
  day: number;
  title: string;
  task: string;
}

export interface Challenge {
  id: string;
  title: string;
  emoji: string;
  durationDays: number;
  tag: string;
  featured?: boolean;
  summary: string;
  inspiration: string;
  days: ChallengeDay[];
  shareText: string;
}

export const challenges: Challenge[] = [
  {
    id: "grandpa-reset",
    title: "The Grandpa Reset",
    emoji: "🍵",
    durationDays: 7,
    tag: "Challenge of the Week",
    featured: true,
    summary:
      "Seven days of living a little more like a retired Chinese grandpa: slow walks, warm breakfasts, tea, and less midnight scrolling.",
    inspiration:
      "A contemporary interpretation inspired by everyday lifestyle habits shared widely on Chinese social media — slower, active, unhurried routines. It is not a claim about all Chinese people, and not medical advice.",
    days: [
      { day: 1, title: "The First Walk", task: "Take one 10-minute walk at grandpa pace. Hands behind back optional." },
      { day: 2, title: "Morning Movement", task: "Before 10am, do 5 minutes of slow stretching or shoulder rolls." },
      { day: 3, title: "The Slow Breakfast", task: "Eat one warm breakfast sitting down, phone out of reach." },
      { day: 4, title: "Tea Time", task: "Make one pot of tea slowly. Watch it brew. Sip without a screen." },
      { day: 5, title: "Early Lights", task: "Stop scrolling 30 minutes earlier than usual tonight." },
      { day: 6, title: "Outside Hours", task: "Spend 20 unhurried minutes outdoors — park bench energy." },
      { day: 7, title: "The Reflection", task: "Write three things that felt different this week." },
    ],
    shareText:
      "I just finished The Grandpa Reset 🍵 — 7 days of slow walks, warm breakfasts and tea rituals. Turns out the grandpas were right.\n\nOriental Me · 养生",
  },
  {
    id: "digital-sunset-3",
    title: "3-Day Digital Sunset",
    emoji: "🌇",
    durationDays: 3,
    tag: "Sleep & Rhythm",
    summary:
      "Three nights of putting screens below the horizon 30 minutes before bed. Small experiment, honest results.",
    inspiration:
      "Inspired by traditional Chinese emphasis on quiet evenings, paired with one of the best-studied modern sleep experiments.",
    days: [
      { day: 1, title: "Set the Horizon", task: "Pick your sunset time. Phone leaves the bedroom 30 minutes before sleep." },
      { day: 2, title: "Fill the Gap", task: "Replace the scroll with something analogue: paper, tea, stretching." },
      { day: 3, title: "Notice", task: "Same again — and note how long it took to fall asleep each night." },
    ],
    shareText:
      "3 nights, no screens before bed 🌇 The Digital Sunset experiment is complete. Noticing things.\n\nOriental Me · 养生",
  },
  {
    id: "warm-mornings-5",
    title: "5 Warm Mornings",
    emoji: "☀️",
    durationDays: 5,
    tag: "Morning Rhythm",
    summary:
      "Five mornings that start with warm water and daylight instead of a cold screen. The most ordinary Yangsheng habit there is.",
    inspiration:
      "Warm water first thing is one of the most universal daily habits across China — a tradition here paired with what light research says about morning rhythm.",
    days: [
      { day: 1, title: "The Warm Cup", task: "Drink warm water slowly before your first coffee or screen." },
      { day: 2, title: "Add Light", task: "Warm water again — this time by a window or outside." },
      { day: 3, title: "Stretch It", task: "Warm water, light, plus 2 minutes of slow reaching overhead." },
      { day: 4, title: "Protect It", task: "Keep the phone away until the cup is finished." },
      { day: 5, title: "Make It Yours", task: "Same ritual — then decide if it stays in your life." },
    ],
    shareText:
      "5 mornings started with warm water and daylight instead of my phone ☀️ Simple. Weirdly effective.\n\nOriental Me · 养生",
  },
];

export const getChallenge = (id: string | undefined) =>
  challenges.find((c) => c.id === id);
