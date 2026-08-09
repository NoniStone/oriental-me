export interface QuizOption {
  label: string;
  emoji: string;
  scores: Record<string, number>;
}

export interface QuizQuestion {
  question: string;
  hint?: string;
  options: QuizOption[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    question: "How do you usually arrive into the morning?",
    options: [
      {
        label: "Fast — phone, coffee, straight into it",
        emoji: "⚡",
        scores: { firestarter: 2 },
      },
      {
        label: "It depends entirely on the day",
        emoji: "🌫️",
        scores: { water: 2 },
      },
      {
        label: "Same steady routine, most days",
        emoji: "🍞",
        scores: { grounded: 2 },
      },
      {
        label: "Reluctantly. Mornings are not my time",
        emoji: "🌙",
        scores: { nightmoon: 2 },
      },
    ],
  },
  {
    question: "Where does your energy peak?",
    options: [
      {
        label: "Whenever something exciting is happening",
        emoji: "🔥",
        scores: { firestarter: 2 },
      },
      {
        label: "It comes in waves I can't always predict",
        emoji: "🌊",
        scores: { water: 2 },
      },
      {
        label: "A calm, even level through the day",
        emoji: "🌿",
        scores: { grounded: 2 },
      },
      {
        label: "Late at night, when everything is quiet",
        emoji: "✨",
        scores: { nightmoon: 2 },
      },
    ],
  },
  {
    question: "When life gets stressful, you tend to…",
    options: [
      {
        label: "Speed up and push through",
        emoji: "🏃",
        scores: { firestarter: 2 },
      },
      {
        label: "Absorb it — other people's stress becomes mine",
        emoji: "🫧",
        scores: { water: 2 },
      },
      {
        label: "Hold steady and keep the routine going",
        emoji: "🪨",
        scores: { grounded: 2 },
      },
      {
        label: "Withdraw and think it over alone",
        emoji: "🕯️",
        scores: { nightmoon: 2 },
      },
    ],
  },
  {
    question: "Your ideal evening looks like…",
    options: [
      {
        label: "Out — people, plans, something happening",
        emoji: "🎉",
        scores: { firestarter: 2 },
      },
      {
        label: "Whatever mood I'm in when it arrives",
        emoji: "🎐",
        scores: { water: 2 },
      },
      {
        label: "Home-cooked food and something familiar",
        emoji: "🍲",
        scores: { grounded: 2 },
      },
      {
        label: "Everyone asleep, just me and my thoughts",
        emoji: "🌌",
        scores: { nightmoon: 2 },
      },
    ],
  },
  {
    question: "Which of these quietly appeals to you most?",
    hint: "Trust the first pull.",
    options: [
      {
        label: "Morning tai chi in a misty park",
        emoji: "🥋",
        scores: { grounded: 1, water: 1 },
      },
      {
        label: "A slow tea ceremony, no phones",
        emoji: "🍵",
        scores: { water: 1, nightmoon: 1 },
      },
      {
        label: "Dancing in a public square at sunset",
        emoji: "💃",
        scores: { firestarter: 1, grounded: 1 },
      },
      {
        label: "A moonlit walk through old streets",
        emoji: "🏮",
        scores: { nightmoon: 1, firestarter: 1 },
      },
    ],
  },
  {
    question: "Right now, what do you feel you need more of?",
    options: [
      {
        label: "Recovery — I'm running hot",
        emoji: "🧊",
        scores: { firestarter: 2 },
      },
      {
        label: "Rhythm — my days lack shape",
        emoji: "🎋",
        scores: { water: 2 },
      },
      {
        label: "Freshness — my routine feels stale",
        emoji: "🌸",
        scores: { grounded: 2 },
      },
      {
        label: "Sleep — my nights are too long awake",
        emoji: "😴",
        scores: { nightmoon: 2 },
      },
    ],
  },
];

export const computeArchetype = (answers: number[]): string => {
  const totals: Record<string, number> = {};
  answers.forEach((optionIndex, questionIndex) => {
    const option = quizQuestions[questionIndex].options[optionIndex];
    for (const [id, score] of Object.entries(option.scores)) {
      totals[id] = (totals[id] ?? 0) + score;
    }
  });
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
};
