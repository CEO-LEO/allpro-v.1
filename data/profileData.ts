import { LucideIcon, Award, Coffee, Moon, Zap, Crown, Target, TrendingUp, Gift, ShoppingBag, Clock } from 'lucide-react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  rank: string;
  totalPoints: number;
  moneySaved: number;
  communityPosts: number;
  joinedDate: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  unlocked: boolean;
  unlockedDate?: string;
  requirement: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  imageUrl: string;
  available: boolean;
  category: 'voucher' | 'discount' | 'premium' | 'delivery';
}

// Rank titles based on level (aligned with useGamification.ts LEVEL_THRESHOLDS)
export const getRankTitle = (level: number): string => {
  if (level <= 5) return 'Novice Hunter';
  if (level <= 20) return 'IAMROOT Hunter';
  return 'IAMROOT Legend';
};

// TODO: Replace with API call -> GET /api/user/profile
export const mockUserProfile: UserProfile | null = null;

// TODO: Replace with API call -> GET /api/user/badges
export const mockBadges: Badge[] = [];

// TODO: Replace with API call -> GET /api/rewards
export const mockRewards: Reward[] = [];
