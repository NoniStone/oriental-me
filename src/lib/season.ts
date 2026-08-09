export type Season = "spring" | "summer" | "autumn" | "winter";

export const getCurrentSeason = (): Season => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
};

export interface SeasonInfo {
  name: string;
  chinese: string;
  emoji: string;
  traditional: string;
  modern: string;
}

export const seasonInfo: Record<Season, SeasonInfo> = {
  spring: {
    name: "Spring",
    chinese: "春",
    emoji: "🌸",
    traditional:
      "In traditional Chinese seasonal thinking, spring is the season of rising and beginning — energy unfurls like new growth, and the classical advice is to rise earlier, move gently, and let plans (and emotions) start flowing.",
    modern:
      "A modern translation: lengthening daylight genuinely shifts mood and sleep timing for many people. Spring is a well-suited moment to move wake times earlier and take movement outdoors.",
  },
  summer: {
    name: "Summer",
    chinese: "夏",
    emoji: "☀️",
    traditional:
      "In traditional Chinese seasonal thinking, summer is the season of flourishing — the year's most outward, expressive months. The classical advice: wake with the early light, embrace activity and connection, and cool gently rather than sharply.",
    modern:
      "A modern translation: long days support activity and social energy, but heat disturbs sleep — gentle evening cooling and hydration matter more than intensity.",
  },
  autumn: {
    name: "Autumn",
    chinese: "秋",
    emoji: "🍂",
    traditional:
      "In traditional Chinese seasonal thinking, autumn is the season of gathering in — energy contracts after summer's expansion. Classical advice: sleep earlier, protect against dryness, and finish what summer started.",
    modern:
      "A modern translation: as daylight shortens, sleep pressure and mood genuinely shift for many people. Letting evenings shorten with the light is a well-studied adjustment.",
  },
  winter: {
    name: "Winter",
    chinese: "冬",
    emoji: "❄️",
    traditional:
      "In traditional Chinese seasonal thinking, winter is the season of storage — the year's quietest, most inward months. The classical advice: rest deeply, warm the body from within, and conserve rather than spend.",
    modern:
      "A modern translation: short days lower energy for many people. Prioritising sleep, warm meals and daylight exposure at midday works with the season instead of against it.",
  },
};
