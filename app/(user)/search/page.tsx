'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftIcon, FunnelIcon } from '@heroicons/react/24/solid';
import { Search } from 'lucide-react';
import PromoCard from '@/components/PromoCard';
import ShopSearchBar from '@/components/Common/ShopSearchBar';
import { getPromotions } from '@/lib/getPromotions';
import { Promotion } from '@/lib/types';

/*
 * Search Results Page — /search?q=xxx&category=xxx
 *
 * Data Source: getPromotions() from promotions.json (local)
 * TODO: Replace with API call — GET /api/promotions/search?q=xxx&category=xxx
 */

const SORT_OPTIONS = [
  { value: 'popular', label: 'ยอดนิยม' },
  { value: 'newest', label: 'ใหม่ล่าสุด' },
  { value: 'discount', label: 'ส่วนลดสูงสุด' },
  { value: 'ending', label: 'ใกล้หมดเวลา' },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'verified', label: 'ร้านยืนยันแล้ว' },
  { value: 'online', label: 'ออนไลน์' },
  { value: 'nearby', label: 'ใกล้ฉัน' },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get('category') || '';
  const query = searchParams.get('q') || '';

  const [searchText, setSearchText] = useState(query);
  const [sortBy, setSortBy] = useState('popular');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // โหลดข้อมูลโปรโมชั่นทั้งหมดจาก getPromotions
  const allPromotions = useMemo(() => getPromotions(), []);

  // จำลอง loading delay (ลบเมื่อเชื่อม API จริง)
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [searchText, category]);

  // Sync searchText เมื่อ URL query เปลี่ยน (เช่น กด Back)
  useEffect(() => {
    setSearchText(query);
  }, [query]);

  // กรองตาม keyword + category
  const filteredPromotions = useMemo(() => {
    return allPromotions.filter((promo) => {
      // ตรงกับ category (ถ้ามี)
      if (category && promo.category !== category &&
          !promo.title.includes(category) &&
          !promo.description.includes(category)) {
        return false;
      }
      // ตรงกับคำค้นหา
      if (searchText) {
        const q = searchText.toLowerCase();
        return (
          promo.title.toLowerCase().includes(q) ||
          promo.description.toLowerCase().includes(q) ||
          promo.shop_name.toLowerCase().includes(q) ||
          promo.category.toLowerCase().includes(q) ||
          (promo.tags || []).some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allPromotions, searchText, category]);

  // กรองเพิ่มเติม (verified / online)
  const afterFilter = useMemo(() => {
    if (filterBy === 'verified') return filteredPromotions.filter((p) => p.is_verified);
    if (filterBy === 'online')   return filteredPromotions.filter((p) => p.location.includes('ออนไลน์'));
    return filteredPromotions;
  }, [filteredPromotions, filterBy]);

  // เรียงลำดับ
  const sortedPromotions = useMemo(() => {
    return [...afterFilter].sort((a, b) => {
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
  }, [afterFilter, sortBy]);

  // กด Enter หรือคลิกค้นหา → อัปเดต URL
  const handleSearch = () => {
    const trimmed = searchText.trim();
    if (!trimmed && !category) return;
    const params = new URLSearchParams();
    if (trimmed) params.set('q', trimmed);
    if (category) params.set('category', category);
    router.push(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const displayTitle = query
    ? `ผลลัพธ์การค้นหาสำหรับ: "${query}"`
    : category
    ? `หมวดหมู่: ${category}`
    : 'ค้นหาโปรโมชั่น';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ── Header (Light Mode — white bg, orange search bar) ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Row 1: Back + Title */}
          <div className="flex items-center gap-3 mb-3">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {displayTitle}
            </h1>
          </div>

          {/* Row 2: Search bar (orange border, rounded-full — เหมือนหน้า Home) */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400 pointer-events-none" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ค้นหาโปรโมชั่น, ร้านค้า..."
              className="w-full h-12 pl-11 pr-28 rounded-full border-2 border-orange-400 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-base text-gray-700 placeholder:text-gray-400"
            />
            <button
              onClick={handleSearch}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>ค้นหา</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Filters & Sort Bar ── */}
      <div className="sticky top-[118px] z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-4">
            {/* Results Count */}
            <p className="text-sm text-gray-600">
              {isLoading ? (
                <span className="inline-block h-4 w-20 bg-gray-200 rounded animate-pulse" />
              ) : (
                <>
                  พบ{' '}
                  <span className="font-bold text-orange-600">
                    {sortedPromotions.length}
                  </span>{' '}
                  รายการ
                </>
              )}
            </p>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  showFilters
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Filter Options (expandable) */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-3 mt-2 border-t border-gray-100">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilterBy(opt.value)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        filterBy === opt.value
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Shop Search Section ── */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <p className="text-sm font-medium text-gray-700">ค้นหาร้านค้า</p>
        </div>
        <ShopSearchBar />
      </div>

      {/* ── Results ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Skeleton Loading */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse"
              >
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
        ) : sortedPromotions.length > 0 ? (
          /* Results Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedPromotions.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.4) }}
              >
                <PromoCard promo={promo} />
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-orange-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              ไม่พบโปรโมชั่น
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {query
                ? `ไม่พบผลลัพธ์สำหรับ "${query}" — ลองค้นหาคำอื่น`
                : category
                ? `ไม่พบโปรโมชั่นในหมวด "${category}"`
                : 'ลองพิมพ์ชื่อสินค้า ร้านค้า หรือหมวดหมู่ที่ต้องการ'}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold hover:shadow-lg transition-shadow"
            >
              กลับหน้าแรก
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
