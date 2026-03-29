import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signOut } from '@/lib/supabase/auth';

export type UserRole = 'USER' | 'MERCHANT' | null;

// ═══ Merchant Profile — persisted as part of the account ═══
interface MerchantProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  shopName: string;
  shopLogo: string;
  shopDescription?: string;
  shopAddress?: string;
  shopCategory?: string;
  shopOpeningHours?: string;
  shopPaymentMethods?: string;
  shopSocialLine?: string;
  shopSocialFacebook?: string;
  shopSocialInstagram?: string;
  shopSocialWebsite?: string;
  verified: boolean;
  merchantProfileComplete: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt?: string;
  // Personalization
  preferred_tags?: string[];
  onboardingCompleted?: boolean;
  // Demographics
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  ageRange?: '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  profileCompleted?: boolean;
  // User specific - Gamification
  xp?: number;
  level?: number;
  coins?: number;
  points?: number;
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
  merchantProfileComplete?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  // Persisted merchant profile — survives logout
  savedMerchantProfile: MerchantProfile | null;
  
  // Actions
  login: (user: User) => void;
  loginAsUser: () => void;
  loginAsMerchant: () => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  updateProfile: (updates: { name?: string; phone?: string }) => void;
  switchRole: (role: UserRole) => void;
  
  // Gamification Actions
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  redeemReward: (cost: number) => boolean;
}

// Helper: extract merchant profile fields from a User object
function extractMerchantProfile(user: User): MerchantProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    avatar: user.avatar,
    shopName: user.shopName || '',
    shopLogo: user.shopLogo || '',
    shopDescription: user.shopDescription,
    shopAddress: user.shopAddress,
    shopCategory: user.shopCategory,
    shopOpeningHours: user.shopOpeningHours,
    shopPaymentMethods: user.shopPaymentMethods,
    shopSocialLine: user.shopSocialLine,
    shopSocialFacebook: user.shopSocialFacebook,
    shopSocialInstagram: user.shopSocialInstagram,
    shopSocialWebsite: user.shopSocialWebsite,
    verified: user.verified ?? false,
    merchantProfileComplete: user.merchantProfileComplete ?? false,
  };
}

// Helper: build a full User from saved merchant profile
function merchantProfileToUser(p: MerchantProfile): User {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    role: 'MERCHANT',
    avatar: p.avatar || '',
    phone: p.phone,
    shopName: p.shopName,
    shopLogo: p.shopLogo,
    shopDescription: p.shopDescription,
    shopAddress: p.shopAddress,
    shopCategory: p.shopCategory,
    shopOpeningHours: p.shopOpeningHours,
    shopPaymentMethods: p.shopPaymentMethods,
    shopSocialLine: p.shopSocialLine,
    shopSocialFacebook: p.shopSocialFacebook,
    shopSocialInstagram: p.shopSocialInstagram,
    shopSocialWebsite: p.shopSocialWebsite,
    verified: p.verified,
    merchantProfileComplete: p.merchantProfileComplete,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      savedMerchantProfile: null,

      login: (user) => set((state) => {
        try {
          // ═══ MERCHANT: merge ข้อมูลจาก 3 แหล่ง (priority สูง → ต่ำ) ═══
          // 1. ข้อมูลที่ส่งเข้ามา (จาก Supabase DB / LoginModal)
          // 2. savedMerchantProfile (เก็บใน localStorage — อยู่รอดหลัง logout)
          // 3. ค่า default
          if (user.role === 'MERCHANT') {
            const saved = state.savedMerchantProfile;

            // ใช้ค่าจาก user (DB) ก่อน → fallback ไป saved (localStorage)
            const shopName = user.shopName || saved?.shopName || '';
            const shopLogo = user.shopLogo || saved?.shopLogo || '';
            const shopAddress = user.shopAddress || saved?.shopAddress || '';
            const phone = user.phone || saved?.phone || '';

            const merged: User = {
              ...user,
              shopName,
              shopLogo,
              shopDescription: user.shopDescription || saved?.shopDescription,
              shopAddress,
              shopCategory: user.shopCategory || saved?.shopCategory,
              shopOpeningHours: user.shopOpeningHours || saved?.shopOpeningHours,
              shopPaymentMethods: user.shopPaymentMethods || saved?.shopPaymentMethods,
              shopSocialLine: user.shopSocialLine || saved?.shopSocialLine,
              shopSocialFacebook: user.shopSocialFacebook || saved?.shopSocialFacebook,
              shopSocialInstagram: user.shopSocialInstagram || saved?.shopSocialInstagram,
              shopSocialWebsite: user.shopSocialWebsite || saved?.shopSocialWebsite,
              phone,
              verified: user.verified ?? saved?.verified ?? false,
              // Auto-calculate profile completeness
              merchantProfileComplete: !!(
                shopName.trim() &&
                shopLogo &&
                shopAddress.trim() &&
                phone.trim() && phone.trim().length >= 9
              ),
            };

            console.log('[AuthStore] login MERCHANT — fromDB:', !!user.shopName, 'fromSaved:', !!saved?.shopName, '→ merged:', merged.shopName, 'complete:', merged.merchantProfileComplete);
            return {
              user: merged,
              isAuthenticated: true,
              savedMerchantProfile: extractMerchantProfile(merged),
            };
          }

          // ═══ USER: ไม่ต้อง merge ═══
          console.log('[AuthStore] login USER —', user.email);
          return { user, isAuthenticated: true };
        } catch (err) {
          console.error('[AuthStore] login error:', err);
          return { user, isAuthenticated: true };
        }
      }),
      
      loginAsUser: () => set((state) => {
        const prev = state.user?.role === 'USER' ? state.user : null;
        return {
          user: {
            id: prev?.id || `user-${Date.now()}`,
            name: prev?.name || '',
            email: prev?.email || '',
            role: 'USER' as UserRole,
            avatar: prev?.avatar || '',
            phone: prev?.phone || '',
            createdAt: prev?.createdAt || new Date().toISOString(),
            xp: prev?.xp ?? 0,
            level: prev?.level ?? 1,
            coins: prev?.coins ?? 0,
            points: prev?.points ?? 0,
            preferred_tags: prev?.preferred_tags || [],
            onboardingCompleted: prev?.onboardingCompleted ?? false,
            profileCompleted: prev?.profileCompleted ?? false
          },
          isAuthenticated: true
        };
      }),
      
      loginAsMerchant: () => set((state) => {
        // Restore from current state OR from saved account profile
        const prev = state.user?.role === 'MERCHANT' ? state.user : null;
        const saved = state.savedMerchantProfile;
        const src = prev || (saved ? merchantProfileToUser(saved) : null);
        const newUser: User = {
          id: src?.id || `merchant-${Date.now()}`,
          name: src?.name || '',
          email: src?.email || '',
          role: 'MERCHANT' as UserRole,
          avatar: src?.avatar || '',
          phone: src?.phone || '',
          shopName: src?.shopName || '',
          shopLogo: src?.shopLogo || '',
          shopDescription: src?.shopDescription,
          shopAddress: src?.shopAddress,
          shopCategory: src?.shopCategory,
          shopOpeningHours: src?.shopOpeningHours,
          shopPaymentMethods: src?.shopPaymentMethods,
          shopSocialLine: src?.shopSocialLine,
          shopSocialFacebook: src?.shopSocialFacebook,
          shopSocialInstagram: src?.shopSocialInstagram,
          shopSocialWebsite: src?.shopSocialWebsite,
          verified: src?.verified ?? false,
          merchantProfileComplete: src?.merchantProfileComplete ?? false,
        };
        return {
          user: newUser,
          isAuthenticated: true,
          savedMerchantProfile: extractMerchantProfile(newUser),
        };
      }),
      
      logout: async () => {
        // Prevent re-entrant logout (AuthListener SIGNED_OUT → logout() → signOut → SIGNED_OUT → ...)
        const currentState = useAuthStore.getState();
        if (!currentState.isAuthenticated && !currentState.user) {
          console.log('[AuthStore] logout — already logged out, skipping');
          return;
        }

        // Keep savedMerchantProfile — it's part of the account, not the session
        console.log('[AuthStore] logout — clearing user, keeping savedMerchantProfile');
        
        // 1) Clear local state FIRST so re-entrant calls are blocked
        set({ user: null, isAuthenticated: false });
        
        // 2) Then sign out from Supabase (this fires SIGNED_OUT event,
        //    but the guard above will prevent recursion)
        try {
          await signOut();
          console.log('[AuthStore] Supabase signOut completed');
        } catch (err) {
          console.warn('[AuthStore] signOut error (ignored):', err);
        }
      },
      
      updateUser: (updates) => set((state) => {
        const newUser = state.user ? { ...state.user, ...updates } : null;
        // Auto-save merchant profile to account whenever it changes
        if (newUser?.role === 'MERCHANT') {
          return {
            user: newUser,
            savedMerchantProfile: extractMerchantProfile(newUser),
          };
        }
        return { user: newUser };
      }),
      
      updateProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      switchRole: (role) => set((state) => {
        if (!state.user) return state;
        
        const updates: Partial<User> = { role };
        
        if (role === 'MERCHANT') {
          // Restore from saved profile if available
          const saved = state.savedMerchantProfile;
          if (saved) {
            updates.shopName = saved.shopName || state.user.shopName || '';
            updates.shopLogo = saved.shopLogo || state.user.shopLogo || '';
            updates.shopAddress = saved.shopAddress || state.user.shopAddress;
            updates.phone = saved.phone || state.user.phone;
            updates.verified = saved.verified ?? state.user.verified ?? false;
            updates.merchantProfileComplete = saved.merchantProfileComplete ?? false;
          } else {
            updates.shopName = state.user.shopName || '';
            updates.shopLogo = state.user.shopLogo || '';
            updates.verified = state.user.verified ?? false;
          }
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
        isAuthenticated: state.isAuthenticated,
        savedMerchantProfile: state.savedMerchantProfile,
      })
    }
  )
);
