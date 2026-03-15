-- ========================================
-- MERCHANT UPLOAD PERMISSIONS
-- ========================================
-- รันใน Supabase SQL Editor เพื่อเปิดสิทธิ์ให้ร้านค้าลงขายสินค้าได้

-- 0. เพิ่มคอลัมน์เก็บลิงก์ Fastwork (ถ้าไม่มี)
alter table products 
add column if not exists service_url text default 'https://fastwork.co/general-admin';

-- 1. เปิดสิทธิ์ให้ User ที่ล็อกอินแล้ว INSERT สินค้าได้
create policy "Authenticated users can insert products" 
on products 
for insert 
to authenticated 
with check (true);

-- 2. เปิดสิทธิ์ให้ User อัปเดตสินค้าของตัวเองได้
create policy "Users can update own products" 
on products 
for update 
to authenticated 
using (auth.uid() = id);

-- 3. เปิดสิทธิ์ให้ User ลบสินค้าของตัวเองได้
create policy "Users can delete own products" 
on products 
for delete 
to authenticated 
using (auth.uid() = id);

-- 4. เปิดสิทธิ์ให้ทุกคนดูสินค้าได้ (เปิดไว้แล้วก่อนหน้านี้)
-- (ถ้ายังไม่มี policy นี้ ให้ uncomment)
-- create policy "Anyone can view products" 
-- on products 
-- for select 
-- to anon, authenticated 
-- using (true);

-- ========================================
-- STORAGE PERMISSIONS (สำหรับอัปโหลดรูป)
-- ========================================

-- 5. เปิดสิทธิ์ให้ User ที่ล็อกอินแล้วอัปโหลดรูปได้
create policy "Authenticated users can upload images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'products');

-- 6. เปิดสิทธิ์ให้ทุกคนดูรูปได้ (Public Read)
create policy "Anyone can view product images"
on storage.objects
for select
to public
using (bucket_id = 'products');

-- 7. เปิดสิทธิ์ให้ User ลบรูปของตัวเองได้
create policy "Users can delete own images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'products' AND auth.uid() = owner);

-- ========================================
-- เสร็จสิ้น! ✅
-- ========================================
-- ตอนนี้ร้านค้าสามารถ:
--   1. อัปโหลดรูปสินค้า (Storage)
--   2. เพิ่มสินค้าใหม่ (INSERT)
--   3. แก้ไข/ลบสินค้าของตัวเอง
--   4. ทุกคนดูสินค้าได้
