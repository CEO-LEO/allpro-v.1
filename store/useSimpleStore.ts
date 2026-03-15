import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// ============================================
// TYPE DEFINITIONS (แบบเรียบง่าย)
// ============================================

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number; // Mapping from original_price
  image: string;
  category: string;
  shopName: string; // Mapping from shop_name
  description: string;
}

interface AppState {
  products: Product[];
  isLoading: boolean;
  
  // Actions
  fetchProducts: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
}

// ============================================
// ZUSTAND STORE (เชื่อมต่อ Supabase)
// ============================================

export const useAppStore = create<AppState>((set, get) => ({
  products: [],
  isLoading: false,

  // ดึงข้อมูลจริงจาก Supabase
  fetchProducts: async () => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.error('❌ Error fetching products:', error);
        set({ isLoading: false });
        return;
      }

      // แปลงข้อมูลจาก Database (snake_case) เป็น App Format (camelCase)
      const formattedProducts: Product[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        originalPrice: item.original_price,
        image: item.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
        category: item.category || 'All',
        shopName: item.shop_name || 'ร้านค้า',
        description: item.description || ''
      }));

      console.log('✅ Fetched products from Supabase:', formattedProducts.length);
      set({ products: formattedProducts, isLoading: false });
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      set({ isLoading: false });
    }
  },

  // หาสินค้าตาม ID
  getProductById: (id) => get().products.find((p) => p.id === id),
}));
