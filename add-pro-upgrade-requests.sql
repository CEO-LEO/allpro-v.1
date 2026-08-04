-- ============================================================================
-- Real "อัพเกรดเป็น Pro" flow — request + admin approval (no payment gateway)
-- ============================================================================
-- Previously: merchant/upgrade/page.tsx faked a 2-second "processing" delay,
-- claimed "🔒 Secure payment powered by Stripe", then just flipped a LOCAL
-- Zustand flag (updateUser({isPro:true})) — no real Stripe integration
-- existed, no money was ever actually charged, and the Pro flag was never
-- persisted to the database (lost on a different device / cleared cache).
--
-- This makes it real end-to-end without needing real payment credentials:
-- the merchant submits a request, an admin reviews and approves/rejects it,
-- and approval durably sets merchant_profiles.is_pro — the same column
-- AuthListener/lib/supabase/auth.ts now read into the real session.

ALTER TABLE merchant_profiles ADD COLUMN IF NOT EXISTS is_pro BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS pro_upgrade_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  price NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  note TEXT,
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one open (pending) request per merchant at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_pro_requests_one_pending
  ON pro_upgrade_requests (merchant_id) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_pro_requests_status ON pro_upgrade_requests (status, created_at DESC);

ALTER TABLE pro_upgrade_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants can view own requests" ON pro_upgrade_requests;
CREATE POLICY "Merchants can view own requests"
  ON pro_upgrade_requests FOR SELECT
  USING (auth.uid() = merchant_id);

DROP POLICY IF EXISTS "Merchants can create own requests" ON pro_upgrade_requests;
CREATE POLICY "Merchants can create own requests"
  ON pro_upgrade_requests FOR INSERT
  WITH CHECK (auth.uid() = merchant_id);

DROP POLICY IF EXISTS "Admins can view all requests" ON pro_upgrade_requests;
CREATE POLICY "Admins can view all requests"
  ON pro_upgrade_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'));

-- No UPDATE policy for anyone — review/approve only via the RPC below, which
-- also has to update merchant_profiles.is_pro atomically alongside it.

-- ----------------------------------------------------------------------------
-- review_pro_upgrade_request — admin-only, atomic approve/reject
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.review_pro_upgrade_request(
  p_request_id UUID,
  p_approve BOOLEAN,
  p_admin_note TEXT DEFAULT NULL
) RETURNS TABLE(success BOOLEAN, message TEXT)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row pro_upgrade_requests%ROWTYPE;
BEGIN
  IF v_uid IS NULL OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_uid AND role = 'ADMIN') THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  SELECT * INTO v_row FROM pro_upgrade_requests WHERE id = p_request_id FOR UPDATE;

  IF v_row.id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'ไม่พบคำขอนี้';
    RETURN;
  END IF;
  IF v_row.status != 'pending' THEN
    RETURN QUERY SELECT FALSE, 'คำขอนี้ถูกตรวจสอบไปแล้ว';
    RETURN;
  END IF;

  UPDATE pro_upgrade_requests
  SET status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
      admin_note = p_admin_note,
      reviewed_by = v_uid,
      reviewed_at = NOW()
  WHERE id = p_request_id;

  IF p_approve THEN
    UPDATE merchant_profiles SET is_pro = TRUE WHERE user_id = v_row.merchant_id;
  END IF;

  RETURN QUERY SELECT TRUE, CASE WHEN p_approve THEN 'อนุมัติแล้ว' ELSE 'ปฏิเสธคำขอแล้ว' END;
END;
$$;

REVOKE ALL ON FUNCTION public.review_pro_upgrade_request(UUID, BOOLEAN, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_pro_upgrade_request(UUID, BOOLEAN, TEXT) TO authenticated;
