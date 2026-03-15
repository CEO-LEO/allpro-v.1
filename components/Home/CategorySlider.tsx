'use client';

import { motion } from 'framer-motion';
import { 
  UtensilsCrossed, 
  Coffee, 
  Shirt, 
  Smartphone, 
  Sparkles,
  Home,
  Heart,
  ShoppingBag 
} from 'lucide-react';

interface CategorySliderProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const categories: Category[] = [
  {
    id: 'all',
    name: 'ทั้งหมด',
    icon: <ShoppingBag className="w-5 h-5" />,
    color: 'bg-gray-600'
  },
  {
    id: 'อาหาร',
    name: 'อาหาร',
    icon: <UtensilsCrossed className="w-5 h-5" />,
    color: 'bg-orange-600'
  },
  {
    id: 'เครื่องดื่ม',
    name: 'เครื่องดื่ม',
    icon: <Coffee className="w-5 h-5" />,
    color: 'bg-amber-700'
  },
  {
    id: 'แฟชั่น',
    name: 'แฟชั่น',
    icon: <Shirt className="w-5 h-5" />,
    color: 'bg-purple-600'
  },
  {
    id: 'ของใช้',
    name: 'ของใช้',
    icon: <Home className="w-5 h-5" />,
    color: 'bg-blue-600'
  },
  {
    id: 'ไอที',
    name: 'ไอที',
    icon: <Smartphone className="w-5 h-5" />,
    color: 'bg-indigo-600'
  },
  {
    id: 'ขนม',
    name: 'ขนม',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'bg-pink-600'
  },
  {
    id: 'ของหวาน',
    name: 'ของหวาน',
    icon: <Heart className="w-5 h-5" />,
    color: 'bg-rose-600'
  }
];

export default function CategorySlider({ activeCategory, onCategoryChange }: CategorySliderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">หมวดหมู่</h3>
        
        {/* Scrollable Categories */}
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-3 pb-1">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              
              return (
                <motion.button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`
                    flex flex-col items-center gap-2 p-3 rounded-xl
                    min-w-[80px] transition-all flex-shrink-0
                    ${isActive 
                      ? `${category.color} text-white shadow-lg` 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${isActive ? 'bg-white/20' : 'bg-white'}
                  `}>
                    {category.icon}
                  </div>
                  <span className="text-xs font-medium">{category.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
