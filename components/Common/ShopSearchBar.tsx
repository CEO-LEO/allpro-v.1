'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Store, Star, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useProductStore } from '@/store/useProductStore';

interface ShopResult {
  name: string;
  logo: string;
  verified: boolean;
  productCount: number;
  avgRating: number;
}

export default function ShopSearchBar() {
  const router = useRouter();
  const { products } = useProductStore();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive unique shops from products
  const allShops = useMemo<ShopResult[]>(() => {
    const shopMap = new Map<string, ShopResult>();
    for (const p of products) {
      if (!shopMap.has(p.shopName)) {
        shopMap.set(p.shopName, {
          name: p.shopName,
          logo: p.shopLogo || '',
          verified: p.verified,
          productCount: 0,
          avgRating: 0,
        });
      }
      const shop = shopMap.get(p.shopName)!;
      const count = shop.productCount + 1;
      shop.avgRating = (shop.avgRating * shop.productCount + (p.rating || 0)) / count;
      shop.productCount = count;
    }
    return Array.from(shopMap.values());
  }, [products]);

  // Filter shops by query
  const filteredShops = useMemo(() => {
    if (!query.trim()) return allShops.slice(0, 5);
    const q = query.toLowerCase();
    return allShops.filter(s => s.name.toLowerCase().includes(q)).slice(0, 8);
  }, [allShops, query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectShop = (shopName: string) => {
    setQuery('');
    setIsFocused(false);
    router.push(`/shop/${encodeURIComponent(shopName)}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className={`
        flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-white transition-all
        ${isFocused ? 'border-blue-400 ring-2 ring-blue-500/20 shadow-sm' : 'border-gray-200'}
      `}>
        <Search className="w-4.5 h-4.5 text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="ค้นหาร้านค้า..."
          className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="p-0.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {isFocused && filteredShops.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500">
                {query.trim() ? `ผลลัพธ์สำหรับ "${query}"` : 'ร้านค้าแนะนำ'}
              </p>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {filteredShops.map((shop) => (
                <button
                  key={shop.name}
                  onClick={() => handleSelectShop(shop.name)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left group"
                >
                  {/* Shop Logo */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${shop.logo ? '' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                    {shop.logo ? (
                      <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Shop Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {shop.name}
                      </p>
                      {shop.verified && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">✓</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {shop.avgRating.toFixed(1)}
                      </span>
                      <span>{shop.productCount} โปรโมชั่น</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>

            {query.trim() && filteredShops.length === 0 && (
              <div className="px-4 py-6 text-center">
                <Store className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">ไม่พบร้านค้า &ldquo;{query}&rdquo;</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
