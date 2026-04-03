-- ============================================================================
-- แก้ไข RLS Policy ตาราง products ให้ลบได้
-- วิธีใช้: Supabase Dashboard → SQL Editor → New Query → วางโค้ดนี้ → Run
-- ============================================================================

-- ลบ policy เดิมที่จำกัดเฉพาะ authenticated
DROP POLICY IF EXISTS "Auth users can delete products" ON products;
DROP POLICY IF EXISTS "Auth users can update products" ON products;
DROP POLICY IF EXISTS "Auth users can insert products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

-- สร้าง policy ใหม่ที่อนุญาตทุก role (anon + authenticated)
CREATE POLICY "Anyone can insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete products" ON products FOR DELETE USING (true);
