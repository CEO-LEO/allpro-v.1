-- ============================================
-- DROP & RECREATE community_comments
-- (table is empty so safe to drop)
-- ============================================
DROP TRIGGER IF EXISTS trg_update_comment_count ON community_comments;
DROP TABLE IF EXISTS community_comments;

-- Recreate with post_id as TEXT (supports UUID + mock IDs)
CREATE TABLE community_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  username TEXT NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created ON community_comments(created_at ASC);

-- RLS
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments
CREATE POLICY "Anyone can view comments"
  ON community_comments FOR SELECT
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Auth users can create comments"
  ON community_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON community_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Update community_posts comment count via trigger (only for UUID post_ids)
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET comments = comments + 1 WHERE id::TEXT = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET comments = GREATEST(0, comments - 1) WHERE id::TEXT = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_comment_count ON community_comments;
CREATE TRIGGER trg_update_comment_count
  AFTER INSERT OR DELETE ON community_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();
