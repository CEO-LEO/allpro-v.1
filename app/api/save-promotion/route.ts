import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

// POST — Save a promotion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, promotionId } = body;

    if (!userId || !promotionId) {
      return NextResponse.json(
        { error: 'userId and promotionId are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from('saved_promotions')
      .upsert(
        { user_id: userId, promo_id: promotionId },
        { onConflict: 'user_id,promo_id' }
      );

    if (error) {
      console.error('[save-promotion] upsert error:', error.message);
      return NextResponse.json(
        { error: 'Unable to save promotion right now' },
        { status: 500 }
      );
    }

    const { data: rows, error: countError } = await supabase
      .from('saved_promotions')
      .select('promo_id')
      .eq('user_id', userId);

    const savedCount = countError ? 0 : rows?.length ?? 0;

    return NextResponse.json({
      success: true,
      message: 'Promotion saved',
      savedCount,
    });
  } catch (error) {
    console.error('[save-promotion] request error:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// DELETE — Unsave a promotion
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, promotionId } = body;

    if (!userId || !promotionId) {
      return NextResponse.json(
        { error: 'userId and promotionId are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from('saved_promotions')
      .delete()
      .eq('user_id', userId)
      .eq('promo_id', promotionId);

    if (error) {
      console.error('[save-promotion] delete error:', error.message);
      return NextResponse.json(
        { error: 'Unable to unsave promotion right now' },
        { status: 500 }
      );
    }

    const { data: rows } = await supabase
      .from('saved_promotions')
      .select('promo_id')
      .eq('user_id', userId);

    return NextResponse.json({
      success: true,
      message: 'Promotion unsaved',
      savedCount: rows?.length ?? 0,
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// GET — Get saved promotions for a user
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId query parameter is required' },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('saved_promotions')
    .select('promo_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[save-promotion] fetch error:', error.message);
    return NextResponse.json(
      { error: 'Unable to fetch saved promotions right now' },
      { status: 500 }
    );
  }

  const savedIds = (data || []).map((row) => row.promo_id);

  return NextResponse.json({
    success: true,
    savedPromotionIds: savedIds,
    count: savedIds.length,
  });
}
