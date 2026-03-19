'use client';

import { Promotion } from '@/lib/types';
import Link from 'next/link';
import { CheckBadgeIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/solid';
import { 
  ShareIcon,
  ShoppingCartIcon,
  SparklesIcon,
  CubeIcon,
  CakeIcon,
  ComputerDesktopIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductStore } from '@/store/useProductStore';

interface PromoCardProps {
  promo: Promotion;
}

// Helper function to get icon by category
const getIconByCategory = (category: string) => {
  const iconMap: { [key: string]: any } = {
    'ของแถม': { icon: ShoppingCartIcon, color: 'from-green-400 to-emerald-500' },
    'ส่วนลด': { icon: SparklesIcon, color: 'from-orange-400 to-red-500' },
    'สินค้า': { icon: CubeIcon, color: 'from-blue-400 to-indigo-500' },
    'อาหาร': { icon: CakeIcon, color: 'from-pink-400 to-rose-500' },
    'เทคโนโลยี': { icon: ComputerDesktopIcon, color: 'from-purple-400 to-violet-500' },
  };
  return iconMap[category] || { icon: ShoppingCartIcon, color: 'from-gray-400 to-gray-500' };
};

export default function PromoCard({ promo }: PromoCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { savedProductIds, toggleSave } = useProductStore();
  const isFav = savedProductIds.includes(promo.id);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    toggleSave(promo.id);
  };
  return (
    <Link href={`/promo/${promo.id}`}>
      <div className={`card overflow-hidden cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] transition-all hover:shadow-2xl group ${
        promo.isPro 
          ? 'border-2 border-yellow-400 shadow-xl shadow-yellow-100 ring-2 ring-yellow-300/50 bg-gradient-to-br from-yellow-50/30 to-amber-50/30' 
          : ''
      }`}>
        {/* Image - Ready for Real Photos */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden group">
          {promo.imageUrl ? (
            <img 
              src={promo.imageUrl} 
              alt={promo.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 via-orange-50 to-red-50">
              <div className="text-center">
                {(() => {
                  const iconData = getIconByCategory(promo.category);
                  const Icon = iconData.icon;
                  return (
                    <div className={`inline-flex w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br ${iconData.color} rounded-2xl items-center justify-center mb-4 shadow-xl`}>
                      <Icon className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                    </div>
                  );
                })()}
                <p className="text-xs text-gray-400 px-4">รูปภาพสินค้าจะแสดงที่นี่</p>
              </div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {promo.isPro && (
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border-2 border-yellow-300 animate-pulse">
                👑 PRO
              </span>
            )}
            {promo.is_verified && (
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-md ${
                promo.isPro 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2 border-blue-400' 
                  : 'bg-white text-blue-600 border border-blue-200'
              }`}>
                <CheckBadgeIcon className="w-3 h-3" />
                Verified
              </span>
            )}
            {promo.is_sponsored && (
              <span className="badge-sponsored">
                ⭐ แนะนำ
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full transition-all ${
                isFav 
                  ? 'bg-red-500 shadow-lg scale-110' 
                  : 'bg-white/90 hover:bg-white hover:scale-105'
              } backdrop-blur-sm`}
              title={isFav ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
            >
              {isFav ? (
                <HeartSolidIcon className="w-5 h-5 text-white" />
              ) : (
                <HeartIcon className="w-5 h-5 text-red-500" />
              )}
            </button>
            {showLoginPrompt && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                กรุณาเข้าสู่ระบบก่อน
              </div>
            )}
          </div>

          {/* Discount Badge */}
          <div className="absolute bottom-2 right-2 bg-gradient-to-br from-red-500 to-red-600 text-white font-bold px-3 py-2 rounded-xl text-sm shadow-xl border-2 border-white transform group-hover:scale-110 transition-transform">
            <div className="text-xs opacity-90">ลด</div>
            <div className="text-lg leading-none">{promo.discount_rate}%</div>
          </div>

          {/* Views Counter */}
          {promo.views && (
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{promo.views.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Shop Name */}
          <div className="flex items-center gap-1.5 mb-2">
            <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            <p className={`text-xs font-semibold ${
              promo.isPro ? 'text-yellow-700' : 'text-gray-600'
            }`}>
              {promo.shop_name}
            </p>
            {promo.isPro && (
              <CheckBadgeIcon className="w-4 h-4 text-blue-500 flex-shrink-0" title="PRO Merchant" />
            )}
          </div>
          
          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-[#FF5722] transition-colors">
            {promo.title}
          </h3>

          {/* Tags */}
          {promo.tags && promo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {promo.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
            {promo.description}
          </p>

          {/* Price & Location */}
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 px-3 py-2 rounded-lg border border-orange-100">
              <p className="text-xs text-gray-500 line-through mb-0.5">
                ฿{Math.round(promo.price / (1 - promo.discount_rate / 100))}
              </p>
              <p className="text-lg sm:text-xl font-bold text-[#FF5722]">
                ฿{promo.price}
              </p>
            </div>
            <div className="text-xs text-gray-600 flex items-center gap-1 bg-gray-50 px-2 py-1.5 rounded-lg">
              <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0 text-[#FF5722]" />
              <span className="hidden sm:inline font-medium">{promo.location}</span>
              <span className="sm:hidden font-medium">{promo.location.split(' ')[0]}</span>
            </div>
          </div>

          {/* Valid Until */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              ถึง {new Date(promo.valid_until).toLocaleDateString('th-TH', { 
                day: 'numeric', 
                month: 'short',
                year: 'numeric'
              })}
            </span>
            <span className="text-[#FF5722]">👁️ {promo.search_volume.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex gap-2">
          <Link 
            href={`/shop/${encodeURIComponent(promo.shop_name)}`}
            className="flex-1 bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#E64A19] hover:to-[#FF5722] text-white py-2.5 px-4 rounded-xl text-sm sm:text-base font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 touch-manipulation flex items-center justify-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <MapPinIcon className="w-3.5 h-3.5" />
            </div>
            ดูร้านค้า
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (navigator.share) {
                navigator.share({
                  title: promo.title,
                  text: promo.description,
                  url: `/promo/${promo.id}`
                }).catch(() => {});
              } else {
                alert('คัดลอกลิงก์: ' + window.location.origin + `/promo/${promo.id}`);
              }
            }}
            className="p-2.5 border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all group flex items-center gap-2"
            title="แชร์"
          >
            <ShareIcon className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" />
          </button>
        </div>
      </div>
    </Link>
  );
}
