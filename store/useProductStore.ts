import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchSavedPromoIds, savePromotion, unsavePromotion } from '@/lib/supabase/savedPromotions';

export interface Product {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  promoPrice: number;
  discount: number;
  image: string;
  shopName: string;
  shopLogo?: string;
  category: 'Food' | 'Fashion' | 'Travel' | 'Gadget' | 'Beauty' | 'Service' | 'Electronics' | 'Fitness' | 'Other';
  verified: boolean;
  likes: number;
  isLiked: boolean;
  reviews: number;
  rating: number;
  distance?: string;
  validUntil: string;
  createdAt: string;
  tags: string[];
  isBoosted?: boolean;
  boostedAt?: string;
}

interface ProductStore {
  products: Product[];
  savedProductIds: string[];
  selectedCategory: string;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'likes' | 'isLiked' | 'reviews' | 'rating'>) => void;
  toggleLike: (id: string) => void;
  toggleSave: (id: string, userId?: string) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
  setSelectedCategory: (category: string) => void;
  boostProduct: (id: string) => void;
  unboostProduct: (id: string) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  // Supabase sync
  loadSavedFromSupabase: (userId: string) => Promise<void>;
  setSavedProductIds: (ids: string[]) => void;
}

// Mock initial data
// No mock data — all promotions come from merchant-created content or Supabase
const mockProducts: Product[] = [];

// IDs of old mock products that should be removed from persisted state
const MOCK_IDS = new Set(['mock-1','mock-2','mock-3','mock-4','mock-5','mock-6','mock-7','mock-8','mock-9','mock-10']);

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: mockProducts,
      savedProductIds: [],
      selectedCategory: 'All',
      
      addProduct: (product) => set((state) => {
        const newProduct: Product = {
          ...product,
          id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          likes: 0,
          isLiked: false,
          reviews: 0,
          rating: 0
        };
        
        return {
          products: [newProduct, ...state.products]
        };
      }),
      
      toggleLike: (id) => set((state) => ({
        products: state.products.map((product) =>
          product.id === id
            ? {
                ...product,
                isLiked: !product.isLiked,
                likes: product.isLiked ? product.likes - 1 : product.likes + 1
              }
            : product
        )
      })),
      
      toggleSave: (id, userId) => set((state) => {
        const isSaved = state.savedProductIds.includes(id);
        const newIds = isSaved
          ? state.savedProductIds.filter((productId) => productId !== id)
          : [...state.savedProductIds, id];

        // Sync with Supabase in background (fire-and-forget)
        if (userId) {
          if (isSaved) {
            unsavePromotion(userId, id);
          } else {
            savePromotion(userId, id);
          }
        }

        return { savedProductIds: newIds };
      }),
      
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((product) => product.id !== id)
      })),
      
      boostProduct: (id) => set((state) => ({
        products: state.products.map((product) =>
          product.id === id
            ? { ...product, isBoosted: true, boostedAt: new Date().toISOString() }
            : product
        )
      })),
      
      unboostProduct: (id) => set((state) => ({
        products: state.products.map((product) =>
          product.id === id
            ? { ...product, isBoosted: false, boostedAt: undefined }
            : product
        )
      })),
      
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, ...updates } : product
        )
      })),

      resetProducts: () => set({
        products: mockProducts
      }),
      
      setSelectedCategory: (category) => set({
        selectedCategory: category
      }),

      loadSavedFromSupabase: async (userId: string) => {
        const dbIds = await fetchSavedPromoIds(userId);
        if (dbIds.length > 0) {
          // Merge: DB IDs + local IDs (deduped)
          set((state) => {
            const merged = Array.from(new Set([...dbIds, ...state.savedProductIds]));
            return { savedProductIds: merged };
          });
        }
      },

      setSavedProductIds: (ids: string[]) => set({ savedProductIds: ids }),
    }),
    {
      name: 'product-storage',
      version: 5,
      migrate: (persisted: any, version: number) => {
        const state = persisted as ProductStore;
        if (version < 5) {
          // Version 5: Clear ALL local products
          // All data now comes from Supabase DB via API
          return {
            ...state,
            products: [],
          };
        }
        return persisted as ProductStore;
      },
    }
  )
);
