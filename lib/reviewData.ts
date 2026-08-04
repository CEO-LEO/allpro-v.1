export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  isVerifiedBuyer: boolean;
  comment: string;
  photos: string[];
  helpful: number;
  timestamp: Date;
  dealValue?: string;
}

// Real eligibility check — a user can review a product only if they actually
// redeemed it in-store (promotion_claims.status = 'used'), not just claimed
// it into their wallet. Previously this always returned true for anyone.
export async function canUserReview(productId: string): Promise<boolean> {
  const { supabase, isSupabaseConfigured } = await import('./supabase');
  if (!isSupabaseConfigured) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { count } = await supabase
    .from('promotion_claims')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .eq('status', 'used');

  return (count || 0) > 0;
}
