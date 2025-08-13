export type Level = {
  required: number;
  title: string;
  emoji: string;
};

const BASE_THRESHOLDS: number[] = [
  1, 3, 5, 8, 12, 16, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80,
];

const BASE_TITLES: string[] = [
  "First Footsteps",
  "Wanderer",
  "Trail Trekker",
  "Town Hopper",
  "Island Hopper",
  "Culture Seeker",
  "Trailblazer",
  "Road Runner",
  "Wayfarer",
  "Scout",
  "Archipelago Adventurer",
  "Voyager",
  "Explorer Elite",
  "Pathfinder",
  "Province Pro",
  "Frontier Ranger",
  "Navigator",
  "National Nomad",
  "Patriotic Pioneer",
];

const BASE_EMOJIS: string[] = [
  "🌱",
  "🚶",
  "🥾",
  "🏘️",
  "🏝️",
  "🏛️",
  "🔥",
  "🛣️",
  "🧳",
  "🛰️",
  "🚢",
  "🧭",
  "⭐",
  "🗺️",
  "🛡️",
  "🏕️",
  "🧭",
  "🐾",
  "🏆",
];

export const PRE_LEVEL: Level = {
  required: 0,
  title: "New Explorer",
  emoji: "🧭",
};

export function buildLevels(totalProvinces: number): Level[] {
  const capped = BASE_THRESHOLDS.map((n) => Math.min(n, totalProvinces));
  const requiredList = [...capped, totalProvinces]; // last is always full completion
  return requiredList.map((required, i) => ({
    required,
    title: i < BASE_TITLES.length ? BASE_TITLES[i] : "Philippines Master",
    emoji: i < BASE_EMOJIS.length ? BASE_EMOJIS[i] : "🇵🇭",
  }));
}

export function getLevelInfo(explored: number, totalProvinces: number) {
  const levels = buildLevels(totalProvinces);
  let currentLevelIndex = -1;
  for (let i = 0; i < levels.length; i++) {
    if (explored >= levels[i].required) currentLevelIndex = i;
    else break;
  }
  const hasLevel = currentLevelIndex >= 0;
  const currentLevelMeta = hasLevel ? levels[currentLevelIndex] : PRE_LEVEL;
  const currentLevelNumber = hasLevel ? currentLevelIndex + 1 : 0;
  const nextLevelMeta = levels[currentLevelIndex + 1];
  const prevRequired = hasLevel ? currentLevelMeta.required : 0;
  const nextRequired = nextLevelMeta?.required ?? currentLevelMeta.required;
  const toNext = Math.max(0, nextRequired - explored);
  const levelProgress = nextLevelMeta
    ? Math.round(
        ((explored - prevRequired) / Math.max(1, nextRequired - prevRequired)) *
          100
      )
    : 100;
  return {
    levels,
    currentLevelIndex,
    currentLevelNumber,
    currentLevelMeta,
    nextLevelMeta,
    prevRequired,
    nextRequired,
    toNext,
    levelProgress,
  } as const;
}
