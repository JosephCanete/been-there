export type Level = {
  required: number;
  title: string;
  emoji: string;
};

// Target 100 levels total (1..99 progress + 100th = full completion)
const LEVEL_COUNT = 100;

// 100 custom titles (keeps your originals and extends uniquely to 100)
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
  "Map Maven",
  "Coastline Cruiser",
  "Mountain Rambler",
  "River Roamer",
  "City Sleuth",
  "Heritage Hunter",
  "Island Insider",
  "Bay Wanderer",
  "Sunrise Seeker",
  "Sunset Chaser",
  "Ferry Flyer",
  "Jeepney Journeyman",
  "Barangay Buddy",
  "Rice Terrace Trekker",
  "Coral Coast Conqueror",
  "Summit Strider",
  "Valley Voyager",
  "Forest Forager",
  "Reef Ranger",
  "Shoreline Scout",
  "Beachcomber",
  "Highlands Hiker",
  "Lowlands Loper",
  "Market Meanderer",
  "Festival Fan",
  "Foodie Finder",
  "Culture Curator",
  "Map Master",
  "Route Runner",
  "Journey Juggler",
  "Island Itinerant",
  "Archipelago Ace",
  "Provincial Pioneer",
  "Territory Tracker",
  "Travel Tactician",
  "Compass Captain",
  "Waypoint Wrangler",
  "Geo Glider",
  "Mileage Maker",
  "Odyssey Organizer",
  "Globe Grazer",
  "Passport Pro",
  "Landmark Loyalist",
  "Terrain Trotter",
  "Horizon Hunter",
  "Latitude Legend",
  "Longitude Luminary",
  "Meridian Maverick",
  "Cartography Connoisseur",
  "Panorama Pacer",
  "Expedition Expert",
  "Discovery Devotee",
  "Trail Warden",
  "Island Impresario",
  "Archipelago Admiral",
  "Province Paragon",
  "Frontier Forerunner",
  "Route Regent",
  "Navigator Noble",
  "National Wayfarer",
  "Patriotic Pathfinder",
  "Sea Sprinter",
  "Mountain Marshal",
  "Coastal Captain",
  "River Ranger",
  "Volcano Voyager",
  "Coral Cruiser",
  "Monsoon Mover",
  "Typhoon Tamer",
  "Storm Surfer",
  "Rainbow Rambler",
  "Starry Skyranger",
  "Sunlit Sojourner",
  "Moonlight Mariner",
  "Comet Chaser",
  "Skyline Surveyor",
  "Trail Sage",
  "Voyage Virtuoso",
  "Province Patriarch",
  "Archipelago Aficionado",
  "Philippines Grandmaster",
];

// Replace previous emoji pools with a curated list of 100 unique, travel-relevant emojis
const BASE_EMOJIS: string[] = [
  "🌱",
  "👣",
  "🥾",
  "🎒",
  "🧳",
  "🧭",
  "🗺️",
  "📍",
  "🛣️",
  "🛤️",
  "🏔️",
  "⛰️",
  "🗻",
  "🌋",
  "🏜️",
  "🏞️",
  "🏝️",
  "🏖️",
  "🏕️",
  "⛺️",
  "🌄",
  "🌅",
  "🌇",
  "🌆",
  "🌃",
  "🌌",
  "🌠",
  "🌈",
  "☀️",
  "🌤️",
  "⛅️",
  "🌥️",
  "🌦️",
  "🌧️",
  "⛈️",
  "🌩️",
  "🌨️",
  "❄️",
  "🌬️",
  "🌫️",
  "🏙️",
  "🏘️",
  "🏚️",
  "🏛️",
  "🏟️",
  "🗽",
  "🗼",
  "🗿",
  "⛩️",
  "🛕",
  "🕌",
  "🕍",
  "⛪️",
  "🏰",
  "🏯",
  "⛲️",
  "🛖",
  "🏨",
  "🏪",
  "🛍️",
  "🚶",
  "🧗",
  "🧗‍♀️",
  "🧗‍♂️",
  "🧘",
  "🚗",
  "🚕",
  "🚙",
  "🛻",
  "🚐",
  "🚌",
  "🚎",
  "🚲",
  "🛴",
  "🛵",
  "🏍️",
  "🚂",
  "🚆",
  "🚈",
  "🚇",
  "🚊",
  "🚉",
  "🚝",
  "🚠",
  "🚡",
  "🚟",
  "🚁",
  "🛩️",
  "✈️",
  "🛫",
  "🛬",
  "⛵️",
  "🛶",
  "🚤",
  "🛥️",
  "🚢",
  "⚓️",
  "🎫",
  "🏆",
  "🇵🇭",
];

export const PRE_LEVEL: Level = {
  required: 0,
  title: "New Explorer",
  emoji: "🧭",
};

export function buildLevels(totalProvinces: number): Level[] {
  // Generate 99 progressive thresholds (approx. 1%..99% of total)
  const progressive: number[] = Array.from(
    { length: LEVEL_COUNT - 1 },
    (_, i) => {
      const pct = (i + 1) / LEVEL_COUNT; // 0.01 .. 0.99
      const req = Math.round(pct * totalProvinces);
      // Keep within [1, totalProvinces]
      return Math.max(1, Math.min(totalProvinces, req));
    }
  );

  const requiredList = [...progressive, totalProvinces]; // 100th is always full completion

  return requiredList.map((required, i) => ({
    required,
    title: BASE_TITLES[i] ?? `Explorer Lv. ${i + 1}`,
    emoji: BASE_EMOJIS[i] ?? "🇵🇭",
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
