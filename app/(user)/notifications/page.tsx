"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ArrowLeftIcon, 
  BellIcon, 
  TagIcon, 
  GiftIcon,
  CheckCircleIcon 
} from "@heroicons/react/24/outline";

interface Notification {
  id: string;
  type: "price_drop" | "welcome" | "reward" | "system";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: "bell" | "tag" | "gift";
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "price_drop",
    title: "ลดราคา! Salmon Buffet",
    message: "ราคาใหม่ 599฿ จากเดิม 899฿",
    time: "2 ชั่วโมงที่แล้ว",
    isRead: false,
    icon: "tag"
  },
  {
    id: "2",
    type: "reward",
    title: "ได้รับ 10 เหรียญ",
    message: "คุณบันทึกโปรโมชั่น 'Shabu Premium' แล้ว",
    time: "5 ชั่วโมงที่แล้ว",
    isRead: false,
    icon: "gift"
  },
  {
    id: "3",
    type: "welcome",
    title: "ยินดีต้อนรับสู่ All Pro!",
    message: "เริ่มต้นล่าโปรเด็ดทั่วไทยได้เลย",
    time: "1 วันที่แล้ว",
    isRead: true,
    icon: "bell"
  },
  {
    id: "4",
    type: "system",
    title: "โปรโมชั่นใหม่ใกล้คุณ",
    message: "มี 3 ดีลใหม่ในระยะ 500 เมตร",
    time: "2 วันที่แล้ว",
    isRead: true,
    icon: "tag"
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "tag":
        return <TagIcon className="w-6 h-6" />;
      case "gift":
        return <GiftIcon className="w-6 h-6" />;
      default:
        return <BellIcon className="w-6 h-6" />;
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

          {unreadCount > 0 && (
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
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <BellIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ไม่มีการแจ้งเตือนใหม่
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              เมื่อมีโปรโมชั่นใหม่หรือข่าวสาร จะแจ้งเตือนที่นี่
            </p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all ${
                !notification.isRead ? "border-2 border-orange-500" : "border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  notification.isRead 
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400" 
                    : "bg-gradient-to-br from-orange-500 to-amber-500 text-white"
                }`}>
                  {getIcon(notification.icon)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {notification.time}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
