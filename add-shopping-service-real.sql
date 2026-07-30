-- ============================================================================
-- Real peer-to-peer "ฝากซื้อ/คนหิ้ว" marketplace (in-house alternative to Fastwork)
-- ============================================================================
-- /services/shopping/post and /services/shopping/browse previously only had
-- mock data (`mockRequests` hardcoded in browse/page.tsx) and a submit handler
-- that just showed a toast — nothing was ever persisted or actually browsable
-- by another real user. This creates the real table + atomic state-transition
-- RPCs so posting, browsing, accepting, and completing a job are all real.
--
-- No in-app payment exists yet (v1: cash/transfer settled directly between
-- the two users in person) — budget/service_fee are informational only.

CREATE TABLE IF NOT EXISTS shopping_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,

  store_name TEXT NOT NULL,
  store_location TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,

  budget NUMERIC(12,2) NOT NULL CHECK (budget >= 0),
  service_fee NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (service_fee >= 0),

  deadline TIMESTAMPTZ NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent', 'asap')),
  images TEXT[] DEFAULT '{}',

  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'completed', 'cancelled')),
  runner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopping_requests_status ON shopping_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shopping_requests_requester ON shopping_requests (requester_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shopping_requests_runner ON shopping_requests (runner_id, created_at DESC);

ALTER TABLE shopping_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view open requests" ON shopping_requests;
DROP POLICY IF EXISTS "Requester or runner can view own request" ON shopping_requests;
DROP POLICY IF EXISTS "Users can post own requests" ON shopping_requests;

-- Anyone (including anon browsing before login) can see open jobs
CREATE POLICY "Anyone can view open requests"
  ON shopping_requests FOR SELECT
  USING (status = 'open');

-- The requester and the assigned runner can always see their own request,
-- regardless of status (needed for "My Requests" / "My Jobs" pages)
CREATE POLICY "Requester or runner can view own request"
  ON shopping_requests FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = runner_id);

-- Only the poster can create, and only as themselves
CREATE POLICY "Users can post own requests"
  ON shopping_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- No UPDATE/DELETE policy for authenticated/anon — every status transition
-- (accept/cancel/complete) goes through a SECURITY DEFINER RPC below so
-- concurrent accepts on the same job can't both "win".

-- ============================================================================
-- RPC: accept_shopping_request — atomically claim an open job
-- ============================================================================
CREATE OR REPLACE FUNCTION public.accept_shopping_request(p_request_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_row shopping_requests%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_row FROM shopping_requests WHERE id = p_request_id FOR UPDATE;

  IF v_row.id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'ไม่พบงานนี้';
    RETURN;
  END IF;
  IF v_row.requester_id = auth.uid() THEN
    RETURN QUERY SELECT FALSE, 'ไม่สามารถรับงานของตัวเองได้';
    RETURN;
  END IF;
  IF v_row.status != 'open' THEN
    RETURN QUERY SELECT FALSE, 'งานนี้ถูกรับไปแล้วหรือไม่เปิดรับแล้ว';
    RETURN;
  END IF;

  UPDATE shopping_requests
  SET status = 'accepted', runner_id = auth.uid(), accepted_at = NOW()
  WHERE id = p_request_id;

  RETURN QUERY SELECT TRUE, 'รับงานสำเร็จ!';
END;
$$;

REVOKE ALL ON FUNCTION public.accept_shopping_request(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_shopping_request(UUID) TO authenticated;

-- ============================================================================
-- RPC: cancel_shopping_request — requester cancels their own OPEN request
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cancel_shopping_request(p_request_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_row shopping_requests%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_row FROM shopping_requests WHERE id = p_request_id FOR UPDATE;

  IF v_row.id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'ไม่พบงานนี้';
    RETURN;
  END IF;
  IF v_row.requester_id != auth.uid() THEN
    RETURN QUERY SELECT FALSE, 'ยกเลิกได้เฉพาะงานของตัวเอง';
    RETURN;
  END IF;
  IF v_row.status NOT IN ('open', 'accepted') THEN
    RETURN QUERY SELECT FALSE, 'งานนี้ยกเลิกไม่ได้แล้ว';
    RETURN;
  END IF;

  UPDATE shopping_requests
  SET status = 'cancelled', cancelled_at = NOW()
  WHERE id = p_request_id;

  RETURN QUERY SELECT TRUE, 'ยกเลิกงานแล้ว';
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_shopping_request(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_shopping_request(UUID) TO authenticated;

-- ============================================================================
-- RPC: complete_shopping_request — runner marks a job as bought & delivered
-- ============================================================================
CREATE OR REPLACE FUNCTION public.complete_shopping_request(p_request_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_row shopping_requests%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_row FROM shopping_requests WHERE id = p_request_id FOR UPDATE;

  IF v_row.id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'ไม่พบงานนี้';
    RETURN;
  END IF;
  IF v_row.runner_id != auth.uid() THEN
    RETURN QUERY SELECT FALSE, 'ทำเครื่องหมายเสร็จได้เฉพาะคนที่รับงานนี้';
    RETURN;
  END IF;
  IF v_row.status != 'accepted' THEN
    RETURN QUERY SELECT FALSE, 'งานนี้ไม่อยู่ในสถานะที่ทำเสร็จได้';
    RETURN;
  END IF;

  UPDATE shopping_requests
  SET status = 'completed', completed_at = NOW()
  WHERE id = p_request_id;

  RETURN QUERY SELECT TRUE, 'ทำเครื่องหมายส่งงานสำเร็จแล้ว!';
END;
$$;

REVOKE ALL ON FUNCTION public.complete_shopping_request(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_shopping_request(UUID) TO authenticated;
