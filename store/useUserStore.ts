import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User statistics for badge tracking
export interface UserStats {
  scans: number;
  reviews: number;
  referrals: number;
  dailyLogins: number;
  dealsShared: number;
  proPurchases: number;
}

// User gamification state
export interface UserState {
  // Identity
  userId: string;
  displayName: string;
  avatar?: string;
  
  // Gamification
  points: number;
  level: number;
  rankTitle: string;
  badges: string[];
  stats: UserStats;
  
  // Progress tracking
  lastLoginDate: string | null;
  currentStreak: number;
  longestStreak: number;
  
  // Actions
  setUser: (userId: string, displayName: string) => void;
  addPoints: (amount: number) => void;
  setLevel: (level: number) => void;
  setRankTitle: (title: string) => void;
  unlockBadge: (badgeId: string) => void;
  incrementStat: (statKey: keyof UserStats) => void;
  updateStreak: () => void;
  resetProgress: () => void;
}

// Initial state
const initialStats: UserStats = {
  scans: 0,
  reviews: 0,
  referrals: 0,
  dailyLogins: 0,
  dealsShared: 0,
  proPurchases: 0,
};

// Create the store with persistence
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      userId: '',
      displayName: 'Guest Hunter',
      avatar: undefined,
      points: 0,
      level: 1,
      rankTitle: 'Novice Hunter',
      badges: [],
      stats: initialStats,
      lastLoginDate: null,
      currentStreak: 0,
      longestStreak: 0,

      // Actions
      setUser: (userId, displayName) =>
        set({ userId, displayName }),

      addPoints: (amount) =>
        set((state) => ({ points: state.points + amount })),

      setLevel: (level) =>
        set({ level }),

      setRankTitle: (title) =>
        set({ rankTitle: title }),

      unlockBadge: (badgeId) =>
        set((state) => {
          if (state.badges.includes(badgeId)) {
            return state; // Already unlocked
          }
          return { badges: [...state.badges, badgeId] };
        }),

      incrementStat: (statKey) =>
        set((state) => ({
          stats: {
            ...state.stats,
            [statKey]: state.stats[statKey] + 1,
          },
        })),

      updateStreak: () => {
        const state = get();
        const today = new Date().toDateString();
        const lastLogin = state.lastLoginDate;

        if (!lastLogin) {
          // First login ever
          set({
            lastLoginDate: today,
            currentStreak: 1,
            longestStreak: 1,
          });
          return;
        }

        if (lastLogin === today) {
          // Already logged in today
          return;
        }

        const lastDate = new Date(lastLogin);
        const currentDate = new Date(today);
        const dayDiff = Math.floor(
          (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          // Consecutive day
          const newStreak = state.currentStreak + 1;
          set({
            lastLoginDate: today,
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, state.longestStreak),
          });
        } else {
          // Streak broken
          set({
            lastLoginDate: today,
            currentStreak: 1,
          });
        }
      },

      resetProgress: () =>
        set({
          points: 0,
          level: 1,
          rankTitle: 'Novice Hunter',
          badges: [],
          stats: initialStats,
          currentStreak: 0,
        }),
    }),
    {
      name: 'golden-hunter-user', // localStorage key
      partialize: (state: UserState) => ({
        userId: state.userId,
        displayName: state.displayName,
        avatar: state.avatar,
        points: state.points,
        level: state.level,
        rankTitle: state.rankTitle,
        badges: state.badges,
        stats: state.stats,
        lastLoginDate: state.lastLoginDate,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
      }),
    }
  )
);
