export interface Discovery {
  id: string;
  question: string;
  traditional: string;
  modern: string;
  experiment: string;
  reflectPrompt: string;
}

export const discoveries: Discovery[] = [
  {
    id: "exhausted",
    question: "Why do I feel exhausted even after sleeping?",
    traditional:
      "Traditional Chinese wellness would ask not just how long you slept, but how you spent your energy across the whole day. In Yangsheng thinking, constant stimulation without quiet moments \"spends\" more than the night can restore — recovery is a rhythm, not a single event.",
    modern:
      "Modern sleep science distinguishes sleep duration from sleep quality and circadian alignment. Late light, caffeine after noon, and high evening arousal can all leave a full night feeling strangely empty.",
    experiment:
      "For the next 3 evenings, move one stimulating habit (scrolling, caffeine, intense TV) 30 minutes earlier — and put something quiet in the gap.",
    reflectPrompt: "Did your mornings feel any different by day three?",
  },
  {
    id: "warm-water",
    question: "Why does everyone in China drink warm water?",
    traditional:
      "In traditional Chinese frameworks, the digestive centre is described as preferring warmth — cold drinks are seen as asking the body to do extra work. Warm water (热水) is the default act of everyday care, offered to guests, the unwell and the tired alike.",
    modern:
      "There's no strong evidence that water temperature dramatically changes health outcomes — but the ritual itself slows people down, encourages hydration, and replaces sugary or caffeinated defaults. The behaviour may matter more than the temperature.",
    experiment:
      "Swap your first cold or caffeinated drink of the day for a slow cup of warm water, for 3 mornings.",
    reflectPrompt: "What changed about the start of your day — if anything?",
  },
  {
    id: "qi",
    question: "What is Qi, really?",
    traditional:
      "Qi (气) is one of the oldest concepts in Chinese thought — often translated as \"energy\", but closer to something like \"the animating quality of a living system\". Traditional frameworks describe wellbeing as Qi flowing smoothly, and depletion or stagnation as patterns to notice and adjust.",
    modern:
      "Qi is not a measurable physical substance, and modern science doesn't treat it as one. But many behaviours traditionally described as \"cultivating Qi\" — breath work, gentle movement, rhythm, rest — map onto practices with real, studied effects on stress and recovery.",
    experiment:
      "Try one 'Qi-cultivating' behaviour without the theory: 10 slow breaths, twice today, exhaling longer than you inhale.",
    reflectPrompt: "How would you describe your own energy today, in your own words?",
  },
  {
    id: "seasons",
    question: "Why eat with the seasons?",
    traditional:
      "Seasonal Yangsheng is a cornerstone of traditional Chinese wellness: warming foods in winter, cooling foods in summer, moistening foods in dry autumn. The underlying idea is that a life aligned with its season needs less correcting.",
    modern:
      "Seasonal eating overlaps with several evidence-friendly habits: fresher produce, more variety across the year, and dietary rhythm. The traditional food classifications themselves are cultural frameworks rather than biochemical claims.",
    experiment:
      "Cook one meal this week around whatever is actually in season where you live.",
    reflectPrompt: "Did the meal feel different knowing it matched the season?",
  },
  {
    id: "after-lunch",
    question: "Why do Chinese offices go quiet after lunch?",
    traditional:
      "The midday rest is woven into Chinese daily culture — a short pause when the day is at its peak. Traditional frameworks describe midday as a natural turning point where a brief stillness protects the afternoon.",
    modern:
      "Research on alertness shows a well-documented early-afternoon dip in most people, regardless of lunch. Brief rest — even 10 minutes with eyes closed — measurably improves afternoon performance in several studies.",
    experiment: "Take a 10-minute input-free pause after lunch today. No phone, no podcast.",
    reflectPrompt: "How did 3pm feel compared to your usual 3pm?",
  },
];

export const getTodaysDiscovery = (dayIndex: number) =>
  discoveries[dayIndex % discoveries.length];
