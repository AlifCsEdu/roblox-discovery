'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Game } from '@/types';
import { formatNumber, formatRating } from '@/lib/utils/cn';
import { motion } from 'framer-motion';

interface GameCardProps {
  game: Game;
  index?: number;
}

function GameCardComponent({ game, index = 0 }: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -12, scale: 1.03 }}
      className="h-full"
    >
      <Link href={`/games/${game.roblox_id}`}>
        <Card className="game-card group cursor-pointer h-full relative overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/30 bg-card">
          {/* Enhanced gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-cyan-500/20 transition-all duration-500 z-10 pointer-events-none" />
          
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-10" />
          
          <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
            {game.thumbnail_url ? (
              <Image
                src={game.thumbnail_url}
                alt={game.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No Image
              </div>
            )}
            
            {/* Enhanced rating badge with MUCH better styling */}
            {game.rating !== null && game.rating > 0 ? (
              <div className="absolute top-3 right-3 z-20">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
                  <Badge className="relative px-3 py-1.5 text-sm font-bold bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 text-yellow-900 border-2 border-yellow-200/50 shadow-2xl backdrop-blur-sm">
                    <motion.svg 
                      className="w-4 h-4 mr-1.5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      animate={{ rotate: [0, 14, -14, 0] }}
                      transition={{ repeat: Infinity, duration: 4, repeatDelay: 3 }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                    {formatRating(game.rating)}%
                  </Badge>
                </motion.div>
              </div>
            ) : game.rating === null ? (
              <div className="absolute top-3 right-3 z-20">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative"
                >
                  <Badge className="px-2 py-1 text-xs font-medium bg-gray-500/80 text-gray-200 border border-gray-400/30 backdrop-blur-sm">
                    <div className="w-3 h-3 mr-1 border-2 border-gray-300 border-t-transparent rounded-full animate-spin inline-block" />
                    Loading...
                  </Badge>
                </motion.div>
              </div>
            ) : null}
            
            {/* Player count overlay with MUCH better styling */}
            <div className="absolute bottom-3 left-3 z-20">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.08, x: 2 }}
                className="relative group/players"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full blur-md opacity-60 group-hover/players:opacity-100 transition-opacity" />
                <div className="relative px-4 py-2 rounded-full flex items-center gap-2.5 bg-gradient-to-br from-emerald-400/95 via-green-400/95 to-teal-400/95 border-2 border-white/30 shadow-xl backdrop-blur-sm">
                  <motion.div
                    className="relative"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-lg shadow-white/70" />
                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-white animate-ping opacity-75" />
                  </motion.div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span className="text-white text-sm font-bold drop-shadow-lg tracking-wide">
                      {formatNumber(game.player_count_current ?? 0)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          <CardContent className="p-5 relative z-20">
            <motion.h3 
              className="font-black text-lg mb-2 line-clamp-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:via-purple-400 group-hover:to-cyan-400 transition-all duration-300"
            >
              {game.title}
            </motion.h3>
            
            {game.creator && (
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{game.creator}</span>
              </p>
            )}
            
            {/* Enhanced Stats Grid with better visuals */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {game.visits > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.05, y: -3 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="relative overflow-hidden flex items-center gap-2 text-xs group-hover:text-foreground transition-colors duration-300 bg-gradient-to-br from-purple-500/10 to-purple-600/20 border border-purple-500/30 rounded-xl px-3 py-2.5 shadow-sm hover:shadow-purple-500/20 hover:shadow-md"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-400/10 rounded-full blur-2xl" />
                  <svg className="w-4 h-4 text-purple-400 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <div className="relative z-10">
                    <div className="text-xs font-bold text-foreground">{formatNumber(game.visits)}</div>
                    <div className="text-[10px] text-muted-foreground">visits</div>
                  </div>
                </motion.div>
              )}
              
              {game.player_count_7d_avg > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.05, y: -3 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="relative overflow-hidden flex items-center gap-2 text-xs group-hover:text-foreground transition-colors duration-300 bg-gradient-to-br from-blue-500/10 to-cyan-600/20 border border-blue-500/30 rounded-xl px-3 py-2.5 shadow-sm hover:shadow-blue-500/20 hover:shadow-md"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-400/10 rounded-full blur-2xl" />
                  <svg className="w-4 h-4 text-blue-400 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <div className="relative z-10">
                    <div className="text-xs font-bold text-foreground">{formatNumber(game.player_count_7d_avg)}</div>
                    <div className="text-[10px] text-muted-foreground">avg players</div>
                  </div>
                </motion.div>
              )}
              
              {game.favorite_count > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.05, y: -3 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="relative overflow-hidden flex items-center gap-2 text-xs group-hover:text-foreground transition-colors duration-300 bg-gradient-to-br from-rose-500/10 to-pink-600/20 border border-rose-500/30 rounded-xl px-3 py-2.5 shadow-sm hover:shadow-rose-500/20 hover:shadow-md"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-rose-400/10 rounded-full blur-2xl" />
                  <svg className="w-4 h-4 text-rose-400 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <div className="relative z-10">
                    <div className="text-xs font-bold text-foreground">{formatNumber(game.favorite_count)}</div>
                    <div className="text-[10px] text-muted-foreground">favorites</div>
                  </div>
                </motion.div>
              )}
              
              {game.player_count_peak > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.05, y: -3 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="relative overflow-hidden flex items-center gap-2 text-xs group-hover:text-foreground transition-colors duration-300 bg-gradient-to-br from-orange-500/10 to-amber-600/20 border border-orange-500/30 rounded-xl px-3 py-2.5 shadow-sm hover:shadow-orange-500/20 hover:shadow-md"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-orange-400/10 rounded-full blur-2xl" />
                  <svg className="w-4 h-4 text-orange-400 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  <div className="relative z-10">
                    <div className="text-xs font-bold text-foreground">{formatNumber(game.player_count_peak)}</div>
                    <div className="text-[10px] text-muted-foreground">peak</div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Improved Genres */}
            <div className="flex flex-wrap gap-2">
              {game.genres.slice(0, 3).map((genre, idx) => (
                <motion.div
                  key={genre}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 + idx * 0.05 }}
                  whileHover={{ scale: 1.15, y: -3, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-primary/20 to-primary/30 text-primary border-2 border-primary/40 hover:from-primary/30 hover:to-primary/40 hover:border-primary/60 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover:shadow-primary/20"
                  >
                    {genre}
                  </Badge>
                </motion.div>
              ))}
              {game.genres.length > 3 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 + 0.15 }}
                  whileHover={{ scale: 1.15, y: -3, rotate: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-accent/20 to-accent/30 text-accent border-2 border-accent/40 hover:from-accent/30 hover:to-accent/40 hover:border-accent/60 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover:shadow-accent/20"
                  >
                    +{game.genres.length - 3}
                  </Badge>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export const GameCard = memo(GameCardComponent);
