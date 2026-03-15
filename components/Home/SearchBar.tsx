'use client';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick: () => void;
  resultCount: number;
}

export default function SearchBar({ value, onChange, onFilterClick, resultCount }: SearchBarProps) {
  return (
    <div className="sticky top-[120px] z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4">
        {/* Capsule Container */}
        <div className="relative w-full max-w-2xl mx-auto mb-2">
          {/* Search Icon (Left) */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 text-xl z-10">
            <Search className="w-6 h-6" />
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="ค้นหาโปรโมชั่น สินค้า ร้านค้า..."
            className="w-full h-14 pl-12 pr-36 rounded-full border-2 border-orange-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white shadow-lg outline-none transition-all text-lg text-slate-700 placeholder:text-slate-400"
          />

          {/* Search Button (Right - Absolute Pill - CENTERED) */}
          <button
            onClick={onFilterClick}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-32 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2 whitespace-nowrap px-4"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">ค้นหา</span>
          </button>

          {/* Clear Button (Optional - Inside input) */}
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onChange('')}
                className="absolute right-40 top-1/2 -translate-y-1/2 p-2 hover:bg-orange-50 rounded-full transition-colors z-10"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Result Count */}
        {value && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-slate-600 ml-4"
          >
            พบ <span className="font-bold text-orange-600">{resultCount}</span> รายการ
          </motion.div>
        )}
      </div>
    </div>
  );
}
