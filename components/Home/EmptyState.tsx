'use client';

import { motion } from 'framer-motion';
import { SearchX, ShoppingBag, Bell } from 'lucide-react';

interface EmptyStateProps {
  searchQuery?: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onNotifyMe?: () => void;
}

export default function EmptyState({ 
  searchQuery, 
  hasActiveFilters, 
  onClearFilters,
  onNotifyMe 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <div className="relative">
          {/* Shopping Bag */}
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-gray-300" />
          </div>
          
          {/* Sad Face Overlay */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute -bottom-2 -right-2 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center"
          >
            <span className="text-2xl">😞</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Message */}
      <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
        {searchQuery ? 'ไม่พบผลลัพธ์' : 'ไม่มีโปรโมชั่นที่ตรงกับเงื่อนไข'}
      </h3>
      
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {searchQuery 
          ? `ไม่พบโปรโมชั่นที่ตรงกับ "${searchQuery}"` 
          : 'ลองปรับเงื่อนไขการกรองหรือลบบางตัวกรองเพื่อดูโปรโมชั่นเพิ่มเติม'
        }
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {hasActiveFilters && (
          <motion.button
            onClick={onClearFilters}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            <SearchX className="w-5 h-5" />
            ล้างตัวกรองทั้งหมด
          </motion.button>
        )}

        {searchQuery && onNotifyMe && (
          <motion.button
            onClick={onNotifyMe}
            className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border-2 border-gray-300 transition-colors flex items-center gap-2"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            <Bell className="w-5 h-5" />
            แจ้งเตือนเมื่อมีโปรใหม่
          </motion.button>
        )}
      </div>

      {/* Suggestions */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-2">คำแนะนำ:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            ลองค้นหาด้วยคำอื่น
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            เลือกหมวดหมู่ที่กว้างขึ้น
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            ตรวจสอบการสะกดคำ
          </span>
        </div>
      </div>
    </motion.div>
  );
}
