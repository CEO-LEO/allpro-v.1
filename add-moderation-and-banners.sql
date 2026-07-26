-- ============================================
-- Add post_reports + banners tables
-- ============================================
-- เดิม Moderation Queue (app/admin/moderation) และ Hero Banners
-- (app/admin/banners) ใช้ data/adminMockData.ts / local state ล้วนๆ
-- ไม่มีตารางจริงรองรับเลย ปิดหน้าแล้วข้อมูลหาย

-- ┌─────────────────────────────────────────────────────────────┐
-- │ post_reports — ผู้ใช้รายงานโพสต์ที่ไม่เหมาะสม                │
-- └─────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS post_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, reporter_id)
);

ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view report counts" ON post_reports;
DROP POLICY IF EXISTS "Users can report posts" ON post_reports;
DROP POLICY IF EXISTS "Users can remove own report" ON post_reports;
DROP POLICY IF EXISTS "Admins clear reports" ON post_reports;

-- อ่านได้แบบ public (แค่ไว้นับจำนวน report ต่อโพสต์ ไม่มีข้อมูลอ่อนไหว)
CREATE POLICY "Anyone can view report counts" ON post_reports FOR SELECT USING (true);
-- รายงานได้เฉพาะในนามตัวเอง กันปลอมเป็นคนอื่น
CREATE POLICY "Users can report posts" ON post_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can remove own report" ON post_reports FOR DELETE USING (auth.uid() = reporter_id);
-- แอดมินล้าง report ทิ้งได้ตอนกด "Approve" ในหน้า Moderation Queue
CREATE POLICY "Admins clear reports" ON post_reports FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'));

CREATE INDEX IF NOT EXISTS idx_post_reports_post ON post_reports (post_id);

-- แอดมินลบโพสต์คนอื่นได้ตอนกด "Reject" ในหน้า Moderation Queue
-- (เดิม community-posts-schema.sql อนุญาตแค่เจ้าของโพสต์ลบเองเท่านั้น)
DROP POLICY IF EXISTS "Admins delete any post" ON community_posts;
CREATE POLICY "Admins delete any post" ON community_posts FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'));

-- ┌─────────────────────────────────────────────────────────────┐
-- │ banners — Hero banner บนหน้าแรก จัดการโดยแอดมิน               │
-- └─────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  promotion_id TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active banners" ON banners;
DROP POLICY IF EXISTS "Admins manage banners" ON banners;

-- ลูกค้าทั่วไปเห็นได้เฉพาะ banner ที่เปิดใช้งานอยู่ (สำหรับแสดงบนหน้าแรกในอนาคต)
CREATE POLICY "Anyone can view active banners" ON banners FOR SELECT USING (is_active = true);
-- เฉพาะบัญชีที่ profiles.role = 'ADMIN' เท่านั้นที่เพิ่ม/แก้ไข/ลบ banner ได้
CREATE POLICY "Admins manage banners" ON banners FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'));

CREATE INDEX IF NOT EXISTS idx_banners_active_priority ON banners (is_active, priority);
