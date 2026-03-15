'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';

interface BookmarkButtonProps {
  promoId: string;
}

export default function BookmarkButton({ promoId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // โหลดสถานะ bookmark จาก localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedPromos') || '[]');
      setIsBookmarked(bookmarks.includes(promoId));
    }
  }, [promoId]);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedPromos') || '[]');
    
    if (isBookmarked) {
      // ลบ bookmark
      const updated = bookmarks.filter((id: string) => id !== promoId);
      localStorage.setItem('bookmarkedPromos', JSON.stringify(updated));
      setIsBookmarked(false);
    } else {
      // เพิ่ม bookmark
      bookmarks.push(promoId);
      localStorage.setItem('bookmarkedPromos', JSON.stringify(bookmarks));
      setIsBookmarked(true);
      
      // แสดง toast notification
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
