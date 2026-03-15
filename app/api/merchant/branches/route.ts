import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// ============================================================
// GET /api/merchant/branches?merchant_id=xxx
// Returns all branches for a merchant (used in deal creation form)
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const merchantId = new URL(request.url).searchParams.get('merchant_id');
    if (!merchantId) {
      return NextResponse.json(
        { success: false, error: 'merchant_id is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id, owner_id')
      .eq('id', merchantId)
      .single();

    if (!merchant || merchant.owner_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied', code: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    // 🌍 Fetch branches with coordinates using PostGIS
    const { data: branches, error } = await supabase.rpc('fn_get_merchant_branches', {
      p_merchant_id: merchantId,
    });

    // Fallback: if RPC doesn't exist yet, use direct query
    if (error?.code === '42883') {
      // Function not found — use simple SELECT
      const { data: simpleBranches, error: simpleError } = await supabase
        .from('branches')
        .select('id, name, address, phone, operating_hours, is_active')
        .eq('merchant_id', merchantId)
        .order('name');

      if (simpleError) {
        return NextResponse.json(
          { success: false, error: simpleError.message, code: 'DB_ERROR' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data: simpleBranches || [] });
    }

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message, code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: branches || [] });
  } catch (err) {
    console.error('[GET /api/merchant/branches]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
