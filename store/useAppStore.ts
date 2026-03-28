import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { FASTWORK_URLS } from '@/lib/config';
import toast from 'react-hot-toast';

// ============================================
// TYPES - Simplified for Supabase Integration
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  username?: string; // Optional
  coins: number;
  xp: number;
  level: number;
  avatar_url?: string;
  role?: string;
  name?: string; // For compatibility
  avatar?: string; // For compatibility
  phone?: string;
  createdAt?: string;
}

// Type alias for backward compatibility
export type User = UserProfile;

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  promoPrice?: number;
  discount?: number;
  image: string;
  category: string;
  shopName: string;
  shopId?: string;
  shopLogo?: string;
  brand?: string;
  rating?: number;
  likes?: number;
  isLiked?: boolean;
  reviews?: number;
  distance?: string;
  validUntil?: string;
  tags?: string[];
  verified?: boolean;
  description: string;
  createdAt?: string;
  service_url?: string;
}

export interface Notification {
  id: string;
  type: 'price_drop' | 'welcome' | 'reward' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  productId?: string;
}

export interface CouponUsageHistory {
  id: string;
  productId: string;
  productName: string;
  usedAt: string;
  savings: number;
}

// ============================================
// STATE INTERFACE
// ============================================

interface AppState {
  // User State
  user: User | null;
  isAuthenticated: boolean;

  // Product State
  products: Product[];
  savedProductIds: string[];
  selectedCategory: string;
  loading: boolean;
  error: string | null;

  // Notifications
  notifications: Notification[];
  unreadCount: number;

  // Coupon Usage History
  couponHistory: CouponUsageHistory[];

  // Actions - Auth
  loginAsUser: () => void;
  loginAsMerchant: () => void;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; phone?: string }) => void;
  checkAuth: () => Promise<void>;

  // Actions - Products
  fetchProducts: () => Promise<void>;
  fetchSavedDeals: () => Promise<void>;
  toggleSave: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
  getProductById: (id: string) => Product | undefined;
  setSelectedCategory: (category: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  toggleLike: (id: string) => void;

  // Actions - Gamification
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  viewProduct: (id: string) => void;
  useCoupon: (productId: string, productName: string, savings: number) => void;

  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Utility Actions
  resetStore: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      products: [],
      savedProductIds: [],
      selectedCategory: 'All',
      loading: false,
      error: null,
      notifications: [
        {
          id: 'notif-1',
          type: 'welcome',
          title: 'เธขเธดเธเธ”เธตเธ•เนเธญเธเธฃเธฑเธเธชเธนเน All Pro!',
          message: 'เน€เธฃเธดเนเธกเธ•เนเธเธฅเนเธฒเนเธเธฃเน€เธ”เนเธ”เธ—เธฑเนเธงเนเธ—เธขเนเธ”เนเน€เธฅเธข',
          time: 'Just now',
          isRead: false
        }
      ],
      unreadCount: 1,
      couponHistory: [],

      // ============================================
      // AUTH ACTIONS
      // ============================================

      checkAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error) throw error;
            
            if (profile) {
              set({
                user: {
                  id: profile.id,
                  name: profile.username,
                  username: profile.username,
                  email: session.user.email || '',
                  role: 'user',
                  avatar: profile.avatar_url,
                  xp: profile.xp,
                  level: profile.level,
                  coins: profile.coins,
                  createdAt: session.user.created_at
                },
                isAuthenticated: true
              });
              
              // Fetch saved deals after auth
              await get().fetchSavedDeals();
            }
          }
        } catch (error) {
          console.error('Auth check error:', error);
        }
      },

      loginAsUser: () => {
        const prev = get().user?.role === 'user' ? get().user : null;
        const newUser: User = {
          id: prev?.id || `user-${Date.now()}`,
          name: prev?.name || '',
          username: prev?.username || '',
          email: prev?.email || '',
          role: 'user',
          avatar: prev?.avatar || '',
          phone: prev?.phone || '',
          createdAt: prev?.createdAt || new Date().toISOString(),
          xp: prev?.xp ?? 0,
          level: prev?.level ?? 1,
          coins: prev?.coins ?? 0
        };

        set({ user: newUser, isAuthenticated: true });
        toast.success('เข้าสู่ระบบสำเร็จ!');
      },

      loginAsMerchant: () => {
        const prev = get().user?.role === 'merchant' ? get().user : null;
        const newUser: User = {
          id: prev?.id || `merchant-${Date.now()}`,
          name: prev?.name || '',
          username: prev?.username || '',
          email: prev?.email || '',
          role: 'merchant',
          avatar: prev?.avatar || '',
          phone: prev?.phone || '',
          createdAt: prev?.createdAt || new Date().toISOString(),
          xp: prev?.xp ?? 0,
          level: prev?.level ?? 1,
          coins: prev?.coins ?? 0
        };

        set({ user: newUser, isAuthenticated: true });
        toast.success('เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเธชเธณเน€เธฃเนเธ! เธขเธดเธเธ”เธตเธ•เนเธญเธเธฃเธฑเธ Merchant');
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ 
          user: null, 
          isAuthenticated: false,
          savedProductIds: []
        });
        toast.success('เธญเธญเธเธเธฒเธเธฃเธฐเธเธเนเธฅเนเธง');
      },

      updateProfile: (updates) => {
        const state = get();
        if (!state.user) return;

        set({
          user: {
            ...state.user,
            ...updates
          }
        });
        toast.success('เธญเธฑเธเน€เธ”เธ—เนเธเธฃเนเธเธฅเนเธชเธณเน€เธฃเนเธ');
      },

      // ============================================
      // PRODUCT ACTIONS
      // ============================================

      fetchProducts: async () => {
        try {
          set({ loading: true, error: null });
          
          // เธ”เธถเธเธเธฒเธ Supabase เธเธฃเธดเธ
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
          
          // เธ–เนเธฒ error เธซเธฃเธทเธญเนเธกเนเธกเธตเธเนเธญเธกเธนเธฅ เนเธเน Mock เธ—เธฑเธเธ—เธต
          if (error || !data || data.length === 0) {
            set({ products: [], loading: false });
            return;
          }
          
          // เนเธเธฅเธ Supabase data เนเธซเนเธ•เธฃเธเธเธฑเธ Product interface
          const products: Product[] = data.map((item: any) => ({
            id: item.id,
            title: item.title || '',
            description: item.description || '',
            price: item.price || 0,
            originalPrice: item.originalPrice || item.price || 0,
            promoPrice: item.promoPrice || item.price,
            discount: item.discount,
            image: item.image || '/placeholder.jpg',
            category: item.category || 'เธ—เธฑเนเธงเนเธ',
            shopName: item.shopName || item.shop_name || 'เธฃเนเธฒเธเธเนเธฒ',
            shopId: item.shopId || item.shop_id,
            shopLogo: item.shopLogo,
            brand: item.brand,
            rating: item.rating,
            likes: item.likes || 0,
            reviews: item.reviews || 0,
            distance: item.distance,
            validUntil: item.validUntil || item.valid_until,
            tags: item.tags || [],
            verified: item.verified || false,
            createdAt: item.created_at,
            service_url: item.service_url,
          }));
          
          set({ products, loading: false });
        } catch (error: any) {
          set({ products: [], loading: false });
        }
      },

      fetchSavedDeals: async () => {
        const state = get();
        if (!state.user?.id) return;
        
        try {
          const { data, error } = await supabase
            .from('saved_deals')
            .select('product_id')
            .eq('user_id', state.user.id);
          
          if (error) throw error;
          
          if (data) {
            set({
              savedProductIds: data.map((d: any) => d.product_id)
            });
          }
        } catch (error: any) {
          console.error('Fetch saved deals error:', error);
        }
      },

      toggleSave: async (id) => {
        const state = get();
        const isSaved = state.savedProductIds.includes(id);

        // Mock behavior if not authenticated
        if (!state.isAuthenticated || !state.user?.id) {
          if (isSaved) {
            set({
              savedProductIds: state.savedProductIds.filter((pid) => pid !== id)
            });
            toast.success('เธเธณเธญเธญเธเธเธฒเธเธเธฃเธฐเน€เธเนเธฒเนเธฅเนเธง');
          } else {
            set({
              savedProductIds: [...state.savedProductIds, id]
            });
            toast.success('๐’พ เธเธฑเธเธ—เธถเธเนเธฅเนเธง!');
          }
          return;
        }

        // Real Supabase save/unsave
        try {
          if (isSaved) {
            const { error } = await supabase
              .from('saved_deals')
              .delete()
              .match({ user_id: state.user.id, product_id: id });
            
            if (error) throw error;
            
            set({
              savedProductIds: state.savedProductIds.filter((pid) => pid !== id)
            });
            toast.success('เธเธณเธญเธญเธเธเธฒเธเธเธฃเธฐเน€เธเนเธฒเนเธฅเนเธง');
          } else {
            const { error } = await supabase
              .from('saved_deals')
              .insert({ user_id: state.user.id, product_id: id });
            
            if (error) throw error;
            
            set({
              savedProductIds: [...state.savedProductIds, id]
            });

            // Award coins on first save
            if (state.user?.role === 'user') {
              get().addCoins(10);
              toast.success('๐’พ เธเธฑเธเธ—เธถเธเนเธฅเนเธง! +10 เน€เธซเธฃเธตเธขเธ');
            } else {
              toast.success('๐’พ เธเธฑเธเธ—เธถเธเนเธฅเนเธง!');
            }
          }
        } catch (error: any) {
          console.error('Toggle save error:', error);
          toast.error('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ” เธเธฃเธธเธ“เธฒเธฅเธญเธเนเธซเธกเน');
        }
      },

      isSaved: (id) => {
        return get().savedProductIds.includes(id);
      },

      getProductById: (id) => {
        return get().products.find((p) => p.id === id);
      },

      setSelectedCategory: (category) => {
        set({ selectedCategory: category });
      },

      addProduct: (productData) => {
        const state = get();
        const newProduct: Product = {
          ...productData,
          id: `prod-${Date.now()}`,
          likes: 0,
          reviews: 0,
          rating: 4.5,
          verified: false
        };

        set({
          products: [newProduct, ...state.products]
        });

        toast.success('โจ เน€เธเธดเนเธกเนเธเธฃเนเธกเธเธฑเนเธเนเธซเธกเนเนเธฅเนเธง!');
      },

      deleteProduct: (id) => {
        const state = get();
        set({
          products: state.products.filter((p) => p.id !== id),
          savedProductIds: state.savedProductIds.filter((pid) => pid !== id)
        });
        toast.success('เธฅเธเนเธเธฃเนเธกเธเธฑเนเธเนเธฅเนเธง');
      },

      toggleLike: (id) => {
        const state = get();
        set({
          products: state.products.map((p) =>
            p.id === id
              ? {
                  ...p,
                  isLiked: !p.isLiked,
                  likes: p.isLiked
                    ? Math.max((p.likes || 1) - 1, 0)
                    : (p.likes || 0) + 1,
                }
              : p
          )
        });
      },

      // ============================================
      // GAMIFICATION ACTIONS
      // ============================================

      addXp: (amount) => {
        const state = get();
        if (!state.user || state.user.role !== 'user') return;

        const newXp = state.user.xp + amount;
        const newLevel = Math.floor(newXp / 100) + 1;
        const oldLevel = state.user.level;

        set({
          user: {
            ...state.user,
            xp: newXp,
            level: newLevel
          }
        });

        // Level up notification
        if (newLevel > oldLevel) {
          toast.success(`๐ เน€เธฅเน€เธงเธฅเธญเธฑเธ! เธ•เธญเธเธเธตเนเธเธธเธ“เธเธทเธญ Level ${newLevel}`, {
            duration: 4000
          });
          
          get().addNotification({
            type: 'reward',
            title: `Level Up! ๐`,
            message: `เธขเธดเธเธ”เธตเธ”เนเธงเธข! เธเธธเธ“เน€เธฅเน€เธงเธฅเธญเธฑเธเน€เธเนเธ Level ${newLevel} เนเธฅเนเธง`
          });
        }
      },

      addCoins: (amount) => {
        const state = get();
        if (!state.user || state.user.role !== 'user') return;

        set({
          user: {
            ...state.user,
            coins: state.user.coins + amount
          }
        });
      },

      viewProduct: (id) => {
        const state = get();
        if (!state.isAuthenticated || state.user?.role !== 'user') return;

        // Award XP for viewing product
        get().addXp(5);
      },

      useCoupon: (productId, productName, savings) => {
        const state = get();
        if (!state.isAuthenticated) return;

        // Add to history
        const historyItem: CouponUsageHistory = {
          id: `history-${Date.now()}`,
          productId,
          productName,
          usedAt: new Date().toISOString(),
          savings
        };

        set({
          couponHistory: [historyItem, ...state.couponHistory]
        });

        // Award XP and Coins
        if (state.user?.role === 'user') {
          get().addXp(20);
          get().addCoins(5);
        }

        // Notification
        get().addNotification({
          type: 'reward',
          title: 'เนเธเนเธเธนเธเธญเธเธชเธณเน€เธฃเนเธ! ๐',
          message: `เธเธธเธ“เธเธฃเธฐเธซเธขเธฑเธ”เนเธเนเธฅเนเธง เธฟ${savings} เธเธฒเธ ${productName}`
        });

        toast.success(`เนเธเนเธเธนเธเธญเธเธชเธณเน€เธฃเนเธ! เธเธฃเธฐเธซเธขเธฑเธ” เธฟ${savings}`);
      },

      // ============================================
      // NOTIFICATION ACTIONS
      // ============================================

      addNotification: (notificationData) => {
        const state = get();
        const newNotification: Notification = {
          ...notificationData,
          id: `notif-${Date.now()}`,
          time: 'Just now',
          isRead: false
        };

        set({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        });
      },

      markNotificationAsRead: (id) => {
        const state = get();
        const notification = state.notifications.find((n) => n.id === id);
        
        if (notification && !notification.isRead) {
          set({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          });
        }
      },

      markAllNotificationsAsRead: () => {
        const state = get();
        set({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0
        });
      },

      // ============================================
      // UTILITY ACTIONS
      // ============================================

      resetStore: () => {
        set({
          products: [],
          savedProductIds: [],
          selectedCategory: 'All',
          couponHistory: []
        });
        toast.success('เธฃเธตเน€เธเนเธ•เธเนเธญเธกเธนเธฅเธชเธณเน€เธฃเนเธ');
      }
    }),
    {
      name: 'all-promo-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        products: state.products,
        savedProductIds: state.savedProductIds,
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        couponHistory: state.couponHistory
      })
    }
  )
);
