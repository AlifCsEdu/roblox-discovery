'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { GENRES, SORT_OPTIONS } from '@/constants/genres';
import type { GameFilters } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterPanelProps {
  filters: GameFilters;
  onFilterChange: (filters: Partial<GameFilters>) => void;
}

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(filters.genres || []);
  const [ratingMin, setRatingMin] = useState(filters.rating_min);

  const handleGenreToggle = (genreName: string) => {
    const newGenres = selectedGenres.includes(genreName)
      ? selectedGenres.filter((g) => g !== genreName)
      : [...selectedGenres, genreName];
    
    setSelectedGenres(newGenres);
    onFilterChange({ genres: newGenres });
  };

  const handleRatingChange = (value: number) => {
    setRatingMin(value);
    onFilterChange({ rating_min: value });
  };

  const handleSortChange = (sort: GameFilters['sort']) => {
    onFilterChange({ sort });
  };

  // Get rating color based on value
  const getRatingColor = (rating: number) => {
    if (rating >= 90) return 'from-green-500 to-emerald-500';
    if (rating >= 80) return 'from-blue-500 to-cyan-500';
    if (rating >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-gray-500 to-slate-500';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Sort Options */}
      <div className="glass-card rounded-2xl p-6 border-2 border-primary/20 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <motion.div 
            animate={{ scaleY: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"
          />
          <h3 className="text-lg font-bold gradient-text">Sort By</h3>
        </div>
        <div className="space-y-2">
          {SORT_OPTIONS.map((option, index) => (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.03, x: 4 }}
              whileTap={{ scale: 0.97 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 400 }}
              onClick={() => handleSortChange(option.value)}
              className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                filters.sort === option.value
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/40 text-blue-400 dark:text-blue-300 shadow-lg shadow-blue-500/20'
                  : 'hover:bg-secondary/50 border-2 border-transparent hover:border-primary/20'
              }`}
            >
              {filters.sort === option.value && (
                <motion.div
                  layoutId="activeSort"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-between">
                <span className="font-semibold">{option.label}</span>
                {filters.sort === option.value && (
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500 }}
                    className="text-blue-400 font-bold"
                  >
                    ✓
                  </motion.span>
                )}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="glass-card rounded-2xl p-6 border-2 border-primary/20 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <motion.div 
            animate={{ scaleY: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"
          />
          <h3 className="text-lg font-bold gradient-text">Minimum Rating</h3>
        </div>
        <div className="space-y-4">
          {/* Custom styled range slider */}
          <div className="relative">
            <motion.input
              type="range"
              min="0"
              max="100"
              step="5"
              value={ratingMin}
              onChange={(e) => handleRatingChange(Number(e.target.value))}
              whileHover={{ scale: 1.02 }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-secondary/50"
              style={{
                background: `linear-gradient(to right, 
                  rgb(59, 130, 246) 0%, 
                  rgb(59, 130, 246) ${ratingMin}%, 
                  rgba(148, 163, 184, 0.2) ${ratingMin}%, 
                  rgba(148, 163, 184, 0.2) 100%)`
              }}
            />
          </div>
          
          {/* Rating display with animation */}
          <motion.div 
            className="flex items-center justify-between"
            layout
          >
            <span className="text-sm text-muted-foreground font-medium">0%</span>
            <motion.div
              key={ratingMin}
              initial={{ scale: 1.3, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              whileHover={{ scale: 1.1, y: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
              className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getRatingColor(ratingMin)} text-white font-bold shadow-xl`}
            >
              {ratingMin}%
            </motion.div>
            <span className="text-sm text-muted-foreground font-medium">100%</span>
          </motion.div>

          {/* Rating labels */}
          <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground text-center font-medium">
            <div>Any</div>
            <div>Good</div>
            <div>Great</div>
            <div>Best</div>
          </div>
        </div>
      </div>

      {/* Genre Filter */}
      <div className="glass-card rounded-2xl p-6 border-2 border-primary/20 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div 
              animate={{ scaleY: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1 }}
              className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"
            />
            <h3 className="text-lg font-bold gradient-text">Genres</h3>
          </div>
          <AnimatePresence>
            {selectedGenres.length > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-500/40 text-blue-400 text-xs font-bold shadow-lg shadow-blue-500/20"
              >
                {selectedGenres.length} selected
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre, index) => {
            const isSelected = selectedGenres.includes(genre.name);
            return (
              <motion.button
                key={genre.slug}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03, type: "spring", stiffness: 400 }}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleGenreToggle(genre.name)}
              >
                <Badge
                  variant={isSelected ? 'default' : 'outline'}
                  className={`cursor-pointer px-4 py-2 font-semibold transition-all duration-300 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent shadow-xl shadow-blue-500/40' 
                      : 'hover:border-primary/50 hover:bg-primary/10 border-2'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <motion.span 
                      animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white shadow-lg' : 'bg-current'}`}
                    />
                    {genre.name}
                  </span>
                </Badge>
              </motion.button>
            );
          })}
        </div>
        
        <AnimatePresence>
          {selectedGenres.length > 0 && (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedGenres([]);
                onFilterChange({ genres: [] });
              }}
              className="mt-4 w-full py-2 px-4 text-sm font-semibold rounded-xl border-2 border-red-500/40 text-red-400 hover:bg-red-500/10 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
            >
              Clear all genres ({selectedGenres.length})
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Active Filters Summary */}
      <AnimatePresence>
        {(selectedGenres.length > 0 || ratingMin > 0 || filters.sort !== 'players') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="glass-card rounded-2xl p-4 border-2 border-blue-500/40 shadow-lg shadow-blue-500/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Active Filters</span>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setSelectedGenres([]);
                  setRatingMin(0);
                  onFilterChange({ genres: [], rating_min: 0, sort: 'players' });
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Reset All
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
