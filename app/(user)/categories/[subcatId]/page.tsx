'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/solid';
import {
  ShoppingBagIcon,
  SparklesIcon,
  CakeIcon,
  HeartIcon,
  BeakerIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { useAppStore, Product } from '@/store/useAppStore';

// ============================================
// SUBCATEGORY METADATA
// ============================================

interface SubcategoryMeta {
  id: string;
  name: string;
  parentGroup: string;
  parentColor: string;
  parentIcon: typeof ShoppingBagIcon;
  keywords: string[];
}

const ALL_SUBCATEGORIES: SubcategoryMeta[] = [
  // แฟชั่นผู้หญิง
  { id: 'รองเท้าผู้หญิง', name: 'รองเท้าผู้หญิง', parentGroup: 'แฟชั่นผู้หญิง', parentColor: 'from-purple-500 to-pink-500', parentIcon: SparklesIcon, keywords: ['รองเท้า', 'ผู้หญิง', 'shoes', 'women'] },
  { id: 'รองเท้าแตะ', name: 'รองเท้าแตะ', parentGroup: 'แฟชั่นผู้หญิง', parentColor: 'from-purple-500 to-pink-500', parentIcon: SparklesIcon, keywords: ['รองเท้าแตะ', 'แตะ', 'sandals'] },
  { id: 'รองเท้าบูท', name: 'รองเท้าบูท', parentGroup: 'แฟชั่นผู้หญิง', parentColor: 'from-purple-500 to-pink-500', parentIcon: SparklesIcon, keywords: ['รองเท้าบูท', 'บูท', 'boots'] },
  { id: 'เสื้อผ้าผู้หญิง', name: 'เสื้อผ้า', parentGroup: 'แฟชั่นผู้หญิง', parentColor: 'from-purple-500 to-pink-500', parentIcon: SparklesIcon, keywords: ['เสื้อผ้า', 'ผู้หญิง', 'เสื้อ', 'clothes'] },
  { id: 'เสื้อ', name: 'เสื้อ', parentGroup: 'แฟชั่นผู้หญิง', parentColor: 'from-purple-500 to-pink-500', parentIcon: SparklesIcon, keywords: ['เสื้อ', 'shirt', 'top'] },
  { id: 'เสื้ออก', name: 'เสื้ออก', parentGroup: 'แฟชั่นผู้หญิง', parentColor: 'from-purple-500 to-pink-500', parentIcon: SparklesIcon, keywords: ['เสื้ออก', 'outerwear'] },
  { id: 'กางเกง', name: 'กางเกง', parentGroup: 'แฟชั่นผู้หญิง', parentColor: 'from-purple-500 to-pink-500', parentIcon: SparklesIcon, keywords: ['กางเกง', 'pants'] },
  { id: 'กระโปรง', name: 'กระโปรง', parentGroup: 'แฟชั่นผู้หญิง', parentColor: 'from-purple-500 to-pink-500', parentIcon: SparklesIcon, keywords: ['กระโปรง', 'skirt'] },
  { id: 'ชุดเดรส', name: 'ชุดเดรส', parentGroup: 'แฟชั่นผู้หญิง', parentColor: 'from-purple-500 to-pink-500', parentIcon: SparklesIcon, keywords: ['เดรส', 'dress', 'ชุดเดรส'] },
  { id: 'เครื่องแต่งกาย', name: 'เครื่องแต่งกาย', parentGroup: 'แฟชั่นผู้หญิง', parentColor: 'from-purple-500 to-pink-500', parentIcon: SparklesIcon, keywords: ['เครื่องแต่งกาย', 'accessories'] },
  { id: 'ชุดโม่ง', name: 'ชุดโม่ง', parentGroup: 'แฟชั่นผู้หญิง', parentColor: 'from-purple-500 to-pink-500', parentIcon: SparklesIcon, keywords: ['ชุดโม่ง'] },
  { id: 'ชุดชั้นใน', name: 'ชุดชั้นใน', parentGroup: 'แฟชั่นผู้หญิง', parentColor: 'from-purple-500 to-pink-500', parentIcon: SparklesIcon, keywords: ['ชุดชั้นใน', 'underwear'] },
  // แฟชั่นผู้ชาย
  { id: 'รองเท้าผู้ชาย', name: 'รองเท้าผู้ชาย', parentGroup: 'แฟชั่นผู้ชาย', parentColor: 'from-indigo-500 to-purple-500', parentIcon: ShoppingBagIcon, keywords: ['รองเท้า', 'ผู้ชาย', 'shoes', 'men'] },
  { id: 'แตะผู้ชาย', name: 'รองเท้าแตะ', parentGroup: 'แฟชั่นผู้ชาย', parentColor: 'from-indigo-500 to-purple-500', parentIcon: ShoppingBagIcon, keywords: ['รองเท้าแตะ', 'ผู้ชาย', 'แตะ'] },
  { id: 'รองเท้าบูทชาย', name: 'รองเท้าบูท', parentGroup: 'แฟชั่นผู้ชาย', parentColor: 'from-indigo-500 to-purple-500', parentIcon: ShoppingBagIcon, keywords: ['บูท', 'ผู้ชาย', 'boots'] },
  { id: 'เสื้อผ้าชาย', name: 'เสื้อผ้า', parentGroup: 'แฟชั่นผู้ชาย', parentColor: 'from-indigo-500 to-purple-500', parentIcon: ShoppingBagIcon, keywords: ['เสื้อผ้า', 'ผู้ชาย'] },
  { id: 'เสื้อชาย', name: 'เสื้อ', parentGroup: 'แฟชั่นผู้ชาย', parentColor: 'from-indigo-500 to-purple-500', parentIcon: ShoppingBagIcon, keywords: ['เสื้อ', 'ผู้ชาย', 'โปโล'] },
  { id: 'เสื้ออกชาย', name: 'เสื้ออก', parentGroup: 'แฟชั่นผู้ชาย', parentColor: 'from-indigo-500 to-purple-500', parentIcon: ShoppingBagIcon, keywords: ['เสื้ออก', 'ผู้ชาย'] },
  { id: 'กางเกงชาย', name: 'กางเกง', parentGroup: 'แฟชั่นผู้ชาย', parentColor: 'from-indigo-500 to-purple-500', parentIcon: ShoppingBagIcon, keywords: ['กางเกง', 'ผู้ชาย'] },
  { id: 'เครื่องแต่งกายชาย', name: 'เครื่องแต่งกาย', parentGroup: 'แฟชั่นผู้ชาย', parentColor: 'from-indigo-500 to-purple-500', parentIcon: ShoppingBagIcon, keywords: ['เครื่องแต่งกาย', 'ผู้ชาย'] },
  { id: 'ชุดโม่งชาย', name: 'ชุดโม่ง', parentGroup: 'แฟชั่นผู้ชาย', parentColor: 'from-indigo-500 to-purple-500', parentIcon: ShoppingBagIcon, keywords: ['ชุดโม่ง', 'ผู้ชาย'] },
  { id: 'ชุดชั้นในชาย', name: 'ชุดชั้นใน', parentGroup: 'แฟชั่นผู้ชาย', parentColor: 'from-indigo-500 to-purple-500', parentIcon: ShoppingBagIcon, keywords: ['ชุดชั้นใน', 'ผู้ชาย'] },
  // กระเป๋า
  { id: 'กระเป๋าสตางค์', name: 'กระเป๋าสตางค์', parentGroup: 'กระเป๋า', parentColor: 'from-amber-500 to-orange-600', parentIcon: ShoppingBagIcon, keywords: ['กระเป๋าสตางค์', 'wallet'] },
  { id: 'กระเป๋าถือ', name: 'กระเป๋าถือ', parentGroup: 'กระเป๋า', parentColor: 'from-amber-500 to-orange-600', parentIcon: ShoppingBagIcon, keywords: ['กระเป๋าถือ', 'handbag'] },
  { id: 'กระเป๋าเป้', name: 'กระเป๋าเป้', parentGroup: 'กระเป๋า', parentColor: 'from-amber-500 to-orange-600', parentIcon: ShoppingBagIcon, keywords: ['กระเป๋าเป้', 'backpack'] },
  { id: 'กระเป๋านักเรียน', name: 'กระเป๋านักเรียน', parentGroup: 'กระเป๋า', parentColor: 'from-amber-500 to-orange-600', parentIcon: ShoppingBagIcon, keywords: ['กระเป๋านักเรียน', 'school bag'] },
  { id: 'กระเป๋าเดินทาง', name: 'กระเป๋าเดินทาง', parentGroup: 'กระเป๋า', parentColor: 'from-amber-500 to-orange-600', parentIcon: ShoppingBagIcon, keywords: ['กระเป๋าเดินทาง', 'luggage'] },
  { id: 'กระเป๋าสะพาย', name: 'กระเป๋าสะพาย', parentGroup: 'กระเป๋า', parentColor: 'from-amber-500 to-orange-600', parentIcon: ShoppingBagIcon, keywords: ['กระเป๋าสะพาย', 'crossbody'] },
  { id: 'กระเป๋าคาดเอว', name: 'กระเป๋าคาดเอว', parentGroup: 'กระเป๋า', parentColor: 'from-amber-500 to-orange-600', parentIcon: ShoppingBagIcon, keywords: ['กระเป๋าคาดเอว', 'belt bag'] },
  // อาหาร
  { id: 'อาหารญี่ปุ่น', name: 'อาหารญี่ปุ่น', parentGroup: 'อาหาร', parentColor: 'from-pink-500 to-rose-500', parentIcon: CakeIcon, keywords: ['อาหารญี่ปุ่น', 'japanese', 'ซูชิ'] },
  { id: 'อาหารไทย', name: 'อาหารไทย', parentGroup: 'อาหาร', parentColor: 'from-pink-500 to-rose-500', parentIcon: CakeIcon, keywords: ['อาหารไทย', 'thai'] },
  { id: 'บุฟเฟ่ต์', name: 'บุฟเฟ่ต์', parentGroup: 'อาหาร', parentColor: 'from-pink-500 to-rose-500', parentIcon: CakeIcon, keywords: ['บุฟเฟ่ต์', 'buffet'] },
  { id: 'ฟาสต์ฟู้ด', name: 'ฟาสต์ฟู้ด', parentGroup: 'อาหาร', parentColor: 'from-pink-500 to-rose-500', parentIcon: CakeIcon, keywords: ['ฟาสต์ฟู้ด', 'fastfood'] },
  { id: 'อาหารทะเล', name: 'อาหารทะเล', parentGroup: 'อาหาร', parentColor: 'from-pink-500 to-rose-500', parentIcon: CakeIcon, keywords: ['อาหารทะเล', 'seafood'] },
  // เครื่องดื่ม
  { id: 'กาแฟ', name: 'กาแฟ', parentGroup: 'เครื่องดื่ม', parentColor: 'from-blue-500 to-cyan-500', parentIcon: BeakerIcon, keywords: ['กาแฟ', 'coffee'] },
  { id: 'ชา', name: 'ชา', parentGroup: 'เครื่องดื่ม', parentColor: 'from-blue-500 to-cyan-500', parentIcon: BeakerIcon, keywords: ['ชา', 'tea'] },
  { id: 'น้ำผลไม้', name: 'น้ำผลไม้', parentGroup: 'เครื่องดื่ม', parentColor: 'from-blue-500 to-cyan-500', parentIcon: BeakerIcon, keywords: ['น้ำผลไม้', 'juice'] },
  { id: 'นม', name: 'นม', parentGroup: 'เครื่องดื่ม', parentColor: 'from-blue-500 to-cyan-500', parentIcon: BeakerIcon, keywords: ['นม', 'milk', 'โปรตีน'] },
  // ท่องเที่ยว
  { id: 'โรงแรม', name: 'โรงแรม', parentGroup: 'ท่องเที่ยว', parentColor: 'from-sky-500 to-blue-600', parentIcon: GlobeAltIcon, keywords: ['โรงแรม', 'hotel'] },
  { id: 'ตั๋วเครื่องบิน', name: 'ตั๋วเครื่องบิน', parentGroup: 'ท่องเที่ยว', parentColor: 'from-sky-500 to-blue-600', parentIcon: GlobeAltIcon, keywords: ['ตั๋วเครื่องบิน', 'flight', 'เครื่องบิน'] },
  { id: 'แพ็คเกจทัวร์', name: 'แพ็คเกจทัวร์', parentGroup: 'ท่องเที่ยว', parentColor: 'from-sky-500 to-blue-600', parentIcon: GlobeAltIcon, keywords: ['แพ็คเกจทัวร์', 'tour'] },
  { id: 'รถเช่า', name: 'รถเช่า', parentGroup: 'ท่องเที่ยว', parentColor: 'from-sky-500 to-blue-600', parentIcon: GlobeAltIcon, keywords: ['รถเช่า', 'car rental'] },
  // ความงาม
  { id: 'เครื่องสำอาง', name: 'เครื่องสำอาง', parentGroup: 'ความงาม', parentColor: 'from-pink-500 to-fuchsia-500', parentIcon: HeartIcon, keywords: ['เครื่องสำอาง', 'cosmetics', 'makeup'] },
  { id: 'ผลิตภัณฑ์ผิว', name: 'ผลิตภัณฑ์ผิว', parentGroup: 'ความงาม', parentColor: 'from-pink-500 to-fuchsia-500', parentIcon: HeartIcon, keywords: ['ผลิตภัณฑ์ผิว', 'skincare', 'ดูแลผิว'] },
  { id: 'ผลิตภัณฑ์ผม', name: 'ผลิตภัณฑ์ผม', parentGroup: 'ความงาม', parentColor: 'from-pink-500 to-fuchsia-500', parentIcon: HeartIcon, keywords: ['ผลิตภัณฑ์ผม', 'haircare'] },
  { id: 'สปา', name: 'สปา', parentGroup: 'ความงาม', parentColor: 'from-pink-500 to-fuchsia-500', parentIcon: HeartIcon, keywords: ['สปา', 'spa', 'นวด'] },
  // สุขภาพ
  { id: 'อาหารเสริม', name: 'อาหารเสริม', parentGroup: 'สุขภาพ', parentColor: 'from-green-500 to-emerald-500', parentIcon: ShieldCheckIcon, keywords: ['อาหารเสริม', 'supplement', 'วิตามิน'] },
  { id: 'ฟิตเนส', name: 'ฟิตเนส', parentGroup: 'สุขภาพ', parentColor: 'from-green-500 to-emerald-500', parentIcon: ShieldCheckIcon, keywords: ['ฟิตเนส', 'fitness', 'gym'] },
  { id: 'โยคะ', name: 'โยคะ', parentGroup: 'สุขภาพ', parentColor: 'from-green-500 to-emerald-500', parentIcon: ShieldCheckIcon, keywords: ['โยคะ', 'yoga'] },
];

const GROUP_CATEGORY_MAP: Record<string, string[]> = {
  'แฟชั่นผู้หญิง': ['แฟชั่นผู้หญิง', 'รองเท้า', 'เครื่องประดับ'],
  'แฟชั่นผู้ชาย': ['แฟชั่นผู้ชาย', 'รองเท้า'],
  'กระเป๋า': ['กระเป๋า'],
  'อาหาร': ['อาหาร', 'ร้านอาหาร'],
  'เครื่องดื่ม': ['เครื่องดื่ม'],
  'ท่องเที่ยว': ['ท่องเที่ยว', 'โรงแรม'],
  'ความงาม': ['ความงาม', 'เครื่องสำอาง', 'สปา'],
  'สุขภาพ': ['สุขภาพ', 'ฟิตเนส'],
};

type SortMode = 'relevance' | 'discount' | 'price-low' | 'price-high';

function matchProduct(product: Product, meta: SubcategoryMeta): boolean {
  const titleLower = product.title.toLowerCase();
  const descLower = (product.description || '').toLowerCase();
  const catLower = product.category.toLowerCase();
  const tagsLower = (product.tags || []).map((t) => t.toLowerCase());

  if (catLower === meta.id.toLowerCase()) return true;

  for (const kw of meta.keywords) {
    const kwLower = kw.toLowerCase();
    if (titleLower.includes(kwLower)) return true;
    if (descLower.includes(kwLower)) return true;
    if (tagsLower.some((t) => t.includes(kwLower))) return true;
  }

  return false;
}

export default function SubcategoryDetailPage() {
  const params = useParams<{ subcatId: string }>();
  const searchParams = useSearchParams();
  const subcatId = decodeURIComponent(params.subcatId || '');
  const groupParam = searchParams.get('group') || '';

  const { products } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('relevance');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const subcatMeta = useMemo(() => {
    const direct = ALL_SUBCATEGORIES.find((s) => s.id === subcatId);
    if (direct) return direct;

    const groupCategories = GROUP_CATEGORY_MAP[subcatId];
    if (groupCategories) {
      return {
        id: subcatId,
        name: subcatId,
        parentGroup: subcatId,
        parentColor: ALL_SUBCATEGORIES.find((s) => s.parentGroup === subcatId)?.parentColor || 'from-gray-500 to-gray-700',
        parentIcon: ALL_SUBCATEGORIES.find((s) => s.parentGroup === subcatId)?.parentIcon || ShoppingBagIcon,
        keywords: groupCategories,
      } as SubcategoryMeta;
    }

    return {
      id: subcatId,
      name: subcatId,
      parentGroup: groupParam || subcatId,
      parentColor: 'from-red-500 to-pink-500',
      parentIcon: ShoppingBagIcon,
      keywords: [subcatId],
    } as SubcategoryMeta;
  }, [subcatId, groupParam]);

  const Icon = subcatMeta.parentIcon;

  const filteredProducts = useMemo(() => {
    let items: Product[];

    const groupCategories = GROUP_CATEGORY_MAP[subcatId];
    if (groupCategories && !ALL_SUBCATEGORIES.find((s) => s.id === subcatId)) {
      items = products.filter((p) =>
        groupCategories.some((cat) => p.category.includes(cat) || cat.includes(p.category))
      );
    } else {
      items = products.filter((p) => matchProduct(p, subcatMeta));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.shopName.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      );
    }

    if (sortMode === 'discount') {
      items = [...items].sort((a, b) => (b.discount || 0) - (a.discount || 0));
    } else if (sortMode === 'price-low') {
      items = [...items].sort((a, b) => a.price - b.price);
    } else if (sortMode === 'price-high') {
      items = [...items].sort((a, b) => b.price - a.price);
    }

    return items;
  }, [products, subcatId, subcatMeta, searchQuery, sortMode]);

  const relatedProducts = useMemo(() => {
    const groupCategories = GROUP_CATEGORY_MAP[subcatMeta.parentGroup] || [];
    return products
      .filter(
        (p) =>
          groupCategories.some((cat) => p.category.includes(cat) || cat.includes(p.category)) &&
          !filteredProducts.some((fp) => fp.id === p.id)
      )
      .slice(0, 6);
  }, [products, subcatMeta.parentGroup, filteredProducts]);

  const SORT_OPTIONS: { value: SortMode; label: string }[] = [
    { value: 'relevance', label: 'แนะนำ' },
    { value: 'discount', label: 'ลดมากสุด' },
    { value: 'price-low', label: 'ราคาต่ำ → สูง' },
    { value: 'price-high', label: 'ราคาสูง → ต่ำ' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className={`bg-gradient-to-r ${subcatMeta.parentColor} text-white relative z-10 shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/categories" className="hover:bg-white/20 p-2 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{subcatMeta.name}</h1>
                  <p className="text-sm text-white/80">{subcatMeta.parentGroup}</p>
                </div>
              </div>
            </div>
            <span className="bg-white/20 text-sm px-3 py-1 rounded-full font-medium">
              {filteredProducts.length} รายการ
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Search + Sort Bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={`ค้นหาใน "${subcatMeta.name}"...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all text-sm"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

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
        {filteredProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                ยังไม่มีสินค้าใน &quot;{subcatMeta.name}&quot;
              </h2>
              <p className="text-gray-500 mb-6 text-sm">
                สินค้าในหมวดย่อยนี้จะเพิ่มเข้ามาเร็วๆ นี้
              </p>
              <Link
                href="/categories"
                className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold hover:shadow-lg transition-all text-sm"
              >
                กลับไปหมวดหมู่
              </Link>
            </div>
          </motion.div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <TagIcon className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-bold text-gray-800">
                สินค้าที่เกี่ยวข้องใน &quot;{subcatMeta.parentGroup}&quot;
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link
        href={`/product/${product.id}`}
        className="block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all group"
      >
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {product.discount && product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{product.discount}%
            </div>
          )}
          {product.verified && (
            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
              <ShieldCheckIcon className="w-3 h-3" />
            </div>
          )}
        </div>

        <div className="p-3">
          <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors">
            {product.title}
          </p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-lg font-bold text-red-600">
              ฿{product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                ฿{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {product.rating && (
              <>
                <StarIcon className="w-3 h-3 text-yellow-400" />
                <span>{product.rating}</span>
                <span className="mx-1">&bull;</span>
              </>
            )}
            <span className="truncate">{product.shopName}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
