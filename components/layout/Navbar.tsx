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
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <motion.div 
              className="text-xl md:text-2xl font-bold"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                RobloxDiscover
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-2xl">
            <Link href="/">
              <Button 
                variant="ghost" 
                className={`font-medium transition-all ${
                  isActive('/') 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-accent'
                }`}
              >
                Home
              </Button>
            </Link>
            
            <Link href="/explore">
              <Button 
                variant="ghost"
                className={`font-medium transition-all ${
                  isActive('/explore') 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-accent'
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
                className={`font-medium transition-all ${
                  pathname.startsWith('/genres') 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-accent'
                }`}
              >
                Genres
                <svg 
                  className={`w-4 h-4 ml-1 transition-transform ${isGenresOpen ? 'rotate-180' : ''}`} 
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-background/95 backdrop-blur-xl border border-border rounded-lg shadow-2xl overflow-hidden"
                  >
                    <div className="p-3 max-h-[70vh] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-1">
                        {GENRES.map((genre) => (
                          <Link 
                            key={genre.slug} 
                            href={`/genres/${genre.slug}`}
                            onClick={() => setIsGenresOpen(false)}
                          >
                            <motion.div
                              whileHover={{ x: 4 }}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                pathname === `/genres/${genre.slug}`
                                  ? 'bg-primary/10 text-primary'
                                  : 'hover:bg-accent text-foreground'
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
                className={`font-medium transition-all ${
                  isActive('/search') 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-accent'
                }`}
              >
                Search
              </Button>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex lg:hidden flex-1 max-w-sm">
            <SearchBar />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThemeToggle />
            </motion.div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="md:hidden pb-3">
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
              className="lg:hidden overflow-hidden border-t border-border/40"
            >
              <div className="py-4 space-y-1">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                  }`}>
                    Home
                  </div>
                </Link>
                
                <Link href="/explore" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/explore') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                  }`}>
                    Explore
                  </div>
                </Link>

                <Link href="/search" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/search') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                  }`}>
                    Search
                  </div>
                </Link>

                {/* Mobile Genres */}
                <div className="pt-2 pb-1 px-4">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Genres
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {GENRES.map((genre) => (
                      <Link 
                        key={genre.slug} 
                        href={`/genres/${genre.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
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
