-- ═══════════════════════════════════════════════════════════
-- shop_views table
-- บันทึกการเข้าชมหน้าโปรไฟล์ร้านค้า (ระดับร้าน ไม่ใช่สินค้า)
-- Dedup:
--   - Logged-in user: UNIQUE partial index (user_id, shop_id) enforce ระดับ DB
--   - Anonymous     : application-layer dedup ผ่าน localStorage
-- ═══════════════════════════════════════════════════════════

create table if not exists public.shop_views (
  id          uuid primary key default gen_random_uuid(),
  shop_id     text not null,
  user_id     uuid references auth.users(id) on delete set null,
  viewed_at   timestamptz not null default now(),

  -- CHECK constraint ป้องกัน analytics grouping ผิดพลาด
  source      text not null default 'shop_profile'
                check (source in ('shop_profile', 'search', 'homepage', 'recommendation', 'direct'))
);

-- ───────────────────────────────────────────────────────────
-- Indexes
-- ───────────────────────────────────────────────────────────

-- merchant dashboard query: shop_id + ช่วงเวลา
create index if not exists idx_shop_views_shop_id
  on public.shop_views(shop_id, viewed_at desc);

-- DB-level dedup สำหรับ logged-in users
-- ป้องกัน race condition เมื่อ client ส่ง request ซ้ำพร้อมกัน
-- ใช้ partial index WHERE user_id IS NOT NULL
-- เพราะ NULL != NULL ใน SQL — anonymous หลายคนจะไม่ชน constraint กัน
create unique index if not exists uq_shop_views_user_shop
  on public.shop_views(user_id, shop_id)
  where user_id is not null;

-- ───────────────────────────────────────────────────────────
-- Row Level Security
-- ───────────────────────────────────────────────────────────

alter table public.shop_views enable row level security;

-- INSERT: อนุญาต anonymous + logged-in users insert ได้
-- DB-level dedup (uq_shop_views_user_shop) ป้องกัน logged-in duplicate อยู่แล้ว
-- anonymous dedup อยู่ที่ localStorage + trackShopView() ใน analytics.ts
create policy "Anyone can insert shop views"
  on public.shop_views for insert
  with check (true);

-- SELECT: เฉพาะ merchant เจ้าของร้านดู analytics ได้
--
-- merchant_profiles ไม่มี column shop_id (มีแค่ user_id, shop_name)
-- shop_id ใน shop_views คือค่าจาก URL ซึ่งอาจเป็น:
--   1. shop_name  (เช่น /shop/ร้านกาแฟ)
--   2. merchant user UUID (เช่น /shop/550e8400-...)
--
-- จึงตรวจสอบ 2 กรณี:
--   mp.shop_name = shop_views.shop_id      — URL ใช้ shopName
--   mp.user_id::text = shop_views.shop_id  — URL ใช้ user UUID
create policy "Merchants can read own shop views"
  on public.shop_views for select
  using (
    auth.uid() is not null
    and exists (
      select 1
      from public.merchant_profiles mp
      where mp.user_id = auth.uid()
        and (
          mp.shop_name      = shop_views.shop_id
          or auth.uid()::text = shop_views.shop_id
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
