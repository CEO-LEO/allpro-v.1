'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBagIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  HeartIcon,
  TruckIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface CategoryGridProps {
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
}

// Interface สำหรับข้อมูลหมวดหมู่จาก API
interface CategoryItem {
  id: string;
  name: string;
  route: string;
  iconName: string;
  color: string;
}

// Map สำหรับ resolve icon จากชื่อ string (API)
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBagIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  HeartIcon,
  TruckIcon,
  ShieldCheckIcon,
};

export default function CategoryGrid({ onSelectCategory, selectedCategory }: CategoryGridProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: เชื่อมต่อ API จริง
  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     setIsLoading(true);
  //     try {
  //       const res = await fetch('/api/categories/grid');
  //       const data = await res.json();
  //       setCategories(data.categories);
  //     } catch (err) { console.error(err); }
  //     finally { setIsLoading(false); }
  //   };
  //   fetchCategories();
  // }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCategoryClick = (route: string) => {
    onSelectCategory?.(route);
    router.push(`/category/${encodeURIComponent(route)}`);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-h4 text-gray-800">หมวดหมู่</h2>
        <Link
          href="/category/all"
          className="text-body-sm text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1"
        >
          ดูทั้งหมด
          <span>→</span>
        </Link>
      </div>

      {/* Horizontal Scroll Row */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-gray-200 w-[100px] animate-pulse">
              <div className="w-12 h-12 rounded-lg bg-gray-200" />
              <div className="w-14 h-3 bg-gray-200 rounded" />
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center w-full py-8">
            <div className="text-center">
              <ShoppingBagIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">ไม่มีหมวดหมู่</p>
            </div>
          </div>
        ) : (
        categories.map((category, index) => {
          const Icon = ICON_MAP[category.iconName] || ShoppingBagIcon;

          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => handleCategoryClick(category.route)}
              className="flex-shrink-0 group flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-orange-200 hover:shadow-sm transition-all w-[100px]"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center transition-all">
                <Icon className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-caption font-medium text-center leading-tight text-gray-700">
                {category.name}
              </span>
            </motion.button>
          );
        })
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
