import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Fetch all saved promo IDs for the current user from Supabase
 */
export async function fetchSavedPromoIds(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('saved_promotions')
      .select('promo_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SavedPromotions] fetch error:', error.message);
      return [];
    }

    return (data || []).map((row) => row.promo_id);
  } catch (err) {
    console.error('[SavedPromotions] fetch failed:', err);
    return [];
  }
}

/**
 * Save (bookmark) a promotion in Supabase
 */
export async function savePromotion(userId: string, promoId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from('saved_promotions')
      .upsert(
        { user_id: userId, promo_id: promoId },
        { onConflict: 'user_id,promo_id' }
      );

    if (error) {
      console.error('[SavedPromotions] save error:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[SavedPromotions] save failed:', err);
    return false;
  }
}

/**
 * Unsave (remove bookmark) a promotion in Supabase
 */
export async function unsavePromotion(userId: string, promoId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from('saved_promotions')
      .delete()
      .eq('user_id', userId)
      .eq('promo_id', promoId);

    if (error) {
      console.error('[SavedPromotions] unsave error:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[SavedPromotions] unsave failed:', err);
    return false;
  }
}
