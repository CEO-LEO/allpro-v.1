-- =====================================================
-- AUTHENTICATION + GAMIFICATION SCHEMA
-- ระบบล็อกอิน + เหรียญ + เลเวล สำหรับ ALL PRO
-- =====================================================

-- 1. สร้างตารางเก็บข้อมูลผู้ใช้ (เหรียญ, เลเวล)
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  avatar_url text,
  coins integer default 0,
  xp integer default 0,
  level integer default 1,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. สร้างระบบอัตโนมัติ: สมัครปุ๊บ สร้าง Profile ให้ปั๊บ
-- ดึง role จาก user_metadata ที่ส่งมาตอน signUp (ไม่ hardcode 'user' อีกต่อไป)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, username, avatar_url, coins, xp, level, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    50,
    0,
    1,
    coalesce(new.raw_user_meta_data->>'role', 'USER')
  )
  on conflict (id) do update set
    email = excluded.email,
    username = excluded.username,
    avatar_url = excluded.avatar_url,
    role = excluded.role;
  return new;
end;
$$ language plpgsql security definer;

-- ลบ trigger เก่า (ถ้ามี) แล้วสร้างใหม่
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. เปิดสิทธิ์ให้แอปอ่านข้อมูลได้ (Row Level Security)
alter table profiles enable row level security;

-- ลบ policy เก่า (ถ้ามี)
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- สร้าง policy ใหม่
create policy "Users can view own profile" 
  on profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on profiles for update 
  using (auth.uid() = id);

-- 4. เปิดสิทธิ์สำหรับ saved_deals (เชื่อมกับ auth)
alter table saved_deals enable row level security;

drop policy if exists "Users can view own saved deals" on saved_deals;
drop policy if exists "Users can insert own saved deals" on saved_deals;
drop policy if exists "Users can delete own saved deals" on saved_deals;

create policy "Users can view own saved deals" 
  on saved_deals for select 
  using (auth.uid() = user_id);

create policy "Users can insert own saved deals" 
  on saved_deals for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete own saved deals" 
  on saved_deals for delete 
  using (auth.uid() = user_id);

-- =====================================================
-- ✅ สำเร็จ! ตอนนี้คุณมี:
-- 1. ตาราง profiles (เก็บเหรียญ, XP, เลเวล)
-- 2. Auto-create profile เมื่อสมัครสมาชิก (เริ่มต้น 50 เหรียญ)
-- 3. Row Level Security (ปลอดภัย)
-- 4. saved_deals เชื่อมกับ auth system
-- =====================================================
