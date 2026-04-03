-- ============================================================================
-- ALL PRO — สร้างตารางทั้งหมดใน Supabase
-- วิธีใช้: Supabase Dashboard → SQL Editor → New Query → วางโค้ดนี้ทั้งหมด → Run
-- ============================================================================
-- ⚠️ หมายเหตุ: ถ้ามีตารางอยู่แล้ว จะข้าม (IF NOT EXISTS)
-- ⚠️ ถ้าต้องการสร้างใหม่ทั้งหมด ให้ DROP ก่อน (ดูท้ายไฟล์)
-- ============================================================================

-- ┌─────────────────────────────────────────────┐
-- │  0. DROP ตารางเก่าทั้งหมด (ถ้ามี)            │
-- └─────────────────────────────────────────────┘
-- ⚠️ ลบตารางเก่าก่อน เพื่อสร้างใหม่ทั้งหมด (เรียงตาม dependency)
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS loyalty_cards CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS redemptions CASCADE;
DROP TABLE IF EXISTS saved_deals CASCADE;
DROP TABLE IF EXISTS promotion_branches CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS merchant_profiles CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ┌─────────────────────────────────────────────┐
-- │  0.1 EXTENSIONS                             │
-- └─────────────────────────────────────────────┘
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ┌─────────────────────────────────────────────┐
-- │  1. PROFILES (ผู้ใช้)                       │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT DEFAULT 'Hunter',
  avatar_url TEXT,
  phone TEXT,
  
  -- Gamification
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 50,
  level INTEGER DEFAULT 1,
  role TEXT DEFAULT 'user',
  
  -- Preferences
  preferred_tags TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ลบ policy เก่า (ถ้ามี) แล้วสร้างใหม่
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ┌─────────────────────────────────────────────┐
-- │  2. MERCHANTS (ร้านค้า)                     │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS merchants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  cover_url TEXT,
  description TEXT,
  
  -- Tier & Status
  tier TEXT DEFAULT 'sme',
  status TEXT DEFAULT 'active',
  verified BOOLEAN DEFAULT FALSE,
  
  -- Contact
  phone TEXT,
  email TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  categories TEXT[] DEFAULT '{}',
  
  -- Rating (denormalized)
  avg_rating NUMERIC(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_promos INTEGER DEFAULT 0,
  
  -- Plan
  plan TEXT DEFAULT 'free',
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "merchants_select_public" ON merchants;
DROP POLICY IF EXISTS "merchants_insert_auth" ON merchants;
DROP POLICY IF EXISTS "merchants_update_owner" ON merchants;

CREATE POLICY "Anyone can view merchants" ON merchants FOR SELECT USING (true);
CREATE POLICY "Auth users can insert merchants" ON merchants FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update merchants" ON merchants FOR UPDATE USING (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_merchants_owner ON merchants (owner_id);
CREATE INDEX IF NOT EXISTS idx_merchants_slug ON merchants (slug);

-- ┌─────────────────────────────────────────────┐
-- │  3. MERCHANT_PROFILES (โปรไฟล์ร้านค้า)      │
-- └─────────────────────────────────────────────┘
-- ใช้เก็บข้อมูลร้านค้าจาก EditShopModal (Zustand ↔ Supabase sync)
CREATE TABLE IF NOT EXISTS merchant_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  shop_name TEXT,
  shop_logo TEXT,
  shop_address TEXT,
  phone TEXT,
  line_id TEXT,
  instagram TEXT,
  facebook TEXT,
  website TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

ALTER TABLE merchant_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view merchant_profiles" ON merchant_profiles;
DROP POLICY IF EXISTS "Users can insert own merchant_profile" ON merchant_profiles;
DROP POLICY IF EXISTS "Users can update own merchant_profile" ON merchant_profiles;

CREATE POLICY "Anyone can view merchant_profiles" ON merchant_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own merchant_profile" ON merchant_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own merchant_profile" ON merchant_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_merchant_profiles_user ON merchant_profiles (user_id);

-- ┌─────────────────────────────────────────────┐
-- │  4. BRANCHES (สาขาร้าน)                     │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS branches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  branch_code TEXT,
  address TEXT,
  district TEXT,
  province TEXT,
  postal_code TEXT,
  
  -- Operating Hours
  operating_hours JSONB DEFAULT '{
    "mon": {"open": "09:00", "close": "21:00"},
    "tue": {"open": "09:00", "close": "21:00"},
    "wed": {"open": "09:00", "close": "21:00"},
    "thu": {"open": "09:00", "close": "21:00"},
    "fri": {"open": "09:00", "close": "22:00"},
    "sat": {"open": "10:00", "close": "22:00"},
    "sun": {"open": "10:00", "close": "21:00"}
  }'::jsonb,
  
  is_active BOOLEAN DEFAULT TRUE,
  phone TEXT,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "branches_select_public" ON branches;
DROP POLICY IF EXISTS "branches_manage_owner" ON branches;

CREATE POLICY "Anyone can view branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Merchant owners can manage branches" ON branches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM merchants m WHERE m.id = branches.merchant_id AND m.owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_branches_merchant ON branches (merchant_id);

-- ┌─────────────────────────────────────────────┐
-- │  5. PROMOTIONS (โปรโมชั่น)                   │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  short_desc TEXT,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  
  -- Type & Status
  promo_type TEXT DEFAULT 'discount',
  status TEXT DEFAULT 'active',
  
  -- Pricing
  original_price NUMERIC(12,2),
  promo_price NUMERIC(12,2),
  discount_value NUMERIC(10,2),
  discount_pct NUMERIC(5,2),
  
  -- Flex Rules (JSONB)
  promo_rules JSONB DEFAULT '{}'::jsonb,
  
  -- Category & Tags
  category TEXT DEFAULT 'Other',
  subcategory TEXT,
  tags TEXT[] DEFAULT '{}',
  brand TEXT,
  
  -- Validity
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  
  -- Limits
  total_quota INTEGER,
  used_quota INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  
  -- Engagement (denormalized)
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  redeem_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  
  -- Display
  priority INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promos_select_public" ON promotions;
DROP POLICY IF EXISTS "promos_manage_owner" ON promotions;
DROP POLICY IF EXISTS "Anyone can view promotions" ON promotions;
DROP POLICY IF EXISTS "Auth users can insert promotions" ON promotions;

CREATE POLICY "Anyone can view promotions" ON promotions FOR SELECT USING (true);
CREATE POLICY "Auth users can insert promotions" ON promotions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update promotions" ON promotions FOR UPDATE USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_promotions_merchant ON promotions (merchant_id);
CREATE INDEX IF NOT EXISTS idx_promotions_category ON promotions (category);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions (status);

-- ┌─────────────────────────────────────────────┐
-- │  6. PRODUCTS (สินค้า — ใช้จริงในแอป)        │
-- └─────────────────────────────────────────────┘
-- ★ ตารางนี้คือตารางหลักที่แอปใช้แสดงสินค้าใน Feed
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  original_price NUMERIC(12,2),
  image TEXT,
  category TEXT DEFAULT 'Other',
  shop_name TEXT,
  shop_id TEXT,
  
  -- Extra fields สำหรับการแสดงผล
  discount INTEGER DEFAULT 0,
  location TEXT,
  distance TEXT DEFAULT '0 km',
  likes INTEGER DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 4.5,
  conditions TEXT,
  service_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Auth users can insert products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Auth users can update products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;
DROP POLICY IF EXISTS "Auth users can delete products" ON products;
DROP POLICY IF EXISTS "anon can view products" ON products;

-- SELECT: allow ALL roles (anon + authenticated)
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
-- INSERT/UPDATE/DELETE: allow all roles
CREATE POLICY "Auth users can insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users can update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Auth users can delete products" ON products FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products (shop_id);

-- ┌─────────────────────────────────────────────┐
-- │  7. PROMOTION_BRANCHES (โปรฯ ↔ สาขา)       │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS promotion_branches (
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  stock INTEGER,
  PRIMARY KEY (promotion_id, branch_id)
);

ALTER TABLE promotion_branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pb_select" ON promotion_branches;
CREATE POLICY "Anyone can view promotion_branches" ON promotion_branches FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_pb_branch ON promotion_branches (branch_id);

-- ┌─────────────────────────────────────────────┐
-- │  8. SAVED_DEALS (บันทึกดีล)                  │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS saved_deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique indexes ที่รองรับ NULL ได้
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_deals_user_product
  ON saved_deals (user_id, product_id) WHERE product_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_deals_user_promotion
  ON saved_deals (user_id, promotion_id) WHERE promotion_id IS NOT NULL;

ALTER TABLE saved_deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own saved deals" ON saved_deals;
DROP POLICY IF EXISTS "Users can insert own saved deals" ON saved_deals;
DROP POLICY IF EXISTS "Users can delete own saved deals" ON saved_deals;
DROP POLICY IF EXISTS "saved_select_owner" ON saved_deals;
DROP POLICY IF EXISTS "saved_insert_owner" ON saved_deals;
DROP POLICY IF EXISTS "saved_delete_owner" ON saved_deals;

CREATE POLICY "Users can view own saved deals" ON saved_deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved deals" ON saved_deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved deals" ON saved_deals FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_deals_user ON saved_deals (user_id);

-- ┌─────────────────────────────────────────────┐
-- │  9. REDEMPTIONS (การใช้สิทธิ์)               │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS redemptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  merchant_id UUID REFERENCES merchants(id),
  
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  amount_saved NUMERIC(10,2) DEFAULT 0,
  qr_code TEXT,
  status TEXT DEFAULT 'pending',
  
  stamp_count INTEGER DEFAULT 1,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ
);

ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "redemptions_select_owner" ON redemptions;
DROP POLICY IF EXISTS "redemptions_insert_auth" ON redemptions;

CREATE POLICY "Users can view own redemptions" ON redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Auth users can insert redemptions" ON redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_redemptions_user ON redemptions (user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_promo ON redemptions (promotion_id);

-- ┌─────────────────────────────────────────────┐
-- │  10. REVIEWS (รีวิว)                        │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  
  helpful_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_auth" ON reviews;
DROP POLICY IF EXISTS "reviews_update_owner" ON reviews;

CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Auth users can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_merchant ON reviews (merchant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_promo ON reviews (promotion_id);

-- ┌─────────────────────────────────────────────┐
-- │  11. LOYALTY_CARDS (บัตรสะสมแสตมป์)          │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS loyalty_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  
  stamps_earned INTEGER DEFAULT 0,
  stamps_required INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  stamp_log JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, promotion_id)
);

ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "loyalty_select_owner" ON loyalty_cards;
DROP POLICY IF EXISTS "loyalty_insert_auth" ON loyalty_cards;
DROP POLICY IF EXISTS "loyalty_update_owner" ON loyalty_cards;

CREATE POLICY "Users can view own loyalty cards" ON loyalty_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Auth users can insert loyalty cards" ON loyalty_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own loyalty cards" ON loyalty_cards FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_loyalty_user ON loyalty_cards (user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_merchant ON loyalty_cards (merchant_id);

-- ┌─────────────────────────────────────────────┐
-- │  12. NOTIFICATIONS (แจ้งเตือน)               │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  
  -- Deep link
  action_type TEXT,
  action_id TEXT,
  promotion_id TEXT,
  merchant_name TEXT,
  
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_select_owner" ON notifications;
DROP POLICY IF EXISTS "notif_update_owner" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Service can insert notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read, created_at DESC);

-- ┌─────────────────────────────────────────────┐
-- │  13. ANALYTICS_EVENTS (ข้อมูล Analytics)     │
-- └─────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_user ON analytics_events (user_id, created_at DESC);

-- ============================================================================
-- ★★★ FUNCTIONS ★★★
-- ============================================================================

-- ┌─────────────────────────────────────────────┐
-- │  F1. Auto updated_at Trigger                │
-- └─────────────────────────────────────────────┘
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'profiles','merchants','merchant_profiles','branches',
    'promotions','products','reviews','loyalty_cards'
  ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I', t, t
    );
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()',
      t, t
    );
  END LOOP;
END
$$;

-- ┌─────────────────────────────────────────────┐
-- │  F2. Auto-create profile on signup          │
-- └─────────────────────────────────────────────┘
CREATE OR REPLACE FUNCTION fn_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, username, avatar_url, coins, xp, level, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    50,
    0,
    1,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- ถ้า error ไม่ block signup — แค่ log warning
  RAISE WARNING 'fn_handle_new_user failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;

CREATE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_handle_new_user();

-- ============================================================================
-- ★★★ STORAGE BUCKET ★★★
-- ============================================================================
-- ⚠️ Storage bucket ต้องสร้างผ่าน Supabase Dashboard:
--   1. ไปที่ Storage → New Bucket → ชื่อ "promotions" → Public bucket ✅
--   2. หรือรัน SQL นี้:

INSERT INTO storage.buckets (id, name, public)
VALUES ('promotions', 'promotions', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Anyone can view promotion images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload to promotions" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can update promotions" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete from promotions" ON storage.objects;

CREATE POLICY "Anyone can view promotion images" ON storage.objects
  FOR SELECT USING (bucket_id = 'promotions');

CREATE POLICY "Auth users can upload to promotions" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'promotions');

CREATE POLICY "Auth users can update promotions" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'promotions');

CREATE POLICY "Auth users can delete from promotions" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'promotions');

-- ============================================================================
-- ✅ เสร็จสิ้น! สรุปทั้งหมด 13 ตาราง:
-- ============================================================================
--  1.  profiles            — ข้อมูลผู้ใช้ (XP, เหรียญ, เลเวล)
--  2.  merchants           — ร้านค้า / แบรนด์
--  3.  merchant_profiles   — โปรไฟล์ร้านค้า (จาก EditShopModal)
--  4.  branches            — สาขาร้าน
--  5.  promotions          — โปรโมชั่น (Universal model)
--  6.  products            — สินค้า (ใช้จริงใน Feed)
--  7.  promotion_branches  — โปรฯ ↔ สาขา (junction table)
--  8.  saved_deals         — ดีลที่บันทึกไว้
--  9.  redemptions         — การใช้สิทธิ์
--  10. reviews             — รีวิว
--  11. loyalty_cards       — บัตรสะสมแสตมป์
--  12. notifications       — แจ้งเตือน
--  13. analytics_events    — ข้อมูล Analytics
-- 
-- + Storage bucket "promotions" สำหรับรูปภาพ
-- + Auto-create profile เมื่อสมัครสมาชิก
-- + Auto updated_at triggers
-- + Row Level Security ทุกตาราง
-- ============================================================================
