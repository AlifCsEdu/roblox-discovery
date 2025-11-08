'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FilterPanel } from '@/components/features/FilterPanel';
import { GameGrid } from '@/components/features/GameGrid';
import { trpc } from '@/lib/api/trpc-client';
import { Button } from '@/components/ui/button';
import type { GameFilters } from '@/types';
import { DEFAULT_RATING_MIN, DEFAULT_RATING_MAX, DEFAULT_GAMES_PER_PAGE } from '@/constants/genres';
import { motion, AnimatePresence } from 'framer-motion';

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<GameFilters>(() => ({
    genres: searchParams.get('genres')?.split(',').filter(Boolean) || [],
    rating_min: Number(searchParams.get('rating_min')) || DEFAULT_RATING_MIN,
    rating_max: Number(searchParams.get('rating_max')) || DEFAULT_RATING_MAX,
    sort: (searchParams.get('sort') as GameFilters['sort']) || 'trending',
    limit: DEFAULT_GAMES_PER_PAGE,
    offset: 0,
  }));

  const [page, setPage] = useState(0);
  const [allGames, setAllGames] = useState<any[]>([]);

  // Fetch games with current filters
  const { data, isLoading, error, refetch } = trpc.games.list.useQuery({
    ...filters,
    offset: page * DEFAULT_GAMES_PER_PAGE,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.genres && filters.genres.length > 0) {
      params.set('genres', filters.genres.join(','));
    }
    if (filters.rating_min !== DEFAULT_RATING_MIN) {
      params.set('rating_min', String(filters.rating_min));
    }
    if (filters.rating_max !== DEFAULT_RATING_MAX) {
      params.set('rating_max', String(filters.rating_max));
    }
    if (filters.sort !== 'trending') {
      params.set('sort', filters.sort);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/explore?${queryString}` : '/explore';
    
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Accumulate games when new page loads
  useEffect(() => {
    if (data?.games) {
      if (page === 0) {
        setAllGames(data.games);
      } else {
        setAllGames((prev) => [...prev, ...data.games]);
      }
    }
  }, [data, page]);

  // Reset to page 0 when filters change
  const handleFilterChange = useCallback((newFilters: Partial<GameFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(0);
    setAllGames([]);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (data?.total && allGames.length < data.total) {
      setPage((prev) => prev + 1);
    }
  }, [data?.total, allGames.length]);

  const hasMore = data?.total ? allGames.length < data.total : false;

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if desktop on mount and handle resize
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setShowMobileFilters(false);
      }
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Animated Background Decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header with animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 relative"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Explore Games
                </span>
              </h1>
              <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                Discover 7,113+ quality Roblox games filtered by your preferences. Use advanced filters to find your next adventure.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ delay: 0.2 }}
              className="glass-card px-6 py-4 rounded-2xl border-2 border-primary/20 shadow-xl shadow-primary/10"
            >
              <div className="flex items-center gap-3">
                <motion.span 
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-400/70"
                />
                <div>
                  <div className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Live Data</div>
                  <div className="text-xs text-muted-foreground font-medium">Updated 5 min ago</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="flex gap-8">
          {/* Mobile Filter Toggle - Floating Action Button */}
          <AnimatePresence>
            {!showMobileFilters && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="lg:hidden fixed bottom-6 right-6 z-50"
              >
                <Button
                  onClick={() => setShowMobileFilters(true)}
                  size="lg"
                  className="rounded-full shadow-2xl shadow-purple-500/30 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 h-14 w-14 p-0"
                >
                  <motion.svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </motion.svg>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sidebar Filters */}
          <AnimatePresence>
            {(showMobileFilters || isDesktop) && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`
                  w-80 flex-shrink-0 
                  lg:block lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto
                  ${
                    showMobileFilters
                      ? 'fixed inset-0 z-40 bg-background/95 backdrop-blur-xl p-6 overflow-y-auto'
                      : 'hidden'
                  }
                `}
              >
                {showMobileFilters && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 flex items-center justify-between lg:hidden"
                  >
                    <h2 className="text-2xl font-bold gradient-text">Filters</h2>
                    <Button
                      onClick={() => setShowMobileFilters(false)}
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </motion.div>
                )}
                <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <motion.main 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 min-w-0"
          >
            {/* Error State */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 glass-card p-6 border border-red-500/30 rounded-2xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-400 mb-2">Error loading games</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {error.message || 'An unexpected error occurred. Please try again.'}
                      </p>
                      <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                        Retry
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Count & Quick Actions */}
            {data && !error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="mb-6 glass-card p-4 rounded-2xl border-2 border-primary/20 shadow-md"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {allGames.length.toLocaleString()} of {data.total.toLocaleString()} games
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {filters.genres && filters.genres.length > 0 && `${filters.genres.length} genre${filters.genres.length > 1 ? 's' : ''} selected`}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05, x: 2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => {
                        setFilters({
                          genres: [],
                          rating_min: DEFAULT_RATING_MIN,
                          rating_max: DEFAULT_RATING_MAX,
                          sort: 'trending',
                          limit: DEFAULT_GAMES_PER_PAGE,
                          offset: 0,
                        });
                        setPage(0);
                        setAllGames([]);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-2 hover:border-primary/50 hover:text-primary hover:shadow-lg hover:shadow-primary/10 transition-all"
                    >
                      <motion.svg 
                        className="w-4 h-4 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.5 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </motion.svg>
                      Reset All
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Game Grid */}
            {!error && (
              <GameGrid
                games={allGames}
                isLoading={isLoading}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
              />
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
          <p className="text-lg font-medium gradient-text">Loading amazing games...</p>
        </motion.div>
      </div>
    }>
      <ExplorePageContent />
    </Suspense>
  );
}
