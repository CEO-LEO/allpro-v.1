import { supabase, isSupabaseConfigured } from './supabase';

// UUID v4 pattern check
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Grabs the browser's location ONLY if permission was already granted
 * elsewhere in the app (e.g. the /map page) — never triggers a new
 * permission prompt just for analytics tracking. Returns null silently
 * on any unsupported browser / denied / prompt-not-yet-answered state.
 */
async function getOpportunisticLocation(): Promise<{ lat: number; lng: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return null;
  try {
    if (!navigator.permissions?.query) return null;
    const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    if (status.state !== 'granted') return null;

    return await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 2000, maximumAge: 5 * 60 * 1000 }
      );
    });
  } catch {
    return null;
  }
}

// Haversine distance in km
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

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

    // Opportunistic only — never prompts for permission just for this
    const loc = await getOpportunisticLocation();

    const { error } = await supabase.from('promotion_views').insert({
      user_id: user?.id || null,
      product_id: productId,
      merchant_id: merchantId || null,
      source,
      lat: loc?.lat ?? null,
      lng: loc?.lng ?? null,
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
 * ยืนยันใช้คูปองด้วย PIN จริง (ต้องให้พนักงานยืนยัน ไม่ใช่ลูกค้ากดเองตรงๆ)
 * ผ่าน SECURITY DEFINER RPC เท่านั้น — client ไม่มีสิทธิ์ UPDATE status ตรงๆ อีกต่อไป
 */
export async function redeemClaimByPin(
  claimId: string,
  pin: string
): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'ระบบไม่พร้อมใช้งาน' };
  }

  try {
    const { data, error } = await supabase.rpc('redeem_claim_by_pin', {
      p_claim_id: claimId,
      p_pin: pin,
    });

    if (error) {
      console.error('[redeemClaimByPin] rpc error:', error.message);
      return { success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
    }

    const row = Array.isArray(data) ? data[0] : data;
    return { success: !!row?.success, message: row?.message || 'เกิดข้อผิดพลาด' };
  } catch {
    return { success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
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
  /** SUM(promo_price) จาก promotion_claims — ตรงกับ Revenue ที่แสดงฝั่งลูกค้า */
  totalRevenue: number;
  /** จำนวนครั้งที่มีคนเข้าชมหน้าร้านโดยตรง (shop_views table) */
  shopPageViews: number;
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
  revenue: number;
}

export interface DemographicData {
  sources: { source: string; count: number }[];
  /** Real per-hour breakdown of both views and claims (promotion_views/claims timestamps) */
  hourlyDistribution: { hour: number; views: number; claims: number }[];
  /** Real gender breakdown of viewers/claimers, joined from profiles.gender — empty if no data yet */
  genderBreakdown: { gender: string; count: number }[];
  /**
   * Real distance-from-your-nearest-branch buckets, computed only from views
   * that happened to have opportunistic geolocation attached (see
   * getOpportunisticLocation in this file) — NOT precise mall names, since
   * no such data exists; "unknown" covers views with no location captured.
   */
  locationBuckets: { label: string; count: number }[];
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
        totalRevenue: 0,
        shopPageViews: 0,
        recentActivity: [],
        productStats: [],
        dailyStats: [],
        demographicData: { sources: [], hourlyDistribution: [], genderBreakdown: [], locationBuckets: [] },
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
    // Revenue = SUM(promo_price) — ตรงกับที่หน้าร้านฝั่งลูกค้าแสดง
    const totalRevenue = claims?.reduce((sum, c) => sum + (Number(c.promo_price) || 0), 0) || 0;
    const conversionRate = totalViews > 0 ? Math.round((totalClaims / totalViews) * 10000) / 100 : 0;

    // Shop Page Views — นับจาก shop_views table (กรณีตารางยังไม่มีจะ return 0 เงียบๆ)
    let shopPageViews = 0;
    try {
      const { count: svCount } = await supabase
        .from('shop_views')
        .select('*', { count: 'exact', head: true })
        .or(`shop_id.eq.${merchantId},shop_id.eq.${shopName}`)
        .gte('viewed_at', sinceDate);
      shopPageViews = svCount || 0;
    } catch {
      // shop_views table ยังไม่ได้สร้าง — ข้ามไปได้เลย
    }

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
      const dayClaimRows = claims?.filter((c) => c.claimed_at?.startsWith(dateStr)) || [];
      const dayRevenue = dayClaimRows.reduce((sum, c) => sum + (Number(c.promo_price) || 0), 0);

      dailyStats.push({ date: dateStr, views: dayViews, claims: dayClaimRows.length, revenue: dayRevenue });
    }

    // แหล่งที่มา
    const sourceCounts: Record<string, number> = {};
    claims?.forEach((c) => {
      const src = c.source || 'direct';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    const sources = Object.entries(sourceCounts).map(([source, count]) => ({ source, count }));

    // Hourly distribution — real views AND real claims, both by hour-of-day
    const hourViewCounts: Record<number, number> = {};
    views?.forEach((v) => {
      const hour = new Date(v.viewed_at).getHours();
      hourViewCounts[hour] = (hourViewCounts[hour] || 0) + 1;
    });
    const hourClaimCounts: Record<number, number> = {};
    claims?.forEach((c) => {
      const hour = new Date(c.claimed_at).getHours();
      hourClaimCounts[hour] = (hourClaimCounts[hour] || 0) + 1;
    });
    const hourlyDistribution = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      views: hourViewCounts[h] || 0,
      claims: hourClaimCounts[h] || 0,
    }));

    // Gender breakdown — real join: unique viewer/claimer user_ids → profiles.gender
    let genderBreakdown: { gender: string; count: number }[] = [];
    try {
      const uniqueUserIds = Array.from(new Set([
        ...(views || []).map((v) => v.user_id).filter(Boolean),
        ...(claims || []).map((c) => c.user_id).filter(Boolean),
      ]));
      if (uniqueUserIds.length > 0) {
        const { data: genderRows } = await supabase
          .from('profiles')
          .select('gender')
          .in('id', uniqueUserIds);
        const genderCounts: Record<string, number> = {};
        (genderRows || []).forEach((r) => {
          const g = (r.gender || 'unknown').toLowerCase().trim() || 'unknown';
          genderCounts[g] = (genderCounts[g] || 0) + 1;
        });
        genderBreakdown = Object.entries(genderCounts).map(([gender, count]) => ({ gender, count }));
      }
    } catch (e) {
      console.warn('[Analytics] gender breakdown failed:', e);
    }

    // Location buckets — real distance-from-nearest-branch, only for views
    // that happened to have opportunistic geolocation attached. No fake
    // mall names — just honest distance bands.
    let locationBuckets: { label: string; count: number }[] = [];
    try {
      const { data: branches } = await supabase
        .from('merchant_branches')
        .select('lat, lng')
        .eq('user_id', merchantId)
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      const viewsWithLoc = (views || []).filter((v) => v.lat != null && v.lng != null);
      const buckets = { 'ภายใน 1 กม.': 0, '1-3 กม.': 0, '3-5 กม.': 0, 'เกิน 5 กม.': 0, 'ไม่ทราบตำแหน่ง': (views?.length || 0) - viewsWithLoc.length };

      if (branches && branches.length > 0 && viewsWithLoc.length > 0) {
        for (const v of viewsWithLoc) {
          const nearest = Math.min(
            ...branches.map((b) => distanceKm({ lat: v.lat, lng: v.lng }, { lat: b.lat, lng: b.lng }))
          );
          if (nearest <= 1) buckets['ภายใน 1 กม.']++;
          else if (nearest <= 3) buckets['1-3 กม.']++;
          else if (nearest <= 5) buckets['3-5 กม.']++;
          else buckets['เกิน 5 กม.']++;
        }
      } else {
        // No branch location on file — everything with a captured location
        // still counts as "unknown distance" since there's nothing to compare against
        buckets['ไม่ทราบตำแหน่ง'] = views?.length || 0;
      }

      locationBuckets = Object.entries(buckets)
        .filter(([, count]) => count > 0)
        .map(([label, count]) => ({ label, count }));
    } catch (e) {
      console.warn('[Analytics] location buckets failed:', e);
    }

    return {
      totalViews,
      totalClaims,
      totalUsed,
      conversionRate,
      totalAmountSaved,
      totalRevenue,
      shopPageViews,
      recentActivity: recentActivity.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
      productStats,
      dailyStats,
      demographicData: { sources, hourlyDistribution, genderBreakdown, locationBuckets },
    };
  } catch (err) {
    console.error('Failed to fetch merchant analytics:', err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// Public Shop Profile Stats
// ─ ใช้สำหรับ buyer-facing shop profile page
// ─ นับ Views จาก promotion_views (deduplicated per user)
// ─ นับ Revenue จาก promotion_claims (sum promo_price)
// ═══════════════════════════════════════════════════════

const UUID_RE_STATS = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ShopPublicStats {
  totalViews: number;
  totalRevenue: number;
}

/**
 * ดึงสถิติสาธารณะของร้านค้า (Views + Revenue) สำหรับหน้าโปรไฟล์ร้านฝั่งลูกค้า
 *
 * @param productIds  รายการ UUID ของสินค้าในร้าน
 *
 * Views  = จำนวนแถวใน promotion_views ที่ product_id อยู่ในร้าน
 *          (ระบบ trackPromotionView บันทึกแค่ครั้งแรกต่อ 1 user ต่อ 1 สินค้าอยู่แล้ว)
 *
 * Revenue = SUM(promo_price) จาก promotion_claims ของสินค้าในร้าน
 */
// ═══════════════════════════════════════════════════════
// Shop Page View Tracking
// ─ บันทึกการเข้าชมหน้าร้านค้า (ไม่ใช่แค่สินค้า)
// ─ dedup: 1 user / 1 shop เท่านั้น (localStorage + DB)
// ═══════════════════════════════════════════════════════

/**
 * บันทึกว่า user เข้าชมหน้าร้านนี้ครั้งแรก
 *
 * Logic dedup:
 *  1. ถ้า shopId อยู่ใน localStorage แล้ว → ข้ามเลย (เร็วสุด)
 *  2. ถ้า user ล็อกอิน → เช็ค shop_views table ว่าเคยบันทึกหรือยัง
 *  3. Insert row ใหม่ + บันทึก localStorage
 *
 * ถ้า shop_views table ยังไม่มีในฐานข้อมูล ฟังก์ชันนี้จะ fail เงียบๆ
 * (ต้องรัน add-shop-views.sql ก่อน)
 */
/**
 * Get or create a persistent anonymous session ID for this browser.
 * ใช้เป็น fingerprint สำหรับ dedup anonymous views ระดับ DB
 * (stored in localStorage key 'allpro_anon_session')
 */
function getAnonSessionId(): string | null {
  const KEY = 'allpro_anon_session';
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    // crypto.randomUUID() available in all modern browsers (Chromium 92+, Firefox 95+, Safari 15.4+)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      const id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
      return id;
    }
  } catch {
    // Private browsing mode may block localStorage — fail gracefully
  }
  return null;
}

export async function trackShopView(
  shopId: string,
  source: string = 'shop_profile'
): Promise<void> {
  // SSR guard — localStorage ใช้ได้เฉพาะฝั่ง browser
  if (typeof window === 'undefined') return;
  if (!isSupabaseConfigured || !shopId) return;

  // ── ขั้น 1: เช็ค localStorage ก่อน (ไม่ต้อง network call) ─────────────
  const LS_KEY = 'allpro_viewed_shops';
  let viewed: string[] = [];
  try {
    viewed = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    viewed = [];
  }
  if (viewed.includes(shopId)) return;

  // anonymous session ID สำหรับ DB-level dedup ของ anonymous users
  const sessionId = getAnonSessionId();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    // ── ขั้น 2: logged-in user เช็ค DB ว่าเคยบันทึกแล้วหรือยัง ──────────
    if (user) {
      const { data: existing } = await supabase
        .from('shop_views')
        .select('id')
        .eq('user_id', user.id)
        .eq('shop_id', shopId)
        .limit(1);

      if (existing && existing.length > 0) {
        // มีใน DB แล้ว → cache ใน localStorage เพื่อ skip network ครั้งต่อไป
        localStorage.setItem(LS_KEY, JSON.stringify([...viewed, shopId]));
        return;
      }
    }

    // ── ขั้น 3: Insert row ใหม่ ────────────────────────────────────────────
    // Option A: anonymous ที่ไม่มี session_id (browser เก่า) → skip insert ทั้งหมด
    // ดีกว่า insert แบบไม่มี dedup ซึ่งจะทำให้ anonymous spam ผ่าน constraint ไม่ได้
    if (!user && !sessionId) return;

    const { error } = await supabase.from('shop_views').insert({
      shop_id: shopId,
      user_id: user?.id || null,
      session_id: user ? null : sessionId,  // logged-in ไม่ต้องใช้ session_id
      viewed_at: new Date().toISOString(),
      source,
    });

    if (error) {
      if (error.code === '23505') {
        // Unique violation = race condition — row ถูก insert ไปแล้วโดย request อื่น
        // ถือว่า view บันทึกสำเร็จ → cache ใน localStorage เพื่อ skip network ครั้งต่อไป
        localStorage.setItem(LS_KEY, JSON.stringify([...viewed, shopId]));
      } else if (error.code !== '42P01') {
        // 42P01 = table not found (ยังไม่ได้รัน add-shop-views.sql) → ข้ามเงียบๆ
        console.warn('[ShopView] insert error:', error.message);
      }
      return;
    }

    // บันทึก localStorage หลัง insert สำเร็จ
    localStorage.setItem(LS_KEY, JSON.stringify([...viewed, shopId]));
  } catch (err) {
    console.warn('[ShopView] trackShopView failed:', err);
  }
}

export async function fetchShopPublicStats(
  productIds: string[]
): Promise<ShopPublicStats> {
  // กรองเฉพาะ UUID ที่ถูกต้อง (local/static product id ไม่ใช่ UUID จะ skip)
  const validIds = productIds.filter(id => UUID_RE_STATS.test(id));

  if (!isSupabaseConfigured || validIds.length === 0) {
    return { totalViews: 0, totalRevenue: 0 };
  }

  try {
    // ── Views: นับแถวทั้งหมด (1 แถว = 1 user เห็น 1 ครั้งแรก) ──────────
    const { count: viewCount, error: viewErr } = await supabase
      .from('promotion_views')
      .select('*', { count: 'exact', head: true })
      .in('product_id', validIds);

    if (viewErr) console.warn('[ShopStats] views query:', viewErr.message);

    // ── Revenue: รวม promo_price จากการกดรับโปรทั้งหมด ─────────────────
    // ใช้ view สาธารณะ (ไม่มี user_id) แทนตารางจริง เพราะหน้านี้เปิดให้
    // ผู้เยี่ยมชมที่ไม่ล็อกอินดูได้ — promotion_claims เองถูกจำกัดสิทธิ์แล้ว
    const { data: claims, error: claimErr } = await supabase
      .from('promotion_claims_public')
      .select('promo_price')
      .in('product_id', validIds);

    if (claimErr) console.warn('[ShopStats] claims query:', claimErr.message);

    const totalRevenue = claims?.reduce(
      (sum, c) => sum + (Number(c.promo_price) || 0), 0
    ) ?? 0;

    return {
      totalViews: viewCount ?? 0,
      totalRevenue,
    };
  } catch (err) {
    console.error('[ShopStats] fetchShopPublicStats failed:', err);
    return { totalViews: 0, totalRevenue: 0 };
  }
}
