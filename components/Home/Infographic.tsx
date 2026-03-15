'use client';

import { motion } from 'framer-motion';
import {
  SparklesIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  MapPinIcon,
} from '@heroicons/react/24/solid';

const STATS = [
  {
    id: 1,
    icon: ShoppingBagIcon,
    value: '12,500+',
    label: 'โปรโมชั่น',
    color: 'from-orange-500 to-red-500',
    bgColor: 'from-orange-50 to-red-50',
  },
  {
    id: 2,
    icon: UserGroupIcon,
    value: '50K+',
    label: 'ผู้ใช้งาน',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50',
  },
  {
    id: 3,
    icon: MapPinIcon,
    value: '2,000+',
    label: 'ร้านค้า',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-50 to-pink-50',
  },
  {
    id: 4,
    icon: SparklesIcon,
    value: '฿5M+',
    label: 'ส่วนลดรวม',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50',
  },
];

export default function Infographic() {
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
            ข้อมูล ณ วันที่ 23 กุมภาพันธ์ 2569
          </p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, index) => {
          const Icon = stat.icon;
          
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
