'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Share2, MapPin, Clock, Zap, Flame } from 'lucide-react';
import { useState } from 'react';
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';

interface Promotion {
  id: string;
  shop_name?: string;
  shopName?: string;
  title: string;
  description: string;
  price?: number;
  discount_rate?: number;
  category: string;
  location?: string;
  image?: string;
  valid_until?: string;
  isPro?: boolean;
  tags?: string[];
}

interface MasonryPromoCardProps {
  promo: Promotion;
  index: number;
}

export default function MasonryPromoCard({ promo, index }: MasonryPromoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Safe shop name
  const shopName = promo.shop_name || promo.shopName || 'ร้านค้า';

  // คำนวณส่วนลด
  const discountPercent = promo.discount_rate || 0;
  const originalPrice = promo.price ? Math.round(promo.price / (1 - discountPercent / 100)) : 0;

  // Tag ส่วนลด
  const getDiscountTag = () => {
    if (discountPercent >= 70) return { text: `ลด ${discountPercent}%`, color: 'from-red-500 to-pink-600' };
    if (discountPercent >= 50) return { text: `ลด ${discountPercent}%`, color: 'from-orange-500 to-red-500' };
    if (discountPercent >= 30) return { text: `ลด ${discountPercent}%`, color: 'from-yellow-500 to-orange-500' };
    return { text: 'โปรดี', color: 'from-orange-400 to-amber-500' };
  };

  const tag = getDiscountTag();

  // Special tags detection
  const hasFlashSale = promo.tags?.includes('Flash Sale') || promo.title.includes('Flash');
  const hasBuyOneGetOne = promo.tags?.includes('1 แถม 1') || promo.title.includes('1 แถม 1');
  const isHot = discountPercent >= 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <Link href={`/promo/${promo.id}`}>
        <div 
          className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 cursor-pointer transform-gpu backdrop-blur-xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Container - รูปเด่น */}
          <div className="relative overflow-hidden bg-gray-100">
            <Image
              src={resolveImageUrl(promo.image, getCategoryFallbackImage(promo.category))}
              alt={promo.title}
              width={400}
              height={500}
              className={`w-full h-auto object-cover transition-transform duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
              loading="lazy"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Special Tags Stack */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {/* Flash Sale Tag */}
              {hasFlashSale && (
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wide">Flash Sale</span>
                </motion.div>
              )}
              
              {/* Buy 1 Get 1 Tag */}
              {hasBuyOneGetOne && (
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring' }}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-3 py-1.5 rounded-full shadow-2xl"
                >
                  <span className="text-xs font-black uppercase tracking-wide">1 แถม 1</span>
                </motion.div>
              )}
              
              {/* Discount Tag */}
              {discountPercent > 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -12 }}
                  animate={{ scale: 1, rotate: -12 }}
                  whileHover={{ scale: 1.1, rotate: -15 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className={`bg-gradient-to-r ${tag.color} text-white px-4 py-2 rounded-full shadow-2xl border-2 border-white/30`}
                >
                  <span className="text-sm font-black drop-shadow-lg flex items-center gap-1">
                    {isHot && <Flame className="w-4 h-4 animate-bounce" />}
                    {tag.text}
                  </span>
                </motion.div>
              )}
            </div>

            {/* PRO Badge */}
            {promo.isPro && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                ✨ PRO
              </div>
            )}

            {/* Floating Actions - ปรากฏเมื่อ hover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              className="absolute bottom-3 right-3 flex gap-2"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsBookmarked(!isBookmarked);
                }}
                className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg"
              >
                <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // Share logic
                }}
                className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-lg"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </motion.div>
          </div>

          {/* Content - ข้อมูลกระชับ */}
          <div className="p-5 bg-gradient-to-br from-white to-gray-50/30">
            {/* Shop Name with Badge */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                {shopName.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                {shopName}
              </p>
              {promo.isPro && (
                <span className="text-[10px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-full font-black">PRO</span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base font-extrabold text-gray-900 mb-3 line-clamp-2 min-h-[2.5rem] leading-tight">
              {promo.title}
            </h3>

            {/* Price */}
            {promo.price && (
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                  ฿{promo.price.toLocaleString()}
                </span>
                {originalPrice > promo.price && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 line-through">
                      ฿{originalPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-green-600 font-bold">
                      ประหยัด ฿{(originalPrice - promo.price).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Location & Time - with glassmorphism */}
            <div className="flex items-center justify-between text-xs text-gray-600 bg-white/60 backdrop-blur-sm rounded-xl p-2 border border-gray-100">
              {promo.location && (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  <span className="truncate max-w-[120px] font-semibold">{promo.location}</span>
                </div>
              )}
              {promo.valid_until && (
                <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span className="font-bold text-orange-700">ถึง {new Date(promo.valid_until).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
