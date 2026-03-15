'use client';

import { use } from 'react';
import Link from 'next/link';
import { 
  CheckBadgeIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  ShareIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/solid';
import { getPromotionById, getPromotions } from '@/lib/getPromotions';
import BranchAvailability from '@/components/BranchAvailability';
import PriceHistory from '@/components/Product/PriceHistory';
import NotifyButton from '@/components/Product/NotifyButton';
import PartyList from '@/components/Product/PartyList';
import PhotoGallery from '@/components/Product/PhotoGallery';
import WorthItMeter from '@/components/Product/WorthItMeter';
import Reviews from '@/components/Product/Reviews';

export default function PromoDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const promo = getPromotionById(decodeURIComponent(resolvedParams.id));

  if (!promo) {
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
              โปรโมชั่น ID: "{resolvedParams.id}" อาจหมดเวลาแล้วหรือถูกลบไป
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
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-3xl">🛍️</span>
                        </div>
                      )}
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

  const verificationDate = new Date(promo.valid_until);
  verificationDate.setDate(verificationDate.getDate() - 7);

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
          <div className="relative h-56 sm:h-72 md:h-80 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
            <span className="text-6xl sm:text-8xl md:text-9xl">{getEmojiByCategory(promo.category)}</span>
            
            {/* Discount Badge */}
            <div className="absolute top-4 right-4 bg-red-500 text-white font-bold px-6 py-3 rounded-full text-2xl shadow-lg">
              -{promo.discount_rate}%
            </div>
          </div>
        </div>

        {/* Photo Gallery - Real Photos from Users */}
        <div className="mb-6">
          <PhotoGallery
            photos={[
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
              'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600',
              'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600',
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
              'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
              'https://images.unsplash.com/photo-1547592180-85f173990554?w=600',
            ]}
            officialImage={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600`}
            productName={promo.title}
          />
        </div>

        {/* Content */}
        <div className="card p-6 mb-6">
          {/* Shop Name */}
          <p className="text-sm text-gray-500 font-medium mb-2">{promo.shop_name}</p>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{promo.title}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-4 mb-6 pb-6 border-b">
            <div>
              <p className="text-sm text-gray-400 line-through">
                ฿{Math.round(promo.price / (1 - promo.discount_rate / 100))}
              </p>
              <p className="text-4xl font-bold text-[#FF5722]">
                ฿{promo.price}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">ประหยัด</p>
              <p className="text-2xl font-bold text-green-600">
                ฿{Math.round(promo.price / (1 - promo.discount_rate / 100)) - promo.price}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">รายละเอียด</h2>
            <p className="text-gray-700 leading-relaxed">{promo.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPinIcon className="w-5 h-5 text-[#FF5722]" />
              <div>
                <p className="text-xs text-gray-500">สถานที่</p>
                <p className="font-semibold text-gray-900">{promo.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-[#FF5722]" />
              <div>
                <p className="text-xs text-gray-500">ใช้ได้ถึง</p>
                <p className="font-semibold text-gray-900">
                  {new Date(promo.valid_until).toLocaleDateString('th-TH', {
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
                <p className="font-semibold text-gray-900">{promo.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">👁️</span>
              <div>
                <p className="text-xs text-gray-500">ความนิยม</p>
                <p className="font-semibold text-gray-900">
                  {promo.search_volume.toLocaleString()} views
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
                
                {/* Sparkle Effect */}
                <div className="absolute top-2 right-2 text-2xl animate-bounce">✨</div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
                      🛍️
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">จ้างคนหิ้ว Fastwork</h3>
                      <p className="text-white/90 text-sm">ไม่ว่างไป? ให้เราช่วยซื้อและส่งให้ถึงบ้าน</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-2xl font-bold">⚡</div>
                        <div className="text-xs text-white/80">รวดเร็ว</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">✅</div>
                        <div className="text-xs text-white/80">ตรวจสอบ</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">📦</div>
                        <div className="text-xs text-white/80">ส่งถึงบ้าน</div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-white text-orange-600 font-bold py-3 px-6 rounded-xl hover:bg-orange-50 transition-all flex items-center justify-center gap-2 shadow-lg group-hover:scale-105">
                    <span>จ้างเลย ฿{Math.round(promo.price * 1.15)}</span>
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
              productId={promo.id}
              productTitle={promo.title}
            />

            {/* Notify Button (shows when out of stock) */}
            <NotifyButton
              productId={promo.id}
              productName={promo.title}
              branchName="All Branches"
              stockStatus={promo.stockStatus || 'in_stock'}
            />

            <div className="flex gap-3">
              <button 
                className="flex-1 btn-primary py-4 text-lg"
                onClick={() => alert('เปิดแผนที่นำทาง Google Maps...')}
              >
                📍 ดูแผนที่ร้านค้า
              </button>
              <button 
                className="btn-secondary px-6"
                onClick={() => alert('บันทึกโปรโมชั่นแล้ว!')}
              >
                <HeartIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Party Finder - Group Buying */}
        <PartyList
          productId={promo.id}
          productName={promo.title}
          dealType={promo.description}
          discount={promo.discount_rate}
        />

        {/* Worth It Meter - Quick Voting */}
        <div className="mb-6">
          <WorthItMeter productId={promo.id} />
        </div>

        {/* Reviews Section */}
        <div className="mb-6">
          <Reviews productId={promo.id} />
        </div>

        {/* Price History Graph */}
        <div className="mb-6">
          <PriceHistory 
            productName={promo.title}
            currentPrice={promo.price}
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
              <p className="text-3xl font-bold text-purple-900">{promo.search_volume}</p>
              <p className="text-sm text-purple-700">ผู้เข้าชม</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-900">{Math.round(promo.search_volume * 0.23)}</p>
              <p className="text-sm text-purple-700">บันทึก</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-900">{Math.round(promo.search_volume * 0.45)}</p>
              <p className="text-sm text-purple-700">คลิกดูร้าน</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function getEmojiByCategory(category: string): string {
  const emojiMap: Record<string, string> = {
    'อาหาร': '🍜',
    'เครื่องดื่ม': '☕',
    'แฟชั่น': '👕',
    'ของใช้': '🧴',
    'ขนม': '🍪',
    'ของหวาน': '🍰',
    'ไอที': '💻'
  };
  return emojiMap[category] || '🎁';
}
