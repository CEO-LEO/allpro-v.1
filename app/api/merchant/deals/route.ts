import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createDealSchema, dealQuerySchema } from '@/lib/deals/validation';

// ============================================================
// GET /api/merchant/deals?merchant_id=xxx&status=active&page=1
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // 2. Parse query params
    const { searchParams } = new URL(request.url);
    const queryInput = {
      merchant_id: searchParams.get('merchant_id') || '',
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      search: searchParams.get('search') || undefined,
    };

    const parsed = dealQuerySchema.safeParse(queryInput);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues.map(i => i.message).join('; '), code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const { merchant_id, status, page, pageSize } = parsed.data;

    // 3. Verify merchant ownership
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id, owner_id')
      .eq('id', merchant_id)
      .single();

    if (!merchant || merchant.owner_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied', code: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    // 4. Fetch deals with branch info via RPC
    const { data: deals, error } = await supabase.rpc('fn_get_merchant_deals', {
      p_merchant_id: merchant_id,
      p_status: status || null,
      p_limit: pageSize,
      p_offset: (page - 1) * pageSize,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message, code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    // 5. Get total count
    let countQuery = supabase
      .from('promotions')
      .select('id', { count: 'exact', head: true })
      .eq('merchant_id', merchant_id);

    if (status) countQuery = countQuery.eq('status', status);
    const { count } = await countQuery;

    return NextResponse.json({
      success: true,
      data: {
        deals: Array.isArray(deals) ? deals : [],
        total: count || 0,
        page,
        pageSize,
        hasMore: page * pageSize < (count || 0),
      },
    });
  } catch (err) {
    console.error('[GET /api/merchant/deals]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/merchant/deals — Create a new deal
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // 2. Parse & validate body
    const body = await request.json();
    const parsed = createDealSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 3. Verify merchant ownership
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id, owner_id, status')
      .eq('id', data.merchant_id)
      .single();

    if (!merchant || merchant.owner_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied', code: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    if (merchant.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Merchant account is not active', code: 'MERCHANT_INACTIVE' },
        { status: 403 }
      );
    }

    // 4. Call atomic RPC
    const { data: result, error } = await supabase.rpc('fn_create_deal', {
      p_merchant_id:    data.merchant_id,
      p_title:          data.title,
      p_description:    data.description || null,
      p_promo_type:     data.promo_type,
      p_original_price: data.original_price || null,
      p_promo_price:    data.promo_price || null,
      p_discount_pct:   data.discount_pct || null,
      p_category:       data.category,
      p_valid_from:     data.valid_from || new Date().toISOString(),
      p_valid_until:    data.valid_until || null,
      p_promo_rules:    data.promo_rules || {},
      p_metadata:       data.metadata || {},
      p_quota_total:    data.quota_total || null,
      p_image_url:      data.image_url || null,
      p_tags:           data.tags || [],
      p_status:         data.status || 'draft',
      p_branch_ids:     data.branch_ids || null,
    });

    if (error) {
      console.error('[POST /api/merchant/deals] RPC error:', error);
      return NextResponse.json(
        { success: false, error: error.message, code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/merchant/deals]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
