-- ═══════════════════════════════════════════════════════════
-- shop_views table
-- บันทึกการเข้าชมหน้าโปรไฟล์ร้านค้า (ระดับร้าน ไม่ใช่สินค้า)
-- Dedup strategy:
--   logged-in  : UNIQUE partial index (user_id, shop_id)
--   anonymous  : UNIQUE partial index (session_id, shop_id) + localStorage
-- ═══════════════════════════════════════════════════════════

create table if not exists public.shop_views (
  id          uuid primary key default gen_random_uuid(),
  shop_id     text not null
                CONSTRAINT chk_shop_id_length CHECK (char_length(shop_id) BETWEEN 1 AND 255),
  user_id     uuid references auth.users(id) on delete set null,
  -- +5 min tolerance สำหรับ clock skew ระหว่าง client กับ server
  viewed_at   timestamptz not null default now()
                CONSTRAINT chk_viewed_at_not_future CHECK (viewed_at <= now() + interval '5 minutes'),

  -- [anonymous dedup] persistent browser fingerprint (crypto.randomUUID stored in localStorage)
  -- Option A (เข้มงวด): client ต้อง generate UUID ก่อน insert เสมอ
  -- browser ที่ไม่รองรับ crypto.randomUUID → trackShopView() จะ skip insert ทั้งหมด
  -- (insert แบบไม่มี dedup เลยแย่กว่าไม่ track)
  session_id  text
    CONSTRAINT chk_session_id_format CHECK (
      session_id IS NULL
      OR session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    ),

  -- CHECK constraint ป้องกัน analytics grouping ผิดพลาด
  source      text not null default 'shop_profile'
                check (source in ('shop_profile', 'search', 'homepage', 'recommendation', 'direct')),

  -- NOTE: ไม่มี FK บน shop_id เจตนา
  -- shop_id คือค่าจาก URL ซึ่งอาจเป็น shop_name (text) หรือ user UUID
  -- FK ต้องการ single unique reference column ใน merchant_profiles
  -- ซึ่งปัจจุบันไม่มี — ต้อง refactor schema ก่อนจึงจะ add FK ได้
  CONSTRAINT chk_shop_views_identity CHECK (
    user_id IS NOT NULL OR session_id IS NOT NULL
  )
);

-- Migration guard: สำหรับ DB ที่รัน round 1 ไปแล้วก่อนที่จะมี session_id
-- (กรณีรัน migration นี้ครั้งแรก CREATE TABLE จะสร้าง column นี้อยู่แล้ว — เป็น no-op)
alter table public.shop_views
  add column if not exists session_id text;

-- Pre-migration cleanup: backfill session_id สำหรับ legacy anonymous rows จาก round 1
-- (safe — placeholder UUID เพื่อให้ผ่าน chk_shop_views_identity ที่จะ add ด้านล่าง)
UPDATE public.shop_views
  SET session_id = gen_random_uuid()::text
  WHERE user_id IS NULL AND session_id IS NULL;

-- Migration guard: เพิ่ม constraints สำหรับ DB ที่มีอยู่แล้ว
-- EXCEPTION WHEN others: กรณี existing rows ละเมิด constraint → RAISE WARNING แทน silent fail
DO $$ BEGIN
  ALTER TABLE public.shop_views
    ADD CONSTRAINT chk_shop_views_identity
    CHECK (user_id IS NOT NULL OR session_id IS NOT NULL);
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    RAISE WARNING 'chk_shop_views_identity: could not add constraint. Error: %', SQLERRM;
END $$;

DO $$ BEGIN
  ALTER TABLE public.shop_views
    ADD CONSTRAINT chk_session_id_format
    CHECK (
      session_id IS NULL
      OR session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    RAISE WARNING 'chk_session_id_format: could not add constraint. Error: %', SQLERRM;
END $$;

DO $$ BEGIN
  ALTER TABLE public.shop_views
    ADD CONSTRAINT chk_shop_id_length CHECK (char_length(shop_id) BETWEEN 1 AND 255);
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    RAISE WARNING 'chk_shop_id_length: could not add constraint. Error: %', SQLERRM;
END $$;

DO $$ BEGIN
  ALTER TABLE public.shop_views
    ADD CONSTRAINT chk_viewed_at_not_future
    CHECK (viewed_at <= now() + interval '5 minutes');
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    RAISE WARNING 'chk_viewed_at_not_future: could not add constraint. Error: %', SQLERRM;
END $$;

-- ───────────────────────────────────────────────────────────
-- Indexes
-- ───────────────────────────────────────────────────────────

-- merchant dashboard query: shop_id + ช่วงเวลา
create index if not exists idx_shop_views_shop_id
  on public.shop_views(shop_id, viewed_at desc);

-- [FIX: Performance] standalone viewed_at index สำหรับ pg_cron retention DELETE
-- "WHERE viewed_at < now() - interval '90 days'" จะใช้ index นี้แทนที่จะ full scan
create index if not exists idx_shop_views_viewed_at
  on public.shop_views(viewed_at);

-- logged-in dedup: 1 user = 1 view ต่อ 1 ร้าน
create unique index if not exists uq_shop_views_user_shop
  on public.shop_views(user_id, shop_id)
  where user_id is not null;

-- [FIX: Security] anonymous dedup ระดับ DB:
-- ป้องกัน anonymous spam เมื่อ localStorage ถูก bypass
-- session_id คือ UUID ที่ trackShopView() generate ครั้งแรกและเก็บใน localStorage
create unique index if not exists uq_shop_views_session_shop
  on public.shop_views(session_id, shop_id)
  where user_id is null and session_id is not null;

-- ───────────────────────────────────────────────────────────
-- Supporting index บน merchant_profiles
-- ───────────────────────────────────────────────────────────

-- [FIX: Performance] SELECT policy ใช้ subquery EXISTS บน merchant_profiles
-- index นี้ทำให้ Postgres ไม่ต้อง seq scan ทุกครั้งที่ merchant query shop_views
create index if not exists idx_merchant_profiles_user_shop
  on public.merchant_profiles(user_id, shop_name);

-- ───────────────────────────────────────────────────────────
-- Row Level Security
-- ───────────────────────────────────────────────────────────

alter table public.shop_views enable row level security;

-- Migration guard: drop ก่อน recreate เพื่อให้รันซ้ำได้ (idempotent)
drop policy if exists "Anyone can insert shop views"      on public.shop_views;
drop policy if exists "Merchants can read own shop views" on public.shop_views;
drop policy if exists "No direct updates to shop views"   on public.shop_views;
drop policy if exists "No direct deletes to shop views"   on public.shop_views;

-- INSERT: อนุญาต anonymous + logged-in insert ได้
-- spam mitigation:
--   logged-in  → uq_shop_views_user_shop ป้องกัน DB level
--   anonymous  → uq_shop_views_session_shop ป้องกัน DB level (session_id ต้องส่งมาด้วย)
create policy "Anyone can insert shop views"
  on public.shop_views for insert
  with check (true);

-- SELECT: เฉพาะ merchant เจ้าของร้านดู analytics ได้
-- shop_id ใน shop_views อาจเป็น:
--   1. shop_name  → mp.shop_name = shop_views.shop_id
--   2. user UUID  → auth.uid()::text = shop_views.shop_id
create policy "Merchants can read own shop views"
  on public.shop_views for select
  using (
    auth.uid() is not null
    and exists (
      select 1
      from public.merchant_profiles mp
      where mp.user_id = auth.uid()
        and (
          mp.shop_name       = shop_views.shop_id
          or auth.uid()::text = shop_views.shop_id
        )
    )
  );

-- [FIX: Functional Integrity] explicit deny UPDATE/DELETE (defense in depth)
-- Supabase block โดย default เมื่อ RLS เปิด แต่ประกาศชัดเจน
-- เพื่อป้องกันกรณี service account หรือ role ใหม่ที่อาจ bypass ในอนาคต
-- ⚠️  DELETE ผ่านได้เฉพาะ postgres/service_role (BYPASSRLS) เท่านั้น
-- ⚠️  pg_cron cleanup ต้องรันใน postgres role — ห้ามใช้ anon/authenticated key
-- ⚠️  Supabase Dashboard SQL Editor ใช้ postgres role โดยตรง — ทดสอบ manual delete ได้
create policy "No direct updates to shop views"
  on public.shop_views for update
  using (false);

create policy "No direct deletes to shop views"
  on public.shop_views for delete
  using (false);

-- ───────────────────────────────────────────────────────────
-- Grants
-- ───────────────────────────────────────────────────────────

-- anon: INSERT เท่านั้น (anonymous visitors track views ได้ แต่ SELECT ไม่ได้)
GRANT INSERT ON public.shop_views TO anon;

-- authenticated: INSERT + SELECT (merchant จะ SELECT ผ่าน RLS policy)
-- ไม่ grant UPDATE/DELETE — สอดคล้องกับ explicit deny policies ด้านบน
GRANT INSERT, SELECT ON public.shop_views TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- Data Retention  (!! ต้องรันผ่าน Supabase Edge Function หรือ pg_cron !!)
-- ─────────────────────────────────────────────────────────────────────
--
-- ลบข้อมูลที่เก่ากว่า 90 วันเพื่อไม่ให้ table โตไม่หยุด
-- idx_shop_views_viewed_at รองรับ query นี้โดยตรง (ไม่ full scan):
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
