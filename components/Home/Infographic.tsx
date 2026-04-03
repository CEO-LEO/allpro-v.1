'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  MapPinIcon,
} from '@heroicons/react/24/solid';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
// ─── CountUp Hook ───────────────────────────────────────
function useCountUp(end: number, duration = 1500, start = 0) {
  const [value, setValue] = useState(start);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (end <= start) { setValue(end); return; }
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(start + (end - start) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [end, duration, start]);

  return value;
}

// ─── Stat Display Component ─────────────────────────────
function AnimatedStat({ value, suffix }: { value: number; suffix: string }) {
  const animated = useCountUp(value, 1800);
  return <>{animated.toLocaleString()}{suffix}</>;
}

// ─── Stat Definitions ───────────────────────────────────
interface StatDef {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  suffix: string;
  color: string;
  bgColor: string;
}

const STAT_DEFS: StatDef[] = [
  { id: 1, icon: ShoppingBagIcon, label: 'โปรโมชั่นทั้งหมด', suffix: '+', color: 'from-orange-500 to-red-500', bgColor: 'from-orange-50 to-red-50' },
  { id: 2, icon: UserGroupIcon,   label: 'ผู้ใช้งาน',         suffix: '+', color: 'from-blue-500 to-indigo-500', bgColor: 'from-blue-50 to-indigo-50' },
  { id: 3, icon: MapPinIcon,      label: 'ร้านค้าพาร์ทเนอร์',  suffix: '+', color: 'from-orange-500 to-amber-500', bgColor: 'from-orange-50 to-amber-50' },
  { id: 4, icon: SparklesIcon,    label: 'ประหยัดสูงสุด',      suffix: '%', color: 'from-purple-500 to-pink-500', bgColor: 'from-purple-50 to-pink-50' },
];

export default function Infographic() {
  const [values, setValues] = useState<number[]>([0, 0, 0, 0]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);

    try {
      if (!isSupabaseConfigured) throw new Error('not configured');

      // ดึงข้อมูลทั้ง 4 ตัวพร้อมกัน
      const [productsRes, profilesRes, merchantsRes, discountRes] = await Promise.all([
        // 1) จำนวนโปรโมชั่น (products)
        supabase.from('products').select('*', { count: 'exact', head: true }),
        // 2) จำนวนผู้ใช้ (profiles)
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        // 3) จำนวนร้านค้า (merchant_profiles)
        supabase.from('merchant_profiles').select('*', { count: 'exact', head: true }),
        // 4) ส่วนลดสูงสุด (MAX discount จาก products)
        supabase.from('products').select('discount').order('discount', { ascending: false }).limit(1),
      ]);

      const totalPromos = productsRes.count ?? 0;
      const totalUsers = profilesRes.count ?? 0;
      const totalMerchants = merchantsRes.count ?? 0;

      // คำนวณส่วนลดสูงสุด
      let maxDiscount = 0;
      if (discountRes.data && discountRes.data.length > 0) {
        maxDiscount = discountRes.data[0].discount || 0;
      }

      setValues([totalPromos, totalUsers, totalMerchants, maxDiscount]);
    } catch (err) {
      console.error('[Infographic] Fetch stats failed:', err);
      // Fallback — ใช้ค่า 0 ไปก่อน
      setValues([0, 0, 0, 0]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

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
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {STAT_DEFS.map((stat, index) => {
          const Icon = stat.icon;
          
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

                {/* Value with CountUp Animation */}
                <div
                  className={`text-2xl sm:text-3xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-0.5 leading-tight`}
                >
                  <AnimatedStat value={values[index]} suffix={stat.suffix} />
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
            <span className="text-orange-600 font-extrabold">{values[2]}+ ร้านค้า</span>
            <span className="text-gray-600">ทุกวัน!</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
