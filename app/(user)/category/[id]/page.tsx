'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import {
  ShoppingBagIcon,
  CakeIcon,
  HeartIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { getPromotions } from '@/lib/getPromotions';
import EnhancedPromoCard from '@/components/Home/EnhancedPromoCard';

const CATEGORY_META = {
  all: { label: 'ทั้งหมด', labelEn: 'All', color: 'from-red-600 to-orange-500', icon: ShoppingBagIcon },
  Food: { label: 'อาหาร', labelEn: 'Food', color: 'from-rose-600 to-orange-500', icon: CakeIcon },
  Fashion: { label: 'แฟชั่น', labelEn: 'Fashion', color: 'from-fuchsia-600 to-pink-500', icon: ShoppingBagIcon },
  Travel: { label: 'ท่องเที่ยว', labelEn: 'Travel', color: 'from-blue-600 to-cyan-500', icon: GlobeAltIcon },
  Gadget: { label: 'อุปกรณ์', labelEn: 'Gadget', color: 'from-indigo-600 to-blue-500', icon: DevicePhoneMobileIcon },
  Beauty: { label: 'ความงาม', labelEn: 'Beauty', color: 'from-pink-600 to-rose-500', icon: HeartIcon },
} as const;

type CategoryKey = keyof typeof CATEGORY_META;
const CATEGORY_KEYS = Object.keys(CATEGORY_META) as CategoryKey[];

type SortMode = 'relevance' | 'discount' | 'price-low' | 'price-high';

function resolveCategory(rawId: string): CategoryKey {
  const id = rawId.trim().toLowerCase();
  if (id === 'all') return 'all';
  if (id === 'food') return 'Food';
  if (id === 'fashion') return 'Fashion';
  if (id === 'travel') return 'Travel';
  if (id === 'gadget') return 'Gadget';
  if (id === 'beauty') return 'Beauty';
  return 'all';
}

export default function CategoryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const routeId = decodeURIComponent(params.id || 'all');
  const activeCategory = resolveCategory(routeId);
  const categoryMeta = CATEGORY_META[activeCategory];
  const Icon = categoryMeta.icon;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('relevance');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const promotions = useMemo(() => {
    let items = getPromotions();

    // Filter by category
    if (activeCategory !== 'all') {
      items = items.filter((promo) => promo.category === activeCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.shop_name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortMode === 'discount') {
      items = [...items].sort((a, b) => (b.discount_rate || 0) - (a.discount_rate || 0));
    } else if (sortMode === 'price-low') {
      items = [...items].sort((a, b) => a.price - b.price);
    } else if (sortMode === 'price-high') {
      items = [...items].sort((a, b) => b.price - a.price);
    }

    return items;
  }, [activeCategory, searchQuery, sortMode]);

  const handleCategorySwitch = (key: CategoryKey) => {
    router.push(`/category/${encodeURIComponent(key === 'all' ? 'all' : key)}`);
  };

  const SORT_OPTIONS: { value: SortMode; label: string }[] = [
    { value: 'relevance', label: 'แนะนำ' },
    { value: 'discount', label: 'ลดมากสุด' },
    { value: 'price-low', label: 'ราคาต่ำ → สูง' },
    { value: 'price-high', label: 'ราคาสูง → ต่ำ' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Category header - scrolls normally under sticky white navbar */}
      <div className={`bg-gradient-to-r ${categoryMeta.color} text-white relative z-10 shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:bg-white/20 p-2 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{categoryMeta.label}</h1>
                  <p className="text-sm text-white/80">{categoryMeta.labelEn}</p>
                </div>
              </div>
            </div>
            <span className="bg-white/20 text-sm px-3 py-1 rounded-full font-medium">
              {promotions.length} รายการ
            </span>
          </div>
        </div>
      </div>

      {/* Category Switching Pills */}
      <div className="bg-white border-b border-gray-200 sticky top-[64px] z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORY_KEYS.map((key) => {
            const meta = CATEGORY_META[key];
            const isActive = key === activeCategory;
            return (
              <button
                key={key}
                onClick={() => handleCategorySwitch(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Search + Sort Bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ค้นหาในหมวดนี้..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all text-sm"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Sort Button */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="h-11 px-4 rounded-xl border border-gray-300 bg-white flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              <span className="hidden sm:inline">
                {SORT_OPTIONS.find((o) => o.value === sortMode)?.label}
              </span>
            </button>

            <AnimatePresence>
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowSortMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-40"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortMode(opt.value);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          sortMode === opt.value
                            ? 'bg-orange-50 text-orange-600 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Product Grid */}
        {promotions.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {promotions.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.4) }}
              >
                <EnhancedPromoCard promo={promo} index={index} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">ไม่พบโปรโมชั่นในหมวดนี้</h2>
              <p className="text-gray-600 mb-6">ลองค้นหาด้วยคำอื่น หรือดูหมวดหมู่อื่น</p>
              <Link
                href="/category/all"
                className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold hover:shadow-lg transition-all"
              >
                ดูโปรโมชั่นทั้งหมด
              </Link>
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
