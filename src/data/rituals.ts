export interface Ritual {
  id: string;
  title: string;
  chinese: string;
  emoji: string;
  category: string;
  minutes: number;
  difficulty: "Gentle" | "Easy" | "Moderate";
  intro: string;
  steps: string[];
  traditionalLens: string;
  modernLens: string;
  reflectPrompt: string;
}

export const rituals: Ritual[] = [
  {
    id: "morning-water",
    title: "Morning Warm Water",
    chinese: "晨起温水",
    emoji: "☀️",
    category: "Morning",
    minutes: 5,
    difficulty: "Gentle",
    intro:
      "Before coffee, before your phone — a cup of warm water, drunk slowly by a window.",
    steps: [
      "Boil water and let it cool until comfortably warm.",
      "Find a window or step outside for natural light.",
      "Drink slowly over 3–5 minutes. No phone.",
      "Notice the first three things you feel in your body.",
    ],
    traditionalLens:
      "Warm water in the morning is one of the most everyday Yangsheng habits in China. Traditional frameworks describe it as gentle on the digestive centre after the stillness of night.",
    modernLens:
      "Morning hydration and early daylight exposure are both well-studied: light in the first hour of waking helps anchor the circadian rhythm that shapes energy and sleep.",
    reflectPrompt: "How did the first ten minutes of your day feel different?",
  },
  {
    id: "evening-tea",
    title: "Evening Tea Ritual",
    chinese: "晚茶",
    emoji: "🍵",
    category: "Evening",
    minutes: 15,
    difficulty: "Easy",
    intro:
      "A deliberate pot of caffeine-free tea — chrysanthemum, jujube or barley — made slowly, as the day closes.",
    steps: [
      "Choose a caffeine-free tea: chrysanthemum, barley, or simply hot water with dried jujube.",
      "Prepare it slowly. Watch the leaves or flowers open.",
      "Sit somewhere soft. Sip without a screen.",
      "Let your mind replay one good moment from the day.",
    ],
    traditionalLens:
      "Tea culture in China is as much about the making as the drinking — a built-in transition ritual. Evening teas are traditionally chosen for their calming, cooling character.",
    modernLens:
      "Behavioural research on wind-down routines suggests that repeated pre-sleep rituals cue the body toward rest, and that warm drinks are a common, effective anchor for them.",
    reflectPrompt: "Did the evening feel like it had an ending tonight?",
  },
  {
    id: "slow-breakfast",
    title: "The Slow Breakfast",
    chinese: "慢早餐",
    emoji: "🥣",
    category: "Food",
    minutes: 20,
    difficulty: "Easy",
    intro:
      "One warm breakfast eaten sitting down, unhurried — congee-style if you like, but anything warm counts.",
    steps: [
      "Prepare something warm: porridge, congee, eggs, warm oats.",
      "Sit down at an actual table.",
      "Eat at half your usual speed. Put the spoon down between bites.",
      "Finish before you look at your phone.",
    ],
    traditionalLens:
      "Traditional Chinese dietary culture treats breakfast as the meal that sets the day's rhythm, and favours warm, cooked foods in the morning over cold ones.",
    modernLens:
      "Eating slowly is linked in research to better satiety signalling, and screen-free meals are associated with more mindful eating patterns.",
    reflectPrompt: "What did you notice about your hunger by mid-morning?",
  },
  {
    id: "grandpa-walk",
    title: "The Grandpa Walk",
    chinese: "饭后百步走",
    emoji: "🚶",
    category: "Movement",
    minutes: 10,
    difficulty: "Gentle",
    intro:
      "A slow, unhurried walk after a meal — hands behind your back optional, but encouraged.",
    steps: [
      "Within 30 minutes of finishing a meal, step outside.",
      "Walk noticeably slower than your commute pace.",
      "No headphones for at least half of it.",
      "Notice five things you'd normally walk past.",
    ],
    traditionalLens:
      "The saying 饭后百步走 — \"a hundred steps after a meal\" — is a classic piece of everyday Yangsheng, associated with gentle digestion and unhurried living.",
    modernLens:
      "Short post-meal walks are one of the better-studied light activities: research links them with steadier post-meal blood sugar and improved digestion comfort.",
    reflectPrompt: "What did you see on the walk that you'd never noticed?",
  },
  {
    id: "digital-sunset",
    title: "Digital Sunset",
    chinese: "落屏",
    emoji: "🌇",
    category: "Mind",
    minutes: 30,
    difficulty: "Moderate",
    intro:
      "Screens set below the horizon 30 minutes before bed. The scroll can wait until sunrise.",
    steps: [
      "Choose your 'sunset time' — 30 minutes before your target sleep time.",
      "Put the phone somewhere that isn't your bedside.",
      "Fill the gap with something analogue: paper, tea, stretching, staring pleasantly at nothing.",
      "In the morning, note when you actually fell asleep.",
    ],
    traditionalLens:
      "Traditional Chinese wellness treats the hours before midnight as the most valuable for rest, and evening as a time for quieting rather than stimulating the senses.",
    modernLens:
      "Evening screen light and stimulating content are consistently associated with delayed sleep onset. A 30-minute buffer is one of the most commonly recommended sleep experiments.",
    reflectPrompt: "Was falling asleep any different tonight?",
  },
  {
    id: "seasonal-stretch",
    title: "Eight Movements",
    chinese: "八段锦",
    emoji: "🥋",
    category: "Movement",
    minutes: 12,
    difficulty: "Easy",
    intro:
      "A short standing sequence inspired by Ba Duan Jin — slow reaches, gentle turns, deliberate breath.",
    steps: [
      "Stand with feet shoulder-width, knees soft.",
      "Reach both arms slowly overhead, palms up, and breathe in. Lower and breathe out. Repeat 6 times.",
      "Turn your torso gently left and right, letting your arms swing loosely. 10 times.",
      "Roll your shoulders back slowly, then stand still for three breaths before finishing.",
    ],
    traditionalLens:
      "Ba Duan Jin (八段锦) is a centuries-old sequence of gentle movements, practised in parks across China every morning. Tradition emphasises slowness and breath over effort.",
    modernLens:
      "Gentle movement breaks are well supported by research on sedentary behaviour: brief mobility work improves circulation and is linked with better mood and focus.",
    reflectPrompt: "Where in your body did you feel it most?",
  },
  {
    id: "midday-pause",
    title: "The Midday Pause",
    chinese: "小憩",
    emoji: "😌",
    category: "Rest",
    minutes: 10,
    difficulty: "Gentle",
    intro:
      "Ten minutes of deliberate nothing after lunch — eyes closed, or gazing out a window.",
    steps: [
      "After lunch, find a spot where nobody needs you.",
      "Set a 10-minute timer, then close your eyes or watch the sky.",
      "Don't try to nap or meditate. Just stop inputting.",
      "When the timer ends, stand up slowly.",
    ],
    traditionalLens:
      "The midday rest (小憩) is a deep-rooted habit in Chinese daily life — offices dim their lights, and pausing after lunch is treated as ordinary good sense rather than laziness.",
    modernLens:
      "Research on ultradian rhythms and brief rest suggests short midday pauses can reduce afternoon fatigue — even without sleeping.",
    reflectPrompt: "How was your energy at 4pm compared to usual?",
  },
];

export const getRitual = (id: string) => rituals.find((r) => r.id === id);
