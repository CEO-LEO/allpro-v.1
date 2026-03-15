-- ============================================================================
-- PRO HUNTER — Production Database Schema
-- Supabase (PostgreSQL 15+)
-- Version: 2.0.0 | Date: 2026-02-16
-- ============================================================================
-- Architecture Principles:
--   1. Universal Data Model   → JSONB flex fields + strict core columns
--   2. Hyper-local Logic      → PostGIS + GiST index for 500 m queries
--   3. Merchant Hierarchy     → Enterprise Brand / SME / Micro tiers
--   4. Scalability            → Composite indexes, partitioning-ready,
--                               materialized views for hot paths
-- ============================================================================

-- ┌─────────────────────────────────────────────┐
-- │  0. EXTENSIONS                              │
-- └─────────────────────────────────────────────┘

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";          -- Geolocation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";        -- Composite GIN indexes

-- ┌─────────────────────────────────────────────┐
-- │  1. ENUM TYPES                              │
-- └─────────────────────────────────────────────┘

CREATE TYPE merchant_tier AS ENUM (
  'micro',        -- ร้านเล็ก, จัดการผ่านแอป, ไม่มี API
  'sme',          -- SME, จัดการผ่านแอปมือถือ + Dashboard
  'enterprise'    -- แบรนด์ใหญ่, จัดการผ่าน API + Dashboard
);

CREATE TYPE merchant_status AS ENUM (
  'pending',      -- รอตรวจสอบ
  'active',       -- ใช้งานได้
  'suspended',    -- ถูกระงับ
  'archived'      -- ปิดตัว
);

CREATE TYPE promo_type AS ENUM (
  'discount',        -- ลดราคา (฿ / %)
  'bogo',            -- Buy One Get One
  'bundle',          -- ซื้อชุด
  'loyalty_stamp',   -- สะสมแสตมป์ (กินครบ 10 ฟรี 1)
  'flash_sale',      -- Flash Sale
  'coupon_code',     -- ใส่โค้ด
  'free_gift',       -- ของแถม
  'cashback',        -- เงินคืน
  'free_shipping',   -- ส่งฟรี
  'tier_pricing',    -- ราคาขั้นบันได
  'custom'           -- กำหนดเอง (ใช้ JSONB)
);

CREATE TYPE promo_status AS ENUM (
  'draft',
  'scheduled',
  'active',
  'paused',
  'expired',
  'archived'
);

-- ┌─────────────────────────────────────────────┐
-- │  2. PROFILES (ผู้ใช้ / Consumer)            │
-- └─────────────────────────────────────────────┘

CREATE TABLE profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username       TEXT NOT NULL DEFAULT 'Hunter',
  display_name   TEXT,
  avatar_url     TEXT,
  phone          TEXT,
  email          TEXT,

  -- Gamification
  xp             INTEGER DEFAULT 0,
  coins          INTEGER DEFAULT 0,
  level          INTEGER DEFAULT 1,
  badges         JSONB DEFAULT '[]'::jsonb,        -- [{"id":"early_bird","earned_at":"..."}]

  -- Location (last known)
  home_location  GEOGRAPHY(POINT, 4326),           -- บ้าน / ที่อยู่หลัก
  last_location  GEOGRAPHY(POINT, 4326),           -- ตำแหน่งล่าสุด

  -- Preferences
  preferred_categories TEXT[] DEFAULT '{}',         -- {'อาหาร','แฟชั่น'}
  notification_settings JSONB DEFAULT '{
    "push": true,
    "email": false,
    "nearby_deals": true,
    "price_drop": true,
    "flash_sale": true
  }'::jsonb,

  -- Metadata
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public"  ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_owner"   ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_owner"   ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Indexes
CREATE INDEX idx_profiles_username     ON profiles USING btree (username);
CREATE INDEX idx_profiles_last_loc     ON profiles USING gist  (last_location);
CREATE INDEX idx_profiles_home_loc     ON profiles USING gist  (home_location);
CREATE INDEX idx_profiles_pref_cats    ON profiles USING gin   (preferred_categories);

-- ┌─────────────────────────────────────────────┐
-- │  3. MERCHANTS (ร้านค้า / แบรนด์)            │
-- └─────────────────────────────────────────────┘

CREATE TABLE merchants (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- ผู้ดูแลหลัก

  -- Identity
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,              -- URL-friendly: "somtam-nua"
  logo_url       TEXT,
  cover_url      TEXT,
  description    TEXT,

  -- Hierarchy
  tier           merchant_tier NOT NULL DEFAULT 'sme',
  status         merchant_status NOT NULL DEFAULT 'pending',
  parent_id      UUID REFERENCES merchants(id),     -- Enterprise → เชน/สาขา

  -- Verification
  verified       BOOLEAN DEFAULT FALSE,
  verified_at    TIMESTAMPTZ,
  tax_id         TEXT,                               -- เลขประจำตัวผู้เสียภาษี
  business_docs  JSONB DEFAULT '[]'::jsonb,          -- [{"type":"license","url":"..."}]

  -- Contact
  phone          TEXT,
  email          TEXT,
  website        TEXT,
  social_links   JSONB DEFAULT '{}'::jsonb,          -- {"line":"@shop","ig":"shop_ig"}

  -- Categories
  categories     TEXT[] DEFAULT '{}',                -- {'อาหาร','เครื่องดื่ม'}

  -- API Integration (Enterprise only)
  api_key        TEXT,                               -- สำหรับ Enterprise ที่เชื่อมต่อ API
  api_secret     TEXT,
  webhook_url    TEXT,
  api_config     JSONB DEFAULT '{}'::jsonb,          -- {"rate_limit":1000,"version":"v2"}

  -- Rating Aggregate (denormalized for speed)
  avg_rating     NUMERIC(3,2) DEFAULT 0.00,
  total_reviews  INTEGER DEFAULT 0,
  total_promos   INTEGER DEFAULT 0,

  -- Subscription / Monetization
  plan           TEXT DEFAULT 'free',                -- 'free','starter','pro','enterprise'
  plan_expires   TIMESTAMPTZ,

  -- Metadata
  metadata       JSONB DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "merchants_select_public"   ON merchants FOR SELECT USING (true);
CREATE POLICY "merchants_insert_auth"     ON merchants FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "merchants_update_owner"    ON merchants FOR UPDATE
  USING (auth.uid() = owner_id);

-- Indexes
CREATE INDEX idx_merchants_slug          ON merchants USING btree (slug);
CREATE INDEX idx_merchants_tier          ON merchants USING btree (tier);
CREATE INDEX idx_merchants_status        ON merchants USING btree (status);
CREATE INDEX idx_merchants_parent        ON merchants USING btree (parent_id);
CREATE INDEX idx_merchants_categories    ON merchants USING gin   (categories);
CREATE INDEX idx_merchants_owner         ON merchants USING btree (owner_id);

-- ┌─────────────────────────────────────────────┐
-- │  4. BRANCHES (สาขาร้าน + Geolocation)       │
-- └─────────────────────────────────────────────┘
-- แยก branch ออกจาก merchant เพราะ 1 merchant มีได้หลายสาขา
-- นี่คือ key table สำหรับ hyper-local query

CREATE TABLE branches (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  merchant_id    UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,

  -- Identity
  name           TEXT NOT NULL,                      -- "สาขา Central World"
  branch_code    TEXT,                               -- "CW-001"

  -- ★ GEO — PostGIS GEOGRAPHY column
  location       GEOGRAPHY(POINT, 4326) NOT NULL,   -- ST_MakePoint(lng, lat)
  address        TEXT,
  district       TEXT,                               -- เขต / อำเภอ
  province       TEXT,                               -- จังหวัด
  postal_code    TEXT,
  google_place_id TEXT,                              -- สำหรับ Google Maps link

  -- Operating Hours (flexible via JSONB)
  operating_hours JSONB DEFAULT '{
    "mon": {"open": "09:00", "close": "21:00"},
    "tue": {"open": "09:00", "close": "21:00"},
    "wed": {"open": "09:00", "close": "21:00"},
    "thu": {"open": "09:00", "close": "21:00"},
    "fri": {"open": "09:00", "close": "22:00"},
    "sat": {"open": "10:00", "close": "22:00"},
    "sun": {"open": "10:00", "close": "21:00"}
  }'::jsonb,

  -- Status
  is_active      BOOLEAN DEFAULT TRUE,
  phone          TEXT,

  -- Metadata
  metadata       JSONB DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branches_select_public" ON branches FOR SELECT USING (true);
CREATE POLICY "branches_manage_owner"  ON branches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM merchants m
      WHERE m.id = branches.merchant_id AND m.owner_id = auth.uid()
    )
  );

-- ★ CRITICAL: GiST spatial index for hyper-local queries
CREATE INDEX idx_branches_location     ON branches USING gist (location);
CREATE INDEX idx_branches_merchant     ON branches USING btree (merchant_id);
CREATE INDEX idx_branches_province     ON branches USING btree (province);
CREATE INDEX idx_branches_active       ON branches USING btree (is_active) WHERE is_active = TRUE;

-- Composite: merchant + active (hot path)
CREATE INDEX idx_branches_merchant_active ON branches (merchant_id, is_active);

-- ┌─────────────────────────────────────────────┐
-- │  5. PROMOTIONS (Universal Promo Model)      │
-- └─────────────────────────────────────────────┘
-- ★ Universal: ใช้ได้ทุก promo type ตั้งแต่ SKU discount
-- ไปถึง loyalty stamp "กินครบ 10 ฟรี 1"

CREATE TABLE promotions (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  merchant_id    UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,

  -- Core Identity
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL,
  description    TEXT,
  short_desc     TEXT,                               -- สำหรับแสดงบน Card (max 120 chars)
  image_url      TEXT,
  images         TEXT[] DEFAULT '{}',                -- Gallery
  video_url      TEXT,

  -- ★ Promo Type (Enum + JSONB = Universal)
  promo_type     promo_type NOT NULL DEFAULT 'discount',
  status         promo_status NOT NULL DEFAULT 'draft',

  -- Pricing (สำหรับ discount / bundle type)
  original_price NUMERIC(12,2),                      -- ราคาปกติ
  promo_price    NUMERIC(12,2),                      -- ราคาลด
  discount_value NUMERIC(10,2),                      -- จำนวนเงินที่ลด
  discount_pct   NUMERIC(5,2),                       -- % ที่ลด
  currency       TEXT DEFAULT 'THB',

  -- ★ JSONB Flex Fields (Universal Extension)
  promo_rules    JSONB DEFAULT '{}'::jsonb,
  -- Examples:
  -- discount:      {"min_purchase": 500, "max_discount": 200}
  -- bogo:          {"buy_qty": 1, "free_qty": 1, "free_item": "same"}
  -- loyalty_stamp: {"stamps_required": 10, "reward": "free_item", "reward_value": 150}
  -- flash_sale:    {"slots_total": 100, "slots_remaining": 42}
  -- coupon_code:   {"code": "SAVE20", "single_use": true}
  -- bundle:        {"items": [{"sku":"A","qty":1},{"sku":"B","qty":2}], "bundle_price": 999}
  -- tier_pricing:  {"tiers": [{"min_qty":1,"price":100},{"min_qty":5,"price":85}]}
  -- custom:        {<anything>}

  -- Categories & Tags
  category       TEXT NOT NULL DEFAULT 'อื่นๆ',
  subcategory    TEXT,
  tags           TEXT[] DEFAULT '{}',
  brand          TEXT,

  -- SKU (optional, สำหรับสินค้าที่มี SKU ชัดเจน)
  sku            TEXT,
  barcode        TEXT,

  -- Validity Period
  starts_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at        TIMESTAMPTZ,                        -- NULL = ไม่หมดอายุ
  recurring      JSONB,                              -- {"days":["mon","wed","fri"],"time_start":"11:00","time_end":"14:00"}

  -- Limits
  total_quota    INTEGER,                            -- จำนวนสิทธิ์ทั้งหมด (NULL = unlimited)
  used_quota     INTEGER DEFAULT 0,                  -- สิทธิ์ที่ใช้ไปแล้ว
  per_user_limit INTEGER DEFAULT 1,                  -- จำกัดต่อคน

  -- Targeting
  target_audience JSONB DEFAULT '{}'::jsonb,         -- {"min_age":18,"max_age":35,"gender":"all"}
  eligible_branches UUID[] DEFAULT '{}',             -- สาขาที่ร่วมรายการ (empty = ทุกสาขา)

  -- Engagement (denormalized counts for speed)
  view_count     INTEGER DEFAULT 0,
  save_count     INTEGER DEFAULT 0,
  redeem_count   INTEGER DEFAULT 0,
  share_count    INTEGER DEFAULT 0,
  like_count     INTEGER DEFAULT 0,
  avg_rating     NUMERIC(3,2) DEFAULT 0.00,
  review_count   INTEGER DEFAULT 0,

  -- SEO & Display
  priority       INTEGER DEFAULT 0,                  -- สำหรับเรียงลำดับ pinned
  is_featured    BOOLEAN DEFAULT FALSE,
  is_verified    BOOLEAN DEFAULT FALSE,

  -- Source tracking (Enterprise API vs Manual)
  source         TEXT DEFAULT 'manual',              -- 'manual' | 'api' | 'import'
  external_id    TEXT,                               -- ID จากระบบภายนอก

  -- Metadata
  metadata       JSONB DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promos_select_public"  ON promotions FOR SELECT
  USING (status IN ('active','scheduled'));
CREATE POLICY "promos_select_owner"   ON promotions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM merchants m WHERE m.id = promotions.merchant_id AND m.owner_id = auth.uid()
  ));
CREATE POLICY "promos_manage_owner"   ON promotions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM merchants m WHERE m.id = promotions.merchant_id AND m.owner_id = auth.uid()
  ));

-- ★ Performance Indexes
CREATE INDEX idx_promos_merchant       ON promotions (merchant_id);
CREATE INDEX idx_promos_status         ON promotions (status);
CREATE INDEX idx_promos_category       ON promotions (category);
CREATE INDEX idx_promos_type           ON promotions (promo_type);
CREATE INDEX idx_promos_dates          ON promotions (starts_at, ends_at);
CREATE INDEX idx_promos_featured       ON promotions (is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_promos_tags           ON promotions USING gin (tags);
CREATE INDEX idx_promos_rules          ON promotions USING gin (promo_rules jsonb_path_ops);
CREATE INDEX idx_promos_slug           ON promotions (merchant_id, slug);

-- Composite hot-path: active promos by category sorted by priority
CREATE INDEX idx_promos_active_cat ON promotions (category, priority DESC)
  WHERE status = 'active';

-- Full-text search (Thai + English)
CREATE INDEX idx_promos_title_trgm ON promotions USING gin (title gin_trgm_ops);
CREATE INDEX idx_promos_desc_trgm  ON promotions USING gin (description gin_trgm_ops);

-- ┌─────────────────────────────────────────────┐
-- │  6. PROMOTION–BRANCH JUNCTION              │
-- └─────────────────────────────────────────────┘
-- ถ้า promotion ผูกกับเฉพาะบางสาขา

CREATE TABLE promotion_branches (
  promotion_id   UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  branch_id      UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  stock          INTEGER,                            -- สต็อกเฉพาะสาขา (NULL = ไม่จำกัด)
  PRIMARY KEY (promotion_id, branch_id)
);

ALTER TABLE promotion_branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_select" ON promotion_branches FOR SELECT USING (true);

CREATE INDEX idx_pb_branch ON promotion_branches (branch_id);

-- ┌─────────────────────────────────────────────┐
-- │  7. SAVED DEALS (User Bookmarks)            │
-- └─────────────────────────────────────────────┘

CREATE TABLE saved_deals (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promotion_id   UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, promotion_id)
);

ALTER TABLE saved_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_select_owner" ON saved_deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_insert_owner" ON saved_deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_delete_owner" ON saved_deals FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_saved_user  ON saved_deals (user_id);
CREATE INDEX idx_saved_promo ON saved_deals (promotion_id);

-- ┌─────────────────────────────────────────────┐
-- │  8. REDEMPTIONS (การใช้สิทธิ์)               │
-- └─────────────────────────────────────────────┘

CREATE TABLE redemptions (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promotion_id   UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  branch_id      UUID REFERENCES branches(id),
  merchant_id    UUID NOT NULL REFERENCES merchants(id),

  -- Redemption Details
  redeemed_at    TIMESTAMPTZ DEFAULT NOW(),
  amount_saved   NUMERIC(10,2) DEFAULT 0,
  qr_code        TEXT,                               -- QR Code สำหรับแสดงที่ร้าน
  status         TEXT DEFAULT 'pending',             -- 'pending','confirmed','cancelled','expired'

  -- Loyalty stamp tracking
  stamp_count    INTEGER DEFAULT 1,                  -- จำนวนแสตมป์ที่ได้ (สำหรับ loyalty_stamp promo)

  -- Metadata
  metadata       JSONB DEFAULT '{}'::jsonb,
  verified_by    UUID REFERENCES auth.users(id),     -- พนักงานที่ยืนยัน
  verified_at    TIMESTAMPTZ
);

ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "redemptions_select_owner" ON redemptions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "redemptions_select_merchant" ON redemptions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM merchants m WHERE m.id = redemptions.merchant_id AND m.owner_id = auth.uid()
  ));
CREATE POLICY "redemptions_insert_auth" ON redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_redemptions_user       ON redemptions (user_id);
CREATE INDEX idx_redemptions_promo      ON redemptions (promotion_id);
CREATE INDEX idx_redemptions_merchant   ON redemptions (merchant_id);
CREATE INDEX idx_redemptions_date       ON redemptions (redeemed_at DESC);

-- Composite: user + promo (check limits)
CREATE INDEX idx_redemptions_user_promo ON redemptions (user_id, promotion_id);

-- ┌─────────────────────────────────────────────┐
-- │  9. REVIEWS (รีวิว)                         │
-- └─────────────────────────────────────────────┘

CREATE TABLE reviews (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promotion_id   UUID REFERENCES promotions(id) ON DELETE CASCADE,
  merchant_id    UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  branch_id      UUID REFERENCES branches(id),

  rating         SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT,
  images         TEXT[] DEFAULT '{}',
  is_verified    BOOLEAN DEFAULT FALSE,              -- ใช้สิทธิ์จริงก่อนรีวิว

  -- Engagement
  helpful_count  INTEGER DEFAULT 0,
  report_count   INTEGER DEFAULT 0,

  metadata       JSONB DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_public"  ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_auth"    ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_owner"   ON reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_reviews_merchant ON reviews (merchant_id);
CREATE INDEX idx_reviews_promo    ON reviews (promotion_id);
CREATE INDEX idx_reviews_user     ON reviews (user_id);
CREATE INDEX idx_reviews_rating   ON reviews (rating);

-- ┌─────────────────────────────────────────────┐
-- │  10. LOYALTY CARDS (บัตรสะสมแสตมป์ SME)     │
-- └─────────────────────────────────────────────┘
-- สำหรับ promo_type = 'loyalty_stamp'
-- เช่น "กินครบ 10 ครั้ง ฟรี 1 จาน"

CREATE TABLE loyalty_cards (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id    UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  promotion_id   UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,

  stamps_earned  INTEGER DEFAULT 0,
  stamps_required INTEGER NOT NULL,                  -- จาก promo_rules.stamps_required
  is_completed   BOOLEAN DEFAULT FALSE,
  completed_at   TIMESTAMPTZ,

  -- Stamp history
  stamp_log      JSONB DEFAULT '[]'::jsonb,
  -- [{"stamp":1,"at":"2026-01-15","branch_id":"...","verified_by":"..."}]

  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, promotion_id)
);

ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loyalty_select_owner" ON loyalty_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "loyalty_select_merchant" ON loyalty_cards FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM merchants m WHERE m.id = loyalty_cards.merchant_id AND m.owner_id = auth.uid()
  ));
CREATE POLICY "loyalty_insert_auth" ON loyalty_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "loyalty_update_owner" ON loyalty_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_loyalty_user     ON loyalty_cards (user_id);
CREATE INDEX idx_loyalty_merchant ON loyalty_cards (merchant_id);
CREATE INDEX idx_loyalty_active   ON loyalty_cards (is_completed) WHERE is_completed = FALSE;

-- ┌─────────────────────────────────────────────┐
-- │  11. NOTIFICATIONS                          │
-- └─────────────────────────────────────────────┘

CREATE TABLE notifications (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  type           TEXT NOT NULL,                      -- 'price_drop','nearby','flash_sale','stamp','system'
  title          TEXT NOT NULL,
  message        TEXT NOT NULL,
  image_url      TEXT,

  -- Deep link
  action_type    TEXT,                               -- 'promotion','merchant','url'
  action_id      TEXT,                               -- promotion_id or URL

  is_read        BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select_owner" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update_owner" ON notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_notif_user      ON notifications (user_id, is_read, created_at DESC);

-- Partition-ready: สร้างเป็น monthly partition ได้ในอนาคต
-- CREATE TABLE notifications_y2026m01 PARTITION OF notifications
--   FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- ┌─────────────────────────────────────────────┐
-- │  12. ANALYTICS EVENTS (Lightweight)         │
-- └─────────────────────────────────────────────┘

CREATE TABLE analytics_events (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id),
  event_type     TEXT NOT NULL,                      -- 'view','click','save','redeem','share','search'
  entity_type    TEXT,                               -- 'promotion','merchant','branch'
  entity_id      UUID,
  properties     JSONB DEFAULT '{}'::jsonb,          -- {"query":"ส้มตำ","lat":13.7,"lng":100.5}
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ★ No RLS — INSERT via server function only (service_role)
-- เพื่อ performance สูงสุดในการ track event

CREATE INDEX idx_events_type    ON analytics_events (event_type, created_at DESC);
CREATE INDEX idx_events_entity  ON analytics_events (entity_type, entity_id);
CREATE INDEX idx_events_user    ON analytics_events (user_id, created_at DESC);

-- ============================================================================
-- ★★★ FUNCTIONS & PROCEDURES ★★★
-- ============================================================================

-- ┌─────────────────────────────────────────────┐
-- │  F1. Auto updated_at Trigger               │
-- └─────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'profiles','merchants','branches','promotions',
    'reviews','loyalty_cards'
  ])
  LOOP
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
  INSERT INTO profiles (id, username, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Hunter'),
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      'https://ui-avatars.com/api/?name=' || COALESCE(NEW.raw_user_meta_data->>'username', 'H')
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_handle_new_user();

-- ┌─────────────────────────────────────────────┐
-- │  F3. ★ HYPER-LOCAL: ค้นหาร้านใกล้เคียง      │
-- └─────────────────────────────────────────────┘
-- ค้นหา branch ในรัศมี X เมตร จาก (lat, lng)
-- ใช้ GiST index → O(log n) แม้มี 100k+ branches

CREATE OR REPLACE FUNCTION fn_nearby_branches(
  p_lat       DOUBLE PRECISION,
  p_lng       DOUBLE PRECISION,
  p_radius_m  INTEGER DEFAULT 500,      -- รัศมีเป็นเมตร (default 500m)
  p_limit     INTEGER DEFAULT 50,
  p_category  TEXT DEFAULT NULL         -- filter by merchant category
)
RETURNS TABLE (
  branch_id       UUID,
  branch_name     TEXT,
  merchant_id     UUID,
  merchant_name   TEXT,
  merchant_tier   merchant_tier,
  logo_url        TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  distance_m      DOUBLE PRECISION,     -- ระยะทางเป็นเมตร
  address         TEXT,
  district        TEXT,
  province        TEXT,
  operating_hours JSONB,
  categories      TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id                                       AS branch_id,
    b.name                                     AS branch_name,
    m.id                                       AS merchant_id,
    m.name                                     AS merchant_name,
    m.tier                                     AS merchant_tier,
    m.logo_url                                 AS logo_url,
    ST_Y(b.location::geometry)                 AS latitude,
    ST_X(b.location::geometry)                 AS longitude,
    ST_Distance(
      b.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    )                                          AS distance_m,
    b.address,
    b.district,
    b.province,
    b.operating_hours,
    m.categories
  FROM branches b
  JOIN merchants m ON m.id = b.merchant_id
  WHERE
    b.is_active = TRUE
    AND m.status = 'active'
    AND ST_DWithin(
      b.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_m
    )
    AND (p_category IS NULL OR p_category = ANY(m.categories))
  ORDER BY distance_m ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ┌─────────────────────────────────────────────┐
-- │  F4. ★ ค้นหาโปรโมชั่นใกล้ฉัน                │
-- └─────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION fn_nearby_promotions(
  p_lat         DOUBLE PRECISION,
  p_lng         DOUBLE PRECISION,
  p_radius_m    INTEGER DEFAULT 1000,
  p_category    TEXT DEFAULT NULL,
  p_promo_type  promo_type DEFAULT NULL,
  p_limit       INTEGER DEFAULT 20,
  p_offset      INTEGER DEFAULT 0
)
RETURNS TABLE (
  promotion_id    UUID,
  title           TEXT,
  short_desc      TEXT,
  image_url       TEXT,
  promo_type      promo_type,
  original_price  NUMERIC,
  promo_price     NUMERIC,
  discount_pct    NUMERIC,
  category        TEXT,
  tags            TEXT[],
  merchant_name   TEXT,
  merchant_tier   merchant_tier,
  logo_url        TEXT,
  branch_name     TEXT,
  distance_m      DOUBLE PRECISION,
  ends_at         TIMESTAMPTZ,
  save_count      INTEGER,
  like_count      INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (p.id)
    p.id              AS promotion_id,
    p.title,
    p.short_desc,
    p.image_url,
    p.promo_type,
    p.original_price,
    p.promo_price,
    p.discount_pct,
    p.category,
    p.tags,
    m.name            AS merchant_name,
    m.tier            AS merchant_tier,
    m.logo_url,
    b.name            AS branch_name,
    ST_Distance(
      b.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    )                 AS distance_m,
    p.ends_at,
    p.save_count,
    p.like_count
  FROM promotions p
  JOIN merchants m ON m.id = p.merchant_id
  JOIN branches b  ON b.merchant_id = m.id
  WHERE
    p.status = 'active'
    AND b.is_active = TRUE
    AND m.status = 'active'
    AND p.starts_at <= NOW()
    AND (p.ends_at IS NULL OR p.ends_at > NOW())
    AND (p.total_quota IS NULL OR p.used_quota < p.total_quota)
    AND ST_DWithin(
      b.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_m
    )
    AND (p_category IS NULL OR p.category = p_category)
    AND (p_promo_type IS NULL OR p.promo_type = p_promo_type)
  ORDER BY p.id, distance_m ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ┌─────────────────────────────────────────────┐
-- │  F5. Redeem Promotion (Atomic)              │
-- └─────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION fn_redeem_promotion(
  p_user_id      UUID,
  p_promotion_id UUID,
  p_branch_id    UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_promo       promotions%ROWTYPE;
  v_user_usage  INTEGER;
  v_redemption  UUID;
  v_merchant_id UUID;
  v_qr          TEXT;
BEGIN
  -- Lock row for atomic update
  SELECT * INTO v_promo FROM promotions WHERE id = p_promotion_id FOR UPDATE;

  IF v_promo IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'promotion_not_found');
  END IF;

  IF v_promo.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'promotion_not_active');
  END IF;

  IF v_promo.ends_at IS NOT NULL AND v_promo.ends_at < NOW() THEN
    RETURN jsonb_build_object('success', false, 'error', 'promotion_expired');
  END IF;

  IF v_promo.total_quota IS NOT NULL AND v_promo.used_quota >= v_promo.total_quota THEN
    RETURN jsonb_build_object('success', false, 'error', 'quota_exhausted');
  END IF;

  -- Check per-user limit
  SELECT COUNT(*) INTO v_user_usage
  FROM redemptions
  WHERE user_id = p_user_id AND promotion_id = p_promotion_id AND status = 'confirmed';

  IF v_user_usage >= v_promo.per_user_limit THEN
    RETURN jsonb_build_object('success', false, 'error', 'per_user_limit_reached');
  END IF;

  -- Generate QR code
  v_qr := 'PH-' || UPPER(LEFT(REPLACE(uuid_generate_v4()::text, '-', ''), 12));
  v_merchant_id := v_promo.merchant_id;

  -- Create redemption
  INSERT INTO redemptions (user_id, promotion_id, branch_id, merchant_id, qr_code, status, amount_saved)
  VALUES (p_user_id, p_promotion_id, p_branch_id, v_merchant_id, v_qr, 'pending',
          COALESCE(v_promo.discount_value, v_promo.original_price - v_promo.promo_price, 0))
  RETURNING id INTO v_redemption;

  -- Update quota
  UPDATE promotions SET used_quota = used_quota + 1, redeem_count = redeem_count + 1
  WHERE id = p_promotion_id;

  -- Award XP & coins
  UPDATE profiles SET xp = xp + 10, coins = coins + 5
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'redemption_id', v_redemption,
    'qr_code', v_qr,
    'amount_saved', COALESCE(v_promo.discount_value, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ┌─────────────────────────────────────────────┐
-- │  F6. Stamp Loyalty Card                     │
-- └─────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION fn_stamp_loyalty(
  p_user_id      UUID,
  p_promotion_id UUID,
  p_branch_id    UUID DEFAULT NULL,
  p_verified_by  UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_card   loyalty_cards%ROWTYPE;
  v_promo  promotions%ROWTYPE;
  v_req    INTEGER;
BEGIN
  SELECT * INTO v_promo FROM promotions WHERE id = p_promotion_id;
  IF v_promo IS NULL OR v_promo.promo_type != 'loyalty_stamp' THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_loyalty_promo');
  END IF;

  v_req := (v_promo.promo_rules->>'stamps_required')::integer;

  -- Upsert loyalty card
  INSERT INTO loyalty_cards (user_id, merchant_id, promotion_id, stamps_required, stamps_earned, stamp_log)
  VALUES (
    p_user_id, v_promo.merchant_id, p_promotion_id, v_req, 1,
    jsonb_build_array(jsonb_build_object(
      'stamp', 1, 'at', NOW(), 'branch_id', p_branch_id, 'verified_by', p_verified_by
    ))
  )
  ON CONFLICT (user_id, promotion_id) DO UPDATE SET
    stamps_earned = loyalty_cards.stamps_earned + 1,
    stamp_log = loyalty_cards.stamp_log || jsonb_build_array(jsonb_build_object(
      'stamp', loyalty_cards.stamps_earned + 1, 'at', NOW(),
      'branch_id', p_branch_id, 'verified_by', p_verified_by
    )),
    is_completed = CASE WHEN loyalty_cards.stamps_earned + 1 >= v_req THEN TRUE ELSE FALSE END,
    completed_at = CASE WHEN loyalty_cards.stamps_earned + 1 >= v_req THEN NOW() ELSE NULL END,
    updated_at = NOW()
  RETURNING * INTO v_card;

  -- Award XP for each stamp
  UPDATE profiles SET xp = xp + 5 WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'stamps_earned', v_card.stamps_earned,
    'stamps_required', v_req,
    'is_completed', v_card.is_completed,
    'progress_pct', ROUND((v_card.stamps_earned::numeric / v_req) * 100, 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ┌─────────────────────────────────────────────┐
-- │  F7. Update Merchant Rating (Trigger)       │
-- └─────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION fn_update_merchant_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE merchants SET
    avg_rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE merchant_id = NEW.merchant_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE merchant_id = NEW.merchant_id)
  WHERE id = NEW.merchant_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION fn_update_merchant_rating();

-- ============================================================================
-- ★★★ MATERIALIZED VIEWS (Caching Layer) ★★★
-- ============================================================================

-- ┌─────────────────────────────────────────────┐
-- │  MV1. Hot Deals (Top active promos)         │
-- └─────────────────────────────────────────────┘

CREATE MATERIALIZED VIEW mv_hot_deals AS
SELECT
  p.id,
  p.title,
  p.short_desc,
  p.image_url,
  p.promo_type,
  p.original_price,
  p.promo_price,
  p.discount_pct,
  p.category,
  p.tags,
  p.like_count,
  p.save_count,
  p.view_count,
  p.redeem_count,
  p.ends_at,
  p.is_featured,
  m.name AS merchant_name,
  m.tier AS merchant_tier,
  m.logo_url,
  m.avg_rating,
  m.verified AS merchant_verified,
  -- Popularity score (for ranking)
  (p.like_count * 2 + p.save_count * 3 + p.redeem_count * 5 + p.view_count * 0.1)::numeric AS popularity
FROM promotions p
JOIN merchants m ON m.id = p.merchant_id
WHERE
  p.status = 'active'
  AND p.starts_at <= NOW()
  AND (p.ends_at IS NULL OR p.ends_at > NOW())
  AND m.status = 'active'
ORDER BY popularity DESC;

CREATE UNIQUE INDEX idx_mv_hot_deals ON mv_hot_deals (id);
CREATE INDEX idx_mv_hot_deals_cat    ON mv_hot_deals (category);

-- Refresh every 5 minutes via pg_cron or Supabase Edge Function
-- SELECT cron.schedule('refresh_hot_deals', '*/5 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_hot_deals');

-- ┌─────────────────────────────────────────────┐
-- │  MV2. Category Stats                        │
-- └─────────────────────────────────────────────┘

CREATE MATERIALIZED VIEW mv_category_stats AS
SELECT
  category,
  COUNT(*)                             AS total_promos,
  COUNT(*) FILTER (WHERE is_featured)  AS featured_count,
  ROUND(AVG(discount_pct), 1)         AS avg_discount,
  MAX(discount_pct)                    AS max_discount,
  SUM(redeem_count)                    AS total_redemptions
FROM promotions
WHERE status = 'active'
GROUP BY category
ORDER BY total_promos DESC;

CREATE UNIQUE INDEX idx_mv_cat_stats ON mv_category_stats (category);

-- ============================================================================
-- ★★★ SAMPLE DATA ★★★
-- ============================================================================

-- Sample Enterprise Merchant
INSERT INTO merchants (name, slug, tier, status, verified, categories, plan, description)
VALUES (
  '7-Eleven Thailand',
  '7-eleven-th',
  'enterprise',
  'active',
  TRUE,
  '{"อาหาร","เครื่องดื่ม","ของใช้"}',
  'enterprise',
  'ร้านสะดวกซื้อ 7-Eleven กว่า 14,000 สาขาทั่วประเทศ'
);

-- Sample SME Merchant
INSERT INTO merchants (name, slug, tier, status, verified, categories, plan, description)
VALUES (
  'ส้มตำแม่ลำยอง',
  'somtam-mae-lamyong',
  'sme',
  'active',
  TRUE,
  '{"อาหาร","ร้านอาหาร"}',
  'starter',
  'ส้มตำรสเด็ด ลาบ ก้อย ของกินอีสานแท้ๆ'
);

-- Sample Micro Merchant
INSERT INTO merchants (name, slug, tier, status, categories, description)
VALUES (
  'คาเฟ่ลุงทำ',
  'cafe-lung-tham',
  'micro',
  'active',
  '{"เครื่องดื่ม","อาหาร"}',
  'คาเฟ่เล็กๆ กาแฟสดคั่วมือ ขนมเค้กโฮมเมด'
);

-- Sample Branches with Geolocation (Bangkok area)
INSERT INTO branches (merchant_id, name, location, address, district, province, postal_code)
SELECT
  id,
  '7-Eleven สาขาสยามสแควร์',
  ST_SetSRID(ST_MakePoint(100.5340, 13.7447), 4326)::geography, -- Siam Square
  '392 Rama 1 Rd, Siam Square',
  'ปทุมวัน',
  'กรุงเทพ',
  '10330'
FROM merchants WHERE slug = '7-eleven-th';

INSERT INTO branches (merchant_id, name, location, address, district, province, postal_code)
SELECT
  id,
  '7-Eleven สาขาอารีย์',
  ST_SetSRID(ST_MakePoint(100.5554, 13.7769), 4326)::geography, -- Ari
  '89 Phahon Yothin Rd, Ari',
  'พญาไท',
  'กรุงเทพ',
  '10400'
FROM merchants WHERE slug = '7-eleven-th';

INSERT INTO branches (merchant_id, name, location, address, district, province, postal_code)
SELECT
  id,
  'ส้มตำแม่ลำยอง สาขาลาดพร้าว',
  ST_SetSRID(ST_MakePoint(100.5679, 13.8066), 4326)::geography, -- Lat Phrao
  '1234 Lat Phrao Rd',
  'ลาดพร้าว',
  'กรุงเทพ',
  '10230'
FROM merchants WHERE slug = 'somtam-mae-lamyong';

INSERT INTO branches (merchant_id, name, location, address, district, province, postal_code)
SELECT
  id,
  'คาเฟ่ลุงทำ สาขาเดียว',
  ST_SetSRID(ST_MakePoint(100.5273, 13.7260), 4326)::geography, -- Silom
  '56 Silom Soi 3',
  'บางรัก',
  'กรุงเทพ',
  '10500'
FROM merchants WHERE slug = 'cafe-lung-tham';

-- Sample Promotions (various types)

-- 1. Standard Discount (Enterprise)
INSERT INTO promotions (
  merchant_id, title, slug, description, short_desc,
  promo_type, original_price, promo_price, discount_pct,
  category, tags, status, starts_at, ends_at,
  image_url, total_quota, per_user_limit
)
SELECT
  id, 'ข้าวกล่อง 7-11 ลด 20%', 'rice-box-20off',
  'ข้าวกล่องทุกเมนู ลดราคา 20% เฉพาะวันจันทร์-ศุกร์ เวลา 11:00-14:00',
  'ข้าวกล่อง 7-11 ลด 20% เฉพาะ Weekday!',
  'discount', 55, 44, 20,
  'อาหาร', '{"ข้าวกล่อง","ลดราคา","7-11"}', 'active', NOW(), NOW() + interval '90 days',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
  NULL, 3
FROM merchants WHERE slug = '7-eleven-th';

-- 2. Loyalty Stamp (SME) — "กินครบ 10 ฟรี 1"
INSERT INTO promotions (
  merchant_id, title, slug, description, short_desc,
  promo_type, promo_rules,
  category, tags, status, starts_at,
  image_url
)
SELECT
  id, 'กินครบ 10 ฟรี 1 จาน!', 'eat-10-free-1',
  'สะสมแสตมป์ กินส้มตำ ลาบ ก้อย ครบ 10 ครั้ง รับฟรี 1 จาน (มูลค่าสูงสุด 150 บาท)',
  'สะสม 10 แสตมป์ ฟรี 1 จาน!',
  'loyalty_stamp',
  '{"stamps_required": 10, "reward": "free_item", "reward_value": 150, "eligible_items": "ส้มตำ,ลาบ,ก้อย"}'::jsonb,
  'อาหาร', '{"สะสมแสตมป์","อีสาน","ส้มตำ"}', 'active', NOW(),
  'https://images.unsplash.com/photo-1569058242567-93de6f36f8e6?w=800'
FROM merchants WHERE slug = 'somtam-mae-lamyong';

-- 3. Flash Sale (Enterprise)
INSERT INTO promotions (
  merchant_id, title, slug, description, short_desc,
  promo_type, original_price, promo_price, discount_pct, discount_value,
  promo_rules,
  category, tags, status, starts_at, ends_at,
  image_url, total_quota, per_user_limit, is_featured
)
SELECT
  id, 'กาแฟลาเต้ ลด 50% ⚡', 'latte-flash-50',
  'กาแฟลาเต้เย็น/ร้อน ลด 50% เฉพาะ 100 แก้วแรก! ของหมดก็หมดเลย',
  '⚡ Flash Sale กาแฟลาเต้ 50% OFF!',
  'flash_sale', 80, 40, 50, 40,
  '{"slots_total": 100, "slots_remaining": 100}'::jsonb,
  'เครื่องดื่ม', '{"กาแฟ","Flash Sale","ลด50%"}', 'active', NOW(), NOW() + interval '7 days',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
  100, 1, TRUE
FROM merchants WHERE slug = 'cafe-lung-tham';

-- 4. BOGO (Micro)
INSERT INTO promotions (
  merchant_id, title, slug, description, short_desc,
  promo_type, original_price, promo_price,
  promo_rules,
  category, tags, status, starts_at,
  image_url, per_user_limit
)
SELECT
  id, 'ซื้อ 1 แถม 1 เค้กโฮมเมด', 'cake-bogo',
  'ซื้อเค้กโฮมเมด 1 ชิ้น แถมฟรีอีก 1 ชิ้น (มูลค่าเท่ากันหรือน้อยกว่า)',
  'ซื้อ 1 แถม 1! เค้กโฮมเมดสดใหม่',
  'bogo', 120, 120,
  '{"buy_qty": 1, "free_qty": 1, "free_item": "equal_or_less"}'::jsonb,
  'อาหาร', '{"เค้ก","ซื้อ1แถม1","โฮมเมด"}', 'active', NOW(),
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
  2
FROM merchants WHERE slug = 'cafe-lung-tham';

-- ============================================================================
-- ★ UTILITY: Refresh all materialized views
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_refresh_all_mvs()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_hot_deals;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_category_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ★ QUERY EXAMPLES (for reference / documentation)
-- ============================================================================

-- [Q1] ค้นหาร้านใกล้ฉัน 500 เมตร (สยามสแควร์)
-- SELECT * FROM fn_nearby_branches(13.7447, 100.5340, 500);

-- [Q2] ค้นหาโปรโมชั่นใกล้ฉัน 1 กม. หมวดอาหาร
-- SELECT * FROM fn_nearby_promotions(13.7447, 100.5340, 1000, 'อาหาร');

-- [Q3] ใช้สิทธิ์โปรโมชั่น
-- SELECT fn_redeem_promotion('user-uuid', 'promo-uuid', 'branch-uuid');

-- [Q4] แสตมป์สะสม
-- SELECT fn_stamp_loyalty('user-uuid', 'promo-uuid', 'branch-uuid');

-- [Q5] Hot Deals (Cached)
-- SELECT * FROM mv_hot_deals WHERE category = 'อาหาร' LIMIT 20;

-- [Q6] Full-text search (Thai-friendly)
-- SELECT * FROM promotions WHERE title ILIKE '%กาแฟ%' OR description ILIKE '%กาแฟ%';

-- [Q7] JSONB query: หาโปรที่ต้องสะสม 10 แสตมป์
-- SELECT * FROM promotions WHERE promo_rules->>'stamps_required' = '10';

-- ============================================================================
-- SCHEMA COMPLETE ✅
-- ============================================================================
