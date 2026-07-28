-- ============================================
-- Real staff-verified "mark coupon as used" for promotion_claims
-- ============================================
-- เดิม "ใช้แล้ว" บนหน้า /wallet/use/[id] เป็นแค่ลูกค้ากดเองบนมือถือตัวเอง:
--   supabase.from('promotion_claims').update({status:'used'}).eq('id', claimId)
-- ซึ่งผ่านได้เพราะ policy เดิม "Users can update own claims" อนุญาตให้เจ้าของ
-- claim แก้ status ของตัวเองได้ตรงๆ — เท่ากับไม่มีการยืนยันจากพนักงานเลย
-- (ต่างจาก voucher_redemptions ที่มี redeem_voucher_by_pin แล้ว)
--
-- ไฟล์นี้ทำให้ promotion_claims ใช้ pattern เดียวกับ redeem_voucher_by_pin:
-- ลูกค้าห้ามแก้ status เองอีกต่อไป ต้องผ่าน SECURITY DEFINER RPC ที่เช็ค PIN จริง

-- 1. PIN 4 หลัก สุ่มต่อ claim — ลูกค้าเห็นบนมือถือ, พนักงานพิมพ์ยืนยัน
ALTER TABLE promotion_claims
  ADD COLUMN IF NOT EXISTS redeem_pin TEXT DEFAULT lpad(floor(random() * 10000)::int::text, 4, '0');

-- Backfill existing rows that predate this column
UPDATE promotion_claims SET redeem_pin = lpad(floor(random() * 10000)::int::text, 4, '0')
WHERE redeem_pin IS NULL;

-- 2. ปิดรูรั่ว: ลูกค้าห้ามแก้ status ของ claim ตัวเองตรงๆ อีกต่อไป
DROP POLICY IF EXISTS "Users can update own claims" ON promotion_claims;
-- ไม่มี UPDATE policy ให้ authenticated/anon เลย — แก้ได้เฉพาะผ่าน RPC ด้านล่าง

-- 3. RPC: redeem_claim_by_pin — พนักงานหน้าร้าน "mark as used" ด้วย PIN จริง
--    (pattern เดียวกับ redeem_voucher_by_pin ใน add-voucher-system.sql —
--    ไม่มีระบบ merchant login ผูกกับแอปนี้ ความปลอดภัยอยู่ที่ต้องรู้ claim_id
--    ของตัวเอง (จากหน้าจอที่ล็อกอินอยู่แล้ว) + PIN 4 หลักที่สุ่มต่อ claim)
CREATE OR REPLACE FUNCTION public.redeem_claim_by_pin(
  p_claim_id UUID,
  p_pin TEXT
) RETURNS TABLE(success BOOLEAN, message TEXT)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_row promotion_claims%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_row FROM promotion_claims WHERE id = p_claim_id FOR UPDATE;

  IF v_row.id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'ไม่พบคูปองนี้';
    RETURN;
  END IF;
  IF v_row.user_id != auth.uid() THEN
    RETURN QUERY SELECT FALSE, 'ไม่ใช่คูปองของคุณ';
    RETURN;
  END IF;
  IF v_row.status = 'used' THEN
    RETURN QUERY SELECT FALSE, 'คูปองนี้ถูกใช้ไปแล้ว';
    RETURN;
  END IF;
  IF v_row.status != 'claimed' THEN
    RETURN QUERY SELECT FALSE, 'คูปองนี้ไม่สามารถใช้งานได้แล้ว';
    RETURN;
  END IF;
  IF v_row.redeem_pin != p_pin THEN
    RETURN QUERY SELECT FALSE, 'รหัส PIN ไม่ถูกต้อง';
    RETURN;
  END IF;

  UPDATE promotion_claims SET status = 'used', used_at = NOW() WHERE id = v_row.id;
  RETURN QUERY SELECT TRUE, 'ใช้คูปองสำเร็จ!';
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_claim_by_pin(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_claim_by_pin(UUID, TEXT) TO authenticated;
