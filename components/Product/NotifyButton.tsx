'use client';

import { Bell, BellRing, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from '@/lib/notificationContext';

interface NotifyButtonProps {
  productId: string;
  productName: string;
  branchName: string;
  stockStatus: string;
}

export default function NotifyButton({ 
  productId, 
  productName, 
  branchName,
  stockStatus 
}: NotifyButtonProps) {
  const { isSubscribed, subscribe, unsubscribe } = useNotifications();
  const subscribed = isSubscribed(productId);

  // Only show when out of stock
  if (stockStatus !== 'out_of_stock') {
    return null;
  }

  const handleClick = () => {
    if (subscribed) {
      unsubscribe(productId);
    } else {
      subscribe(productId, productName, branchName);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`
        w-full py-4 px-6 rounded-xl font-semibold text-lg
        flex items-center justify-center gap-3
        transition-all duration-300
        ${subscribed 
          ? 'bg-green-600 text-white hover:bg-green-700 border-2 border-green-600' 
          : 'bg-white text-orange-600 hover:bg-orange-50 border-2 border-orange-400'
        }
      `}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
    >
      {subscribed ? (
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
