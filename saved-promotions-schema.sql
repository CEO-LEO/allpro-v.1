-- Table: saved_promotions
-- Stores which promotions each user has bookmarked/saved
CREATE TABLE IF NOT EXISTS saved_promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, promo_id)
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_saved_promotions_user_id ON saved_promotions(user_id);

-- RLS policies
ALTER TABLE saved_promotions ENABLE ROW LEVEL SECURITY;

-- Users can view their own saved promotions
CREATE POLICY "Users can view own saved promotions"
  ON saved_promotions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own saved promotions
CREATE POLICY "Users can save promotions"
  ON saved_promotions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved promotions
CREATE POLICY "Users can unsave promotions"
  ON saved_promotions FOR DELETE
  USING (auth.uid() = user_id);
