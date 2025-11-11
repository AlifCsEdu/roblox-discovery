/**
 * Supabase Realtime configuration and hooks
 * 
 * Provides live updates for:
 * - Player counts
 * - Game ratings
 * - New games
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Game } from '@/types';

interface Rating {
  id: string;
  game_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

/**
 * Hook to subscribe to game updates in real-time
 * External system synchronization - subscribes to database changes
 */
export function useRealtimeGames() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to games table changes (external system)
    const gamesChannel = supabase
      .channel('games-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
        },
        (payload) => {
          // Update state based on external system events
          if (payload.eventType === 'INSERT') {
            setGames((prev) => [payload.new as Game, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setGames((prev) =>
              prev.map((game) =>
                game.id === payload.new.id ? (payload.new as Game) : game
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setGames((prev) => prev.filter((game) => game.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gamesChannel);
    };
  }, []);

  return { games };
}

/**
 * Hook to subscribe to a single game's updates
 * External system synchronization - subscribes to database changes
 */
export function useRealtimeGame(robloxId: number) {
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to specific game updates (external system)
    const gameChannel = supabase
      .channel(`game-${robloxId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `roblox_id=eq.${robloxId}`,
        },
        (payload) => {
          // Update state based on external system events
          setGame(payload.new as Game);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [robloxId]);

  return { game };
}

/**
 * Hook to get live player count updates
 * External system synchronization - polls and updates via Realtime
 */
export function useLivePlayerCount(robloxId: number, initialCount: number = 0) {
  const [playerCount, setPlayerCount] = useState(initialCount);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to player count updates (external system)
    const playerChannel = supabase
      .channel(`player-count-${robloxId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `roblox_id=eq.${robloxId}`,
        },
        (payload) => {
          // Update state based on external system events
          const newGame = payload.new as Game;
          if (newGame.player_count_current !== undefined) {
            setPlayerCount(newGame.player_count_current);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playerChannel);
    };
  }, [robloxId]);

  return { playerCount };
}

/**
 * Hook to subscribe to new ratings for a game
 * External system synchronization - subscribes to database changes
 */
export function useRealtimeRatings(robloxId: number) {
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to new ratings (external system)
    const ratingsChannel = supabase
      .channel(`ratings-${robloxId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_ratings',
        },
        (payload) => {
          // Update state based on external system events
          setRatings((prev) => [payload.new as Rating, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ratingsChannel);
    };
  }, [robloxId]);

  return { ratings };
}

/**
 * Hook to subscribe to presence (who's viewing what)
 * External system synchronization - subscribes to presence channel
 */
export function usePresence(gameId: string, userId: string) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const presenceChannel = supabase.channel(`game-presence-${gameId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        // Update state based on external system events
        const state = presenceChannel.presenceState();
        const users = Object.keys(state);
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, () => {
        // User joined
      })
      .on('presence', { event: 'leave' }, () => {
        // User left
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [gameId, userId]);

  return { onlineUsers };
}

/**
 * Utility function to enable realtime for tables
 * Run this during setup if realtime is not enabled
 */
export async function enableRealtime() {
  // This would typically be done via Supabase dashboard or SQL
  // Included here for reference
  console.log('Enable realtime via Supabase Dashboard:');
  console.log('1. Go to Database > Replication');
  console.log('2. Enable replication for tables: games, user_ratings');
}
