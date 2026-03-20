import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signOut } from '@/lib/supabase/auth';

export type UserRole = 'USER' | 'MERCHANT' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt?: string;
  // User specific - Gamification
  xp?: number; // Experience points
  level?: number; // Current level (derived from xp)
  coins?: number; // Reward currency
  points?: number; // Legacy field (for compatibility)
  // Merchant specific
  shopName?: string;
  shopLogo?: string;
  verified?: boolean;
  isPro?: boolean;
  shopDescription?: string;
  shopAddress?: string;
  shopCategory?: string;
  shopOpeningHours?: string;
  shopPaymentMethods?: string;
  shopSocialLine?: string;
  shopSocialFacebook?: string;
  shopSocialInstagram?: string;
  shopSocialWebsite?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (user: User) => void;
  loginAsUser: () => void; // Quick login as customer
  loginAsMerchant: () => void; // Quick login as merchant
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  updateProfile: (updates: { name?: string; phone?: string }) => void;
  switchRole: (role: UserRole) => void; // For demo/testing
  
  // Gamification Actions
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  redeemReward: (cost: number) => boolean; // Returns success
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user) => set({ user, isAuthenticated: true }),
      
      loginAsUser: () => set({
        user: {
          id: `user-${Date.now()}`,
          name: '',
          email: '',
          role: 'USER',
          avatar: '',
          phone: '',
          createdAt: new Date().toISOString(),
          xp: 0,
          level: 1,
          coins: 0,
          points: 0
        },
        isAuthenticated: true
      }),
      
      loginAsMerchant: () => set({
        user: {
          id: `merchant-${Date.now()}`,
          name: '',
          email: '',
          role: 'MERCHANT',
          avatar: '',
          phone: '',
          shopName: '',
          shopLogo: '',
          verified: false
        },
        isAuthenticated: true
      }),
      
      logout: async () => {
        set({ user: null, isAuthenticated: false });
        try {
          await signOut();
        } catch {
          // Ignore signOut errors — state is already cleared
        }
      },
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      updateProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      switchRole: (role) => set((state) => {
        if (!state.user) return state;
        
        // Switch between USER and MERCHANT with appropriate defaults
        const updates: Partial<User> = { role };
        
        if (role === 'MERCHANT') {
          updates.shopName = state.user.shopName || '';
          updates.shopLogo = state.user.shopLogo || '';
          updates.verified = state.user.verified ?? false;
        } else if (role === 'USER') {
          updates.level = state.user.level || 1;
          updates.xp = state.user.xp || 0;
          updates.coins = state.user.coins || 0;
        }
        
        return {
          user: { ...state.user, ...updates }
        };
      }),

      // Gamification: Add XP and calculate level
      addXp: (amount) => set((state) => {
        if (!state.user || state.user.role !== 'USER') return state;
        
        const newXp = (state.user.xp || 0) + amount;
        const newLevel = Math.floor(newXp / 100) + 1;
        const oldLevel = Math.floor((state.user.xp || 0) / 100) + 1;
        
        // Show level up toast if applicable
        if (newLevel > oldLevel) {
          // We'll dispatch a custom event for the UI to show the toast
          const event = new CustomEvent('levelUp', { detail: { level: newLevel } });
          if (typeof window !== 'undefined') {
            window.dispatchEvent(event);
          }
        }
        
        // Show XP gained notification
        if (typeof window !== 'undefined') {
          const xpEvent = new CustomEvent('xpGained', { detail: { amount, newXp } });
          window.dispatchEvent(xpEvent);
        }
        
        return {
          user: {
            ...state.user,
            xp: newXp,
            level: newLevel
          }
        };
      }),

      // Gamification: Add coins
      addCoins: (amount) => set((state) => {
        if (!state.user || state.user.role !== 'USER') return state;
        
        const newCoins = (state.user.coins || 0) + amount;
        
        // Show coins gained notification
        if (typeof window !== 'undefined') {
          const coinsEvent = new CustomEvent('coinsGained', { detail: { amount, newCoins } });
          window.dispatchEvent(coinsEvent);
        }
        
        return {
          user: {
            ...state.user,
            coins: newCoins
          }
        };
      }),

      // Gamification: Redeem reward (deduct coins)
      redeemReward: (cost) => {
        let success = false;
        set((state) => {
          if (!state.user || state.user.role !== 'USER') return state;
          
          const currentCoins = state.user.coins || 0;
          if (currentCoins >= cost) {
            success = true;
            return {
              user: {
                ...state.user,
                coins: currentCoins - cost
              }
            };
          }
          
          return state;
        });
        return success;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
