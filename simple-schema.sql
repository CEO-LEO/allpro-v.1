-- 🎯 Supabase Schema - เริ่มต้นแบบง่ายๆ
-- วิธีใช้: ไปที่ Supabase Dashboard -> SQL Editor -> New Query -> วางโค้ดนี้ -> Run

-- 1. สร้างตารางสินค้า (Products)
create table products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  price numeric not null,
  original_price numeric,
  image text,
  category text,
  shop_name text,
  shop_id text
);

-- 2. สร้างตารางเก็บของที่บันทึกไว้ (Saved Deals)
create table saved_deals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  product_id uuid references products(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. เปิดให้ทุกคนมองเห็นสินค้า (แต่แก้ไม่ได้)
alter table products enable row level security;
create policy "Public products are viewable by everyone" 
on products for select using (true);

-- 4. ใส่ข้อมูลตัวอย่าง (Seeding Data) เพื่อไม่ให้แอปโล่ง
insert into products (title, price, original_price, category, shop_name, description, image)
values 
('บุฟเฟต์แซลมอน พรีเมียม', 599, 899, 'Food', 'Siam Salmon', 'แซลมอนสดนอร์เวย์ ทานไม่อั้น 90 นาที', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80'),
('รองเท้าวิ่ง Nike Zoom', 2500, 4500, 'Fashion', 'Sport City', 'รองเท้าวิ่งรุ่นท็อป นุ่มสบาย', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'),
('ทริปดำน้ำ เกาะเต่า 3 วัน', 3990, 6500, 'Travel', 'Sea Lover', 'รวมที่พักและอุปกรณ์ดำน้ำครบชุด', 'https://images.unsplash.com/photo-1544551763-46a42a457110?w=800&q=80');

-- ✅ เสร็จแล้ว! ตอนนี้คุณมี:
--    - ตาราง products (เก็บโปรโมชั่น)
--    - ตาราง saved_deals (เก็บของที่บันทึก)
--    - ข้อมูลตัวอย่าง 3 รายการ
