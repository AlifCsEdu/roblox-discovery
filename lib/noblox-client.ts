/**
 * Roblox API client with caching and rate limiting
 * 
 * Uses public Roblox HTTP APIs (no authentication required)
 * Rate Limit: 60 requests per minute
 * Cache: 5 minutes for game details, 10 seconds for live data
 */

// In-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, CacheEntry<any>>();

// Rate limiter
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 60;
  private readonly windowMs = 60 * 1000; // 1 minute

  async throttle(): Promise<void> {
    const now = Date.now();
    // Remove requests outside the time window
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
 * Get cached data or fetch new data
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

  await rateLimiter.throttle();
  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  return data;
}

/**
 * Convert place ID to universe ID
 */
async function getUniverseIdFromPlace(placeId: number): Promise<number> {
  const response = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
  if (!response.ok) {
    throw new Error(`Failed to get universe ID: ${response.statusText}`);
  }
  const data = await response.json();
  return data.universeId;
}

/**
 * Get game details by place ID (robloxId)
 */
export async function getGameDetails(placeId: number) {
  const cacheKey = `game:${placeId}`;
  const ttl = 5 * 60 * 1000; // 5 minutes

  try {
    return await getCached(
      cacheKey,
      async () => {
        // First, convert place ID to universe ID
        const universeId = await getUniverseIdFromPlace(placeId);
        
        // Then fetch game details using universe ID
        const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch game details: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!data.data || data.data.length === 0) {
          throw new Error(`No game found for universe ID ${universeId}`);
        }
        
        const gameInfo = data.data[0];
        
        // Transform to match expected format
        return {
          name: gameInfo.name,
          description: gameInfo.description,
          creator: gameInfo.creator.name,
          playing: gameInfo.playing,
          visits: gameInfo.visits,
          favoriteCount: gameInfo.favoritedCount,
          maxPlayers: gameInfo.maxPlayers,
          created: gameInfo.created,
          updated: gameInfo.updated,
          thumbnailUrl: null, // Will be fetched separately if needed
          universeId: gameInfo.id,
          placeId: gameInfo.rootPlaceId,
        };
      },
      ttl
    );
  } catch (error) {
    console.error(`Error fetching game details for ${placeId}:`, error);
    throw error;
  }
}

/**
 * Get current player count for a game
 */
export async function getPlayerCount(placeId: number): Promise<number> {
  try {
    const gameDetails = await getGameDetails(placeId);
    return gameDetails.playing || 0;
  } catch (error) {
    console.error(`Error fetching player count for ${placeId}:`, error);
    return 0;
  }
}

/**
 * Get multiple games' player counts in batch
 */
export async function getBatchPlayerCounts(
  robloxIds: number[]
): Promise<Map<number, number>> {
  const results = new Map<number, number>();

  // Process in batches of 10 to respect rate limits
  const batchSize = 10;
  for (let i = 0; i < robloxIds.length; i += batchSize) {
    const batch = robloxIds.slice(i, i + batchSize);
    const promises = batch.map(async (id) => {
      const count = await getPlayerCount(id);
      return { id, count };
    });

    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ id, count }) => results.set(id, count));
  }

  return results;
}

/**
 * Get game universe ID (needed for some API calls)
 */
export async function getUniverseId(placeId: number): Promise<number> {
  const cacheKey = `universe:${placeId}`;
  const ttl = 30 * 60 * 1000; // 30 minutes

  try {
    return await getCached(
      cacheKey,
      async () => {
        return await getUniverseIdFromPlace(placeId);
      },
      ttl
    );
  } catch (error) {
    console.error(`Error fetching universe ID for ${placeId}:`, error);
    throw error;
  }
}

/**
 * Get game votes (likes/dislikes)
 */
export async function getGameVotes(placeId: number) {
  const cacheKey = `votes:${placeId}`;
  const ttl = 5 * 60 * 1000; // 5 minutes

  try {
    return await getCached(
      cacheKey,
      async () => {
        const universeId = await getUniverseIdFromPlace(placeId);
        const response = await fetch(`https://games.roblox.com/v1/games/${universeId}/votes`);
        if (!response.ok) {
          throw new Error(`Failed to fetch votes: ${response.statusText}`);
        }
        const votes = await response.json();
        return votes;
      },
      ttl
    );
  } catch (error) {
    console.error(`Error fetching votes for ${placeId}:`, error);
    throw error;
  }
}

/**
 * Search for games by keyword
 */
export async function searchGames(keyword: string, limit: number = 10) {
  const cacheKey = `search:${keyword}:${limit}`;
  const ttl = 10 * 60 * 1000; // 10 minutes

  try {
    return await getCached(
      cacheKey,
      async () => {
        const response = await fetch(
          `https://games.roblox.com/v1/games/list?keyword=${encodeURIComponent(keyword)}&limit=${limit}`
        );
        if (!response.ok) {
          throw new Error(`Failed to search games: ${response.statusText}`);
        }
        const results = await response.json();
        return results;
      },
      ttl
    );
  } catch (error) {
    console.error(`Error searching games for "${keyword}":`, error);
    throw error;
  }
}

/**
 * Clear cache for a specific key or all cache
 */
export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
