'use client';

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
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

const MAIN_CATEGORIES = [
  { id: 'รองเท้าผู้ชาย', name: 'รองเท้าผู้ชาย', route: 'Fashion', icon: ShoppingBagIcon, color: 'from-orange-500 to-red-500' },
  { id: 'กระเป๋า', name: 'กระเป๋า', route: 'Fashion', icon: ShoppingBagIcon, color: 'from-amber-500 to-orange-600' },
  { id: 'เสื้อ', name: 'เสื้อ', route: 'Fashion', icon: SparklesIcon, color: 'from-purple-500 to-pink-500' },
  { id: 'ความงาม', name: 'ความงาม', route: 'Beauty', icon: HeartIcon, color: 'from-pink-500 to-fuchsia-500' },
  { id: 'โอท', name: 'โอท', route: 'Gadget', icon: DevicePhoneMobileIcon, color: 'from-gray-600 to-gray-800' },
  { id: 'กางเกง', name: 'กางเกง', route: 'Fashion', icon: TruckIcon, color: 'from-indigo-500 to-purple-500' },
  { id: 'ดูแลผิว', name: 'ดูแลผิว', route: 'Beauty', icon: HeartIcon, color: 'from-pink-400 to-rose-500' },
  { id: 'รองเท้าแตะ', name: 'รองเท้าแตะ', route: 'Fashion', icon: ShoppingBagIcon, color: 'from-teal-500 to-cyan-500' },
  { id: 'หมวก', name: 'หมวก', route: 'Fashion', icon: ShieldCheckIcon, color: 'from-violet-500 to-purple-600' },
];

export default function CategoryGrid({ onSelectCategory, selectedCategory }: CategoryGridProps) {
  const router = useRouter();

  const handleCategoryClick = (categoryId: string, route: string) => {
    onSelectCategory(route);
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

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-9 gap-3 md:gap-4">
        {MAIN_CATEGORIES.map((category, index) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.route;

          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => handleCategoryClick(category.id, category.route)}
              className={`relative group flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-orange-50 to-red-50 shadow-md border-2 border-orange-400'
                  : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-orange-200 hover:shadow-sm'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                  isSelected
                    ? `bg-gradient-to-br ${category.color} shadow-sm`
                    : 'bg-gray-100 group-hover:bg-gradient-to-br group-hover:' + category.color
                }`}
              >
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isSelected ? 'text-white' : 'text-gray-600 group-hover:text-white'
                  }`}
                />
              </div>

              <span
                className={`text-caption font-medium text-center leading-tight ${
                  isSelected ? 'text-orange-600 font-bold' : 'text-gray-700'
                }`}
              >
                {category.name}
              </span>

              {isSelected && (
                <motion.div
                  layoutId="category-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
