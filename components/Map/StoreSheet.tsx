'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Store } from '@/data/stores';
import { X, Navigation, MapPin, Tag, Clock, TrendingUp, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface StoreSheetProps {
  store: Store | null;
  onClose: () => void;
}

// TODO: Replace with API call -> GET /api/stores/:id/promotions
const getMockPromotions = (storeId: string): { id: string; title: string; description: string; discount: number; imageUrl: string; validUntil: string; category: string }[] => [];

export default function StoreSheet({ store, onClose }: StoreSheetProps) {
  if (!store) return null;

  const promotions = getMockPromotions(store.id);

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      {store && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[1100] backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[1101] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 py-4 border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ 
                        backgroundColor: store.brand === '7-Eleven' ? '#00843D' : 
                                       store.brand === 'Lotus' ? '#E40428' : 
                                       store.brand === 'Big C' ? '#0066CC' : '#FFB81C'
                      }}
                    />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {store.brand}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {store.name}
                  </h2>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{store.address}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Distance</p>
                    <p className="font-bold text-gray-900">{store.distance} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                    <Tag className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Active Deals</p>
                    <p className="font-bold text-red-600">{store.activePromos}</p>
                  </div>
                </div>
              </div>

              {/* Get Directions Button */}
              <motion.button
                onClick={handleGetDirections}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <Navigation className="w-5 h-5" />
                Get Directions
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Promotions List */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Active Promotions
                  </h3>
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                    {promotions.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {promotions.map((promo, index) => (
                    <motion.div
                      key={promo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-red-300 transition-colors"
                    >
                      <div className="flex gap-3 p-3">
                        {/* Promo Image */}
                        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={promo.imageUrl}
                            alt={promo.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                            -{promo.discount}%
                          </div>
                        </div>

                        {/* Promo Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 text-sm leading-tight">
                              {promo.title}
                            </h4>
                            <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                              {promo.category}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {promo.description}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>Valid until {promo.validUntil}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
