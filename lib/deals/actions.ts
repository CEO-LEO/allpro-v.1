'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createDealSchema, updateDealSchema, dealQuerySchema } from './validation';
import type { ActionResult, Deal, DealWithBranches, PaginatedDeals } from './types';

// ============================================================
// Server Actions — Merchant Deal Management
// These run on the server with full auth context from cookies.
// ============================================================

/**
 * Verify the current user owns the specified merchant account.
 * Returns the user ID or throws.
 */
async function verifyMerchantOwnership(merchantId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('AUTH_REQUIRED');
  }

  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id, owner_id, status')
    .eq('id', merchantId)
    .single();

  if (merchantError || !merchant) {
    throw new Error('MERCHANT_NOT_FOUND');
  }

  if (merchant.owner_id !== user.id) {
    throw new Error('ACCESS_DENIED');
  }

  if (merchant.status !== 'active') {
    throw new Error('MERCHANT_INACTIVE');
  }

  return { userId: user.id, supabase };
}

// ============================================================
// 1. CREATE DEAL
//    Uses the fn_create_deal RPC for atomic insert + branch link
// ============================================================

export async function createDeal(input: unknown): Promise<ActionResult<DealWithBranches>> {
  try {
    // Validate input
    const parsed = createDealSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
        code: 'VALIDATION_ERROR',
      };
    }

    const data = parsed.data;

    // Verify ownership
    const { supabase } = await verifyMerchantOwnership(data.merchant_id);

    // Call the atomic RPC function
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
      console.error('[createDeal] RPC error:', error);
      return {
        success: false,
        error: error.message,
        code: 'DB_ERROR',
      };
    }

    return {
      success: true,
      data: result as DealWithBranches,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      error: message,
      code: message, // AUTH_REQUIRED, ACCESS_DENIED, etc.
    };
  }
}

// ============================================================
// 2. UPDATE DEAL
// ============================================================

export async function updateDeal(input: unknown): Promise<ActionResult<Deal>> {
  try {
    const parsed = updateDealSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
        code: 'VALIDATION_ERROR',
      };
    }

    const { id, merchant_id, branch_ids, ...updates } = parsed.data;

    const { supabase } = await verifyMerchantOwnership(merchant_id);

    // Verify the deal belongs to this merchant
    const { data: existing, error: fetchError } = await supabase
      .from('promotions')
      .select('id, merchant_id')
      .eq('id', id)
      .eq('merchant_id', merchant_id)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: 'Deal not found', code: 'NOT_FOUND' };
    }

    // Build update payload — only include fields that were provided
    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined)          updatePayload.title = updates.title;
    if (updates.description !== undefined)    updatePayload.description = updates.description;
    if (updates.promo_type !== undefined)     updatePayload.promo_type = updates.promo_type;
    if (updates.original_price !== undefined) updatePayload.original_price = updates.original_price;
    if (updates.promo_price !== undefined)    updatePayload.promo_price = updates.promo_price;
    if (updates.discount_pct !== undefined)   updatePayload.discount_pct = updates.discount_pct;
    if (updates.category !== undefined)       updatePayload.category = updates.category;
    if (updates.valid_from !== undefined)     updatePayload.valid_from = updates.valid_from;
    if (updates.valid_until !== undefined)    updatePayload.valid_until = updates.valid_until;
    if (updates.promo_rules !== undefined)    updatePayload.promo_rules = updates.promo_rules;
    if (updates.image_url !== undefined)      updatePayload.image_url = updates.image_url;
    if (updates.tags !== undefined)           updatePayload.tags = updates.tags;
    if (updates.quota_total !== undefined)    updatePayload.quota_total = updates.quota_total;
    if (updates.status !== undefined)         updatePayload.status = updates.status;

    // Recalculate discount if prices changed
    const origPrice = updates.original_price ?? undefined;
    const promoPrice = updates.promo_price ?? undefined;
    if (origPrice != null && promoPrice != null && origPrice > 0) {
      updatePayload.discount_pct = Math.round(((origPrice - promoPrice) / origPrice) * 100 * 10) / 10;
    }

    const { data: updated, error: updateError } = await supabase
      .from('promotions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message, code: 'DB_ERROR' };
    }

    // Update branch linkages if branch_ids provided
    if (branch_ids !== undefined) {
      // Clear existing links
      await supabase
        .from('promotion_branches')
        .delete()
        .eq('promotion_id', id);

      // Insert new links (only branches owned by this merchant)
      if (branch_ids.length > 0) {
        const { data: validBranches } = await supabase
          .from('branches')
          .select('id')
          .eq('merchant_id', merchant_id)
          .in('id', branch_ids);

        if (validBranches && validBranches.length > 0) {
          await supabase
            .from('promotion_branches')
            .insert(
              validBranches.map(b => ({
                promotion_id: id,
                branch_id: b.id,
              }))
            );
        }
      }
    }

    return { success: true, data: updated as Deal };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message, code: message };
  }
}

// ============================================================
// 3. DELETE (ARCHIVE) DEAL
// ============================================================

export async function archiveDeal(
  dealId: string,
  merchantId: string
): Promise<ActionResult> {
  try {
    const { supabase } = await verifyMerchantOwnership(merchantId);

    const { error } = await supabase
      .from('promotions')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', dealId)
      .eq('merchant_id', merchantId);

    if (error) {
      return { success: false, error: error.message, code: 'DB_ERROR' };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message, code: message };
  }
}

// ============================================================
// 4. GET DEALS (paginated, filterable)
//    Uses the fn_get_merchant_deals RPC
// ============================================================

export async function getMerchantDeals(input: unknown): Promise<ActionResult<PaginatedDeals>> {
  try {
    const parsed = dealQuerySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map(i => i.message).join('; '),
        code: 'VALIDATION_ERROR',
      };
    }

    const { merchant_id, status, page, pageSize, search } = parsed.data;
    const { supabase } = await verifyMerchantOwnership(merchant_id);

    // Use RPC for complex query with branch data
    const { data: deals, error } = await supabase.rpc('fn_get_merchant_deals', {
      p_merchant_id: merchant_id,
      p_status: status || null,
      p_limit: pageSize,
      p_offset: (page - 1) * pageSize,
    });

    if (error) {
      return { success: false, error: error.message, code: 'DB_ERROR' };
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('promotions')
      .select('id', { count: 'exact', head: true })
      .eq('merchant_id', merchant_id);

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    const { count } = await countQuery;
    const total = count || 0;

    // Parse the JSONB array result
    const parsedDeals: Deal[] = Array.isArray(deals) ? deals : (deals || []);

    // Client-side search filter (for title/description)
    let filtered = parsedDeals;
    if (search) {
      const q = search.toLowerCase();
      filtered = parsedDeals.filter(
        (d: Deal) =>
          d.title?.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      data: {
        deals: filtered,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message, code: message };
  }
}

// ============================================================
// 5. GET SINGLE DEAL
// ============================================================

export async function getDeal(
  dealId: string,
  merchantId: string
): Promise<ActionResult<DealWithBranches>> {
  try {
    const { supabase } = await verifyMerchantOwnership(merchantId);

    const { data: deal, error } = await supabase
      .from('promotions')
      .select(`
        *,
        promotion_branches (
          branch_id,
          branches (
            id, name, address, location
          )
        )
      `)
      .eq('id', dealId)
      .eq('merchant_id', merchantId)
      .single();

    if (error || !deal) {
      return { success: false, error: 'Deal not found', code: 'NOT_FOUND' };
    }

    // Transform the nested branch data
    const branches = (deal.promotion_branches || []).map((pb: {
      branch_id: string;
      branches: { id: string; name: string; address: string; location: unknown };
    }) => ({
      branch_id: pb.branch_id,
      name: pb.branches?.name || '',
      address: pb.branches?.address || '',
      lat: 0, // PostGIS geography needs ST_Y/ST_X — use RPC for actual coords
      lng: 0,
    }));

    return {
      success: true,
      data: {
        ...deal,
        branches,
        branch_count: branches.length,
      } as DealWithBranches,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message, code: message };
  }
}

// ============================================================
// 6. TOGGLE DEAL STATUS (pause/resume/activate)
// ============================================================

export async function toggleDealStatus(
  dealId: string,
  merchantId: string,
  newStatus: 'active' | 'paused' | 'scheduled'
): Promise<ActionResult<Deal>> {
  try {
    const { supabase } = await verifyMerchantOwnership(merchantId);

    const { data: deal, error: fetchError } = await supabase
      .from('promotions')
      .select('id, status')
      .eq('id', dealId)
      .eq('merchant_id', merchantId)
      .single();

    if (fetchError || !deal) {
      return { success: false, error: 'Deal not found', code: 'NOT_FOUND' };
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
      return {
        success: false,
        error: `Cannot transition from '${deal.status}' to '${newStatus}'`,
        code: 'INVALID_TRANSITION',
      };
    }

    const { data: updated, error: updateError } = await supabase
      .from('promotions')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', dealId)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message, code: 'DB_ERROR' };
    }

    return { success: true, data: updated as Deal };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message, code: message };
  }
}

// ============================================================
// 7. GET MERCHANT BRANCHES (for deal creation form)
// ============================================================

export async function getMerchantBranches(
  merchantId: string
): Promise<ActionResult<{ id: string; name: string; address: string }[]>> {
  try {
    const { supabase } = await verifyMerchantOwnership(merchantId);

    const { data, error } = await supabase
      .from('branches')
      .select('id, name, address')
      .eq('merchant_id', merchantId)
      .order('name');

    if (error) {
      return { success: false, error: error.message, code: 'DB_ERROR' };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message, code: message };
  }
}
