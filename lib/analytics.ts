import { supabase, isSupabaseConfigured } from './supabase';

// UUID v4 pattern check
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * บันทึกการดูโปรโมชั่น (Promotion View)
 * แต่ละบัญชีนับได้แค่ 1 ครั้งต่อ 1 สินค้า (deduplicated)
 */
export async function trackPromotionView(
  productId: string,
  merchantId?: string,
  source: string = 'feed'
) {
  if (!isSupabaseConfigured) return;

  // product_id ต้องเป็น UUID เพราะ foreign key reference ไป products(id)
  if (!UUID_RE.test(productId)) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();

    // ถ้าล็อกอินอยู่ ให้เช็คว่าเคยดูสินค้านี้แล้วหรือยัง
    if (user) {
      const { data: existing } = await supabase
        .from('promotion_views')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .limit(1);

      // ถ้าเคยดูแล้ว ไม่ต้องบันทึกซ้ำ
      if (existing && existing.length > 0) return;
    }

    const { error } = await supabase.from('promotion_views').insert({
      user_id: user?.id || null,
      product_id: productId,
      merchant_id: merchantId || null,
      source,
    });

    if (error) console.error('View insert error:', error.message);
  } catch (err) {
    console.error('Failed to track view:', err);
  }
}

/**
 * กดรับโปรโมชั่น (Claim Promotion)
 * สามารถกดรับได้หลายครั้งโดยไม่จำกัด
 * @returns claim ID หรือ null ถ้าล้มเหลว
 */
export async function claimPromotion(params: {
  productId: string;
  merchantId?: string;
  originalPrice: number;
  promoPrice: number;
  source?: string;
}): Promise<{ success: boolean; claimId?: string; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'ระบบไม่พร้อมใช้งาน' };
  }

  // product_id ต้องเป็น UUID
  if (!UUID_RE.test(params.productId)) {
    return { success: false, error: 'รหัสสินค้าไม่ถูกต้อง' };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อนกดรับโปรโมชั่น' };
    }

    const amountSaved = params.originalPrice - params.promoPrice;

    const { data, error } = await supabase
      .from('promotion_claims')
      .insert({
        user_id: user.id,
        product_id: params.productId,
        merchant_id: params.merchantId || null,
        original_price: params.originalPrice,
        promo_price: params.promoPrice,
        amount_saved: amountSaved,
        source: params.source || 'promo_page',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Claim error:', error);
      return { success: false, error: 'ไม่สามารถรับโปรโมชั่นได้ กรุณาลองใหม่' };
    }

    return { success: true, claimId: data.id };
  } catch (err) {
    console.error('Claim failed:', err);
    return { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
  }
}

/**
 * อัปเดตสถานะ claim เป็น "used" (ใช้จริงแล้ว)
 */
export async function markClaimAsUsed(claimId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from('promotion_claims')
      .update({ status: 'used', used_at: new Date().toISOString() })
      .eq('id', claimId);

    return !error;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════
// Merchant Dashboard Analytics Queries
// ═══════════════════════════════════════════════════════

export interface MerchantDashboardStats {
  totalViews: number;
  totalClaims: number;
  totalUsed: number;
  conversionRate: number;  // claims / views * 100
  totalAmountSaved: number;
  recentActivity: ActivityItem[];
  productStats: ProductStat[];
  dailyStats: DailyStat[];
  demographicData: DemographicData;
}

export interface ProductStat {
  productId: string;
  title: string;
  views: number;
  claims: number;
  used: number;
  conversionRate: number;
  revenue: number;
}

export interface ActivityItem {
  id: string;
  type: 'view' | 'claim' | 'used';
  title: string;
  subtitle: string;
  count: number;
  timestamp: string;
}

export interface DailyStat {
  date: string;
  views: number;
  claims: number;
}

export interface DemographicData {
  sources: { source: string; count: number }[];
  hourlyDistribution: { hour: number; count: number }[];
}

/**
 * ดึงสถิติรวมทั้งหมดสำหรับ Merchant Dashboard
 */
export async function fetchMerchantAnalytics(
  merchantId: string,
  shopName: string,
  days: number = 30
): Promise<MerchantDashboardStats | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // ดึงรายการสินค้าของ merchant
    const { data: products } = await supabase
      .from('products')
      .select('id, title, price, original_price')
      .or(`shop_id.eq.${merchantId},shop_name.eq.${shopName}`);

    if (!products || products.length === 0) {
      return {
        totalViews: 0,
        totalClaims: 0,
        totalUsed: 0,
        conversionRate: 0,
        totalAmountSaved: 0,
        recentActivity: [],
        productStats: [],
        dailyStats: [],
        demographicData: { sources: [], hourlyDistribution: [] },
      };
    }

    const productIds = products.map((p) => p.id);

    // ดึงยอด views
    const { data: views, count: viewCount } = await supabase
      .from('promotion_views')
      .select('*', { count: 'exact', head: false })
      .in('product_id', productIds)
      .gte('viewed_at', sinceDate);

    // ดึงยอด claims
    const { data: claims } = await supabase
      .from('promotion_claims')
      .select('*')
      .in('product_id', productIds)
      .gte('claimed_at', sinceDate);

    const totalViews = viewCount || 0;
    const totalClaims = claims?.length || 0;
    const totalUsed = claims?.filter((c) => c.status === 'used').length || 0;
    const totalAmountSaved = claims?.reduce((sum, c) => sum + (c.amount_saved || 0), 0) || 0;
    const conversionRate = totalViews > 0 ? Math.round((totalClaims / totalViews) * 10000) / 100 : 0;

    // สถิติรายสินค้า
    const productStats: ProductStat[] = products.map((p) => {
      const pViews = views?.filter((v) => v.product_id === p.id).length || 0;
      const pClaims = claims?.filter((c) => c.product_id === p.id) || [];
      const pUsed = pClaims.filter((c) => c.status === 'used').length;
      const pRevenue = pClaims.reduce((sum, c) => sum + (c.promo_price || 0), 0);
      return {
        productId: p.id,
        title: p.title,
        views: pViews,
        claims: pClaims.length,
        used: pUsed,
        conversionRate: pViews > 0 ? Math.round((pClaims.length / pViews) * 10000) / 100 : 0,
        revenue: pRevenue,
      };
    });

    // กิจกรรมล่าสุด
    const recentActivity: ActivityItem[] = [];

    // เพิ่ม claims ล่าสุด
    const latestClaims = claims?.sort((a, b) =>
      new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime()
    ).slice(0, 10) || [];

    for (const claim of latestClaims) {
      const product = products.find((p) => p.id === claim.product_id);
      recentActivity.push({
        id: claim.id,
        type: claim.status === 'used' ? 'used' : 'claim',
        title: claim.status === 'used' ? 'ใช้คูปองแล้ว' : 'กดรับโปรโมชั่น',
        subtitle: product?.title || 'โปรโมชั่น',
        count: 1,
        timestamp: claim.claimed_at,
      });
    }

    // สถิติรายวัน (7 วัน)
    const dailyStats: DailyStat[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayViews = views?.filter((v) => v.viewed_at?.startsWith(dateStr)).length || 0;
      const dayClaims = claims?.filter((c) => c.claimed_at?.startsWith(dateStr)).length || 0;

      dailyStats.push({ date: dateStr, views: dayViews, claims: dayClaims });
    }

    // แหล่งที่มา
    const sourceCounts: Record<string, number> = {};
    claims?.forEach((c) => {
      const src = c.source || 'direct';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    const sources = Object.entries(sourceCounts).map(([source, count]) => ({ source, count }));

    // Hourly distribution
    const hourCounts: Record<number, number> = {};
    views?.forEach((v) => {
      const hour = new Date(v.viewed_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const hourlyDistribution = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      count: hourCounts[h] || 0,
    }));

    return {
      totalViews,
      totalClaims,
      totalUsed,
      conversionRate,
      totalAmountSaved,
      recentActivity: recentActivity.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
      productStats,
      dailyStats,
      demographicData: { sources, hourlyDistribution },
    };
  } catch (err) {
    console.error('Failed to fetch merchant analytics:', err);
    return null;
  }
}
