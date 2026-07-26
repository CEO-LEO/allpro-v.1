-- ============================================
-- Real voucher / points / rewards redemption system
-- ============================================
-- เดิมทั้งระบบ (lib/pointsUtils.ts) อยู่ใน localStorage ล้วนๆ:
--  - แต้มปลอมที่แก้ตรงๆ จาก DevTools ได้
--  - rewards/page.tsx ใช้ Math.random() > 0.1 ตัดสิน "สำเร็จ" การแลกที่เสียแต้มจริง
--  - ActiveCoupon.tsx เช็ค PIN '1234' ตัวเดียวสำหรับทุกร้าน/ทุกคูปอง
--
-- ไฟล์นี้สร้างระบบจริงทั้งหมด โดยใช้ pattern เดียวกับ complete_profile_bonus
-- ใน lock-profile-columns.sql: client ห้ามแก้ coins/สต็อก/คูปองตรงๆ
-- ต้องผ่าน SECURITY DEFINER RPC ที่ atomic เท่านั้น

-- ============================================
-- 1. points_transactions — ประวัติแต้ม (อ่านอย่างเดียวจาก client)
-- ============================================
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
-- ไม่มี policy สำหรับ INSERT/UPDATE ให้ authenticated/anon เลย —
-- เขียนได้เฉพาะผ่าน SECURITY DEFINER RPC ด้านล่างเท่านั้น

-- ============================================
-- 2. reward_stock — สต็อกของรางวัลจริง (ลดลงทุกครั้งที่แลก)
-- ============================================
CREATE TABLE IF NOT EXISTS reward_stock (
  reward_id TEXT PRIMARY KEY,
  remaining INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE reward_stock ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reward stock" ON reward_stock;
CREATE POLICY "Anyone can view reward stock"
  ON reward_stock FOR SELECT
  USING (true);
-- เขียนได้เฉพาะผ่าน redeem_reward() RPC เท่านั้น

-- Seed ค่าเริ่มต้นให้ตรงกับ data/rewards.json (idempotent)
INSERT INTO reward_stock (reward_id, remaining) VALUES
  ('rw-001', 45), ('rw-002', 23), ('rw-003', 100), ('rw-004', 12),
  ('rw-005', 67), ('rw-006', 3),  ('rw-007', 89),  ('rw-008', 34),
  ('rw-009', 18), ('rw-010', 41), ('rw-011', 28),  ('rw-012', 8)
ON CONFLICT (reward_id) DO NOTHING;

-- ============================================
-- 3. voucher_redemptions — คูปองที่แลกแล้วจริง
-- ============================================
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
  -- PIN 4 หลัก สุ่มต่อคูปอง (แทนค่าคงที่ '1234' เดิม) — ลูกค้าเห็นบนมือถือ
  -- ตอนใช้งานจริง พนักงานหน้าร้านพิมพ์ตามที่ลูกค้าบอก
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
-- เขียน/แก้ไขได้เฉพาะผ่าน redeem_reward() / redeem_voucher_by_pin() RPC เท่านั้น

-- ============================================
-- 4. RPC: award_points — ใช้แทนการ addPoints() แบบเดิม (localStorage)
-- ============================================
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

-- ============================================
-- 5. RPC: redeem_reward — แลกของรางวัลจริง (atomic, กันแลกซ้ำ/สต็อกติดลบ/แต้มติดลบ)
-- ============================================
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

  -- Lock the reward's stock row first to serialize concurrent redemptions
  SELECT remaining INTO v_remaining FROM reward_stock WHERE reward_id = p_reward_id FOR UPDATE;
  IF v_remaining IS NULL OR v_remaining <= 0 THEN
    RAISE EXCEPTION 'OUT_OF_STOCK';
  END IF;

  -- Lock the user's profile row, check balance
  SELECT coins INTO v_balance FROM profiles WHERE id = v_uid FOR UPDATE;
  IF v_balance IS NULL OR v_balance < p_points_cost THEN
    RAISE EXCEPTION 'INSUFFICIENT_POINTS';
  END IF;

  -- Already redeemed this reward before? (matches original one-per-reward UX)
  IF EXISTS (SELECT 1 FROM voucher_redemptions WHERE user_id = v_uid AND reward_id = p_reward_id) THEN
    RAISE EXCEPTION 'ALREADY_REDEEMED';
  END IF;

  -- Generate a unique voucher code
  LOOP
    v_code := 'HUNT';
    FOR i IN 1..8 LOOP
      v_code := v_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM voucher_redemptions vr WHERE vr.code = v_code);
  END LOOP;

  -- 4-digit staff-facing PIN, unique per voucher (not a shared constant)
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

-- ============================================
-- 6. RPC: redeem_voucher_by_pin — พนักงานหน้าร้าน "mark as used" ด้วย PIN จริง
-- ============================================
-- ไม่มีร้านค้าจริง (7-Eleven/Starbucks ฯลฯ) ผูกบัญชีกับระบบนี้ จึงไม่มี
-- "merchant" ให้ auth จำกัดสิทธิ์ตรงนี้ — ความปลอดภัยอยู่ที่ code (สุ่ม 8 หลัก
-- ที่ต้องรู้จาก QR/หน้าจอลูกค้าเท่านั้น) + PIN 4 หลักที่สุ่มต่อคูปอง แทนที่จะ
-- เป็นค่าคงที่ตายตัวแบบเดิม
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
