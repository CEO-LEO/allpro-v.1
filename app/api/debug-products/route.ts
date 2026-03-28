import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';

// GET /api/debug-products — returns all products from Supabase
export async function GET(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ data: [], error: 'Supabase not configured' });
  }

  const { searchParams } = new URL(request.url);
  const debug = searchParams.get('debug') === '1';

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ data: [], error: error.message });
    }

    // Resolve image URLs server-side so clients get full URLs
    const resolved = (data || []).map(p => ({
      ...p,
      image: resolveImageUrl(p.image, getCategoryFallbackImage(p.category)),
    }));

    if (debug) {
      // Debug mode: show raw image values and resolved URLs
      const debugData = (data || []).map(p => ({
        id: p.id,
        title: p.title,
        raw_image: p.image,
        resolved_image: resolveImageUrl(p.image, getCategoryFallbackImage(p.category)),
        category: p.category,
      }));
      return NextResponse.json({ debug: debugData });
    }

    return NextResponse.json({ data: resolved });
  } catch (err: unknown) {
    return NextResponse.json({ data: [], error: String(err) });
  }
}
