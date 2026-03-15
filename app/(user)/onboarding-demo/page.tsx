'use client';

import { useState } from 'react';
import WelcomeTour from '@/components/Onboarding/WelcomeTour';
import ShareModal from '@/components/Common/ShareModal';
import EmptyState from '@/components/Common/EmptyState';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';

export default function OnboardingDemoPage() {
  const [showTour, setShowTour] = useState(false);
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    type: 'deal' | 'badge' | 'level';
    data: any;
  }>({
    isOpen: false,
    type: 'deal',
    data: {},
  });

  const handleResetTutorial = () => {
    localStorage.removeItem('hasSeenTutorial');
    setShowTour(true);
  };

  const handleShareDeal = () => {
    setShareModal({
      isOpen: true,
      type: 'deal',
      data: {
        title: 'Sushi Buffet Premium',
        description: 'All-you-can-eat sushi buffet',
        price: '฿299',
        originalPrice: '฿599',
      },
    });
  };

  const handleShareBadge = () => {
    setShareModal({
      isOpen: true,
      type: 'badge',
      data: {
        badgeName: 'Legendary Slayer',
        badgeEmoji: '👑',
      },
    });
  };

  const handleShareLevel = () => {
    setShareModal({
      isOpen: true,
      type: 'level',
      data: {
        level: 25,
        rankTitle: 'Legendary Slayer',
        points: 34000,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-bg dark:to-dark-surface">
      <Toaster position="top-center" richColors />

      {/* Onboarding Tour */}
      {showTour && <WelcomeTour />}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ ...shareModal, isOpen: false })}
        type={shareModal.type}
        data={shareModal.data}
      />

      {/* Header */}
      <header className="glass-auto border-b border-gray-200 dark:border-dark-border sticky top-0 z-40">
        <div className="container-responsive py-4">
          <div>
            <h1 className="text-h2 text-gray-900 dark:text-white">
              🎯 Onboarding & UX Demo
            </h1>
            <p className="text-body-sm text-gray-600 dark:text-gray-400">
              First-Time User Experience & Viral Sharing
            </p>
          </div>
        </div>
      </header>

      <main className="container-responsive py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Welcome Tour */}
          <div className="space-y-6">
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                👋 Welcome Tour
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                A beautiful 3-slide onboarding experience shown only on first visit.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-brand-50 dark:bg-brand-900/10 rounded-xl border border-brand-200 dark:border-brand-800">
                  <h3 className="text-body-sm text-brand-900 dark:text-brand-100 mb-2">
                    ✨ Features
                  </h3>
                  <ul className="text-caption text-brand-700 dark:text-brand-300 space-y-1">
                    <li>• Swipeable carousel (3 slides)</li>
                    <li>• Animated emojis and visuals</li>
                    <li>• Skip button (respects user time)</li>
                    <li>• Only shown once (localStorage check)</li>
                    <li>• Confetti on completion 🎉</li>
                  </ul>
                </div>

                <button
                  onClick={handleResetTutorial}
                  className="w-full btn-primary"
                >
                  🔄 Reset & Show Tutorial
                </button>
              </div>
            </motion.div>

            {/* Empty States */}
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📭 Empty States
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Beautiful empty states instead of blank pages
              </p>

              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
                  <EmptyState type="wallet" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Share System */}
          <div className="space-y-6">
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📱 Smart Share Cards
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Instagram Story-style shareable cards (9:16 aspect ratio)
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-sm text-purple-900 dark:text-purple-100 mb-2">
                    🎨 Features
                  </h3>
                  <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• Auto-generates beautiful cards</li>
                    <li>• Download as image (PNG)</li>
                    <li>• Native share (Web Share API)</li>
                    <li>• Copy link fallback</li>
                    <li>• Optimized for Instagram/Facebook Stories</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleShareDeal}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-semibold shadow-lg transition-all press-effect"
                  >
                    🎁 Share Deal Card
                  </button>

                  <button
                    onClick={handleShareBadge}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl font-semibold shadow-lg transition-all press-effect"
                  >
                    🏆 Share Badge Card
                  </button>

                  <button
                    onClick={handleShareLevel}
                    className="w-full px-6 py-4 bg-gradient-to-r from-brand-500 to-orange-600 hover:from-brand-600 hover:to-orange-700 text-white rounded-2xl font-semibold shadow-lg transition-all press-effect"
                  >
                    ⚡ Share Level-Up Card
                  </button>
                </div>
              </div>
            </motion.div>

            {/* More Empty States */}
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                More Empty States
              </h2>

              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
                  <EmptyState type="chat" />
                </div>

                <div className="border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
                  <EmptyState type="badges" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Integration Guide */}
        <motion.div
          className="card p-8 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-h2 text-gray-900 dark:text-white mb-4">
            🔌 Integration Guide
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Welcome Tour */}
            <div className="space-y-3">
              <h3 className="font-semibold text-brand-600 dark:text-brand-400">
                1. Welcome Tour
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <code className="text-xs text-gray-700 dark:text-gray-300">
                  {`import WelcomeTour from '@/components/Onboarding/WelcomeTour';

// In your root layout or homepage:
<WelcomeTour />

// That's it! Auto-triggers on first visit`}
                </code>
              </div>
            </div>

            {/* Share Modal */}
            <div className="space-y-3">
              <h3 className="font-semibold text-purple-600 dark:text-purple-400">
                2. Share Modal
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <code className="text-xs text-gray-700 dark:text-gray-300">
                  {`import ShareModal from '@/components/Common/ShareModal';

const [shareModal, setShareModal] = useState({
  isOpen: false,
  type: 'deal',
  data: {...}
});

<ShareModal {...shareModal} />`}
                </code>
              </div>
            </div>

            {/* Empty State */}
            <div className="space-y-3">
              <h3 className="font-semibold text-green-600 dark:text-green-400">
                3. Empty State
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <code className="text-xs text-gray-700 dark:text-gray-300">
                  {`import EmptyState from '@/components/Common/EmptyState';

{coupons.length === 0 ? (
  <EmptyState type="wallet" />
) : (
  <CouponList />
)}`}
                </code>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="mt-8 p-6 bg-gradient-to-br from-brand-50 to-orange-50 dark:from-brand-900/10 dark:to-orange-900/10 rounded-2xl border border-brand-200 dark:border-brand-800">
            <h3 className="font-bold text-brand-900 dark:text-brand-100 mb-4">
              💡 Best Practices
            </h3>
            <ul className="grid md:grid-cols-2 gap-3 text-body-sm text-brand-700 dark:text-brand-300">
              <li>✅ Show WelcomeTour only on homepage (not every page)</li>
              <li>✅ Add share buttons on product pages and achievements</li>
              <li>✅ Use EmptyState instead of "No items" text</li>
              <li>✅ Reward users for sharing (+200 points)</li>
              <li>✅ Test native share on mobile devices</li>
              <li>✅ Make share cards visually stunning (people screenshot!)</li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
