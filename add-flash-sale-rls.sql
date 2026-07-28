-- ============================================================
-- Tighten promotions RLS for real Flash Sale creation
-- ============================================================
-- The existing policies let ANY authenticated user insert/update
-- ANY promotion row (WITH CHECK (auth.role() = 'authenticated')),
-- which was fine while nothing actually wrote to this table, but
-- is not safe now that merchants can create real Flash Sales here.
-- This replaces them with ownership-scoped policies.

DROP POLICY IF EXISTS "Anyone can view promotions" ON promotions;
DROP POLICY IF EXISTS "Auth users can insert promotions" ON promotions;
DROP POLICY IF EXISTS "Auth users can update promotions" ON promotions;

-- Public (including anonymous) can see active promotions
CREATE POLICY "Anyone can view active promotions"
  ON promotions FOR SELECT
  USING (status = 'active');

-- Merchants can see all of their own promotions regardless of status
CREATE POLICY "Merchants can view own promotions"
  ON promotions FOR SELECT
  USING (
    merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid())
  );

-- Merchants can create promotions only for their own merchant account
CREATE POLICY "Merchants can create own promotions"
  ON promotions FOR INSERT
  WITH CHECK (
    merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid())
  );

-- Merchants can update only their own promotions
CREATE POLICY "Merchants can update own promotions"
  ON promotions FOR UPDATE
  USING (
    merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid())
  );
