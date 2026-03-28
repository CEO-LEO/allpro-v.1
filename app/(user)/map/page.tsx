'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { mockStores, Store } from '@/data/stores';
import { MapPin, TrendingUp } from 'lucide-react';
import FilterBar, { FilterCategory } from '@/components/Map/FilterBar';
import StoreSheet from '@/components/Map/StoreSheet';

// Dynamic import – Google Maps uses browser APIs
const PromoMap = dynamic(
  () => import('@/components/Map/PromoMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-900 font-bold text-lg">กำลังโหลดแผนที่…</p>
          <p className="text-gray-600 text-sm mt-1">กำลังค้นหาร้านค้าใกล้เคียง</p>
        </div>
      </div>
    )
  }
);

export default function MapPage() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterCategory[]>(['all']);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-orange-500 rounded-full" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-orange-500" />
                  Promo Map
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  ค้นหาร้านค้าใกล้เคียงที่มีโปรโมชั่น
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">
                <span className="font-bold text-gray-900">{mockStores.length}</span> ร้านค้า
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Filter Bar */}
        <FilterBar 
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
        />
        
        <PromoMap 
          stores={mockStores} 
          activeFilters={activeFilters}
          onStoreClick={(store) => {
            setSelectedStore(store);
          }}
        />
      </div>

      {/* Store Bottom Sheet */}
      <StoreSheet 
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
      />
    </div>
  );
}
