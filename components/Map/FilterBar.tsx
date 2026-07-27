'use client';

import { motion } from 'framer-motion';
import { Sparkles, Tag } from 'lucide-react';

export type FilterCategory = string;

interface FilterBarProps {
  categories: string[];
  activeFilters: FilterCategory[];
  onFilterChange: (filters: FilterCategory[]) => void;
}

export default function FilterBar({ categories, activeFilters, onFilterChange }: FilterBarProps) {
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

  const filters: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'ทั้งหมด' },
    ...categories.map(c => ({ id: c, label: c })),
  ];

  return (
    <div className="absolute top-4 left-0 right-0 z-[1000] px-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-lg p-2 max-w-full overflow-x-auto scrollbar-hide">
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
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                {filter.id === 'all' ? <Sparkles className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
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
