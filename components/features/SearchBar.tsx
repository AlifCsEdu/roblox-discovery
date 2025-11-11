'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { trpc } from '@/lib/api/trpc-client';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { GENRES } from '@/constants/genres';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  showFilters?: boolean;
  disableAutocomplete?: boolean; // Disable internal API calls (for search page)
}

export function SearchBar({ placeholder = "Search for games...", onSearch, showFilters = false, disableAutocomplete = false }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Filter state
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [ratingRange, setRatingRange] = useState<[number, number]>([0, 100]);
  const [minPlayers, setMinPlayers] = useState<number>(0);

  // Search history from localStorage - initialize with useMemo to avoid setState in effect
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const history = localStorage.getItem('searchHistory');
      return history ? JSON.parse(history) : [];
    }
    return [];
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = trpc.search.games.useQuery(
    { 
      query: debouncedQuery, 
      sort: 'relevance', 
      limit: 10,
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
      rating_min: ratingRange[0] > 0 ? ratingRange[0] : undefined,
      rating_max: ratingRange[1] < 100 ? ratingRange[1] : undefined,
      min_players: minPlayers > 0 ? minPlayers : undefined,
    },
    {
      enabled: !disableAutocomplete && debouncedQuery.length > 2,
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(value.length > 2);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.length > 2) {
      // Navigate to search page with query
      const params = new URLSearchParams({ q: query });
      if (selectedGenres.length > 0) params.set('genres', selectedGenres.join(','));
      if (ratingRange[0] > 0) params.set('rating_min', String(ratingRange[0]));
      if (ratingRange[1] < 100) params.set('rating_max', String(ratingRange[1]));
      if (minPlayers > 0) params.set('min_players', String(minPlayers));
      
      router.push(`/search?${params.toString()}`);
      setShowResults(false);
    }
  };

  const handleResultClick = (gameName: string) => {
    // Save to search history
    const newHistory = [gameName, ...searchHistory.filter(h => h !== gameName)].slice(0, 5);
    setSearchHistory(newHistory);
    if (typeof window !== 'undefined') {
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
    setShowResults(false);
  };

  const toggleGenre = (slug: string) => {
    setSelectedGenres(prev => 
      prev.includes(slug) ? prev.filter(g => g !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setRatingRange([0, 100]);
    setMinPlayers(0);
  };

  const hasActiveFilters = selectedGenres.length > 0 || ratingRange[0] > 0 || ratingRange[1] < 100 || minPlayers > 0;

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={i} className="bg-primary/20 text-foreground font-bold">{part}</mark> : 
        part
    );
  };

  return (
    <div className="relative w-full max-w-2xl">
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 2 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="w-full pr-10 border-2 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10 transition-all"
        />
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <Spinner size="sm" />
          </motion.div>
        )}
      </motion.div>

      {/* Filter toggle button */}
      {showFilters && (
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="text-xs"
          >
            {showFilterPanel ? '✕ Hide Filters' : '⚙ Show Filters'}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-muted-foreground"
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-4 bg-card border-2 border-border rounded-xl space-y-4"
          >
            {/* Genre filters */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Genres</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.slice(0, 10).map((genre) => (
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
              <label className="text-sm font-semibold mb-2 block">
                Rating: {ratingRange[0]}% - {ratingRange[1]}%
              </label>
              <Slider
                min={0}
                max={100}
                step={5}
                value={ratingRange}
                onValueChange={setRatingRange}
              />
            </div>

            {/* Min players filter */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Minimum Players</label>
              <Input
                type="number"
                min={0}
                value={minPlayers || ''}
                onChange={(e) => setMinPlayers(parseInt(e.target.value) || 0)}
                placeholder="e.g., 1000"
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search results */}
      <AnimatePresence>
        {showResults && results && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="absolute top-full mt-2 w-full bg-card border-2 border-primary/20 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden z-50"
          >
            {results.map((game, index: number) => (
              <Link
                key={game.id}
                href={`/games/${game.roblox_id}`}
                onClick={() => handleResultClick(game.title)}
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(100, 116, 139, 0.1)', x: 4 }}
                  className="px-4 py-3 transition-colors border-b border-border/50 last:border-b-0 cursor-pointer"
                >
                  <div className="font-semibold text-foreground">
                    {highlightMatch(game.title, query)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    by {game.creator} • {game.rating ? `${game.rating.toFixed(1)}% rating` : 'No rating yet'}
                  </div>
                </motion.div>
              </Link>
            ))}
            
            {/* View all results link */}
            {results.length >= 10 && (
              <Link href={`/search?q=${encodeURIComponent(query)}`}>
                <motion.div
                  whileHover={{ backgroundColor: 'rgba(100, 116, 139, 0.15)' }}
                  className="px-4 py-3 text-center text-sm font-semibold text-primary border-t-2 border-primary/20 cursor-pointer"
                >
                  View all results for &quot;{query}&quot;
                </motion.div>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search history */}
      <AnimatePresence>
        {showResults && query.length <= 2 && searchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-card border-2 border-border rounded-2xl shadow-lg overflow-hidden z-50"
          >
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
              Recent Searches
            </div>
            {searchHistory.map((item, index) => (
              <div
                key={index}
                className="px-4 py-2 text-sm hover:bg-secondary/50 cursor-pointer border-b border-border/50 last:border-b-0"
                onClick={() => setQuery(item)}
              >
                {item}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
