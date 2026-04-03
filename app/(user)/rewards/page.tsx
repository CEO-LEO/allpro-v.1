'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Coins, Sparkles, Gift, AlertCircle, Check, ShoppingBag, TrendingUp, ChevronRight, Flame, Pizza, Film, ShoppingCart, Heart, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import LoginModal from '@/components/Auth/LoginModal';
import { useProductStore } from '@/store/useProductStore';
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';

/*
 * Expected API Response: GET /api/rewards
 * Response: {
 *   rewards: RewardItem[],
 *   pointsBalance: number,
 *   redeemedIds: string[],
 *   categories: { id: string; label: string; icon: string }[]
 * }
 *
 * interface RewardItem {
 *   id: string;
 *   name: string;
 *   description: string;
 *   emoji: string;
 *   pointsCost: number;
 *   featured?: boolean;
 *   image?: string;
 *   category?: string;        // 'food-drink' | 'entertainment' | 'shopping' | 'wellness'
 * }
 */

interface RewardItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  pointsCost: number;
  featured?: boolean;
  image?: string;
  category?: string;
}

type CategoryType = 'all' | 'food-drink' | 'entertainment' | 'shopping' | 'wellness';

const categories = [
  { id: 'all', label: 'All Rewards' },
  { id: 'food-drink', label: 'Food & Drink' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'wellness', label: 'Wellness' },
];

export default function RewardsPage() {
  const { user } = useAuthStore();
  const [pointsBalance, setPointsBalance] = useState(0);
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([]);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Saved deals from product store
  const { products, savedProductIds } = useProductStore();
  const savedProducts = products.filter(p => savedProductIds.includes(p.id));

  // ── API-Ready State ──
  const [rewardsCatalog, setRewardsCatalog] = useState<RewardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // TODO: Replace with actual API call
  // useEffect(() => {
  //   const fetchRewards = async () => {
  //     setIsLoading(true);
  //     setIsError(false);
  //     try {
  //       const res = await fetch('/api/rewards');
  //       if (!res.ok) throw new Error('Failed to fetch');
  //       const data = await res.json();
  //       setRewardsCatalog(data.rewards);
  //       setPointsBalance(data.pointsBalance);
  //       setRedeemedRewards(data.redeemedIds || []);
  //     } catch {
  //       setIsError(true);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchRewards();
  // }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRedeemReward = async (reward: RewardItem) => {
    if (!user) {
      toast.error('Please login to redeem rewards');
      return;
    }

    if (pointsBalance < reward.pointsCost) {
      toast.error('Insufficient points');
      return;
    }

    if (redeemedRewards.includes(reward.id)) {
      toast.error('Already redeemed this reward');
      return;
    }

    setRedeemingId(reward.id);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const success = Math.random() > 0.1; // 90% success rate

    if (success) {
      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Success toast
      toast.success(
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold">Reward Redeemed!</p>
            <p className="text-body-sm text-gray-600">{reward.name} has been added to your wallet</p>
          </div>
        </div>
      );

      setPointsBalance(prev => prev - reward.pointsCost);
      setRedeemedRewards(prev => [...prev, reward.id]);
      setTimeout(() => {
        setRedeemingId(null);
      }, 600);
    } else {
      toast.error('Failed to redeem reward');
      setRedeemingId(null);
    }
  };

  const filteredRewards = selectedCategory === 'all' 
    ? rewardsCatalog 
    : rewardsCatalog.filter(reward => reward.category === selectedCategory);

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-orange-600" />
            </div>
            <h2 className="text-h2 text-gray-900 mb-2">Login Required</h2>
            <p className="text-body text-gray-600 mb-6">Please login to access the rewards shop</p>
            <button 
              onClick={() => setShowLoginModal(true)}
              className="btn-primary"
            >
              Login Now
            </button>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Modal */}
      <AnimatePresence>
        {redeemedRewards.length > 0 && redeemingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-h2 text-gray-900 mb-2">Reward Unlocked!</h3>
              <p className="text-body text-gray-600 mb-6">Your reward has been added to your wallet</p>
              <Link href="/profile/wallet" className="btn-primary w-full">
                View in Wallet
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Rewards
            </Link>
            <Link 
              href="/profile/wallet"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm hover:shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              My Wallet
            </Link>
          </div>
        </div>
      </header>

      {/* Points Balance Banner */}
      <div className="max-w-6xl mx-auto px-4 py-5">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-xl px-5 py-4 shadow-md relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-0 w-28 h-28 bg-white rounded-full blur-2xl" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs font-medium mb-0.5">แต้มสะสมของคุณ</p>
              <div className="flex items-center gap-2.5">
                <Coins className="w-6 h-6 text-white" />
                <span className="text-3xl font-bold text-white">
                  {pointsBalance.toLocaleString()}
                </span>
                <span className="text-base font-medium text-white/80">Points</span>
              </div>
            </div>

            <Link
              href="/profile/wallet"
              className="flex flex-col items-center gap-1 bg-white/15 backdrop-blur-sm px-4 py-2.5 rounded-lg hover:bg-white/25 transition-all group"
            >
              <TrendingUp className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              <span className="text-white font-medium text-xs">ดูประวัติ</span>
            </Link>
          </div>

          {/* Saved link */}
          {savedProducts.length > 0 && (
            <Link
              href="/saved"
              className="relative z-10 mt-2 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs font-medium hover:bg-white/30 transition-all"
            >
              <Bookmark className="w-3.5 h-3.5" />
              ดูดีลที่บันทึกไว้ ({savedProducts.length})
            </Link>
          )}
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2.5 mt-3">
          <div className="bg-white rounded-xl px-3 py-3 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-gray-100">
            <div className="mb-1 flex justify-center"><Gift className="w-5 h-5 text-orange-500" /></div>
            <p className="text-xs text-slate-500">แลกได้</p>
            <p className="text-base font-semibold text-gray-900">
              {rewardsCatalog.filter(r => r.pointsCost <= pointsBalance).length}
            </p>
          </div>
          <div className="bg-white rounded-xl px-3 py-3 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-gray-100">
            <div className="mb-1 flex justify-center"><Flame className="w-5 h-5 text-red-500" /></div>
            <p className="text-xs text-slate-500">ดีลเด็ด</p>
            <p className="text-base font-semibold text-gray-900">
              {rewardsCatalog.filter(r => r.featured).length}
            </p>
          </div>
          <div className="bg-white rounded-xl px-3 py-3 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-gray-100">
            <div className="mb-1 flex justify-center"><Sparkles className="w-5 h-5 text-purple-500" /></div>
            <p className="text-xs text-slate-500">ของรางวัล</p>
            <p className="text-base font-semibold text-gray-900">{rewardsCatalog.length}</p>
          </div>
        </div>

        {/* Saved Deals Section */}
        {savedProducts.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold text-gray-900">โปรโมชั่นที่บันทึกไว้</h3>
              </div>
              <Link href="/saved" className="text-xs text-orange-500 font-medium hover:text-orange-600">
                ดูทั้งหมด ({savedProducts.length})
              </Link>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {savedProducts.slice(0, 6).map((product) => (
                <Link
                  key={product.id}
                  href={`/promo/${product.id}`}
                  className="flex-shrink-0 w-28 group"
                >
                  <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <img
                      src={resolveImageUrl(product.image, getCategoryFallbackImage(product.category))}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2 leading-tight">{product.title}</p>
                  {product.promoPrice && (
                    <p className="text-xs font-semibold text-orange-500 mt-0.5">฿{product.promoPrice}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="sticky top-[57px] z-30 bg-white/80 backdrop-blur-sm border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-2.5">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as CategoryType)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                    : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-pulse">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full" />
                </div>
                <div className="space-y-3 text-center">
                  <div className="h-5 bg-gray-200 rounded w-2/3 mx-auto" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : rewardsCatalog.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">ยังไม่มีของรางวัลในขณะนี้</h3>
            <p className="text-sm text-gray-500">กลับมาตรวจสอบใหม่เร็วๆ นี้</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward, index) => {
            const isRedeemed = redeemedRewards.includes(reward.id);
            const canAfford = pointsBalance >= reward.pointsCost;
            const isRedeeming = redeemingId === reward.id;

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-xl p-5 shadow-[0_1px_6px_rgba(0,0,0,0.06)] border transition-all ${
                  reward.featured ? 'border-orange-300 shadow-md' : 'border-gray-100'
                } ${!canAfford && !isRedeemed ? 'opacity-60' : ''}`}
              >
                {/* Redeemed Badge */}
                {isRedeemed && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-caption font-bold shadow-md">
                    ✓ Redeemed
                  </div>
                )}

                {/* Emoji/Image */}
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">{reward.emoji}</div>
                </div>

                {/* Content */}
                <div className="text-center">
                  {/* Title */}
                  <h3 className="text-h3 text-gray-900 mb-2 line-clamp-2">
                    {reward.name}
                  </h3>

                  {/* Description */}
                  <p className="text-body text-gray-600 mb-4 line-clamp-3">
                    {reward.description}
                  </p>

                  {/* Cost */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <span className="text-h2 text-gray-900">
                      {reward.pointsCost}
                    </span>
                    <span className="text-body text-gray-600">points</span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleRedeemReward(reward)}
                    disabled={!canAfford || isRedeemed || isRedeeming}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isRedeemed
                        ? 'bg-green-50 text-green-700 cursor-not-allowed'
                        : !canAfford
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        : isRedeeming
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 hover:shadow-md active:scale-[0.98]'
                    }`}
                  >
                    {isRedeeming ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                        Redeeming...
                      </div>
                    ) : isRedeemed ? (
                      'Already Redeemed'
                    ) : !canAfford ? (
                      `Need ${(reward.pointsCost - pointsBalance).toLocaleString()} more points`
                    ) : (
                      'Redeem Now'
                    )}
                  </button>
                </div>

                {/* Featured Badge */}
                {reward.featured && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 rounded-full text-caption font-bold">
                    Featured
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        )}

        {/* Tips Section */}
        <div className="mt-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-h4 text-gray-900 mb-2">How to Earn More Points</h3>
              <ul className="text-body text-gray-600 space-y-1">
                <li>• Complete daily check-ins (+10 points)</li>
                <li>• Share promotions with friends (+5 points each)</li>
                <li>• Write reviews for stores (+15 points each)</li>
                <li>• Participate in community discussions (+20 points)</li>
                <li>• Refer new users to the platform (+50 points)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Redeemed Count */}
        <div className="mt-8 text-center">
          <p className="text-body text-gray-600">
            You have redeemed <span className="font-bold text-gray-900">{redeemedRewards.length}</span> reward{redeemedRewards.length !== 1 ? 's' : ''} so far!
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4">
          <div>
            <h3 className="text-lg font-bold mb-1">Want More Points?</h3>
            <p className="text-sm text-white/80">Hunt for more promotions and earn points!</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 bg-white text-orange-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            ล่าโปรเลย
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}