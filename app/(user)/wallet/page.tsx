"use client";
import React, { useState, useEffect } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { QrCode, Trash2, ArrowRight, Bookmark, Ticket, Clock, Store, Loader2, AlertTriangle, Tag, CheckCircle } from 'lucide-react';
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
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (code.startsWith('IAM-') || code.startsWith('IAMROOT')) {
      setCouponApplied(true);
      toast.success(`ใช้โค้ด "${code}" สำเร็จ!`);
    } else {
      toast.error('โค้ดไม่ถูกต้องหรือหมดอายุแล้ว');
    }
  };
  const { savedProductIds, toggleSave, loadSavedFromSupabase } = useProductStore();
  const { user } = useAuthStore();
  const [allPromos, setAllPromos] = useState<SavedPromo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved IDs from Supabase on mount
  useEffect(() => {
    if (user?.id) {
      loadSavedFromSupabase(user.id);
    }
  }, [user?.id, loadSavedFromSupabase]);

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
    toggleSave(id, user?.id);
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
                      {/* Expiry warning */}
                      {(() => {
                        const d = Math.ceil((new Date(product.validUntil).getTime() - Date.now()) / 86400000);
                        return d >= 0 && d <= 3 ? (
                          <div className="absolute" style={{display:'none'}} />
                        ) : null;
                      })()}
                      <Link href={`/promo/${product.id}`} className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 relative">
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
                            <span className="text-[11px] text-orange-600 font-medium">{product.shopName}</span>
                          </div>
                          <Link href={`/promo/${product.id}`}>
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 hover:text-orange-600 transition-colors">{product.title}</h3>
                          </Link>
                        </div>
                        {/* Expiry badge */}
                        {(() => {
                          const d = Math.ceil((new Date(product.validUntil).getTime() - Date.now()) / 86400000);
                          return d >= 0 && d <= 3 ? (
                            <div className="flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mt-1.5">
                              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                              <span className="text-[10px] font-semibold">หมดอายุใน {d} วัน!</span>
                            </div>
                          ) : null;
                        })()}
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
          <div className="space-y-6">
            {/* Manual coupon code input */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-orange-500" />
                <h3 className="font-semibold text-gray-900 text-sm">กรอกโค้ดคูปอง</h3>
              </div>
              {couponApplied ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-bold text-green-700">ใช้โค้ดสำเร็จแล้ว!</p>
                    <p className="text-xs text-green-600">{couponInput.trim().toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => { setCouponApplied(false); setCouponInput(''); }}
                    className="ml-auto text-xs text-green-500 hover:text-green-700 underline"
                  >
                    ใช้โค้ดอื่น
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="เช่น IAM-XXXX-YYYY"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-300"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
                  >
                    ใช้โค้ด
                  </button>
                </div>
              )}
              <p className="text-[11px] text-gray-400 mt-2">รับโค้ดได้จากการแลกรางวัล หรือแคมเปญพิเศษจาก IAMROOT AI</p>
            </div>

            {/* Redirect to rewards */}
            <div className="flex flex-col items-center py-10 text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                <Ticket className="w-7 h-7 text-orange-300" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">แลกคะแนนเพื่อรับคูปอง</h3>
              <p className="text-sm text-gray-400 mb-6">สะสมคะแนนจากการดูดีลและแลกเป็นคูปองส่วนลด</p>
              <Link href="/rewards" className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-6 py-3 rounded-xl text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                <span>ไปหน้ารางวัล</span> <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
