import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabase(authHeader?: string | null) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  });
}

// GET /api/community-posts/comments?post_id=xxx
export async function GET(req: NextRequest) {
  try {
    const postId = req.nextUrl.searchParams.get('post_id');
    if (!postId) {
      return NextResponse.json({ comments: [] });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch comments:', error);
      return NextResponse.json({ comments: [] });
    }

    return NextResponse.json({ comments: data || [] });
  } catch (e) {
    console.error('Comments GET error:', e);
    return NextResponse.json({ comments: [] });
  }
}

// POST /api/community-posts/comments
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
    const { post_id, content, display_name, username, avatar_url } = body;

    if (!post_id || !content?.trim()) {
      return NextResponse.json({ error: 'post_id and content required' }, { status: 400 });
    }

    const { data: comment, error: insertError } = await supabase
      .from('community_comments')
      .insert({
        post_id,
        user_id: user.id,
        display_name: display_name || 'Anonymous',
        username: username || 'user',
        avatar_url: avatar_url || null,
        content: content.trim(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create comment:', insertError);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    return NextResponse.json({ comment });
  } catch (e) {
    console.error('Comments POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
