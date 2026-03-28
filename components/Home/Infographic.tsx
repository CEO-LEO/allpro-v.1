'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  MapPinIcon,
} from '@heroicons/react/24/solid';

// Interface สำหรับข้อมูลสถิติ
interface StatItem {
  id: number;
  iconName: string;
  value: string;
  label: string;
  color: string;
  bgColor: string;
}

// Map สำหรับ resolve icon จากชื่อ string (API)
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBagIcon,
  UserGroupIcon,
  MapPinIcon,
  SparklesIcon,
};

// ข้อมูลสถิติจำลอง — ใช้ขณะยังไม่มี API จริง
const MOCK_STATS: StatItem[] = [
  { id: 1, iconName: 'ShoppingBagIcon', value: '500+',   label: 'โปรโมชั่นทั้งหมด', color: 'from-orange-500 to-red-500',   bgColor: 'from-orange-50 to-red-50' },
  { id: 2, iconName: 'UserGroupIcon',   value: '10,000+', label: 'ผู้ใช้งาน',         color: 'from-blue-500 to-indigo-500', bgColor: 'from-blue-50 to-indigo-50' },
  { id: 3, iconName: 'MapPinIcon',      value: '100+',   label: 'ร้านค้าพาร์ทเนอร์',  color: 'from-orange-500 to-amber-500', bgColor: 'from-orange-50 to-amber-50' },
  { id: 4, iconName: 'SparklesIcon',    value: '70%',    label: 'ประหยัดสูงสุด',      color: 'from-purple-500 to-pink-500', bgColor: 'from-purple-50 to-pink-50' },
];

export default function Infographic() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: เชื่อมต่อ API จริง — เปลี่ยน MOCK_STATS เป็น response จาก API
  // e.g. const res = await fetch('/api/stats/overview'); const data = await res.json(); setStats(data.stats);
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(MOCK_STATS);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
            🎯 All Pro ในตัวเลข
          </h2>
          <p className="text-sm text-gray-500">
            ข้อมูลแพลตฟอร์มล่าสุด
          </p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white p-5 sm:p-6 border border-gray-100 shadow-sm animate-pulse">
              <div className="w-11 h-11 rounded-xl bg-gray-200 mb-4" />
              <div className="h-7 bg-gray-200 rounded-lg w-2/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : stats.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBagIcon className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">ยังไม่มีข้อมูลสถิติ</p>
          <p className="text-gray-400 text-sm mt-1">ข้อมูลจะปรากฏเมื่อระบบพร้อมใช้งาน</p>
        </div>
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = ICON_MAP[stat.iconName] || ShoppingBagIcon;
          
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.bgColor} p-4 sm:p-5 border border-white/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group cursor-default`}
            >
              {/* Background Pattern */}
              <div className="absolute -right-3 -top-3 opacity-[0.06]">
                <Icon className="w-20 h-20 text-gray-900" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Value */}
                <div
                  className={`text-2xl sm:text-3xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-0.5 leading-tight`}
                >
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  {stat.label}
                </div>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
            </motion.div>
          );
        })}
      </div>
      )}

      {/* Additional Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 mx-auto max-w-2xl"
      >
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 rounded-2xl px-5 py-4 border border-orange-200/60 shadow-sm">
          <div className="flex items-center justify-center gap-1.5 flex-wrap text-sm text-center leading-relaxed">
            <span className="font-bold text-orange-800">💡 ประหยัดได้มากกว่า</span>
            <span className="text-orange-600 font-extrabold">30–70%</span>
            <span className="text-gray-600">กับโปรโมชั่นกว่า</span>
            <span className="text-orange-600 font-extrabold">100+ ร้านค้า</span>
            <span className="text-gray-600">ทุกวัน!</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
