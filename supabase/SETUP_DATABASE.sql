-- =====================================================
-- ALL PRO - Complete Database Setup Script
-- =====================================================
-- คำแนะนำ: รันไฟล์นี้ใน Supabase SQL Editor ครั้งเดียว
-- หรือรันทีละส่วนตามลำดับ
-- =====================================================

-- ===========================================
-- 1. เปิด Extensions
-- ===========================================
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- 2. สร้าง Storage Bucket สำหรับรูปโปรโมชั่น
-- ===========================================
-- Note: ต้องสร้างผ่าน Supabase Dashboard > Storage > New bucket
-- ชื่อ bucket: "promotions"
-- Public: Yes
-- หรือรันคำสั่งนี้ (ต้องมี service_role permission):

INSERT INTO storage.buckets (id, name, public)
VALUES ('promotions', 'promotions', true)
ON CONFLICT (id) DO NOTHING;

-- Set storage policy (ให้ทุกคนอ่านได้)
CREATE POLICY "Public Access for Promotions"
ON storage.objects FOR SELECT
USING (bucket_id = 'promotions');

-- Admin Upload Policy
CREATE POLICY "Admin Upload Promotions"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'promotions' AND auth.role() = 'authenticated');

-- ===========================================
-- 3. เพิ่มคอลัมน์ใน products table
-- ===========================================
-- ตรวจสอบว่ามี products table อยู่แล้ว ถ้าไม่มีให้สร้างก่อน

-- เพิ่มคอลัมน์สำหรับ Geolocation
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_point GEOGRAPHY(POINT, 4326);

-- เพิ่มคอลัมน์สำหรับ Multi-images และ Metadata
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS images TEXT[],
  ADD COLUMN IF NOT EXISTS branches TEXT[],
  ADD COLUMN IF NOT EXISTS "validUntil" DATE,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- เพิ่ม Index สำหรับการค้นหา
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_verified ON products(verified);
CREATE INDEX IF NOT EXISTS idx_products_valid_until ON products("validUntil");

-- ===========================================
-- 4. Trigger: อัปเดต location_point อัตโนมัติ
-- ===========================================
CREATE OR REPLACE FUNCTION update_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.location_point := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::GEOGRAPHY;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_location ON products;
CREATE TRIGGER trg_update_location
  BEFORE INSERT OR UPDATE OF lat, lng ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_location_point();

-- ===========================================
-- 5. Geospatial Index
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_products_location 
ON products USING GIST (location_point);

-- ===========================================
-- 6. RPC Function: ค้นหาโปรใกล้ฉัน
-- ===========================================
CREATE OR REPLACE FUNCTION nearby_products(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  "originalPrice" NUMERIC,
  "promoPrice" NUMERIC,
  image TEXT,
  category TEXT,
  "shopName" TEXT,
  discount NUMERIC,
  rating NUMERIC,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  distance_km DOUBLE PRECISION
)
LANGUAGE sql STABLE
AS $$
  SELECT
    p.id,
    p.title,
    p.description,
    p.price,
    p."originalPrice",
    p."promoPrice",
    p.image,
    p.category,
    p."shopName",
    p.discount,
    p.rating,
    p.lat,
    p.lng,
    ROUND(
      (ST_Distance(
        p.location_point,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::GEOGRAPHY
      ) / 1000)::NUMERIC,
      1
    ) AS distance_km
  FROM products p
  WHERE p.location_point IS NOT NULL
    AND ST_DWithin(
      p.location_point,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::GEOGRAPHY,
      radius_km * 1000
    )
  ORDER BY distance_km ASC
  LIMIT 20;
$$;

-- ===========================================
-- 7. Mock Data: เพิ่มพิกัดตัวอย่าง
-- ===========================================
-- อัปเดตโปรโมชั่นที่มีอยู่ให้มีพิกัด (กรุงเทพ-สยาม-สุขุมวิท)
-- แทนที่ 'product-uuid-here' ด้วย ID จริงจากตาราง products

-- ตัวอย่าง:
-- UPDATE products SET lat = 13.7460, lng = 100.5340 WHERE id = 'prod-1'; -- สยามสแควร์
-- UPDATE products SET lat = 13.7462, lng = 100.5347 WHERE id = 'prod-2'; -- Central World
-- UPDATE products SET lat = 13.7310, lng = 100.5677 WHERE id = 'prod-3'; -- Thonglor
-- UPDATE products SET lat = 13.7450, lng = 100.5280 WHERE id = 'prod-5'; -- สยาม BTS
-- UPDATE products SET lat = 13.7380, lng = 100.5600 WHERE id = 'prod-6'; -- เอกมัย

-- ===========================================
-- 8. Policies สำหรับ Products Table (RLS)
-- ===========================================
-- เปิด Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: ทุกคนอ่าน products ได้
CREATE POLICY "Public read products"
ON products FOR SELECT
USING (true);

-- Policy: Admin เท่านั้นที่ insert/update/delete ได้
CREATE POLICY "Admin manage products"
ON products FOR ALL
USING (auth.role() = 'authenticated' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- ===========================================
-- 9. Verify Setup
-- ===========================================
-- ทดสอบ RPC Function
-- SELECT * FROM nearby_products(13.7460, 100.5340, 5);

-- ตรวจสอบ PostGIS
-- SELECT PostGIS_Version();

-- ตรวจสอบ Products มี location_point
-- SELECT id, title, lat, lng, ST_AsText(location_point) FROM products LIMIT 5;

-- ===========================================
-- สำเร็จ! 🎉
-- ===========================================
-- ระบบพร้อมใช้งานแล้ว ทดสอบโดย:
-- 1. เข้า /admin/create-post อัปโหลดโปรโมชั่น
-- 2. กรอกพิกัด lat/lng ด้วย (เช่น 13.7460, 100.5340)
-- 3. เช็คที่หน้าแรก โปรเด็ดใกล้คุณ จะแสดงผล
