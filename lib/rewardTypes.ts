// Types for Rewards & Points System

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: 'hot_deals' | 'cash_vouchers' | 'gadgets' | 'food' | 'entertainment';
  pointsCost: number;
  imageUrl: string;
  stock: number;
  brand: string;
  validityDays: number; // How many days the voucher is valid after redemption
  terms?: string;
}

export interface Voucher {
  id: string;
  rewardId: string;
  rewardName: string;
  rewardImage: string;
  brand: string;
  pointsSpent: number;
  redeemedAt: Date;
  expiresAt: Date;
  status: 'active' | 'used' | 'expired';
  code: string; // Unique voucher code
  qrData?: string; // Data for QR code
}

export interface PointsTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  timestamp: Date;
  icon: string;
}

export interface UserPoints {
  balance: number;
  transactions: PointsTransaction[];
  vouchers: Voucher[];
}
