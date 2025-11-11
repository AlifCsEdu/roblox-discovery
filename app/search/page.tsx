'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GameGrid } from '@/components/features/GameGrid';
import { trpc } from '@/lib/api/trpc-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { GameGridSkeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { GENRES, SORT_OPTIONS } from '@/constants/genres';
import type { Game } from '@/types';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL params
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get('genres')?.split(',').filter(Boolean) || []
  );
  const [ratingRange, setRatingRange] = useState<[number, number]>([
    Number(searchParams.get('rating_min')) || 0,
    Number(searchParams.get('rating_max')) || 100,
  ]);
  const [minPlayers, setMinPlayers] = useState(Number(searchParams.get('min_players')) || 0);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [page, setPage] = useState(0);
  const limit = 20;

  // Store results with and without ratings
  const [instantResults, setInstantResults] = useState<Game[]>([]);
  const [finalResults, setFinalResults] = useState<Game[]>([]);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  // Handle search trigger
  const handleSearch = () => {
    console.log('[SEARCH PAGE] Triggering instant search for:', inputValue);
    setSearchQuery(inputValue);
    setPage(0);
  };

  // INSTANT search - no ratings
  const { data: instantData, isLoading: isLoadingInstant, error, refetch } = trpc.search.instant.useQuery(
    {
      query: searchQuery,
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
      min_players: minPlayers > 0 ? minPlayers : undefined,
      sort: sortBy === 'rating' ? 'relevance' : (sortBy as 'relevance' | 'players' | 'trending'),
      limit: limit * (page + 1),
    },
    {
      enabled: searchQuery.length > 2,
      refetchOnMount: true,
      refetchOnReconnect: false,
      retry: false,
    }
  );

  // Update instant results and trigger rating fetch
  useEffect(() => {
    if (instantData) {
      console.log('[SEARCH] Got instant results:', instantData.length);
      setInstantResults(instantData);
      
      // Start fetching ratings in background
      if (instantData.length > 0) {
        setIsLoadingRatings(true);
        fetchRatings(instantData);
      }
    }
  }, [instantData]);

  // Fetch ratings progressively
  const fetchRatings = async (games: Game[]) => {
    try {
      const placeIds = games.map(g => String(g.roblox_id));
      console.log('[SEARCH] Fetching ratings for', placeIds.length, 'games');
      
      // Fetch ratings from the API endpoint directly
      const response = await fetch('/api/trpc/search.ratings?input=' + encodeURIComponent(JSON.stringify({ placeIds })));
      const result = await response.json();
      const ratingsMap = result.result.data;
      
      console.log('[SEARCH] Got ratings:', Object.keys(ratingsMap).length);
      
      // Merge ratings into results
      const gamesWithRatings = games.map(game => {
        const rating = ratingsMap[String(game.roblox_id)];
        if (rating) {
          return {
            ...game,
            rating: rating.rating,
            total_ratings: rating.totalRatings,
            quality_score: rating.rating || 0,
          };
        }
        return game;
      });

      // Apply rating filter if active
      let filteredGames = gamesWithRatings;
      const hasRatingFilter = ratingRange[0] > 0 || ratingRange[1] < 100;
      
      if (hasRatingFilter) {
        filteredGames = gamesWithRatings.filter(game => {
          if (game.rating === null || game.rating === 0) return false;
          return game.rating >= ratingRange[0] && game.rating <= ratingRange[1];
        });
      }

      // Re-sort if sorting by rating
      if (sortBy === 'rating') {
        filteredGames = filteredGames.sort((a, b) => {
          if (a.rating === null && b.rating === null) return 0;
          if (a.rating === null) return 1;
          if (b.rating === null) return -1;
          return b.rating - a.rating;
        });
      }

      setFinalResults(filteredGames);
      setIsLoadingRatings(false);
    } catch (err) {
      console.error('[SEARCH] Error fetching ratings:', err);
      // Keep instant results even if rating fetch fails
      setFinalResults(games);
      setIsLoadingRatings(false);
    }
  };

  // Determine which results to show
  const displayResults = finalResults.length > 0 ? finalResults : instantResults;
  const isLoading = isLoadingInstant;

  // Debug logging
  useEffect(() => {
    console.log('[SEARCH PAGE] State:', { 
      inputValue,
      searchQuery,
      instantResults: instantResults.length,
      finalResults: finalResults.length,
      displayResults: displayResults.length,
      isLoading,
      isLoadingRatings,
    });
  }, [inputValue, searchQuery, instantResults, finalResults, displayResults, isLoading, isLoadingRatings]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (selectedGenres.length > 0) params.set('genres', selectedGenres.join(','));
    if (ratingRange[0] > 0) params.set('rating_min', String(ratingRange[0]));
    if (ratingRange[1] < 100) params.set('rating_max', String(ratingRange[1]));
    if (minPlayers > 0) params.set('min_players', String(minPlayers));
    if (sortBy !== 'relevance') params.set('sort', sortBy);

    const queryString = params.toString();
    const newUrl = queryString ? `/search?${queryString}` : '/search';
    
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedGenres, ratingRange, minPlayers, sortBy, router]);

  const toggleGenre = (slug: string) => {
    setSelectedGenres(prev => 
      prev.includes(slug) ? prev.filter(g => g !== slug) : [...prev, slug]
    );
    setPage(0);
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setRatingRange([0, 100]);
    setMinPlayers(0);
    setSortBy('relevance');
    setPage(0);
  };

  const hasActiveFilters = selectedGenres.length > 0 || ratingRange[0] > 0 || ratingRange[1] < 100 || minPlayers > 0;

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const hasMore = (displayResults && displayResults.length === limit * (page + 1)) || false;

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Search Games
            </span>
          </h1>
          
          {/* Search Bar */}
          <div className="max-w-3xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search 7,000+ games... (Press Enter to search)"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputValue.length > 2) {
                    handleSearch();
                  }
                }}
                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10 transition-all bg-background text-foreground"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Advanced Filters - COMPACT & PROFESSIONAL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 relative rounded-xl bg-card border border-border shadow-sm"
        >
          <div className="p-4 md:p-5">
            {/* Compact Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filters
                {selectedGenres.length > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded">
                    {selectedGenres.length}
                  </span>
                )}
              </h2>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Compact Genre Pills */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Genres</label>
                <div className="flex flex-wrap gap-1.5">
                  {GENRES.map((genre) => {
                    const isSelected = selectedGenres.includes(genre.slug);
                    return (
                      <Badge
                        key={genre.slug}
                        variant={isSelected ? 'default' : 'outline'}
                        className={`cursor-pointer text-xs px-2.5 py-1 rounded-md transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        }`}
                        onClick={() => toggleGenre(genre.slug)}
                      >
                        {genre.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Compact Grid for Other Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Rating Range - Compact */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Rating: {ratingRange[0]}% - {ratingRange[1]}%
                  </label>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={ratingRange}
                    onValueChange={(val) => {
                      setRatingRange(val);
                      setPage(0);
                    }}
                    className="mt-2"
                  />
                </div>

                {/* Minimum Players - Compact */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Min Players</label>
                  <input
                    type="number"
                    min={0}
                    value={minPlayers || ''}
                    onChange={(e) => {
                      setMinPlayers(parseInt(e.target.value) || 0);
                      setPage(0);
                    }}
                    placeholder="e.g., 1000"
                    className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                  />
                </div>

                {/* Sort By - Compact & Fixed Styling */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Sort By</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(0);
                      }}
                      className="w-full px-3 py-1.5 pr-8 text-sm bg-background border border-input rounded-md focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all appearance-none cursor-pointer"
                    >
                      <option value="relevance">Relevance</option>
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {searchQuery.length <= 2 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Start Searching</h3>
              <p className="text-muted-foreground">Enter at least 3 characters and press Enter to search</p>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 border border-red-500/30 rounded-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Search Error</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {error.message || 'Failed to search games. Please try again.'}
                  </p>
                  <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                    Retry
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Results count */}
              {displayResults && displayResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 glass-card p-4 rounded-2xl border-2 border-primary/20 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        Found {displayResults.length.toLocaleString()} {displayResults.length === 1 ? 'game' : 'games'}
                        {isLoadingRatings && <span className="text-xs text-muted-foreground ml-2">(loading ratings...)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        for &quot;{searchQuery}&quot;
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Game Grid */}
              {isLoading ? (
                <GameGridSkeleton count={12} />
              ) : displayResults && displayResults.length > 0 ? (
                <GameGrid
                  games={displayResults}
                  isLoading={isLoading}
                  hasMore={hasMore}
                  onLoadMore={handleLoadMore}
                />
              ) : !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-500/20 to-slate-600/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No games found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
          <p className="text-lg font-medium gradient-text">Loading search...</p>
        </motion.div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
