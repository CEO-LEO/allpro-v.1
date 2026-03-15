import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// ============================================================
// PATCH /api/merchant/deals/[dealId]/status
// Body: { status: 'active' | 'paused' | 'scheduled', merchant_id: string }
// ============================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    const { dealId } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status: newStatus, merchant_id } = body;

    if (!merchant_id || !newStatus) {
      return NextResponse.json(
        { success: false, error: 'merchant_id and status are required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const validStatuses = ['active', 'paused', 'scheduled'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Verify ownership
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

    // Get current deal status for transition validation
    const { data: deal } = await supabase
      .from('promotions')
      .select('id, status')
      .eq('id', dealId)
      .eq('merchant_id', merchant_id)
      .single();

    if (!deal) {
      return NextResponse.json(
        { success: false, error: 'Deal not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      draft:     ['active', 'scheduled'],
      scheduled: ['active', 'paused'],
      active:    ['paused'],
      paused:    ['active'],
    };

    const allowed = validTransitions[deal.status] || [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot transition from '${deal.status}' to '${newStatus}'. Allowed: ${allowed.join(', ') || 'none'}`,
          code: 'INVALID_TRANSITION',
        },
        { status: 422 }
      );
    }

    // Update
    const { data: updated, error: updateError } = await supabase
      .from('promotions')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', dealId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message, code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('[PATCH /api/merchant/deals/[dealId]/status]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
