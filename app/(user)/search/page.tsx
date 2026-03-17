'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftIcon, FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PromoCard from '@/components/PromoCard';
import { Promotion } from '@/lib/types';

/*
 * Expected API Response: GET /api/promotions/search?q=xxx&category=xxx
 * Response: { promotions: Promotion[], total: number }
 *
 * Promotion interface (from @/lib/types):
 * {
 *   id: string;
 *   shop_name: string;
 *   title: string;
 *   description: string;
 *   price: number;
 *   discount_rate: number;
 *   image: string;
 *   category: string;
 *   location: string;
 *   is_verified: boolean;
 *   is_sponsored: boolean;
 *   search_volume: number;
 *   valid_until: string;       // ISO date
 *   views: number;
 *   saves: number;
 * }
 */

const SORT_OPTIONS = [
  { value: 'popular', label: 'ยอดนิยม' },
  { value: 'newest', label: 'ใหม่ล่าสุด' },
  { value: 'discount', label: 'ส่วนลดสูงสุด' },
  { value: 'ending', label: 'ใกล้หมดเวลา' },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'verified', label: 'ร้านค้าที่ตรวจสอบแล้ว' },
  { value: 'online', label: 'ออนไลน์' },
  { value: 'nearby', label: 'ใกล้ฉัน' },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const query = searchParams.get('q') || '';
  
  const [searchText, setSearchText] = useState(query);
  const [sortBy, setSortBy] = useState('popular');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // ── API-Ready State ──
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // TODO: Replace with actual API call
  // useEffect(() => {
  //   const fetchPromotions = async () => {
  //     setIsLoading(true);
  //     setIsError(false);
  //     try {
  //       const params = new URLSearchParams();
  //       if (searchText) params.set('q', searchText);
  //       if (category) params.set('category', category);
  //       const res = await fetch(`/api/promotions/search?${params}`);
  //       if (!res.ok) throw new Error('Failed to fetch');
  //       const data = await res.json();
  //       setPromotions(data.promotions);
  //     } catch {
  //       setIsError(true);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchPromotions();
  // }, [searchText, category]);

  useEffect(() => {
    // Simulate loading delay — remove when connecting real API
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Filter promotions based on category or search query
  const filteredPromotions = promotions.filter(promo => {
    if (category) {
      return promo.category.includes(category) || 
             promo.title.includes(category) ||
             promo.description.includes(category);
    }
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return promo.title.toLowerCase().includes(searchLower) ||
             promo.description.toLowerCase().includes(searchLower) ||
             promo.shop_name.toLowerCase().includes(searchLower) ||
             promo.category.toLowerCase().includes(searchLower);
    }
    return true;
  });

  // Apply additional filters
  const finalPromotions = filteredPromotions.filter(promo => {
    if (filterBy === 'verified') return promo.is_verified;
    if (filterBy === 'online') return promo.location.includes('ออนไลน์');
    return true;
  });

  // Sort promotions
  const sortedPromotions = [...finalPromotions].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.id.localeCompare(a.id);
      case 'discount':
        return b.discount_rate - a.discount_rate;
      case 'ending':
        return new Date(a.valid_until).getTime() - new Date(b.valid_until).getTime();
      default: // popular
        return (b.views || 0) - (a.views || 0);
    }
  });

  const displayTitle = category || searchText || 'ค้นหาโปรโมชั่น';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="hover:bg-white/10 p-2 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <h1 className="text-h3">{displayTitle}</h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="ค้นหาโปรโมชั่น, ร้านค้า, หมวดหมู่..."
              className="w-full px-12 py-3 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="sticky top-[144px] z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Results Count */}
            <p className="text-body-sm text-gray-600">
              {isLoading ? (
                <span className="inline-block h-4 w-20 bg-gray-200 rounded animate-pulse" />
              ) : (
                <>พบ <span className="font-bold text-orange-600">{sortedPromotions.length}</span> รายการ</>
              )}
            </p>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-body-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  showFilters
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className="w-4 h-4" />
                <span className="text-body-sm">Filter</span>
              </button>
            </div>
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 pt-3 mt-3 border-t">
                  {FILTER_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFilterBy(option.value)}
                      className={`px-4 py-2 rounded-full text-body-sm transition-all ${
                        filterBy === option.value
                          ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-h3 text-gray-800 mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-gray-600 mb-6">ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              ลองใหม่
            </button>
          </div>
        ) : sortedPromotions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedPromotions.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <PromoCard promo={promo} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-h3 text-gray-800 mb-2">ไม่พบโปรโมชั่น</h3>
            <p className="text-gray-600 mb-6">
              {category 
                ? `ไม่พบโปรโมชั่นในหมวด "${category}"`
                : searchText
                ? `ไม่พบผลลัพธ์สำหรับ "${searchText}"`
                : 'ลองค้นหาด้วยคำอื่น'
              }
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              กลับหน้าแรก
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
