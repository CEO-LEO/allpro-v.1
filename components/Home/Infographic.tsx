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

export default function Infographic() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: เชื่อมต่อ API จริง
  // useEffect(() => {
  //   const fetchStats = async () => {
  //     setIsLoading(true);
  //     try {
  //       const res = await fetch('/api/stats/overview');
  //       const data = await res.json();
  //       setStats(data.stats);
  //     } catch (err) { console.error(err); }
  //     finally { setIsLoading(false); }
  //   };
  //   fetchStats();
  // }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-center mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-h2 text-gray-800 mb-2">
            🎯 All Pro ในตัวเลข
          </h2>
          <p className="text-body-sm text-gray-600">
            ข้อมูลแพลตฟอร์มล่าสุด
          </p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 p-6 border-2 border-white shadow-lg animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-gray-200 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-1" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : stats.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
          <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">ยังไม่มีข้อมูลสถิติ</p>
        </div>
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = ICON_MAP[stat.iconName] || ShoppingBagIcon;
          
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgColor} p-6 border-2 border-white shadow-lg hover:shadow-xl transition-all group`}
            >
              {/* Background Pattern */}
              <div className="absolute -right-4 -top-4 opacity-10">
                <Icon className="w-24 h-24 text-gray-900" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Value */}
                <div
                  className={`text-display bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}
                >
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-body-sm font-medium text-gray-700">
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
        className="mt-6 mx-auto max-w-2xl"
      >
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 rounded-2xl p-4 border-2 border-orange-200 shadow-sm">
          <div className="flex items-center justify-center gap-2 flex-wrap text-body-sm text-center">
            <span className="font-bold text-orange-800">💡 ประหยัดได้มากกว่า</span>
            <span className="text-orange-600 font-semibold">30-70%</span>
            <span className="text-gray-700">กับโปรโมชั่นกว่า</span>
            <span className="text-orange-600 font-semibold">100+ ร้านค้า</span>
            <span className="text-gray-700">ทุกวัน!</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
