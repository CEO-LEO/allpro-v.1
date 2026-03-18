'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/solid';
import {
  ShoppingBagIcon,
  CakeIcon,
  HeartIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  SparklesIcon,
  BeakerIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  FireIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

// ============================================
// CATEGORY META (route → display info) — lightweight, keep client-side
// ============================================
const CATEGORY_META = {
  all: { label: 'ทั้งหมด', labelEn: 'All', color: 'from-red-600 to-pink-600', icon: ShoppingBagIcon },
  Food: { label: 'อาหาร', labelEn: 'Food', color: 'from-red-600 to-pink-600', icon: CakeIcon },
  Fashion: { label: 'แฟชั่น', labelEn: 'Fashion', color: 'from-red-600 to-pink-600', icon: ShoppingBagIcon },
  Travel: { label: 'ท่องเที่ยว', labelEn: 'Travel', color: 'from-red-600 to-pink-600', icon: GlobeAltIcon },
  Gadget: { label: 'อุปกรณ์', labelEn: 'Gadget', color: 'from-red-600 to-pink-600', icon: DevicePhoneMobileIcon },
  Beauty: { label: 'ความงาม', labelEn: 'Beauty', color: 'from-red-600 to-pink-600', icon: HeartIcon },
} as const;

type CategoryKey = keyof typeof CATEGORY_META;

// ============================================
// INTERFACES — expected API response shape
// ============================================
// TODO: API Response → GET /api/categories/:categoryKey
// {
//   categoryGroups: CategoryGroup[],
//   brands: Brand[],
// }

interface SubcategoryItem {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface CategoryGroup {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  subcategories: SubcategoryItem[];
}

type BrandCategory = 'แฟชั่น' | 'อาหาร' | 'เครื่องดื่ม' | 'อิเล็กทรอนิกส์' | 'ความงาม' | 'ซูเปอร์มาร์เก็ต' | 'ท่องเที่ยว' | 'สุขภาพ';

interface Brand {
  id: string;
  name: string;
  logo: string;
  category: BrandCategory;
  promoCount: number;
  rating: number;
  isHot?: boolean;
  discount?: string;
  color: string;
}

const BRAND_CATEGORIES: { id: BrandCategory; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'แฟชั่น', label: 'แฟชั่น', icon: SparklesIcon },
  { id: 'อาหาร', label: 'อาหาร', icon: CakeIcon },
  { id: 'เครื่องดื่ม', label: 'เครื่องดื่ม', icon: BeakerIcon },
  { id: 'อิเล็กทรอนิกส์', label: 'อิเล็กทรอนิกส์', icon: DevicePhoneMobileIcon },
  { id: 'ความงาม', label: 'ความงาม', icon: HeartIcon },
  { id: 'ซูเปอร์มาร์เก็ต', label: 'ซูเปอร์มาร์เก็ต', icon: BuildingStorefrontIcon },
  { id: 'ท่องเที่ยว', label: 'ท่องเที่ยว', icon: GlobeAltIcon },
  { id: 'สุขภาพ', label: 'สุขภาพ', icon: ShieldCheckIcon },
];

// Map route category to brand categories for filtering
const CATEGORY_TO_BRAND: Record<string, BrandCategory[]> = {
  all: ['แฟชั่น', 'อาหาร', 'เครื่องดื่ม', 'อิเล็กทรอนิกส์', 'ความงาม', 'ซูเปอร์มาร์เก็ต', 'ท่องเที่ยว', 'สุขภาพ'],
  Fashion: ['แฟชั่น'],
  Food: ['อาหาร', 'เครื่องดื่ม', 'ซูเปอร์มาร์เก็ต'],
  Travel: ['ท่องเที่ยว'],
  Gadget: ['อิเล็กทรอนิกส์'],
  Beauty: ['ความงาม', 'สุขภาพ'],
};

// ============================================
// HELPERS
// ============================================
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

  const [selectedTab, setSelectedTab] = useState('สินค้า');
  const [brandFilter, setBrandFilter] = useState<BrandCategory | 'ทั้งหมด'>('ทั้งหมด');

  // ── API-Ready State ──
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemCount, setItemCount] = useState(0);

  // TODO: Replace with API call → GET /api/categories/:activeCategory
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // const res = await fetch(`/api/categories/${activeCategory}`);
        // const data = await res.json();
        // setCategoryGroups(data.categoryGroups);
        // setBrands(data.brands);
        // setItemCount(data.totalItems ?? 0);
        await new Promise(r => setTimeout(r, 500));
        setCategoryGroups([]);
        setBrands([]);
        setItemCount(0);
      } catch {
        setCategoryGroups([]);
        setBrands([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeCategory]);

  // Filter brands for current category
  const relevantBrandCategories = CATEGORY_TO_BRAND[activeCategory] || [];

  const allRelevantBrands = useMemo(
    () => brands.filter((b) => relevantBrandCategories.includes(b.category)),
    [brands, activeCategory]
  );

  const filteredBrands = useMemo(() => {
    if (brandFilter === 'ทั้งหมด') return allRelevantBrands;
    return allRelevantBrands.filter((b) => b.category === brandFilter);
  }, [allRelevantBrands, brandFilter]);

  const hotBrands = useMemo(
    () => allRelevantBrands.filter((b) => b.isHot),
    [allRelevantBrands]
  );

  const relevantBrandCats = useMemo(
    () => BRAND_CATEGORIES.filter((c) => relevantBrandCategories.includes(c.id)),
    [activeCategory]
  );

  // Category switching
  const CATEGORY_KEYS = Object.keys(CATEGORY_META) as CategoryKey[];
  const handleCategorySwitch = (key: CategoryKey) => {
    router.push(`/category/${encodeURIComponent(key === 'all' ? 'all' : key)}`);
  };

  // ── Loading Skeleton ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className={`bg-gradient-to-r ${categoryMeta.color} text-white relative z-10`}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg animate-pulse" />
              <div className="h-6 w-20 bg-white/30 rounded animate-pulse flex-1" />
              <div className="h-7 w-20 bg-white/20 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
          {Array.from({ length: 3 }).map((_, gi) => (
            <div key={gi}>
              <div className="flex items-center gap-3 mb-5 px-2">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-gray-200 animate-pulse">
                    <div className="w-14 h-14 bg-gray-200 rounded-lg" />
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Red Header */}
      <div className={`bg-gradient-to-r ${categoryMeta.color} text-white relative z-10`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:bg-white/20 p-2 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold flex-1">All Pro</h1>
            <span className="bg-white/20 text-sm px-3 py-1 rounded-full font-medium">
              {itemCount} รายการ
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation — สินค้า / แบรนด์ */}
      <div className="bg-white border-b sticky top-[64px] z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {['สินค้า', 'แบรนด์'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-4 px-2 font-semibold transition-colors relative ${
                  selectedTab === tab ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {selectedTab === tab && (
                  <motion.div
                    layoutId="cat-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Switching Pills */}
      <div className="bg-white border-b border-gray-100">
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
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {selectedTab === 'สินค้า' ? (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {categoryGroups.length > 0 ? (
                categoryGroups.map((group, groupIndex) => {
                  const GIcon = group.icon;
                  return (
                    <div key={group.id} className="mb-10">
                      {/* Group Header */}
                      <div className="flex items-center justify-between mb-5 px-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center shadow-md`}>
                            <GIcon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-800">{group.name}</h3>
                        </div>
                        <Link
                          href={`/categories/${encodeURIComponent(group.id)}?group=${encodeURIComponent(group.id)}`}
                          className="text-sm text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
                        >
                          ดูทั้งหมด →
                        </Link>
                      </div>

                      {/* Subcategories Grid */}
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 xl:grid-cols-12 gap-4">
                        {group.subcategories.map((subcat, index) => {
                          const SubIcon = subcat.icon;
                          return (
                            <motion.div
                              key={subcat.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: groupIndex * 0.05 + index * 0.02 }}
                            >
                              <Link
                                href={`/categories/${encodeURIComponent(subcat.id)}?group=${encodeURIComponent(group.id)}`}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-red-200 hover:shadow-md transition-all group"
                              >
                                <div className={`w-14 h-14 rounded-lg bg-gray-100 group-hover:bg-gradient-to-br group-hover:${group.color} flex items-center justify-center transition-all shadow-sm`}>
                                  <SubIcon className="w-7 h-7 text-gray-600 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-xs font-medium text-center leading-tight text-gray-700 group-hover:text-red-600 transition-colors">
                                  {subcat.name}
                                </span>
                              </Link>
                            </motion.div>
                          );
                        })}

                        {/* "อื่นๆ" button */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: groupIndex * 0.05 + group.subcategories.length * 0.02 }}
                        >
                          <Link
                            href={`/categories/${encodeURIComponent(group.id)}?group=${encodeURIComponent(group.id)}`}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-red-200 hover:shadow-md transition-all group"
                          >
                            <div className="w-14 h-14 rounded-lg bg-red-50 group-hover:bg-gradient-to-br group-hover:from-red-100 group-hover:to-pink-100 flex items-center justify-center transition-all">
                              <span className="text-lg font-bold text-red-600">+</span>
                            </div>
                            <span className="text-xs font-bold text-center leading-tight text-red-600">
                              อื่นๆ
                            </span>
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Empty State — สินค้า */
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBagIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">ยังไม่มีสินค้า/โปรโมชั่นในหมวดหมู่นี้</h3>
                  <p className="text-sm text-gray-500">ข้อมูลหมวดหมู่จะแสดงเมื่อเชื่อมต่อ API</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="brands"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Hot Brands */}
              {hotBrands.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <FireIcon className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-bold text-gray-800">แบรนด์ยอดนิยม</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {hotBrands.map((brand, index) => (
                      <motion.div
                        key={brand.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <Link
                          href={`/search?brand=${brand.id}`}
                          className="relative flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all group overflow-hidden"
                        >
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <FireIcon className="w-3 h-3" /> HOT
                          </div>
                          <div className={`w-16 h-16 rounded-2xl ${brand.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform overflow-hidden`}>
                            <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain rounded-lg" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=EF4444&color=fff&size=128`; }} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors">{brand.name}</p>
                            {brand.discount && <p className="text-xs text-red-500 font-medium mt-0.5">{brand.discount}</p>}
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <StarIcon className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs text-gray-500">{brand.rating}</span>
                              <span className="text-xs text-gray-400">• {brand.promoCount} โปร</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Filter */}
              {relevantBrandCats.length > 1 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TagIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">กรองตามหมวดหมู่</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setBrandFilter('ทั้งหมด')}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                        brandFilter === 'ทั้งหมด' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200 hover:text-red-600'
                      }`}
                    >
                      ทั้งหมด ({allRelevantBrands.length})
                    </button>
                    {relevantBrandCats.map((cat) => {
                      const count = allRelevantBrands.filter((b) => b.category === cat.id).length;
                      const CIcon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setBrandFilter(cat.id)}
                          className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                            brandFilter === cat.id ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200 hover:text-red-600'
                          }`}
                        >
                          <CIcon className="w-3.5 h-3.5" />
                          {cat.label} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Brands Grid */}
              <div className="mb-8">
                {filteredBrands.length > 0 ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      {brandFilter === 'ทั้งหมด' ? 'แบรนด์ทั้งหมด' : `แบรนด์ — ${brandFilter}`}
                      <span className="text-sm text-gray-400 font-normal ml-2">({filteredBrands.length})</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {filteredBrands.map((brand, index) => (
                        <motion.div
                          key={brand.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          layout
                        >
                          <Link
                            href={`/search?brand=${brand.id}`}
                            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all group relative"
                          >
                            <div className={`w-14 h-14 rounded-xl ${brand.color} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all overflow-hidden`}>
                              <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain rounded-md" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=EF4444&color=fff&size=128`; }} />
                            </div>
                            <div className="text-center w-full">
                              <p className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors truncate">{brand.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{brand.category}</p>
                              {brand.discount && (
                                <div className="mt-1.5 bg-red-50 text-red-600 text-[11px] font-semibold py-1 px-2 rounded-full inline-block">{brand.discount}</div>
                              )}
                              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                                <StarIcon className="w-3 h-3 text-yellow-400" />
                                <span className="text-xs text-gray-500">{brand.rating}</span>
                                <span className="text-xs text-gray-300">|</span>
                                <span className="text-xs text-gray-500">{brand.promoCount} โปร</span>
                              </div>
                            </div>
                            {brand.isHot && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Empty State — แบรนด์ */
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TagIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">ยังไม่มีข้อมูลแบรนด์</h3>
                    <p className="text-sm text-gray-500">ข้อมูลจะแสดงเมื่อเชื่อมต่อ API</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
