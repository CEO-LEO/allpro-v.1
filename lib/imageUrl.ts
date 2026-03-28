import { supabase, isSupabaseConfigured } from './supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const STORAGE_BUCKET = 'promotions';

/**
 * Resolve an image value to a displayable URL.
 *
 * The `image` column in the DB may contain:
 *   1. A full HTTPS URL (Unsplash, Supabase public URL, etc.)  → return as-is
 *   2. A Supabase Storage path like "merchants/123/img.png"     → convert to public URL
 *   3. A base64 data URI "data:image/..."                       → return as-is
 *   4. null / undefined / empty string                          → return fallback
 */
export function resolveImageUrl(image: string | null | undefined, fallback?: string): string {
  if (!image || image.trim() === '') {
    return fallback || CATEGORY_IMAGES.Other;
  }

  // Blob URLs are ephemeral and won't survive page reload — treat as missing
  if (image.startsWith('blob:')) {
    return fallback || CATEGORY_IMAGES.Other;
  }

  // Already a full URL or data URI — use as-is
  if (
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:')
  ) {
    return image;
  }

  // Starts with "/" — treat as local path
  if (image.startsWith('/')) {
    return image;
  }

  // Otherwise it's a Supabase Storage path → build public URL
  if (isSupabaseConfigured && SUPABASE_URL) {
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(image);
    return data.publicUrl;
  }

  // Fallback: construct URL manually
  if (SUPABASE_URL) {
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${image}`;
  }

  return fallback || '';
}

/**
 * Category-based fallback images for products without an uploaded image.
 */
const CATEGORY_IMAGES: Record<string, string> = {
  Food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
  Fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
  Service: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop',
  Electronics: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
  Beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
  Fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
  Travel: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
  Gadget: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
  Other: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop',
};

export function getCategoryFallbackImage(category?: string): string {
  return CATEGORY_IMAGES[category || ''] || CATEGORY_IMAGES.Other;
}
