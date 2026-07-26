-- ============================================
-- Merchant ad campaigns — moved from localStorage to Supabase
-- ============================================
-- เดิม app/(merchant)/merchant/ads/page.tsx เก็บแคมเปญทั้งหมดใน
-- localStorage (`merchant_{userId}_campaigns`) เท่านั้น — หายทันทีที่เปลี่ยน
-- เครื่อง/ล้าง cache ย้ายมาเก็บที่นี่แทน
--
-- หมายเหตุ: impressions/clicks/spent ยังคงเป็น 0 เสมอ เพราะแอปนี้ยังไม่มี
-- ระบบ ad-serving/tracking จริง — ไม่ได้ปลอมตัวเลขเพิ่มเติมจากที่เป็นอยู่

CREATE TABLE IF NOT EXISTS merchant_ad_campaigns (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_name TEXT,
  product_id TEXT,
  product_name TEXT,
  product_image TEXT,
  product_price NUMERIC(12,2),
  product_discount NUMERIC(5,2),
  goal TEXT NOT NULL DEFAULT 'visibility' CHECK (goal IN ('visibility', 'traffic')),
  daily_budget NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_budget NUMERIC(12,2) NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_user ON merchant_ad_campaigns (user_id);

ALTER TABLE merchant_ad_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants can view own campaigns" ON merchant_ad_campaigns;
DROP POLICY IF EXISTS "Merchants can insert own campaigns" ON merchant_ad_campaigns;
DROP POLICY IF EXISTS "Merchants can update own campaigns" ON merchant_ad_campaigns;

CREATE POLICY "Merchants can view own campaigns"
  ON merchant_ad_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Merchants can insert own campaigns"
  ON merchant_ad_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Merchants can update own campaigns"
  ON merchant_ad_campaigns FOR UPDATE
  USING (auth.uid() = user_id);
