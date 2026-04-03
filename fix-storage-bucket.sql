-- =============================================
-- Fix Storage Bucket for Image Uploads
-- =============================================
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- This creates the 'promotions' storage bucket and allows public uploads
-- =============================================

-- 1. Create bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'promotions',
  'promotions',
  true,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- 2. Allow anyone to view/download files (public bucket)
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'promotions');

-- 3. Allow anyone to upload files (for anon client uploads)
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'promotions');

-- 4. Allow anyone to update their files
DROP POLICY IF EXISTS "Allow updates" ON storage.objects;
CREATE POLICY "Allow updates" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'promotions');

-- 5. Allow anyone to delete files
DROP POLICY IF EXISTS "Allow deletes" ON storage.objects;
CREATE POLICY "Allow deletes" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'promotions');
