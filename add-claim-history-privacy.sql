-- ============================================
-- Lock down promotion_claims + add a real "my claim history" view
-- ============================================
-- เดิม policy "Anyone can select claims" ON promotion_claims USING (true)
-- เปิดให้ใครก็ได้ (แม้ไม่ล็อกอิน) อ่านประวัติการกดรับโปรโมชั่นของ "ทุกคน" ได้
-- หมด รวม user_id — เป็นช่องโหว่ privacy จริง เพิ่งเจอตอนสร้างหน้า
-- "โปรโมชั่นที่กดรับ/ใช้แล้ว" ให้ผู้ใช้ดูประวัติตัวเอง

-- ปิดรูรั่ว: อ่านได้เฉพาะเจ้าของ claim หรือร้านค้าเจ้าของสินค้านั้น (ไว้ใช้ merchant dashboard)
DROP POLICY IF EXISTS "Anyone can select claims" ON promotion_claims;
DROP POLICY IF EXISTS "Owner or merchant can view claims" ON promotion_claims;
CREATE POLICY "Owner or merchant can view claims" ON promotion_claims FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM products WHERE products.id = promotion_claims.product_id AND products.shop_id = auth.uid()::text)
  );

-- แต่หน้าร้านสาธารณะ (/shop/[shopId]) ยังต้องโชว์ยอด Revenue รวมให้ผู้เยี่ยมชม
-- ทุกคนเห็นได้ (ไม่ต้องล็อกอิน) — เปิด view แยกที่ไม่มี user_id/metadata ให้แทน
CREATE OR REPLACE VIEW promotion_claims_public AS
  SELECT id, product_id, merchant_id, status, claimed_at, original_price, promo_price, amount_saved
  FROM promotion_claims;

GRANT SELECT ON promotion_claims_public TO anon, authenticated;
