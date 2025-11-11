'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GameCard } from '@/components/features/GameCard';
import { SearchBar } from '@/components/features/SearchBar';
import { TrendingStats } from '@/components/features/TrendingStats';
import { trpc } from '@/lib/api/trpc-client';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

export default function HomePage() {
  // Fetch trending games
  const { data: trendingData, isLoading: trendingLoading, error: trendingError, refetch: refetchTrending } = trpc.games.list.useQuery({
    rating_min: 0,
    rating_max: 100,
    sort: 'trending',
    limit: 8,
    offset: 0,
  });

  // Fetch hidden gems (high rated but lower player count)
  const { data: hiddenGemsData, isLoading: hiddenGemsLoading, error: hiddenGemsError, refetch: refetchHiddenGems } = trpc.games.list.useQuery({
    rating_min: 0,
    rating_max: 100,
    sort: 'new',
    limit: 4,
    offset: 0,
  });

  // Calculate analytics
  const analytics = useMemo(() => {
    const games = trendingData?.games || [];
    const totalPlayers = games.reduce((sum, game) => {
      const playerCount = game.player_count_current ?? 0;
      return sum + (typeof playerCount === 'number' ? playerCount : 0);
    }, 0);
    
    // Count genres
    const genreCounts: { [key: string]: number } = {};
    games.forEach(game => {
      game.genres?.forEach((genre: string) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    
    const topGenres = Object.entries(genreCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    return {
      totalGames: trendingData?.total || 0,
      activePlayers: totalPlayers,
      topGenres,
    };
  }, [trendingData]);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Ultra Modern */}
      <section className="relative py-24 md:py-40 px-4 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-cyan-600/30 dark:from-blue-500/20 dark:via-purple-500/10 dark:to-cyan-500/20 blur-3xl animate-pulse" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 dark:from-purple-400/20 dark:to-pink-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-500/30 to-blue-500/30 dark:from-cyan-400/20 dark:to-blue-400/20 rounded-full blur-3xl" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative container mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-2 border-primary/20 shadow-lg shadow-primary/10 mb-8"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/70"
            />
            <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">7,113+ Games • Live Data</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Discover Epic
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 bg-clip-text text-transparent">
              Roblox Games
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/70 dark:text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Real-time analytics, advanced filters, and trending insights.
            <br />
            <span className="text-primary font-bold">Find your next favorite game in seconds.</span>
          </p>

          <div className="max-w-2xl mx-auto mb-10">
            <SearchBar placeholder="Search 7,000+ games..." showFilters={true} />
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/explore">
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }} 
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Button size="lg" className="modern-button text-lg px-8 py-6 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50">
                  <motion.svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </motion.svg>
                  Explore Games
                </Button>
              </motion.div>
            </Link>
            <Link href="/explore?sort=trending">
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }} 
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:border-primary/50 hover:bg-primary/10 shadow-lg hover:shadow-xl hover:shadow-primary/20">
                  <motion.svg 
                    className="w-5 h-5 mr-2" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </motion.svg>
                  View Trending
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Analytics Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <TrendingStats
            totalGames={analytics.totalGames}
            activePlayers={analytics.activePlayers}
            topGenres={analytics.topGenres}
          />
        </div>
      </section>

      {/* Trending Games Section */}
      <section className="py-16 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-slate-800/50 dark:from-slate-900/80 dark:to-slate-800/80" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <h2 className="text-4xl font-bold mb-3 gradient-text">
                Trending Now
              </h2>
              <p className="text-muted-foreground text-lg">Most popular games with thousands of active players</p>
            </div>
            <Link href="/explore?sort=trending">
              <motion.div 
                whileHover={{ scale: 1.05, x: 2 }} 
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Button variant="outline" className="gap-2 border-2 hover:border-primary/50 hover:bg-primary/10 shadow-md hover:shadow-lg hover:shadow-primary/20">
                  View All
                  <motion.svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </motion.svg>
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {trendingLoading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : trendingError ? (
            <ErrorState 
              title="Failed to load trending games"
              message={trendingError.message}
              onRetry={refetchTrending}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trendingData?.games.map((game, index: number) => (
                <GameCard key={game.id} game={game} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hidden Gems Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <h2 className="text-4xl font-bold mb-3 gradient-text">
                Hidden Gems
              </h2>
              <p className="text-muted-foreground text-lg">Highly-rated games you might have missed</p>
            </div>
            <Link href="/explore?sort=rating&rating_min=90">
              <motion.div 
                whileHover={{ scale: 1.05, x: 2 }} 
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Button variant="outline" className="gap-2 border-2 hover:border-primary/50 hover:bg-primary/10 shadow-md hover:shadow-lg hover:shadow-primary/20">
                  View All
                  <motion.svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </motion.svg>
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {hiddenGemsLoading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : hiddenGemsError ? (
            <ErrorState 
              title="Failed to load hidden gems"
              message={hiddenGemsError.message}
              onRetry={refetchHiddenGems}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {hiddenGemsData?.games.map((game, index: number) => (
                <GameCard key={game.id} game={game} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-cyan-600/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-cyan-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4 gradient-text">Why RobloxDiscover?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The ultimate platform for discovering and exploring Roblox games
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -12, scale: 1.03 }}
              className="group"
            >
              <Card className="h-full border-2 border-border/50 hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500" />
                <CardContent className="pt-8 pb-8 relative z-10">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/60 transition-shadow"
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all">Real-Time Data</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Live data directly from Roblox. Always up-to-date player counts and ratings refreshed every 5 minutes.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -12, scale: 1.03 }}
              className="group"
            >
              <Card className="h-full border-2 border-border/50 hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500" />
                <CardContent className="pt-8 pb-8 relative z-10">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/60 transition-shadow"
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all">Advanced Filtering</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Find exactly what you want with 8+ genre categories, rating filters, and powerful search capabilities.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -12, scale: 1.03 }}
              className="group"
            >
              <Card className="h-full border-2 border-border/50 hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500" />
                <CardContent className="pt-8 pb-8 relative z-10">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/60 transition-shadow"
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 transition-all">Trending Insights</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Discover what&apos;s hot right now with trending analytics, player count tracking, and genre popularity stats.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
