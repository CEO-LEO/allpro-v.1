'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export interface BannerSlide {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  cta?: string;
  href: string;
  /** Gradient overlay — defaults to a dark scrim */
  overlay?: string;
  /** Badge label shown top-left */
  badge?: string;
  badgeColor?: string;
}

const defaultBanners: BannerSlide[] = [
  {
    id: 'banner-1',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=500&fit=crop',
    title: 'ดีลร้านอาหาร ลดสูงสุด 50%',
    subtitle: 'รวมโปรสุดคุ้ม อาหารญี่ปุ่น ไทย เกาหลี ลดแรงตลอดเดือนนี้!',
    cta: 'ดูดีลทั้งหมด',
    href: '/search?q=food',
    badge: 'HOT DEAL',
    badgeColor: 'bg-red-500',
  },
  {
    id: 'banner-2',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=500&fit=crop',
    title: 'แฟชั่นลดกระหน่ำ มีนาคมนี้!',
    subtitle: 'แบรนด์ดัง กระเป๋า รองเท้า เสื้อผ้า ลดสูงสุด 70%',
    cta: 'ช้อปเลย',
    href: '/search?q=fashion',
    badge: 'SALE 70%',
    badgeColor: 'bg-orange-500',
  },
  {
    id: 'banner-3',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=1200&h=500&fit=crop',
    title: 'Flash Sale ⚡ เฉพาะวันนี้',
    subtitle: 'สินค้า Gadget & Electronics ราคาพิเศษ จำนวนจำกัด!',
    cta: 'รีบจอง',
    href: '/flash-sale',
    badge: 'FLASH SALE',
    badgeColor: 'bg-yellow-500',
  },
  {
    id: 'banner-4',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=500&fit=crop',
    title: 'ทริปทะเล ราคาพิเศษ',
    subtitle: 'แพ็กเกจท่องเที่ยว ภูเก็ต กระบี่ เกาะสมุย เริ่มต้น ฿1,999',
    cta: 'จองเลย',
    href: '/search?q=travel',
    badge: 'TRAVEL',
    badgeColor: 'bg-cyan-500',
  },
  {
    id: 'banner-5',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=500&fit=crop',
    title: 'Beauty Week ลด 40%',
    subtitle: 'สกินแคร์ เมคอัพ จากแบรนด์ดัง K-Beauty & ไทย',
    cta: 'ดูโปร',
    href: '/search?q=beauty',
    badge: 'BEAUTY',
    badgeColor: 'bg-pink-500',
  },
];

const AUTOPLAY_MS = 5000;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

interface PromoBannerCarouselProps {
  banners?: BannerSlide[];
}

export default function PromoBannerCarousel({ banners = defaultBanners }: PromoBannerCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = banners.length;

  const goTo = useCallback(
    (index: number, dir?: number) => {
      setDirection(dir ?? (index > current ? 1 : -1));
      setCurrent((index + total) % total);
    },
    [current, total],
  );

  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(next, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, next]);

  const slide = banners[current];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Aspect ratio container */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[21/8] md:aspect-[21/7]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0"
          >
            {/* Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=500&fit=crop';
              }}
            />

            {/* Gradient overlay */}
            <div
              className={
                slide.overlay ??
                'absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent'
              }
            />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-14">
              {/* Badge */}
              {slide.badge && (
                <span
                  className={`inline-block w-fit px-3 py-1 rounded-full text-xs sm:text-sm font-bold text-white mb-2 sm:mb-3 ${slide.badgeColor ?? 'bg-red-500'}`}
                >
                  {slide.badge}
                </span>
              )}

              <h2 className="text-white text-xl sm:text-3xl md:text-4xl font-bold leading-tight drop-shadow-lg max-w-[70%] sm:max-w-[60%]">
                {slide.title}
              </h2>

              {slide.subtitle && (
                <p className="text-white/90 text-xs sm:text-sm md:text-base mt-1.5 sm:mt-2 max-w-[65%] sm:max-w-[55%] line-clamp-2 drop-shadow">
                  {slide.subtitle}
                </p>
              )}

              {slide.cta && (
                <Link
                  href={slide.href}
                  className="mt-3 sm:mt-4 inline-flex items-center gap-2 w-fit px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white text-sm sm:text-base font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  {slide.cta}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
      >
        <ChevronLeft className="w-5 h-5 text-gray-800" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
      >
        <ChevronRight className="w-5 h-5 text-gray-800" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-white shadow'
                : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Pause indicator */}
      {isPaused && (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/40 text-white/80 text-[10px] font-medium backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          ⏸ หยุดชั่วคราว
        </div>
      )}
    </div>
  );
}
