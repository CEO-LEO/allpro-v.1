-- =============================================
-- Personalization & Notification System Schema
-- =============================================

-- 1. เพิ่มคอลัมน์ preferred_tags ในตาราง profiles
-- (สำหรับเก็บแท็ก/หมวดหมู่ที่ผู้ใช้สนใจ)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferred_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- 2. สร้างตาราง notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'promo' CHECK (type IN ('promo', 'restock', 'welcome', 'system', 'deal')),
  promotion_id TEXT,              -- อ้างอิงถึงโปรโมชั่นที่เกี่ยวข้อง (ถ้ามี)
  merchant_name TEXT,             -- ชื่อร้านค้าที่สร้างโปรฯ
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Index สำหรับ Query ที่ใช้บ่อย
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_tags ON profiles USING GIN(preferred_tags);

-- 4. RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ผู้ใช้อ่านได้เฉพาะ notification ของตัวเอง
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- ผู้ใช้อัปเดต is_read ได้เฉพาะ notification ของตัวเอง
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role สามารถ insert ได้ (สำหรับ trigger notification)
CREATE POLICY "Service can insert notifications" ON notifications
  FOR INSERT WITH CHECK (TRUE);

-- 5. Function: เมื่อสร้างโปรโมชั่นใหม่ ส่งแจ้งเตือนให้ผู้ใช้ที่มี preferred_tags ตรงกัน
CREATE OR REPLACE FUNCTION notify_users_on_new_promo()
RETURNS TRIGGER AS $$
DECLARE
  promo_tags TEXT[];
  matched_user RECORD;
BEGIN
  -- ดึง tags ของโปรโมชั่นใหม่
  promo_tags := NEW.tags;
  
  -- หาผู้ใช้ที่มี preferred_tags ตรงกับ tags ของโปรโมชั่น
  FOR matched_user IN
    SELECT id FROM profiles
    WHERE preferred_tags && promo_tags  -- && = overlap operator (มีสมาชิกร่วมกัน)
    AND id != NEW.shop_id              -- ไม่ส่งให้ร้านค้าเจ้าของโปรฯ
  LOOP
    INSERT INTO notifications (user_id, title, message, type, promotion_id, merchant_name)
    VALUES (
      matched_user.id,
      '🎉 โปรใหม่ที่คุณอาจสนใจ!',
      NEW.title || ' จาก ' || NEW.shop_name,
      'promo',
      NEW.id::TEXT,
      NEW.shop_name
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger: เรียก function เมื่อมีโปรโมชั่นใหม่
-- (ปรับชื่อตารางตาม schema จริงของคุณ)
-- CREATE TRIGGER on_new_promotion
--   AFTER INSERT ON products
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_users_on_new_promo();
