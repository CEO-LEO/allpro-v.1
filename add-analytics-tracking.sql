-- ============================================================================
-- ALL PRO — Analytics Tracking Tables
-- เพิ่มตารางสำหรับเก็บข้อมูลการดูและกดรับโปรโมชัน
-- วิธีใช้: Supabase Dashboard → SQL Editor → New Query → วางโค้ดนี้ → Run
-- ============================================================================

-- ┌─────────────────────────────────────────────┐
-- │  1. PROMOTION_VIEWS (ยอดเข้าชมโปรโมชั่น)    │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS promotion_views (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  merchant_id TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'feed',  -- feed, search, share, direct
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE promotion_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert views" ON promotion_views;
DROP POLICY IF EXISTS "Anyone can view views" ON promotion_views;
DROP POLICY IF EXISTS "Merchants can view own product views" ON promotion_views;

-- ทุกคนสามารถบันทึก view ได้ (รวม anonymous)
CREATE POLICY "Anyone can insert views" ON promotion_views FOR INSERT WITH CHECK (true);
-- Merchants สามารถดูข้อมูล views ของสินค้าตัวเอง
CREATE POLICY "Anyone can select views" ON promotion_views FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_pv_product ON promotion_views (product_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_pv_merchant ON promotion_views (merchant_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_pv_user ON promotion_views (user_id);
-- แต่ละบัญชีนับได้แค่ 1 ครั้งต่อ 1 สินค้า
CREATE UNIQUE INDEX IF NOT EXISTS idx_pv_unique_user_product ON promotion_views (user_id, product_id) WHERE user_id IS NOT NULL;

-- ┌─────────────────────────────────────────────┐
-- │  2. PROMOTION_CLAIMS (ยอดกดรับโปรโมชั่น)     │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS promotion_claims (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  merchant_id TEXT,
  
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'claimed',  -- claimed, used, expired, cancelled
  used_at TIMESTAMPTZ,
  
  -- ข้อมูลราคา ณ เวลาที่กดรับ
  original_price NUMERIC(12,2),
  promo_price NUMERIC(12,2),
  amount_saved NUMERIC(12,2),
  
  -- tracking
  source TEXT DEFAULT 'promo_page',  -- promo_page, feed, share
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE promotion_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own claims" ON promotion_claims;
DROP POLICY IF EXISTS "Users can view own claims" ON promotion_claims;
DROP POLICY IF EXISTS "Anyone can select claims" ON promotion_claims;
DROP POLICY IF EXISTS "Users can update own claims" ON promotion_claims;

-- Users สามารถกดรับโปรโมชั่นของตัวเองได้
CREATE POLICY "Users can insert own claims" ON promotion_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
-- ทุกคนดู claims ได้ (สำหรับ merchant dashboard)
CREATE POLICY "Anyone can select claims" ON promotion_claims FOR SELECT USING (true);
-- Users สามารถอัปเดต claims ของตัวเอง (เช่น เปลี่ยนสถานะเป็น used)
CREATE POLICY "Users can update own claims" ON promotion_claims FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_pc_product ON promotion_claims (product_id, claimed_at DESC);
CREATE INDEX IF NOT EXISTS idx_pc_merchant ON promotion_claims (merchant_id, claimed_at DESC);
CREATE INDEX IF NOT EXISTS idx_pc_user ON promotion_claims (user_id, claimed_at DESC);
CREATE INDEX IF NOT EXISTS idx_pc_status ON promotion_claims (status);

-- ┌─────────────────────────────────────────────┐
-- │  3. Helper View สำหรับ Merchant Dashboard    │
-- └─────────────────────────────────────────────┘
-- สร้าง View รวมสถิติรายสินค้าสำหรับ merchant
CREATE OR REPLACE VIEW merchant_product_stats AS
SELECT
  p.id AS product_id,
  p.shop_id AS merchant_id,
  p.shop_name,
  p.title,
  p.price AS promo_price,
  p.original_price,
  COALESCE(v.view_count, 0) AS view_count,
  COALESCE(c.claim_count, 0) AS claim_count,
  COALESCE(c.used_count, 0) AS used_count,
  COALESCE(c.total_saved, 0) AS total_amount_saved,
  CASE 
    WHEN COALESCE(v.view_count, 0) > 0 
    THEN ROUND((COALESCE(c.claim_count, 0)::NUMERIC / v.view_count) * 100, 2)
    ELSE 0 
  END AS conversion_rate
FROM products p
LEFT JOIN (
  SELECT product_id, COUNT(*) AS view_count
  FROM promotion_views
  GROUP BY product_id
) v ON v.product_id = p.id
LEFT JOIN (
  SELECT 
    product_id,
    COUNT(*) AS claim_count,
    COUNT(*) FILTER (WHERE status = 'used') AS used_count,
    COALESCE(SUM(amount_saved), 0) AS total_saved
  FROM promotion_claims
  GROUP BY product_id
) c ON c.product_id = p.id;
