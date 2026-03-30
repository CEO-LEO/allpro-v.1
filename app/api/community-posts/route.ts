import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabase(authHeader?: string | null) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  });
}

// GET /api/community-posts — fetch all posts
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const tag = req.nextUrl.searchParams.get('tag');
    const isBrand = req.nextUrl.searchParams.get('is_brand');

    let query = supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (tag && tag !== 'ทั้งหมด') {
      query = query.eq('tag', tag);
    }
    if (isBrand !== null && isBrand !== undefined) {
      query = query.eq('is_brand', isBrand === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch community posts:', error);
      return NextResponse.json({ posts: [] });
    }

    return NextResponse.json({ posts: data || [] });
  } catch (e) {
    console.error('Community posts GET error:', e);
    return NextResponse.json({ posts: [] });
  }
}

// POST /api/community-posts — create a new post
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase(authHeader);

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const content = formData.get('content') as string;
    const tag = formData.get('tag') as string;
    const location = formData.get('location') as string | null;
    const placeId = formData.get('place_id') as string | null;
    const lat = formData.get('lat') as string | null;
    const lng = formData.get('lng') as string | null;
    const displayName = formData.get('display_name') as string || 'Anonymous';
    const username = formData.get('username') as string || 'user';
    const avatarUrl = formData.get('avatar_url') as string | null;
    const imageFile = formData.get('image') as File | null;

    if (!content?.trim() || !tag) {
      return NextResponse.json({ error: 'Content and tag are required' }, { status: 400 });
    }

    // Upload image if provided
    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('communinty-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Image upload failed:', uploadError);
        // Continue without image rather than failing
      } else {
        const { data: urlData } = supabase.storage
          .from('communinty-images')
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }

    // Insert post
    const { data: post, error: insertError } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        display_name: displayName,
        username: username,
        avatar_url: avatarUrl,
        content: content.trim(),
        image_url: imageUrl,
        location: location?.trim() || null,
        place_id: placeId || null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        tag: tag,
        is_brand: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create post:', insertError);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    return NextResponse.json({ post });
  } catch (e) {
    console.error('Community posts POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
