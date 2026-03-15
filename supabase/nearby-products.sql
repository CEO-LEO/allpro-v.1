-- ============================================================
-- Supabase PostGIS: Nearby Promotions Function
-- ============================================================
-- วิธีใช้: รันไฟล์นี้ใน Supabase SQL Editor
-- ============================================================

-- 1) เปิดใช้ PostGIS Extension (ครั้งเดียว)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2) เพิ่มคอลัมน์พิกัดให้ตาราง products (ถ้ายังไม่มี)
ALTER TABLE products ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE products ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE products ADD COLUMN IF NOT EXISTS location_point GEOGRAPHY(POINT, 4326);

-- 3) Trigger: อัปเดต location_point อัตโนมัติเมื่อ lat/lng เปลี่ยน
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

-- 4) Index สำหรับค้นหาเร็ว
CREATE INDEX IF NOT EXISTS idx_products_location ON products USING GIST (location_point);

-- 5) RPC Function: ค้นหาโปรใกล้ฉัน (รัศมีกำหนดได้ = radius_km, default 5 km)
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
      radius_km * 1000  -- เมตร
    )
  ORDER BY distance_km ASC
  LIMIT 20;
$$;

-- 6) Mock data: เพิ่มพิกัดตัวอย่าง (ย่านสยาม-สุขุมวิท, กรุงเทพฯ)
-- UPDATE products SET lat = 13.7460, lng = 100.5340 WHERE id = '...';
