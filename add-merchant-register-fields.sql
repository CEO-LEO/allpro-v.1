-- ============================================================================
-- Fix /merchant/register writing to the wrong tables entirely
-- ============================================================================
-- registerMerchantAction previously set profiles.role = 'merchant' (lowercase)
-- and created rows in merchants/branches — a separate, disused schema. The
-- real live merchant system (dashboard, stock, ads, everything else built
-- this session) checks profiles.role = 'MERCHANT' (uppercase) and reads from
-- merchant_profiles/merchant_branches instead. Anyone who registered through
-- this real, linked ("เปิดร้านค้า" on /guide) form got told "success" and
-- was redirected to /merchant/dashboard, but was never actually set up as a
-- working merchant.
--
-- This adds the two extra fields this form collects that merchant_profiles
-- didn't have a place for yet, plus a SECURITY DEFINER RPC to actually flip
-- the role. A plain client-side `.update({ role: 'MERCHANT' })` — which is
-- what the first version of this fix did — gets silently no-op'd by the
-- lock_protected_profile_columns trigger (lock-profile-columns.sql), which
-- resets role/coins/xp/level back to their old value on any UPDATE coming
-- from the anon/authenticated DB roles, specifically to stop a user
-- self-promoting via devtools. A SECURITY DEFINER function runs as the
-- function owner instead, so it passes that trigger legitimately — the
-- same escape hatch complete_profile_bonus()/award_points() already use.

ALTER TABLE merchant_profiles ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE merchant_profiles ADD COLUMN IF NOT EXISTS verification_document_url TEXT;

CREATE OR REPLACE FUNCTION public.activate_merchant(
  p_shop_name TEXT,
  p_tax_id TEXT,
  p_branch_name TEXT,
  p_logo_url TEXT DEFAULT NULL,
  p_document_url TEXT DEFAULT NULL
) RETURNS TABLE(success BOOLEAN, message TEXT)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_has_branch BOOLEAN;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE profiles SET role = 'MERCHANT', updated_at = NOW() WHERE id = v_uid;

  INSERT INTO merchant_profiles (user_id, shop_name, tax_id, shop_logo, verification_document_url)
  VALUES (v_uid, p_shop_name, p_tax_id, p_logo_url, p_document_url)
  ON CONFLICT (user_id) DO UPDATE
    SET shop_name = EXCLUDED.shop_name,
        tax_id = EXCLUDED.tax_id,
        shop_logo = COALESCE(EXCLUDED.shop_logo, merchant_profiles.shop_logo),
        verification_document_url = COALESCE(EXCLUDED.verification_document_url, merchant_profiles.verification_document_url),
        updated_at = NOW();

  SELECT EXISTS(SELECT 1 FROM merchant_branches WHERE user_id = v_uid) INTO v_has_branch;
  IF NOT v_has_branch THEN
    INSERT INTO merchant_branches (user_id, branch_name, is_main)
    VALUES (v_uid, p_branch_name, TRUE);
  END IF;

  RETURN QUERY SELECT TRUE, 'เปิดใช้งานร้านค้าสำเร็จ';
END;
$$;

REVOKE ALL ON FUNCTION public.activate_merchant(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_merchant(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
