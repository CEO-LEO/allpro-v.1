'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftIcon, FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PromoCard from '@/components/PromoCard';
import { Promotion } from '@/lib/types';

// Mock promotions data
const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: '1',
    shop_name: 'Starbucks Thailand',
    title: 'ลดสูงสุด 50% ทุกเมนู',
    description: 'ลดสูงสุด 50% ทุกเมนู เฉพาะสมาชิก',
    price: 150,
    discount_rate: 50,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
    category: 'เครื่องดื่ม',
    location: 'สาขาเซ็นทรัลเวิลด์',
    is_verified: true,
    is_sponsored: false,
    search_volume: 1250,
    valid_until: '2026-03-31',
    views: 2340,
    saves: 456,
  },
  {
    id: '2',
    shop_name: 'KFC Thailand',
    title: 'ซื้อ 1 แถม 1',
    description: 'ซื้อ 1 แถม 1 ทุกเมนู',
    price: 299,
    discount_rate: 50,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500',
    category: 'อาหาร',
    location: 'ทุกสาขา',
    is_verified: true,
    is_sponsored: true,
    search_volume: 3450,
    valid_until: '2026-04-15',
    views: 5670,
    saves: 890,
  },
  {
    id: '3',
    shop_name: 'Nike Store',
    title: 'Sale สูงสุด 60%',
    description: 'Sale สูงสุด 60% รองเท้าผ้าใบ',
    price: 3990,
    discount_rate: 60,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    category: 'แฟชั่น',
    location: 'สาขาสยามพารากอน',
    is_verified: true,
    is_sponsored: false,
    search_volume: 2100,
    valid_until: '2026-03-20',
    views: 4200,
    saves: 678,
  },
  {
    id: '4',
    shop_name: "L'Oréal Paris",
    title: 'ลด 80% ครีมบำรุงผิว',
    description: 'ส่วนลดสูงสุด 80% สำหรับผลิตภัณฑ์ดูแลผิว',
    price: 890,
    discount_rate: 80,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500',
    category: 'ความงาม',
    location: 'ออนไลน์',
    is_verified: true,
    is_sponsored: false,
    search_volume: 1890,
    valid_until: '2026-03-25',
    views: 3450,
    saves: 567,
  },
  {
    id: '5',
    shop_name: 'Central Department Store',
    title: 'Flash Sale รองเท้าผู้ชาย',
    description: 'Flash Sale รองเท้าผู้ชาย ลดสูงสุด 70%',
    price: 2990,
    discount_rate: 70,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    category: 'แฟชั่นผู้ชาย',
    location: 'ทุกสาขา',
    is_verified: true,
    is_sponsored: true,
    search_volume: 2890,
    valid_until: '2026-03-18',
    views: 6780,
    saves: 1234,
  },
  {
    id: '6',
    shop_name: 'Bootsnall',
    title: 'ลดสูงสุด 55% รองเท้าแตะ',
    description: 'ส่วนลดพิเศษ รองเท้าแตะทุกรุ่น',
    price: 399,
    discount_rate: 55,
    image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500',
    category: 'แฟชั่นผู้ชาย',
    location: 'สาขาเซ็นทรัล',
    is_verified: true,
    is_sponsored: false,
    search_volume: 890,
    valid_until: '2026-04-01',
    views: 1234,
    saves: 234,
  },
];

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

  // Filter promotions based on category or search query
  const filteredPromotions = MOCK_PROMOTIONS.filter(promo => {
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
              พบ <span className="font-bold text-orange-600">{sortedPromotions.length}</span> รายการ
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
        {sortedPromotions.length > 0 ? (
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
