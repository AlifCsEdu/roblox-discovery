export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          roblox_id: number
          title: string
          description: string | null
          creator: string
          thumbnail_url: string | null
          rating: number
          total_ratings: number
          player_count_current: number
          player_count_peak: number
          player_count_7d_avg: number
          genres: string[]
          tags: string[]
          favorite_count: number
          gamepass_count: number
          badge_count: number
          visits: number
          quality_score: number
          created_at: string
          updated_at: string
          last_crawled: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          roblox_id: number
          title: string
          description?: string | null
          creator: string
          thumbnail_url?: string | null
          rating?: number
          total_ratings?: number
          player_count_current?: number
          player_count_peak?: number
          player_count_7d_avg?: number
          genres?: string[]
          tags?: string[]
          favorite_count?: number
          gamepass_count?: number
          badge_count?: number
          visits?: number
          created_at?: string
          updated_at?: string
          last_crawled?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          roblox_id?: number
          title?: string
          description?: string | null
          creator?: string
          thumbnail_url?: string | null
          rating?: number
          total_ratings?: number
          player_count_current?: number
          player_count_peak?: number
          player_count_7d_avg?: number
          genres?: string[]
          tags?: string[]
          favorite_count?: number
          gamepass_count?: number
          badge_count?: number
          visits?: number
          created_at?: string
          updated_at?: string
          last_crawled?: string | null
          is_active?: boolean
        }
      }
      user_ratings: {
        Row: {
          id: string
          game_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      genres: {
        Row: {
          id: string
          name: string
          slug: string
          color: string
          icon: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          color: string
          icon?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          color?: string
          icon?: string | null
          description?: string | null
          created_at?: string
        }
      }
      search_logs: {
        Row: {
          id: string
          query: string | null
          filters: Json
          result_count: number
          created_at: string
        }
        Insert: {
          id?: string
          query?: string | null
          filters: Json
          result_count: number
          created_at?: string
        }
        Update: {
          id?: string
          query?: string | null
          filters?: Json
          result_count?: number
          created_at?: string
        }
      }
    }
  }
}
