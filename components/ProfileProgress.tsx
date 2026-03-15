'use client';

import { motion } from 'framer-motion';
import { useGamification } from '@/hooks/useGamification';

export default function ProfileProgress() {
  const { points, level, rankTitle, progress, badges, totalBadges, getUnlockedBadges } = useGamification();

  const unlockedBadges = getUnlockedBadges();

  return (
    <div className="space-y-6">
      {/* Level & Rank Card */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Level {level}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {rankTitle}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold gradient-text-gold">
              {points.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Total Points</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Progress to Level {progress.nextLevel}
            </span>
            <span className="font-semibold text-brand-600 dark:text-brand-400">
              {progress.current.toLocaleString()} / {progress.needed.toLocaleString()} XP
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            {/* Shimmer effect */}
            <div className="absolute inset-0 shimmer opacity-30" />
          </div>

          <p className="text-xs text-center text-gray-500">
            {Math.round(progress.percentage)}% Complete
          </p>
        </div>
      </motion.div>

      {/* Badges Section */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            🏆 Achievements
          </h3>
          <span className="text-sm font-semibold text-brand-600">
            {badges.length} / {totalBadges}
          </span>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-4 gap-3">
          {unlockedBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              className={`
                flex flex-col items-center justify-center p-3 rounded-xl
                ${getRarityClass(badge.rarity)}
                shadow-soft hover:shadow-soft-lg transition-shadow
              `}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl mb-1">{badge.icon}</div>
              <p className="text-[10px] font-medium text-center text-gray-700 dark:text-gray-300 leading-tight">
                {badge.name}
              </p>
            </motion.div>
          ))}

          {/* Locked badges */}
          {Array.from({ length: totalBadges - badges.length }).map((_, i) => (
            <div
              key={`locked-${i}`}
              className="flex items-center justify-center p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600"
            >
              <div className="text-3xl opacity-30">🔒</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function getRarityClass(rarity: 'common' | 'rare' | 'epic' | 'legendary'): string {
  const classes = {
    common: 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300',
    rare: 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400',
    epic: 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400',
    legendary: 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-500 glow-gold',
  };
  return classes[rarity];
}
