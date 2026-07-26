-- ============================================
-- SECURITY FIX: ป้องกัน client เขียนทับ role/coins/xp/level ของ profiles ตรงๆ
-- ============================================
-- ปัญหาเดิม: ทุก schema variant ของโปรเจกต์นี้มี RLS policy แบบ
--   "Users can update own profile" ... USING (auth.uid() = id)
-- ซึ่งอนุญาตแค่ "แถวไหน" ที่แก้ได้ แต่ไม่ได้จำกัดว่า "คอลัมน์ไหน" แก้ได้
-- เพราะแอปนี้เรียก Supabase ตรงจาก browser ด้วย anon key (lib/supabase.ts)
-- ผู้ใช้ที่ login แล้วเปิด DevTools console จึงรันโค้ดแบบนี้ได้ตรงๆ:
--   supabase.from('profiles').update({ role: 'MERCHANT', coins: 999999 }).eq('id', myId)
-- แล้วเลื่อนสถานะตัวเองเป็น Merchant หรือเติม coins ไม่จำกัดได้ทันที
--
-- วิธีแก้: เพิ่ม BEFORE UPDATE trigger บังคับให้คอลัมน์ role/coins/xp/level
-- คงค่าเดิมเสมอ เมื่อคำสั่ง UPDATE มาจาก DB role "anon"/"authenticated"
-- (คือทุกคำขอที่ยิงตรงจาก browser) — ส่วนฟังก์ชัน SECURITY DEFINER ด้านล่าง
-- (ซึ่งรันในบริบทของเจ้าของฟังก์ชัน ไม่ใช่ authenticated) จะยังผ่านได้ปกติ
-- ============================================

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

-- ============================================
-- เผื่อบางฐานข้อมูลยังไม่มีคอลัมน์ phone ใน profiles
-- (ต้องใช้ในหน้า /profile/edit)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

-- ============================================
-- RPC: complete_profile_bonus
-- ให้ client เรียกแทนการ update coins ตรงๆ
--  - atomic: ใช้ FOR UPDATE lock แถวก่อนเช็ค+เขียน กันแก้ 2 ครั้งพร้อมกันได้ coins ซ้ำ
--  - รันเป็น SECURITY DEFINER (เจ้าของฟังก์ชัน) จึงผ่าน trigger ด้านบนได้
--    โดยไม่ต้องเปิดช่องให้ client เขียน coins ตรงๆ
-- ============================================
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

-- =====================================================
-- ✅ หลังรันไฟล์นี้:
-- 1. Client แก้ role/coins/xp/level ของตัวเองตรงๆ ผ่าน supabase-js ไม่ได้อีกต่อไป
-- 2. การให้ bonus 10 coins ตอนกรอกโปรไฟล์ครบ ต้องเรียกผ่าน
--    supabase.rpc('complete_profile_bonus', { p_gender, p_age_range })
--    ซึ่ง atomic และกัน point-farming ได้จริง (ไม่ใช่ read-then-write แบบเดิม)
-- =====================================================
