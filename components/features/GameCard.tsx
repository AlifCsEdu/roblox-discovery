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
      whileHover={{ y: -14, scale: 1.04 }}
      className="h-full"
    >
      <Link href={`/games/${game.roblox_id}`}>
        <Card className="game-card group cursor-pointer h-full relative overflow-hidden border-2 border-border/50 hover:border-primary/70 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/40 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
          {/* Layered gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-blue-500/25 group-hover:via-purple-500/25 group-hover:to-cyan-500/25 transition-all duration-500 z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/0 to-pink-500/0 group-hover:from-purple-600/15 group-hover:to-pink-500/15 transition-all duration-700 z-10 pointer-events-none" />
          
          {/* Enhanced animated shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />
          
          {/* Subtle border glow on hover */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300 -z-10" />
          
          <div className="relative aspect-video bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 overflow-hidden">
            {/* Animated gradient background layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {game.thumbnail_url ? (
              <Image
                src={game.thumbnail_url}
                alt={game.title}
                fill
                className="object-cover group-hover:scale-[1.15] group-hover:rotate-1 transition-all duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">No Image</p>
                </div>
              </div>
            )}
            
            {/* ULTRA enhanced rating badge */}
            {game.rating !== null && game.rating > 0 ? (
              <div className="absolute top-3 right-3 z-20">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  whileHover={{ scale: 1.2, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="relative"
                >
                  {/* Animated glowing orb background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur-lg opacity-40 group-hover:opacity-80 transition-opacity" style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                  
                  {/* Badge with enhanced gradient */}
                  <Badge className="relative px-3.5 py-2 text-sm font-black bg-gradient-to-br from-yellow-200 via-yellow-300 to-orange-400 text-yellow-950 border-2 border-yellow-100/70 shadow-2xl backdrop-blur-sm hover:from-yellow-300 hover:via-orange-300 hover:to-amber-400 transition-all duration-300">
                    <motion.svg 
                      className="w-4 h-4 mr-1.5 drop-shadow-md" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      animate={{ rotate: [0, 14, -14, 14, 0] }}
                      transition={{ repeat: Infinity, duration: 5, repeatDelay: 2 }}
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
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gray-400/20 rounded-lg blur-md animate-pulse" />
                  <Badge className="relative px-2.5 py-1.5 text-xs font-bold bg-gray-600/90 text-gray-200 border border-gray-400/40 backdrop-blur-sm shadow-lg">
                    <div className="w-3 h-3 mr-1.5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin inline-block" />
                    Loading...
                  </Badge>
                </motion.div>
              </div>
            ) : null}
            
            {/* ULTRA enhanced player count display */}
            <div className="absolute bottom-3 left-3 z-20">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.12, x: 4 }}
                className="relative group/players"
              >
                {/* Multiple layered glows */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-300 to-green-300 rounded-full blur-lg opacity-50 group-hover/players:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full blur-md opacity-40 group-hover/players:opacity-80 transition-opacity animate-pulse" />
                
                {/* Enhanced badge with better colors */}
                <div className="relative px-4 py-2.5 rounded-full flex items-center gap-2.5 bg-gradient-to-br from-emerald-300/95 via-green-300/95 to-teal-300/95 border-2 border-white/40 shadow-2xl backdrop-blur-sm group-hover/players:from-emerald-400/95 group-hover/players:via-green-400/95 group-hover/players:to-teal-400/95 transition-all duration-300">
                  {/* Animated ping dot with better animation */}
                  <motion.div
                    className="relative"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <div className="w-3 h-3 rounded-full bg-white shadow-xl shadow-white/80" />
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-white animate-ping opacity-60" />
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-white/50 blur-sm" />
                  </motion.div>
                  
                  {/* Player count with icon */}
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-950 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span className="text-emerald-950 text-sm font-black drop-shadow-md tracking-wide">
                      {formatNumber(game.player_count_current ?? 0)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          <CardContent className="p-5 relative z-20">
            {/* Enhanced title with better gradient hover */}
            <motion.h3 
              className="font-black text-lg mb-2.5 line-clamp-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:via-purple-400 group-hover:to-cyan-400 transition-all duration-300 drop-shadow-sm"
              whileHover={{ x: 2 }}
            >
              {game.title}
            </motion.h3>
            
            {/* Enhanced creator display */}
            {game.creator && (
              <motion.p 
                className="text-xs text-muted-foreground mb-4 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-all"
                whileHover={{ x: 2 }}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-primary/20">
                  <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-semibold text-foreground/80 group-hover:text-foreground">{game.creator}</span>
              </motion.p>
            )}
            
            {/* ULTRA enhanced Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {game.visits > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.08, y: -4, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="relative overflow-hidden flex items-center gap-2.5 text-xs group-hover:text-foreground transition-all duration-300 bg-gradient-to-br from-purple-500/15 via-purple-500/10 to-purple-600/25 border-2 border-purple-400/40 rounded-xl px-3 py-3 shadow-md hover:shadow-purple-500/30 hover:shadow-xl hover:border-purple-400/60 backdrop-blur-sm"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl" />
                  
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg relative z-10">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <div className="text-sm font-black text-foreground">{formatNumber(game.visits)}</div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">visits</div>
                  </div>
                </motion.div>
              )}
              
              {game.player_count_7d_avg > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.08, y: -4, rotate: -1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="relative overflow-hidden flex items-center gap-2.5 text-xs group-hover:text-foreground transition-all duration-300 bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-cyan-600/25 border-2 border-blue-400/40 rounded-xl px-3 py-3 shadow-md hover:shadow-blue-500/30 hover:shadow-xl hover:border-blue-400/60 backdrop-blur-sm"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl" />
                  
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center shadow-lg relative z-10">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <div className="text-sm font-black text-foreground">{formatNumber(game.player_count_7d_avg)}</div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">avg players</div>
                  </div>
                </motion.div>
              )}
              
              {game.favorite_count > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.08, y: -4, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="relative overflow-hidden flex items-center gap-2.5 text-xs group-hover:text-foreground transition-all duration-300 bg-gradient-to-br from-rose-500/15 via-pink-500/10 to-pink-600/25 border-2 border-rose-400/40 rounded-xl px-3 py-3 shadow-md hover:shadow-rose-500/30 hover:shadow-xl hover:border-rose-400/60 backdrop-blur-sm"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-rose-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-pink-500/10 rounded-full blur-xl" />
                  
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center shadow-lg relative z-10">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <div className="text-sm font-black text-foreground">{formatNumber(game.favorite_count)}</div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">favorites</div>
                  </div>
                </motion.div>
              )}
              
              {game.player_count_peak > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.08, y: -4, rotate: -1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="relative overflow-hidden flex items-center gap-2.5 text-xs group-hover:text-foreground transition-all duration-300 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-amber-600/25 border-2 border-orange-400/40 rounded-xl px-3 py-3 shadow-md hover:shadow-orange-500/30 hover:shadow-xl hover:border-orange-400/60 backdrop-blur-sm"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
                  
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-lg relative z-10">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <div className="text-sm font-black text-foreground">{formatNumber(game.player_count_peak)}</div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">peak</div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* ULTRA enhanced Genres with better animations */}
            <div className="flex flex-wrap gap-2">
              {game.genres.slice(0, 3).map((genre, idx) => (
                <motion.div
                  key={genre}
                  initial={{ scale: 0, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + idx * 0.06, type: "spring", stiffness: 400 }}
                  whileHover={{ scale: 1.2, y: -4, rotate: 3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-black px-3 py-1.5 bg-gradient-to-r from-primary/30 via-primary/25 to-primary/35 text-primary border-2 border-primary/50 hover:from-primary/40 hover:via-primary/35 hover:to-primary/45 hover:border-primary/70 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-primary/30 backdrop-blur-sm"
                  >
                    {genre}
                  </Badge>
                </motion.div>
              ))}
              {game.genres.length > 3 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.18, type: "spring", stiffness: 400 }}
                  whileHover={{ scale: 1.2, y: -4, rotate: -3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-black px-3 py-1.5 bg-gradient-to-r from-accent/30 via-accent/25 to-accent/35 text-accent border-2 border-accent/50 hover:from-accent/40 hover:via-accent/35 hover:to-accent/45 hover:border-accent/70 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-accent/30 backdrop-blur-sm"
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
