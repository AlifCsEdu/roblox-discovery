'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchBar } from '@/components/features/SearchBar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion, AnimatePresence } from 'framer-motion';
import { GENRES } from '@/constants/genres';
import { useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const [isGenresOpen, setIsGenresOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl shadow-sm"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center gap-6">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center shrink-0">
            <motion.div 
              className="text-xl lg:text-2xl font-bold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                RobloxDiscover
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-start ml-8">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="sm"
                className={`h-9 font-medium transition-all ${
                  isActive('/') 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                Home
              </Button>
            </Link>
            
            <Link href="/explore">
              <Button 
                variant="ghost"
                size="sm"
                className={`h-9 font-medium transition-all ${
                  isActive('/explore') 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                Explore
              </Button>
            </Link>

            {/* Genres Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsGenresOpen(true)}
              onMouseLeave={() => setIsGenresOpen(false)}
            >
              <Button 
                variant="ghost"
                size="sm"
                className={`h-9 font-medium transition-all ${
                  pathname.startsWith('/genres') 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                Genres
                <svg 
                  className={`w-3.5 h-3.5 ml-1.5 transition-transform duration-200 ${isGenresOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>

              <AnimatePresence>
                {isGenresOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-2 w-80 bg-background/98 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-4 max-h-[70vh] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {GENRES.map((genre) => (
                          <Link 
                            key={genre.slug} 
                            href={`/genres/${genre.slug}`}
                            onClick={() => setIsGenresOpen(false)}
                          >
                            <motion.div
                              whileHover={{ x: 2 }}
                              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                pathname === `/genres/${genre.slug}`
                                  ? 'bg-primary/10 text-primary shadow-sm'
                                  : 'hover:bg-accent hover:text-accent-foreground'
                              }`}
                            >
                              {genre.name}
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/search">
              <Button 
                variant="ghost"
                size="sm"
                className={`h-9 font-medium transition-all ${
                  isActive('/search') 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                Search
              </Button>
            </Link>
          </div>

          {/* Search Bar - Tablet/Desktop (when nav is hidden) */}
          <div className="hidden md:flex lg:hidden flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 ml-auto shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThemeToggle />
            </motion.div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3 pt-1">
          <SearchBar />
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-border/40 mt-1"
            >
              <div className="py-4 space-y-1">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`px-3 py-2.5 text-sm font-medium rounded-lg mx-1 transition-colors ${
                    isActive('/') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                  }`}>
                    Home
                  </div>
                </Link>
                
                <Link href="/explore" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`px-3 py-2.5 text-sm font-medium rounded-lg mx-1 transition-colors ${
                    isActive('/explore') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                  }`}>
                    Explore
                  </div>
                </Link>

                <Link href="/search" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`px-3 py-2.5 text-sm font-medium rounded-lg mx-1 transition-colors ${
                    isActive('/search') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                  }`}>
                    Search
                  </div>
                </Link>

                {/* Mobile Genres */}
                <div className="pt-3 pb-1 px-1">
                  <div className="px-2 mb-3">
                    <div className="h-px bg-border/50" />
                  </div>
                  <div className="px-2 mb-3">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Browse Genres
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {GENRES.map((genre) => (
                      <Link 
                        key={genre.slug} 
                        href={`/genres/${genre.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          pathname === `/genres/${genre.slug}`
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent'
                        }`}>
                          {genre.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
