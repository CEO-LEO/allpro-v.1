-- ============================================
-- "คุ้มไหม?" (Worth It) voting — moved from lib/reviewData.ts mock data
-- to a real Supabase table
-- ============================================
-- เดิม WorthItMeter.tsx อ่าน worthItCount/totalVotes จาก reviewsDatabase
-- ใน lib/reviewData.ts ซึ่งมีข้อมูลจริงแค่ 2 product id ปลอม ('lotus-003',
-- 'big-c-007') สินค้าจริงทุกตัวจึงไม่เคยมีปุ่มโหวตแสดงเลย

CREATE TABLE IF NOT EXISTS product_worth_it_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_worth_it BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_worth_it_votes_product ON product_worth_it_votes (product_id);

ALTER TABLE product_worth_it_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view worth-it votes" ON product_worth_it_votes;
DROP POLICY IF EXISTS "Auth users can cast own worth-it vote" ON product_worth_it_votes;

-- Aggregate counts need to be readable by everyone (including anon)
CREATE POLICY "Anyone can view worth-it votes"
  ON product_worth_it_votes FOR SELECT
  USING (true);

-- Each user can only insert their own vote; the UNIQUE constraint above
-- blocks a second vote on the same product (server-enforced, not just localStorage)
CREATE POLICY "Auth users can cast own worth-it vote"
  ON product_worth_it_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
