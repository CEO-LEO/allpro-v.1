'use client';

import { motion } from 'framer-motion';
import { Wallet, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  type: 'wallet' | 'chat' | 'notifications' | 'badges';
}

export default function EmptyState({ type }: EmptyStateProps) {
  const config = {
    wallet: {
      icon: Wallet,
      emoji: '💸',
      title: 'Your wallet is light...',
      subtitle: "Let's fill it up with amazing deals!",
      titleTH: 'กระเป๋าคุณยังว่างเปล่า...',
      subtitleTH: 'มาหาคูปองดีๆ กันเถอะ!',
      buttonText: 'Find Deals',
      buttonTextTH: 'หาดีล',
      buttonHref: '/',
      buttonColor: 'from-green-500 to-emerald-600',
    },
    chat: {
      icon: Sparkles,
      emoji: '🤖',
      title: "I'm lonely...",
      subtitle: 'Ask me about Pizza, Sushi, or anything!',
      titleTH: 'ฉันเหงา...',
      subtitleTH: 'ลองถามฉันเกี่ยวกับพิซซ่า ซูชิ หรืออะไรก็ได้!',
      buttonText: 'Say Hello',
      buttonTextTH: 'ทักทาย',
      buttonHref: '#',
      buttonColor: 'from-blue-500 to-purple-600',
    },
    notifications: {
      icon: Search,
      emoji: '🔔',
      title: 'No notifications yet',
      subtitle: "We'll notify you when something exciting happens!",
      titleTH: 'ยังไม่มีการแจ้งเตือน',
      subtitleTH: 'เราจะแจ้งเตือนคุณเมื่อมีอะไรน่าสนใจ!',
      buttonText: 'Explore Deals',
      buttonTextTH: 'สำรวจดีล',
      buttonHref: '/',
      buttonColor: 'from-brand-500 to-brand-600',
    },
    badges: {
      icon: Sparkles,
      emoji: '🏆',
      title: 'No badges yet',
      subtitle: 'Complete actions to unlock achievements!',
      titleTH: 'ยังไม่มี Badge',
      subtitleTH: 'ทำภารกิจเพื่อปลดล็อค Achievement!',
      buttonText: 'Start Earning',
      buttonTextTH: 'เริ่มสะสม',
      buttonHref: '/gamification-demo',
      buttonColor: 'from-yellow-500 to-orange-600',
    },
  };

  const { icon: Icon, emoji, title, subtitle, titleTH, subtitleTH, buttonText, buttonTextTH, buttonHref, buttonColor } = config[type];

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Icon */}
      <motion.div
        className="relative mb-6"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-purple-500/20 rounded-full blur-2xl" />
        
        {/* Icon Circle */}
        <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center shadow-soft">
          <div className="text-5xl">
            {emoji}
          </div>
        </div>

        {/* Floating Sparkles */}
        <motion.div
          className="absolute -top-2 -right-2 text-2xl"
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ✨
        </motion.div>
      </motion.div>

      {/* Text Content */}
      <motion.div
        className="space-y-2 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-h2 text-gray-900 dark:text-white">
          {titleTH}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm">
          {subtitleTH}
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        {buttonHref === '#' ? (
          <button
            className={`px-8 py-4 bg-gradient-to-r ${buttonColor} text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all press-effect`}
          >
            {buttonTextTH}
          </button>
        ) : (
          <Link
            href={buttonHref}
            className={`inline-block px-8 py-4 bg-gradient-to-r ${buttonColor} text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all press-effect`}
          >
            {buttonTextTH}
          </Link>
        )}
      </motion.div>

      {/* Decorative Elements */}
      <div className="mt-8 flex items-center gap-2 opacity-30">
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full" />
        <div className="text-caption text-gray-400">ว่างเปล่า</div>
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full" />
      </div>
    </motion.div>
  );
}
