import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// GET /api/community-stats — real counts for the Community header stat bar
// - activeHunters: distinct users who posted/liked/commented in the last 7 days
// - postsToday: community_posts created since the start of today (UTC)
// - topContributors: distinct users with 2+ posts all-time
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [postsTodayRes, recentPostsRes, recentLikesRes, recentCommentsRes, allPostsRes] = await Promise.all([
      supabase.from('community_posts').select('*', { count: 'exact', head: true }).gte('created_at', startOfToday),
      supabase.from('community_posts').select('user_id').gte('created_at', sevenDaysAgo),
      supabase.from('post_likes').select('user_id').gte('created_at', sevenDaysAgo),
      supabase.from('community_comments').select('user_id').gte('created_at', sevenDaysAgo),
      supabase.from('community_posts').select('user_id'),
    ]);

    const postsToday = postsTodayRes.count || 0;

    const activeSet = new Set<string>();
    for (const r of recentPostsRes.data || []) activeSet.add(r.user_id as string);
    for (const r of recentLikesRes.data || []) activeSet.add(r.user_id as string);
    for (const r of recentCommentsRes.data || []) activeSet.add(r.user_id as string);

    const postCounts = new Map<string, number>();
    for (const r of allPostsRes.data || []) {
      const uid = r.user_id as string;
      postCounts.set(uid, (postCounts.get(uid) || 0) + 1);
    }
    const topContributors = Array.from(postCounts.values()).filter((c) => c >= 2).length;

    return NextResponse.json({
      activeHunters: activeSet.size,
      postsToday,
      topContributors,
    });
  } catch (e) {
    console.error('Community stats GET error:', e);
    return NextResponse.json({ activeHunters: 0, postsToday: 0, topContributors: 0 });
  }
}
