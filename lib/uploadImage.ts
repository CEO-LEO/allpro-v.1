import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET = 'promotions';

/**
 * อัพโหลดรูปภาพไปยัง Supabase Storage (client-side)
 * รองรับทั้ง File object และ base64 data URI
 *
 * @returns storage path (เช่น "products/1234_abc.jpg") หรือ '' ถ้าล้มเหลว
 */
export async function uploadProductImage(
  file: File | null,
  folder = 'products'
): Promise<string> {
  if (!file || !isSupabaseConfigured) return '';

  try {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const filePath = `${folder}/${safeName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
        cacheControl: '3600',
      });

    if (error) {
      console.warn('[uploadImage] Storage upload failed:', error.message);
      return '';
    }

    console.log('[uploadImage] ✅ Uploaded:', filePath);
    return filePath;
  } catch (err) {
    console.warn('[uploadImage] Unexpected error:', err);
    return '';
  }
}

/**
 * อัพโหลดรูปภาพหลายรูป (gallery)
 */
export async function uploadGalleryImages(
  files: File[],
  folder = 'products/gallery'
): Promise<string[]> {
  if (!files.length || !isSupabaseConfigured) return [];

  const results = await Promise.allSettled(
    files.map(f => uploadProductImage(f, folder))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled' && r.value !== '')
    .map(r => r.value);
}
