'use client';

import { motion } from 'framer-motion';
import { BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { useProductStore } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  promoId: string;
}

export default function BookmarkButton({ promoId }: BookmarkButtonProps) {
  const { isAuthenticated, user } = useAuthStore();
  const { savedProductIds, toggleSave } = useProductStore();
  const isBookmarked = savedProductIds.includes(promoId);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('กรุณาเข้าสู่ระบบก่อนบันทึก');
      return;
    }

    toggleSave(promoId, user?.id);
    
    if (!isBookmarked) {
      toast.success('บันทึกโปรโมชั่นแล้ว!');
    } else {
      toast('ลบออกจากรายการบันทึกแล้ว');
    }
  };

  return (
    <motion.button
      onClick={handleBookmark}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        p-3 rounded-full backdrop-blur-sm transition-all duration-200 touch-manipulation
        ${isBookmarked 
          ? 'bg-orange-500 shadow-sm' 
          : 'bg-white/90 hover:bg-gray-50 border border-gray-100 shadow-sm'
        }
      `}
    >
      {isBookmarked ? (
        <BookmarkSolid className="w-5 h-5 text-white" />
      ) : (
        <BookmarkOutline className="w-5 h-5 text-gray-500" />
      )}
    </motion.button>
  );
}
