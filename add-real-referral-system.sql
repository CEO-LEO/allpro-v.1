-- ============================================================================
-- Real referral system — replaces the fully localStorage/mock lib/referralUtils.ts
-- ============================================================================
-- Previously: referral codes were random per-browser (localStorage), "stats"
-- were a fabricated Math.floor(referrals * 0.3) "pending" heuristic, and the
-- referrer's bonus was never actually awarded to the referrer (the function
-- that was supposed to do it ran in the REFERRED user's own browser session,
-- so it could only ever award points to the wrong account — it was never
-- callable correctly client-side at all, real or not).
--
-- This makes the whole loop real: a stable code tied to the account, a real
-- one-time-use referrals ledger, and a SECURITY DEFINER RPC that can credit
-- BOTH the referrer and the referred user correctly in one atomic step.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  referrer_bonus INTEGER NOT NULL DEFAULT 50,
  referred_bonus INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals (referrer_id, created_at DESC);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view referrals they're part of" ON referrals;
CREATE POLICY "Users can view referrals they're part of"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- No INSERT/UPDATE policy — only apply_referral_code() below can create rows.

-- ----------------------------------------------------------------------------
-- get_or_create_referral_code — stable, real, tied to the account (not the browser)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_or_create_referral_code()
RETURNS TEXT
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_code TEXT;
  v_candidate TEXT;
  v_attempts INTEGER := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT referral_code INTO v_code FROM profiles WHERE id = v_uid;
  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;

  WHILE v_code IS NULL AND v_attempts < 20 LOOP
    v_attempts := v_attempts + 1;
    v_candidate := 'HUNTER-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    BEGIN
      UPDATE profiles SET referral_code = v_candidate WHERE id = v_uid;
      v_code := v_candidate;
    EXCEPTION WHEN unique_violation THEN
      NULL; -- candidate taken, retry
    END;
  END LOOP;

  IF v_code IS NULL THEN
    RAISE EXCEPTION 'Could not generate a unique referral code';
  END IF;

  RETURN v_code;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_referral_code() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_referral_code() TO authenticated;

-- ----------------------------------------------------------------------------
-- apply_referral_code — called once by the REFERRED user; credits both sides
-- for real. One-time only (referred_id is UNIQUE), can't refer yourself.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_referral_code(p_code TEXT)
RETURNS TABLE(success BOOLEAN, message TEXT, bonus_awarded INTEGER)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_referrer_id UUID;
  v_bonus INTEGER := 50;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM referrals WHERE referred_id = v_uid) THEN
    RETURN QUERY SELECT FALSE, 'คุณเคยใช้โค้ดชวนเพื่อนไปแล้ว', 0;
    RETURN;
  END IF;

  SELECT id INTO v_referrer_id FROM profiles WHERE referral_code = UPPER(TRIM(p_code));
  IF v_referrer_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'ไม่พบโค้ดนี้', 0;
    RETURN;
  END IF;
  IF v_referrer_id = v_uid THEN
    RETURN QUERY SELECT FALSE, 'ใช้โค้ดของตัวเองไม่ได้', 0;
    RETURN;
  END IF;

  INSERT INTO referrals (referrer_id, referred_id, referral_code, referrer_bonus, referred_bonus)
  VALUES (v_referrer_id, v_uid, UPPER(TRIM(p_code)), v_bonus, v_bonus);

  UPDATE profiles SET coins = coins + v_bonus WHERE id = v_referrer_id;
  INSERT INTO points_transactions (user_id, type, amount, description, icon)
  VALUES (v_referrer_id, 'earn', v_bonus, 'เพื่อนสมัครผ่านโค้ดชวนเพื่อนของคุณ', '👥');

  UPDATE profiles SET coins = coins + v_bonus WHERE id = v_uid;
  INSERT INTO points_transactions (user_id, type, amount, description, icon)
  VALUES (v_uid, 'earn', v_bonus, 'ลงทะเบียนผ่านโค้ดชวนเพื่อน', '🎉');

  RETURN QUERY SELECT TRUE, 'รับแต้มชวนเพื่อนสำเร็จ!', v_bonus;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_referral_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_referral_code(TEXT) TO authenticated;
