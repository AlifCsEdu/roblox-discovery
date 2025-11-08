'use client';

import { useEffect, useRef } from 'react';
import { GameCard } from './GameCard';
import { Spinner } from '@/components/ui/spinner';
import type { Game } from '@/types';

interface GameGridProps {
  games: Game[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function GameGrid({ games, isLoading, hasMore, onLoadMore }: GameGridProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  if (games.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-2xl text-muted-foreground mb-2">No games found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {/* Loading indicator and infinite scroll trigger */}
      <div ref={observerTarget} className="flex justify-center py-8">
        {isLoading && <Spinner size="lg" />}
      </div>

      {!hasMore && games.length > 0 && (
        <p className="text-center text-muted-foreground py-8">
          No more games to load
        </p>
      )}
    </div>
  );
}
