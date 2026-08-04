-- ============================================================================
-- Real "โปรโมชั่นใกล้ฉัน" (nearby products) — homepage NearbyDeals.tsx
-- ============================================================================
-- NearbyDeals.tsx already called supabase.rpc('nearby_products', ...) but the
-- function never existed in the database, so every visitor silently fell
-- through to a client-side fallback keyed off an empty MOCK_COORDS map —
-- meaning the "nearby" section never actually showed anything real.
--
-- Distance is computed from the requesting user to the nearest REAL branch
-- of the product's shop (merchant_branches.lat/lng, the same geocoded
-- coordinates set up for the shop-address/map feature earlier). Products
-- whose shop has no geocoded branch are excluded — never fabricated.
--
-- Reuses haversine_km(), already created by add-shopping-dispatch-realtime.sql.

CREATE OR REPLACE FUNCTION public.nearby_products(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  original_price NUMERIC,
  image TEXT,
  category TEXT,
  shop_name TEXT,
  shop_id TEXT,
  discount INTEGER,
  rating NUMERIC,
  distance_km DOUBLE PRECISION
)
LANGUAGE sql STABLE AS $$
  SELECT
    p.id, p.title, p.description, p.price, p.original_price, p.image,
    p.category, p.shop_name, p.shop_id, p.discount, p.rating,
    nearest.distance_km
  FROM products p
  JOIN LATERAL (
    SELECT MIN(haversine_km(user_lat, user_lng, mb.lat, mb.lng)) AS distance_km
    FROM merchant_branches mb
    WHERE mb.user_id::text = p.shop_id
      AND mb.lat IS NOT NULL AND mb.lng IS NOT NULL
  ) nearest ON nearest.distance_km IS NOT NULL
  WHERE nearest.distance_km <= radius_km
  ORDER BY nearest.distance_km ASC
  LIMIT 50;
$$;

REVOKE ALL ON FUNCTION public.nearby_products(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.nearby_products(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO anon, authenticated;
