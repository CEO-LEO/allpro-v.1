import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateDealSchema, promoStatusSchema } from '@/lib/deals/validation';

// ============================================================
// GET /api/merchant/deals/[dealId] — Get single deal
// ============================================================
export async function GET(
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

    // Fetch deal with branch coordinates via a single query
    const { data: deal, error } = await supabase
      .from('promotions')
      .select(`
        *,
        merchants!inner ( id, owner_id, name ),
        promotion_branches (
          branch_id,
          branches ( id, name, address, location )
        )
      `)
      .eq('id', dealId)
      .single();

    if (error || !deal) {
      return NextResponse.json(
        { success: false, error: 'Deal not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify ownership via the joined merchants table
    if ((deal as { merchants: { owner_id: string } }).merchants.owner_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied', code: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: deal });
  } catch (err) {
    console.error('[GET /api/merchant/deals/[dealId]]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH /api/merchant/deals/[dealId] — Update deal
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
    const parsed = updateDealSchema.safeParse({ ...body, id: dealId });
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

    const { id, merchant_id, branch_ids, ...updates } = parsed.data;

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

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        updatePayload[key] = value;
      }
    }

    // Auto-recalculate discount_pct
    if (updates.original_price != null && updates.promo_price != null && updates.original_price > 0) {
      updatePayload.discount_pct =
        Math.round(((updates.original_price - updates.promo_price) / updates.original_price) * 1000) / 10;
    }

    const { data: updated, error: updateError } = await supabase
      .from('promotions')
      .update(updatePayload)
      .eq('id', dealId)
      .eq('merchant_id', merchant_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message, code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    // Update branch links if provided
    if (branch_ids !== undefined) {
      const { error: deleteError } = await supabase.from('promotion_branches').delete().eq('promotion_id', dealId);
      if (deleteError) {
        console.error('[PATCH branch delete]', deleteError);
      }

      if (branch_ids.length > 0) {
        const { data: validBranches } = await supabase
          .from('branches')
          .select('id')
          .eq('merchant_id', merchant_id)
          .in('id', branch_ids);

        if (validBranches?.length) {
          const { error: insertError } = await supabase
            .from('promotion_branches')
            .insert(validBranches.map(b => ({ promotion_id: dealId, branch_id: b.id })));
          if (insertError) {
            console.error('[PATCH branch insert]', insertError);
          }
        }
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('[PATCH /api/merchant/deals/[dealId]]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/merchant/deals/[dealId] — Archive deal (soft delete)
// ============================================================
export async function DELETE(
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

    // Get merchant_id from query param
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

    // Soft delete => archive
    const { error } = await supabase
      .from('promotions')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', dealId)
      .eq('merchant_id', merchantId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message, code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { archived: true } });
  } catch (err) {
    console.error('[DELETE /api/merchant/deals/[dealId]]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
