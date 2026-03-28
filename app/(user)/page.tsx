'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, Store, Search, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useProductStore, Product } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getPromotions } from '@/lib/getPromotions';
import { Promotion } from '@/lib/types';
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';
import TrendingTags from '@/components/TrendingTags';
import EnhancedPromoCard from '@/components/Home/EnhancedPromoCard';
import CategoryGrid from '@/components/Home/CategoryGrid';
import PromoBannerCarousel from '@/components/Home/PromoBannerCarousel';
import ServiceGrid from '@/components/Home/ServiceGrid';
import Infographic from '@/components/Home/Infographic';
import TagSelectionModal from '@/components/Onboarding/TagSelectionModal';

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

// Convert Product (from store) to Promotion (used by UI components)
function productToPromotion(p: Product): Promotion {
  return {
    id: p.id,
    shop_name: p.shopName,
    title: p.title,
    description: p.description,
    price: p.promoPrice,
    discount_rate: p.discount,
    category: p.category,
    is_verified: p.verified,
    is_sponsored: false,
    is_boosted: p.isBoosted || false,
    boosted_at: p.boostedAt,
    location: p.distance || 'ทุกสาขา',
    search_volume: 0,
    image: resolveImageUrl(p.image, getCategoryFallbackImage(p.category)),
    valid_until: p.validUntil,
    views: 0,
    saves: 0,
    tags: p.tags,
  };
}

export default function Home() {
  const { user, checkAuth, selectedCategory, setSelectedCategory } = useAppStore();
  const { user: authUser } = useAuthStore();
  const storeProducts = useProductStore((s) => s.products);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);

  // Show Tag Selection Modal for first-time users
  useEffect(() => {
    if (authUser && authUser.role === 'USER' && !authUser.onboardingCompleted) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setShowTagModal(true), 800);
      return () => clearTimeout(timer);
    }
  }, [authUser]);

  // Fetch promotions on mount
  useEffect(() => {
    checkAuth();
    async function fetchPromotions() {
      setIsLoading(true);
      try {
        // Load static promotions
        const staticData = getPromotions();

        // Fetch from server-side API (avoids client-side Supabase issues)
        try {
          const res = await fetch('/api/debug-products');
          const json = await res.json();
          const dbProducts = json.data;

          console.log('[Home] API fetch result:', { count: dbProducts?.length, data: dbProducts });

          if (dbProducts && dbProducts.length > 0) {
            const dbPromos: Promotion[] = dbProducts.map((p: Record<string, unknown>) => ({
              id: String(p.id || ''),
              shop_name: String(p.shopName || p.shop_name || 'ร้านค้า'),
              title: String(p.title || ''),
              description: String(p.description || ''),
              price: Number(p.promoPrice || p.price || 0),
              discount_rate: Number(p.discount || p.discount_rate || 0),
              category: String(p.category || 'Other'),
              is_verified: Boolean(p.verified || p.is_verified),
              is_sponsored: Boolean(p.is_sponsored),
              location: String(p.location || p.distance || 'ทุกสาขา'),
              search_volume: 0,
              image: String(p.image || '') || getCategoryFallbackImage(p.category as string),
              valid_until: String(p.validUntil || p.valid_until || new Date(Date.now() + 7 * 86400000).toISOString()),
              views: Number(p.likes || p.views || 0),
              saves: 0,
              tags: Array.isArray(p.tags) ? p.tags as string[] : [],
            }));
            // Merge: DB products first, then static (deduped)
            const dbIds = new Set(dbPromos.map(p => p.id));
            const merged = [...dbPromos, ...staticData.filter(p => !dbIds.has(p.id))];
            console.log('[Home] ✅ Setting promotions:', merged.length, 'items');
            setPromotions(merged);
            setIsLoading(false);
            return;
          } else {
            console.warn('[Home] ⚠️ No DB products, falling back to static');
          }
        } catch (apiErr) {
          console.error('[Home] API fetch failed:', apiErr);
        }

        setPromotions(staticData);
      } catch (err) {
        console.error('Failed to fetch promotions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPromotions();
  }, [checkAuth]);

  // Merge static promotions + store products (merchant-created)
  // Sort boosted promotions to the top, then by creation date
  const allPromotions = useMemo(() => {
    const storePromos = storeProducts.map(productToPromotion);
    // Deduplicate by id
    const ids = new Set(storePromos.map((p) => p.id));
    const staticOnly = promotions.filter((p) => !ids.has(p.id));
    const merged = [...storePromos, ...staticOnly];
    // Sort: boosted first (by boosted_at desc), then rest by newest
    return merged.sort((a, b) => {
      if (a.is_boosted && !b.is_boosted) return -1;
      if (!a.is_boosted && b.is_boosted) return 1;
      if (a.is_boosted && b.is_boosted) {
        return new Date(b.boosted_at || 0).getTime() - new Date(a.boosted_at || 0).getTime();
      }
      return 0; // keep original order for non-boosted
    });
  }, [storeProducts, promotions]);

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

  // Personalized: แนะนำโปรโมชั่นตาม preferred_tags ของผู้ใช้
  const recommendedPromotions = useMemo(() => {
    const tags = authUser?.preferred_tags;
    if (!tags || tags.length === 0) return [];

    const tagsLower = tags.map(t => t.toLowerCase());

    return allPromotions.filter((promo) => {
      // เช็ค category ตรงกับ preferred_tags
      if (tagsLower.includes(promo.category.toLowerCase())) return true;
      // เช็ค tags ของ promo ตรงกับ preferred_tags
      if (promo.tags?.some(t => tagsLower.includes(t.toLowerCase()))) return true;
      return false;
    }).slice(0, 6); // แสดงสูงสุด 6 รายการ
  }, [allPromotions, authUser?.preferred_tags]);

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
    <div className="min-h-screen bg-white">
      {/* Tag Selection Onboarding Modal */}
      <TagSelectionModal 
        isOpen={showTagModal} 
        onClose={() => setShowTagModal(false)} 
      />
      
      {/* Merchant CTA Banner */}
      {user?.role !== 'merchant' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-6">

        {/* Promo Banner Carousel — แบนเนอร์โฆษณาแบบสไลด์ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <PromoBannerCarousel />
        </motion.div>

        {/* Trending Tags — แถบแท็กค้นหาแนะนำ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-10"
        >
          <TrendingTags />
        </motion.div>

        {/* 🌟 Recommended for You — โปรโมชั่นแนะนำตาม preferred_tags */}
        {recommendedPromotions.length > 0 && selectedCategory === 'All' && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  🌟 แนะนำสำหรับคุณ
                </h2>
                <p className="text-body-sm text-gray-500 mt-1">
                  ดีลที่ตรงกับความสนใจของคุณ
                </p>
              </div>
              <button
                onClick={() => setShowTagModal(true)}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 transition-colors"
              >
                ✏️ แก้ไข
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {recommendedPromotions.map((promo, index) => (
                <EnhancedPromoCard 
                  key={`rec-${promo.id}`}
                  promo={promo}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Service Grid — บริการทั้งหมด */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <ServiceGrid />
        </motion.div>

        {/* Infographic Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <Infographic />
        </motion.div>

        {/* Nearby Deals Section (Location-based) */}
        {selectedCategory === 'All' && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mb-12"
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
          className="mb-8 scroll-mt-24"
        >
          <h2 className="text-base font-bold text-gray-900">
            {searchQuery ? 'ผลการค้นหา' : selectedCategory === 'All' ? 'โปรโมชั่นทั้งหมด' : ({'Food':'อาหาร','Fashion':'แฟชั่น','Travel':'ท่องเที่ยว','Gadget':'อุปกรณ์','Beauty':'ความงาม'} as Record<string,string>)[selectedCategory] || selectedCategory}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            พบ {filteredProducts.length} โปรโมชั่น
          </p>
        </motion.div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-20" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : allPromotions.length === 0 ? (
          /* Empty State — No data at all */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 px-4"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Megaphone className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              ยังไม่มีโพสต์หรือโปรโมชั่นในขณะนี้
            </h3>
            <p className="text-gray-400 text-center max-w-sm">
              เมื่อมีโพสต์หรือโปรโมชั่นใหม่ จะแสดงที่นี่
            </p>
          </motion.div>
        ) : displayedProducts.length > 0 ? (
          /* Promotion Grid */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
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
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="inline-block bg-gradient-to-r from-orange-100 to-amber-100 px-6 py-3 rounded-full">
                  <p className="text-orange-800 font-bold">
                    คุณดูครบทั้งหมดแล้ว!
                  </p>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          /* Search/Filter — No results found */
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
