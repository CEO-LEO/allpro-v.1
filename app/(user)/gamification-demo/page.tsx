'use client';

import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { useGamification, ActionType } from '@/hooks/useGamification';
import PointsCounter from '@/components/PointsCounter';
import ProfileProgress from '@/components/ProfileProgress';

export default function GamificationDemoPage() {
  const { earnPoints, incrementStat, stats, currentStreak } = useGamification();

  const handleAction = (action: ActionType, statKey?: keyof typeof stats) => {
    earnPoints(action);
    if (statKey) {
      incrementStat(statKey);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-bg dark:to-dark-surface">
      <Toaster position="top-center" richColors />

      {/* Header with Points Counter */}
      <header className="sticky top-0 z-50 glass-auto border-b border-gray-200 dark:border-dark-border">
        <div className="container-responsive py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🎮 Gamification Demo
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Test the fun engine!
              </p>
            </div>
            <PointsCounter />
          </div>
        </div>
      </header>

      <main className="container-responsive py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Profile Progress */}
          <div>
            <ProfileProgress />

            {/* Stats Card */}
            <motion.div
              className="card p-6 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                📊 Your Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="QR Scans" value={stats.scans} icon="📱" />
                <StatItem label="Reviews" value={stats.reviews} icon="⭐" />
                <StatItem label="Referrals" value={stats.referrals} icon="👥" />
                <StatItem label="Shares" value={stats.dealsShared} icon="💝" />
                <StatItem label="Daily Logins" value={stats.dailyLogins} icon="🌅" />
                <StatItem label="Login Streak" value={currentStreak} icon="🔥" />
              </div>
            </motion.div>
          </div>

          {/* Right: Action Buttons */}
          <div>
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                🎯 Test Actions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Click buttons to earn points and unlock badges!
              </p>

              <div className="space-y-3">
                <ActionButton
                  onClick={() => handleAction('SCAN_QR', 'scans')}
                  icon="📱"
                  label="Scan QR Code"
                  points={50}
                  color="blue"
                />
                <ActionButton
                  onClick={() => handleAction('WRITE_REVIEW', 'reviews')}
                  icon="⭐"
                  label="Write Review"
                  points={100}
                  color="purple"
                />
                <ActionButton
                  onClick={() => handleAction('REFER_FRIEND', 'referrals')}
                  icon="👥"
                  label="Refer a Friend"
                  points={200}
                  color="green"
                />
                <ActionButton
                  onClick={() => handleAction('SHARE_DEAL', 'dealsShared')}
                  icon="💝"
                  label="Share Deal"
                  points={25}
                  color="pink"
                />
                <ActionButton
                  onClick={() => handleAction('COMPLETE_PROFILE')}
                  icon="✅"
                  label="Complete Profile"
                  points={150}
                  color="orange"
                />
                <ActionButton
                  onClick={() => handleAction('UPGRADE_PRO', 'proPurchases')}
                  icon="👑"
                  label="Upgrade to PRO"
                  points={500}
                  color="gold"
                />
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-brand-50 dark:bg-brand-900/10 rounded-xl border border-brand-200 dark:border-brand-800">
                <h4 className="font-semibold text-sm text-brand-900 dark:text-brand-100 mb-2">
                  💡 How to Unlock Badges
                </h4>
                <ul className="text-xs text-brand-700 dark:text-brand-300 space-y-1">
                  <li>• 🏪 <strong>7-11 Slayer</strong>: Scan 10 QR codes</li>
                  <li>• ⭐ <strong>Review Expert</strong>: Write 10 reviews</li>
                  <li>• 🦋 <strong>Social Butterfly</strong>: Refer 5 friends</li>
                  <li>• 🌅 <strong>Early Bird</strong>: Login 7 days in a row</li>
                  <li>• 👑 <strong>Deal Hunter PRO</strong>: Upgrade to PRO</li>
                  <li>• 💝 <strong>Sharing is Caring</strong>: Share 20 deals</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function StatItem({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {label}
        </div>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  icon: string;
  label: string;
  points: number;
  color: 'blue' | 'purple' | 'green' | 'pink' | 'orange' | 'gold';
}

function ActionButton({ onClick, icon, label, points, color }: ActionButtonProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    gold: 'from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700',
  };

  return (
    <motion.button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-5 py-4 
        bg-gradient-to-r ${colorClasses[color]}
        text-white rounded-2xl shadow-soft
        transition-all duration-200
        press-effect
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="font-semibold">{label}</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
        <span className="font-bold">+{points}</span>
        <span className="text-xs opacity-80">PTS</span>
      </div>
    </motion.button>
  );
}
