"use client";
import React, { useState, useEffect } from 'react';
import { useProductStore } from '@/store/useProductStore';
import Link from 'next/link';
import { QrCode, Trash2, ArrowRight, Bookmark, Ticket, Clock, Store, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getPromotions } from '@/lib/getPromotions';
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

type Tab = 'coupons' | 'saved';

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const { savedProductIds, toggleSave } = useProductStore();
  const [allPromos, setAllPromos] = useState<SavedPromo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all available promotions (same sources as home page)
  useEffect(() => {
    async function loadPromotions() {
      setIsLoading(true);
      const results: SavedPromo[] = [];

      try {
        // Source 1: API / Supabase products
        try {
          const res = await fetch('/api/debug-products');
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            for (const p of json.data) {
              results.push({
                id: String(p.id || ''),
                title: String(p.title || ''),
                shopName: String(p.shopName || p.shop_name || 'ร้านค้า'),
                image: resolveImageUrl(
                  String(p.image || ''),
                  getCategoryFallbackImage(p.category as string)
                ),
                promoPrice: Number(p.promoPrice || p.price || 0),
                originalPrice: Number(p.originalPrice || p.original_price || 0),
                validUntil: String(p.validUntil || p.valid_until || new Date(Date.now() + 7 * 86400000).toISOString()),
                category: String(p.category || 'Other'),
              });
            }
          }
        } catch {
          // API not available
        }

        // Source 2: Static promotions
        const staticPromos = getPromotions();
        const existingIds = new Set(results.map(r => r.id));
        for (const p of staticPromos) {
          if (!existingIds.has(p.id)) {
            results.push({
              id: p.id,
              title: p.title,
              shopName: p.shop_name,
              image: resolveImageUrl(p.image, getCategoryFallbackImage(p.category)),
              promoPrice: p.price,
              originalPrice: p.discount_rate > 0 ? Math.round(p.price / (1 - p.discount_rate / 100)) : p.price,
              validUntil: p.valid_until,
              category: p.category,
            });
          }
        }

        // Source 3: Zustand store products (merchant-created)
        const storeProducts = useProductStore.getState().products;
        for (const p of storeProducts) {
          if (!existingIds.has(p.id) && !results.find(r => r.id === p.id)) {
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
        }
      } catch (err) {
        console.error('[Wallet] Failed to load promotions:', err);
      }

      setAllPromos(results);
      setIsLoading(false);
    }

    loadPromotions();
  }, []);

  const savedProducts = allPromos.filter(p => savedProductIds.includes(p.id));

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const handleRemove = (id: string, title: string) => {
    toggleSave(id);
    toast('ลบ "' + title + '" ออกแล้ว');
  };

  const activeProducts = savedProducts.filter(p => !isExpired(p.validUntil));
  const expiredProducts = savedProducts.filter(p => isExpired(p.validUntil));

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-lg font-bold text-gray-900">กระเป๋าของฉัน</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            โปรโมชันของฉัน
            {savedProducts.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === 'saved' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {savedProducts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'coupons'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Ticket className="w-4 h-4" />
            คูปองสะสม
          </button>
        </div>

        {/* ===== Tab: Saved Deals ===== */}
        {activeTab === 'saved' && (
          <>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-3" />
                <p className="text-sm text-gray-400">กำลังโหลด...</p>
              </div>
            ) : savedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Bookmark className="w-7 h-7 text-gray-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">ยังไม่มีโปรโมชันที่บันทึก</h3>
                <p className="text-sm text-gray-400 mb-6">กดไอคอน Bookmark บนการ์ดเพื่อบันทึกดีลที่ชอบ</p>
                <Link href="/" className="text-sm font-semibold text-orange-500 flex items-center gap-1 hover:text-orange-600">
                  ไปหน้าแรก <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Active Deals */}
                {activeProducts.map((product) => {
                  const discountPercent = Math.round(((product.originalPrice - product.promoPrice) / product.originalPrice) * 100);
                  return (
                    <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3 flex gap-3">
                      <Link href={`/promo/${product.id}`} className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 relative">
                          <img
                            src={product.image}
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
                            <span className="text-[11px] text-orange-600 font-medium">{product.shopName}</span>
                          </div>
                          <Link href={`/promo/${product.id}`}>
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 hover:text-orange-600 transition-colors">{product.title}</h3>
                          </Link>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-bold text-orange-500">฿{product.promoPrice}</span>
                            {product.originalPrice > product.promoPrice && (
                              <span className="text-[11px] text-gray-400 line-through">฿{product.originalPrice}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/wallet/use/${product.id}`}
                              className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-orange-600 active:scale-95 transition-all"
                            >
                              <QrCode className="w-3.5 h-3.5" /> ใช้คูปอง
                            </Link>
                            <button
                              onClick={() => handleRemove(product.id, product.title)}
                              className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Expired Deals */}
                {expiredProducts.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mt-6 mb-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">หมดอายุแล้ว</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    {expiredProducts.map((product) => (
                      <div key={product.id} className="bg-gray-50/50 rounded-xl border border-gray-100 p-3 flex gap-3 opacity-60">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 relative flex-shrink-0">
                          <img
                            src={product.image}
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
                            <span className="text-[11px] text-gray-400">{product.shopName}</span>
                            <h3 className="text-sm font-semibold text-gray-500 line-clamp-1">{product.title}</h3>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-400">โปรโมชันนี้สิ้นสุดแล้ว</span>
                            <button
                              onClick={() => handleRemove(product.id, product.title)}
                              className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Summary bar */}
                <div className="mt-4 flex items-center justify-between px-1 py-2">
                  <span className="text-xs text-gray-400">
                    {activeProducts.length} ใช้งานได้ · {expiredProducts.length} หมดอายุ
                  </span>
                  <Link href="/saved" className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-0.5">
                    ดูแบบเต็ม <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== Tab: Coupons ===== */}
        {activeTab === 'coupons' && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Ticket className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">ยังไม่มีคูปอง</h3>
            <p className="text-sm text-gray-400 mb-6">แลกคะแนนเพื่อรับคูปองส่วนลดในหน้ารางวัล</p>
            <Link href="/rewards" className="text-sm font-semibold text-orange-500 flex items-center gap-1 hover:text-orange-600">
              ไปหน้ารางวัล <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
