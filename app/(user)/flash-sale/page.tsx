'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftIcon, ClockIcon, FireIcon, BoltIcon } from '@heroicons/react/24/solid';
import { MapPinIcon, HeartIcon } from '@heroicons/react/24/outline';

// Mock flash sale data
const FLASH_SALES = [
  {
    id: 1,
    title: 'ลดสูงสุด 70% ทุกเมนูกาแฟ',
    merchant: 'Starbucks Thailand',
    discount: 70,
    originalPrice: 150,
    salePrice: 45,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    claimed: 234,
    total: 500,
    location: 'สาขาเซ็นทรัลเวิลด์',
    category: 'เครื่องดื่ม'
  },
  {
    id: 2,
    title: 'ซื้อ 1 แถม 1 ทุกเมนู',
    merchant: 'KFC Thailand',
    discount: 50,
    originalPrice: 299,
    salePrice: 149,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500',
    endTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
    claimed: 567,
    total: 1000,
    location: 'ทุกสาขา',
    category: 'อาหาร'
  },
  {
    id: 3,
    title: 'Flash Sale รองเท้าผ้าใบ',
    merchant: 'Nike Store',
    discount: 60,
    originalPrice: 3990,
    salePrice: 1596,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
    claimed: 89,
    total: 200,
    location: 'สาขาสยามพารากอน',
    category: 'แฟชั่น'
  },
  {
    id: 4,
    title: 'ลด 80% ครีมบำรุงผิว',
    merchant: "L'Oréal Paris",
    discount: 80,
    originalPrice: 890,
    salePrice: 178,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500',
    endTime: new Date(Date.now() + 0.5 * 60 * 60 * 1000),
    claimed: 445,
    total: 500,
    location: 'ออนไลน์',
    category: 'ความงาม'
  },
  {
    id: 5,
    title: 'โปรโมชั่นบุฟเฟ่ต์',
    merchant: 'Shabu Shi',
    discount: 45,
    originalPrice: 599,
    salePrice: 329,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500',
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    claimed: 123,
    total: 300,
    location: 'สาขาเทอมินอล 21',
    category: 'อาหาร'
  },
  {
    id: 6,
    title: 'ลด 55% ทุกเมนูชา',
    merchant: 'ChaTraMue',
    discount: 55,
    originalPrice: 65,
    salePrice: 29,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500',
    endTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
    claimed: 678,
    total: 1000,
    location: 'ทุกสาขา',
    category: 'เครื่องดื่ม'
  },
];

function TimeDisplay({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance < 0) {
        setTimeLeft('หมดเวลา');
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg text-body-sm">
      <ClockIcon className="w-4 h-4" />
      <span>{timeLeft}</span>
    </div>
  );
}

export default function FlashSalePage() {
  const [filter, setFilter] = useState('ทั้งหมด');
  const [favorites, setFavorites] = useState<number[]>([]);

  const categories = ['ทั้งหมด', 'อาหาร', 'เครื่องดื่ม', 'แฟชั่น', 'ความงาม'];

  const filteredSales = filter === 'ทั้งหมด' 
    ? FLASH_SALES 
    : FLASH_SALES.filter(sale => sale.category === filter);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:bg-white/10 p-2 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-2">
              <BoltIcon className="w-7 h-7 animate-pulse" />
              <h1 className="text-h3">Flash Sale</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FireIcon className="w-8 h-8 animate-bounce" />
                <h2 className="text-h2 font-bold">ดีลสุดคุ้ม เวลาจำกัด!</h2>
              </div>
              <p className="text-white/90">รีบจับก่อนของหมด ลดสูงสุด 80%</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                <p className="text-body-sm text-white/80 mb-1">ดีลที่กำลังเป็นฮิต</p>
                <p className="text-display font-bold">{FLASH_SALES.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-[72px] z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                  filter === cat
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Flash Sales Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSales.map((sale, index) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={sale.image}
                      alt={sale.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1.5 rounded-full font-bold text-body-sm shadow-lg">
                      -{sale.discount}%
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(sale.id)}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:scale-110 transition-transform"
                    >
                      <HeartIcon
                        className={`w-5 h-5 ${
                          favorites.includes(sale.id)
                            ? 'fill-red-600 text-red-600'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>

                    {/* Timer */}
                    <div className="absolute bottom-3 left-3">
                      <TimeDisplay endTime={sale.endTime} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {sale.title}
                    </h3>
                    
                    <p className="text-body-sm text-gray-600 mb-3 flex items-center gap-1">
                      <span className="font-semibold text-orange-600">{sale.merchant}</span>
                    </p>

                    <div className="flex items-center gap-1 text-caption text-gray-500 mb-3">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{sale.location}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-h2 font-bold text-orange-600">
                        ฿{sale.salePrice}
                      </span>
                      <span className="text-body-sm text-gray-400 line-through">
                        ฿{sale.originalPrice}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-caption text-gray-600 mb-1">
                        <span>ขายแล้ว {sale.claimed}/{sale.total}</span>
                        <span>{Math.round((sale.claimed / sale.total) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(sale.claimed / sale.total) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/promo/${sale.id}`}
                      className="block w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-center py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                      ซื้อเลย
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {filteredSales.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔥</div>
            <h3 className="text-h3 text-gray-800 mb-2">ไม่พบ Flash Sale</h3>
            <p className="text-gray-600">ลองเลือกหมวดหมู่อื่นดูสิ</p>
          </div>
        )}
      </div>
    </div>
  );
}
