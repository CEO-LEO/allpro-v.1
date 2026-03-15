'use client';

import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

export default function PointsCounter() {
  const { user } = useAuthStore();

  // Calculate level and XP progress
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const xpInCurrentLevel = xp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  // Determine rank title based on level
  const getRankTitle = () => {
    if (level >= 20) return 'Legendary Slayer';
    if (level >= 10) return 'Pro Hunter';
    return 'Novice Hunter';
  };

  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Level Badge */}
      <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
        <span className="text-sm font-bold text-white">{level}</span>
      </div>

      {/* XP Display */}
      <div className="flex flex-col">
        <motion.div
          key={xp}
          initial={{ scale: 1.5, color: '#fef3c7' }}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ duration: 0.3 }}
          className="text-lg font-bold text-white leading-none"
        >
          {xp.toLocaleString()}
        </motion.div>
        <span className="text-xs text-white/80 leading-none mt-0.5">
          {getRankTitle()}
        </span>
      </div>

      {/* Progress Ring */}
      <div className="relative w-8 h-8">
        <svg className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="3"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx="16"
            cy="16"
            r="12"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 12}`}
            strokeDashoffset={`${2 * Math.PI * 12 * (1 - progressPercentage / 100)}`}
            strokeLinecap="round"
            animate={{
              strokeDashoffset: `${2 * Math.PI * 12 * (1 - progressPercentage / 100)}`
            }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8px] font-bold text-white">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
