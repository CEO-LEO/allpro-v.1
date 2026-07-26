-- ============================================
-- Add optional geo-coordinates to promotion_views
-- ============================================
-- เดิม AudienceLocation.tsx ส่วน "Hot Zones" เป็นชื่อห้างปลอมทั้งหมด เพราะ
-- ไม่มีข้อมูลตำแหน่งผู้เข้าชมเก็บไว้เลยในระบบ — เพิ่มคอลัมน์นี้เพื่อเก็บ
-- lat/lng แบบ "opportunistic" เท่านั้น (เก็บเฉพาะตอนที่ browser อนุญาต
-- geolocation อยู่แล้วจากที่อื่นในแอป เช่นหน้า /map — ไม่ขอ permission
-- ใหม่เพิ่มเพื่อจุดประสงค์นี้โดยเฉพาะ เพื่อไม่ให้รบกวนผู้ใช้)
--
-- ใช้คำนวณระยะทางจากสาขาจริงของร้าน (merchant_branches) แทนการเดา/ปลอม
-- ชื่อห้างที่ไม่มีข้อมูลรองรับ

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promotion_views' AND column_name = 'lat'
  ) THEN
    ALTER TABLE promotion_views ADD COLUMN lat DOUBLE PRECISION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promotion_views' AND column_name = 'lng'
  ) THEN
    ALTER TABLE promotion_views ADD COLUMN lng DOUBLE PRECISION;
  END IF;
END $$;
