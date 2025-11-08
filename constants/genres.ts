export const GENRES = [
  { name: "RPG", icon: "sword", color: "red-500", slug: "rpg" },
  { name: "Simulator", icon: "cogwheel", color: "blue-500", slug: "simulator" },
  { name: "Parkour", icon: "trending-up", color: "orange-500", slug: "parkour" },
  { name: "Racing", icon: "zap", color: "yellow-500", slug: "racing" },
  { name: "Shooter", icon: "target", color: "red-600", slug: "shooter" },
  { name: "Story-Driven", icon: "book", color: "purple-500", slug: "story-driven" },
  { name: "Adventure", icon: "compass", color: "cyan-500", slug: "adventure" },
  { name: "Mystery", icon: "eye", color: "indigo-500", slug: "mystery" },
  { name: "Comedy", icon: "smile", color: "pink-500", slug: "comedy" },
  { name: "Horror", icon: "ghost", color: "slate-700", slug: "horror" },
  { name: "Co-op", icon: "users", color: "green-500", slug: "co-op" },
  { name: "PvP", icon: "swords", color: "rose-500", slug: "pvp" },
  { name: "Sandbox", icon: "box", color: "amber-500", slug: "sandbox" },
  { name: "Tycoon", icon: "trending-up", color: "emerald-500", slug: "tycoon" },
  { name: "Survival", icon: "heart", color: "lime-500", slug: "survival" },
  { name: "Fighting", icon: "fist", color: "fuchsia-500", slug: "fighting" },
  { name: "Sports", icon: "basketball", color: "sky-500", slug: "sports" },
  { name: "Music", icon: "music", color: "violet-500", slug: "music" },
  { name: "Puzzle", icon: "hexagon", color: "cyan-600", slug: "puzzle" },
  { name: "Educational", icon: "graduation", color: "blue-600", slug: "educational" },
] as const;

export const DEFAULT_RATING_MIN = 0;
export const DEFAULT_RATING_MAX = 100;
export const DEFAULT_GAMES_PER_PAGE = 20;

export const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending Now' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'players', label: 'Most Players' },
] as const;
