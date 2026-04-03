'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ClockIcon, FireIcon, BoltIcon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { MapPinIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useProductStore } from '@/store/useProductStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';

/*
 * Expected API Response: GET /api/flash-sales
 * Response: { sales: FlashSaleItem[], categories: string[] }
 *
 * interface FlashSaleItem {
 *   id: number;
 *   title: string;
 *   merchant: string;
 *   discount: number;         // percent
 *   originalPrice: number;
 *   salePrice: number;
 *   image: string;
 *   endTime: string;          // ISO date — will be converted to Date
 *   claimed: number;
 *   total: number;
 *   location: string;
 *   category: string;
 * }
 */

interface FlashSaleItem {
  id: number;
  title: string;
  merchant: string;
  discount: number;
  originalPrice: number;
  salePrice: number;
  image: string;
  endTime: Date;
  claimed: number;
  total: number;
  location: string;
  category: string;
}

// Flash sale data is loaded from API (see state in FlashSalePage component)

function TimeDisplay({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance < 0) {
        setTimeLeft('หมดเวลา');
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg text-body-sm">
      <ClockIcon className="w-4 h-4" />
      <span>{timeLeft}</span>
    </div>
  );
}

/* ── Deal Detail Modal ──────────────────────────────────────────────── */
function DealDetailModal({
  deal,
  isFav,
  onToggleFav,
  onClose,
}: {
  deal: FlashSaleItem;
  isFav: boolean;
  onToggleFav: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const pct = Math.round((deal.claimed / deal.total) * 100);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="relative aspect-[4/3] flex-shrink-0">
          <img 
            src={resolveImageUrl(deal.image, getCategoryFallbackImage(deal.category))} 
            alt={deal.title} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              target.parentElement!.classList.add('bg-gradient-to-br', 'from-orange-100', 'to-orange-50');
            }}
          />
          {/* Discount badge */}
          <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg">
            -{deal.discount}%
          </div>
          {/* Fav */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
            className="absolute top-3 right-14 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:scale-110 transition-transform"
          >
            <HeartIcon className={`w-5 h-5 ${isFav ? 'fill-red-600 text-red-600' : 'text-gray-400'}`} />
          </button>
          {/* Timer overlay */}
          <div className="absolute bottom-3 left-3">
            <TimeDisplay endTime={deal.endTime} />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* Title & merchant */}
          <h2 className="text-lg font-bold text-gray-900 mb-1">{deal.title}</h2>
          <p className="text-sm font-semibold text-orange-600 mb-2">{deal.merchant}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
            <MapPinIcon className="w-4 h-4" />
            <span>{deal.location}</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-bold text-orange-600">฿{deal.salePrice.toLocaleString()}</span>
            <span className="text-base text-gray-400 line-through">฿{deal.originalPrice.toLocaleString()}</span>
            <span className="ml-auto text-sm font-bold text-white bg-red-500 px-2.5 py-0.5 rounded-full">ประหยัด ฿{(deal.originalPrice - deal.salePrice).toLocaleString()}</span>
          </div>

          {/* Progress */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-600 mb-1.5">
              <span>ขายแล้ว {deal.claimed}/{deal.total}</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
          <button
            onClick={() => router.push(`/checkout?dealId=${deal.id}&price=${deal.salePrice}`)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            ซื้อเลย
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FlashSalePage() {
  const [filter, setFilter] = useState('ทั้งหมด');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<FlashSaleItem | null>(null);

  // ── Load flash sale products from product store + Supabase ──
  const products = useProductStore((s) => s.products);
  const [isLoading, setIsLoading] = useState(true);
  const [isError] = useState(false);
  const [apiFlashSales, setApiFlashSales] = useState<FlashSaleItem[]>([]);

  // Convert product-store items tagged "Flash Sale" into FlashSaleItem[]
  const storeFlashSales: FlashSaleItem[] = products
    .filter((p) => p.tags?.includes('Flash Sale'))
    .map((p, idx) => ({
      id: idx + 1,
      title: p.title,
      merchant: p.shopName,
      discount: p.discount || Math.round(((p.originalPrice - p.promoPrice) / p.originalPrice) * 100),
      originalPrice: p.originalPrice,
      salePrice: p.promoPrice,
      image: resolveImageUrl(p.image, getCategoryFallbackImage(p.category)),
      endTime: new Date(p.validUntil),
      claimed: p.reviews || 0,
      total: Math.max(p.likes || 50, (p.reviews || 0) + 10),
      location: p.distance || 'กรุงเทพฯ',
      category: p.category,
    }));

  // Fetch flash sale deals from Supabase promotions + products tables
  useEffect(() => {
    async function fetchDeals() {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      try {
        // Source A: promotions table
        const { data: promoData } = await supabase
          .from('promotions')
          .select('*')
          .eq('status', 'active')
          .gte('valid_until', new Date().toISOString())
          .order('created_at', { ascending: false });

        // Source B: products table (merchant-created products with discount)
        const { data: productData } = await supabase
          .from('products')
          .select('*')
          .gt('discount', 0)
          .order('created_at', { ascending: false })
          .limit(20);

        const results: FlashSaleItem[] = [];

        if (promoData && promoData.length > 0) {
          promoData.forEach((d: Record<string, unknown>, idx: number) => {
            const origPrice = Number(d.original_price || 0);
            const promoPrice = Number(d.promo_price || 0);
            const discPct = Number(d.discount_pct || 0) || (origPrice > 0 ? Math.round(((origPrice - promoPrice) / origPrice) * 100) : 0);
            results.push({
              id: 1000 + idx,
              title: String(d.title || ''),
              merchant: String(d.merchant_id || 'ร้านค้า'),
              discount: discPct,
              originalPrice: origPrice || promoPrice,
              salePrice: promoPrice || origPrice,
              image: resolveImageUrl(String(d.image_url || ''), getCategoryFallbackImage(String(d.category || ''))),
              endTime: new Date(String(d.valid_until || Date.now())),
              claimed: Number(d.quota_used || 0),
              total: Number(d.quota_total || 50),
              location: 'กรุงเทพฯ',
              category: String(d.category || 'อื่นๆ'),
            });
          });
        }

        if (productData && productData.length > 0) {
          productData.forEach((d: Record<string, unknown>, idx: number) => {
            const origPrice = Number(d.original_price || d.price || 0);
            const promoPrice = Number(d.promo_price || d.price || 0);
            const discPct = Number(d.discount || 0) || (origPrice > 0 ? Math.round(((origPrice - promoPrice) / origPrice) * 100) : 0);
            if (discPct <= 0) return;
            const validUntil = String(d.valid_until || new Date(Date.now() + 24 * 3600000).toISOString());
            results.push({
              id: 2000 + idx,
              title: String(d.title || ''),
              merchant: String(d.shop_name || 'ร้านค้า'),
              discount: discPct,
              originalPrice: origPrice,
              salePrice: promoPrice,
              image: resolveImageUrl(String(d.image || ''), getCategoryFallbackImage(String(d.category || ''))),
              endTime: new Date(validUntil),
              claimed: Math.floor(Math.random() * 20),
              total: 50,
              location: String(d.location || 'กรุงเทพฯ'),
              category: String(d.category || 'อื่นๆ'),
            });
          });
        }

        setApiFlashSales(results);
      } catch (e) {
        console.error('[FlashSale] fetch error:', e);
      }
      setIsLoading(false);
    }
    fetchDeals();
  }, []);

  // Merge both sources
  const flashSales = [...storeFlashSales, ...apiFlashSales];

  const categories = ['ทั้งหมด', ...Array.from(new Set(flashSales.map(s => s.category)))];

  const filteredSales = filter === 'ทั้งหมด' 
    ? flashSales 
    : flashSales.filter(sale => sale.category === filter);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white pb-20">
      {/* Header — z-30 so it sits below the global Navbar (z-50) */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:bg-white/10 p-2 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-2">
              <BoltIcon className="w-7 h-7 animate-pulse" />
              <h1 className="text-h3">Flash Sale</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FireIcon className="w-8 h-8 animate-bounce" />
                <h2 className="text-h2 font-bold">ดีลสุดคุ้ม เวลาจำกัด!</h2>
              </div>
              <p className="text-white/90">รีบจับก่อนของหมด ลดสูงสุด 80%</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                <p className="text-body-sm text-white/80 mb-1">ดีลที่กำลังเป็นฮิต</p>
                <p className="text-display font-bold">{flashSales.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter — sticky below global navbar */}
      <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                  filter === cat
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Flash Sales Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-20" />
                    <div className="h-6 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full" />
                  <div className="h-10 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-h3 text-gray-800 mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-gray-600 mb-6">ไม่สามารถโหลด Flash Sale ได้</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold">ลองใหม่</button>
          </div>
        ) : flashSales.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BoltIcon className="w-10 h-10 text-orange-300" />
            </div>
            <h3 className="text-h3 text-gray-800 mb-2">ยังไม่มี Flash Sale ในขณะนี้</h3>
            <p className="text-gray-500">กลับมาตรวจสอบอีกครั้งเร็วๆ นี้</p>
          </div>
        ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSales.map((sale, index) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => setSelectedDeal(sale)}
              >
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={resolveImageUrl(sale.image, getCategoryFallbackImage(sale.category))}
                      alt={sale.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1.5 rounded-full font-bold text-body-sm shadow-lg">
                      -{sale.discount}%
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(sale.id); }}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:scale-110 transition-transform"
                    >
                      <HeartIcon
                        className={`w-5 h-5 ${
                          favorites.includes(sale.id)
                            ? 'fill-red-600 text-red-600'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>

                    {/* Timer */}
                    <div className="absolute bottom-3 left-3">
                      <TimeDisplay endTime={sale.endTime} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {sale.title}
                    </h3>
                    
                    <p className="text-body-sm text-gray-600 mb-3 flex items-center gap-1">
                      <span className="font-semibold text-orange-600">{sale.merchant}</span>
                    </p>

                    <div className="flex items-center gap-1 text-caption text-gray-500 mb-3">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{sale.location}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-h2 font-bold text-orange-600">
                        ฿{sale.salePrice}
                      </span>
                      <span className="text-body-sm text-gray-400 line-through">
                        ฿{sale.originalPrice}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-caption text-gray-600 mb-1">
                        <span>ขายแล้ว {sale.claimed}/{sale.total}</span>
                        <span>{Math.round((sale.claimed / sale.total) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(sale.claimed / sale.total) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      className="block w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-center py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                      ซื้อเลย
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
        )}

        {!isLoading && filteredSales.length === 0 && flashSales.length > 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔥</div>
            <h3 className="text-h3 text-gray-800 mb-2">ไม่พบ Flash Sale</h3>
            <p className="text-gray-600">ลองเลือกหมวดหมู่อื่นดูสิ</p>
          </div>
        )}
      </div>

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          isFav={favorites.includes(selectedDeal.id)}
          onToggleFav={() => toggleFavorite(selectedDeal.id)}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
}
