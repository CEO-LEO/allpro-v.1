-- ============================================
-- Add real geo-coordinates to merchant_profiles so /map can show real stores
-- ============================================
-- เดิม /map page แสดง mockStores (data/stores.ts) เพราะไม่มีทางให้ร้านค้า
-- บันทึกพิกัดที่ตั้งร้านได้เลย ตาราง merchant_profiles (ตารางร้านค้าจริงที่
-- EditShopModal ใช้อยู่แล้ว) ไม่มีคอลัมน์พิกัด — เพิ่มให้ที่นี่

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchant_profiles' AND column_name = 'shop_lat'
  ) THEN
    ALTER TABLE merchant_profiles ADD COLUMN shop_lat DOUBLE PRECISION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchant_profiles' AND column_name = 'shop_lng'
  ) THEN
    ALTER TABLE merchant_profiles ADD COLUMN shop_lng DOUBLE PRECISION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_merchant_profiles_geo
  ON merchant_profiles (shop_lat, shop_lng)
  WHERE shop_lat IS NOT NULL AND shop_lng IS NOT NULL;

-- ไม่ต้องเพิ่ม RLS policy ใหม่ — merchant_profiles มี
-- "Anyone can view merchant_profiles" (FOR SELECT USING (true)) อยู่แล้ว
-- ทำให้หน้า /map (public) query ตรงได้เลยโดยไม่ต้องผ่าน API route เพิ่ม
