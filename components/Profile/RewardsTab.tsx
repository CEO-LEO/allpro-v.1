'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Reward } from '@/data/profileData';
import { Coins, ShoppingBag, X, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';

interface RewardsTabProps {
  rewards: Reward[];
  userPoints: number;
  onRedeem?: (rewardId: string) => void;
}

export default function RewardsTab({ rewards, userPoints, onRedeem }: RewardsTabProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRedeem = () => {
    if (selectedReward) {
      onRedeem?.(selectedReward.id);
      setSelectedReward(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const canAfford = (cost: number) => userPoints >= cost;

  return (
    <>
      {/* User Points Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 mb-8 flex items-center justify-between shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">Your Balance</p>
            <p className="text-4xl font-bold text-white">{userPoints.toLocaleString()}</p>
            <p className="text-white/60 text-xs">Points</p>
          </div>
        </div>
        <Sparkles className="w-12 h-12 text-white/40" />
      </motion.div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward, index) => {
          const affordable = canAfford(reward.pointsCost);
          
          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden
                border-2 transition-all duration-300
                ${affordable && reward.available
                  ? 'border-yellow-500/30 hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20 cursor-pointer'
                  : 'border-gray-700/30 opacity-60'
                }
              `}
              onClick={() => affordable && reward.available && setSelectedReward(reward)}
            >
              {/* Image */}
              <div className="relative h-40 bg-gray-900">
                <Image
                  src={reward.imageUrl}
                  alt={reward.title}
                  fill
                  className="object-cover"
                />
                
                {/* Overlay for unavailable */}
                {!reward.available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <p className="text-white font-bold">Out of Stock</p>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                  <p className="text-xs font-semibold text-white capitalize">{reward.category}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-2">{reward.title}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{reward.description}</p>

                {/* Points Cost */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-xl font-bold text-yellow-400">
                      {reward.pointsCost.toLocaleString()}
                    </span>
                  </div>

                  {/* Can't Afford Warning */}
                  {!affordable && reward.available && (
                    <div className="flex items-center gap-1 text-red-400 text-xs">
                      <AlertCircle className="w-4 h-4" />
                      <span>Need {(reward.pointsCost - userPoints).toLocaleString()} more</span>
                    </div>
                  )}

                  {/* Affordable Indicator */}
                  {affordable && reward.available && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="px-3 py-1 bg-green-500 rounded-full"
                    >
                      <span className="text-xs font-bold text-white">Available!</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Redemption Modal */}
      <AnimatePresence>
        {selectedReward && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReward(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1100]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1101] w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl border-2 border-yellow-500/30 overflow-hidden"
            >
              {/* Header */}
              <div className="relative h-48">
                <Image
                  src={selectedReward.imageUrl}
                  alt={selectedReward.title}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setSelectedReward(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedReward.title}</h2>
                <p className="text-gray-400 mb-6">{selectedReward.description}</p>

                {/* Cost */}
                <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400">Cost:</span>
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className="text-2xl font-bold text-yellow-400">
                        {selectedReward.pointsCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Your Balance:</span>
                    <span className="text-lg font-bold text-white">
                      {userPoints.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-px bg-gray-700 my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">After Redemption:</span>
                    <span className={`text-lg font-bold ${userPoints - selectedReward.pointsCost >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(userPoints - selectedReward.pointsCost).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedReward(null)}
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRedeem}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Redeem Now
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1200] bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-6 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">Redeemed Successfully!</p>
              <p className="text-white/80 text-sm">Check your wallet for the reward code</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
