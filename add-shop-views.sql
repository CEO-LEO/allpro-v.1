-- ═══════════════════════════════════════════════════════════
-- shop_views table
-- บันทึกการเข้าชมหน้าโปรไฟล์ร้านค้า (ระดับร้าน ไม่ใช่สินค้า)
-- Dedup: 1 user × 1 shop = 1 แถว (ทำ dedup ใน application layer)
-- ═══════════════════════════════════════════════════════════

create table if not exists public.shop_views (
  id          uuid primary key default gen_random_uuid(),
  shop_id     text not null,          -- shopId จาก URL (shop name หรือ merchant UUID)
  user_id     uuid references auth.users(id) on delete set null,
  viewed_at   timestamptz not null default now(),
  source      text default 'shop_profile'
);

-- index สำหรับ merchant dashboard query (shop_id + viewed_at range scan)
create index if not exists idx_shop_views_shop_id
  on public.shop_views(shop_id, viewed_at desc);

-- index สำหรับ dedup check (user_id + shop_id)
create index if not exists idx_shop_views_user_shop
  on public.shop_views(user_id, shop_id)
  where user_id is not null;

-- ───────────────────────────────────────────────────────────
-- Row Level Security
-- ───────────────────────────────────────────────────────────
alter table public.shop_views enable row level security;

-- ทุกคน (รวม anonymous) insert ได้ — trackShopView() จะ insert
create policy "Anyone can insert shop views"
  on public.shop_views for insert
  with check (true);

-- เฉพาะ merchant เจ้าของร้านดู analytics ของตัวเองได้
-- (ตรวจสอบโดยเปรียบ shop_id กับ auth.uid() หรือ shopName)
create policy "Merchants can read own shop views"
  on public.shop_views for select
  using (
    auth.uid() is not null
    and (
      shop_id = auth.uid()::text
      or user_id = auth.uid()
    )
  );
