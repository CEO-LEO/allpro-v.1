import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabase(authHeader?: string | null) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  });
}

// GET /api/community-posts/likes?post_id=xxx  — check if current user liked + get count
// GET /api/community-posts/likes?post_ids=a,b,c  — batch check multiple posts
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const supabase = getSupabase(authHeader || undefined);

    // Get current user (optional)
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    }

    // Batch mode
    const postIds = req.nextUrl.searchParams.get('post_ids');
    if (postIds) {
      const ids = postIds.split(',').filter(Boolean);
      const result: Record<string, { count: number; liked: boolean }> = {};

      for (const pid of ids) {
        const { count } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', pid);

        let liked = false;
        if (userId) {
          const { data } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', pid)
            .eq('user_id', userId)
            .maybeSingle();
          liked = !!data;
        }

        result[pid] = { count: count || 0, liked };
      }

      return NextResponse.json({ likes: result });
    }

    // Single post mode
    const postId = req.nextUrl.searchParams.get('post_id');
    if (!postId) {
      return NextResponse.json({ count: 0, liked: false });
    }

    const { count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    let liked = false;
    if (userId) {
      const { data } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();
      liked = !!data;
    }

    return NextResponse.json({ count: count || 0, liked });
  } catch (e) {
    console.error('Likes GET error:', e);
    return NextResponse.json({ count: 0, liked: false });
  }
}

// POST /api/community-posts/likes — toggle like
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase(authHeader);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { post_id } = body;
    if (!post_id) {
      return NextResponse.json({ error: 'post_id required' }, { status: 400 });
    }

    // Check if already liked
    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      // Unlike
      await supabase.from('post_likes').delete().eq('id', existing.id);
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await supabase.from('post_likes').insert({ post_id, user_id: user.id });
      return NextResponse.json({ liked: true });
    }
  } catch (e) {
    console.error('Likes POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
