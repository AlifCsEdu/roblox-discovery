'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchBar } from '@/components/features/SearchBar';
import { GameGrid } from '@/components/features/GameGrid';
import { trpc } from '@/lib/api/trpc-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import { GENRES, SORT_OPTIONS } from '@/constants/genres';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL params
  const [inputValue, setInputValue] = useState(searchParams.get('q') || ''); // What user is typing
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || ''); // What we actually search for
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

  // Handle input change (just updates the input field, doesn't trigger search)
  const handleInputChange = (value: string) => {
    console.log('[SEARCH PAGE] Input changed to:', value);
    setInputValue(value);
  };

  // Handle search trigger (Enter key press from SearchBar)
  const handleSearch = () => {
    console.log('[SEARCH PAGE] Triggering search for:', inputValue);
    setSearchQuery(inputValue);
    setPage(0);
  };

  // Fetch search results
  const { data, isLoading, error, refetch } = trpc.search.games.useQuery(
    {
      query: searchQuery,
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
      rating_min: ratingRange[0] > 0 ? ratingRange[0] : undefined,
      rating_max: ratingRange[1] < 100 ? ratingRange[1] : undefined,
      min_players: minPlayers > 0 ? minPlayers : undefined,
      sort: sortBy as any,
      limit: limit * (page + 1),
    },
    {
      enabled: searchQuery.length > 2,
      refetchOnMount: true,
      // Force fresh data on every query change by disabling cache
      refetchOnReconnect: false,
      retry: false,
    }
  );

  // Debug logging
  useEffect(() => {
    console.log('[SEARCH PAGE] State:', { 
      inputValue,
      searchQuery,
      page, 
      limit, 
      totalLimit: limit * (page + 1), 
      dataLength: data?.length, 
      isLoading, 
      hasError: !!error,
      dataFirstGame: data?.[0]?.title 
    });
  }, [inputValue, searchQuery, page, data, isLoading, error, limit]);

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

  const hasMore = (data && data.length === limit * (page + 1)) || false;

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

        {/* Advanced Filters Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-6 bg-card border-2 border-border rounded-2xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Advanced Filters</h2>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Genre filters */}
            <div>
              <label className="text-sm font-semibold mb-3 block">Genres</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => (
                  <Badge
                    key={genre.slug}
                    variant={selectedGenres.includes(genre.slug) ? 'default' : 'outline'}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => toggleGenre(genre.slug)}
                  >
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Rating slider */}
            <div>
              <label className="text-sm font-semibold mb-3 block">
                Rating Range: {ratingRange[0]}% - {ratingRange[1]}%
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
              />
            </div>

            {/* Min players & Sort */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Minimum Players</label>
                <input
                  type="number"
                  min={0}
                  value={minPlayers || ''}
                  onChange={(e) => {
                    setMinPlayers(parseInt(e.target.value) || 0);
                    setPage(0);
                  }}
                  placeholder="e.g., 1000"
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
              {data && data.length > 0 && (
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
                        Found {data.length.toLocaleString()} {data.length === 1 ? 'game' : 'games'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        for "{searchQuery}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Game Grid */}
              {data && data.length > 0 ? (
                <GameGrid
                  games={data}
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
