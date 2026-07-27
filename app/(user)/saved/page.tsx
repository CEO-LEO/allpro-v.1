"use client";
import React, { useState, useEffect } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Bookmark, ArrowRight, Trash2, Clock, Store, LayoutGrid, List, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import LoginModal from '@/components/Auth/LoginModal';
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';

interface SavedPromo {
  id: string;
  title: string;
  shopName: string;
  image: string;
  promoPrice: number;
  originalPrice: number;
  validUntil: string;
  category: string;
}

type ViewMode = 'grid' | 'list';

export default function SavedPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { savedProductIds, toggleSave, loadSavedFromSupabase } = useProductStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [allPromos, setAllPromos] = useState<SavedPromo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved IDs from Supabase on mount
  useEffect(() => {
    if (user?.id) {
      loadSavedFromSupabase(user.id);
    }
  }, [user?.id, loadSavedFromSupabase]);

  // Fetch all available promotions from the production API and merge with merchant store products.
  useEffect(() => {
    async function loadPromotions() {
      setIsLoading(true);
      const results: SavedPromo[] = [];
      const existingIds = new Set<string>();

      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        if (Array.isArray(json?.data) && json.data.length > 0) {
          for (const p of json.data) {
            const id = String(p.id || '');
            if (!id) continue;
            existingIds.add(id);
            results.push({
              id,
              title: String(p.title || ''),
              shopName: String(p.shopName || p.shop_name || 'ร้านค้า'),
              image: resolveImageUrl(
                String(p.image || ''),
                getCategoryFallbackImage(String(p.category || 'Other'))
              ),
              promoPrice: Number(p.promoPrice || p.price || 0),
              originalPrice: Number(p.originalPrice || p.original_price || 0),
              validUntil: String(p.validUntil || p.valid_until || new Date(Date.now() + 7 * 86400000).toISOString()),
              category: String(p.category || 'Other'),
            });
          }
        }
      } catch (err) {
        console.error('[Saved] Failed to load promotions from /api/products:', err);
      }

      const storeProducts = useProductStore.getState().products;
      for (const p of storeProducts) {
        if (existingIds.has(p.id)) continue;
        results.push({
          id: p.id,
          title: p.title,
          shopName: p.shopName,
          image: resolveImageUrl(p.image, getCategoryFallbackImage(p.category)),
          promoPrice: p.promoPrice,
          originalPrice: p.originalPrice,
          validUntil: p.validUntil,
          category: p.category,
        });
      }

      setAllPromos(results);
      setIsLoading(false);
    }

    loadPromotions();
  }, []);

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="bg-gray-50 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
              <Bookmark className="w-7 h-7 text-gray-300 dark:text-gray-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">กรุณาเข้าสู่ระบบ</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">เข้าสู่ระบบเพื่อบันทึกโปรโมชันที่ชอบ</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-1.5 bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              เข้าสู่ระบบ
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    );
  }

  const savedProducts = allPromos.filter(p => savedProductIds.includes(p.id));

  const isExpired = (validUntil: string) => new Date(validUntil) < new Date();
  const activeProducts = savedProducts.filter(p => !isExpired(p.validUntil));
  const expiredProducts = savedProducts.filter(p => isExpired(p.validUntil));

  const handleRemove = (id: string, title: string) => {
    toggleSave(id, user?.id);
    toast('ลบ "' + title + '" ออกแล้ว');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-24">
      <div className="max-w-5xl mx-auto px-4 pt-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">โปรโมชันที่บันทึก</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{savedProducts.length} รายการ</p>
          </div>
          {savedProducts.length > 0 && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-3" />
            <p className="text-sm text-gray-400 dark:text-gray-500">กำลังโหลด...</p>
          </div>
        ) : savedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Bookmark className="w-7 h-7 text-gray-300 dark:text-gray-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">ยังไม่มีโปรที่บันทึก</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">เจอโปรเด็ดๆ กด Bookmark ไว้ได้เลย!</p>
            <Link
              href="/"
              className="text-sm font-semibold text-orange-500 flex items-center gap-1 hover:text-orange-600"
            >
              ไปดูโปรโมชัน <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            {/* ===== Grid View ===== */}
            {viewMode === 'grid' && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {activeProducts.map((product) => {
                    const discountPercent = Math.round(((product.originalPrice - product.promoPrice) / product.originalPrice) * 100);
                    return (
                      <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden group">
                        <Link href={`/promo/${product.id}`} className="relative block">
                          <div className="aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
                            <img
                              src={resolveImageUrl(product.image, getCategoryFallbackImage(product.category))}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          </div>
                          {discountPercent > 0 && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                              -{discountPercent}%
                            </span>
                          )}
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(product.id, product.title); }}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-900/80 rounded-full shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hover:text-red-500" />
                          </button>
                        </Link>
                        <div className="p-2.5">
                          <div className="flex items-center gap-1 mb-0.5">
                            <Store className="w-3 h-3 text-orange-500" />
                            <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium truncate">{product.shopName}</span>
                          </div>
                          <h3 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-1.5">{product.title}</h3>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-orange-500">฿{product.promoPrice}</span>
                            {product.originalPrice > product.promoPrice && (
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 line-through">฿{product.originalPrice}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expired Grid */}
                {expiredProducts.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mt-8 mb-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">หมดอายุแล้ว</span>
                      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {expiredProducts.map((product) => (
                        <div key={product.id} className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden opacity-50">
                          <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                            <img
                              src={resolveImageUrl(product.image, getCategoryFallbackImage(product.category))}
                              alt={product.title}
                              className="w-full h-full object-cover grayscale"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div className="absolute inset-0 bg-gray-900/30 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-white bg-gray-700/80 px-2 py-0.5 rounded">หมดอายุ</span>
                            </div>
                            <button
                              onClick={() => handleRemove(product.id, product.title)}
                              className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-900/60 rounded-full"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            </button>
                          </div>
                          <div className="p-2.5">
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">{product.shopName}</span>
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 line-clamp-1">{product.title}</h3>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">โปรโมชันนี้สิ้นสุดแล้ว</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ===== List View ===== */}
            {viewMode === 'list' && (
              <>
                <div className="space-y-2">
                  {activeProducts.map((product) => {
                    const discountPercent = Math.round(((product.originalPrice - product.promoPrice) / product.originalPrice) * 100);
                    return (
                      <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3 flex gap-3">
                        <Link href={`/promo/${product.id}`} className="flex-shrink-0">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
                            <img
                              src={resolveImageUrl(product.image, getCategoryFallbackImage(product.category))}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            {discountPercent > 0 && (
                              <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                -{discountPercent}%
                              </span>
                            )}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1 mb-0.5">
                              <Store className="w-3 h-3 text-orange-500" />
                              <span className="text-[11px] text-orange-600 dark:text-orange-400 font-medium">{product.shopName}</span>
                            </div>
                            <Link href={`/promo/${product.id}`}>
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-orange-600 transition-colors">{product.title}</h3>
                            </Link>
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base font-bold text-orange-500">฿{product.promoPrice}</span>
                              {product.originalPrice > product.promoPrice && (
                                <span className="text-[11px] text-gray-400 dark:text-gray-500 line-through">฿{product.originalPrice}</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemove(product.id, product.title)}
                              className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expired List */}
                {expiredProducts.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mt-8 mb-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">หมดอายุแล้ว</span>
                      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                    </div>
                    <div className="space-y-2">
                      {expiredProducts.map((product) => (
                        <div key={product.id} className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 p-3 flex gap-3 opacity-50">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 relative flex-shrink-0">
                            <img
                              src={resolveImageUrl(product.image, getCategoryFallbackImage(product.category))}
                              alt={product.title}
                              className="w-full h-full object-cover grayscale"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-white bg-gray-700/80 px-1.5 py-0.5 rounded">หมดอายุ</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <span className="text-[11px] text-gray-400 dark:text-gray-500">{product.shopName}</span>
                              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 line-clamp-1">{product.title}</h3>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-400 dark:text-gray-500">โปรโมชันนี้สิ้นสุดแล้ว</span>
                              <button
                                onClick={() => handleRemove(product.id, product.title)}
                                className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
