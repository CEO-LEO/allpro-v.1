-- Table: community_posts
-- Stores user-created community posts (deals, reviews, etc.)
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  username TEXT NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  location TEXT,
  place_id TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  tag TEXT NOT NULL DEFAULT 'โปรพิเศษ',
  is_brand BOOLEAN DEFAULT FALSE,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_tag ON community_posts(tag);

-- RLS
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view posts
CREATE POLICY "Anyone can view community posts"
  ON community_posts FOR SELECT
  USING (true);

-- Authenticated users can create posts
CREATE POLICY "Auth users can create posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Storage bucket for community post images
-- Run this in Supabase SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('community-images', 'community-images', true);
