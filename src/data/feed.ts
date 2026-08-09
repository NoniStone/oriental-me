export interface FeedItem {
  id: string;
  type: "daily" | "pulse";
  title: string;
  excerpt: string;
  evidence: "Cultural" | "Traditional theory" | "Wellness practice";
  readMinutes: number;
  image?: string;
  body: string[];
  source?: {
    platform: string;
    creator: string;
    date: string;
    note: string;
  };
}

export const feedItems: FeedItem[] = [
  {
    id: "yangsheng-intro",
    type: "daily",
    title: "Yangsheng 养生: the art of nourishing life",
    excerpt:
      "The word behind this whole app — and why it's broader, gentler and more everyday than 'medicine'.",
    evidence: "Cultural",
    readMinutes: 4,
    body: [
      "Yangsheng (养生) translates roughly as 'nourishing life'. It is not a treatment, a diet, or a workout plan — it's a centuries-old cultural practice of cultivating wellbeing through the ordinary texture of daily life: what you eat, when you rest, how you move, and how you match your habits to the season.",
      "Where much of modern wellness asks 'how do I optimise?', Yangsheng tends to ask 'how do I stay in rhythm?'. The unit of progress isn't a personal best — it's a sustainable ordinary day.",
      "In China, Yangsheng is thoroughly mainstream and multi-generational. Students carry thermoses of jujube tea, offices go quiet after lunch, and parks fill at dawn with slow, deliberate movement. It's less a belief system than a shared vocabulary of self-care.",
      "Oriental Me uses Yangsheng as a lens, not a prescription: a different way of thinking about taking care of yourself, which you can test against your own experience — one small ritual at a time.",
    ],
  },
  {
    id: "taichi-parks",
    type: "daily",
    title: "Why Chinese parks fill up at 6am",
    excerpt:
      "Tai chi, sword fans, backwards walking and the quiet social life of the morning park.",
    evidence: "Cultural",
    readMinutes: 3,
    image: "/assets/editorial-taichi.png",
    body: [
      "Visit almost any park in China just after sunrise and you'll find it already busy: tai chi circles, Ba Duan Jin lines, ballroom dancers, people walking backwards (yes, deliberately), and someone practising with a sword fan.",
      "Morning exercise culture runs deep. Traditional frameworks treat the early hours as the day's rising energy — the natural moment for gentle movement. But the habit is also profoundly social: the park is where neighbours become friends, and showing up is half the point.",
      "There's an interesting modern echo here: research consistently links morning light exposure, light social activity and gentle movement with better mood and sleep rhythm. The grandmas doing fan dances at 6:30am were not waiting for the studies.",
      "You don't need a sword fan to borrow the pattern. A slow ten-minute walk before work, ideally past other humans, captures a surprising amount of it.",
    ],
  },
  {
    id: "autumn-yangsheng",
    type: "daily",
    title: "Autumn Yangsheng: the season of drawing inward",
    excerpt:
      "Why tradition says autumn is for earlier nights, moist foods and finishing things.",
    evidence: "Traditional theory",
    readMinutes: 4,
    body: [
      "In traditional Chinese seasonal thinking, autumn is the season of gathering in — the year's energy contracts after summer's expansion. Classical advice for autumn includes sleeping earlier, rising with the light, and protecting yourself from dryness.",
      "The autumn table shifts too: pears, white fungus, honey, congee — foods traditionally classed as 'moistening' against the dry air. Whether or not you adopt the classification, the underlying pattern is seasonal responsiveness: eating differently because the world is different.",
      "This is a traditional framework, not a set of proven medical claims. But it overlaps intriguingly with modern observations: shorter days genuinely shift sleep pressure and mood for many people, and adjusting routines to daylight is a well-studied lever.",
      "A modern translation might be: as the light shortens, let your evenings shorten with it. One earlier night a week is a perfectly good autumn experiment.",
    ],
  },
  {
    id: "pulse-grandpa-walk",
    type: "pulse",
    title: "The 'Chinese Grandpa Walk' is taking over feeds",
    excerpt:
      "Hands behind the back, deliberately slow, aggressively unbothered — a walking style becomes a lifestyle statement.",
    evidence: "Cultural",
    readMinutes: 3,
    body: [
      "A posture is going viral: hands clasped behind the back, unhurried pace, chin slightly raised, radiating the calm of a man who has nowhere better to be. Creators call it the Chinese Grandpa Walk, and millions of short videos are imitating it.",
      "On Chinese platforms, the trend is affectionate and self-aware — young people adopting the tempo of their grandfathers as a small rebellion against hustle pace. The comments repeat one theme: walking slowly on purpose feels illegal, and then it feels amazing.",
      "Behind the meme is a real pattern: the post-meal stroll (饭后百步走) is one of the most ordinary pieces of everyday Yangsheng, and short gentle walks after eating happen to be genuinely well-studied.",
      "Our editorial take: this is the rare trend where the joke and the wisdom are the same thing. We turned it into this week's challenge — The Grandpa Reset.",
    ],
    source: {
      platform: "Xiaohongshu 小红书",
      creator: "Multiple lifestyle creators (trend roundup)",
      date: "This month",
      note: "Curated and translated by Oriental Me editorial. Summary of a public trend; individual posts belong to their original creators.",
    },
  },
  {
    id: "pulse-punk-yangsheng",
    type: "pulse",
    title: "'Punk Yangsheng' 朋克养生: goji berries in the cola",
    excerpt:
      "China's youth invented a self-aware wellness genre: partying and self-care in the same cup.",
    evidence: "Cultural",
    readMinutes: 3,
    body: [
      "Punk Yangsheng (朋克养生) is the ironic art of doing something unhealthy and something restorative simultaneously: goji berries dropped into cola, a face mask worn during an all-nighter, beer with dried jujube at the bottom.",
      "The phrase started as self-mockery among young Chinese workers — a wry admission that they know the traditions and are choosing chaos anyway, but only partial chaos. It has since become a whole content genre.",
      "It's funny, but it's also a window: Yangsheng vocabulary is so embedded in Chinese daily life that even the rebellion is expressed through it. The grandmother's framework survives inside the granddaughter's joke.",
      "Our editorial take: don't copy the cola. Do notice the underlying instinct — small compensating rituals are how real people actually live, and one genuine ritual beats two ironic ones.",
    ],
    source: {
      platform: "Douyin 抖音 / Weibo 微博",
      creator: "Trend roundup (multiple creators)",
      date: "Ongoing trend",
      note: "Curated and translated by Oriental Me editorial. Cultural commentary; not a health recommendation.",
    },
  },
  {
    id: "pulse-office-baduanjin",
    type: "pulse",
    title: "Office workers are doing Ba Duan Jin at their desks",
    excerpt:
      "The 800-year-old movement sequence has become the lunch-break trend in Chinese offices.",
    evidence: "Wellness practice",
    readMinutes: 3,
    body: [
      "Short videos of entire office floors doing Ba Duan Jin (八段锦) — a gentle, centuries-old sequence of eight movements — have become a staple of Chinese workplace content. Some companies schedule it; some workers sneak it between meetings.",
      "The appeal is practical: it needs no equipment, no clothes change, and about twelve minutes. The sequence is slow enough that nobody breaks a sweat, and old enough that nobody finds it embarrassing.",
      "Gentle movement breaks during sedentary work are one of the more robust findings in modern workplace health research — the tradition and the evidence point in a similar direction here, even though they describe it in completely different languages.",
      "We've included a simplified, desk-friendly interpretation in the ritual library — Eight Movements. Twelve minutes, no sword fan required.",
    ],
    source: {
      platform: "WeChat 微信 / Xiaohongshu 小红书",
      creator: "Workplace wellness accounts (trend roundup)",
      date: "This season",
      note: "Curated and translated by Oriental Me editorial. Our ritual version is a simplified modern interpretation, not a formal instruction in the traditional sequence.",
    },
  },
  {
    id: "tea-not-about-tea",
    type: "daily",
    title: "The tea break that isn't about tea",
    excerpt:
      "What gongfu tea culture understands about attention that a teabag never will.",
    evidence: "Cultural",
    readMinutes: 3,
    body: [
      "Gongfu tea (工夫茶) — the small-pot, many-infusions style of Chinese tea — takes effort on purpose. Warming the pot, rinsing the leaves, pouring in circles: the procedure is the point.",
      "The name itself means 'skill acquired through time and practice'. A gongfu session cannot be rushed, which makes it a kind of protected attention — twenty minutes where your hands are busy and your feed is not.",
      "You don't need the equipment to borrow the principle. Any drink made slowly, with more steps than strictly necessary, in a moment you refuse to multitask through, is doing the same quiet work.",
      "Our Evening Tea ritual is the entry-level version: one deliberate pot, no screens, one good memory from the day.",
    ],
  },
];
