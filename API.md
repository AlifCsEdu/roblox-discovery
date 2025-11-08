# API Documentation

This document describes all available API endpoints via tRPC.

## Base URL

All tRPC calls go through: `/api/trpc`

## URL Format (Manual Testing)

When testing TRPC endpoints manually via curl or browser, use the **batch format** for proper array parameter parsing:

```bash
# ✅ CORRECT - Batch format (required for arrays)
curl 'http://localhost:3000/api/trpc/games.list?batch=1&input={"0":{"genres":["rpg"],"limit":20}}'

# ❌ INCORRECT - Non-batch format (breaks optional arrays)
curl 'http://localhost:3000/api/trpc/games.list?input={"json":{"genres":["rpg"]}}'
```

**Important Notes:**
- The TRPC React client (`trpc.games.list.useQuery()`) automatically uses batch format
- Manual API testing via curl/browser requires explicit `batch=1` parameter
- Array parameters like `genres` will not parse correctly without batch format
- Single parameters (strings, numbers) work in both formats

## Type Safety

All endpoints are fully type-safe. Import the client:

```typescript
import { trpc } from '@/lib/api/trpc-client';
```

## Endpoints

### Games

#### `games.list`

Get a paginated list of games with filters.

**Input:**
```typescript
{
  genres?: string[];          // Filter by genre names (AND logic)
  rating_min?: number;         // Minimum rating (0-100)
  rating_max?: number;         // Maximum rating (0-100)
  sort: 'trending' | 'rating' | 'new' | 'players';
  limit: number;              // Results per page (default: 20)
  offset: number;             // Pagination offset
}
```

**Output:**
```typescript
{
  games: Game[];
  total: number;              // Total matching games
}
```

**Example:**
```typescript
const { data } = trpc.games.list.useQuery({
  genres: ['RPG', 'Adventure'],
  rating_min: 80,
  rating_max: 100,
  sort: 'trending',
  limit: 20,
  offset: 0,
});

console.log(data.games);      // Array of games
console.log(data.total);      // Total count for pagination
```

**Sort Options:**
- `trending` - By current player count (descending)
- `rating` - By quality score (descending)
- `new` - By creation date (newest first)
- `players` - By 7-day average player count (descending)

---

#### `games.detail`

Get detailed information about a single game, including user ratings.

**Input:**
```typescript
robloxId: number              // Roblox game ID
```

**Output:**
```typescript
Game & {
  user_ratings: {
    id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
  }[]
}
```

**Example:**
```typescript
const { data: game } = trpc.games.detail.useQuery(292439477);

console.log(game.title);              // "Phantom Forces"
console.log(game.rating);             // 92
console.log(game.user_ratings);       // Array of ratings
```

---

### Genres

#### `genres.list`

Get all available genres.

**Input:** None

**Output:**
```typescript
Genre[]
```

**Example:**
```typescript
const { data: genres } = trpc.genres.list.useQuery();

genres.forEach(genre => {
  console.log(genre.name);    // "RPG", "Simulator", etc.
});
```

---

### Search

#### `search.games`

Full-text search across game titles and descriptions.

**Input:**
```typescript
query: string                 // Search query
```

**Output:**
```typescript
Game[]                        // Max 10 results
```

**Example:**
```typescript
const { data: results } = trpc.search.games.useQuery('phantom');

console.log(results);         // Games matching "phantom"
```

**Search Features:**
- Searches in `title` and `description`
- Uses PostgreSQL full-text search
- Supports phrases: `"exact match"`
- Supports operators: `word1 & word2`, `word1 | word2`
- Returns max 10 results
- Only returns active games

---

## Types

### Game

```typescript
interface Game {
  id: string;                           // UUID
  roblox_id: number;                    // Roblox game ID
  title: string;                        // Game title
  description: string | null;           // Game description
  thumbnail_url: string | null;         // Thumbnail image URL
  rating: number;                       // Average rating (0-100)
  quality_score: number;                // Computed score
  player_count_current: number;         // Current players
  player_count_24h_peak: number;        // 24h peak players
  player_count_7d_avg: number;          // 7-day average
  total_visits: number | null;          // Total visits
  genres: string[];                     // Array of genre names
  is_active: boolean;                   // Visibility flag
  created_at: string;                   // ISO timestamp
  updated_at: string;                   // ISO timestamp
}
```

### Genre

```typescript
interface Genre {
  id: string;                           // UUID
  name: string;                         // Genre name
  slug: string;                         // URL-friendly slug
  description: string | null;           // Genre description
  created_at: string;                   // ISO timestamp
}
```

### GameFilters

```typescript
interface GameFilters {
  genres?: string[];
  rating_min?: number;
  rating_max?: number;
  sort: 'trending' | 'rating' | 'new' | 'players';
  limit: number;
  offset: number;
}
```

---

## React Query Integration

All tRPC calls use React Query under the hood.

### Caching

```typescript
// Cached for 5 minutes by default
const { data } = trpc.games.list.useQuery({ ... });

// Custom cache time
const { data } = trpc.games.list.useQuery(
  { ... },
  { staleTime: 10 * 60 * 1000 } // 10 minutes
);
```

### Refetching

```typescript
const { data, refetch } = trpc.games.list.useQuery({ ... });

// Manual refetch
await refetch();
```

### Loading States

```typescript
const { data, isLoading, isError, error } = trpc.games.list.useQuery({ ... });

if (isLoading) return <Spinner />;
if (isError) return <div>Error: {error.message}</div>;
return <GameGrid games={data.games} />;
```

### Conditional Fetching

```typescript
// Only fetch if genres are available
const { data } = trpc.games.list.useQuery(
  { genres: selectedGenres, ... },
  { enabled: selectedGenres.length > 0 }
);
```

---

## Server Actions (Future)

For mutations (creating, updating, deleting), we'll add React 19 Server Actions:

```typescript
// Example (not yet implemented)
async function rateGame(gameId: string, rating: number) {
  'use server';
  
  const supabase = await createClient();
  await supabase.from('user_ratings').insert({
    game_id: gameId,
    rating,
  });
}
```

---

## Rate Limiting

Current limits:
- **tRPC**: No limit (internal API)
- **Noblox.js**: 60 requests/minute (automatic throttling)
- **Supabase**: 
  - Free tier: 50,000 monthly active users
  - Realtime: 200 concurrent connections

For production, add rate limiting middleware.

---

## Error Handling

All errors are returned in a standardized format:

```typescript
try {
  const data = await trpc.games.detail.query(123);
} catch (error) {
  console.error(error.message);  // User-friendly message
  console.error(error.code);     // Error code
}
```

Common error codes:
- `NOT_FOUND` - Resource doesn't exist
- `BAD_REQUEST` - Invalid input
- `INTERNAL_SERVER_ERROR` - Server error

---

## Performance Tips

1. **Use pagination**: Don't load all games at once (7,113+ games available)
2. **Enable caching**: Set appropriate `staleTime` for static data
3. **Debounce search**: Wait for user to stop typing (300-500ms recommended)
4. **Prefetch**: Use `prefetchQuery` for better UX
5. **Infinite scroll**: Load pages on demand instead of all at once

### Data Source Strategy

The platform uses a hybrid data approach for optimal performance:

**List Views (Homepage, Explore, Genres):**
- Source: Rolimons API (7,113+ games)
- Performance: Very fast (~100-500ms)
- Data: Player counts, thumbnails, basic info
- Limitation: No ratings available

**Detail Views (Game Pages):**
- Source: Roblox API
- Performance: Slower (~500-1000ms, rate limited)
- Data: Full game info including ratings, description, creator
- Note: Requires place ID → universe ID conversion

### Caching & Performance

```typescript
// In-memory cache (5-10 min TTL)
const cache = new Map<string, CacheEntry<any>>();

// Rate limiting (60 requests/minute)
class RateLimiter {
  private readonly maxRequests = 60;
  private readonly windowMs = 60 * 1000;
}
```

### Pagination Performance

With 7,113+ games, pagination is critical:
- Default page size: 20 games
- Infinite scroll loads pages on demand
- Intersection Observer for automatic loading
- Average page load: <2 seconds

```typescript
// Prefetch next page
const utils = trpc.useContext();
utils.games.list.prefetch({
  offset: (page + 1) * 20,
  ...filters
});
```

---

## Testing

Test tRPC endpoints:

```typescript
// In a test file
import { appRouter } from '@/lib/api/trpc-server';
import { createClient } from '@/lib/supabase/server';

const caller = appRouter.createCaller({
  supabase: await createClient(),
});

const result = await caller.games.list({
  rating_min: 80,
  sort: 'trending',
  limit: 10,
  offset: 0,
});

expect(result.games.length).toBeLessThanOrEqual(10);
```
