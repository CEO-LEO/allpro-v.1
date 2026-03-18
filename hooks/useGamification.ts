'use client';

import { useCallback, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// ============================================================================
// ACTION TYPES & POINT VALUES
// ============================================================================

export type ActionType = 
  | 'DAILY_LOGIN'
  | 'SCAN_QR'
  | 'WRITE_REVIEW'
  | 'REFER_FRIEND'
  | 'SHARE_DEAL'
  | 'COMPLETE_PROFILE'
  | 'UPGRADE_PRO'
  | 'USE_CHAT';

const POINT_VALUES: Record<ActionType, number> = {
  DAILY_LOGIN: 10,
  SCAN_QR: 50,
  WRITE_REVIEW: 100,
  REFER_FRIEND: 200,
  SHARE_DEAL: 25,
  COMPLETE_PROFILE: 150,
  UPGRADE_PRO: 500,
  USE_CHAT: 10,
};

const ACTION_LABELS: Record<ActionType, string> = {
  DAILY_LOGIN: 'เข้าสู่ระบบประจำวัน',
  SCAN_QR: 'สแกน QR Code',
  WRITE_REVIEW: 'รีวิวร้านค้า',
  REFER_FRIEND: 'ชวนเพื่อน',
  SHARE_DEAL: 'แชร์โปรโมชั่น',
  COMPLETE_PROFILE: 'โปรไฟล์สมบูรณ์',
  UPGRADE_PRO: 'อัพเกรด PRO',
  USE_CHAT: 'ใช้ AI Chat',
};

// ============================================================================
// LEVEL SYSTEM
// ============================================================================

interface LevelThreshold {
  level: number;
  pointsRequired: number;
  rankTitle: string;
}

const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, pointsRequired: 0, rankTitle: 'Novice Hunter' },
  { level: 2, pointsRequired: 100, rankTitle: 'Novice Hunter' },
  { level: 3, pointsRequired: 300, rankTitle: 'Novice Hunter' },
  { level: 4, pointsRequired: 600, rankTitle: 'Novice Hunter' },
  { level: 5, pointsRequired: 1000, rankTitle: 'Novice Hunter' },
  { level: 6, pointsRequired: 1500, rankTitle: 'Pro Hunter' },
  { level: 7, pointsRequired: 2100, rankTitle: 'Pro Hunter' },
  { level: 8, pointsRequired: 2800, rankTitle: 'Pro Hunter' },
  { level: 9, pointsRequired: 3600, rankTitle: 'Pro Hunter' },
  { level: 10, pointsRequired: 4500, rankTitle: 'Pro Hunter' },
  { level: 11, pointsRequired: 5500, rankTitle: 'Pro Hunter' },
  { level: 12, pointsRequired: 6600, rankTitle: 'Pro Hunter' },
  { level: 13, pointsRequired: 7800, rankTitle: 'Pro Hunter' },
  { level: 14, pointsRequired: 9100, rankTitle: 'Pro Hunter' },
  { level: 15, pointsRequired: 10500, rankTitle: 'Pro Hunter' },
  { level: 16, pointsRequired: 12000, rankTitle: 'Pro Hunter' },
  { level: 17, pointsRequired: 13600, rankTitle: 'Pro Hunter' },
  { level: 18, pointsRequired: 15300, rankTitle: 'Pro Hunter' },
  { level: 19, pointsRequired: 17100, rankTitle: 'Pro Hunter' },
  { level: 20, pointsRequired: 19000, rankTitle: 'Pro Hunter' },
  { level: 21, pointsRequired: 21000, rankTitle: 'Legendary Slayer' },
  { level: 22, pointsRequired: 23500, rankTitle: 'Legendary Slayer' },
  { level: 23, pointsRequired: 26500, rankTitle: 'Legendary Slayer' },
  { level: 24, pointsRequired: 30000, rankTitle: 'Legendary Slayer' },
  { level: 25, pointsRequired: 34000, rankTitle: 'Legendary Slayer' },
  { level: 30, pointsRequired: 50000, rankTitle: 'Legendary Slayer' },
  { level: 40, pointsRequired: 100000, rankTitle: 'Legendary Slayer' },
  { level: 50, pointsRequired: 200000, rankTitle: 'Legendary Slayer' },
];

function getLevelData(points: number): LevelThreshold {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i].pointsRequired) {
      return LEVEL_THRESHOLDS[i];
    }
  }
  return LEVEL_THRESHOLDS[0];
}

function getNextLevelThreshold(currentLevel: number): number {
  const nextLevel = LEVEL_THRESHOLDS.find((l) => l.level === currentLevel + 1);
  return nextLevel ? nextLevel.pointsRequired : 999999;
}

// ============================================================================
// BADGE SYSTEM
// ============================================================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: any) => boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const BADGES: Badge[] = [
  {
    id: '7-eleven-slayer',
    name: '7-11 Slayer',
    description: 'สแกน QR Code 10 ครั้ง',
    icon: '🏪',
    condition: (stats) => stats.scans >= 10,
    rarity: 'common',
  },
  {
    id: 'scan-master',
    name: 'Scan Master',
    description: 'สแกน QR Code 50 ครั้ง',
    icon: '📱',
    condition: (stats) => stats.scans >= 50,
    rarity: 'rare',
  },
  {
    id: 'review-expert',
    name: 'Review Expert',
    description: 'เขียนรีวิว 10 ครั้ง',
    icon: '⭐',
    condition: (stats) => stats.reviews >= 10,
    rarity: 'rare',
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'ชวนเพื่อน 5 คน',
    icon: '🦋',
    condition: (stats) => stats.referrals >= 5,
    rarity: 'epic',
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'เข้าสู่ระบบ 7 วันติดต่อกัน',
    icon: '🌅',
    condition: (stats) => stats.dailyLogins >= 7,
    rarity: 'rare',
  },
  {
    id: 'deal-hunter-pro',
    name: 'Deal Hunter PRO',
    description: 'อัพเกรดเป็น PRO Member',
    icon: '👑',
    condition: (stats) => stats.proPurchases >= 1,
    rarity: 'legendary',
  },
  {
    id: 'sharing-is-caring',
    name: 'Sharing is Caring',
    description: 'แชร์โปรโมชั่น 20 ครั้ง',
    icon: '💝',
    condition: (stats) => stats.dealsShared >= 20,
    rarity: 'epic',
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'ปลดล็อค Badge ทั้งหมด 5 อัน',
    icon: '🏆',
    condition: (_stats: any) => false, // Checked separately via badge count logic
    rarity: 'legendary',
  },
];

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useGamification() {
  const {
    points,
    level,
    rankTitle,
    badges,
    stats,
    currentStreak,
    addPoints,
    setLevel,
    setRankTitle,
    unlockBadge,
    incrementStat,
    updateStreak,
  } = useUserStore();

  // ============================================================================
  // LEVEL UP LOGIC
  // ============================================================================

  const checkLevelUp = useCallback(
    (newPoints: number) => {
      const levelData = getLevelData(newPoints);

      if (levelData.level > level) {
        // LEVEL UP!
        setLevel(levelData.level);
        setRankTitle(levelData.rankTitle);

        // Visual feedback
        toast.success(`🎉 เลื่อนระดับเป็น Level ${levelData.level}!`, {
          description: `คุณได้เป็น "${levelData.rankTitle}" แล้ว`,
          duration: 5000,
        });

        // Epic confetti
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
        });

        // Sound effect hook (optional - implement later)
        // playSound('level-up');
      }
    },
    [level, setLevel, setRankTitle]
  );

  // ============================================================================
  // BADGE UNLOCK LOGIC
  // ============================================================================

  const checkBadges = useCallback(() => {
    BADGES.forEach((badge) => {
      if (badges.includes(badge.id)) {
        return; // Already unlocked
      }

      const isUnlocked = badge.id === 'badge_collector' 
        ? badges.length >= 5 
        : badge.condition(stats);

      if (isUnlocked) {
        unlockBadge(badge.id);

        // Visual feedback
        const rarityColor: Record<Badge['rarity'], string> = {
          common: '#94a3b8',
          rare: '#60a5fa',
          epic: '#a855f7',
          legendary: '#f59e0b',
        };

        toast.success(
          `${badge.icon} Achievement Unlocked!`,
          {
            description: badge.name,
            duration: 6000,
            style: {
              border: `2px solid ${rarityColor[badge.rarity]}`,
            },
          }
        );

        // Confetti for epic+ badges
        if (badge.rarity === 'epic' || badge.rarity === 'legendary') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }

        // Sound effect hook
        // playSound('badge-unlock');
      }
    });
  }, [badges, stats, unlockBadge]);

  // ============================================================================
  // EARN POINTS ACTION
  // ============================================================================

  const earnPoints = useCallback(
    (actionType: ActionType, customAmount?: number) => {
      const pointsEarned = customAmount || POINT_VALUES[actionType];
      const newPoints = points + pointsEarned;

      // Update points
      addPoints(pointsEarned);

      // Visual feedback - Animated toast
      toast.success(
        `+${pointsEarned} แต้ม!`,
        {
          description: ACTION_LABELS[actionType],
          duration: 3000,
          icon: '✨',
        }
      );

      // Mini confetti burst
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.7 },
        colors: ['#fbbf24', '#fcd34d'],
      });

      // Sound effect hook
      // playSound('points-earn');

      // Check for level up
      checkLevelUp(newPoints);

      // Check for badge unlocks
      setTimeout(() => checkBadges(), 500);
    },
    [points, addPoints, checkLevelUp, checkBadges]
  );

  // ============================================================================
  // DAILY LOGIN CHECK
  // ============================================================================

  useEffect(() => {
    const lastCheck = localStorage.getItem('last-daily-check');
    const today = new Date().toDateString();

    if (lastCheck !== today) {
      updateStreak();
      incrementStat('dailyLogins');
      earnPoints('DAILY_LOGIN');
      localStorage.setItem('last-daily-check', today);

      if (currentStreak > 1) {
        toast.success(
          `🔥 Login Streak: ${currentStreak} วันติดต่อกัน!`,
          {
            description: 'เข้าสู่ระบบทุกวันเพื่อรับโบนัส',
            duration: 4000,
          }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateStreak, incrementStat, earnPoints]);

  // ============================================================================
  // PROGRESS CALCULATION
  // ============================================================================

  const getProgressToNextLevel = useCallback(() => {
    const nextThreshold = getNextLevelThreshold(level);
    const currentThreshold = LEVEL_THRESHOLDS.find((l) => l.level === level)?.pointsRequired || 0;
    const progressPoints = points - currentThreshold;
    const neededPoints = nextThreshold - currentThreshold;
    const percentage = Math.min((progressPoints / neededPoints) * 100, 100);

    return {
      current: progressPoints,
      needed: neededPoints,
      percentage,
      nextLevel: level + 1,
    };
  }, [points, level]);

  // ============================================================================
  // HELPER: GET BADGE INFO
  // ============================================================================

  const getAllBadges = useCallback(() => BADGES, []);

  const getUnlockedBadges = useCallback(() => {
    return BADGES.filter((badge) => badges.includes(badge.id));
  }, [badges]);

  const getLockedBadges = useCallback(() => {
    return BADGES.filter((badge) => !badges.includes(badge.id));
  }, [badges]);

  // ============================================================================
  // RETURN API
  // ============================================================================

  return {
    // State
    points,
    level,
    rankTitle,
    badges,
    stats,
    currentStreak,

    // Actions
    earnPoints,
    incrementStat,

    // Progress
    progress: getProgressToNextLevel(),

    // Badge helpers
    getAllBadges,
    getUnlockedBadges,
    getLockedBadges,
    totalBadges: BADGES.length,
    unlockedCount: badges.length,

    // Level helpers
    isMaxLevel: level >= 50,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { BADGES, POINT_VALUES, ACTION_LABELS };
