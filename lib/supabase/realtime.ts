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
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook to subscribe to game updates in real-time
 */
export function useRealtimeGames(filters?: {
  genres?: string[];
  rating_min?: number;
}) {
  const [games, setGames] = useState<Game[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to games table changes
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

    setChannel(gamesChannel);

    return () => {
      supabase.removeChannel(gamesChannel);
    };
  }, []);

  return { games, channel };
}

/**
 * Hook to subscribe to a single game's updates
 */
export function useRealtimeGame(robloxId: number) {
  const [game, setGame] = useState<Game | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to specific game updates
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
          setGame(payload.new as Game);
        }
      )
      .subscribe();

    setChannel(gameChannel);

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [robloxId]);

  return { game, channel };
}

/**
 * Hook to get live player count updates
 * Polls every 5 seconds and updates via Realtime when data changes
 */
export function useLivePlayerCount(robloxId: number, initialCount: number = 0) {
  const [playerCount, setPlayerCount] = useState(initialCount);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to player count updates
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
          const newGame = payload.new as Game;
          if (newGame.player_count_current !== undefined) {
            setPlayerCount(newGame.player_count_current);
          }
        }
      )
      .subscribe();

    setChannel(playerChannel);

    return () => {
      supabase.removeChannel(playerChannel);
    };
  }, [robloxId]);

  return { playerCount, channel };
}

/**
 * Hook to subscribe to new ratings for a game
 */
export function useRealtimeRatings(robloxId: number) {
  const [ratings, setRatings] = useState<any[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to new ratings
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
          setRatings((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    setChannel(ratingsChannel);

    return () => {
      supabase.removeChannel(ratingsChannel);
    };
  }, [robloxId]);

  return { ratings, channel };
}

/**
 * Hook to subscribe to presence (who's viewing what)
 */
export function usePresence(gameId: string, userId: string) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

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

    setChannel(presenceChannel);

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [gameId, userId]);

  return { onlineUsers, channel };
}

/**
 * Utility function to enable realtime for tables
 * Run this during setup if realtime is not enabled
 */
export async function enableRealtime() {
  const supabase = createClient();
  
  // This would typically be done via Supabase dashboard or SQL
  // Included here for reference
  console.log('Enable realtime via Supabase Dashboard:');
  console.log('1. Go to Database > Replication');
  console.log('2. Enable replication for tables: games, user_ratings');
}
