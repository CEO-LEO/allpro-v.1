'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * HomeSearchInput — กล่องค้นหาหน้าแรก (ตาม image_28.png)
 * - ไอคอนแว่นขยายด้านซ้าย
 * - ขอบสีส้ม (orange border) + มุมมน (rounded-full)
 * - กด Enter หรือคลิกไอคอนค้นหา → นำทางไปหน้า /search?q=...
 */
export default function HomeSearchInput() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // นำทางไปหน้าผลลัพธ์การค้นหา
  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  // กด Enter เพื่อค้นหา
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative w-full max-w-2xl mx-auto"
    >
      {/* ไอคอนค้นหา (ซ้าย) */}
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400 pointer-events-none" />

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="ค้นหาโปรโมชั่น..."
        className="w-full h-12 sm:h-14 pl-12 pr-28 sm:pr-32 rounded-full border-2 border-orange-400 bg-white shadow-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-base text-gray-700 placeholder:text-gray-400"
      />

      {/* ปุ่มค้นหา (ขวา — pill สีส้ม) */}
      <button
        onClick={handleSearch}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 sm:h-10 px-5 sm:px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-1.5"
      >
        <Search className="w-4 h-4" />
        <span>ค้นหา</span>
      </button>
    </motion.div>
  );
}
