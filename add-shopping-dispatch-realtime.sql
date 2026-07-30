-- ============================================================================
-- Smart Dispatch — nearest-runner auto-assignment for the ฝากหิ้ว marketplace
-- ============================================================================
-- Previously: a posted job just sat in the open list for any runner to browse
-- and accept (first-come). This adds real single-target dispatch: the job is
-- offered to the ONE nearest online runner to the STORE (not the requester —
-- a runner has to physically go buy the item, so store proximity is what
-- matters). If that runner doesn't accept within the offer window, the next
-- nearest online runner is tried. If nobody is online/eligible, the job falls
-- back to the existing open browse list exactly as before — nothing is lost.
--
-- No new server infrastructure (no pg_cron) is required: reassignment on
-- timeout happens lazily, inside accept_shopping_request itself, the moment
-- anyone next tries to interact with an expired offer.

-- ----------------------------------------------------------------------------
-- 1. Store coordinates (dispatch matches against the store, not the requester)
-- ----------------------------------------------------------------------------
ALTER TABLE shopping_requests ADD COLUMN IF NOT EXISTS store_lat DOUBLE PRECISION;
ALTER TABLE shopping_requests ADD COLUMN IF NOT EXISTS store_lng DOUBLE PRECISION;

-- ----------------------------------------------------------------------------
-- 2. Dispatch state
-- ----------------------------------------------------------------------------
ALTER TABLE shopping_requests ADD COLUMN IF NOT EXISTS offered_runner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE shopping_requests ADD COLUMN IF NOT EXISTS offer_expires_at TIMESTAMPTZ;
ALTER TABLE shopping_requests ADD COLUMN IF NOT EXISTS declined_runner_ids UUID[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_shopping_requests_offered_runner ON shopping_requests (offered_runner_id) WHERE offered_runner_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. Runner presence — online/offline + current position
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS runner_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN NOT NULL DEFAULT false,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE runner_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own runner status" ON runner_status;
CREATE POLICY "Users can view own runner status"
  ON runner_status FOR SELECT
  USING (auth.uid() = user_id);

-- No direct INSERT/UPDATE policy — writes only via set_runner_online() below,
-- same "mutate through a SECURITY DEFINER RPC" pattern as shopping_requests.

-- ----------------------------------------------------------------------------
-- 4. Haversine distance helper (km) — no PostGIS dependency
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.haversine_km(
  lat1 DOUBLE PRECISION, lng1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION, lng2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION
LANGUAGE sql IMMUTABLE AS $$
  SELECT 6371 * 2 * ASIN(SQRT(
    POWER(SIN(RADIANS(lat2 - lat1) / 2), 2) +
    COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
    POWER(SIN(RADIANS(lng2 - lng1) / 2), 2)
  ));
$$;

-- ----------------------------------------------------------------------------
-- 5. set_runner_online — toggle presence + update live position
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_runner_online(
  p_online BOOLEAN,
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL
) RETURNS TABLE(success BOOLEAN, message TEXT)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO runner_status (user_id, is_online, lat, lng, updated_at)
  VALUES (auth.uid(), p_online, p_lat, p_lng, NOW())
  ON CONFLICT (user_id) DO UPDATE
    SET is_online = EXCLUDED.is_online,
        lat = COALESCE(EXCLUDED.lat, runner_status.lat),
        lng = COALESCE(EXCLUDED.lng, runner_status.lng),
        updated_at = NOW();

  RETURN QUERY SELECT TRUE, CASE WHEN p_online THEN 'ออนไลน์รับงานแล้ว' ELSE 'ออฟไลน์แล้ว' END;
END;
$$;

REVOKE ALL ON FUNCTION public.set_runner_online(BOOLEAN, DOUBLE PRECISION, DOUBLE PRECISION) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_runner_online(BOOLEAN, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;

-- ----------------------------------------------------------------------------
-- 6. assign_next_runner — offer the job to the nearest eligible online runner
--    Safe to call repeatedly: skips anyone already in declined_runner_ids,
--    clears the offer (falls back to open list) if nobody eligible is online.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_next_runner(p_request_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT, assigned_to UUID)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_row shopping_requests%ROWTYPE;
  v_declined UUID[];
  v_candidate UUID;
BEGIN
  SELECT * INTO v_row FROM shopping_requests WHERE id = p_request_id FOR UPDATE;

  IF v_row.id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'ไม่พบงานนี้', NULL::UUID;
    RETURN;
  END IF;

  IF v_row.status != 'open' THEN
    RETURN QUERY SELECT FALSE, 'งานนี้ไม่ได้เปิดรับแล้ว', NULL::UUID;
    RETURN;
  END IF;

  v_declined := v_row.declined_runner_ids;

  -- If there's still a live (non-expired) offer outstanding, leave it alone
  IF v_row.offered_runner_id IS NOT NULL AND v_row.offer_expires_at > NOW() THEN
    RETURN QUERY SELECT TRUE, 'มีข้อเสนอที่ยังไม่หมดเวลาอยู่แล้ว', v_row.offered_runner_id;
    RETURN;
  END IF;

  -- Expired (or first-time) offer — the previously-offered runner (if any) is skipped from now on
  IF v_row.offered_runner_id IS NOT NULL THEN
    v_declined := array_append(v_declined, v_row.offered_runner_id);
  END IF;

  -- Only consider store-location jobs for distance matching; nearest online
  -- runner not yet declined and not the requester themselves
  IF v_row.store_lat IS NOT NULL AND v_row.store_lng IS NOT NULL THEN
    SELECT rs.user_id INTO v_candidate
    FROM runner_status rs
    WHERE rs.is_online = TRUE
      AND rs.lat IS NOT NULL AND rs.lng IS NOT NULL
      AND rs.user_id != v_row.requester_id
      AND NOT (rs.user_id = ANY(v_declined))
    ORDER BY haversine_km(rs.lat, rs.lng, v_row.store_lat, v_row.store_lng) ASC
    LIMIT 1;
  ELSE
    -- No store coordinates on this job (e.g. posted before this feature, or
    -- Google Maps wasn't configured) — fall back to "any online runner"
    SELECT rs.user_id INTO v_candidate
    FROM runner_status rs
    WHERE rs.is_online = TRUE
      AND rs.user_id != v_row.requester_id
      AND NOT (rs.user_id = ANY(v_declined))
    ORDER BY rs.updated_at ASC
    LIMIT 1;
  END IF;

  IF v_candidate IS NULL THEN
    UPDATE shopping_requests
    SET offered_runner_id = NULL, offer_expires_at = NULL, declined_runner_ids = v_declined
    WHERE id = p_request_id;
    RETURN QUERY SELECT TRUE, 'ไม่มีคนหิ้วออนไลน์ใกล้ๆ ตอนนี้ งานจะแสดงในรายการเปิดรับทั่วไป', NULL::UUID;
    RETURN;
  END IF;

  UPDATE shopping_requests
  SET offered_runner_id = v_candidate,
      offer_expires_at = NOW() + INTERVAL '3 minutes',
      declined_runner_ids = v_declined
  WHERE id = p_request_id;

  RETURN QUERY SELECT TRUE, 'เสนองานให้คนหิ้วที่ใกล้ร้านที่สุดแล้ว', v_candidate;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_next_runner(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_next_runner(UUID) TO authenticated;

-- ----------------------------------------------------------------------------
-- 7. decline_shopping_request — the offered runner explicitly passes;
--    immediately dispatches to the next nearest candidate
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decline_shopping_request(p_request_id UUID)
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
  IF v_row.offered_runner_id != auth.uid() THEN
    RETURN QUERY SELECT FALSE, 'คุณไม่ได้ถูกเสนองานนี้';
    RETURN;
  END IF;
  IF v_row.status != 'open' THEN
    RETURN QUERY SELECT FALSE, 'งานนี้ไม่อยู่ในสถานะที่ปฏิเสธได้';
    RETURN;
  END IF;

  -- Force the offer to look "expired" from assign_next_runner's point of view
  -- so it treats the current offered_runner_id as declined and skips them
  UPDATE shopping_requests
  SET offer_expires_at = NOW() - INTERVAL '1 second'
  WHERE id = p_request_id;

  PERFORM assign_next_runner(p_request_id);

  RETURN QUERY SELECT TRUE, 'ปฏิเสธงานแล้ว ระบบจะเสนอให้คนถัดไป';
END;
$$;

REVOKE ALL ON FUNCTION public.decline_shopping_request(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decline_shopping_request(UUID) TO authenticated;

-- ----------------------------------------------------------------------------
-- 8. accept_shopping_request — now dispatch-aware:
--    - Live (non-expired) offer to someone else -> blocked
--    - Expired offer -> try reassigning to the next candidate first; only
--      falls through to "anyone can accept" once no candidate is left
-- ----------------------------------------------------------------------------
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

  IF v_row.offered_runner_id IS NOT NULL THEN
    IF v_row.offer_expires_at > NOW() THEN
      IF v_row.offered_runner_id != auth.uid() THEN
        RETURN QUERY SELECT FALSE, 'งานนี้กำลังเสนอให้คนหิ้วอีกคนก่อน กรุณารออีกสักครู่';
        RETURN;
      END IF;
    ELSE
      -- Offer expired — try to hand it to the next nearest candidate first
      PERFORM assign_next_runner(p_request_id);
      SELECT * INTO v_row FROM shopping_requests WHERE id = p_request_id FOR UPDATE;

      IF v_row.offered_runner_id IS NOT NULL AND v_row.offered_runner_id != auth.uid() THEN
        RETURN QUERY SELECT FALSE, 'งานนี้ถูกเสนอให้คนหิ้วคนถัดไปแล้ว ลองงานอื่นก่อนนะ';
        RETURN;
      END IF;
    END IF;
  END IF;

  UPDATE shopping_requests
  SET status = 'accepted', runner_id = auth.uid(), accepted_at = NOW(),
      offered_runner_id = NULL, offer_expires_at = NULL
  WHERE id = p_request_id;

  RETURN QUERY SELECT TRUE, 'รับงานสำเร็จ!';
END;
$$;

REVOKE ALL ON FUNCTION public.accept_shopping_request(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_shopping_request(UUID) TO authenticated;

-- ----------------------------------------------------------------------------
-- 9. Realtime — so an offered runner sees the job appear instantly without
--    refreshing (falls back gracefully to polling client-side if this isn't
--    supported/enabled in a given project)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE shopping_requests;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
