export interface Promotion {
  id: string;
  shop_name: string;
  merchantId?: string; // For linking to merchant account
  title: string;
  description: string;
  price: number;
  discount_rate: number;
  category: string;
  is_verified: boolean;
  is_sponsored: boolean;
  isPro?: boolean; // PRO Tier merchant status
  location: string;
  search_volume: number;
  image: string;
  imageUrl?: string; // For real images
  gallery?: string[]; // Multiple images
  valid_until: string;
  views?: number;
  saves?: number;
  tags?: string[];
  stockStatus?: 'available' | 'out_of_stock';
  stockQuantity?: number;
  lastStockUpdate?: string;
  // Flash Sale fields
  isFlashSale?: boolean;
  flashPrice?: number;
  flashEndTime?: Date;
  flashClaimedPercentage?: number;
  // Boost fields
  is_boosted?: boolean;
  boosted_at?: string;
}

export interface MerchantStats {
  promo_id: string;
  views: number;
  saves: number;
  clicks: number;
  search_ranking: number;
}
