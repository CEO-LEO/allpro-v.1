'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Store, Star, Package, MapPin, CheckCircle, ArrowLeft,
  TrendingUp, Clock, Heart, Share2
} from 'lucide-react';
import { useProductStore, type Product } from '@/store/useProductStore';

interface ShopInfo {
  id: string;
  name: string;
  logo: string;
  description: string;
  verified: boolean;
  rating: number;
  totalProducts: number;
  location: string;
  memberSince: string;
}

export default function PublicShopPage() {
  const params = useParams();
  const shopId = params.shopId as string;
  const { products } = useProductStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);

  // Derive shop products from store
  const shopProducts = useMemo(() => {
    if (!shopInfo) return [];
    return products.filter(p => p.shopName === shopInfo.name);
  }, [products, shopInfo]);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with real API call
        // const res = await fetch(`/api/shops/${shopId}`);
        // if (!res.ok) throw new Error('Shop not found');
        // const data = await res.json();
        // setShopInfo(data);

        await new Promise(r => setTimeout(r, 400));

        // Demo Mode: derive shop info from products in store
        const decodedName = decodeURIComponent(shopId);
        const matching = products.filter(p => p.shopName === decodedName);

        if (matching.length === 0) {
          throw new Error('ไม่พบร้านค้านี้');
        }

        const firstProduct = matching[0];
        const avgRating = matching.reduce((sum, p) => sum + (p.rating || 0), 0) / matching.length;

        setShopInfo({
          id: shopId,
          name: firstProduct.shopName,
          logo: firstProduct.shopLogo || '',
          description: `ยินดีต้อนรับสู่ ${firstProduct.shopName} — ร้านค้าคุณภาพพร้อมโปรโมชั่นสุดพิเศษ`,
          verified: firstProduct.verified,
          rating: parseFloat(avgRating.toFixed(1)),
          totalProducts: matching.length,
          location: firstProduct.distance || 'กรุงเทพฯ',
          memberSince: '2024',
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (shopId) fetchShop();
  }, [shopId, products]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        </header>
        <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <div className="h-7 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-64" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !shopInfo) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
            </Link>
          </div>
        </header>
        <div className="py-20 text-center px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'ไม่พบร้านค้า'}</h2>
          <p className="text-gray-500 mb-6">ร้านค้านี้อาจถูกลบออกหรือยังไม่มีข้อมูล</p>
          <Link href="/" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-block">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> กลับ
          </Link>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Share2 className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* ═══ Shop Profile Card ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 sm:p-8 border border-blue-100 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Logo */}
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md ${shopInfo.logo ? '' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
              {shopInfo.logo ? (
                <img src={shopInfo.logo} alt={shopInfo.name} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-12 h-12 text-white" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{shopInfo.name}</h1>
                {shopInfo.verified && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <p className="text-gray-500 text-sm mb-3">{shopInfo.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 justify-center sm:justify-start flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {shopInfo.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> สมาชิกตั้งแต่ {shopInfo.memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-lg font-bold text-gray-900">{shopInfo.rating}</span>
              </div>
              <p className="text-xs text-gray-500">เรตติ้ง</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Package className="w-4 h-4 text-blue-500" />
                <span className="text-lg font-bold text-gray-900">{shopInfo.totalProducts}</span>
              </div>
              <p className="text-xs text-gray-500">โปรโมชั่น</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-lg font-bold text-gray-900">
                  {shopProducts.reduce((sum, p) => sum + (p.likes || 0), 0)}
                </span>
              </div>
              <p className="text-xs text-gray-500">ถูกใจ</p>
            </div>
          </div>
        </motion.div>

        {/* ═══ Shop Products ═══ */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            โปรโมชั่นจากร้านนี้
            <span className="text-sm font-normal text-gray-500">({shopProducts.length} รายการ)</span>
          </h2>

          {shopProducts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">ยังไม่มีโปรโมชั่น</h3>
              <p className="text-sm text-gray-500">ร้านค้านี้ยังไม่ได้ลงโปรโมชั่น</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shopProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.discount > 0 && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            -{product.discount}%
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-blue-600">
                            ฿{product.promoPrice.toLocaleString()}
                          </span>
                          {product.originalPrice > product.promoPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ฿{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {product.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" /> {product.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
