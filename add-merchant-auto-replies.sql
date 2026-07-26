-- ============================================
-- Merchant AI Auto-Reply settings — moved from localStorage to Supabase
-- ============================================
-- เดิม app/(merchant)/merchant/settings/auto-reply/page.tsx เก็บทุกอย่างใน
-- localStorage (`merchant_{userId}_ai_enabled`, `merchant_{userId}_auto_replies`)
-- ซึ่งหายทันทีที่เปลี่ยนเครื่อง/ล้าง cache — ย้ายมาเก็บที่นี่แทน

CREATE TABLE IF NOT EXISTS merchant_auto_replies (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  -- Array of { id, keyword, answer, enabled } — keeps disabled entries too,
  -- unlike the old localStorage format which dropped them on save
  replies JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE merchant_auto_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants can view own auto-replies" ON merchant_auto_replies;
DROP POLICY IF EXISTS "Merchants can insert own auto-replies" ON merchant_auto_replies;
DROP POLICY IF EXISTS "Merchants can update own auto-replies" ON merchant_auto_replies;

CREATE POLICY "Merchants can view own auto-replies"
  ON merchant_auto_replies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Merchants can insert own auto-replies"
  ON merchant_auto_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Merchants can update own auto-replies"
  ON merchant_auto_replies FOR UPDATE
  USING (auth.uid() = user_id);
