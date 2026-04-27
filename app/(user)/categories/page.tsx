'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ShoppingBagIcon,
  SparklesIcon,
  CakeIcon,
  HeartIcon,
  BeakerIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  PaperAirplaneIcon,
  TruckIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ScissorsIcon,
  ClipboardDocumentListIcon,
  FireIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/solid';
import { useState, useMemo, useEffect } from 'react';

/*
 * Expected API Response: GET /api/categories
 * Response: {
 *   categoryGroups: CategoryGroup[],
 *   brands: Brand[],
 *   brandCategories: { id: string; label: string }[]
 * }
 *
 * interface CategoryGroup {
 *   id: string;
 *   name: string;
 *   iconName: string;          // mapped to icon component client-side
 *   color: string;             // Tailwind gradient e.g. "from-purple-500 to-pink-500"
 *   subcategories: { id: string; name: string; iconName: string }[];
 * }
 *
 * interface Brand {
 *   id: string;
 *   name: string;
 *   logo: string;
 *   category: string;
 *   promoCount: number;
 *   rating: number;
 *   isHot?: boolean;
 *   discount?: string;
 *   color: string;             // Tailwind bg class e.g. "bg-black"
 * }
 */

// Icon mapping for dynamic icon resolution from API
const ICON_MAP: Record<string, any> = {
  SparklesIcon, ShoppingBagIcon, CakeIcon, HeartIcon, BeakerIcon,
  GlobeAltIcon, ShieldCheckIcon, BuildingStorefrontIcon, PaperAirplaneIcon,
  TruckIcon, HomeIcon, CurrencyDollarIcon, ScissorsIcon,
  ClipboardDocumentListIcon, DevicePhoneMobileIcon: ShoppingBagIcon,
};

interface CategoryGroup {
  id: string;
  name: string;
  icon: any;
  color: string;
  subcategories: { id: string; name: string; icon: any }[];
}

type BrandCategory = string;

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

interface BrandCategoryTab {
  id: string;
  label: string;
  icon: any;
}

// Route mapping for category group IDs → URL slugs
const GROUP_ROUTE_MAP: Record<string, string> = {
  'food-drink': 'food-drink',
  'fashion-beauty': 'fashion-beauty',
  'travel-leisure': 'travel-leisure',
  'tech-gadgets': 'tech-gadgets',
  'health-wellness': 'health-wellness',
  'home-living': 'home-living',
  'services': 'services',
  'finance': 'finance',
};

export default function CategoriesPage() {
  const [selectedTab, setSelectedTab] = useState('สินค้า');
  const [brandFilter, setBrandFilter] = useState<string>('ทั้งหมด');

  // ── API-Ready State ──
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandCategories, setBrandCategories] = useState<BrandCategoryTab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // TODO: Replace with actual API call
  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     setIsLoading(true);
  //     setIsError(false);
  //     try {
  //       const res = await fetch('/api/categories');
  //       if (!res.ok) throw new Error('Failed to fetch');
  //       const data = await res.json();
  //       setCategoryGroups(data.categoryGroups.map((g: any) => ({
  //         ...g,
  //         icon: ICON_MAP[g.iconName] || ShoppingBagIcon,
  //         subcategories: g.subcategories.map((s: any) => ({
  //           ...s,
  //           icon: ICON_MAP[s.iconName] || ShoppingBagIcon,
  //         })),
  //       })));
  //       setBrands(data.brands);
  //       setBrandCategories(data.brandCategories);
  //     } catch {
  //       setIsError(true);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchCategories();
  // }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredBrands = useMemo(() => {
    if (brandFilter === 'ทั้งหมด') return brands;
    return brands.filter(b => b.category === brandFilter);
  }, [brandFilter, brands]);

  const hotBrands = useMemo(() => brands.filter(b => b.isHot), [brands]);

  // ── Loading Skeleton ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white relative z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg animate-pulse" />
              <div className="h-6 w-24 bg-white/30 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
          {Array.from({ length: 4 }).map((_, gi) => (
            <div key={gi}>
              <div className="flex items-center gap-3 mb-5 px-2">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
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

  // ── Error State ──
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-sm text-gray-500 mb-6">ไม่สามารถโหลดหมวดหมู่ได้</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold">ลองใหม่</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:bg-white/20 p-2 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <h1 className="text-h3">IAMROOT AI</h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-[64px] z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setSelectedTab('สินค้า')}
              className={`py-4 px-2 font-semibold transition-colors relative ${
                selectedTab === 'สินค้า'
                  ? 'text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              สินค้า
              {selectedTab === 'สินค้า' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"
                />
              )}
            </button>
            <button
              onClick={() => setSelectedTab('แบรนด์')}
              className={`py-4 px-2 font-semibold transition-colors relative ${
                selectedTab === 'แบรนด์'
                  ? 'text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              แบรนด์
              {selectedTab === 'แบรนด์' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"
                />
              )}
            </button>
          </div>
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
        {categoryGroups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBagIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">ยังไม่มีหมวดหมู่สินค้า</h3>
            <p className="text-sm text-gray-500">ข้อมูลจะแสดงเมื่อเชื่อมต่อ API</p>
          </div>
        ) : (
        categoryGroups.map((group, groupIndex) => {
          const Icon = group.icon;
          
          return (
            <div key={group.id} className="mb-10">
              {/* Group Header */}
              <div className="flex items-center justify-between mb-5 px-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-h3 text-gray-800">{group.name}</h3>
                </div>
                <Link
                  href={`/category/${encodeURIComponent(GROUP_ROUTE_MAP[group.id] || 'all')}`}
                  className="text-body-sm text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
                >
                  ดูทั้งหมด →
                </Link>
              </div>

              {/* Subcategories Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 xl:grid-cols-12 gap-4">
                {group.subcategories.map((subcat, index) => {
                  const SubcatIcon = subcat.icon;
                  return (
                    <motion.div
                      key={subcat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (groupIndex * 0.05) + (index * 0.02) }}
                    >
                      <Link
                        href={`/categories/${encodeURIComponent(subcat.id)}?group=${encodeURIComponent(group.id)}`}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-red-200 hover:shadow-md transition-all group"
                      >
                        <div className={`w-14 h-14 rounded-lg bg-gray-100 group-hover:bg-gradient-to-br group-hover:${group.color} flex items-center justify-center transition-all shadow-sm`}>
                          <SubcatIcon className="w-7 h-7 text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-caption font-medium text-center leading-tight text-gray-700 group-hover:text-red-600 transition-colors">
                          {subcat.name}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (groupIndex * 0.05) + (group.subcategories.length * 0.02) }}
                >
                  <Link
                    href={`/categories/${encodeURIComponent(group.id)}?group=${encodeURIComponent(group.id)}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-red-200 hover:shadow-md transition-all group"
                  >
                    <div className="w-14 h-14 rounded-lg bg-red-50 group-hover:bg-gradient-to-br group-hover:from-red-100 group-hover:to-pink-100 flex items-center justify-center transition-all">
                      <span className="text-h4 font-bold text-red-600">+</span>
                    </div>
                    <span className="text-caption font-bold text-center leading-tight text-red-600">
                      อื่นๆ
                    </span>
                  </Link>
                </motion.div>
              </div>
            </div>
          );
        })
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
              {/* Hot Brands Section */}
              {hotBrands.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <FireIcon className="w-6 h-6 text-red-500" />
                  <h3 className="text-h3 text-gray-800">แบรนด์ยอดนิยม</h3>
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
                        {/* Hot badge */}
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <FireIcon className="w-3 h-3" /> HOT
                        </div>

                        {/* Logo */}
                        <div className={`w-16 h-16 rounded-2xl ${brand.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform overflow-hidden`}>
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-12 h-12 object-contain rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=EF4444&color=fff&size=128`;
                            }}
                          />
                        </div>

                        <div className="text-center">
                          <p className="text-body-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors">{brand.name}</p>
                          {brand.discount && (
                            <p className="text-caption text-red-500 font-medium mt-0.5">{brand.discount}</p>
                          )}
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <StarIcon className="w-3 h-3 text-yellow-400" />
                            <span className="text-caption text-gray-500">{brand.rating}</span>
                            <span className="text-caption text-gray-400">• {brand.promoCount} โปร</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
              )}

              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TagIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-body-sm font-medium text-gray-600">กรองตามหมวดหมู่</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setBrandFilter('ทั้งหมด')}
                    className={`px-4 py-2 rounded-full text-caption font-medium transition-all ${
                      brandFilter === 'ทั้งหมด'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200 hover:text-red-600'
                    }`}
                  >
                    ทั้งหมด ({brands.length})
                  </button>
                  {brandCategories.map((cat) => {
                    const count = brands.filter(b => b.category === cat.id).length;
                    const CatIcon = cat.icon || ShoppingBagIcon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setBrandFilter(cat.id)}
                        className={`px-4 py-2 rounded-full text-caption font-medium transition-all flex items-center gap-1.5 ${
                          brandFilter === cat.id
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200 hover:text-red-600'
                        }`}
                      >
                        <CatIcon className="w-3.5 h-3.5" />
                        {cat.label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* All Brands Grid */}
              {brands.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TagIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">ยังไม่มีข้อมูลแบรนด์</h3>
                  <p className="text-sm text-gray-500">ข้อมูลจะแสดงเมื่อเชื่อมต่อ API</p>
                </div>
              ) : (
              <div className="mb-8">
                <h3 className="text-h3 text-gray-800 mb-4">
                  {brandFilter === 'ทั้งหมด' ? 'แบรนด์ทั้งหมด' : `แบรนด์ — ${brandFilter}`}
                  <span className="text-body-sm text-gray-400 font-normal ml-2">({filteredBrands.length})</span>
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
                        {/* Logo */}
                        <div className={`w-14 h-14 rounded-xl ${brand.color} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all overflow-hidden`}>
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-10 h-10 object-contain rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=EF4444&color=fff&size=128`;
                            }}
                          />
                        </div>

                        {/* Info */}
                        <div className="text-center w-full">
                          <p className="text-body-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors truncate">{brand.name}</p>
                          <p className="text-caption text-gray-400 mt-0.5">{brand.category}</p>
                          {brand.discount && (
                            <div className="mt-1.5 bg-red-50 text-red-600 text-[11px] font-semibold py-1 px-2 rounded-full inline-block">
                              {brand.discount}
                            </div>
                          )}
                          <div className="flex items-center justify-center gap-1.5 mt-1.5">
                            <StarIcon className="w-3 h-3 text-yellow-400" />
                            <span className="text-caption text-gray-500">{brand.rating}</span>
                            <span className="text-caption text-gray-300">|</span>
                            <span className="text-caption text-gray-500">{brand.promoCount} โปร</span>
                          </div>
                        </div>

                        {brand.isHot && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
