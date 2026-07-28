-- ============================================================================
-- Real impression tracking for the SEM ad system
-- ============================================================================
-- add-sem-bidding.sql already gives real, working keyword bidding + real
-- pay-per-click charging (ad_click_logs + shop_wallets), but there was never
-- any record of how many times a sponsored result was actually SHOWN to a
-- searcher — only clicks were logged. Without that, "does this increase
-- visibility?" had no real number to point to. This adds that missing half.

CREATE TABLE IF NOT EXISTS ad_impression_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  shop_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ad_impression_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert impressions" ON ad_impression_logs;
DROP POLICY IF EXISTS "Anyone can view impressions" ON ad_impression_logs;

CREATE POLICY "Anyone can insert impressions" ON ad_impression_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view impressions" ON ad_impression_logs FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_ail_product ON ad_impression_logs (product_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ail_shop ON ad_impression_logs (shop_id, viewed_at DESC);
