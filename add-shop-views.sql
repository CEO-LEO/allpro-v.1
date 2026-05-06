-- ═══════════════════════════════════════════════════════════
-- shop_views table
-- บันทึกการเข้าชมหน้าโปรไฟล์ร้านค้า (ระดับร้าน ไม่ใช่สินค้า)
-- Dedup:
--   - Logged-in user: UNIQUE (user_id, shop_id) enforce ระดับ DB
--   - Anonymous     : application-layer dedup ผ่าน localStorage
-- ═══════════════════════════════════════════════════════════

create table if not exists public.shop_views (
  id          uuid primary key default gen_random_uuid(),
  shop_id     text not null,
  user_id     uuid references auth.users(id) on delete set null,
  viewed_at   timestamptz not null default now(),

  -- [FIX: Security] CHECK constraint ป้องกัน analytics grouping ผิดพลาด
  source      text not null default 'shop_profile'
                check (source in ('shop_profile', 'search', 'homepage', 'recommendation', 'direct'))
);

-- ───────────────────────────────────────────────────────────
-- Indexes
-- ───────────────────────────────────────────────────────────

-- merchant dashboard query: shop_id + ช่วงเวลา
create index if not exists idx_shop_views_shop_id
  on public.shop_views(shop_id, viewed_at desc);

-- [FIX: Functional Integrity] DB-level dedup สำหรับ logged-in users
-- ป้องกัน race condition เมื่อ client ส่ง request ซ้ำพร้อมกัน
-- (NULL != NULL ใน SQL จึงใช้ partial index WHERE user_id IS NOT NULL
--  ส่วน anonymous ยังคง dedup ผ่าน localStorage ที่ application layer)
create unique index if not exists uq_shop_views_user_shop
  on public.shop_views(user_id, shop_id)
  where user_id is not null;

-- ───────────────────────────────────────────────────────────
-- Row Level Security
-- ───────────────────────────────────────────────────────────

alter table public.shop_views enable row level security;

-- INSERT: อนุญาต anonymous + logged-in users insert ได้
-- DB-level dedup (uq_shop_views_user_shop) ป้องกัน logged-in spam อยู่แล้ว
-- anonymous dedup อยู่ที่ localStorage + application layer (trackShopView)
create policy "Anyone can insert shop views"
  on public.shop_views for insert
  with check (true);

-- [FIX: Security] SELECT policy — เดิมมี bug
-- Bug เดิม: user_id = auth.uid() ทำให้ user ทั่วไป query แถวที่ตัวเองดู
--   ได้ทุกแถว ซึ่ง expose ข้อมูลว่าร้านไหนมีคนดูบ้าง
-- Fix: ตรวจสอบ ownership ผ่าน merchant_profiles table แทน
--   รองรับทั้งกรณี shop_id เป็น UUID และกรณีเป็น shopName
create policy "Merchants can read own shop views"
  on public.shop_views for select
  using (
    auth.uid() is not null
    and exists (
      select 1
      from public.merchant_profiles mp
      where mp.user_id = auth.uid()
        and (
          mp.shop_id   = shop_views.shop_id
          or mp.shop_name = shop_views.shop_id
        )
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- Data Retention  (!! ต้องรันผ่าน Supabase Edge Function หรือ pg_cron !!)
-- ─────────────────────────────────────────────────────────────────────
--
-- ลบข้อมูลที่เก่ากว่า 90 วันเพื่อไม่ให้ table โตไม่หยุด:
--
--   delete from public.shop_views
--   where viewed_at < now() - interval '90 days';
--
-- ตั้งค่า pg_cron (เปิด extension ใน Dashboard → Database → Extensions ก่อน):
--
--   select cron.schedule(
--     'cleanup-old-shop-views',
--     '0 3 * * *',
--     $$delete from public.shop_views
--       where viewed_at < now() - interval '90 days';$$
--   );
