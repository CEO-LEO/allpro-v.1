'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/solid';
import {
  ShoppingBagIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { Product } from '@/store/useAppStore';
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';

// ============================================
// INTERFACES — expected API response shape
// ============================================
// TODO: API Response → GET /api/categories/subcategory/:subcatId
// {
//   meta: SubcategoryMeta,
//   products: Product[],
//   relatedProducts: Product[],
// }

interface SubcategoryMeta {
  id: string;
  name: string;
  parentGroup: string;
  parentColor: string;
  parentIcon: typeof ShoppingBagIcon;
  keywords: string[];
}

type SortMode = 'relevance' | 'discount' | 'price-low' | 'price-high';

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'relevance', label: 'แนะนำ' },
  { value: 'discount', label: 'ลดมากสุด' },
  { value: 'price-low', label: 'ราคาต่ำ → สูง' },
  { value: 'price-high', label: 'ราคาสูง → ต่ำ' },
];

export default function SubcategoryDetailPage() {
  const params = useParams<{ subcatId: string }>();
  const searchParams = useSearchParams();
  const subcatId = decodeURIComponent(params.subcatId || '');
  const groupParam = searchParams.get('group') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('relevance');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // ── API-Ready State ──
  const [subcatMeta, setSubcatMeta] = useState<SubcategoryMeta>({
    id: subcatId,
    name: subcatId,
    parentGroup: groupParam || subcatId,
    parentColor: 'from-red-500 to-pink-500',
    parentIcon: ShoppingBagIcon,
    keywords: [subcatId],
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: Replace with API call → GET /api/categories/subcategory/:subcatId
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // const res = await fetch(`/api/categories/subcategory/${encodeURIComponent(subcatId)}?group=${encodeURIComponent(groupParam)}`);
        // const data = await res.json();
        // setSubcatMeta(data.meta);
        // setProducts(data.products);
        // setRelatedProducts(data.relatedProducts);
        await new Promise(r => setTimeout(r, 400));
        setSubcatMeta({
          id: subcatId,
          name: subcatId,
          parentGroup: groupParam || subcatId,
          parentColor: 'from-red-500 to-pink-500',
          parentIcon: ShoppingBagIcon,
          keywords: [subcatId],
        });
        setProducts([]);
        setRelatedProducts([]);
      } catch {
        setProducts([]);
        setRelatedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [subcatId, groupParam]);

  const Icon = subcatMeta.parentIcon;

  // Client-side filtering (search + sort) on fetched products
  const filteredProducts = useMemo(() => {
    let items = [...products];

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
      items.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    } else if (sortMode === 'price-low') {
      items.sort((a, b) => a.price - b.price);
    } else if (sortMode === 'price-high') {
      items.sort((a, b) => b.price - a.price);
    }

    return items;
  }, [products, searchQuery, sortMode]);

  // ── Loading Skeleton ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className={`bg-gradient-to-r ${subcatMeta.parentColor} text-white relative z-10 shadow-lg`}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-32 bg-white/30 rounded animate-pulse" />
                <div className="h-3 w-20 bg-white/20 rounded animate-pulse" />
              </div>
              <div className="h-7 w-20 bg-white/20 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-3 mb-6">
            <div className="flex-1 h-11 bg-gray-200 rounded-xl animate-pulse" />
            <div className="w-24 h-11 bg-gray-200 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
                <ShoppingBagIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                ยังไม่มีสินค้าใน &quot;{subcatMeta.name}&quot;
              </h2>
              <p className="text-gray-500 mb-6 text-sm">
                ข้อมูลสินค้าจะแสดงเมื่อเชื่อมต่อ API
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
            src={resolveImageUrl(product.image, getCategoryFallbackImage(product.category))}
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
