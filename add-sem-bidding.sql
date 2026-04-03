-- ============================================================================
-- ALL PRO — SEM Keyword Bidding System (Pay-Per-Click)
-- ระบบประมูล Keyword แบบ PPC สำหรับร้านค้า
-- วิธีใช้: Supabase Dashboard → SQL Editor → New Query → วางโค้ดนี้ → Run
-- ============================================================================

-- ┌─────────────────────────────────────────────┐
-- │  1. เพิ่มฟิลด์ SEM ในตาราง products         │
-- └─────────────────────────────────────────────┘
ALTER TABLE products ADD COLUMN IF NOT EXISTS sem_keywords TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS cpc_bid NUMERIC(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sem_active BOOLEAN DEFAULT FALSE;

-- Index สำหรับค้นหา keywords ด้วย GIN (เร็วมากสำหรับ array search)
CREATE INDEX IF NOT EXISTS idx_products_sem_keywords ON products USING GIN (sem_keywords);
CREATE INDEX IF NOT EXISTS idx_products_sem_active ON products (sem_active) WHERE sem_active = TRUE;

-- ┌─────────────────────────────────────────────┐
-- │  2. SHOP_WALLETS (กระเป๋าเงินร้านค้า)       │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS shop_wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id TEXT NOT NULL UNIQUE,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shop_wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants can view own wallet" ON shop_wallets;
DROP POLICY IF EXISTS "Merchants can update own wallet" ON shop_wallets;
DROP POLICY IF EXISTS "Anyone can insert wallet" ON shop_wallets;

CREATE POLICY "Anyone can view wallets" ON shop_wallets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert wallet" ON shop_wallets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update wallet" ON shop_wallets FOR UPDATE USING (true);

-- ┌─────────────────────────────────────────────┐
-- │  3. AD_CLICK_LOGS (ประวัติคลิกโฆษณา)        │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS ad_click_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  shop_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  keyword TEXT NOT NULL,
  cpc_amount NUMERIC(10,2) NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  ip_hash TEXT,  -- เก็บ hash ของ IP เพื่อกัน click fraud
  user_agent TEXT
);

ALTER TABLE ad_click_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert clicks" ON ad_click_logs;
DROP POLICY IF EXISTS "Anyone can view clicks" ON ad_click_logs;

CREATE POLICY "Anyone can insert clicks" ON ad_click_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view clicks" ON ad_click_logs FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_acl_product ON ad_click_logs (product_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_acl_shop ON ad_click_logs (shop_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_acl_user ON ad_click_logs (user_id, clicked_at DESC);
-- กัน click ซ้ำ: user เดียวกัน + product เดียวกัน ภายใน session
CREATE INDEX IF NOT EXISTS idx_acl_dedup ON ad_click_logs (user_id, product_id, clicked_at DESC);

-- ┌─────────────────────────────────────────────┐
-- │  4. WALLET_TRANSACTIONS (ประวัติธุรกรรม)     │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'topup', 'cpc_deduct', 'refund'
  amount NUMERIC(12,2) NOT NULL,
  balance_after NUMERIC(12,2) NOT NULL,
  description TEXT,
  reference_id UUID,  -- อ้างอิง ad_click_logs.id
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Anyone can insert transactions" ON wallet_transactions;

CREATE POLICY "Anyone can view transactions" ON wallet_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert transactions" ON wallet_transactions FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_wt_shop ON wallet_transactions (shop_id, created_at DESC);

-- ┌─────────────────────────────────────────────┐
-- │  5. RPC: search_promotions_with_sem          │
-- │  ค้นหาโปรโมชันพร้อมจัดอันดับ SEM           │
-- └─────────────────────────────────────────────┘
CREATE OR REPLACE FUNCTION search_promotions_with_sem(
  search_query TEXT,
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  original_price NUMERIC,
  image TEXT,
  category TEXT,
  shop_name TEXT,
  shop_id TEXT,
  discount INTEGER,
  location TEXT,
  distance TEXT,
  likes INTEGER,
  reviews INTEGER,
  rating NUMERIC,
  sem_keywords TEXT[],
  cpc_bid NUMERIC,
  sem_active BOOLEAN,
  is_sem_result BOOLEAN,
  sem_rank INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  query_lower TEXT := LOWER(TRIM(search_query));
BEGIN
  RETURN QUERY
  WITH sem_results AS (
    -- ดึงสินค้าที่ทำ SEM และ keyword ตรงกับคำค้นหา
    SELECT 
      p.*,
      TRUE AS is_sem,
      ROW_NUMBER() OVER (ORDER BY p.cpc_bid DESC, p.created_at DESC) AS rank_num
    FROM products p
    INNER JOIN shop_wallets w ON w.shop_id = p.shop_id
    WHERE p.sem_active = TRUE
      AND p.cpc_bid > 0
      AND w.balance >= p.cpc_bid  -- ต้องมีเงินพอจ่าย
      AND EXISTS (
        SELECT 1 FROM unnest(p.sem_keywords) AS kw
        WHERE LOWER(kw) LIKE '%' || query_lower || '%'
           OR query_lower LIKE '%' || LOWER(kw) || '%'
      )
  ),
  normal_results AS (
    -- ดึงสินค้าทั่วไปที่ตรงกับคำค้นหา (ไม่ใช่ SEM)
    SELECT 
      p.*,
      FALSE AS is_sem,
      0::BIGINT AS rank_num
    FROM products p
    WHERE (
      LOWER(p.title) LIKE '%' || query_lower || '%'
      OR LOWER(COALESCE(p.description, '')) LIKE '%' || query_lower || '%'
      OR LOWER(COALESCE(p.shop_name, '')) LIKE '%' || query_lower || '%'
      OR LOWER(COALESCE(p.category, '')) LIKE '%' || query_lower || '%'
    )
    AND p.id NOT IN (SELECT sr.id FROM sem_results sr)
  )
  -- รวมผลลัพธ์: SEM ก่อน (เรียงตาม bid สูงสุด) แล้วตามด้วยปกติ
  SELECT 
    r.id, r.title, r.description, r.price, r.original_price,
    r.image, r.category, r.shop_name, r.shop_id,
    r.discount, r.location, r.distance,
    r.likes, r.reviews, r.rating,
    r.sem_keywords, r.cpc_bid, r.sem_active,
    r.is_sem AS is_sem_result,
    r.rank_num::INTEGER AS sem_rank,
    r.created_at
  FROM (
    SELECT *, 1 AS sort_group FROM sem_results
    UNION ALL
    SELECT *, 2 AS sort_group FROM normal_results
  ) r
  ORDER BY r.sort_group ASC, r.rank_num ASC, r.created_at DESC
  LIMIT result_limit;
END;
$$;

-- ┌─────────────────────────────────────────────┐
-- │  6. RPC: process_ad_click                    │
-- │  บันทึกคลิก + หักเงิน (atomic transaction)  │
-- └─────────────────────────────────────────────┘
CREATE OR REPLACE FUNCTION process_ad_click(
  p_product_id UUID,
  p_shop_id TEXT,
  p_user_id UUID DEFAULT NULL,
  p_keyword TEXT DEFAULT '',
  p_cpc_amount NUMERIC DEFAULT 0,
  p_ip_hash TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_wallet_balance NUMERIC;
  v_click_id UUID;
  v_last_click TIMESTAMPTZ;
  v_new_balance NUMERIC;
BEGIN
  -- 1) กัน click ซ้ำ: user เดียวกัน + product เดียวกัน ภายใน 30 นาที
  IF p_user_id IS NOT NULL THEN
    SELECT MAX(clicked_at) INTO v_last_click
    FROM ad_click_logs
    WHERE user_id = p_user_id 
      AND product_id = p_product_id
      AND clicked_at > NOW() - INTERVAL '30 minutes';
    
    IF v_last_click IS NOT NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'duplicate_click', 'message', 'คลิกซ้ำภายใน 30 นาที');
    END IF;
  END IF;

  -- 2) กัน click spam จาก IP เดียวกัน ภายใน 5 นาที
  IF p_ip_hash IS NOT NULL THEN
    SELECT MAX(clicked_at) INTO v_last_click
    FROM ad_click_logs
    WHERE ip_hash = p_ip_hash 
      AND product_id = p_product_id
      AND clicked_at > NOW() - INTERVAL '5 minutes';
    
    IF v_last_click IS NOT NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'ip_spam', 'message', 'คลิกซ้ำจาก IP เดียวกัน');
    END IF;
  END IF;

  -- 3) เช็คยอดเงินในกระเป๋า
  SELECT balance INTO v_wallet_balance
  FROM shop_wallets
  WHERE shop_id = p_shop_id
  FOR UPDATE;  -- lock row เพื่อกัน race condition

  IF v_wallet_balance IS NULL OR v_wallet_balance < p_cpc_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_balance', 'message', 'ยอดเงินไม่เพียงพอ');
  END IF;

  -- 4) หักเงิน
  v_new_balance := v_wallet_balance - p_cpc_amount;

  UPDATE shop_wallets
  SET balance = v_new_balance,
      total_spent = total_spent + p_cpc_amount,
      updated_at = NOW()
  WHERE shop_id = p_shop_id;

  -- 5) บันทึก click log
  INSERT INTO ad_click_logs (product_id, shop_id, user_id, keyword, cpc_amount, ip_hash)
  VALUES (p_product_id, p_shop_id, p_user_id, p_keyword, p_cpc_amount, p_ip_hash)
  RETURNING id INTO v_click_id;

  -- 6) บันทึกธุรกรรม
  INSERT INTO wallet_transactions (shop_id, type, amount, balance_after, description, reference_id)
  VALUES (
    p_shop_id,
    'cpc_deduct',
    -p_cpc_amount,
    v_new_balance,
    'CPC click: ' || p_keyword,
    v_click_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'click_id', v_click_id,
    'amount_charged', p_cpc_amount,
    'balance_remaining', v_new_balance
  );
END;
$$;
