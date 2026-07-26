import { Promotion } from './types';

let cachedPromotions: Promotion[] = [];
let cachePromise: Promise<Promotion[]> | null = null;

function getProductsApiUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api/products`;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL('/api/products', process.env.NEXT_PUBLIC_SITE_URL).toString();
  }

  return 'http://localhost:3000/api/products';
}

function normalizePromotionFromProduct(row: Record<string, unknown>): Promotion {
  const category = String(row.category || 'Other');
  const image = String(row.image || '');

  return {
    id: String(row.id || ''),
    shop_name: String(row.shop_name || row.shopName || 'ร้านค้า'),
    title: String(row.title || ''),
    description: String(row.description || ''),
    price: Number(row.price || row.promoPrice || 0),
    discount_rate: Number(row.discount || row.discount_rate || 0),
    category,
    is_verified: Boolean(row.verified || row.is_verified),
    is_sponsored: Boolean(row.is_sponsored),
    location: String(row.location || row.distance || 'ทุกสาขา'),
    search_volume: 0,
    image: image || '/placeholder-promo.jpg',
    valid_until: String(row.valid_until || row.validUntil || new Date(Date.now() + 7 * 86400000).toISOString()),
    views: Number(row.views || row.likes || 0),
    saves: 0,
    tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === 'string') : [],
  };
}

async function loadPromotionsFromSupabase(): Promise<Promotion[]> {
  if (typeof fetch !== 'function' || typeof window === 'undefined') {
    return cachedPromotions;
  }

  try {
    const res = await fetch(getProductsApiUrl());
    if (!res.ok) {
      throw new Error('Failed to load products');
    }
    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    const normalized = rows.map((row: Record<string, unknown>) => normalizePromotionFromProduct(row));
    cachedPromotions = normalized;
    return normalized;
  } catch (err) {
    console.error('[getPromotions] Supabase load failed:', err);
    return cachedPromotions;
  }
}

export async function refreshPromotions(): Promise<Promotion[]> {
  cachePromise = loadPromotionsFromSupabase();
  const result = await cachePromise;
  cachePromise = null;
  return result;
}

/**
 * SEO Ranking Engine สำหรับแพลตฟอร์ม All Pro
 * 
 * ระบบการจัดอันดับแบบ 3-Tier:
 * - Tier 1 (Sponsored): โปรโมชั่นที่ร้านค้าซื้อ SEO (อันดับ 1-3)
 * - Tier 2 (Verified): โปรโมชั่นจากเครือ CP ALL ที่ตรวจสอบแล้ว
 * - Tier 3 (General): โปรโมชั่นทั่วไปที่ร้านค้าลงฟรี
 * 
 * หมายเหตุ: ในอนาคตจะเพิ่มการเรียงตามระยะทาง (Distance-based)
 */

interface GetPromotionsParams {
  searchQuery?: string;
  category?: string;
  sortBy?: 'relevance' | 'discount' | 'recent';
}

export function getPromotions(params: GetPromotionsParams = {}): Promotion[] {
  const { searchQuery = '', category = '', sortBy = 'relevance' } = params;

  if (!cachePromise && typeof fetch === 'function' && cachedPromotions.length === 0) {
    cachePromise = loadPromotionsFromSupabase();
    cachePromise.catch(() => {
      cachePromise = null;
    });
  }

  let promotions = cachedPromotions;

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    promotions = promotions.filter(promo => 
      promo.title.toLowerCase().includes(query) ||
      promo.description.toLowerCase().includes(query) ||
      promo.shop_name.toLowerCase().includes(query) ||
      promo.category.toLowerCase().includes(query)
    );
  }

  // Filter by category
  if (category) {
    promotions = promotions.filter(promo => 
      promo.category === category
    );
  }

  // SEO Ranking Algorithm (3-Tier System)
  promotions.sort((a, b) => {
    // Tier 1: Sponsored promotions (ร้านค้าจ่ายเงินซื้อ SEO)
    if (a.is_sponsored && !b.is_sponsored) return -1;
    if (!a.is_sponsored && b.is_sponsored) return 1;

    // Tier 2: Verified promotions (CP ALL Ecosystem - Unfair Advantage)
    if (a.is_verified && !b.is_verified) return -1;
    if (!a.is_verified && b.is_verified) return 1;

    // Tier 3: General promotions (ร้านค้าลงฟรี)
    // ภายใน Tier เดียวกัน เรียงตาม search_volume (Data Insight)
    if (sortBy === 'relevance') {
      return b.search_volume - a.search_volume;
    }

    if (sortBy === 'discount') {
      return b.discount_rate - a.discount_rate;
    }

    return 0;
  });

  return promotions;
}

export function getPromotionById(id: string): Promotion | undefined {
  return cachedPromotions.find(promo => promo.id === id);
}

export function getCategories(): string[] {
  const categories = new Set(cachedPromotions.map(p => p.category));
  return Array.from(categories);
}

/**
 * Data Insight Engine
 * คำนวณ Search Intent ในแต่ละย่าน (สำหรับ Merchant Dashboard)
 */
export function getSearchInsights(location?: string) {
  const promotions = cachedPromotions;

  const locationPromos = location 
    ? promotions.filter(p => p.location.includes(location))
    : promotions;

  // คำนวณ Top Search Keywords
  const keywordVolume: Record<string, number> = {};
  
  locationPromos.forEach(promo => {
    const keywords = promo.title.split(' ');
    keywords.forEach(keyword => {
      if (keyword.length > 2) {
        keywordVolume[keyword] = (keywordVolume[keyword] || 0) + promo.search_volume;
      }
    });
  });

  const topKeywords = Object.entries(keywordVolume)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([keyword, volume]) => ({ keyword, volume }));

  return {
    total_searches: locationPromos.reduce((sum, p) => sum + p.search_volume, 0),
    top_keywords: topKeywords,
    trending_categories: getCategories(),
    location: location || 'ทั่วประเทศ'
  };
}
