-- ═══════════════════════════════════════════════════════════
-- shop_views table — migration script (production-safe)
-- บันทึกการเข้าชมหน้าโปรไฟล์ร้านค้า (ระดับร้าน ไม่ใช่สินค้า)
--
-- Dedup strategy:
--   logged-in  : UNIQUE partial index (user_id, shop_id)
--   anonymous  : UNIQUE partial index (session_id, shop_id) + localStorage
--
-- ⚠️  รันทั้งไฟล์ใน Supabase SQL Editor (paste ทั้งหมดพร้อมกัน)
-- ⚠️  Section ต่างๆ ต้องรันตามลำดับ — ดูหัวข้อแต่ละ section
-- ═══════════════════════════════════════════════════════════


-- ╔═══════════════════════════════════════════════════════════╗
-- ║  SECTION 1: Table + Constraints + RLS + Grants           ║
-- ║  (transaction เพื่อ atomic — partial migration ไม่เกิด)  ║
-- ╚═══════════════════════════════════════════════════════════╝

BEGIN;

-- ───────────────────────────────────────────────────────────
-- Table
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.shop_views (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id     text NOT NULL
                CONSTRAINT chk_shop_id_length CHECK (char_length(shop_id) BETWEEN 1 AND 255),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- +5 min tolerance สำหรับ clock skew ระหว่าง client กับ server
  viewed_at   timestamptz NOT NULL DEFAULT now()
                CONSTRAINT chk_viewed_at_not_future CHECK (viewed_at <= now() + interval '5 minutes'),

  -- [anonymous dedup] persistent browser fingerprint (crypto.randomUUID stored in localStorage)
  -- Option A (เข้มงวด): client ต้อง generate UUID ก่อน insert เสมอ
  -- browser ที่ไม่รองรับ crypto.randomUUID → trackShopView() จะ skip insert ทั้งหมด
  session_id  text
    CONSTRAINT chk_session_id_format CHECK (
      session_id IS NULL
      OR session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    ),

  source      text NOT NULL DEFAULT 'shop_profile'
                CHECK (source IN ('shop_profile', 'search', 'homepage', 'recommendation', 'direct')),

  -- NOTE: ไม่มี FK บน shop_id เจตนา
  -- shop_id คือค่าจาก URL ซึ่งอาจเป็น shop_name (text) หรือ user UUID
  -- FK ต้องการ single unique reference column ใน merchant_profiles
  -- ซึ่งปัจจุบันไม่มี — ต้อง refactor schema ก่อนจึงจะ add FK ได้
  CONSTRAINT chk_shop_views_identity CHECK (
    user_id IS NOT NULL OR session_id IS NOT NULL
  )
);

-- ───────────────────────────────────────────────────────────
-- Migration guards: column + backfill
-- (สำหรับ DB ที่รัน round 1 ไปแล้วก่อนที่จะมี session_id)
-- ───────────────────────────────────────────────────────────

ALTER TABLE public.shop_views
  ADD COLUMN IF NOT EXISTS session_id text;

-- Pre-migration cleanup: backfill session_id สำหรับ legacy anonymous rows จาก round 1
-- (safe — placeholder UUID เพื่อให้ผ่าน chk_shop_views_identity ที่จะ add ด้านล่าง)
UPDATE public.shop_views
  SET session_id = gen_random_uuid()::text
  WHERE user_id IS NULL AND session_id IS NULL;

-- ───────────────────────────────────────────────────────────
-- Pre-dedup: ล้าง duplicate rows ก่อน CREATE UNIQUE INDEX
--
-- ถ้า DB มี round 1 data ที่ผู้ใช้คนเดียว view ร้านเดิมหลายครั้ง
-- CREATE UNIQUE INDEX CONCURRENTLY จะ fail ทันที (duplicate key)
-- ต้องเก็บ row ที่ viewed_at ล่าสุดไว้ ลบที่เหลือทิ้ง
-- ───────────────────────────────────────────────────────────

-- Dedup logged-in: เก็บ 1 row ต่อ (user_id, shop_id) — row ที่ viewed_at ล่าสุด
-- ใช้ CTE + ROW_NUMBER แทน NOT IN เพื่อหลีกเลี่ยง OOM บน large table
-- และหลีกเลี่ยง NULL edge-case ของ NOT IN
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, shop_id
           ORDER BY viewed_at DESC
         ) AS rn
  FROM public.shop_views
  WHERE user_id IS NOT NULL
)
DELETE FROM public.shop_views
  WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Dedup anonymous: เก็บ 1 row ต่อ (session_id, shop_id) — row ที่ viewed_at ล่าสุด
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY session_id, shop_id
           ORDER BY viewed_at DESC
         ) AS rn
  FROM public.shop_views
  WHERE user_id IS NULL AND session_id IS NOT NULL
)
DELETE FROM public.shop_views
  WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- ───────────────────────────────────────────────────────────
-- Migration guards: ADD CONSTRAINT (NOT VALID)
--
-- NOT VALID = เพิ่ม constraint โดยไม่ validate existing rows ทันที
--   → ไม่มี full table scan → ไม่ lock INSERT ระหว่าง migration
--   → new rows จะถูก validate ทันที (constraint มีผลแล้ว)
--   → existing rows จะ validate ได้ใน Section 4 (low-traffic)
--
-- RAISE EXCEPTION ทำให้ transaction rollback ทันทีถ้า add ไม่สำเร็จ
-- ───────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE public.shop_views
    ADD CONSTRAINT chk_shop_views_identity
    CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
    NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    RAISE EXCEPTION 'chk_shop_views_identity: failed. Error: %', SQLERRM;
END $$;

DO $$ BEGIN
  ALTER TABLE public.shop_views
    ADD CONSTRAINT chk_session_id_format
    CHECK (
      session_id IS NULL
      OR session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    )
    NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    RAISE EXCEPTION 'chk_session_id_format: failed. Error: %', SQLERRM;
END $$;

DO $$ BEGIN
  ALTER TABLE public.shop_views
    ADD CONSTRAINT chk_shop_id_length
    CHECK (char_length(shop_id) BETWEEN 1 AND 255)
    NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    RAISE EXCEPTION 'chk_shop_id_length: failed. Error: %', SQLERRM;
END $$;

DO $$ BEGIN
  ALTER TABLE public.shop_views
    ADD CONSTRAINT chk_viewed_at_not_future
    CHECK (viewed_at <= now() + interval '5 minutes')
    NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    RAISE EXCEPTION 'chk_viewed_at_not_future: failed. Error: %', SQLERRM;
END $$;

-- ───────────────────────────────────────────────────────────
-- Row Level Security
-- ───────────────────────────────────────────────────────────

ALTER TABLE public.shop_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert shop views"      ON public.shop_views;
DROP POLICY IF EXISTS "Merchants can read own shop views" ON public.shop_views;
DROP POLICY IF EXISTS "No direct updates to shop views"   ON public.shop_views;
DROP POLICY IF EXISTS "No direct deletes to shop views"   ON public.shop_views;

-- INSERT: อนุญาต anonymous + logged-in insert ได้
-- spam mitigation:
--   logged-in  → uq_shop_views_user_shop ป้องกัน DB level (1 user/shop)
--   anonymous  → uq_shop_views_session_shop ป้องกัน DB level (1 session/shop)
-- NOTE: authenticated user ที่รู้ shop_id ยังสามารถสร้าง account ใหม่แล้ว insert ซ้ำได้
--   (analytics data — รับ limitation นี้ได้ แก้ได้เพิ่มเติมด้วย anomaly detection ระดับ app)
CREATE POLICY "Anyone can insert shop views"
  ON public.shop_views FOR INSERT
  WITH CHECK (true);

-- SELECT: เฉพาะ merchant เจ้าของร้านดู analytics ได้
-- shop_id ใน shop_views อาจเป็น:
--   1. shop_name  → mp.shop_name = shop_views.shop_id
--   2. user UUID  → auth.uid()::text = shop_views.shop_id
CREATE POLICY "Merchants can read own shop views"
  ON public.shop_views FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.merchant_profiles mp
      WHERE mp.user_id = auth.uid()
        AND (
          mp.shop_name        = shop_views.shop_id
          OR auth.uid()::text = shop_views.shop_id
        )
    )
  );

-- Explicit deny UPDATE/DELETE (defense in depth)
-- ⚠️  DELETE ผ่านได้เฉพาะ postgres/service_role (BYPASSRLS) เท่านั้น
-- ⚠️  pg_cron cleanup ต้องรันใน postgres role — ห้ามใช้ anon/authenticated key
-- ⚠️  Supabase Dashboard SQL Editor ใช้ postgres role โดยตรง — ทดสอบ manual delete ได้
CREATE POLICY "No direct updates to shop views"
  ON public.shop_views FOR UPDATE
  USING (false);

CREATE POLICY "No direct deletes to shop views"
  ON public.shop_views FOR DELETE
  USING (false);

-- ───────────────────────────────────────────────────────────
-- Grants
-- ───────────────────────────────────────────────────────────

-- REVOKE ALL ก่อน เพื่อล้าง stale permissions จาก test/ก่อนหน้า
REVOKE ALL ON public.shop_views FROM anon, authenticated;

-- [Race window mitigation] ยังไม่ grant INSERT ในขั้นตอนนี้
-- INSERT จะเปิดหลัง Section 2 สร้าง UNIQUE indexes เสร็จแล้วเท่านั้น
-- เพื่อป้องกัน duplicate rows เข้ามาในช่วง COMMIT → index build
-- authenticated ได้ SELECT ก่อน เพื่อให้ merchant dashboard ยังใช้งานได้ระหว่าง deploy
GRANT SELECT ON public.shop_views TO authenticated;

COMMIT;


-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  SECTION 2: Indexes (ต้องรันนอก transaction)                    ║
-- ║  CONCURRENTLY ไม่รองรับใน transaction block                      ║
-- ║  = ไม่ block INSERT/SELECT ขณะ build — safe บน production table ║
-- ╚═══════════════════════════════════════════════════════════════════╝

-- merchant dashboard query: shop_id + ช่วงเวลา
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shop_views_shop_id
  ON public.shop_views(shop_id, viewed_at DESC);

-- pg_cron retention DELETE: WHERE viewed_at < now() - interval '90 days'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shop_views_viewed_at
  ON public.shop_views(viewed_at);

-- logged-in dedup: 1 user = 1 view ต่อ 1 ร้าน
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_shop_views_user_shop
  ON public.shop_views(user_id, shop_id)
  WHERE user_id IS NOT NULL;

-- anonymous dedup ระดับ DB: ป้องกัน spam เมื่อ localStorage ถูก bypass
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_shop_views_session_shop
  ON public.shop_views(session_id, shop_id)
  WHERE user_id IS NULL AND session_id IS NOT NULL;

-- Restore INSERT หลัง UNIQUE indexes build เสร็จ — ปิด race window
-- (ทุก duplicate ที่เข้ามาหลังจากนี้จะถูก reject ด้วย index)
GRANT INSERT ON public.shop_views TO anon;
GRANT INSERT ON public.shop_views TO authenticated;


-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  SECTION 3: Supporting index บน merchant_profiles               ║
-- ║  !! รันแยกต่างหากในช่วง low-traffic !!                          ║
-- ║  CONCURRENTLY ไม่รองรับใน DO block — ต้องรันเป็น standalone      ║
-- ║  ถ้า merchant_profiles ยังไม่มี: รัน AFTER merchant_profiles migration ║
-- ╚═══════════════════════════════════════════════════════════════════╝

-- [PERF] SELECT policy ใช้ subquery EXISTS บน merchant_profiles
-- index นี้ทำให้ Postgres ไม่ต้อง seq scan ทุกครั้งที่ merchant query shop_views
--
-- ⚠️  Section นี้เป็น standalone — error จากที่นี่ไม่กระทบ Section 1-2 ที่ COMMIT แล้ว
-- ⚠️  ถ้า error "relation does not exist" → ข้ามได้ แล้วรัน section นี้หลัง merchant_profiles migration
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_merchant_profiles_user_shop
  ON public.merchant_profiles(user_id, shop_name);
-- ถ้า merchant_profiles ยังไม่มี statement นี้จะ error — รัน AFTER merchant_profiles migration


-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  SECTION 4: VALIDATE CONSTRAINTS                                ║
-- ║  !! รันแยกต่างหากในช่วง low-traffic หลัง deploy เสร็จแล้ว !!   ║
-- ║  validates existing rows ทีละ batch — ไม่ block INSERT          ║
-- ╚═══════════════════════════════════════════════════════════════════╝

-- uncomment และรันแยกต่างหากหลัง Section 1-3 สำเร็จแล้ว:
--
-- ALTER TABLE public.shop_views VALIDATE CONSTRAINT chk_shop_views_identity;
-- ALTER TABLE public.shop_views VALIDATE CONSTRAINT chk_session_id_format;
-- ALTER TABLE public.shop_views VALIDATE CONSTRAINT chk_shop_id_length;
-- ALTER TABLE public.shop_views VALIDATE CONSTRAINT chk_viewed_at_not_future;

-- ── Monitoring: ตรวจสอบ constraints ที่ยังเป็น NOT VALID ────────────
-- รัน query นี้หลัง deploy เพื่อยืนยันว่า Section 4 ถูก run แล้ว
-- ถ้าคืนผลลัพธ์ = ยังมี constraint ที่ยังไม่ได้ validate (ต้องรัน Section 4)
--
-- SELECT conname, convalidated
--   FROM pg_constraint
--   WHERE conrelid = 'public.shop_views'::regclass
--     AND NOT convalidated;


-- ─────────────────────────────────────────────────────────────────────
-- Data Retention  (!! ตั้งค่าผ่าน Supabase Dashboard → Database → pg_cron !!)
-- ─────────────────────────────────────────────────────────────────────
--
-- ลบข้อมูลที่เก่ากว่า 90 วันเพื่อไม่ให้ table โตไม่หยุด
-- idx_shop_views_viewed_at รองรับ query นี้โดยตรง (ไม่ full scan):
--
--   DELETE FROM public.shop_views
--   WHERE viewed_at < now() - interval '90 days';
--
-- ตั้งค่า pg_cron (เปิด extension ใน Dashboard → Database → Extensions ก่อน):
--
--   SELECT cron.schedule(
--     'cleanup-old-shop-views',
--     '0 3 * * *',
--     $$DELETE FROM public.shop_views
--       WHERE viewed_at < now() - interval '90 days';$$
--   );
