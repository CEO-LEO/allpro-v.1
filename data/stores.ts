export interface Store {
  id: string;
  name: string;
  brand: string;
  category: string;
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
