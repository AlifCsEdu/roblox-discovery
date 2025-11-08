// Game types
export interface Game {
  id: string;
  roblox_id: string;
  title: string;
  description: string | null;
  creator: string | null;
  thumbnail_url: string | null;
  
  // Rating & Quality
  rating: number | null;
  total_ratings: number;
  up_votes?: number;
  down_votes?: number;
  
  // Player Stats
  player_count_current: number;
  player_count_peak: number;
  player_count_7d_avg: number;
  
  // Classification
  genres: string[];
  tags: string[];
  
  // Engagement
  favorite_count: number;
  gamepass_count: number;
  badge_count: number;
  visits: number;
  
  // Quality Score (computed)
  quality_score: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  last_crawled: string | null;
  is_active: boolean;
}

// User rating type
export interface UserRating {
  id: string;
  game_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

// Genre type
export interface Genre {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string | null;
  description: string | null;
  game_count: number;
  created_at: string;
}

// Filter options
export interface GameFilters {
  rating_min: number;
  rating_max: number;
  genres?: string[];
  sort: 'trending' | 'rating' | 'new' | 'players';
  limit: number;
  offset: number;
}

// Pagination response
export interface PaginatedGames {
  games: Game[];
  total: number;
}

// Search log
export interface SearchLog {
  id: string;
  query: string | null;
  filters: Record<string, any>;
  result_count: number;
  created_at: string;
}

// Game with ratings (for detail page)
export interface GameWithRatings extends Game {
  user_ratings: UserRating[];
}
