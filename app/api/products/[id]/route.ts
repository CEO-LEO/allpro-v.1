import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase';
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';

// Server-side client — prefer service role key to bypass RLS
function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, serviceKey || anonKey);
}

// GET /api/products/[id] — fetch a single product with resolved image URL
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isSupabaseConfigured) {
    return NextResponse.json({ data: null, error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = getServerClient();

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 });
    }

    // Resolve image URL server-side
    const resolvedImage = resolveImageUrl(data.image, getCategoryFallbackImage(data.category));

    return NextResponse.json({
      data: {
        ...data,
        image: resolvedImage,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ data: null, error: String(err) }, { status: 500 });
  }
}
