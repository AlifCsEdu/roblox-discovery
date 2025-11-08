/**
 * Advanced Search Utilities
 * 
 * Features:
 * - Fuzzy matching with Fuse.js
 * - Relevance scoring
 * - Multiple search strategies
 * - Genre classification
 */

import Fuse from 'fuse.js';

export interface SearchableGame {
  placeId: string;
  name: string;
  playerCount: number;
  thumbnailUrl: string;
  rating?: number;
  totalRatings?: number;
  genres?: string[];
}

export interface SearchResult extends SearchableGame {
  score: number; // Relevance score (0-1, lower is better for Fuse.js)
  matchedFields: string[]; // Which fields matched the query
}

/**
 * Strip emojis, special characters, and brackets from text for better matching
 */
function normalizeText(text: string): string {
  return text
    // Remove emojis
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    // Remove special brackets and common decorative characters
    .replace(/[\[\]【】《》〈〉()（）]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if query words appear consecutively in the text
 */
function hasConsecutiveMatch(text: string, query: string): boolean {
  const textWords = text.toLowerCase().split(/\s+/);
  const queryWords = query.toLowerCase().split(/\s+/);
  
  if (queryWords.length === 1) return true;
  
  // Check if query words appear in order and consecutively
  for (let i = 0; i <= textWords.length - queryWords.length; i++) {
    let match = true;
    for (let j = 0; j < queryWords.length; j++) {
      if (!textWords[i + j].includes(queryWords[j])) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  
  return false;
}

/**
 * Calculate custom relevance score based on multiple factors
 */
function calculateRelevanceScore(
  game: SearchableGame,
  fuseScore: number,
  query: string
): number {
  let score = fuseScore * 100; // Base score from fuzzy match (0-100)
  
  const lowerName = game.name.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Normalize by removing emojis and special characters for better matching
  const normalizedName = normalizeText(game.name).toLowerCase();
  const normalizedQuery = normalizeText(query).toLowerCase();
  
  // Exact match bonus (heavily weighted) - check both original and normalized
  if (lowerName === lowerQuery || normalizedName === normalizedQuery) {
    score *= 0.05; // Much better score
  }
  
  // Starts with query bonus - prioritize normalized version
  if (normalizedName.startsWith(normalizedQuery)) {
    score *= 0.3; // Strong boost for starts-with
  } else if (lowerName.startsWith(lowerQuery)) {
    score *= 0.5;
  }
  
  // Consecutive word match bonus (e.g., "99 nights" matches "99 Nights in the Forest")
  if (hasConsecutiveMatch(normalizedName, normalizedQuery)) {
    score *= 0.4; // Strong boost for consecutive matches
  }
  
  // Contains exact phrase bonus - check normalized version first
  if (normalizedName.includes(normalizedQuery)) {
    score *= 0.6; // Good boost for containing the phrase
  } else if (lowerName.includes(lowerQuery)) {
    score *= 0.7;
  }
  
  // Position bonus - earlier matches are better
  const position = normalizedName.indexOf(normalizedQuery);
  if (position !== -1) {
    const positionRatio = position / normalizedName.length;
    score *= (1 - positionRatio * 0.2); // Up to 20% boost for early matches
  }
  
  // Length ratio bonus - prefer titles where query is a larger portion
  // This helps break ties between "99 Nights in the Forest" vs "99 Nights Ripoff"
  const queryWords = normalizedQuery.split(/\s+/).length;
  const nameWords = normalizedName.split(/\s+/).length;
  const wordRatio = queryWords / nameWords;
  score *= (2 - wordRatio * 0.3); // Up to 30% boost for more focused matches
  
  // Boost popular games slightly (but not too much to override relevance)
  const popularityBoost = Math.min(game.playerCount / 100000, 1.5);
  score *= (2 - popularityBoost * 0.2); // Reduced to max 10% boost for popular games
  
  // Boost highly rated games slightly
  if (game.rating && game.rating >= 90) {
    score *= 0.97; // Reduced impact
  }
  
  return score;
}

/**
 * Search games with fuzzy matching and advanced filtering
 * Note: Rating filters are applied AFTER ratings are fetched in the API
 */
export function searchGames(
  games: SearchableGame[],
  query: string,
  options: {
    genres?: string[];
    minRating?: number;
    maxRating?: number;
    minPlayers?: number;
    limit?: number;
    sortBy?: 'relevance' | 'rating' | 'players' | 'trending';
  } = {}
): SearchResult[] {
  const {
    genres,
    minRating,
    maxRating,
    minPlayers,
    limit = 10,
    sortBy = 'relevance',
  } = options;
  
  // Pre-filter by genres and player count (NOT ratings - those come later)
  let filteredGames = games;
  
  if (genres && genres.length > 0) {
    filteredGames = filteredGames.filter(game => 
      game.genres?.some(g => genres.includes(g.toLowerCase()))
    );
  }
  
  if (minPlayers !== undefined && minPlayers > 0) {
    filteredGames = filteredGames.filter(game => 
      game.playerCount >= minPlayers
    );
  }
  
  // Configure Fuse.js for fuzzy search
  const fuse = new Fuse(filteredGames, {
    keys: [
      { name: 'name', weight: 2 },         // Game name is most important
      { name: 'genres', weight: 0.5 },     // Genre matching is helpful
    ],
    threshold: 0.4,           // 0 = exact match, 1 = match anything
    distance: 100,            // How far to search
    minMatchCharLength: 2,    // Minimum chars to match
    includeScore: true,       // Include match score
    ignoreLocation: true,     // Don't care where in string match occurs
    useExtendedSearch: false, // No special search syntax needed
  });
  
  // Perform fuzzy search
  const fuseResults = fuse.search(query);
  
  // Transform results and calculate custom relevance scores
  const results: SearchResult[] = fuseResults.map(result => {
    const game = result.item;
    const fuseScore = result.score || 0;
    const customScore = calculateRelevanceScore(game, fuseScore, query);
    
    return {
      ...game,
      score: customScore,
      matchedFields: ['name'], // Fuse.js matches on name primarily
    };
  });
  
  // Sort based on preference
  let sorted = results;
  
  if (sortBy === 'relevance') {
    // Already sorted by relevance score (lower is better)
    sorted = results.sort((a, b) => a.score - b.score);
  } else if (sortBy === 'rating') {
    // Rating sort will be applied after ratings are fetched in API
    // For now, sort by player count as a proxy
    sorted = results.sort((a, b) => b.playerCount - a.playerCount);
  } else if (sortBy === 'players') {
    sorted = results.sort((a, b) => b.playerCount - a.playerCount);
  } else if (sortBy === 'trending') {
    // Trending = just use player count since ratings aren't available yet
    // The API will re-sort by (playerCount * rating) after fetching ratings
    sorted = results.sort((a, b) => b.playerCount - a.playerCount);
  }
  
  // Return more results than requested to allow for rating filtering later
  // If rating filter is active, we need extra results
  const hasRatingFilter = minRating !== undefined || maxRating !== undefined;
  const resultLimit = hasRatingFilter ? limit * 3 : limit;
  
  return sorted.slice(0, resultLimit);
}

/**
 * Get search suggestions based on partial query
 * Useful for autocomplete
 */
export function getSearchSuggestions(
  games: SearchableGame[],
  partialQuery: string,
  limit: number = 5
): string[] {
  if (partialQuery.length < 2) return [];
  
  const lowerQuery = partialQuery.toLowerCase();
  const suggestions = new Set<string>();
  
  // Find games that start with or contain the query
  games.forEach(game => {
    const lowerName = game.name.toLowerCase();
    
    if (lowerName.startsWith(lowerQuery) || lowerName.includes(lowerQuery)) {
      suggestions.add(game.name);
    }
    
    // Stop if we have enough suggestions
    if (suggestions.size >= limit * 2) {
      return;
    }
  });
  
  // Sort by popularity and return top matches
  return Array.from(suggestions)
    .map(name => {
      const game = games.find(g => g.name === name);
      return { name, playerCount: game?.playerCount || 0 };
    })
    .sort((a, b) => b.playerCount - a.playerCount)
    .slice(0, limit)
    .map(item => item.name);
}

/**
 * Extract keywords from search query for better matching
 */
export function extractKeywords(query: string): string[] {
  // Remove common words that don't add meaning
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
  
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
}

/**
 * Highlight matching text in results
 */
export function highlightMatch(text: string, query: string): string {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  const index = lowerText.indexOf(lowerQuery);
  if (index === -1) return text;
  
  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);
  
  return `${before}<mark class="bg-yellow-200 dark:bg-yellow-900/50">${match}</mark>${after}`;
}
