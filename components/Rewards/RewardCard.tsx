'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Reward } from '@/lib/rewardTypes';
import { usePoints } from '@/lib/pointsContext';
import { Coins, Package } from 'lucide-react';

interface RewardCardProps {
  reward: Reward;
}

export default function RewardCard({ reward }: RewardCardProps) {
  const { points, redeemReward } = usePoints();
  const canAfford = points >= reward.pointsCost;
  const isLowStock = reward.stock < 10;

  const handleRedeem = () => {
    redeemReward(reward);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`
        bg-white rounded-2xl overflow-hidden border-2 shadow-lg
        transition-all duration-300
        ${canAfford ? 'border-yellow-400 hover:shadow-yellow-200' : 'border-gray-200 hover:shadow-gray-200'}
      `}
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <Image
          src={reward.imageUrl}
          alt={reward.name}
          fill
          className="object-cover"
          unoptimized
        />
        
        {/* Hot Badge */}
        {reward.category === 'hot_deals' && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
            🔥 HOT
          </div>
        )}

        {/* Low Stock Badge */}
        {isLowStock && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            เหลือน้อย!
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-xs text-gray-500 font-semibold mb-1">{reward.brand}</p>
        
        {/* Name */}
        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
          {reward.name}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {reward.description}
        </p>

        {/* Stock */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <Package size={14} />
          <span>เหลือ: <span className={isLowStock ? 'text-red-600 font-bold' : 'font-semibold'}>{reward.stock}</span></span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 mb-3" />

        {/* Bottom Section */}
        <div className="flex items-center justify-between">
          {/* Points Cost */}
          <div className="flex items-center gap-1.5">
            <Coins className="text-yellow-500" size={20} />
            <span className={`font-bold text-lg ${canAfford ? 'text-yellow-600' : 'text-gray-400'}`}>
              {reward.pointsCost}
            </span>
            <span className="text-xs text-gray-500">แต้ม</span>
          </div>

          {/* Redeem Button */}
          <motion.button
            whileHover={canAfford ? { scale: 1.05 } : {}}
            whileTap={canAfford ? { scale: 0.95 } : {}}
            onClick={handleRedeem}
            disabled={!canAfford || reward.stock === 0}
            className={`
              px-5 py-2.5 rounded-xl font-bold text-sm
              transition-all duration-300 shadow-md
              ${
                canAfford && reward.stock > 0
                  ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white hover:shadow-yellow-300'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {reward.stock === 0 ? 'หมดแล้ว' : canAfford ? 'แลกเลย!' : 'แต้มไม่พอ'}
          </motion.button>
        </div>
      </div>

      {/* Shine Effect on Hover */}
      {canAfford && (
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          whileHover={{ x: '100%', opacity: 0.3 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none"
        />
      )}
    </motion.div>
  );
}
