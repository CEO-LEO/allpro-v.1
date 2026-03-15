'use client';

import { motion } from 'framer-motion';
import { MapPin, Zap, TrendingUp, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Countdown from 'react-countdown';
import { useEffect, useState } from 'react';

interface FlashCardProps {
  id: number;
  title: string;
  shop_name: string;
  location: string;
  original_price: number;
  flash_price: number;
  discount_rate: number;
  image_url: string;
  end_time: Date;
  claimed_percentage?: number;
}

export default function FlashCard({
  id,
  title,
  shop_name,
  location,
  original_price,
  flash_price,
  discount_rate,
  image_url,
  end_time,
  claimed_percentage = 0
}: FlashCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Countdown renderer with custom styling
  const countdownRenderer = ({ hours, minutes, seconds, completed }: any) => {
    if (completed) {
      return <span className="text-gray-500">หมดเวลาแล้ว</span>;
    }

    return (
      <div className="flex items-center gap-1 font-mono font-bold">
        {hours > 0 && (
          <>
            <span className="bg-black/80 text-white px-2 py-1 rounded text-lg">
              {String(hours).padStart(2, '0')}
            </span>
            <span className="text-white">:</span>
          </>
        )}
        <span className="bg-black/80 text-white px-2 py-1 rounded text-lg">
          {String(minutes).padStart(2, '0')}
        </span>
        <span className="text-white">:</span>
        <span className="bg-black/80 text-white px-2 py-1 rounded text-lg">
          {String(seconds).padStart(2, '0')}
        </span>
      </div>
    );
  };

  return (
    <Link href={`/promo/${id}`}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
        }}
        whileHover={{ 
          scale: 1.02,
          y: -8,
        }}
        className="relative group cursor-pointer"
      >
        {/* Animated Glow Background */}
        <motion.div
          animate={{
            boxShadow: [
              '0 0 20px rgba(255, 87, 34, 0.5)',
              '0 0 40px rgba(255, 87, 34, 0.8)',
              '0 0 20px rgba(255, 87, 34, 0.5)',
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 blur-sm"
        />

        {/* Card Content */}
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-red-500">
          {/* Flash Sale Badge - Blinking */}
          <motion.div
            animate={{
              opacity: [1, 0.5, 1],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-3 left-3 z-10 bg-red-600 text-white px-3 py-1.5 rounded-full font-bold text-sm flex items-center gap-1 shadow-lg"
          >
            <Zap className="w-4 h-4 fill-current" />
            FLASH SALE
          </motion.div>

          {/* Countdown Timer - Top Right */}
          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1.5 rounded-full shadow-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {mounted && (
                <Countdown 
                  date={end_time}
                  renderer={countdownRenderer}
                />
              )}
            </div>
          </div>

          {/* Image Section */}
          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            {/* Animated Scanline Effect */}
            <motion.div
              animate={{
                y: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent h-20 z-10 pointer-events-none"
            />

            <Image
              src={image_url || '/placeholder-promo.jpg'}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Claimed Progress Bar - Bottom of Image */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
              <div className="flex items-center justify-between text-white text-xs mb-1">
                <span className="flex items-center gap-1 font-semibold">
                  <Users className="w-3 h-3" />
                  กำลังคว้าโปร
                </span>
                <span className="font-bold">{claimed_percentage}% Claimed</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${claimed_percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 rounded-full relative overflow-hidden"
                >
                  {/* Animated Shimmer */}
                  <motion.div
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                  />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <h3 className="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-red-600 transition-colors">
              {title}
            </h3>

            {/* Shop & Location */}
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-700">{shop_name}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{location}</span>
              </div>
            </div>

            {/* Price Section - Emphasized */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-3 border-2 border-red-200">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">ราคาปกติ</div>
                  <div className="text-sm text-gray-400 line-through font-semibold">
                    ฿{original_price.toFixed(2)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-red-600 font-bold mb-1">
                    ⚡ FLASH PRICE
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    ฿{flash_price.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Savings Highlight */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1 rounded-full"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="font-bold text-sm">
                  ประหยัด ฿{(original_price - flash_price).toFixed(2)} ({discount_rate}%)
                </span>
              </motion.div>
            </div>

            {/* Urgency Message */}
            <motion.div
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-center text-sm font-bold text-red-600"
            >
              🔥 รีบก่อนของหมด! มีจำนวนจำกัด
            </motion.div>
          </div>
        </div>

        {/* Pulsing Ring Effect */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-2xl border-4 border-red-500 pointer-events-none"
        />
      </motion.div>
    </Link>
  );
}
