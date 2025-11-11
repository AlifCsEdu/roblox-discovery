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
        <Card className="game-card group cursor-pointer h-full relative overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/20">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-blue-500/15 group-hover:via-purple-500/15 group-hover:to-cyan-500/15 transition-all duration-500 z-10 pointer-events-none" />
          
          <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
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
            
            {/* Enhanced rating badge with glow */}
            {game.rating !== null && (
              <div className="absolute top-3 right-3 z-20">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="relative"
                >
                  <Badge className="quality-badge shadow-lg shadow-green-500/50 group-hover:shadow-green-500/70 transition-shadow duration-300 backdrop-blur-sm">
                    <motion.svg 
                      className="w-3 h-3 mr-1" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                    {formatRating(game.rating)}
                  </Badge>
                </motion.div>
              </div>
            )}
            
            {/* Player count overlay */}
            <div className="absolute bottom-3 left-3 z-20">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="glass-effect px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md bg-black/40 border border-white/10"
              >
                <motion.span 
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/70"
                />
                <span className="text-white text-sm font-semibold drop-shadow-lg">
                  {formatNumber(game.player_count_current ?? 0)}
                </span>
              </motion.div>
            </div>
          </div>
          
          <CardContent className="p-5 relative z-20">
            <motion.h3 
              className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300"
            >
              {game.title}
            </motion.h3>
            
            {game.creator && (
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {game.creator}
              </p>
            )}
            
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {game.visits > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300 bg-secondary/30 rounded-lg px-2 py-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">{formatNumber(game.visits)}</span>
                </motion.div>
              )}
              
              {game.player_count_7d_avg > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300 bg-secondary/30 rounded-lg px-2 py-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <span className="font-semibold">{formatNumber(game.player_count_7d_avg)}</span>
                </motion.div>
              )}
              
              {game.favorite_count > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300 bg-secondary/30 rounded-lg px-2 py-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">{formatNumber(game.favorite_count)}</span>
                </motion.div>
              )}
              
              {game.player_count_peak > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300 bg-secondary/30 rounded-lg px-2 py-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">{formatNumber(game.player_count_peak)}</span>
                </motion.div>
              )}
            </div>
            
            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {game.genres.slice(0, 3).map((genre) => (
                <motion.div
                  key={genre}
                  whileHover={{ scale: 1.1, y: -2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-medium px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all duration-200 cursor-pointer shadow-sm"
                  >
                    {genre}
                  </Badge>
                </motion.div>
              ))}
              {game.genres.length > 3 && (
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-medium px-2.5 py-1 bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all duration-200 cursor-pointer shadow-sm"
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
