'use client';

import { motion } from 'framer-motion';
import { formatNumber } from '@/lib/utils/cn';

interface TrendingStatsProps {
  totalGames: number;
  activePlayers: number;
  topGenres: Array<{ name: string; count: number }>;
}

export function TrendingStats({ totalGames, activePlayers, topGenres }: TrendingStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Total Games */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03, y: -8 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
        className="stat-card group"
      >
        <div className="flex items-start justify-between mb-4">
          <motion.div 
            className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 shadow-lg shadow-blue-500/20"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </motion.div>
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            whileHover={{ scale: 1.2 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-green-400"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          </motion.div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">Total Games</p>
          <motion.p 
            className="text-3xl font-bold gradient-text"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {formatNumber(totalGames)}
          </motion.p>
        </div>
      </motion.div>

      {/* Active Players */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03, y: -8 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
        className="stat-card group"
      >
        <div className="flex items-start justify-between mb-4">
          <motion.div 
            className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 shadow-lg shadow-purple-500/20"
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-xl shadow-green-400/50"
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">Active Players</p>
          <motion.p 
            className="text-3xl font-bold gradient-text"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {formatNumber(activePlayers)}
          </motion.p>
        </div>
      </motion.div>

      {/* Top Genre */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03, y: -8 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
        className="stat-card group"
      >
        <div className="flex items-start justify-between mb-4">
          <motion.div 
            className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/30 shadow-lg shadow-orange-500/20"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </motion.div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">Top Trending Genre</p>
          {topGenres.slice(0, 1).map((genre) => (
            <motion.div 
              key={genre.name}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.p 
                className="text-2xl font-bold capitalize gradient-text"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {genre.name}
              </motion.p>
              <p className="text-sm text-muted-foreground">{formatNumber(genre.count)} games</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
