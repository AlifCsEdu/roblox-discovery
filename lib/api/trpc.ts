import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Input schemas
export const gameListInputSchema = z.object({
  rating_min: z.number().min(0).max(100).default(0),
  rating_max: z.number().min(0).max(100).default(100),
  genres: z.array(z.string()).optional(),
  sort: z.enum(['trending', 'rating', 'new', 'players']).default('trending'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const gameDetailInputSchema = z.string();
export const searchInputSchema = z.object({
  query: z.string().min(1),
  genres: z.array(z.string()).optional(),
  rating_min: z.number().min(0).max(100).optional(),
  rating_max: z.number().min(0).max(100).optional(),
  min_players: z.number().min(0).optional(),
  sort: z.enum(['relevance', 'rating', 'players', 'trending']).default('relevance'),
  limit: z.number().min(1).max(50).default(10),
});

// Instant search - no ratings, just Rolimons data
export const instantSearchInputSchema = z.object({
  query: z.string().min(1),
  genres: z.array(z.string()).optional(),
  min_players: z.number().min(0).optional(),
  sort: z.enum(['relevance', 'players', 'trending']).default('relevance'),
  limit: z.number().min(1).max(50).default(10),
});

// Batch rating fetch for progressive loading
export const batchRatingInputSchema = z.object({
  placeIds: z.array(z.string()),
});

export type GameListInput = z.infer<typeof gameListInputSchema>;
export type GameDetailInput = z.infer<typeof gameDetailInputSchema>;
export type SearchInput = z.infer<typeof searchInputSchema>;
export type InstantSearchInput = z.infer<typeof instantSearchInputSchema>;
export type BatchRatingInput = z.infer<typeof batchRatingInputSchema>;
