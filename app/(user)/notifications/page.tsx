"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ArrowLeftIcon, 
  BellIcon, 
  TagIcon, 
  GiftIcon,
  CheckCircleIcon,
  CreditCardIcon,
  CogIcon
} from "@heroicons/react/24/outline";

// TODO: API Response Interface — GET /api/notifications
// คาดว่า API จะส่งข้อมูลในรูปแบบนี้กลับมา
interface Notification {
  id: string;
  type: "promotion" | "coupon" | "payment" | "system";
  title: string;
  description: string;
  timestamp: string;       // ISO string หรือ relative time จาก API
  isRead: boolean;
}

// กำหนดไอคอนและสีตามประเภทการแจ้งเตือน
const NOTIFICATION_STYLE: Record<Notification["type"], { label: string; color: string; bg: string; gradient: string }> = {
  promotion: { label: "โปรโมชั่น", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", gradient: "from-orange-500 to-amber-500" },
  coupon:    { label: "คูปอง",     color: "text-pink-600",   bg: "bg-pink-100 dark:bg-pink-900/30",   gradient: "from-pink-500 to-rose-500" },
  payment:   { label: "การชำระเงิน", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", gradient: "from-green-500 to-emerald-500" },
  system:    { label: "ระบบ",      color: "text-blue-600",   bg: "bg-blue-100 dark:bg-blue-900/30",   gradient: "from-blue-500 to-indigo-500" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: เปลี่ยนเป็น fetch จาก API จริง — e.g. const res = await fetch('/api/notifications');
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // const res = await fetch('/api/notifications');
        // const data: Notification[] = await res.json();
        // setNotifications(data);
        await new Promise(r => setTimeout(r, 600));
        setNotifications([]);
      } catch {
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAllAsRead = () => {
    // TODO: API call — PATCH /api/notifications/read-all
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    // TODO: API call — PATCH /api/notifications/:id/read
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const getIcon = (type: Notification["type"]) => {
    const cls = "w-6 h-6";
    switch (type) {
      case "promotion": return <TagIcon className={cls} />;
      case "coupon":    return <GiftIcon className={cls} />;
      case "payment":   return <CreditCardIcon className={cls} />;
      case "system":    return <CogIcon className={cls} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </motion.button>
            </Link>
            
            <h1 className="text-2xl font-bold">แจ้งเตือน</h1>
            
            <div className="w-10"></div>
          </div>

          {!isLoading && unreadCount > 0 && (
            <motion.button
              onClick={markAllAsRead}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white/20 backdrop-blur-sm text-white py-2 px-4 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              ทำเครื่องหมายว่าอ่านทั้งหมด ({unreadCount})
            </motion.button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto p-4 space-y-3">
        {/* Loading Skeleton */}
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                <div className="flex-1 space-y-2.5 py-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/5" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <BellIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ไม่มีการแจ้งเตือนใหม่ในขณะนี้
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              เมื่อมีโปรโมชั่นใหม่ คูปอง หรือข่าวสาร จะแจ้งเตือนที่นี่
            </p>
          </div>
        ) : (
          /* Notification Cards */
          notifications.map((notification, index) => {
            const style = NOTIFICATION_STYLE[notification.type];
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer ${
                  !notification.isRead
                    ? "border-2 border-orange-500"
                    : "border border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon — สีเปลี่ยนตาม type */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    !notification.isRead
                      ? `bg-gradient-to-br ${style.gradient} text-white`
                      : `${style.bg} ${style.color}`
                  }`}>
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </h3>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${style.bg} ${style.color}`}>
                          {style.label}
                        </span>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0 mt-1.5"></div>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                      {notification.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {notification.timestamp}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
