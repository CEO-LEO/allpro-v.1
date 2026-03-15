'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPinIcon, 
  SparklesIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon 
} from '@heroicons/react/24/solid';
import BookmarkButton from '@/components/Home/BookmarkButton';

interface NearbyPromo {
  id: string;
  shop_name: string;
  isPro?: boolean;
  title: string;
  description: string;
  price?: number;
  discount_rate?: number;
  location?: string;
  image?: string;
  distance?: number; // in km
}

interface NearbyGemsProps {
  promos: NearbyPromo[];
  userLocation?: { lat: number; lng: number };
}

export default function NearbyGems({ promos, userLocation }: NearbyGemsProps) {
  const [dragConstraints, setDragConstraints] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && scrollRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const scrollWidth = scrollRef.current.scrollWidth;
      setDragConstraints(containerWidth - scrollWidth);
    }
  }, [promos]);

  // Filter nearby promos (within 5km)
  const nearbyPromos = promos.filter(promo => {
    if (!promo.distance) return true;
    return promo.distance <= 5;
  }).slice(0, 10); // Show max 10 items

  if (nearbyPromos.length === 0) {
    return null;
  }

  return (
    <section className="py-8 overflow-hidden">
      {/* Header */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <MapPinIcon className="w-7 h-7 text-emerald-600" />
              </motion.div>
              <h2 className="text-h2 text-gray-900">
                Nearby Gems
              </h2>
            </div>
            <p className="text-body-sm text-gray-600">
              โปรโมชั่นพิเศษจากร้านค้ารอบตัวคุณ
            </p>
          </div>
          
          <Link 
            href="/map"
            className="flex items-center gap-1 text-body-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            ดูทั้งหมด
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll */}
      <div ref={containerRef} className="relative overflow-hidden">
        <motion.div
          ref={scrollRef}
          drag="x"
          dragConstraints={{ left: dragConstraints, right: 0 }}
          dragElastic={0.1}
          className="flex gap-4 px-4 cursor-grab active:cursor-grabbing"
        >
          {nearbyPromos.map((promo, index) => (
            <NearbyGemCard 
              key={promo.id} 
              promo={promo} 
              index={index}
            />
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="flex justify-center mt-4 gap-2">
        {nearbyPromos.length > 3 && (
          <div className="flex gap-1.5">
            {Array.from({ length: Math.min(Math.ceil(nearbyPromos.length / 3), 5) }).map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full bg-emerald-200"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Nearby Gem Card Component
function NearbyGemCard({ promo, index }: { promo: NearbyPromo; index: number }) {
  const [imageError, setImageError] = useState(false);
  const isBigBrand = promo.isPro;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.3
      }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="flex-shrink-0 w-72"
    >
      <Link href={`/promo/${promo.id}`}>
        <div className={`
          relative overflow-hidden rounded-2xl shadow-lg
          border-2 transition-all duration-300
          ${isBigBrand 
            ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-purple-200' 
            : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:shadow-emerald-200'
          }
        `}>
          {/* Image */}
          <div className="relative w-full h-40 bg-gray-100">
            {!imageError && promo.image ? (
              <Image
                src={promo.image}
                alt={promo.title}
                fill
                sizes="288px"
                className="object-cover"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className={`
                w-full h-full flex items-center justify-center
                ${isBigBrand ? 'bg-purple-100' : 'bg-emerald-100'}
              `}>
                {isBigBrand ? (
                  <SparklesIcon className="w-12 h-12 text-purple-400" />
                ) : (
                  <BuildingStorefrontIcon className="w-12 h-12 text-emerald-400" />
                )}
              </div>
            )}

            {/* Discount Badge */}
            {promo.discount_rate && promo.discount_rate > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2.5 py-1 rounded-lg shadow-lg text-body-sm">
                -{promo.discount_rate}%
              </div>
            )}

            {/* Bookmark */}
            <div className="absolute top-2 right-2">
              <BookmarkButton promoId={promo.id} />
            </div>

            {/* Distance Badge */}
            {promo.distance !== undefined && (
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-caption flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5" />
                {promo.distance < 1 
                  ? `${(promo.distance * 1000).toFixed(0)} ม.`
                  : `${promo.distance.toFixed(1)} กม.`
                }
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            {/* Shop Name */}
            <div className="flex items-center gap-2">
              <div className={`
                p-1 rounded-lg
                ${isBigBrand ? 'bg-purple-100' : 'bg-emerald-100'}
              `}>
                {isBigBrand ? (
                  <SparklesIcon className="w-3.5 h-3.5 text-purple-600" />
                ) : (
                  <BuildingStorefrontIcon className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </div>
              <span className={`
                text-caption
                ${isBigBrand ? 'text-purple-600' : 'text-emerald-600'}
              `}>
                {promo.shop_name}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-gray-900 text-body-sm leading-tight line-clamp-2">
              {promo.title}
            </h3>

            {/* Location */}
            {promo.location && (
              <div className="flex items-start gap-1 text-caption text-gray-600">
                <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-1">{promo.location}</span>
              </div>
            )}

            {/* Price */}
            {promo.price && (
              <div className={`
                inline-flex px-3 py-1.5 rounded-lg
                ${isBigBrand ? 'bg-purple-100' : 'bg-emerald-100'}
              `}>
                <p className={`
                  text-h4
                  ${isBigBrand ? 'text-purple-700' : 'text-emerald-700'}
                `}>
                  ฿{promo.price}
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
