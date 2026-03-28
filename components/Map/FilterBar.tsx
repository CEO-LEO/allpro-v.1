'use client';

import { motion } from 'framer-motion';
import { Store as StoreIcon, Coffee, ShoppingBag, Shirt, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

export type FilterCategory = 'all' | '7-Eleven' | "Lotus's" | 'coffee' | 'food' | 'fashion';

interface FilterBarProps {
  activeFilters: FilterCategory[];
  onFilterChange: (filters: FilterCategory[]) => void;
}

const filters: { id: FilterCategory; label: string; icon: ReactNode }[] = [
  { id: 'all', label: 'ทั้งหมด', icon: <Sparkles className="w-4 h-4" /> },
  { id: '7-Eleven', label: '7-Eleven', icon: <StoreIcon className="w-4 h-4" /> },
  { id: "Lotus's", label: "Lotus's", icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'coffee', label: 'กาแฟ', icon: <Coffee className="w-4 h-4" /> },
  { id: 'food', label: 'อาหาร', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'fashion', label: 'แฟชั่น', icon: <Shirt className="w-4 h-4" /> },
];

export default function FilterBar({ activeFilters, onFilterChange }: FilterBarProps) {
  const handleToggle = (id: FilterCategory) => {
    if (id === 'all') {
      onFilterChange(['all']);
      return;
    }

    let next = activeFilters.filter(f => f !== 'all');

    if (next.includes(id)) {
      next = next.filter(f => f !== id);
    } else {
      next = [...next, id];
    }

    onFilterChange(next.length === 0 ? ['all'] : next);
  };

  return (
    <div className="absolute top-4 left-0 right-0 z-[1000] px-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg p-2 max-w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {filters.map((filter) => {
            const isActive = activeFilters.includes(filter.id);
            return (
              <motion.button
                key={filter.id}
                onClick={() => handleToggle(filter.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${isActive 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                {filter.icon}
                <span>{filter.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
