-- ============================================
-- Add merchant_settings table
-- ============================================
-- เดิม MerchantSettingsDashboard.tsx ปุ่ม "บันทึก" ในแท็บ Notifications/
-- Payment/Advanced ไม่เขียนไปที่ไหนเลย (setTimeout ปลอมแล้วขึ้น "บันทึกแล้ว!")
-- ตารางนี้เก็บค่าจริงต่อร้านค้า 1 แถว

CREATE TABLE IF NOT EXISTS merchant_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notifications (preferences only — ยังไม่มีระบบส่ง push/email จริง)
  push_notifications BOOLEAN NOT NULL DEFAULT false,
  email_notifications BOOLEAN NOT NULL DEFAULT false,
  flash_sale_alerts BOOLEAN NOT NULL DEFAULT false,
  new_order_alerts BOOLEAN NOT NULL DEFAULT false,

  -- Payment (ข้อมูลบัญชีสำหรับจ่ายเงินร้านค้า — ยังไม่มี payment gateway จริง
  -- เก็บไว้เป็นข้อมูลอ้างอิงสำหรับการโอนเงินด้วยมือ)
  bank_name TEXT,
  account_number TEXT,
  cod_enabled BOOLEAN NOT NULL DEFAULT false,

  -- Advanced
  auto_clean_expired BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE merchant_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants manage own settings" ON merchant_settings;

-- ร้านค้าจัดการ (อ่าน/เขียน) ค่าตั้งค่าของตัวเองได้เท่านั้น — ตารางนี้มี bank_name/
-- account_number จึงห้าม public อ่านได้ทั้งหมดแบบตาราง merchant_profiles
-- /api/products ใช้ service role key (bypass RLS) เวลาต้องเช็ค is_active ของร้านอื่น
CREATE POLICY "Merchants manage own settings" ON merchant_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_merchant_settings_is_active ON merchant_settings (is_active);

-- ลูกค้าทั่วไป (ไม่ล็อกอิน) ต้องเช็คได้ว่าร้านนี้ปิดใช้งานอยู่ไหมตอนดูหน้าร้าน —
-- แต่ตาราง merchant_settings ห้าม public อ่านทั้งแถวเพราะมี bank_name/account_number
-- จึงเปิด view แยกที่โชว์แค่ is_active เท่านั้น
CREATE OR REPLACE VIEW merchant_settings_public AS
  SELECT user_id, is_active FROM merchant_settings;

GRANT SELECT ON merchant_settings_public TO anon, authenticated;
