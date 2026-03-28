'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { 
  MapPinIcon, 
  ClockIcon, 
  SparklesIcon,
  BuildingStorefrontIcon,
  CheckBadgeIcon 
} from '@heroicons/react/24/solid';
import BookmarkButton from '@/components/Home/BookmarkButton';
import ShareButton from '@/components/Home/ShareButton';
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';

interface Promotion {
  id: string;
  shop_name: string;
  merchantId?: string;
  isPro?: boolean;
  title: string;
  description: string;
  price?: number;
  discount_rate?: number;
  category: string;
  is_verified?: boolean;
  is_sponsored?: boolean;
  location?: string;
  image?: string;
  valid_until?: string;
  stockStatus?: string;
}

interface EnhancedPromoCardProps {
  promo: Promotion;
  index?: number;
}

export default function EnhancedPromoCard({ promo, index = 0 }: EnhancedPromoCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // กำหนดสีและสไตล์ตาม Brand Type
  const isBigBrand = promo.isPro || promo.is_sponsored;
  
  const brandStyles = isBigBrand ? {
    borderColor: 'border-gray-100',
    badgeColor: 'bg-purple-600',
    accentColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    hoverTitle: 'group-hover:text-purple-600',
  } : {
    borderColor: 'border-gray-100',
    badgeColor: 'bg-orange-500',
    accentColor: 'text-orange-600',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    hoverTitle: 'group-hover:text-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1] 
      }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Link href={`/promo/${encodeURIComponent(promo.id)}`} className="block">
        <div className={`
          relative overflow-hidden rounded-xl border ${brandStyles.borderColor}
          bg-white
          shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]
        `}>
          {/* Badge ประเภทร้านค้า */}
          <div className="absolute top-3 left-3 z-10 flex gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
              className={`
                ${brandStyles.badgeColor} 
                px-2.5 py-1 rounded-lg 
                shadow-sm
              `}
            >
              <div className="flex items-center gap-1.5">
                {isBigBrand ? (
                  <>
                    <SparklesIcon className="w-4 h-4 text-white" />
                    <span className="text-caption text-white">แบรนด์ใหญ่</span>
                  </>
                ) : (
                  <>
                    <BuildingStorefrontIcon className="w-4 h-4 text-white" />
                    <span className="text-caption text-white">SME ประจำถิ่น</span>
                  </>
                )}
              </div>
            </motion.div>
            
            {promo.is_verified && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                className="bg-blue-500 px-2.5 py-1.5 rounded-full shadow-lg"
              >
                <CheckBadgeIcon className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </div>

          {/* Bookmark & Share Buttons */}
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            <BookmarkButton promoId={promo.id} />
            <ShareButton promo={promo} />
          </div>

          {/* รูปภาพโปรโมชั่น */}
          <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
            {!imageError && promo.image ? (
              <Image
                src={resolveImageUrl(promo.image, getCategoryFallbackImage(promo.category))}
                alt={promo.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                onError={() => setImageError(true)}
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg=="
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${brandStyles.iconBg}`}>
                {isBigBrand ? (
                  <SparklesIcon className={`w-16 h-16 ${brandStyles.iconColor} opacity-40`} />
                ) : (
                  <BuildingStorefrontIcon className={`w-16 h-16 ${brandStyles.iconColor} opacity-40`} />
                )}
              </div>
            )}
            
            {/* Discount Badge */}
            {promo.discount_rate && promo.discount_rate > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: -12 }}
                transition={{ delay: 0.4 + index * 0.1, type: "spring", bounce: 0.5 }}
                className="absolute bottom-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-lg shadow-lg font-bold"
              >
                -{promo.discount_rate}%
              </motion.div>
            )}
          </div>

          {/* เนื้อหา */}
          <div className="p-4 space-y-3">
            {/* ชื่อร้านค้า */}
            <div className="flex items-center gap-2">
              <div className={`
                p-1.5 rounded-lg ${brandStyles.iconBg}
                group-hover:scale-110 transition-transform duration-300
              `}>
                {isBigBrand ? (
                  <SparklesIcon className={`w-4 h-4 ${brandStyles.iconColor}`} />
                ) : (
                  <BuildingStorefrontIcon className={`w-4 h-4 ${brandStyles.iconColor}`} />
                )}
              </div>
              <p className={`text-body-sm font-semibold ${brandStyles.accentColor}`}>
                {promo.shop_name}
              </p>
            </div>

            {/* หัวข้อโปรโมชั่น */}
            <h3 className={`text-h4 text-gray-900 leading-tight line-clamp-2 ${brandStyles.hoverTitle} transition-colors`}>
              {promo.title}
            </h3>

            {/* คำอธิบาย */}
            <p className="text-sm text-slate-500 line-clamp-2">
              {promo.description}
            </p>

            {/* ราคาและข้อมูลเพิ่มเติม */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <div className="space-y-1">
                {promo.price && (
                  <p className="text-h2 text-gray-900">
                    ฿{promo.price}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPinIcon className="w-3.5 h-3.5" />
                  <span className="line-clamp-1">{promo.location || 'ทุกสาขา'}</span>
                </div>
              </div>

              {promo.valid_until && (
                <div className={`
                  flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                  ${brandStyles.iconBg}
                `}>
                  <ClockIcon className={`w-3.5 h-3.5 ${brandStyles.iconColor}`} />
                  <span className={`text-caption ${brandStyles.accentColor}`}>
                    {new Date(promo.valid_until).toLocaleDateString('th-TH', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            {promo.stockStatus && (
              <div className="pt-2">
                {promo.stockStatus === 'out_of_stock' ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                    <p className="text-caption text-red-600">
                      สินค้าหมด
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
                    <p className="text-caption text-green-600">
                      มีสินค้าพร้อมส่ง
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
