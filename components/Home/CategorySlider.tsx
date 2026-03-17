'use client';

import { useState, useEffect } from 'react';
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
  iconName: string;
  color: string;
}

// Map สำหรับ resolve icon จากชื่อ string (API)
const ICON_MAP: Record<string, React.ReactNode> = {
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  UtensilsCrossed: <UtensilsCrossed className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  Shirt: <Shirt className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Smartphone: <Smartphone className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
};

export default function CategorySlider({ activeCategory, onCategoryChange }: CategorySliderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: เชื่อมต่อ API จริง
  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     setIsLoading(true);
  //     try {
  //       const res = await fetch('/api/categories/slider');
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

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">หมวดหมู่</h3>
        
        {/* Scrollable Categories */}
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-3 pb-1">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-3 min-w-[80px] animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="w-10 h-3 bg-gray-200 rounded" />
                </div>
              ))
            ) : categories.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center w-full">ไม่มีหมวดหมู่</p>
            ) : (
            categories.map((category) => {
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
                    {ICON_MAP[category.iconName] || <ShoppingBag className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-medium">{category.name}</span>
                </motion.button>
              );
            })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
