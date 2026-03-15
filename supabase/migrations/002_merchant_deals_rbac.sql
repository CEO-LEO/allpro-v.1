-- ============================================================
-- Migration: Merchant Deal Management + RBAC
-- Builds on top of pro-hunter-schema.sql
-- ============================================================

-- ============================================================
-- 1. RLS Policies for promotions table
-- ============================================================

-- Anyone can READ active promotions
CREATE POLICY "Anyone can view active promotions"
  ON public.promotions FOR SELECT
  USING (status = 'active' OR status = 'scheduled');

-- Merchants can view ALL their own promotions (any status)
CREATE POLICY "Merchants can view own promotions"
  ON public.promotions FOR SELECT
  USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE owner_id = auth.uid()
    )
  );

-- Merchants can INSERT promotions for their own merchant account only
CREATE POLICY "Merchants can create own promotions"
  ON public.promotions FOR INSERT
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE owner_id = auth.uid()
    )
  );

-- Merchants can UPDATE only their own promotions
CREATE POLICY "Merchants can update own promotions"
  ON public.promotions FOR UPDATE
  USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE owner_id = auth.uid()
    )
  );

-- Merchants can soft-DELETE (archive) their own promotions
CREATE POLICY "Merchants can archive own promotions"
  ON public.promotions FOR DELETE
  USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE owner_id = auth.uid()
    )
  );

-- ============================================================
-- 2. RLS Policies for branches table
-- ============================================================

-- Anyone can view branches (needed for map view)
CREATE POLICY "Anyone can view branches"
  ON public.branches FOR SELECT
  USING (true);

-- Merchants can manage their own branches
CREATE POLICY "Merchants can manage own branches"
  ON public.branches FOR ALL
  USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE owner_id = auth.uid()
    )
  );

-- ============================================================
-- 3. RLS Policies for promotion_branches junction table
-- ============================================================

-- Anyone can view promotion-branch linkages
CREATE POLICY "Anyone can view promotion branches"
  ON public.promotion_branches FOR SELECT
  USING (true);

-- Merchants can link/unlink their own promotions to branches
CREATE POLICY "Merchants can manage own promotion branches"
  ON public.promotion_branches FOR ALL
  USING (
    promotion_id IN (
      SELECT p.id FROM public.promotions p
      JOIN public.merchants m ON p.merchant_id = m.id
      WHERE m.owner_id = auth.uid()
    )
  );

-- ============================================================
-- 4. Auto-Branch Linking Function
--    When a promotion is created, automatically link ALL
--    branches of that merchant to the promotion.
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_auto_link_branches()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into promotion_branches for every branch belonging
  -- to the same merchant as the new promotion
  INSERT INTO public.promotion_branches (promotion_id, branch_id)
  SELECT NEW.id, b.id
  FROM public.branches b
  WHERE b.merchant_id = NEW.merchant_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: fire after every new promotion is inserted
DROP TRIGGER IF EXISTS trg_auto_link_branches ON public.promotions;
CREATE TRIGGER trg_auto_link_branches
  AFTER INSERT ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_auto_link_branches();

-- ============================================================
-- 5. Create Deal with Branch Linking — Atomic RPC
--    Called from the Server Action. Returns the new promotion
--    with its linked branches and coordinates.
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_create_deal(
  p_merchant_id    UUID,
  p_title          TEXT,
  p_description    TEXT DEFAULT NULL,
  p_promo_type     TEXT DEFAULT 'discount',
  p_original_price NUMERIC DEFAULT NULL,
  p_promo_price    NUMERIC DEFAULT NULL,
  p_discount_pct   NUMERIC DEFAULT NULL,
  p_category       TEXT DEFAULT 'general',
  p_valid_from     TIMESTAMPTZ DEFAULT NOW(),
  p_valid_until    TIMESTAMPTZ DEFAULT NULL,
  p_promo_rules    JSONB DEFAULT '{}',
  p_metadata       JSONB DEFAULT '{}',
  p_quota_total    INT DEFAULT NULL,
  p_image_url      TEXT DEFAULT NULL,
  p_tags           TEXT[] DEFAULT '{}',
  p_status         TEXT DEFAULT 'draft',
  p_branch_ids     UUID[] DEFAULT NULL  -- NULL = all branches
)
RETURNS JSONB AS $$
DECLARE
  v_promo_id UUID;
  v_merchant_owner UUID;
  v_result JSONB;
  v_branch_count INT;
BEGIN
  -- 1. Verify the caller owns this merchant
  SELECT owner_id INTO v_merchant_owner
  FROM public.merchants
  WHERE id = p_merchant_id;

  IF v_merchant_owner IS NULL THEN
    RAISE EXCEPTION 'Merchant not found: %', p_merchant_id;
  END IF;

  IF v_merchant_owner != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: you do not own this merchant';
  END IF;

  -- 2. Calculate discount percentage if not provided
  IF p_discount_pct IS NULL AND p_original_price IS NOT NULL AND p_promo_price IS NOT NULL THEN
    p_discount_pct := ROUND(((p_original_price - p_promo_price) / p_original_price) * 100, 1);
  END IF;

  -- 3. Default valid_until to 30 days from now
  IF p_valid_until IS NULL THEN
    p_valid_until := NOW() + INTERVAL '30 days';
  END IF;

  -- 4. Insert the promotion
  INSERT INTO public.promotions (
    merchant_id, title, description, promo_type,
    original_price, promo_price, discount_pct,
    category, valid_from, valid_until,
    promo_rules, quota_total, quota_used,
    image_url, tags, status
  ) VALUES (
    p_merchant_id, p_title, p_description, p_promo_type::promo_type,
    p_original_price, p_promo_price, p_discount_pct,
    p_category, p_valid_from, p_valid_until,
    p_promo_rules || p_metadata,  -- Merge rules + metadata
    p_quota_total, 0,
    p_image_url, p_tags, p_status::promo_status
  )
  RETURNING id INTO v_promo_id;

  -- 5. Link branches
  --    If specific branch_ids are provided, link only those.
  --    Otherwise the trg_auto_link_branches trigger already linked ALL.
  IF p_branch_ids IS NOT NULL THEN
    -- Remove auto-linked branches and insert specific ones
    DELETE FROM public.promotion_branches WHERE promotion_id = v_promo_id;

    INSERT INTO public.promotion_branches (promotion_id, branch_id)
    SELECT v_promo_id, unnest(p_branch_ids)
    WHERE EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = ANY(p_branch_ids)
        AND b.merchant_id = p_merchant_id
    );
  END IF;

  -- 6. Count linked branches
  SELECT COUNT(*) INTO v_branch_count
  FROM public.promotion_branches
  WHERE promotion_id = v_promo_id;

  -- 7. Build result with branch coordinates for hyper-local search
  SELECT jsonb_build_object(
    'promotion_id', v_promo_id,
    'title', p_title,
    'status', p_status,
    'discount_pct', p_discount_pct,
    'valid_from', p_valid_from,
    'valid_until', p_valid_until,
    'branch_count', v_branch_count,
    'branches', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'branch_id', b.id,
        'name', b.name,
        'lat', ST_Y(b.location::geometry),
        'lng', ST_X(b.location::geometry),
        'address', b.address
      ))
      FROM public.promotion_branches pb
      JOIN public.branches b ON pb.branch_id = b.id
      WHERE pb.promotion_id = v_promo_id
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. Get Merchant Deals (with branch counts & performance)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_get_merchant_deals(
  p_merchant_id UUID,
  p_status      TEXT DEFAULT NULL,
  p_limit       INT DEFAULT 50,
  p_offset      INT DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  v_merchant_owner UUID;
BEGIN
  -- Verify ownership
  SELECT owner_id INTO v_merchant_owner
  FROM public.merchants WHERE id = p_merchant_id;

  IF v_merchant_owner != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(deal ORDER BY created_at DESC)
    FROM (
      SELECT jsonb_build_object(
        'id', p.id,
        'title', p.title,
        'description', p.description,
        'promo_type', p.promo_type,
        'original_price', p.original_price,
        'promo_price', p.promo_price,
        'discount_pct', p.discount_pct,
        'category', p.category,
        'status', p.status,
        'valid_from', p.valid_from,
        'valid_until', p.valid_until,
        'promo_rules', p.promo_rules,
        'image_url', p.image_url,
        'tags', p.tags,
        'quota_total', p.quota_total,
        'quota_used', p.quota_used,
        'view_count', p.view_count,
        'save_count', p.save_count,
        'share_count', p.share_count,
        'created_at', p.created_at,
        'branch_count', (
          SELECT COUNT(*) FROM public.promotion_branches pb
          WHERE pb.promotion_id = p.id
        ),
        'branches', (
          SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'id', b.id,
            'name', b.name,
            'lat', ST_Y(b.location::geometry),
            'lng', ST_X(b.location::geometry)
          )), '[]'::jsonb)
          FROM public.promotion_branches pb
          JOIN public.branches b ON pb.branch_id = b.id
          WHERE pb.promotion_id = p.id
        )
      ) AS deal, p.created_at
      FROM public.promotions p
      WHERE p.merchant_id = p_merchant_id
        AND (p_status IS NULL OR p.status = p_status::promo_status)
      ORDER BY p.created_at DESC
      LIMIT p_limit OFFSET p_offset
    ) sub
  ), '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. Index for fast merchant deal lookups
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_promotions_merchant_status
  ON public.promotions(merchant_id, status);

CREATE INDEX IF NOT EXISTS idx_promotion_branches_promo
  ON public.promotion_branches(promotion_id);

CREATE INDEX IF NOT EXISTS idx_promotion_branches_branch
  ON public.promotion_branches(branch_id);
