import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

interface ProductStore {
  products: Product[];
  savedProductIds: string[];
  selectedCategory: string;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'likes' | 'isLiked' | 'reviews' | 'rating'>) => void;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
  setSelectedCategory: (category: string) => void;
}

// Mock initial data
const mockProducts: Product[] = [
  {
    id: 'mock-1',
    title: 'Premium Salmon Sashimi Set',
    description: 'Fresh Norwegian salmon, 500g premium cut',
    originalPrice: 899,
    promoPrice: 599,
    discount: 33,
    image: 'https://picsum.photos/seed/sushi1/400/300',
    shopName: 'Sushi Paradise',
    shopLogo: 'https://ui-avatars.com/api/?name=SP&background=FF6B6B&color=fff',
    category: 'Food',
    verified: true,
    likes: 142,
    isLiked: false,
    reviews: 89,
    rating: 4.8,
    distance: '1.2 km',
    validUntil: '2026-04-10',
    createdAt: new Date().toISOString(),
    tags: ['Japanese', 'Seafood', 'Premium']
  },
  {
    id: 'mock-2',
    title: 'Brown Sugar Boba Milk Tea',
    description: 'Buy 1 Get 1 Free! Limited time offer',
    originalPrice: 120,
    promoPrice: 60,
    discount: 50,
    image: 'https://picsum.photos/seed/boba1/400/300',
    shopName: 'Tiger Sugar Bangkok',
    shopLogo: 'https://ui-avatars.com/api/?name=TS&background=F59E0B&color=fff',
    category: 'Food',
    verified: true,
    likes: 256,
    isLiked: false,
    reviews: 178,
    rating: 4.9,
    distance: '0.8 km',
    validUntil: '2026-04-08',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    tags: ['Drinks', 'Boba', 'Sweet']
  },
  {
    id: 'mock-3',
    title: '1-Month Gym Membership',
    description: 'Full access to all equipment + 2 free PT sessions',
    originalPrice: 2500,
    promoPrice: 1499,
    discount: 40,
    image: 'https://picsum.photos/seed/gym1/400/300',
    shopName: 'Fitness First',
    shopLogo: 'https://ui-avatars.com/api/?name=FF&background=EF4444&color=fff',
    category: 'Fitness',
    verified: true,
    likes: 89,
    isLiked: false,
    reviews: 45,
    rating: 4.6,
    distance: '2.5 km',
    validUntil: '2026-04-15',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    tags: ['Fitness', 'Health', 'Membership']
  },
  {
    id: 'mock-4',
    title: 'Thai Massage 90 Minutes',
    description: 'Traditional Thai massage by certified therapists',
    originalPrice: 800,
    promoPrice: 499,
    discount: 38,
    image: 'https://picsum.photos/seed/spa1/400/300',
    shopName: 'Royal Thai Spa',
    shopLogo: 'https://ui-avatars.com/api/?name=RT&background=8B5CF6&color=fff',
    category: 'Service',
    verified: true,
    likes: 167,
    isLiked: false,
    reviews: 112,
    rating: 4.9,
    distance: '1.8 km',
    validUntil: '2026-04-12',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    tags: ['Spa', 'Wellness', 'Relaxation']
  },
  {
    id: 'mock-5',
    title: 'Korean BBQ Buffet',
    description: 'All-you-can-eat premium meats + unlimited side dishes',
    originalPrice: 599,
    promoPrice: 399,
    discount: 33,
    image: 'https://picsum.photos/seed/bbq1/400/300',
    shopName: 'Seoul Kitchen',
    shopLogo: 'https://ui-avatars.com/api/?name=SK&background=10B981&color=fff',
    category: 'Food',
    verified: true,
    likes: 312,
    isLiked: false,
    reviews: 234,
    rating: 4.7,
    distance: '3.2 km',
    validUntil: '2026-04-20',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    tags: ['Korean', 'BBQ', 'Buffet']
  },
  {
    id: 'mock-6',
    title: 'Professional Haircut + Styling',
    description: 'Cut, wash, blow dry by senior stylist',
    originalPrice: 500,
    promoPrice: 299,
    discount: 40,
    image: 'https://picsum.photos/seed/salon1/400/300',
    shopName: 'Luxe Hair Studio',
    shopLogo: 'https://ui-avatars.com/api/?name=LH&background=EC4899&color=fff',
    category: 'Beauty',
    verified: true,
    likes: 78,
    isLiked: false,
    reviews: 56,
    rating: 4.8,
    distance: '1.5 km',
    validUntil: '2026-04-18',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    tags: ['Hair', 'Beauty', 'Styling']
  },
  {
    id: 'mock-7',
    title: 'Designer Handbag Collection',
    description: 'Premium leather bags - Summer collection',
    originalPrice: 3500,
    promoPrice: 1999,
    discount: 43,
    image: 'https://picsum.photos/seed/bags1/400/300',
    shopName: 'Fashion House Bangkok',
    shopLogo: 'https://ui-avatars.com/api/?name=FH&background=F43F5E&color=fff',
    category: 'Fashion',
    verified: true,
    likes: 234,
    isLiked: false,
    reviews: 167,
    rating: 4.7,
    distance: '2.1 km',
    validUntil: '2026-04-22',
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    tags: ['Fashion', 'Bags', 'Designer']
  },
  {
    id: 'mock-8',
    title: '7-Day Thailand Beach Tour',
    description: 'Phuket + Krabi - All inclusive package',
    originalPrice: 15990,
    promoPrice: 9999,
    discount: 37,
    image: 'https://picsum.photos/seed/beach1/400/300',
    shopName: 'Paradise Travel Agency',
    shopLogo: 'https://ui-avatars.com/api/?name=PT&background=06B6D4&color=fff',
    category: 'Travel',
    verified: true,
    likes: 456,
    isLiked: false,
    reviews: 289,
    rating: 4.9,
    distance: '5.2 km',
    validUntil: '2026-03-15',
    createdAt: new Date(Date.now() - 25200000).toISOString(),
    tags: ['Travel', 'Beach', 'Tour']
  },
  {
    id: 'mock-9',
    title: 'Sony Wireless Headphones',
    description: 'Noise cancelling, 30hr battery life',
    originalPrice: 5490,
    promoPrice: 3299,
    discount: 40,
    image: 'https://picsum.photos/seed/headphones1/400/300',
    shopName: 'TechPro Store',
    shopLogo: 'https://ui-avatars.com/api/?name=TP&background=3B82F6&color=fff',
    category: 'Gadget',
    verified: true,
    likes: 189,
    isLiked: false,
    reviews: 134,
    rating: 4.8,
    distance: '1.2 km',
    validUntil: '2026-02-28',
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    tags: ['Gadget', 'Audio', 'Electronics']
  },
  {
    id: 'mock-10',
    title: 'K-Beauty Skincare Set',
    description: 'Complete routine - Cleanse, Tone, Moisturize',
    originalPrice: 1290,
    promoPrice: 749,
    discount: 42,
    image: 'https://picsum.photos/seed/skincare1/400/300',
    shopName: 'Korean Beauty Hub',
    shopLogo: 'https://ui-avatars.com/api/?name=KB&background=A855F7&color=fff',
    category: 'Beauty',
    verified: true,
    likes: 312,
    isLiked: false,
    reviews: 198,
    rating: 4.9,
    distance: '1.8 km',
    validUntil: '2026-02-25',
    createdAt: new Date(Date.now() - 32400000).toISOString(),
    tags: ['Beauty', 'Skincare', 'Korean']
  },
];

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
      
      toggleSave: (id) => set((state) => ({
        savedProductIds: state.savedProductIds.includes(id)
          ? state.savedProductIds.filter((productId) => productId !== id)
          : [...state.savedProductIds, id]
      })),
      
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((product) => product.id !== id)
      })),
      
      resetProducts: () => set({
        products: mockProducts
      }),
      
      setSelectedCategory: (category) => set({
        selectedCategory: category
      })
    }),
    {
      name: 'product-storage'
    }
  )
);
