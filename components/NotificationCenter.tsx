'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, Package, Gift, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/lib/notificationContext';
import Link from 'next/link';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Listen for bell shake event
  useEffect(() => {
    const handleShake = () => {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 1000);
    };

    window.addEventListener('bellShake', handleShake);
    return () => window.removeEventListener('bellShake', handleShake);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'restock':
        return <Package className="w-5 h-5 text-green-600" />;
      case 'promo':
        return <Gift className="w-5 h-5 text-red-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    return `${days} วันที่แล้ว`;
  };

  return (
    <>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <motion.div
          animate={shouldShake ? {
            rotate: [0, -20, 20, -20, 20, 0],
            scale: [1, 1.1, 1.1, 1.1, 1.1, 1]
          } : {}}
          transition={{ duration: 0.6 }}
        >
          <Bell className="w-6 h-6 text-gray-700" />
        </motion.div>
        
        {/* Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Dropdown/Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed md:absolute top-16 md:top-full right-4 md:right-0 w-[calc(100vw-2rem)] md:w-96 max-h-[80vh] bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">การแจ้งเตือน</h3>
                  <p className="text-sm text-red-100">
                    {unreadCount > 0 ? `${unreadCount} รายการใหม่` : 'ไม่มีรายการใหม่'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                    >
                      อ่านทั้งหมด
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[60vh] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium mb-1">ยังไม่มีการแจ้งเตือน</p>
                    <p className="text-sm text-gray-400">
                      เราจะแจ้งเตือนคุณเมื่อมีดีลใหม่หรือสินค้ากลับมามีสต็อก
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`
                          p-4 hover:bg-gray-50 cursor-pointer transition-colors
                          ${!notification.read ? 'bg-blue-50/50' : ''}
                        `}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-relaxed ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            
                            {notification.branchName && (
                              <p className="text-xs text-gray-500 mt-1">
                                📍 {notification.branchName}
                              </p>
                            )}

                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(notification.timestamp)}
                            </p>

                            {/* View Product Link */}
                            {notification.type === 'restock' && notification.productId !== 'welcome' && (
                              <Link
                                href={`/promo/${notification.productId}`}
                                className="inline-block mt-2 text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                ดูสินค้าตอนนี้ →
                              </Link>
                            )}
                          </div>

                          {/* Unread Indicator */}
                          {!notification.read && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <Link 
                    href="/notifications"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors text-center"
                  >
                    ดูการแจ้งเตือนทั้งหมด
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
