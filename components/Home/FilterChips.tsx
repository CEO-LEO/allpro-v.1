'use client';

import { motion } from 'framer-motion';
import { Package, MapPin, Clock, Zap, X } from 'lucide-react';

export type FilterType = 'available' | 'nearMe' | 'endingSoon' | 'superDeals';

interface FilterChipsProps {
  activeFilters: FilterType[];
  onToggle: (filter: FilterType) => void;
  onClear: () => void;
}

interface FilterChip {
  id: FilterType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const filters: FilterChip[] = [
  {
    id: 'available',
    label: 'มีของเลย',
    icon: <Package className="w-4 h-4" />,
    description: 'มีสินค้าพร้อมส่ง'
  },
  {
    id: 'nearMe',
    label: 'ใกล้ฉัน',
    icon: <MapPin className="w-4 h-4" />,
    description: 'เรียงตามระยะทาง'
  },
  {
    id: 'endingSoon',
    label: 'ใกล้หมดโปร',
    icon: <Clock className="w-4 h-4" />,
    description: 'โปรหมดเร็ว'
  },
  {
    id: 'superDeals',
    label: 'คุ้มจัด',
    icon: <Zap className="w-4 h-4" />,
    description: 'ดีลสุดคุ้ม'
  }
];

export default function FilterChips({ activeFilters, onToggle, onClear }: FilterChipsProps) {
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-[200px] z-20">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          {/* Scrollable Chips Container */}
          <div className="flex-1 overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 pb-1">
              {filters.map((filter) => {
                const isActive = activeFilters.includes(filter.id);
                
                return (
                  <motion.button
                    key={filter.id}
                    onClick={() => onToggle(filter.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap
                      font-medium text-sm transition-all flex-shrink-0
                      ${isActive 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    title={filter.description}
                  >
                    {filter.icon}
                    <span>{filter.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={onClear}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-medium text-sm transition-colors flex-shrink-0"
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">ล้าง</span>
            </motion.button>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-xs text-gray-500"
          >
            กำลังกรอง: {activeFilters.map(id => filters.find(f => f.id === id)?.label).join(', ')}
          </motion.div>
        )}
      </div>
    </div>
  );
}
