'use client';

import { useState, useEffect } from 'react';
import { BellRing, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  isSubscribedToRestock,
  subscribeToRestock,
  unsubscribeFromRestock,
} from '@/lib/restockSubscriptions';

interface NotifyButtonProps {
  productId: string;
  productName: string;
  branchName: string;
  stockStatus: string;
}

export default function NotifyButton({
  productId,
  productName,
  stockStatus,
}: NotifyButtonProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (stockStatus !== 'out_of_stock') return;
    isSubscribedToRestock(productId).then(setSubscribed);
  }, [productId, stockStatus]);

  // Only show when out of stock
  if (stockStatus !== 'out_of_stock') {
    return null;
  }

  const handleClick = async () => {
    setIsLoading(true);
    try {
      if (subscribed) {
        const result = await unsubscribeFromRestock(productId);
        if (result.success) {
          setSubscribed(false);
          toast.success('ปิดการแจ้งเตือนแล้ว');
        }
      } else {
        const result = await subscribeToRestock(productId);
        if (result.success) {
          setSubscribed(true);
          toast.success(`✅ เราจะแจ้งเตือนคุณทันทีที่ ${productName} มีสินค้า`, {
            duration: 4000,
            icon: '🔔',
          });
        } else {
          toast.error(result.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        w-full py-4 px-6 rounded-xl font-semibold text-lg
        flex items-center justify-center gap-3
        transition-all duration-300 disabled:opacity-60
        ${subscribed
          ? 'bg-green-600 text-white hover:bg-green-700 border-2 border-green-600'
          : 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-2 border-orange-400 dark:border-orange-700'
        }
      `}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
    >
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : subscribed ? (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <Check className="w-6 h-6" />
          </motion.div>
          <span>เปิดการแจ้งเตือนแล้ว</span>
        </>
      ) : (
        <>
          <motion.div
            animate={{
              rotate: [0, -15, 15, -15, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            <BellRing className="w-6 h-6" />
          </motion.div>
          <span>แจ้งเตือนเมื่อมีของ</span>
        </>
      )}
    </motion.button>
  );
}
