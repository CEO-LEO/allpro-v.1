-- ============================================
-- Add real stock/availability flag to products
-- ============================================
-- เดิม merchant/stock page + StockGrid.tsx toggle สต็อกสินค้าแค่ใน
-- local React state เท่านั้น ไม่เคยบันทึกจริง — เพิ่มคอลัมน์นี้เพื่อให้
-- persist ได้จริงผ่าน Supabase

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_available'
  ) THEN
    ALTER TABLE products ADD COLUMN is_available BOOLEAN DEFAULT TRUE;
  END IF;
END $$;
