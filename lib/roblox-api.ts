/**
 * Real-time Roblox API Client
 * 
 * Fetches game data directly from Roblox's public APIs in real-time
 * No database population needed - always fresh data!
 * 
 * Available Public APIs:
 * 1. Game Details: /v1/games?universeIds=X,Y,Z (batch fetch game info)
 * 2. Search: Can search by known popular games or trending lists
 * 3. Thumbnails: /v1/games/{universeId}/media
 * 
 * Strategy: 
 * - Maintain a curated list of popular/trending universe IDs
 * - Fetch details real-time when requested
 * - Use in-memory cache for performance (5-10 min TTL)
 */

// In-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

// Rate limiter
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 60;
  private readonly windowMs = 60 * 1000; // 1 minute

  async throttle(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return this.throttle();
    }

    this.requests.push(now);
  }
}

const rateLimiter = new RateLimiter();

/**
 * Get cached data or fetch new
 */
async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number
): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  return data;
}

export interface RobloxGame {
  id: string; // universeId
  rootPlaceId: number;
  name: string;
  description: string;
  creator: {
    id: number;
    name: string;
    type: string;
  };
  playing: number;
  visits: number;
  favoritedCount: number;
  created: string;
  updated: string;
  rating?: number;
  genres?: string[];
}

/**
 * Fetch games by universe IDs (real-time from Roblox)
 */
export async function getGamesByUniverseIds(universeIds: number[]): Promise<RobloxGame[]> {
  await rateLimiter.throttle();
  
  const cacheKey = `games:${universeIds.join(',')}`;
  
  return getCached(
    cacheKey,
    async () => {
      try {
        const url = `https://games.roblox.com/v1/games?universeIds=${universeIds.join(',')}`;
        console.log(`[ROBLOX-API] Fetching games for universe IDs: ${universeIds.slice(0, 5).join(',')}${universeIds.length > 5 ? '...' : ''}`);
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`[ROBLOX-API] Game fetch error: ${response.status} ${response.statusText}`);
          throw new Error(`Roblox API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`[ROBLOX-API] Successfully fetched ${data.data?.length || 0} games`);
        return data.data || [];
      } catch (error) {
        console.error('[ROBLOX-API] Error fetching games:', error);
        throw error;
      }
    },
    5 * 60 * 1000 // 5 min cache
  );
}

/**
 * Convert place ID to universe ID
 */
export async function placeIdToUniverseId(placeId: number): Promise<number | null> {
  await rateLimiter.throttle();
  
  const cacheKey = `place:${placeId}`;
  
  return getCached(
    cacheKey,
    async () => {
      try {
        const url = `https://apis.roblox.com/universes/v1/places/${placeId}/universe`;
        console.log(`[ROBLOX-API] Converting place ID ${placeId} to universe ID`);
        const response = await fetch(url);
        
        if (!response.ok) {
          console.warn(`[ROBLOX-API] Failed to convert place ID ${placeId}: ${response.status} ${response.statusText}`);
          return null;
        }
        
        const data = await response.json();
        const universeId = data.universeId || null;
        console.log(`[ROBLOX-API] Place ID ${placeId} → Universe ID ${universeId}`);
        return universeId;
      } catch (error) {
        console.error(`[ROBLOX-API] Error converting place ID ${placeId}:`, error);
        return null;
      }
    },
    60 * 60 * 1000 // 1 hour cache (universe IDs don't change)
  );
}

/**
 * Convert multiple place IDs to universe IDs in parallel (FAST!)
 * Checks cache first, only fetches uncached IDs
 */
export async function batchPlaceIdToUniverseId(placeIds: number[]): Promise<Map<number, number>> {
  const results = new Map<number, number>();
  const uncachedIds: number[] = [];
  const now = Date.now();
  
  // Check cache first
  for (const placeId of placeIds) {
    const cacheKey = `place:${placeId}`;
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < 60 * 60 * 1000) {
      if (cached.data) {
        results.set(placeId, cached.data);
      }
    } else {
      uncachedIds.push(placeId);
    }
  }
  
  if (uncachedIds.length === 0) {
    console.log(`[BATCH PLACE→UNIVERSE] All ${placeIds.length} IDs cached`);
    return results;
  }
  
  console.log(`[BATCH PLACE→UNIVERSE] Fetching ${uncachedIds.length}/${placeIds.length} uncached IDs`);
  
  // Fetch uncached IDs in parallel with controlled concurrency (10 at a time)
  const batchSize = 10;
  for (let i = 0; i < uncachedIds.length; i += batchSize) {
    const batch = uncachedIds.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (placeId) => {
      try {
        const universeId = await placeIdToUniverseId(placeId);
        if (universeId) {
          results.set(placeId, universeId);
        }
      } catch (error) {
        console.error(`[BATCH PLACE→UNIVERSE] Error for place ${placeId}:`, error);
      }
    }));
    
    // Small delay between batches
    if (i + batchSize < uncachedIds.length) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  return results;
}

/**
 * Get game votes (for rating calculation)
 */
export async function getGameVotes(universeId: number): Promise<{ upVotes: number; downVotes: number }> {
  await rateLimiter.throttle();
  
  const cacheKey = `votes:${universeId}`;
  
  return getCached(
    cacheKey,
    async () => {
      const url = `https://games.roblox.com/v1/games/votes?universeIds=${universeId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`[VOTES API] Failed for universeId=${universeId}, status=${response.status}`);
        return { upVotes: 0, downVotes: 0 };
      }
      
      const data = await response.json();
      const voteData = data.data?.[0] || { upVotes: 0, downVotes: 0 };
      
      // Log when we get zero votes to help debug
      if (voteData.upVotes === 0 && voteData.downVotes === 0) {
        console.log(`[VOTES API] Got 0/0 votes for universeId=${universeId}, response:`, JSON.stringify(data));
      }
      
      return voteData;
    },
    10 * 60 * 1000 // 10 min cache
  );
}

/**
 * Get votes for multiple games in a single API call (MUCH faster and avoids rate limiting!)
 * API accepts up to 100 IDs but only returns max 30 results per request, so we batch by 30
 */
export async function getBatchGameVotes(universeIds: number[]): Promise<Map<number, { upVotes: number; downVotes: number }>> {
  await rateLimiter.throttle();
  
  // Check cache first for each game
  const results = new Map<number, { upVotes: number; downVotes: number }>();
  const uncachedIds: number[] = [];
  const now = Date.now();
  
  for (const id of universeIds) {
    const cacheKey = `votes:${id}`;
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < 10 * 60 * 1000) {
      results.set(id, cached.data);
    } else {
      uncachedIds.push(id);
    }
  }
  
  // If all cached, return early
  if (uncachedIds.length === 0) {
    console.log(`[BATCH VOTES] All ${universeIds.length} games cached`);
    return results;
  }
  
  // Fetch uncached games in batches of 30 (API only returns max 30 results per request)
  const batchSize = 30;
  for (let i = 0; i < uncachedIds.length; i += batchSize) {
    const batch = uncachedIds.slice(i, i + batchSize);
    const url = `https://games.roblox.com/v1/games/votes?universeIds=${batch.join(',')}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`[BATCH VOTES] API failed: status=${response.status} for ${batch.length} games`);
        // Cache failures as 0/0 to avoid re-fetching immediately
        for (const id of batch) {
          const voteData = { upVotes: 0, downVotes: 0 };
          results.set(id, voteData);
          cache.set(`votes:${id}`, { data: voteData, timestamp: now });
        }
        continue;
      }
      
      const data = await response.json();
      console.log(`[BATCH VOTES] Fetched ${data.data?.length || 0} games successfully`);
      
      // Map results by universe ID
      for (const voteData of (data.data || [])) {
        const id = voteData.id;
        const votes = { upVotes: voteData.upVotes, downVotes: voteData.downVotes };
        results.set(id, votes);
        cache.set(`votes:${id}`, { data: votes, timestamp: now });
      }
      
      // For games not in response, cache as 0/0
      for (const id of batch) {
        if (!results.has(id)) {
          const voteData = { upVotes: 0, downVotes: 0 };
          results.set(id, voteData);
          cache.set(`votes:${id}`, { data: voteData, timestamp: now });
        }
      }
    } catch (error) {
      console.error(`[BATCH VOTES] Error fetching batch:`, error);
      // Cache failures as 0/0
      for (const id of batch) {
        const voteData = { upVotes: 0, downVotes: 0 };
        results.set(id, voteData);
        cache.set(`votes:${id}`, { data: voteData, timestamp: now });
      }
    }
    
    // Small delay between batches to be nice to the API
    if (i + batchSize < uncachedIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

/**
 * Get game thumbnail/media
 */
export async function getGameThumbnail(universeId: number): Promise<string | null> {
  await rateLimiter.throttle();
  
  const cacheKey = `thumbnail:${universeId}`;
  
  return getCached(
    cacheKey,
    async () => {
      const url = `https://games.roblox.com/v1/games/${universeId}/media`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      // Get the first image from media
      const images = data.data?.filter((item: any) => item.assetType === 'Image') || [];
      return images[0]?.imageId ? `https://assetgame.roblox.com/asset/?id=${images[0].imageId}` : null;
    },
    60 * 60 * 1000 // 1 hour cache
  );
}

/**
 * Calculate rating percentage
 */
export function calculateRating(upVotes: number, downVotes: number): number {
  const total = upVotes + downVotes;
  if (total === 0) return 0;
  return Math.round((upVotes / total) * 100);
}

/**
 * Get enriched game with rating
 * Returns null if game is not found instead of throwing
 */
export async function getEnrichedGame(universeId: number): Promise<(RobloxGame & { rating: number }) | null> {
  try {
    const games = await getGamesByUniverseIds([universeId]);
    if (games.length === 0) {
      console.warn(`[ROBLOX-API] Game not found for universe ID: ${universeId}`);
      return null;
    }
    
    const game = games[0];
    const votes = await getGameVotes(universeId); // Use universeId, not rootPlaceId!
    const rating = calculateRating(votes.upVotes, votes.downVotes);
    
    return {
      ...game,
      rating,
    };
  } catch (error) {
    console.error(`[ROBLOX-API] Error fetching game ${universeId}:`, error);
    return null;
  }
}

/**
 * ROLIMONS API INTEGRATION
 * Rolimons tracks 7,113+ games automatically with real-time player counts
 * Much better than manually curating games!
 */

export interface RolimonsGame {
  placeId: string;
  name: string;
  playerCount: number;
  thumbnailUrl: string;
}

export interface RolimonsResponse {
  success: boolean;
  game_count: number;
  games: {
    [placeId: string]: [string, number, string]; // [name, playerCount, thumbnailUrl]
  };
}

/**
 * Fetch all games from Rolimons API
 * Returns 7,113+ games with real-time player counts
 */
export async function getRolimonsGames(): Promise<RolimonsGame[]> {
  const cacheKey = 'rolimons:games';
  
  return getCached(
    cacheKey,
    async () => {
      const url = 'https://api.rolimons.com/games/v1/gamelist';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Rolimons API error: ${response.status}`);
      }
      
      const data: RolimonsResponse = await response.json();
      
      // Transform to our format
      const games: RolimonsGame[] = [];
      for (const [placeId, [name, playerCount, thumbnailUrl]] of Object.entries(data.games)) {
        games.push({
          placeId,
          name,
          playerCount,
          thumbnailUrl,
        });
      }
      
      return games;
    },
    5 * 60 * 1000 // 5 min cache (Rolimons updates frequently)
  );
}

/**
 * Get a single game from Rolimons by place ID
 */
export async function getRolimonsGameByPlaceId(placeId: string): Promise<RolimonsGame | null> {
  const games = await getRolimonsGames();
  return games.find(game => game.placeId === placeId) || null;
}

/**
 * Get enriched game using Rolimons data (real-time player count) + Roblox API (details)
 * This is the optimal approach - use Rolimons for real-time data, Roblox for static details
 * Returns null if game is not found instead of throwing
 */
export async function getEnrichedGameHybrid(placeId: number): Promise<any | null> {
  try {
    // First try to get from Rolimons (real-time player count + thumbnail)
    const rolimonsGame = await getRolimonsGameByPlaceId(placeId.toString());
    
    // Convert place ID to universe ID for Roblox API calls
    const universeId = await placeIdToUniverseId(placeId);
    
    if (!universeId) {
      console.warn(`[ROBLOX-API] Could not find universe ID for place ID: ${placeId}`);
      return null;
    }
    
    // Fetch additional details from Roblox API (description, creator, votes, visits, favorites)
    const [robloxGame, votes] = await Promise.all([
      getGamesByUniverseIds([universeId]).then(games => games[0]),
      getGameVotes(universeId),
    ]);
    
    if (!robloxGame) {
      console.warn(`[ROBLOX-API] Game not found in Roblox API for place ID: ${placeId}, universe ID: ${universeId}`);
      return null;
    }
    
    const rating = calculateRating(votes.upVotes, votes.downVotes);
    
    // Merge Rolimons real-time data with Roblox static data
    return {
      id: robloxGame.id,
      rootPlaceId: robloxGame.rootPlaceId,
      name: robloxGame.name,
      description: robloxGame.description,
      creator: robloxGame.creator,
      // Use Rolimons data for player count (real-time!) and thumbnail if available
      playing: rolimonsGame?.playerCount ?? robloxGame.playing,
      thumbnailUrl: rolimonsGame?.thumbnailUrl || null,
      // Use Roblox data for everything else
      visits: robloxGame.visits,
      favoritedCount: robloxGame.favoritedCount,
      created: robloxGame.created,
      updated: robloxGame.updated,
      rating,
      upVotes: votes.upVotes,
      downVotes: votes.downVotes,
    };
  } catch (error) {
    console.error(`[ROBLOX-API] Error fetching hybrid game data for place ID ${placeId}:`, error);
    return null;
  }
}

/**
 * CURATED GAME LISTS (LEGACY - kept for backwards compatibility)
 * Now replaced by Rolimons API which provides 7,113+ games
 */

export const POPULAR_UNIVERSE_IDS = [
  // Top games as of Nov 2024 (UNIVERSE IDs, not place IDs!)
  1686885941, // Brookhaven (place: 4924922222)
  994732206,  // Blox Fruits (place: 2753915549)
  383310974,  // Adopt Me (place: 920587237)
  66654135,   // Murder Mystery 2 (place: 142823291)
  601130232,  // Bee Swarm Simulator (place: 1537690962)
  245662005,  // Jailbreak (place: 606849621)
  111958650,  // Arsenal (place: 286090429)
  807930589,  // Anime Defenders (place: 2317712696)
];

/**
 * Get popular games (real-time data)
 */
export async function getPopularGames(limit: number = 20): Promise<RobloxGame[]> {
  const universeIds = POPULAR_UNIVERSE_IDS.slice(0, limit);
  return getGamesByUniverseIds(universeIds);
}

/**
 * Search games by scanning universe ID ranges
 * This is for discovery - when users want to explore beyond curated lists
 */
export async function discoverGamesInRange(
  startId: number,
  count: number = 50
): Promise<RobloxGame[]> {
  const universeIds: number[] = [];
  for (let i = 0; i < count; i++) {
    universeIds.push(startId + i);
  }
  
  const games = await getGamesByUniverseIds(universeIds);
  
  // Filter out abandoned games
  return games.filter(game => game.playing > 0 || game.visits > 100);
}

/**
 * Classify game genres based on title keywords
 */
const GENRE_KEYWORDS: { [key: string]: string[] } = {
  'shooter': ['shooter', 'fps', 'gun', 'arsenal', 'phantom forces', 'counter', 'warfare'],
  'rpg': ['rpg', 'blox fruits', 'quest', 'leveling', 'adventure quest'],
  'simulator': ['simulator', 'sim'],
  'tycoon': ['tycoon', 'factory', 'empire', 'business'],
  'obby': ['obby', 'parkour', 'tower of hell', 'tower', 'climb'],
  'parkour': ['parkour', 'freerun', 'climbing', 'agility'],
  'horror': ['horror', 'scary', 'doors', 'piggy', 'creepy', 'haunted'],
  'roleplay': ['roleplay', 'rp', 'brookhaven', 'adopt me', 'life'],
  'pvp': ['pvp', 'battle', 'fighting', 'combat', 'arena', 'versus', 'duel'],
  'fighting': ['fighting', 'combat', 'brawl', 'punch', 'martial arts', 'boxing'],
  'social': ['hangout', 'social', 'chat', 'vibe', 'chill', 'lounge'],
  'adventure': ['adventure', 'journey', 'explore', 'travel'],
  'racing': ['racing', 'race', 'speed', 'drift', 'car', 'vehicle', 'driving'],
  'sandbox': ['sandbox', 'build', 'create', 'construction'],
  'survival': ['survival', 'survive', 'apocalypse', 'zombie'],
  'sports': ['sports', 'football', 'soccer', 'basketball', 'baseball'],
  'puzzle': ['puzzle', 'brain', 'logic', 'riddle'],
  'story-driven': ['story', 'narrative', 'tale', 'chapter'],
  'mystery': ['mystery', 'detective', 'investigation', 'crime'],
  'comedy': ['comedy', 'funny', 'meme', 'laugh'],
  'co-op': ['co-op', 'coop', 'cooperative', 'team'],
  'music': ['music', 'rhythm', 'beat', 'dance', 'dj'],
  'educational': ['educational', 'learn', 'school', 'teach'],
};

export function classifyGenres(title: string): string[] {
  const lowerTitle = title.toLowerCase();
  const genres = new Set<string>();
  
  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    if (keywords.some(keyword => lowerTitle.includes(keyword))) {
      genres.add(genre);
    }
  }
  
  return genres.size > 0 ? Array.from(genres) : ['adventure'];
}

/**
 * Sort/filter Rolimons games
 */
export function sortRolimonsGames(games: RolimonsGame[], sortBy: 'trending' | 'rating' | 'new' | 'players'): RolimonsGame[] {
  const sorted = [...games];
  
  switch (sortBy) {
    case 'trending':
    case 'players':
      return sorted.sort((a, b) => b.playerCount - a.playerCount);
    case 'rating':
      // Rolimons doesn't provide rating - fall back to player count
      return sorted.sort((a, b) => b.playerCount - a.playerCount);
    case 'new':
      // Rolimons doesn't provide created date - fall back to player count
      return sorted.sort((a, b) => b.playerCount - a.playerCount);
    default:
      return sorted;
  }
}

/**
 * Sort/filter games
 */
export function sortGames(games: RobloxGame[], sortBy: 'trending' | 'rating' | 'new' | 'players'): RobloxGame[] {
  const sorted = [...games];
  
  switch (sortBy) {
    case 'trending':
    case 'players':
      return sorted.sort((a, b) => b.playing - a.playing);
    case 'rating':
      // Would need to fetch votes for each game - expensive
      return sorted.sort((a, b) => b.favoritedCount - a.favoritedCount);
    case 'new':
      return sorted.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    default:
      return sorted;
  }
}
