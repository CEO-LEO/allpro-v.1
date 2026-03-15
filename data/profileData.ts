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
  if (level <= 20) return 'Pro Hunter';
  return 'Legendary Slayer';
};

export const mockUserProfile: UserProfile = {
  id: 'USER001',
  name: 'Somchai Dealseeker',
  email: 'somchai@example.com',
  avatar: 'https://i.pravatar.cc/300?img=60',
  level: 12,
  currentXP: 450,
  nextLevelXP: 1000,
  rank: getRankTitle(12),
  totalPoints: 2350,
  moneySaved: 4500,
  communityPosts: 23,
  joinedDate: '2025-11-15'
};

export const mockBadges: Badge[] = [
  {
    id: 'badge1',
    name: 'Early Bird',
    description: 'Posted a deal before 6 AM',
    icon: Clock,
    color: '#F59E0B',
    unlocked: true,
    unlockedDate: '2025-12-10',
    requirement: 'Post 1 deal before 6 AM'
  },
  {
    id: 'badge2',
    name: '7-Eleven Fan',
    description: 'Saved 10 deals from 7-Eleven',
    icon: Coffee,
    color: '#00843D',
    unlocked: true,
    unlockedDate: '2025-12-25',
    requirement: 'Save 10 7-Eleven deals'
  },
  {
    id: 'badge3',
    name: 'Night Owl',
    description: 'Posted after midnight',
    icon: Moon,
    color: '#8B5CF6',
    unlocked: true,
    unlockedDate: '2026-01-05',
    requirement: 'Post 1 deal after midnight'
  },
  {
    id: 'badge4',
    name: 'First Blood',
    description: 'Made your first community post',
    icon: Zap,
    color: '#EF4444',
    unlocked: true,
    unlockedDate: '2025-11-20',
    requirement: 'Post your first deal'
  },
  {
    id: 'badge5',
    name: 'Top Spender',
    description: 'Redeemed over 5000 points',
    icon: Crown,
    color: '#FFD700',
    unlocked: false,
    requirement: 'Redeem 5000 points worth of rewards'
  },
  {
    id: 'badge6',
    name: 'Sharpshooter',
    description: 'Posted 10 verified deals',
    icon: Target,
    color: '#3B82F6',
    unlocked: false,
    requirement: 'Post 10 deals verified by community'
  },
  {
    id: 'badge7',
    name: 'Influencer',
    description: 'Your post got 100+ helpful votes',
    icon: TrendingUp,
    color: '#10B981',
    unlocked: false,
    requirement: 'Get 100+ helpful votes on one post'
  },
  {
    id: 'badge8',
    name: 'Gift Hunter',
    description: 'Found 20 BOGO deals',
    icon: Gift,
    color: '#EC4899',
    unlocked: false,
    requirement: 'Find 20 Buy One Get One deals'
  }
];

export const mockRewards: Reward[] = [
  {
    id: 'reward1',
    title: 'Free Delivery Code',
    description: 'Grab/Foodpanda free delivery (up to 50 THB)',
    pointsCost: 500,
    imageUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400&h=300&fit=crop',
    available: true,
    category: 'delivery'
  },
  {
    id: 'reward2',
    title: "100 THB Lotus's Voucher",
    description: 'Valid for 30 days on purchases over 500 THB',
    pointsCost: 800,
    imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop',
    available: true,
    category: 'voucher'
  },
  {
    id: 'reward3',
    title: '7-Eleven 50 THB Coupon',
    description: 'Use at any 7-Eleven store nationwide',
    pointsCost: 400,
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    available: true,
    category: 'voucher'
  },
  {
    id: 'reward4',
    title: 'Premium Badge for 1 Month',
    description: 'Get exclusive early access to deals',
    pointsCost: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1633613286991-611fe299c4be?w=400&h=300&fit=crop',
    available: true,
    category: 'premium'
  },
  {
    id: 'reward5',
    title: 'Big C 200 THB Voucher',
    description: 'Electronics and home appliances only',
    pointsCost: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=300&fit=crop',
    available: true,
    category: 'voucher'
  },
  {
    id: 'reward6',
    title: 'Makro 15% Discount',
    description: 'One-time use for bulk purchases',
    pointsCost: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop',
    available: false,
    category: 'discount'
  }
];
