'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Navigation, ChevronLeft, ChevronRight, Locate, XCircle } from 'lucide-react';
import { useGeolocation, calcDistanceKm } from '@/hooks/useGeolocation';
import { Product } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';

// TODO: Replace with real coordinates from API
const MOCK_COORDS: Record<string, { lat: number; lng: number }> = {};

// Default: สยามสแควร์
const DEFAULT_LAT = 13.7460;
const DEFAULT_LNG = 100.5340;
const MAX_RADIUS_KM = 5;

interface NearbyDealsProps {
  products: Product[];
}

interface ProductWithDistance extends Product {
  distanceKm: number;
}

export default function NearbyDeals({ products }: NearbyDealsProps) {
  const { latitude, longitude, loading, error, permissionStatus, requestLocation } = useGeolocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [useMockLocation, setUseMockLocation] = useState(false);
  const [nearbyProducts, setNearbyProducts] = useState<ProductWithDistance[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);

  // ใช้ตำแหน่งจริง หรือ default (สยาม) ถ้ายังขอไม่ได้
  const userLat = latitude ?? (useMockLocation ? DEFAULT_LAT : null);
  const userLng = longitude ?? (useMockLocation ? DEFAULT_LNG : null);

  // Auto-request location เมื่อ mount
  useEffect(() => {
    if (permissionStatus === 'granted') {
      requestLocation();
    }
  }, [permissionStatus, requestLocation]);

  // ดึงโปรโมชั่นใกล้ฉันจาก Supabase RPC
  useEffect(() => {
    async function fetchNearbyDeals() {
      if (userLat === null || userLng === null) {
        setNearbyProducts([]);
        return;
      }

      setIsLoadingNearby(true);
      
      try {
        // Try Supabase RPC Function (only if it exists)
        let rpcSuccess = false;
        try {
          const { data, error } = await supabase.rpc('nearby_products', {
            user_lat: userLat,
            user_lng: userLng,
            radius_km: MAX_RADIUS_KM,
          });

          if (!error && data) {
            const nearbyList: ProductWithDistance[] = data.map((item: any) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              price: item.price || 0,
              originalPrice: item.originalPrice || item.price,
              promoPrice: item.promoPrice,
              image: item.image,
              category: item.category,
              shopName: item.shopName,
              discount: item.discount,
              rating: item.rating,
              distanceKm: item.distance_km,
            }));
            setNearbyProducts(nearbyList);
            rpcSuccess = true;
          }
        } catch {
          // RPC not available — fall through to local fallback
        }

        if (!rpcSuccess) {
          // Fallback: calculate distance from local products with mock coords
          const fallbackProducts = products
            .map(p => {
              const coords = MOCK_COORDS[p.id];
              if (!coords) return null;
              const dist = calcDistanceKm(userLat, userLng, coords.lat, coords.lng);
              return { ...p, distanceKm: Math.round(dist * 10) / 10 } as ProductWithDistance;
            })
            .filter((p): p is ProductWithDistance => p !== null && p.distanceKm <= MAX_RADIUS_KM)
            .sort((a, b) => a.distanceKm - b.distanceKm);
          
          setNearbyProducts(fallbackProducts);
        }
      } catch (err) {
        console.error('Error fetching nearby products:', err);
        setNearbyProducts([]);
      } finally {
        setIsLoadingNearby(false);
      }
    }

    fetchNearbyDeals();
  }, [userLat, userLng, products]);

  // ตรวจสอบ scroll
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [nearbyProducts]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  // ======= ยังไม่ได้ขอ permission =======
  if (userLat === null || userLng === null) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">โปรเด็ดใกล้คุณ</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6 text-center"
        >
          <Navigation className="w-12 h-12 text-orange-500 mx-auto mb-3" />
          <h3 className="text-h4 text-gray-900 mb-1">เปิดตำแหน่งเพื่อดูโปรใกล้คุณ</h3>
          <p className="text-body text-gray-600 mb-4">
            ค้นหาโปรโมชั่นในรัศมี 5 กม. จากตำแหน่งปัจจุบัน
          </p>

          {error && permissionStatus === 'denied' && (
            <div className="flex items-center justify-center gap-2 text-red-500 text-body-sm mb-3">
              <XCircle className="w-4 h-4" />
              <span>คุณปฏิเสธการเข้าถึงตำแหน่ง กรุณาเปิดในตั้งค่าเบราว์เซอร์</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={requestLocation}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  กำลังค้นหาตำแหน่ง...
                </>
              ) : (
                <>
                  <Locate className="w-5 h-5" />
                  เปิดตำแหน่ง
                </>
              )}
            </button>
            <button
              onClick={() => setUseMockLocation(true)}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-all"
            >
              ใช้ตำแหน่ง สยามสแควร์ (Demo)
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  // ======= ไม่มีโปรใกล้ ========
  if (nearbyProducts.length === 0) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">โปรเด็ดใกล้คุณ</h2>
        </div>
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <p className="text-gray-500">ไม่พบโปรโมชั่นในรัศมี {MAX_RADIUS_KM} กม.</p>
        </div>
      </section>
    );
  }

  // ======= แสดง Nearby Deals ========
  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MapPin className="w-6 h-6 text-orange-500" />
          </motion.div>
          <h2 className="text-h3 text-gray-900">โปรเด็ดใกล้คุณ</h2>
          <span className="bg-orange-100 text-orange-600 text-caption font-bold px-2.5 py-1 rounded-full">
            {nearbyProducts.length} รายการ
          </span>
        </div>

        {/* Scroll Arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
      >
        {nearbyProducts.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="flex-shrink-0 w-64"
          >
            <Link href={`/promo/${product.id}`}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group">
                {/* Image */}
                <div className="relative h-40 overflow-hidden bg-gray-100">
                  <Image
                    src={product.image || 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600'}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="256px"
                  />

                  {/* Distance Badge */}
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-caption flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-orange-400" />
                    ห่างไป {product.distanceKm} กม.
                  </div>

                  {/* Discount Tag */}
                  {product.discount && product.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-2.5 py-1 rounded-full text-caption font-black">
                      -{product.discount}%
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                    {product.shopName}
                  </p>
                  <h3 className="text-body-sm font-bold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
                    {product.title}
                  </h3>

                  <div className="flex items-baseline gap-2">
                    <span className="text-h4 text-orange-600">
                      ฿{product.price?.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > (product.price || 0) && (
                      <span className="text-caption text-gray-400 line-through">
                        ฿{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
