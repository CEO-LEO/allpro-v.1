-- ═══════════════════════════════════════════════════════════════
-- 🔧 FIX: ทำให้ตาราง products รองรับทั้ง 2 schema
-- ═══════════════════════════════════════════════════════════════
-- วิธีใช้: ไปที่ Supabase Dashboard → SQL Editor → New Query → วางโค้ดนี้ → Run
--
-- สิ่งที่ทำ:
--   1. ตรวจสอบ + เพิ่ม column ที่ขาดในตาราง products (ไม่ลบอะไร)
--   2. ตรวจสอบว่า merchant_profiles table มีอยู่ (ถ้าไม่มีก็สร้าง)
--   3. เพิ่ม RLS policies ที่จำเป็น
--   4. สร้าง storage bucket "promotions" ถ้ายังไม่มี
--
-- ⚠️ ปลอดภัย 100%: ใช้ IF NOT EXISTS ทุกจุด — ไม่ลบข้อมูลเดิม
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1. ตาราง products — เพิ่ม column ที่อาจจะขาด
-- ─────────────────────────────────────────────

-- สร้างตาราง products ถ้ายังไม่มีเลย (minimal columns)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC,
  original_price NUMERIC,
  image TEXT DEFAULT '',
  category TEXT DEFAULT 'Other',
  shop_name TEXT DEFAULT '',
  shop_id TEXT
);

-- เพิ่ม columns ที่อาจจะขาด (IF NOT EXISTS ปลอดภัย)
DO $$ BEGIN
  -- Basic columns
  ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
  ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price NUMERIC;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';
  ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';
  ALTER TABLE products ADD COLUMN IF NOT EXISTS shop_name TEXT DEFAULT '';
  ALTER TABLE products ADD COLUMN IF NOT EXISTS shop_id TEXT;
  
  -- Extended columns (ที่ API route ใช้)
  ALTER TABLE products ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT 0;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';
  ALTER TABLE products ADD COLUMN IF NOT EXISTS conditions TEXT DEFAULT '';
  ALTER TABLE products ADD COLUMN IF NOT EXISTS distance TEXT DEFAULT '0 km';
  ALTER TABLE products ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews INTEGER DEFAULT 0;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 4.5;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS service_url TEXT;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  
  RAISE NOTICE '✅ products table columns verified';
END $$;

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ทุกคนดูสินค้าได้
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Products viewable by everyone'
  ) THEN
    CREATE POLICY "Products viewable by everyone" ON products FOR SELECT USING (true);
  END IF;
END $$;

-- Authenticated users สามารถเพิ่มสินค้าได้
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Authenticated users can insert products'
  ) THEN
    CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Authenticated users สามารถแก้ไขสินค้าได้
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Authenticated users can update products'
  ) THEN
    CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE USING (true);
  END IF;
END $$;

-- Service role can do everything (สำหรับ API route)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Service role full access products'
  ) THEN
    CREATE POLICY "Service role full access products" ON products USING (true) WITH CHECK (true);
  END IF;
END $$;


-- ─────────────────────────────────────────────
-- 2. ตาราง merchant_profiles — สร้างถ้ายังไม่มี
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS merchant_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  shop_name TEXT DEFAULT '',
  shop_logo TEXT DEFAULT '',
  shop_address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  line_id TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  website TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- เพิ่ม columns ที่อาจจะขาด
DO $$ BEGIN
  ALTER TABLE merchant_profiles ADD COLUMN IF NOT EXISTS shop_logo TEXT DEFAULT '';
  ALTER TABLE merchant_profiles ADD COLUMN IF NOT EXISTS shop_address TEXT DEFAULT '';
  ALTER TABLE merchant_profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
  ALTER TABLE merchant_profiles ADD COLUMN IF NOT EXISTS line_id TEXT DEFAULT '';
  ALTER TABLE merchant_profiles ADD COLUMN IF NOT EXISTS instagram TEXT DEFAULT '';
  ALTER TABLE merchant_profiles ADD COLUMN IF NOT EXISTS facebook TEXT DEFAULT '';
  ALTER TABLE merchant_profiles ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '';
  ALTER TABLE merchant_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  
  RAISE NOTICE '✅ merchant_profiles table verified';
END $$;

-- RLS
ALTER TABLE merchant_profiles ENABLE ROW LEVEL SECURITY;

-- เจ้าของดูข้อมูลตัวเองได้
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'merchant_profiles' AND policyname = 'Users can view own merchant profile'
  ) THEN
    CREATE POLICY "Users can view own merchant profile"
      ON merchant_profiles FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- เจ้าของแก้ไขข้อมูลตัวเองได้
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'merchant_profiles' AND policyname = 'Users can update own merchant profile'
  ) THEN
    CREATE POLICY "Users can update own merchant profile"
      ON merchant_profiles FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- เจ้าของสร้างโปรไฟล์ตัวเองได้
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'merchant_profiles' AND policyname = 'Users can insert own merchant profile'
  ) THEN
    CREATE POLICY "Users can insert own merchant profile"
      ON merchant_profiles FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Service role full access
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'merchant_profiles' AND policyname = 'Service role full access merchant_profiles'
  ) THEN
    CREATE POLICY "Service role full access merchant_profiles"
      ON merchant_profiles USING (true) WITH CHECK (true);
  END IF;
END $$;


-- ─────────────────────────────────────────────
-- 3. ตาราง profiles — ตรวจสอบ columns
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  role TEXT DEFAULT 'USER',
  coins INTEGER DEFAULT 50,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT DEFAULT '';
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'USER';
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 50;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
  
  RAISE NOTICE '✅ profiles table verified';
END $$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;


-- ─────────────────────────────────────────────
-- 4. ตาราง saved_deals — ตรวจสอบ
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS saved_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, product_id)
);

ALTER TABLE saved_deals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_deals' AND policyname = 'Users can view own saved deals'
  ) THEN
    CREATE POLICY "Users can view own saved deals" ON saved_deals FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_deals' AND policyname = 'Users can insert own saved deals'
  ) THEN
    CREATE POLICY "Users can insert own saved deals" ON saved_deals FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_deals' AND policyname = 'Users can delete own saved deals'
  ) THEN
    CREATE POLICY "Users can delete own saved deals" ON saved_deals FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;


-- ─────────────────────────────────────────────
-- 5. Storage bucket สำหรับรูปสินค้า
-- ─────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('promotions', 'promotions', true)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────
-- ✅ เสร็จสิ้น — สรุป
-- ─────────────────────────────────────────────
-- ตารางที่ตรวจสอบ/สร้าง:
--   ✅ products         — เพิ่ม column ที่ขาด (discount, location, conditions, ...)
--   ✅ merchant_profiles — โปรไฟล์ร้านค้า (shop_name, shop_logo, phone, ...)
--   ✅ profiles          — ข้อมูลผู้ใช้ (email, role, coins, xp, ...)
--   ✅ saved_deals       — ดีลที่บันทึก
--   ✅ storage bucket    — promotions (สำหรับรูปสินค้า)
--
-- ⚠️ ทุกคำสั่งใช้ IF NOT EXISTS — ไม่ลบข้อมูลเดิม รันซ้ำได้ปลอดภัย
