'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { useProductStore } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';

interface BookmarkButtonProps {
  promoId: string;
}

export default function BookmarkButton({ promoId }: BookmarkButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const { savedProductIds, toggleSave } = useProductStore();
  const isBookmarked = savedProductIds.includes(promoId);
  const [showToast, setShowToast] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 2500);
      return;
    }

    toggleSave(promoId);
    
    if (!isBookmarked) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  return (
    <>
      <motion.button
        onClick={handleBookmark}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`
          p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300
          ${isBookmarked 
            ? 'bg-amber-500 hover:bg-amber-600' 
            : 'bg-white/90 hover:bg-amber-50 border border-gray-200'
          }
        `}
      >
        <motion.div
          animate={{ 
            rotate: isBookmarked ? [0, -10, 10, -10, 0] : 0,
          }}
          transition={{ duration: 0.5 }}
        >
          {isBookmarked ? (
            <BookmarkSolid className="w-5 h-5 text-white" />
          ) : (
            <BookmarkOutline className="w-5 h-5 text-gray-700" />
          )}
        </motion.div>
      </motion.button>

      {/* Login Prompt */}
      {showLoginPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl"
        >
          <span className="font-medium">กรุณาเข้าสู่ระบบก่อนบันทึก</span>
        </motion.div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 z-50 bg-amber-500 text-white px-4 py-3 rounded-xl shadow-2xl"
        >
          <div className="flex items-center gap-2">
            <BookmarkSolid className="w-5 h-5" />
            <span className="font-medium">บันทึกโปรโมชั่นแล้ว!</span>
          </div>
        </motion.div>
      )}
    </>
  );
}
