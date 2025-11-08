-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- GAMES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roblox_id BIGINT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  creator TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Rating & Quality
  rating NUMERIC(3,1) CHECK (rating >= 0 AND rating <= 100),
  total_ratings INTEGER DEFAULT 0,
  
  -- Player Stats
  player_count_current INTEGER DEFAULT 0,
  player_count_peak INTEGER DEFAULT 0,
  player_count_7d_avg INTEGER DEFAULT 0,
  
  -- Classification
  genres TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- Engagement
  favorite_count INTEGER DEFAULT 0,
  gamepass_count INTEGER DEFAULT 0,
  badge_count INTEGER DEFAULT 0,
  visits BIGINT DEFAULT 0,
  
  -- Quality Score (computed field)
  quality_score NUMERIC(5,2) GENERATED ALWAYS AS (
    rating * 0.5 + 
    LEAST(total_ratings / 10000.0, 1) * 30 +
    LEAST(player_count_current / 5000.0, 1) * 20
  ) STORED,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_crawled TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Real-time sync
  last_broadcast_id UUID
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_rating ON games(rating DESC);
CREATE INDEX IF NOT EXISTS idx_games_genres ON games USING GIN(genres);
CREATE INDEX IF NOT EXISTS idx_games_quality_score ON games(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_games_player_count ON games(player_count_current DESC);
CREATE INDEX IF NOT EXISTS idx_games_is_active ON games(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_roblox_id ON games(roblox_id);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_games_search ON games USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================
-- USER RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  
  rating NUMERIC(1,0) CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(game_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_ratings_game_id ON user_ratings(game_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);

-- ============================================
-- GENRES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_genres_slug ON genres(slug);

-- ============================================
-- SEARCH LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT,
  filters JSONB,
  result_count INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- Games: public read-only
DROP POLICY IF EXISTS games_public_read ON games;
CREATE POLICY games_public_read ON games 
  FOR SELECT 
  USING (TRUE);

-- User ratings: public read all
DROP POLICY IF EXISTS user_ratings_public_read ON user_ratings;
CREATE POLICY user_ratings_public_read ON user_ratings 
  FOR SELECT 
  USING (TRUE);

-- User ratings: authenticated users can write only own
DROP POLICY IF EXISTS user_ratings_own_write ON user_ratings;
CREATE POLICY user_ratings_own_write ON user_ratings 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS user_ratings_own_update ON user_ratings;
CREATE POLICY user_ratings_own_update ON user_ratings 
  FOR UPDATE 
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS user_ratings_own_delete ON user_ratings;
CREATE POLICY user_ratings_own_delete ON user_ratings 
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- Genres: public read-only
DROP POLICY IF EXISTS genres_public_read ON genres;
CREATE POLICY genres_public_read ON genres 
  FOR SELECT 
  USING (TRUE);

-- Search logs: public read-only
DROP POLICY IF EXISTS search_logs_public_read ON search_logs;
CREATE POLICY search_logs_public_read ON search_logs 
  FOR SELECT 
  USING (TRUE);

-- ============================================
-- SUPABASE REALTIME TRIGGERS
-- ============================================

-- Function to broadcast game changes
CREATE OR REPLACE FUNCTION broadcast_game_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'game_changes',
    json_build_object(
      'id', NEW.id,
      'roblox_id', NEW.roblox_id,
      'title', NEW.title,
      'player_count_current', NEW.player_count_current,
      'rating', NEW.rating,
      'updated_at', NEW.updated_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for real-time game updates
DROP TRIGGER IF EXISTS games_realtime_trigger ON games;
CREATE TRIGGER games_realtime_trigger
AFTER INSERT OR UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION broadcast_game_changes();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS games_updated_at ON games;
CREATE TRIGGER games_updated_at
BEFORE UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS user_ratings_updated_at ON user_ratings;
CREATE TRIGGER user_ratings_updated_at
BEFORE UPDATE ON user_ratings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED GENRES DATA
-- ============================================

INSERT INTO genres (name, slug, color, icon) VALUES
  ('RPG', 'rpg', 'red-500', 'sword'),
  ('Simulator', 'simulator', 'blue-500', 'cogwheel'),
  ('Parkour', 'parkour', 'orange-500', 'trending-up'),
  ('Racing', 'racing', 'yellow-500', 'zap'),
  ('Shooter', 'shooter', 'red-600', 'target'),
  ('Story-Driven', 'story-driven', 'purple-500', 'book'),
  ('Adventure', 'adventure', 'cyan-500', 'compass'),
  ('Mystery', 'mystery', 'indigo-500', 'eye'),
  ('Comedy', 'comedy', 'pink-500', 'smile'),
  ('Horror', 'horror', 'slate-700', 'ghost'),
  ('Co-op', 'co-op', 'green-500', 'users'),
  ('PvP', 'pvp', 'rose-500', 'swords'),
  ('Sandbox', 'sandbox', 'amber-500', 'box'),
  ('Tycoon', 'tycoon', 'emerald-500', 'trending-up'),
  ('Survival', 'survival', 'lime-500', 'heart'),
  ('Fighting', 'fighting', 'fuchsia-500', 'fist'),
  ('Sports', 'sports', 'sky-500', 'basketball'),
  ('Music', 'music', 'violet-500', 'music'),
  ('Puzzle', 'puzzle', 'cyan-600', 'hexagon'),
  ('Educational', 'educational', 'blue-600', 'graduation')
ON CONFLICT (slug) DO NOTHING;
