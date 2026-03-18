export type StoreCategory = 'convenience' | 'supermarket' | 'coffee' | 'food' | 'fashion';

export interface Store {
  id: string;
  name: string;
  brand: string;
  category: StoreCategory;
  lat: number;
  lng: number;
  brandLogo: string;
  activePromos: number;
  address: string;
  distance?: number;
  stockStatus?: 'available' | 'out_of_stock';
  stockQuantity?: number;
  lastStockUpdate?: string;
  bestDeal?: {
    title: string;
    discount: number;
    imageUrl?: string;
  };
}

// TODO: Replace with API call -> GET /api/stores
export const mockStores: Store[] = [];
