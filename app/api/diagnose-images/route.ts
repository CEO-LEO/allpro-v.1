import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';

/**
 * GET /api/diagnose-images — Diagnostic endpoint to find image rendering issues
 * 
 * Checks:
 *  1. Whether products have image values in DB
 *  2. Whether storage paths resolve to accessible URLs
 *  3. Whether the storage bucket exists and is public
 *  4. Whether resolved URLs return 200
 */
export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    supabaseConfigured: isSupabaseConfigured,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ set' : '❌ missing',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ set' : '❌ missing',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ set' : '❌ missing',
  };

  if (!isSupabaseConfigured) {
    return NextResponse.json({ ...diagnostics, error: 'Supabase not configured' });
  }

  try {
    // 1. Fetch products with raw image values
    const { data: products, error: fetchErr } = await supabase
      .from('products')
      .select('id, title, image, category, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (fetchErr) {
      diagnostics.dbError = fetchErr.message;
      diagnostics.dbHint = fetchErr.hint || null;
      return NextResponse.json(diagnostics);
    }

    diagnostics.productCount = products?.length || 0;

    // 2. Analyze each product's image field
    const imageAnalysis = await Promise.all(
      (products || []).map(async (p) => {
        const rawImage = p.image;
        const resolved = resolveImageUrl(rawImage, getCategoryFallbackImage(p.category));
        
        let imageType = 'unknown';
        if (!rawImage || rawImage.trim() === '') imageType = 'EMPTY';
        else if (rawImage.startsWith('http')) imageType = 'full_url';
        else if (rawImage.startsWith('data:')) imageType = 'base64';
        else if (rawImage.startsWith('/')) imageType = 'local_path';
        else imageType = 'storage_path';

        // Test if the resolved URL is accessible
        let urlStatus = 'untested';
        let urlStatusCode = 0;
        if (resolved && resolved.startsWith('http')) {
          try {
            const testUrl = resolved.split('?')[0]; // Remove cache-buster for cleaner test
            const res = await fetch(testUrl, { method: 'HEAD' });
            urlStatusCode = res.status;
            urlStatus = res.ok ? '✅ accessible' : `❌ HTTP ${res.status}`;
          } catch (err) {
            urlStatus = `❌ fetch failed: ${String(err)}`;
          }
        }

        return {
          id: p.id,
          title: p.title,
          rawImage: rawImage || '(empty)',
          imageType,
          resolvedUrl: resolved,
          urlStatus,
          urlStatusCode,
        };
      })
    );

    diagnostics.imageAnalysis = imageAnalysis;

    // 3. Check storage bucket
    try {
      const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
      if (bucketErr) {
        diagnostics.storageBucketError = bucketErr.message;
      } else {
        const promotionsBucket = buckets?.find(b => b.id === 'promotions');
        diagnostics.storageBucket = promotionsBucket
          ? { exists: true, public: promotionsBucket.public, name: promotionsBucket.name }
          : { exists: false, hint: 'Run fix-storage-bucket.sql in Supabase SQL Editor' };
      }
    } catch {
      diagnostics.storageBucketError = 'Cannot list buckets (anon key may not have permission)';
    }

    // 4. Check if any files exist in storage
    try {
      const { data: files, error: listErr } = await supabase.storage
        .from('promotions')
        .list('products', { limit: 5 });
      
      diagnostics.storageFiles = listErr
        ? { error: listErr.message }
        : { count: files?.length || 0, sample: files?.slice(0, 3).map(f => f.name) };
    } catch {
      diagnostics.storageFiles = { error: 'Cannot list files' };
    }

    // 5. Summary
    const emptyImages = imageAnalysis.filter(a => a.imageType === 'EMPTY').length;
    const failedUrls = imageAnalysis.filter(a => a.urlStatusCode >= 400).length;
    const accessibleUrls = imageAnalysis.filter(a => a.urlStatus.includes('accessible')).length;
    
    diagnostics.summary = {
      totalProducts: imageAnalysis.length,
      emptyImageFields: emptyImages,
      failedUrls,
      accessibleUrls,
      diagnosis: emptyImages > 0
        ? '⚠️ Some products have empty image fields — upload may have failed silently'
        : failedUrls > 0
        ? '⚠️ Image URLs exist but return errors — check storage bucket policies'
        : accessibleUrls === imageAnalysis.length
        ? '✅ All image URLs are accessible — check frontend rendering'
        : '❓ Mixed results — see imageAnalysis for details',
    };

    return NextResponse.json(diagnostics);
  } catch (err) {
    return NextResponse.json({ ...diagnostics, error: String(err) });
  }
}
