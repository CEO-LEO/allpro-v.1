-- ═══════════════════════════════════════════════════════════════════════════
-- RUN-ALL-MIGRATIONS.sql
-- รวม SQL ทั้งหมดที่ต้องรันใน Supabase จากงานที่ทำมาในเซสชันนี้ เรียงตามลำดับ
-- ที่ต้องรัน (มี dependency ระหว่างไฟล์ จึงรันตามลำดับนี้เท่านั้น)
--
-- ทุกไฟล์เขียนแบบ idempotent (เช็ค IF NOT EXISTS / DROP POLICY IF EXISTS ก่อน
-- CREATE ใหม่เสมอ) ดังนั้นรันซ้ำได้โดยไม่พัง ถ้าไฟล์ไหนเคยรันไปแล้วบางส่วน
-- ก็รันซ้ำทั้งไฟล์นี้ได้อย่างปลอดภัย
--
-- วิธีรัน: ดู "ขั้นตอนการรัน" ในข้อความคำตอบที่แนบมาด้วย
-- ═══════════════════════════════════════════════════════════════════════════


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ [0] add-profile-columns.sql                                            │
-- │ เพิ่มคอลัมน์ gender/age_range/profile_completed/preferred_tags/         │
-- │ onboarding_completed ใน profiles — ไฟล์ [1] ด้านล่างต้องใช้คอลัมน์พวกนี้ │
-- └─────────────────────────────────────────────────────────────────────────┘
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') THEN
    ALTER TABLE profiles ADD COLUMN gender TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'age_range') THEN
    ALTER TABLE profiles ADD COLUMN age_range TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_completed') THEN
    ALTER TABLE profiles ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferred_tags') THEN
    ALTER TABLE profiles ADD COLUMN preferred_tags TEXT[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ [1] lock-profile-columns.sql                                           │
-- │ SECURITY FIX: ล็อกไม่ให้ client แก้ role/coins/xp/level ตรงๆ            │
-- │ + RPC complete_profile_bonus (แต้ม +10 ตอนกรอกโปรไฟล์ครบ)               │
-- └─────────────────────────────────────────────────────────────────────────┘
CREATE OR REPLACE FUNCTION public.lock_protected_profile_columns()
RETURNS trigger AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') THEN
    NEW.role  := OLD.role;
    NEW.coins := OLD.coins;
    NEW.xp    := OLD.xp;
    NEW.level := OLD.level;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lock_protected_profile_columns_trigger ON profiles;
CREATE TRIGGER lock_protected_profile_columns_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.lock_protected_profile_columns();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.complete_profile_bonus(
  p_gender TEXT,
  p_age_range TEXT
) RETURNS TABLE(bonus_awarded BOOLEAN, new_coins INTEGER)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_was_completed BOOLEAN;
  v_new_coins INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT profile_completed INTO v_was_completed
  FROM profiles WHERE id = v_uid FOR UPDATE;

  UPDATE profiles
  SET gender = p_gender,
      age_range = p_age_range,
      profile_completed = TRUE,
      coins = coins + (CASE WHEN COALESCE(v_was_completed, FALSE) THEN 0 ELSE 10 END)
  WHERE id = v_uid
  RETURNING coins INTO v_new_coins;

  RETURN QUERY SELECT NOT COALESCE(v_was_completed, FALSE), v_new_coins;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_profile_bonus(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_profile_bonus(TEXT, TEXT) TO authenticated;


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ [2] add-merchant-location.sql                                          │
-- │ เพิ่ม shop_lat/shop_lng ใน merchant_profiles — ไฟล์ [3] ต้องใช้คอลัมน์นี้│
-- │ ในการ backfill สาขาหลัก                                                │
-- └─────────────────────────────────────────────────────────────────────────┘
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchant_profiles' AND column_name = 'shop_lat'
  ) THEN
    ALTER TABLE merchant_profiles ADD COLUMN shop_lat DOUBLE PRECISION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchant_profiles' AND column_name = 'shop_lng'
  ) THEN
    ALTER TABLE merchant_profiles ADD COLUMN shop_lng DOUBLE PRECISION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_merchant_profiles_geo
  ON merchant_profiles (shop_lat, shop_lng)
  WHERE shop_lat IS NOT NULL AND shop_lng IS NOT NULL;


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ [3] add-merchant-branches.sql                                          │
-- │ ระบบหลายสาขาต่อร้านค้าจริง (merchant_branches) + สต็อกต่อสาขา           │
-- │ (product_branch_stock) — backfill สาขาหลักจาก merchant_profiles ที่ [2] │
-- │ เพิ่งเติมคอลัมน์ให้                                                    │
-- └─────────────────────────────────────────────────────────────────────────┘
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

INSERT INTO merchant_branches (user_id, branch_name, address, lat, lng, phone, is_main)
SELECT mp.user_id, COALESCE(mp.shop_name, 'สาขาหลัก'), mp.shop_address, mp.shop_lat, mp.shop_lng, mp.phone, TRUE
FROM merchant_profiles mp
WHERE mp.shop_lat IS NOT NULL
  AND mp.shop_lng IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM merchant_branches mb WHERE mb.user_id = mp.user_id AND mb.is_main = TRUE
  );

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

CREATE POLICY "Auth users can report stock"
  ON product_branch_stock FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth users can update stock"
  ON product_branch_stock FOR UPDATE
  USING (auth.role() = 'authenticated');


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ [4] add-merchant-auto-replies.sql                                      │
-- │ ตั้งค่า AI Auto-Reply ของร้านค้า (ย้ายจาก localStorage)                 │
-- └─────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS merchant_auto_replies (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  replies JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE merchant_auto_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants can view own auto-replies" ON merchant_auto_replies;
DROP POLICY IF EXISTS "Merchants can insert own auto-replies" ON merchant_auto_replies;
DROP POLICY IF EXISTS "Merchants can update own auto-replies" ON merchant_auto_replies;

CREATE POLICY "Merchants can view own auto-replies"
  ON merchant_auto_replies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Merchants can insert own auto-replies"
  ON merchant_auto_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Merchants can update own auto-replies"
  ON merchant_auto_replies FOR UPDATE
  USING (auth.uid() = user_id);


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ [5] add-worth-it-votes.sql                                             │
-- │ โหวต "คุ้มไหม?" จริงต่อสินค้า (แทน mock data 2 ตัวเดิม)                │
-- └─────────────────────────────────────────────────────────────────────────┘
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

CREATE POLICY "Anyone can view worth-it votes"
  ON product_worth_it_votes FOR SELECT
  USING (true);

CREATE POLICY "Auth users can cast own worth-it vote"
  ON product_worth_it_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ [6] add-merchant-ad-campaigns.sql                                      │
-- │ แคมเปญโฆษณาของร้านค้า (ย้ายจาก localStorage)                           │
-- └─────────────────────────────────────────────────────────────────────────┘
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


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ [7] add-product-availability.sql                                       │
-- │ คอลัมน์สต็อกสินค้าจริง (แทนการ toggle แค่ใน local state)                │
-- └─────────────────────────────────────────────────────────────────────────┘
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_available'
  ) THEN
    ALTER TABLE products ADD COLUMN is_available BOOLEAN DEFAULT TRUE;
  END IF;
END $$;


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ [8] add-voucher-system.sql                                             │
-- │ ระบบแต้ม/ของรางวัล/คูปองจริงทั้งหมด (แทน localStorage + Math.random())  │
-- └─────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_transactions_user ON points_transactions (user_id, created_at DESC);

ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own points history" ON points_transactions;
CREATE POLICY "Users can view own points history"
  ON points_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS reward_stock (
  reward_id TEXT PRIMARY KEY,
  remaining INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE reward_stock ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reward stock" ON reward_stock;
CREATE POLICY "Anyone can view reward stock"
  ON reward_stock FOR SELECT
  USING (true);

INSERT INTO reward_stock (reward_id, remaining) VALUES
  ('rw-001', 45), ('rw-002', 23), ('rw-003', 100), ('rw-004', 12),
  ('rw-005', 67), ('rw-006', 3),  ('rw-007', 89),  ('rw-008', 34),
  ('rw-009', 18), ('rw-010', 41), ('rw-011', 28),  ('rw-012', 8)
ON CONFLICT (reward_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS voucher_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id TEXT NOT NULL,
  reward_name TEXT NOT NULL,
  reward_image TEXT,
  brand TEXT,
  points_cost INTEGER NOT NULL,
  value_label TEXT,
  code TEXT NOT NULL UNIQUE,
  redeem_pin TEXT NOT NULL,
  qr_data TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  UNIQUE (user_id, reward_id)
);

CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_user ON voucher_redemptions (user_id);
CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_code ON voucher_redemptions (code);

ALTER TABLE voucher_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own vouchers" ON voucher_redemptions;
CREATE POLICY "Users can view own vouchers"
  ON voucher_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.award_points(
  p_amount INTEGER,
  p_description TEXT,
  p_icon TEXT DEFAULT '⭐'
) RETURNS TABLE(new_balance INTEGER)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_new_balance INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  UPDATE profiles SET coins = coins + p_amount
  WHERE id = v_uid
  RETURNING coins INTO v_new_balance;

  INSERT INTO points_transactions (user_id, type, amount, description, icon)
  VALUES (v_uid, 'earn', p_amount, p_description, p_icon);

  RETURN QUERY SELECT v_new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.award_points(INTEGER, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_points(INTEGER, TEXT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.redeem_reward(
  p_reward_id TEXT,
  p_reward_name TEXT,
  p_reward_image TEXT,
  p_brand TEXT,
  p_points_cost INTEGER,
  p_value_label TEXT,
  p_validity_days INTEGER
) RETURNS TABLE(
  voucher_id UUID,
  code TEXT,
  redeem_pin TEXT,
  qr_data TEXT,
  expires_at TIMESTAMPTZ,
  new_balance INTEGER
)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_balance INTEGER;
  v_remaining INTEGER;
  v_code TEXT;
  v_pin TEXT;
  v_qr TEXT;
  v_expires TIMESTAMPTZ;
  v_new_balance INTEGER;
  v_voucher_id UUID;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT remaining INTO v_remaining FROM reward_stock WHERE reward_id = p_reward_id FOR UPDATE;
  IF v_remaining IS NULL OR v_remaining <= 0 THEN
    RAISE EXCEPTION 'OUT_OF_STOCK';
  END IF;

  SELECT coins INTO v_balance FROM profiles WHERE id = v_uid FOR UPDATE;
  IF v_balance IS NULL OR v_balance < p_points_cost THEN
    RAISE EXCEPTION 'INSUFFICIENT_POINTS';
  END IF;

  IF EXISTS (SELECT 1 FROM voucher_redemptions WHERE user_id = v_uid AND reward_id = p_reward_id) THEN
    RAISE EXCEPTION 'ALREADY_REDEEMED';
  END IF;

  LOOP
    v_code := 'HUNT';
    FOR i IN 1..8 LOOP
      v_code := v_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM voucher_redemptions vr WHERE vr.code = v_code);
  END LOOP;

  v_pin := lpad(floor(random() * 10000)::int::text, 4, '0');
  v_qr := 'ALLPRO-VOUCHER:' || v_code;
  v_expires := NOW() + (p_validity_days || ' days')::interval;

  UPDATE profiles SET coins = coins - p_points_cost WHERE id = v_uid RETURNING coins INTO v_new_balance;
  UPDATE reward_stock SET remaining = remaining - 1 WHERE reward_id = p_reward_id;

  INSERT INTO voucher_redemptions (
    user_id, reward_id, reward_name, reward_image, brand, points_cost,
    value_label, code, redeem_pin, qr_data, expires_at
  ) VALUES (
    v_uid, p_reward_id, p_reward_name, p_reward_image, p_brand, p_points_cost,
    p_value_label, v_code, v_pin, v_qr, v_expires
  ) RETURNING id INTO v_voucher_id;

  INSERT INTO points_transactions (user_id, type, amount, description, icon)
  VALUES (v_uid, 'spend', p_points_cost, 'แลก: ' || p_reward_name, '🎁');

  RETURN QUERY SELECT v_voucher_id, v_code, v_pin, v_qr, v_expires, v_new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_reward(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_reward(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.redeem_voucher_by_pin(
  p_code TEXT,
  p_pin TEXT
) RETURNS TABLE(success BOOLEAN, message TEXT)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_row voucher_redemptions%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_row FROM voucher_redemptions WHERE code = p_code FOR UPDATE;

  IF v_row.id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'ไม่พบคูปองนี้';
    RETURN;
  END IF;
  IF v_row.status = 'used' THEN
    RETURN QUERY SELECT FALSE, 'คูปองนี้ถูกใช้ไปแล้ว';
    RETURN;
  END IF;
  IF v_row.expires_at < NOW() THEN
    UPDATE voucher_redemptions SET status = 'expired' WHERE id = v_row.id;
    RETURN QUERY SELECT FALSE, 'คูปองหมดอายุแล้ว';
    RETURN;
  END IF;
  IF v_row.redeem_pin != p_pin THEN
    RETURN QUERY SELECT FALSE, 'รหัส PIN ไม่ถูกต้อง';
    RETURN;
  END IF;

  UPDATE voucher_redemptions SET status = 'used', used_at = NOW() WHERE id = v_row.id;
  RETURN QUERY SELECT TRUE, 'ทำเครื่องหมายใช้งานแล้ว';
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_voucher_by_pin(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_voucher_by_pin(TEXT, TEXT) TO authenticated;


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ [9] add-promotion-views-geo.sql                                        │
-- │ เพิ่ม lat/lng แบบ opportunistic ใน promotion_views ให้ AudienceLocation  │
-- │ คำนวณระยะห่างจริงจากสาขาแทนชื่อห้างปลอม                                │
-- └─────────────────────────────────────────────────────────────────────────┘
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promotion_views' AND column_name = 'lat'
  ) THEN
    ALTER TABLE promotion_views ADD COLUMN lat DOUBLE PRECISION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promotion_views' AND column_name = 'lng'
  ) THEN
    ALTER TABLE promotion_views ADD COLUMN lng DOUBLE PRECISION;
  END IF;
END $$;


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ [10] add-merchant-settings.sql                                         │
-- │ ตารางค่าตั้งค่าร้านค้าจริง (notifications/payment/advanced) แทนปุ่ม     │
-- │ "บันทึก" ปลอมใน MerchantSettingsDashboard.tsx                          │
-- └─────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS merchant_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  push_notifications BOOLEAN NOT NULL DEFAULT false,
  email_notifications BOOLEAN NOT NULL DEFAULT false,
  flash_sale_alerts BOOLEAN NOT NULL DEFAULT false,
  new_order_alerts BOOLEAN NOT NULL DEFAULT false,
  bank_name TEXT,
  account_number TEXT,
  cod_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_clean_expired BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE merchant_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Merchants manage own settings" ON merchant_settings;
CREATE POLICY "Merchants manage own settings" ON merchant_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_merchant_settings_is_active ON merchant_settings (is_active);

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ เสร็จแล้ว — ดูขั้นตอนตรวจสอบผลลัพธ์ในคำตอบที่แนบไฟล์นี้มา
-- ═══════════════════════════════════════════════════════════════════════════
