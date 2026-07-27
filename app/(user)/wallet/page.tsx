"use client";
import React, { useState, useEffect } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { QrCode, Trash2, ArrowRight, Bookmark, Ticket, Clock, Store, Loader2, AlertTriangle, Tag, CheckCircle, History, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface ClaimedPromo {
  id: string;
  productId: string;
  title: string;
  shopName: string;
  image: string;
  category: string;
  promoPrice: number;
  originalPrice: number;
  amountSaved: number;
  status: string; // claimed, used, expired, cancelled
  claimedAt: string;
  usedAt: string | null;
}

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

type Tab = 'coupons' | 'saved' | 'claims';

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (code.startsWith('PRO-') || code.startsWith('ALLPRO')) {
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
  const [claims, setClaims] = useState<ClaimedPromo[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(true);

  // Load saved IDs from Supabase on mount
  useEffect(() => {
    if (user?.id) {
      loadSavedFromSupabase(user.id);
    }
  }, [user?.id, loadSavedFromSupabase]);

  // Load real claim/usage history (promotion_claims) for the logged-in user
  useEffect(() => {
    async function loadClaims() {
      if (!user?.id || !isSupabaseConfigured) {
        setClaimsLoading(false);
        return;
      }
      setClaimsLoading(true);
      const { data, error } = await supabase
        .from('promotion_claims')
        .select('id, product_id, status, claimed_at, used_at, original_price, promo_price, amount_saved, products (title, image, shop_name, category)')
        .eq('user_id', user.id)
        .order('claimed_at', { ascending: false });

      if (error) {
        console.error('[Wallet] Failed to load claim history:', error.message);
        setClaimsLoading(false);
        return;
      }

      const mapped: ClaimedPromo[] = (data || []).map((row) => {
        // Supabase อาจส่ง joined relation กลับมาเป็น object หรือ array แล้วแต่ schema cache
        const product = Array.isArray(row.products) ? row.products[0] : row.products;
        const category = product?.category || 'Other';
        return {
          id: row.id,
          productId: row.product_id,
          title: product?.title || 'โปรโมชั่นที่ถูกลบไปแล้ว',
          shopName: product?.shop_name || 'ร้านค้า',
          image: resolveImageUrl(product?.image, getCategoryFallbackImage(category)),
          category,
          promoPrice: Number(row.promo_price) || 0,
          originalPrice: Number(row.original_price) || 0,
          amountSaved: Number(row.amount_saved) || 0,
          status: row.status || 'claimed',
          claimedAt: row.claimed_at,
          usedAt: row.used_at,
        };
      });
      setClaims(mapped);
      setClaimsLoading(false);
    }
    loadClaims();
  }, [user?.id]);

  // Fetch available promotions from the production API and merge with merchant store products.
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
        console.error('[Wallet] Failed to load promotions from /api/products:', err);
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
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-24">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">กระเป๋าของฉัน</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            โปรโมชันของฉัน
            {savedProducts.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === 'saved' ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {savedProducts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'coupons'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Ticket className="w-4 h-4" />
            คูปองสะสม
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'claims'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <History className="w-4 h-4" />
            ที่กดรับ
            {claims.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === 'claims' ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {claims.length}
              </span>
            )}
          </button>
        </div>

        {/* ===== Tab: Saved Deals ===== */}
        {activeTab === 'saved' && (
          <>
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
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">ยังไม่มีโปรโมชันที่บันทึก</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">กดไอคอน Bookmark บนการ์ดเพื่อบันทึกดีลที่ชอบ</p>
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
                    <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3 flex gap-3">
                      {/* Expiry warning */}
                      {(() => {
                        const d = Math.ceil((new Date(product.validUntil).getTime() - Date.now()) / 86400000);
                        return d >= 0 && d <= 3 ? (
                          <div className="absolute" style={{display:'none'}} />
                        ) : null;
                      })()}
                      <Link href={`/promo/${product.id}`} className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700 relative">
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
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-orange-600 transition-colors">{product.title}</h3>
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
                              <span className="text-[11px] text-gray-400 dark:text-gray-500 line-through">฿{product.originalPrice}</span>
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
                              className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
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
                      <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">หมดอายุแล้ว</span>
                      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                    </div>
                    {expiredProducts.map((product) => (
                      <div key={product.id} className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 p-3 flex gap-3 opacity-60">
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
                  </>
                )}

                {/* Summary bar */}
                <div className="mt-4 flex items-center justify-between px-1 py-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-orange-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">กรอกโค้ดคูปอง</h3>
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
                    className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-300 dark:placeholder-gray-600"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
                  >
                    ใช้โค้ด
                  </button>
                </div>
              )}
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">รับโค้ดได้จากการแลกรางวัล หรือแคมเปญพิเศษจาก All Pro</p>
            </div>

            {/* Redirect to rewards */}
            <div className="flex flex-col items-center py-10 text-center">
              <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
                <Ticket className="w-7 h-7 text-orange-300 dark:text-orange-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">แลกคะแนนเพื่อรับคูปอง</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">สะสมคะแนนจากการดูดีลและแลกเป็นคูปองส่วนลด</p>
              <Link href="/rewards" className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-6 py-3 rounded-xl text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                <span>ไปหน้ารางวัล</span> <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ===== Tab: Claim/Usage History (promotion_claims) ===== */}
        {activeTab === 'claims' && (
          <>
            {claimsLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-3" />
                <p className="text-sm text-gray-400 dark:text-gray-500">กำลังโหลด...</p>
              </div>
            ) : claims.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <History className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">ยังไม่มีประวัติการกดรับโปรโมชั่น</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">กดปุ่ม &quot;รับโปรโมชั่น&quot; ในหน้ารายละเอียดสินค้าเพื่อเริ่มสะสมประวัติ</p>
                <Link href="/" className="text-sm font-semibold text-orange-500 flex items-center gap-1 hover:text-orange-600">
                  ไปหน้าแรก <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {claims.map((claim) => {
                  const isUsed = claim.status === 'used';
                  const isExpiredOrCancelled = claim.status === 'expired' || claim.status === 'cancelled';
                  return (
                    <div
                      key={claim.id}
                      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3 flex gap-3 ${
                        isExpiredOrCancelled ? 'opacity-60' : ''
                      }`}
                    >
                      <Link href={`/promo/${claim.productId}`} className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700 relative">
                          <img
                            src={claim.image}
                            alt={claim.title}
                            className={`w-full h-full object-cover ${isExpiredOrCancelled ? 'grayscale' : ''}`}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 mb-0.5">
                            <Store className="w-3 h-3 text-orange-500" />
                            <span className="text-[11px] text-orange-600 font-medium">{claim.shopName}</span>
                          </div>
                          <Link href={`/promo/${claim.productId}`}>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-orange-600 transition-colors">{claim.title}</h3>
                          </Link>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                            กดรับเมื่อ {new Date(claim.claimedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {claim.amountSaved > 0 && <> · ประหยัด ฿{claim.amountSaved.toLocaleString()}</>}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${
                              isUsed
                                ? 'bg-green-50 text-green-600'
                                : isExpiredOrCancelled
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                  : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            {isUsed ? (
                              <><PackageCheck className="w-3 h-3" /> ใช้แล้ว{claim.usedAt ? ` · ${new Date(claim.usedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}` : ''}</>
                            ) : isExpiredOrCancelled ? (
                              <>{claim.status === 'expired' ? 'หมดอายุ' : 'ยกเลิกแล้ว'}</>
                            ) : (
                              <><Clock className="w-3 h-3" /> ยังไม่ได้ใช้</>
                            )}
                          </span>
                          {!isUsed && !isExpiredOrCancelled && (
                            <Link
                              href={`/wallet/use/${claim.productId}`}
                              className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-orange-600 active:scale-95 transition-all"
                            >
                              <QrCode className="w-3.5 h-3.5" /> ใช้คูปอง
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
