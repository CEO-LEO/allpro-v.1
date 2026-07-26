-- ============================================
-- Real multi-branch support for merchants
-- ============================================
-- เดิม BranchAvailability.tsx ("เช็คสต็อกสาขาอื่นของแบรนด์เดียวกัน") และ
-- merchant/stock page ("เลือกสาขา") เป็นแนวคิดที่ดี แต่ไม่มี schema จริง
-- รองรับเลย — merchant_profiles เก็บได้แค่ 1 ที่ตั้งต่อร้าน
--
-- ตารางนี้เพิ่มการรองรับหลายสาขาต่อร้านค้าจริง โดยใช้ user_id เดียวกับ
-- merchant_profiles/products.shop_id เป็นตัวเชื่อม

CREATE TABLE IF NOT EXISTS merchant_branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_name TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone TEXT,
  is_main BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_branches_user ON merchant_branches (user_id);
CREATE INDEX IF NOT EXISTS idx_merchant_branches_geo ON merchant_branches (lat, lng)
  WHERE lat IS NOT NULL AND lng IS NOT NULL;

ALTER TABLE merchant_branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view branches" ON merchant_branches;
DROP POLICY IF EXISTS "Owners manage own branches" ON merchant_branches;

CREATE POLICY "Anyone can view branches"
  ON merchant_branches FOR SELECT
  USING (true);

CREATE POLICY "Owners manage own branches"
  ON merchant_branches FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Backfill: turn each merchant's existing single location (from
-- add-merchant-location.sql) into their "main" branch, so /map and
-- BranchAvailability have real data immediately without merchants
-- re-entering anything
INSERT INTO merchant_branches (user_id, branch_name, address, lat, lng, phone, is_main)
SELECT mp.user_id, COALESCE(mp.shop_name, 'สาขาหลัก'), mp.shop_address, mp.shop_lat, mp.shop_lng, mp.phone, TRUE
FROM merchant_profiles mp
WHERE mp.shop_lat IS NOT NULL
  AND mp.shop_lng IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM merchant_branches mb WHERE mb.user_id = mp.user_id AND mb.is_main = TRUE
  );

-- ============================================
-- Per-branch, per-product stock status
-- ============================================
-- product_id is TEXT (not a FK) to match the same defensive pattern used by
-- reviews.promotion_id — some products still carry non-UUID legacy ids
CREATE TABLE IF NOT EXISTS product_branch_stock (
  product_id TEXT NOT NULL,
  branch_id UUID NOT NULL REFERENCES merchant_branches(id) ON DELETE CASCADE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (product_id, branch_id)
);

CREATE INDEX IF NOT EXISTS idx_product_branch_stock_product ON product_branch_stock (product_id);

ALTER TABLE product_branch_stock ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view stock" ON product_branch_stock;
DROP POLICY IF EXISTS "Auth users can report stock" ON product_branch_stock;
DROP POLICY IF EXISTS "Auth users can update stock" ON product_branch_stock;

CREATE POLICY "Anyone can view stock"
  ON product_branch_stock FOR SELECT
  USING (true);

-- Crowd-sourced reporting: any signed-in user can report/correct stock
-- status at a branch (matches the original "customers report stock" UX),
-- not just the owning merchant
CREATE POLICY "Auth users can report stock"
  ON product_branch_stock FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth users can update stock"
  ON product_branch_stock FOR UPDATE
  USING (auth.role() = 'authenticated');
