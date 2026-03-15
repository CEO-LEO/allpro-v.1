import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a placeholder client if env vars are missing (build time / demo mode)
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Provide a dummy client for build time / when Supabase is not configured
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };

// Type definitions for our database
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          xp: number;
          coins: number;
          level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          xp?: number;
          coins?: number;
          level?: number;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
          xp?: number;
          coins?: number;
          level?: number;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          description: string;
          promoPrice: number;
          originalPrice: number;
          image: string;
          category: string;
          shopName: string;
          shopId: string;
          discount: number;
          location: string;
          distance: string;
          likes: number;
          reviews: number;
          rating: number;
          conditions: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          description: string;
          promoPrice: number;
          originalPrice: number;
          image: string;
          category: string;
          shopName: string;
          shopId: string;
          discount: number;
          location: string;
          distance?: string;
          likes?: number;
          reviews?: number;
          rating?: number;
          conditions: string;
        };
        Update: {
          title?: string;
          description?: string;
          promoPrice?: number;
          originalPrice?: number;
          image?: string;
          category?: string;
          shopName?: string;
          discount?: number;
          location?: string;
          likes?: number;
          reviews?: number;
          rating?: number;
          conditions?: string;
        };
      };
      saved_deals: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          product_id: string;
        };
        Update: {
          user_id?: string;
          product_id?: string;
        };
      };
    };
  };
}
