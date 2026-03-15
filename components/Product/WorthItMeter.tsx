'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react';
import { voteWorthIt, getUserVote, getProductReviews } from '@/lib/reviewData';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface WorthItMeterProps {
  productId: string;
}

export default function WorthItMeter({ productId }: WorthItMeterProps) {
  const [worthItCount, setWorthItCount] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    const reviews = getProductReviews(productId);
    if (reviews) {
      setWorthItCount(reviews.worthItCount);
      setTotalVotes(reviews.totalVotes);
    }
    setUserVote(getUserVote(productId));
  }, [productId]);

  const handleVote = (isWorthIt: boolean) => {
    const success = voteWorthIt(productId, isWorthIt);
    
    if (success) {
      setUserVote(isWorthIt ? 'yes' : 'no');
      setTotalVotes(prev => prev + 1);
      if (isWorthIt) {
        setWorthItCount(prev => prev + 1);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
        toast.success('ขอบคุณที่บอกว่าคุ้ม! 👍', { icon: '✨' });
      } else {
        toast.success('ขอบคุณสำหรับความคิดเห็น 👎');
      }
    } else {
      toast.error('คุณโหวตไปแล้ว');
    }
  };

  if (totalVotes === 0) return null;

  const percentage = Math.round((worthItCount / totalVotes) * 100);
  const isHighlyRated = percentage >= 80;
  const isMediumRated = percentage >= 60 && percentage < 80;

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-6 shadow-md border-2 border-purple-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-gray-900">คุ้มไหม?</h3>
        </div>
        <span className="text-xs text-gray-500">
          {totalVotes.toLocaleString()} คน โหวต
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-end justify-between mb-2">
          <span className="text-sm text-gray-600">Worth It Score</span>
          <motion.span
            key={percentage}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-3xl font-black ${
              isHighlyRated
                ? 'text-green-600'
                : isMediumRated
                ? 'text-orange-600'
                : 'text-red-600'
            }`}
          >
            {percentage}%
          </motion.span>
        </div>

        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isHighlyRated
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : isMediumRated
                ? 'bg-gradient-to-r from-orange-400 to-amber-500'
                : 'bg-gradient-to-r from-red-400 to-rose-500'
            }`}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="text-green-600 font-semibold flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" />
            {worthItCount} คุ้ม
          </span>
          <span className="text-red-600 font-semibold flex items-center gap-1">
            <ThumbsDown className="w-3 h-3" />
            {totalVotes - worthItCount} ผ่าน
          </span>
        </div>
      </div>

      {/* Message */}
      <div className={`rounded-xl p-4 mb-4 text-center ${
        isHighlyRated
          ? 'bg-green-100 border-2 border-green-300'
          : isMediumRated
          ? 'bg-orange-100 border-2 border-orange-300'
          : 'bg-red-100 border-2 border-red-300'
      }`}>
        <p className={`font-bold text-sm ${
          isHighlyRated
            ? 'text-green-800'
            : isMediumRated
            ? 'text-orange-800'
            : 'text-red-800'
        }`}>
          {isHighlyRated
            ? '🔥 คนส่วนใหญ่บอกว่าคุ้ม!'
            : isMediumRated
            ? '👍 ส่วนใหญ่ให้คะแนนดี'
            : '⚠️ ควรพิจารณาให้ดี'}
        </p>
        <p className={`text-xs mt-1 ${
          isHighlyRated
            ? 'text-green-700'
            : isMediumRated
            ? 'text-orange-700'
            : 'text-red-700'
        }`}>
          {percentage}% ของผู้ใช้งานบอกว่า "คุ้ม"
        </p>
      </div>

      {/* Voting Buttons */}
      {!userVote ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleVote(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <ThumbsUp className="w-5 h-5" />
            คุ้ม!
          </button>
          <button
            onClick={() => handleVote(false)}
            className="bg-gradient-to-r from-gray-400 to-slate-500 hover:from-gray-500 hover:to-slate-600 text-white py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <ThumbsDown className="w-5 h-5" />
            ผ่านก่อน
          </button>
        </div>
      ) : (
        <div className={`rounded-xl p-4 text-center ${
          userVote === 'yes'
            ? 'bg-green-100 border-2 border-green-300'
            : 'bg-gray-100 border-2 border-gray-300'
        }`}>
          <p className={`font-bold text-sm flex items-center justify-center gap-2 ${
            userVote === 'yes' ? 'text-green-800' : 'text-gray-800'
          }`}>
            {userVote === 'yes' ? (
              <>
                <ThumbsUp className="w-5 h-5 fill-current" />
                คุณบอกว่าคุ้ม!
              </>
            ) : (
              <>
                <ThumbsDown className="w-5 h-5 fill-current" />
                คุณบอกว่าผ่านก่อน
              </>
            )}
          </p>
          <p className="text-xs mt-1 text-gray-600">
            ขอบคุณสำหรับความคิดเห็น
          </p>
        </div>
      )}
    </div>
  );
}
