'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { trpc } from '@/lib/api/trpc-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GameCard } from '@/components/features/GameCard';
import { ShareButton } from '@/components/ui/share-button';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber, formatRating } from '@/lib/utils/cn';
import Link from 'next/link';
import type { Game } from '@/types';

interface GameDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = use(params);
  const robloxId = Number(id);

  if (isNaN(robloxId)) {
    notFound();
  }

  // Fetch game details (pass as string to match schema)
  const { data: game, isLoading, error } = trpc.games.detail.useQuery(id);

  // Use player count directly from API response (real-time from Roblox API)
  const playerCount = game?.player_count_current ?? 0;

  // Fetch related games (same genre)
  const { data: relatedGamesData } = trpc.games.list.useQuery(
    {
      genres: game?.genres?.slice(0, 1) || [],
      rating_min: 80,
      rating_max: 100,
      sort: 'rating',
      limit: 4,
      offset: 0,
    },
    {
      enabled: !!game?.genres && game.genres.length > 0,
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
          <p className="text-xl font-medium gradient-text">Loading game details...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-lg w-full p-8 rounded-2xl border border-red-500/30"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Game Not Found</h2>
            <p className="text-muted-foreground">
              {error ? `Error: ${error.message}` : 'The game you are looking for does not exist or has been removed.'}
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/explore" className="flex-1">
              <Button className="w-full">
                Browse Games
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Go Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Type-safe access to game data after null check
  const gameData = game as Game;

  const relatedGames = relatedGamesData?.games.filter((g) => g.roblox_id !== robloxId) || [];

  // Calculate rating color
  const getRatingColorClass = (rating: number) => {
    if (rating >= 90) return 'from-green-500 to-emerald-500';
    if (rating >= 80) return 'from-blue-500 to-cyan-500';
    if (rating >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-gray-500 to-slate-500';
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax Effect */}
      <section className="relative h-[70vh] min-h-[600px] overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={gameData.thumbnail_url || '/placeholder-game.jpg'}
            alt={gameData.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
        </motion.div>

        {/* Content */}
        <div className="relative container mx-auto px-4 h-full flex items-end pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-5xl w-full"
          >
            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-6xl md:text-7xl font-bold mb-6 gradient-text"
            >
              {gameData.title}
            </motion.h1>
            
            {/* Stats Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-card rounded-2xl p-6 mb-6 border border-border/50"
            >
              <div className="flex flex-wrap items-center gap-6">
                {/* Rating */}
                {gameData.rating !== null && gameData.rating !== undefined && (
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getRatingColorClass(gameData.rating)} text-white shadow-lg`}>
                      <div className="text-3xl font-bold">{formatRating(gameData.rating)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Quality</div>
                      <div className="text-sm font-medium">Score</div>
                    </div>
                  </motion.div>
                )}
                
                {/* Likes/Dislikes */}
                {gameData.up_votes !== undefined && gameData.down_votes !== undefined && (
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, y: -3 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-400">{formatNumber(gameData.up_votes)}</div>
                        <div className="text-xs text-muted-foreground">Likes</div>
                      </div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.1, y: -3 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-400">{formatNumber(gameData.down_votes)}</div>
                        <div className="text-xs text-muted-foreground">Dislikes</div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Divider */}
                <div className="h-12 w-px bg-border hidden sm:block" />

                {/* Live Player Count */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <motion.span 
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
                    />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatNumber(playerCount)}</div>
                    <div className="text-xs text-muted-foreground">Playing Now</div>
                  </div>
                </motion.div>

                {/* Divider */}
                <div className="h-12 w-px bg-border hidden md:block" />

                {/* 7-Day Average */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl font-bold">{formatNumber(gameData.player_count_7d_avg)}</div>
                    <div className="text-xs text-muted-foreground">7-Day Avg</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-12 w-px bg-border hidden lg:block" />

                {/* Peak Players */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl font-bold">{formatNumber(gameData.player_count_peak || 0)}</div>
                    <div className="text-xs text-muted-foreground">Peak</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Genres & Actions */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center gap-4"
            >
              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {gameData.genres?.map((genre: string, index: number) => (
                  <motion.div
                    key={genre}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Link href={`/genres/${genre.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Badge className="px-4 py-2 text-sm font-medium cursor-pointer hover:scale-105 transition-transform bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 hover:border-blue-500/50">
                        {genre}
                      </Badge>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 ml-auto">
                <motion.div whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }}>
                  <ShareButton 
                    url={`https://www.roblox.com/games/${gameData.roblox_id}`}
                    title={gameData.title}
                    text={gameData.description?.slice(0, 100) || `Check out ${gameData.title} on Roblox!`}
                  />
                </motion.div>
                <motion.a
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href={`roblox://experiences/start?placeId=${gameData.roblox_id}`}
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="modern-button text-lg px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Launch Game
                  </Button>
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href={`https://www.roblox.com/games/${gameData.roblox_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="text-lg px-8 border-primary/30 hover:bg-primary/10 hover:border-primary/50 shadow-md">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on Roblox
                  </Button>
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Details Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Description */}
            <div className="glass-card rounded-2xl p-8 border border-border/50">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                About This Game
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {gameData.description || 'No description available.'}
              </p>
            </div>

            {/* Additional Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="stat-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Visits</div>
                    <div className="text-2xl font-bold">{formatNumber(gameData.visits || 0)}</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Created</div>
                    <div className="text-lg font-semibold">{new Date(gameData.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Quick Stats Card */}
            <div className="glass-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full" />
                Quick Stats
              </h3>
              <div className="space-y-6">
                <motion.div 
                  whileHover={{ scale: 1.03, x: 4 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <span className="text-sm text-muted-foreground">Peak Players</span>
                  <span className="text-xl font-bold text-orange-400">{formatNumber(gameData.player_count_peak || 0)}</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.03, x: 4 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <span className="text-sm text-muted-foreground">Total Visits</span>
                  <span className="text-xl font-bold text-purple-400">{formatNumber(gameData.visits || 0)}</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.03, x: 4 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm font-medium">{new Date(gameData.updated_at).toLocaleDateString()}</span>
                </motion.div>
              </div>
            </div>

            {/* Roblox Link Card */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              className="glass-card rounded-2xl p-6 border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-purple-500/5 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/10"
            >
              <h3 className="text-lg font-bold mb-3">View on Roblox</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Check out this game on the official Roblox platform
              </p>
              <a
                href={`https://www.roblox.com/games/${gameData.roblox_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300">
                  Open in Roblox
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Related Games Section */}
      <AnimatePresence>
        {relatedGames.length > 0 && (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="container mx-auto px-4 py-16 relative"
          >
            {/* Background Decoration */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-4xl font-bold mb-2 gradient-text">Similar Games You Might Like</h2>
              <p className="text-muted-foreground">More games in the same genre</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedGames.map((relatedGame, index: number) => (
                <motion.div
                  key={relatedGame.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GameCard game={relatedGame} index={index} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
