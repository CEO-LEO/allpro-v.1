'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Reward, Voucher, PointsTransaction, UserPoints } from './rewardTypes';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

interface PointsContextType {
  points: number;
  transactions: PointsTransaction[];
  vouchers: Voucher[];
  addPoints: (amount: number, description: string, icon?: string) => void;
  redeemReward: (reward: Reward) => boolean;
  markVoucherAsUsed: (voucherId: string) => void;
  getActiveVouchers: () => Voucher[];
  getUsedVouchers: () => Voucher[];
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

const STORAGE_KEY = 'allpro_user_points';

// Generate unique voucher code
const generateVoucherCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// Initial mock data for demo
const initialData: UserPoints = {
  balance: 1200, // Starting points for demo
  transactions: [
    {
      id: 't-001',
      type: 'earn',
      amount: 50,
      description: 'ชวนเพื่อนสมัครสมาชิก',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: '👥'
    },
    {
      id: 't-002',
      type: 'earn',
      amount: 100,
      description: 'เข้าสู่ระบบต่อเนื่อง 7 วัน',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      icon: '🔥'
    },
    {
      id: 't-003',
      type: 'earn',
      amount: 10,
      description: 'รายงานสต็อกสินค้า',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      icon: '📦'
    },
    {
      id: 't-004',
      type: 'earn',
      amount: 30,
      description: 'รีวิวโปรโมชั่น',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: '⭐'
    },
  ],
  vouchers: []
};

export function PointsProvider({ children }: { children: ReactNode }) {
  const [userPoints, setUserPoints] = useState<UserPoints>(initialData);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.transactions = parsed.transactions.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp)
        }));
        parsed.vouchers = parsed.vouchers.map((v: any) => ({
          ...v,
          redeemedAt: new Date(v.redeemedAt),
          expiresAt: new Date(v.expiresAt)
        }));
        setUserPoints(parsed);
      } catch (e) {
        console.error('Failed to parse points data:', e);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userPoints));
  }, [userPoints]);

  const addPoints = (amount: number, description: string, icon: string = '🎁') => {
    const transaction: PointsTransaction = {
      id: `t-${Date.now()}`,
      type: 'earn',
      amount,
      description,
      timestamp: new Date(),
      icon
    };

    setUserPoints(prev => ({
      ...prev,
      balance: prev.balance + amount,
      transactions: [transaction, ...prev.transactions]
    }));

    toast.success(`+${amount} แต้ม! ${description}`, {
      icon: icon,
      duration: 3000
    });
  };

  const redeemReward = (reward: Reward): boolean => {
    // Check if user has enough points
    if (userPoints.balance < reward.pointsCost) {
      toast.error('แต้มไม่เพียงพอ! ล่าโปรต่อเพื่อสะสมแต้มเพิ่ม 🎯', {
        duration: 4000,
        style: {
          background: '#FEE2E2',
          color: '#991B1B',
          border: '2px solid #DC2626'
        }
      });
      return false;
    }

    // Check stock
    if (reward.stock <= 0) {
      toast.error('ของรางวัลหมดแล้ว! 😢', {
        duration: 3000
      });
      return false;
    }

    // Create voucher
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + reward.validityDays);

    const voucher: Voucher = {
      id: `v-${Date.now()}`,
      rewardId: reward.id,
      rewardName: reward.name,
      rewardImage: reward.imageUrl,
      brand: reward.brand,
      pointsSpent: reward.pointsCost,
      redeemedAt: new Date(),
      expiresAt,
      status: 'active',
      code: generateVoucherCode(),
      qrData: `ALLPRO:${reward.id}:${Date.now()}`
    };

    // Create transaction
    const transaction: PointsTransaction = {
      id: `t-${Date.now()}`,
      type: 'spend',
      amount: reward.pointsCost,
      description: `แลกของรางวัล: ${reward.name}`,
      timestamp: new Date(),
      icon: '🎁'
    };

    // Update state
    setUserPoints(prev => ({
      ...prev,
      balance: prev.balance - reward.pointsCost,
      transactions: [transaction, ...prev.transactions],
      vouchers: [voucher, ...prev.vouchers]
    }));

    // Success animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6347']
    });

    toast.success(`🎉 แลกสำเร็จ! ${reward.name}`, {
      duration: 4000,
      style: {
        background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
        color: '#000',
        fontWeight: 'bold',
        border: '2px solid #D97706'
      }
    });

    return true;
  };

  const markVoucherAsUsed = (voucherId: string) => {
    setUserPoints(prev => ({
      ...prev,
      vouchers: prev.vouchers.map(v =>
        v.id === voucherId ? { ...v, status: 'used' as const } : v
      )
    }));

    toast.success('เก็บไว้ในคลังที่ใช้แล้ว ✓', {
      duration: 2000
    });
  };

  const getActiveVouchers = () => {
    return userPoints.vouchers.filter(v => v.status === 'active');
  };

  const getUsedVouchers = () => {
    return userPoints.vouchers.filter(v => v.status === 'used');
  };

  return (
    <PointsContext.Provider
      value={{
        points: userPoints.balance,
        transactions: userPoints.transactions,
        vouchers: userPoints.vouchers,
        addPoints,
        redeemReward,
        markVoucherAsUsed,
        getActiveVouchers,
        getUsedVouchers
      }}
    >
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
}
