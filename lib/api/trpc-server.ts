import { router, publicProcedure, gameListInputSchema, gameDetailInputSchema, searchInputSchema } from './trpc';
import { 
  classifyGenres,
  getEnrichedGameHybrid,
  getRolimonsGames,
  sortRolimonsGames,
  batchPlaceIdToUniverseId,
  getBatchGameVotes,
  calculateRating,
} from '@/lib/roblox-api';
import { searchGames, type SearchableGame } from '@/lib/utils/search';

export const appRouter = router({
  games: router({
    // List games with filters - REAL-TIME from Rolimons + Ratings from Roblox API
    list: publicProcedure
      .input(gameListInputSchema)
      .query(async ({ input }) => {
        console.log(`[TRPC INPUT] Raw input received:`, JSON.stringify(input, null, 2));
        
        // Fetch games from Rolimons (7,113+ games!)
        const rolimonsGames = await getRolimonsGames();
        
        // Filter out inactive games (0 players) - these are usually unpublished or test games
        let filteredGames = rolimonsGames.filter(game => game.playerCount > 0);
        
        // Filter by genres if provided
        if (input.genres && input.genres.length > 0) {
          filteredGames = filteredGames.filter(game => {
            const gameGenres = classifyGenres(game.name);
            const matches = input.genres!.some(g => gameGenres.includes(g.toLowerCase()));
            return matches;
          });
        }
        
        // Sort BEFORE rating filter to get top games first
        const sortedGames = sortRolimonsGames(filteredGames, input.sort);
        
        // Determine how many games to fetch based on rating filter
        // If rating filter is active, fetch more games to compensate for filtering
        const hasRatingFilter = input.rating_min > 0 || input.rating_max < 100;
        const fetchMultiplier = hasRatingFilter ? 3 : 1; // Fetch 3x more games when rating filter is active
        const fetchCount = Math.min(input.limit * fetchMultiplier, 60); // Cap at 60 games max for performance
        const gamesToFetch = sortedGames.slice(
          input.offset, 
          input.offset + fetchCount
        );
        
        // Convert all place IDs to universe IDs in one batch call
        const placeIds = gamesToFetch.map(g => parseInt(g.placeId));
        const universeMap = await batchPlaceIdToUniverseId(placeIds);
        
        // Batch fetch all votes in one API call
        const universeIds = Array.from(universeMap.values());
        const votesMap = await getBatchGameVotes(universeIds);
        
        // Map ratings back to games
        const gamesWithRatings = gamesToFetch.map((game) => {
          const universeId = universeMap.get(parseInt(game.placeId));
          if (!universeId) {
            return { ...game, rating: null, totalRatings: 0 };
          }
          
          const votes = votesMap.get(universeId) || { upVotes: 0, downVotes: 0 };
          const rating = calculateRating(votes.upVotes, votes.downVotes);
          
          
          return {
            ...game,
            rating,
            totalRatings: votes.upVotes + votes.downVotes,
          };
        });
        
        // If sorting by rating, re-sort with actual rating data
        let sortedWithRatings = gamesWithRatings;
        if (input.sort === 'rating') {
          sortedWithRatings = gamesWithRatings.sort((a, b) => {
            // Games without ratings go to the end
            if (a.rating === null && b.rating === null) return 0;
            if (a.rating === null) return 1;
            if (b.rating === null) return -1;
            return b.rating - a.rating;
          });
        }
        
        // Apply rating filter AFTER fetching ratings
        let finalGames = sortedWithRatings;
        
        if (hasRatingFilter) {
          // Check if we successfully got any ratings (to avoid filtering all games when API fails)
          const hasAnyValidRatings = sortedWithRatings.some(g => g.rating !== null && g.rating > 0);
          
          if (hasAnyValidRatings) {
            finalGames = sortedWithRatings.filter(game => {
              // Filter out games with null or 0 rating (0 means no votes)
              if (game.rating === null || game.rating === 0) return false;
              return game.rating >= input.rating_min && game.rating <= input.rating_max;
            });
          } else {
            // If no ratings were fetched (API failure), don't filter by rating
          }
        }
        
        // Limit to requested amount after filtering
        finalGames = finalGames.slice(0, input.limit);
        
        // Transform to match expected format
        const transformedGames = finalGames.map(game => ({
          id: game.placeId,
          roblox_id: parseInt(game.placeId),
          title: game.name,
          description: null,
          creator: null,
          thumbnail_url: game.thumbnailUrl,
          rating: game.rating,
          total_ratings: game.totalRatings,
          player_count_current: game.playerCount,
          player_count_peak: Math.round(game.playerCount * 1.5),
          player_count_7d_avg: game.playerCount,
          visits: 0,
          favorite_count: 0,
          gamepass_count: 0,
          badge_count: 0,
          quality_score: game.rating || 0,
          genres: classifyGenres(game.name),
          tags: [],
          is_active: game.playerCount > 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_crawled: null,
        }));
        
        return {
          games: transformedGames,
          total: sortedGames.length, // Total before rating filter
        };
      }),
    
    // Get single game with ratings - Uses Rolimons for real-time data + Roblox API for details
    detail: publicProcedure
      .input(gameDetailInputSchema)
      .query(async ({ input: robloxId }) => {
        // Input is a place ID - use hybrid enrichment for optimal data
        const placeId = parseInt(robloxId);
        
        console.log(`[TRPC] Fetching game details for place ID: ${placeId}`);
        
        // Fetch game using hybrid approach: Rolimons (real-time) + Roblox API (details)
        const game = await getEnrichedGameHybrid(placeId);
        
        if (!game) {
          console.error(`[TRPC] Game not found for place ID: ${placeId}`);
          throw new Error(`Game not found: ${placeId}`);
        }
        
        return {
          id: String(game.rootPlaceId), // Use rootPlaceId as unique identifier
          roblox_id: game.rootPlaceId,
          title: game.name,
          description: game.description,
          creator: game.creator.name,
          thumbnail_url: game.thumbnailUrl, // From Rolimons (real-time cache)
          rating: game.rating,
          total_ratings: game.upVotes + game.downVotes,
          up_votes: game.upVotes,
          down_votes: game.downVotes,
          player_count_current: game.playing, // From Rolimons (real-time!)
          player_count_peak: Math.round(game.playing * 1.5),
          player_count_7d_avg: game.playing,
          visits: game.visits,
          favorite_count: game.favoritedCount,
          gamepass_count: 0,
          badge_count: 0,
          quality_score: game.rating || 0,
          genres: classifyGenres(game.name),
          tags: [],
          is_active: true,
          created_at: game.created,
          updated_at: game.updated,
          last_crawled: null,
          user_ratings: [], // No user ratings in real-time mode
        };
      }),
  }),
  
  genres: router({
    // List all genres - STATIC list, no database needed
    list: publicProcedure
      .query(async () => {
        // Return static genre list
        return [
          { id: '1', name: 'RPG', slug: 'rpg', color: 'red-500', icon: 'sword' },
          { id: '2', name: 'Simulator', slug: 'simulator', color: 'blue-500', icon: 'cogwheel' },
          { id: '3', name: 'Obby', slug: 'obby', color: 'orange-500', icon: 'trending-up' },
          { id: '4', name: 'Shooter', slug: 'shooter', color: 'red-600', icon: 'target' },
          { id: '5', name: 'Horror', slug: 'horror', color: 'slate-700', icon: 'ghost' },
          { id: '6', name: 'Roleplay', slug: 'roleplay', color: 'purple-500', icon: 'users' },
          { id: '7', name: 'PvP', slug: 'pvp', color: 'rose-500', icon: 'swords' },
          { id: '8', name: 'Social', slug: 'social', color: 'green-500', icon: 'users' },
        ];
      }),
  }),
  
  search: router({
    // Search games - Using Rolimons data (7,113+ games!) with fuzzy matching
    games: publicProcedure
      .input(searchInputSchema)
      .query(async ({ input }) => {
        console.log('[SEARCH] Query:', JSON.stringify(input, null, 2));
        
        // Fetch all games from Rolimons
        const rolimonsGames = await getRolimonsGames();
        
        // Convert to SearchableGame format with genres
        const searchableGames: SearchableGame[] = rolimonsGames.map(game => ({
          placeId: game.placeId,
          name: game.name,
          playerCount: game.playerCount,
          thumbnailUrl: game.thumbnailUrl,
          genres: classifyGenres(game.name),
        }));
        
        // Use advanced search with fuzzy matching
        // Note: Rating filters are NOT applied here - they'll be applied after we fetch ratings
        const searchResults = searchGames(searchableGames, input.query, {
          genres: input.genres,
          minRating: input.rating_min,
          maxRating: input.rating_max,
          minPlayers: input.min_players,
          limit: input.limit,
          sortBy: input.sort,
        });
        
        console.log(`[SEARCH] Found ${searchResults.length} initial results`);
        
        // Fetch ratings for search results
        const placeIds = searchResults.map(g => parseInt(g.placeId));
        const universeMap = await batchPlaceIdToUniverseId(placeIds);
        const universeIds = Array.from(universeMap.values());
        const votesMap = await getBatchGameVotes(universeIds);
        
        // Transform results with ratings
        let gamesWithRatings = searchResults.map(game => {
          const universeId = universeMap.get(parseInt(game.placeId));
          const votes = universeId ? votesMap.get(universeId) : null;
          const rating = votes ? calculateRating(votes.upVotes, votes.downVotes) : null;
          
          return {
            id: game.placeId,
            roblox_id: parseInt(game.placeId),
            title: game.name,
            description: null,
            creator: null,
            thumbnail_url: game.thumbnailUrl,
            rating,
            total_ratings: votes ? votes.upVotes + votes.downVotes : 0,
            player_count_current: game.playerCount,
            player_count_peak: Math.round(game.playerCount * 1.5),
            player_count_7d_avg: game.playerCount,
            visits: 0,
            favorite_count: 0,
            gamepass_count: 0,
            badge_count: 0,
            quality_score: rating || 0,
            genres: game.genres || [],
            tags: [],
            is_active: game.playerCount > 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_crawled: null,
          };
        });
        
        console.log(`[SEARCH] Transformed ${gamesWithRatings.length} games with ratings`);
        
        // NOW apply rating filters (after ratings are fetched)
        if (input.rating_min !== undefined || input.rating_max !== undefined) {
          const minRating = input.rating_min ?? 0;
          const maxRating = input.rating_max ?? 100;
          
          // Check if we successfully got any ratings (to avoid filtering all games when API fails)
          const hasAnyValidRatings = gamesWithRatings.some(g => g.rating !== null && g.rating > 0);
          
          if (hasAnyValidRatings) {
            gamesWithRatings = gamesWithRatings.filter(game => {
              // Filter out games with null or 0 rating when rating filter is active
              if (game.rating === null || game.rating === 0) return false;
              return game.rating >= minRating && game.rating <= maxRating;
            });
            console.log(`[SEARCH] After rating filter (${minRating}-${maxRating}): ${gamesWithRatings.length} games`);
          } else {
            // If no ratings were fetched (API failure), don't filter by rating
            console.log(`[SEARCH] No valid ratings found - skipping rating filter (API may have failed)`);
          }
        }
        
        // NOW apply sorting based on actual ratings
        let sortedGames = gamesWithRatings;
        
        if (input.sort === 'rating') {
          sortedGames = gamesWithRatings.sort((a, b) => {
            if (a.rating === null && b.rating === null) return 0;
            if (a.rating === null) return 1;
            if (b.rating === null) return -1;
            return b.rating - a.rating;
          });
        } else if (input.sort === 'players') {
          sortedGames = gamesWithRatings.sort((a, b) => 
            b.player_count_current - a.player_count_current
          );
        } else if (input.sort === 'trending') {
          // Trending = balance between players and rating
          sortedGames = gamesWithRatings.sort((a, b) => {
            const scoreA = a.player_count_current * (1 + (a.rating || 0) / 100);
            const scoreB = b.player_count_current * (1 + (b.rating || 0) / 100);
            return scoreB - scoreA;
          });
        }
        // relevance sort is already applied by searchGames()
        
        console.log(`[SEARCH] After sorting by '${input.sort}': ${sortedGames.length} games`);
        
        // Limit to requested amount
        const finalResults = sortedGames.slice(0, input.limit);
        console.log(`[SEARCH] Returning ${finalResults.length} final results`);
        
        return finalResults;
      }),
  }),
});

export type AppRouter = typeof appRouter;
