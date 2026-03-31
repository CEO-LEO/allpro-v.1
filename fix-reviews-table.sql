-- Fix reviews table: change promotion_id from UUID to TEXT
-- so it works with both UUID product IDs (from Supabase) and 
-- text product IDs (from static data like "lotus-003")

-- 1. Drop the foreign key constraint and index
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_promotion_id_fkey;
DROP INDEX IF EXISTS idx_reviews_promo;

-- 2. Change column type from UUID to TEXT
ALTER TABLE reviews ALTER COLUMN promotion_id TYPE TEXT USING promotion_id::TEXT;

-- 3. Recreate index on the text column
CREATE INDEX IF NOT EXISTS idx_reviews_promo ON reviews (promotion_id);

-- 4. Add unique constraint to prevent duplicate reviews per user+promotion
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_promo 
  ON reviews (user_id, promotion_id);
