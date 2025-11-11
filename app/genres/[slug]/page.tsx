'use client';

import { use, useState, useCallback, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { GameGrid } from '@/components/features/GameGrid';
import { trpc } from '@/lib/api/trpc-client';
import { Button } from '@/components/ui/button';
import { GENRES, DEFAULT_RATING_MIN, DEFAULT_RATING_MAX, DEFAULT_GAMES_PER_PAGE, SORT_OPTIONS } from '@/constants/genres';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameFilters, Game } from '@/types';

interface GenrePageProps {
  params: Promise<{ slug: string }>;
}

export default function GenrePage({ params }: GenrePageProps) {
  const { slug } = use(params);
  
  // Find genre by slug
  const genre = GENRES.find((g) => g.slug === slug);
  
  if (!genre) {
    notFound();
  }

  const [sortBy, setSortBy] = useState<GameFilters['sort']>('trending');
  const [page, setPage] = useState(0);
  const [allGames, setAllGames] = useState<Game[]>([]);

  // Fetch games for this genre
  const { data, isLoading } = trpc.games.list.useQuery({
    genres: [genre.name],
    rating_min: DEFAULT_RATING_MIN,
    rating_max: DEFAULT_RATING_MAX,
    sort: sortBy,
    limit: DEFAULT_GAMES_PER_PAGE,
    offset: page * DEFAULT_GAMES_PER_PAGE,
  });

  // Accumulate games when new page loads
  useEffect(() => {
    if (!data?.games) return;
    
    if (page === 0) {
      setAllGames(data.games);
    } else {
      setAllGames((prev) => [...prev, ...data.games]);
    }
  }, [data, page]);

  const handleSortChange = useCallback((newSort: GameFilters['sort']) => {
    setSortBy(newSort);
    setPage(0);
    setAllGames([]);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (data?.total && allGames.length < data.total) {
      setPage((prev) => prev + 1);
    }
  }, [data, allGames.length]);

  const hasMore = data?.total ? allGames.length < data.total : false;

  return (
    <div className="min-h-screen">
      {/* Animated Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Header */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
        
        {/* Animated gradient orb */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"
        />
        
        <div className="container mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
            >
              <a href="/explore" className="hover:text-primary transition-colors flex items-center gap-1 group">
                <motion.svg 
                  className="w-4 h-4 group-hover:rotate-12 transition-transform" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </motion.svg>
                Explore
              </a>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-foreground font-medium">{genre.name}</span>
            </motion.div>

            {/* Title with enhanced gradient */}
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-7xl font-black mb-6 gradient-text leading-tight"
            >
              {genre.name} Games
            </motion.h1>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed"
            >
              Discover the best {genre.name.toLowerCase()} games on Roblox with ratings above 80%
            </motion.p>

            {/* Enhanced Stats Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 inline-flex items-center gap-3 glass-card px-6 py-3 rounded-full border border-primary/20 shadow-lg shadow-primary/10"
            >
              <motion.div 
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
              />
              <span className="text-sm font-semibold">
                {data?.total ? (
                  <><span className="text-primary">{data.total}</span> games available</>
                ) : (
                  'Loading...'
                )}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        {/* Sort Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="glass-card rounded-2xl p-6 border border-primary/20 shadow-xl shadow-primary/5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                </motion.div>
                <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Sort by</span>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <AnimatePresence mode="wait">
                  {SORT_OPTIONS.map((option, index) => (
                    <motion.div
                      key={option.value}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <Button
                        onClick={() => handleSortChange(option.value)}
                        variant={sortBy === option.value ? 'default' : 'outline'}
                        size="sm"
                        className={sortBy === option.value 
                          ? 'modern-button shadow-lg' 
                          : 'hover:border-primary/50 hover:text-primary hover:shadow-md transition-all duration-300'
                        }
                      >
                        {option.label}
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl border border-primary/20 shadow-md"
                >
                  <motion.svg 
                    className="w-4 h-4 text-primary" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ rotate: 10 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </motion.svg>
                  <span className="text-sm font-semibold">
                    Showing <span className="text-primary font-bold">{allGames.length}</span> of{' '}
                    <span className="text-primary font-bold">{data.total}</span> games
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Grid */}
        <GameGrid
          games={allGames}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      </section>
    </div>
  );
}
