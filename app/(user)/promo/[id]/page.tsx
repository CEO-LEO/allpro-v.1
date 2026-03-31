'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckBadgeIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  ShareIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/solid';
import { getPromotionById, getPromotions } from '@/lib/getPromotions';
import { useProductStore } from '@/store/useProductStore';
import { Promotion } from '@/lib/types';
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';
import BranchAvailability from '@/components/BranchAvailability';
import PriceHistory from '@/components/Product/PriceHistory';
import NotifyButton from '@/components/Product/NotifyButton';
import PartyList from '@/components/Product/PartyList';
import PhotoGallery from '@/components/Product/PhotoGallery';
import WorthItMeter from '@/components/Product/WorthItMeter';
import Reviews from '@/components/Product/Reviews';

export default function PromoDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const decodedId = decodeURIComponent(resolvedParams.id);
  const storeProducts = useProductStore((s) => s.products);
  const [dbPromo, setDbPromo] = useState<Promotion | null>(null);
  const [dbLoading, setDbLoading] = useState(false);

  // Try static data first, then fallback to product store
  let promo: Promotion | undefined = getPromotionById(decodedId);

  if (!promo) {
    const storeProduct = storeProducts.find((p) => p.id === decodedId);
    if (storeProduct) {
      promo = {
        id: storeProduct.id,
        shop_name: storeProduct.shopName,
        title: storeProduct.title,
        description: storeProduct.description,
        price: storeProduct.promoPrice,
        discount_rate: storeProduct.discount,
        category: storeProduct.category,
        is_verified: storeProduct.verified,
        is_sponsored: false,
        location: storeProduct.distance || 'ทุกสาขา',
        search_volume: 0,
        image: resolveImageUrl(storeProduct.image, getCategoryFallbackImage(storeProduct.category)),
        gallery: storeProduct.gallery,
        valid_until: storeProduct.validUntil,
        views: storeProduct.likes || 0,
        saves: 0,
        tags: storeProduct.tags,
      };
    }
  }

  // Fallback: fetch from API if not found locally
  useEffect(() => {
    if (promo) return;
    setDbLoading(true);
    const fetchFromApi = async () => {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(decodedId)}`);
        const json = await res.json();
        const data = json.data;
        if (data) {
          setDbPromo({
            id: String(data.id),
            shop_name: String(data.shop_name || data.shopName || 'ร้านค้า'),
            title: String(data.title || ''),
            description: String(data.description || ''),
            price: Number(data.price || data.promoPrice || 0),
            discount_rate: Number(data.discount || data.discount_rate || 0),
            category: String(data.category || 'Other'),
            is_verified: Boolean(data.is_verified || data.verified),
            is_sponsored: false,
            location: String(data.location || data.distance || 'ทุกสาขา'),
            search_volume: 0,
            image: String(data.image || ''),
            gallery: Array.isArray(data.gallery) ? data.gallery : undefined,
            valid_until: String(data.valid_until || data.validUntil || new Date(Date.now() + 7 * 86400000).toISOString()),
            views: Number(data.views || data.likes || 0),
            saves: 0,
            tags: Array.isArray(data.tags) ? data.tags : [],
          });
        }
      } catch (err) {
        console.error('API fetch error:', err);
      } finally {
        setDbLoading(false);
      }
    };
    fetchFromApi();
  }, [decodedId]);

  // Use DB promo as final fallback
  const finalPromo = promo || dbPromo;

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!finalPromo) {
    // Get popular promos as fallback
    const popularPromos = getPromotions().slice(0, 6);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Error Message */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">😔</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบโปรโมชั่นที่คุณค้นหา</h1>
            <p className="text-gray-600 mb-6">
              โปรโมชั่น ID: &quot;{resolvedParams.id}&quot; อาจหมดเวลาแล้วหรือถูกลบไป
            </p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition-colors">
              กลับหน้าแรก
            </Link>
          </div>

          {/* Popular Promos */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">โปรโมชั่นยอดนิยม</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularPromos.map((promo, index) => (
                <Link key={promo.id} href={`/promo/${promo.id}`} className="group">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-all">
                    <div className="relative h-40 bg-gray-100">
                      {promo.image ? (
                        <img 
                          src={promo.image} 
                          alt={promo.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full items-center justify-center text-gray-400 ${promo.image ? 'hidden' : 'flex'}`}>
                        <span className="text-3xl">🛍️</span>
                      </div>
                      {promo.discount_rate && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                          -{promo.discount_rate}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 line-clamp-1 mb-2">{promo.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{promo.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-orange-600">{promo.shop_name}</span>
                        {promo.price && (
                          <span className="text-lg font-bold text-gray-900">฿{promo.price}</span>  
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const verificationDate = new Date(finalPromo.valid_until);
  verificationDate.setDate(verificationDate.getDate() - 7);

  // Resolve image URL for display
  const displayImage = resolveImageUrl(finalPromo.image, getCategoryFallbackImage(finalPromo.category));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="text-sm sm:text-base text-[#FF5722] font-semibold hover:underline transition-colors">
            ← <span className="hidden xs:inline">กลับ</span>
          </Link>
          <div className="flex gap-1 sm:gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShareIcon className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <HeartIcon className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Main Image */}
        <div className="card overflow-hidden mb-4 sm:mb-6">
          <div className="relative h-56 sm:h-72 md:h-80 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center overflow-hidden">
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={finalPromo.title} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`flex-col items-center justify-center text-gray-300 w-full h-full ${displayImage ? 'hidden' : 'flex'}`}>
              <ShoppingBagIcon className="w-20 h-20 sm:w-28 sm:h-28" />
              <p className="text-sm mt-2">ไม่มีรูปภาพ</p>
            </div>
            
            {/* Discount Badge */}
            <div className="absolute top-4 right-4 bg-red-500 text-white font-bold px-6 py-3 rounded-full text-2xl shadow-lg">
              -{finalPromo.discount_rate}%
            </div>
          </div>
        </div>

        {/* Photo Gallery - Real Photos from Users */}
        {finalPromo.gallery && finalPromo.gallery.length > 0 && (
          <div className="mb-6">
            <PhotoGallery
              photos={finalPromo.gallery}
              officialImage={displayImage || ''}
              productName={finalPromo.title}
            />
          </div>
        )}

        {/* Content */}
        <div className="card p-6 mb-6">
          {/* Shop Name */}
          <Link href={`/shop/${encodeURIComponent(finalPromo.shop_name)}`} className="text-sm text-blue-600 font-medium mb-2 hover:underline inline-flex items-center gap-1">
            <MapPinIcon className="w-4 h-4" />
            {finalPromo.shop_name}
          </Link>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{finalPromo.title}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-4 mb-6 pb-6 border-b">
            <div>
              <p className="text-sm text-gray-400 line-through">
                ฿{Math.round(finalPromo.price / (1 - finalPromo.discount_rate / 100))}
              </p>
              <p className="text-4xl font-bold text-[#FF5722]">
                ฿{finalPromo.price}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">ประหยัด</p>
              <p className="text-2xl font-bold text-green-600">
                ฿{Math.round(finalPromo.price / (1 - finalPromo.discount_rate / 100)) - finalPromo.price}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">รายละเอียด</h2>
            <p className="text-gray-700 leading-relaxed">{finalPromo.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPinIcon className="w-5 h-5 text-[#FF5722]" />
              <div>
                <p className="text-xs text-gray-500">สถานที่</p>
                <p className="font-semibold text-gray-900">{finalPromo.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-[#FF5722]" />
              <div>
                <p className="text-xs text-gray-500">ใช้ได้ถึง</p>
                <p className="font-semibold text-gray-900">
                  {new Date(finalPromo.valid_until).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <ClockIcon className="w-5 h-5 text-[#FF5722]" />
              <div>
                <p className="text-xs text-gray-500">หมวดหมู่</p>
                <p className="font-semibold text-gray-900">{finalPromo.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">👁️</span>
              <div>
                <p className="text-xs text-gray-500">ความนิยม</p>
                <p className="font-semibold text-gray-900">
                  {(finalPromo.search_volume || 0).toLocaleString()} views
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Fastwork Shopping Service - PRIMARY CTA */}
            <a
              href="https://fastwork.co/shopping-service"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] border-4 border-orange-200 relative overflow-hidden group">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <ShoppingBagIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">จ้างคนหิ้ว Fastwork</h3>
                      <p className="text-white/90 text-sm">ไม่ว่างไป? ให้เราช่วยซื้อและส่งให้ถึงบ้าน</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <ClockIcon className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-xs text-white/80">รวดเร็ว</div>
                      </div>
                      <div>
                        <ShieldCheckIcon className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-xs text-white/80">ตรวจสอบ</div>
                      </div>
                      <div>
                        <ArchiveBoxIcon className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-xs text-white/80">ส่งถึงบ้าน</div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-white text-orange-600 font-bold py-3 px-6 rounded-xl hover:bg-orange-50 transition-all flex items-center justify-center gap-2 shadow-lg group-hover:scale-105">
                    <span>จ้างเลย ฿{Math.round(finalPromo.price * 1.15)}</span>
                    <span className="text-xl">→</span>
                  </button>
                  
                  <p className="text-center text-white/70 text-xs mt-2">
                    รวมค่าบริการและส่ง (ประมาณการ +15%)
                  </p>
                </div>
              </div>
            </a>

            {/* Branch Availability Component */}
            <BranchAvailability 
              productId={finalPromo.id}
              productTitle={finalPromo.title}
            />

            {/* Notify Button (shows when out of stock) */}
            <NotifyButton
              productId={finalPromo.id}
              productName={finalPromo.title}
              branchName="All Branches"
              stockStatus={finalPromo.stockStatus || 'in_stock'}
            />

            <div className="flex gap-3">
              <Link 
                href={`/shop/${encodeURIComponent(finalPromo.shop_name)}`}
                className="flex-1 btn-primary py-4 text-lg text-center flex items-center justify-center gap-2"
              >
                ดูร้านค้า
              </Link>
              <button 
                className="btn-secondary px-6"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: finalPromo.title, text: finalPromo.description, url: window.location.href }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('คัดลอกลิงก์แล้ว!');
                  }
                }}
              >
                <ShareIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Party Finder - Group Buying */}
        <PartyList
          productId={finalPromo.id}
          productName={finalPromo.title}
          dealType={finalPromo.description}
          discount={finalPromo.discount_rate}
        />

        {/* Worth It Meter - Quick Voting */}
        <div className="mb-6">
          <WorthItMeter productId={finalPromo.id} />
        </div>

        {/* Reviews Section */}
        <div className="mb-6">
          <Reviews productId={finalPromo.id} />
        </div>

        {/* Price History Graph */}
        <div className="mb-6">
          <PriceHistory 
            productId={finalPromo.id}
            productName={finalPromo.title}
            currentPrice={finalPromo.price}
          />
        </div>

        {/* Report Section */}
        <div className="card p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-yellow-900 mb-2">
                พบข้อมูลที่ไม่ถูกต้อง?
              </h3>
              <p className="text-sm text-yellow-700 mb-4">
                ช่วยเราปรับปรุงคุณภาพข้อมูลโดยการรายงานข้อผิดพลาด 
                ระบบของเราใช้ Community Crowdsourcing เพื่อตรวจสอบความถูกต้อง
              </p>
              <button 
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-full transition-colors"
                onClick={() => {
                  const reason = prompt('กรุณาระบุสาเหตุที่รายงาน:\n\n1. ราคาไม่ถูกต้อง\n2. โปรโมชั่นหมดอายุแล้ว\n3. ข้อมูลร้านค้าผิด\n4. อื่นๆ');
                  if (reason) {
                    alert('ขอบคุณสำหรับการรายงาน! ทีมงานจะตรวจสอบภายใน 24 ชั่วโมง');
                  }
                }}
              >
                🚨 รายงานข้อผิดพลาด
              </button>
            </div>
          </div>
        </div>

        {/* Stats for Demo */}
        <div className="mt-8 card p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <h3 className="font-bold text-purple-900 mb-4">📊 สถิติโปรโมชั่นนี้ (Demo)</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-purple-900">{finalPromo.search_volume || 0}</p>
              <p className="text-sm text-purple-700">ผู้เข้าชม</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-900">{Math.round((finalPromo.search_volume || 0) * 0.23)}</p>
              <p className="text-sm text-purple-700">บันทึก</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-900">{Math.round((finalPromo.search_volume || 0) * 0.45)}</p>
              <p className="text-sm text-purple-700">คลิกดูร้าน</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


