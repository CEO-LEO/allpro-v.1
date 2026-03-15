'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Filter, X } from 'lucide-react';

const trendingTags = [
  { text: 'Starbucks Buy 1 Free 1', category: 'Beverages', count: '2.4k' },
  { text: 'Buffet Under 500', category: 'Dining', count: '1.8k' },
  { text: 'iPhone 15 Pro', category: 'Electronics', count: '3.2k' },
  { text: '7-Eleven 50% Off', category: 'Retail', count: '5.1k' },
  { text: 'Free Shipping', category: 'E-commerce', count: '4.3k' },
  { text: 'Flash Sale', category: 'Limited Time', count: '6.7k' },
  { text: 'Lotus Hot Deal', category: 'Supermarket', count: '2.9k' },
  { text: 'Travel Packages', category: 'Tourism', count: '1.5k' },
];

const categories = [
  'All',
  'Beverages',
  'Dining',
  'Electronics',
  'Retail',
  'E-commerce',
  'Limited Time',
  'Supermarket',
  'Tourism',
];

export default function TrendingTags() {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTags = selectedCategory === 'All' 
    ? trendingTags 
    : trendingTags.filter(tag => tag.category === selectedCategory);
  
  const duplicatedTags = [...filteredTags, ...filteredTags];

  return (
    <div className="bg-white border-y border-gray-200 py-4 overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h3 className="text-body-sm font-bold text-gray-900">Trending Searches</h3>
            {selectedCategory !== 'All' && (
              <span className="text-caption bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                {selectedCategory}
              </span>
            )}
          </div>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 text-caption font-semibold transition-colors ${
              showFilter ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Filter Dropdown */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-caption text-gray-700">Filter by Category</p>
                  <button
                    onClick={() => setShowFilter(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowFilter(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-caption transition-all ${
                        selectedCategory === category
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-red-300 hover:bg-red-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scrolling Tags */}
      <div className="relative">
        <motion.div
          animate={{ x: '-50%' }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="flex gap-3"
        >
          {duplicatedTags.map((tag, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 px-4 py-2.5 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-lg transition-all flex items-center gap-3 whitespace-nowrap group"
            >
              <div>
                <div className="text-body-sm text-gray-900 group-hover:text-red-600 transition-colors">
                  {tag.text}
                </div>
                <div className="text-caption text-gray-500">
                  {tag.category} · {tag.count} searches
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Gradient Fade Edges */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
