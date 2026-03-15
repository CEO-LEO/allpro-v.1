import promotionsData from '@/data/promotions.json';
import { Promotion } from './types';

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
  
  let promotions = promotionsData as Promotion[];

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
  const promotions = promotionsData as Promotion[];
  return promotions.find(promo => promo.id === id);
}

export function getCategories(): string[] {
  const promotions = promotionsData as Promotion[];
  const categories = new Set(promotions.map(p => p.category));
  return Array.from(categories);
}

/**
 * Data Insight Engine
 * คำนวณ Search Intent ในแต่ละย่าน (สำหรับ Merchant Dashboard)
 */
export function getSearchInsights(location?: string) {
  const promotions = promotionsData as Promotion[];
  
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
