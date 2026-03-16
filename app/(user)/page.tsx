'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, Store, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { getPromotions } from '@/lib/getPromotions';
import QuickServices from '@/components/QuickServices';
import TrendingTags from '@/components/TrendingTags';
import EnhancedPromoCard from '@/components/Home/EnhancedPromoCard';
import HomeCategoryGrid from '@/components/Home/HomeCategoryGrid';
import ServiceGrid from '@/components/Home/ServiceGrid';
import Infographic from '@/components/Home/Infographic';

// Dynamic imports for performance
const NearbyGems = dynamic(() => import('@/components/Home/NearbyGems'), {
  loading: () => <NearbyGemsLoader />,
  ssr: false
});

const NearbyDeals = dynamic(() => import('@/components/Home/NearbyDeals'), {
  ssr: false
});

// Loader component for NearbyGems
function NearbyGemsLoader() {
  return (
    <div className="py-8">
      <div className="px-4 mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex gap-4 px-4 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 w-72">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const NAVBAR_CATEGORIES = ['All', 'Food', 'Fashion', 'Travel', 'Gadget', 'Beauty'];

const ITEMS_PER_PAGE = 6;

export default function Home() {
  const { user, checkAuth, selectedCategory, setSelectedCategory } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Get all promotions from promotions.json
  const allPromotions = useMemo(() => getPromotions(), []);

  // Fetch data on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Filter promotions with memoization
  const filteredProducts = useMemo(() => {
    return allPromotions.filter((promo) => {
      const matchesSearch = 
        promo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promo.shop_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || promo.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [allPromotions, searchQuery, selectedCategory]);

  // Products to display
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Load more products
  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredProducts.length));
      setIsLoadingMore(false);
    }, 500);
  }, [filteredProducts.length]);

  // Reset visible products when filter changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedCategory]);

  // Masonry breakpoints
  const breakpointColumnsObj = {
    default: 4,
    1536: 4,
    1280: 3,
    1024: 3,
    768: 2,
    640: 1,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      {/* Debug Navigation */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-h4 text-orange-600">🔥 Pro Hunter</Link>
          <div className="flex gap-2">
            <Link 
              href="/debug-promo"
              className="text-caption bg-yellow-200 text-yellow-800 px-3 py-1.5 rounded-full hover:bg-yellow-300 transition-colors font-medium"
            >
              🔧 Debug Promo
            </Link>
            <Link 
              href="/rewards"
              className="text-caption bg-purple-200 text-purple-800 px-3 py-1.5 rounded-full hover:bg-purple-300 transition-colors font-medium"
            >
              🎁 Rewards
            </Link>
          </div>
        </div>
      </div>
      
      {/* Merchant CTA Banner */}
      {user?.role !== 'merchant' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg"
        >
          <div className="max-w-[1800px] mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 flex-shrink-0" />
                <p className="text-body-sm font-medium">
                  <span className="hidden sm:inline">Own a business? </span>
                  <span className="font-bold">Reach 10,000+ customers</span>
                </p>
              </div>
              <Link 
                href="/merchant-landing"
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-full font-bold text-button hover:bg-blue-50 transition-all whitespace-nowrap"
              >
                <span>Join Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-4">
        
        {/* Quick Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <QuickServices />
        </motion.div>

        {/* Trending Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <TrendingTags />
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative mb-6 max-w-2xl mx-auto"
        >
          <input
            type="text"
            placeholder="ค้นหาโปรโมชั่น... 🔍"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-14 pr-4 rounded-full border-2 border-gray-200 shadow-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-200 focus:outline-none transition-all text-body-lg"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
          
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-5 top-1/2 -translate-y-1/2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-label font-bold"
            >
              {filteredProducts.length} ผลลัพธ์
            </motion.div>
          )}
        </motion.div>

        {/* Category Grid — แบบใหม่แยกกลุ่ม (แฟชั่นผู้หญิง, แฟชั่นผู้ชาย, กระเป๋า ฯลฯ) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <HomeCategoryGrid />
        </motion.div>

        {/* Service Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-8"
        >
          <ServiceGrid />
        </motion.div>

        {/* Infographic Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Infographic />
        </motion.div>

        {/* Nearby Deals Section (Location-based) */}
        {selectedCategory === 'All' && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mb-8"
          >
            <NearbyDeals products={allPromotions.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              price: p.price,
              originalPrice: p.price,
              promoPrice: p.price,
              discount: p.discount_rate || 0,
              image: p.image,
              category: p.category,
              shopName: p.shop_name,
              shopId: p.merchantId,
              verified: p.is_verified,
              validUntil: p.valid_until,
              tags: p.tags
            }))} />
          </motion.div>
        )}

        {/* Nearby Gems Section */}
        {selectedCategory === 'All' && !searchQuery && allPromotions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <NearbyGems promos={allPromotions.slice(0, 8).map((p) => ({
              ...p,
              distance: Math.random() * 3,
            }))} />
          </motion.div>
        )}

        {/* Results Header */}
        <motion.div
          id="all-promotions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 scroll-mt-24"
        >
          <h2 className="text-h2 text-gray-900">
            {searchQuery ? 'ผลการค้นหา' : selectedCategory === 'All' ? 'โปรโมชั่นทั้งหมด' : selectedCategory}
          </h2>
          <p className="text-body-sm text-gray-600 mt-1">
            พบ {filteredProducts.length} โปรโมชั่น
          </p>
        </motion.div>

        {/* Enhanced Grid Layout */}
        {displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProducts.map((promo, index) => (
                <EnhancedPromoCard 
                  key={promo.id}
                  promo={promo}
                  index={index}
                />
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredProducts.length && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 text-center"
              >
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      กำลังโหลด...
                    </span>
                  ) : (
                    `ดูเพิ่มเติม (${filteredProducts.length - visibleCount})`
                  )}
                </button>
              </motion.div>
            )}

            {/* End of Results */}
            {visibleCount >= filteredProducts.length && filteredProducts.length > ITEMS_PER_PAGE && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="inline-block bg-gradient-to-r from-green-100 to-emerald-100 px-6 py-3 rounded-full">
                  <p className="text-green-800 font-bold">
                    🎉 คุณดูครบทั้งหมดแล้ว!
                  </p>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          // Empty State
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-h2 text-gray-900 mb-2">
                ไม่พบโปรโมชั่นที่คุณค้นหา
              </h3>
              <p className="text-gray-600 mb-6">
                ลองค้นหาด้วยคำอื่น หรือเปลี่ยนหมวดหมู่
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold hover:shadow-xl transition-all"
              >
                ดูโปรโมชั่นทั้งหมด
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
