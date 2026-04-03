-- ═══════════════════════════════════════════════════════════════
-- 🔧 FIX: Image rendering issues — Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════
-- This script ensures:
--   1. products table has correct image column
--   2. RLS allows public SELECT
--   3. Storage bucket 'promotions' is public
--   4. Storage policies allow public read access
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Verify products table has image column ───
ALTER TABLE products ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}';

-- ─── 2. Check what image values currently exist ───
-- Run this SELECT to see the raw data:
SELECT id, title, image, category, created_at
FROM products
ORDER BY created_at DESC
LIMIT 20;

-- ─── 3. Ensure RLS SELECT policy exists ───
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products viewable by everyone" ON products;
CREATE POLICY "Products viewable by everyone" ON products
  FOR SELECT USING (true);

-- ─── 4. Ensure storage bucket is public ───
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'promotions',
  'promotions',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- ─── 5. Ensure storage read policy exists ───
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'promotions');

-- Allow uploads (for merchant image uploads)
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'promotions');

-- ─── 6. Verify: List files in storage ───
SELECT name, bucket_id, created_at
FROM storage.objects
WHERE bucket_id = 'promotions'
ORDER BY created_at DESC
LIMIT 20;

-- ─── 7. Verify: Check products with non-empty images ───
SELECT id, title, image,
  CASE
    WHEN image IS NULL OR image = '' THEN '❌ EMPTY'
    WHEN image LIKE 'http%' THEN '✅ Full URL'
    WHEN image LIKE 'products/%' THEN '✅ Storage path'
    ELSE '❓ Unknown format: ' || LEFT(image, 50)
  END AS image_status
FROM products
ORDER BY created_at DESC
LIMIT 20;
