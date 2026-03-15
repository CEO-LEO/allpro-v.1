'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { UserProfile } from '@/data/profileData';
import { Trophy, Coins, FileText, TrendingUp, Sparkles } from 'lucide-react';

interface HunterCardProps {
  profile: UserProfile;
}

export default function HunterCard({ profile }: HunterCardProps) {
  const xpPercentage = (profile.currentXP / profile.nextLevelXP) * 100;

  return (
    <div className="relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-3xl rounded-3xl" />
      
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl border-2 border-yellow-500/30 shadow-2xl overflow-hidden"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl" />

        <div className="relative p-8">
          {/* Header Section */}
          <div className="flex items-start gap-6 mb-8">
            {/* Avatar with Level Badge */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative w-32 h-32 rounded-full border-4 border-yellow-500 shadow-lg shadow-yellow-500/50"
              >
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  fill
                  className="rounded-full object-cover"
                />
              </motion.div>
              
              {/* Level Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-4 border-gray-900 flex items-center justify-center shadow-lg"
              >
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-900">Lv.</p>
                  <p className="text-xl font-bold text-gray-900">{profile.level}</p>
                </div>
              </motion.div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-white">{profile.name}</h2>
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              
              {/* Rank Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-4"
              >
                <Trophy className="w-5 h-5 text-white" />
                <span className="font-bold text-white text-lg">{profile.rank}</span>
              </motion.div>

              {/* XP Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progress to Level {profile.level + 1}</span>
                  <span className="text-sm font-bold text-yellow-400">
                    {profile.currentXP} / {profile.nextLevelXP} XP
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercentage}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 rounded-full relative overflow-hidden"
                  >
                    {/* Shimmer Effect */}
                    <motion.div
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Money Saved */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/30 rounded-2xl p-6 text-center hover:border-green-400/50 transition-all"
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-sm text-gray-400 mb-1">Money Saved</p>
              <p className="text-3xl font-bold text-green-400">฿{profile.moneySaved.toLocaleString()}</p>
            </motion.div>

            {/* Points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border border-yellow-500/30 rounded-2xl p-6 text-center hover:border-yellow-400/50 transition-all"
            >
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Coins className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="text-sm text-gray-400 mb-1">Available Points</p>
              <p className="text-3xl font-bold text-yellow-400">{profile.totalPoints.toLocaleString()}</p>
            </motion.div>

            {/* Community Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6 text-center hover:border-blue-400/50 transition-all"
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-sm text-gray-400 mb-1">Community Posts</p>
              <p className="text-3xl font-bold text-blue-400">{profile.communityPosts}</p>
            </motion.div>
          </div>

          {/* Member Since */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center text-sm text-gray-500"
          >
            Member since {new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
