'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, CheckCircle, XCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { Store } from '@/data/stores';
import { addPoints } from '@/lib/pointsUtils';
import toast from 'react-hot-toast';

interface BranchAvailabilityProps {
  productId: string;
  productTitle: string;
  userLocation?: { lat: number; lng: number };
}

// Mock branch data with stock status
const mockBranchData: (Store & { stockStatus: 'available' | 'out_of_stock'; lastUpdate: string })[] = [
  {
    id: '1',
    name: '7-Eleven Siam Square',
    brand: '7-Eleven',
    category: 'convenience',
    lat: 13.7455,
    lng: 100.5335,
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/7-eleven_logo.svg/200px-7-eleven_logo.svg.png',
    activePromos: 12,
    address: 'Siam Square, Pathum Wan',
    distance: 0.2,
    stockStatus: 'available',
    lastUpdate: '5 mins ago'
  },
  {
    id: '2',
    name: '7-Eleven Asoke',
    brand: '7-Eleven',
    category: 'convenience',
    lat: 13.7365,
    lng: 100.5605,
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/7-eleven_logo.svg/200px-7-eleven_logo.svg.png',
    activePromos: 8,
    address: 'Sukhumvit 21, Asoke',
    distance: 2.8,
    stockStatus: 'out_of_stock',
    lastUpdate: '10 mins ago'
  },
  {
    id: '3',
    name: '7-Eleven Chit Lom',
    brand: '7-Eleven',
    category: 'convenience',
    lat: 13.7442,
    lng: 100.5442,
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/7-eleven_logo.svg/200px-7-eleven_logo.svg.png',
    activePromos: 10,
    address: 'Chit Lom BTS Station',
    distance: 0.8,
    stockStatus: 'available',
    lastUpdate: '2 mins ago'
  },
  {
    id: '4',
    name: '7-Eleven Ratchadamri',
    brand: '7-Eleven',
    category: 'convenience',
    lat: 13.7433,
    lng: 100.5388,
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/7-eleven_logo.svg/200px-7-eleven_logo.svg.png',
    activePromos: 9,
    address: 'Ratchadamri Road',
    distance: 1.5,
    stockStatus: 'available',
    lastUpdate: '1 hour ago'
  },
  {
    id: '5',
    name: '7-Eleven Pratunam',
    brand: '7-Eleven',
    category: 'convenience',
    lat: 13.7520,
    lng: 100.5390,
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/7-eleven_logo.svg/200px-7-eleven_logo.svg.png',
    activePromos: 7,
    address: 'Pratunam Market Area',
    distance: 4.2,
    stockStatus: 'out_of_stock',
    lastUpdate: '30 mins ago'
  }
];

export default function BranchAvailability({ productId, productTitle }: BranchAvailabilityProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [branches] = useState(mockBranchData);
  const [reportedBranches, setReportedBranches] = useState<Set<string>>(new Set());

  // Filter branches within 5km and sort by distance
  const nearbyBranches = branches
    .filter(branch => (branch.distance || 0) <= 5)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));

  const availableCount = nearbyBranches.filter(b => b.stockStatus === 'available').length;
  const totalCount = nearbyBranches.length;

  const handleGetDirections = (branch: Store) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`,
      '_blank'
    );
  };

  const handleReportStock = (branchId: string, branchName: string, newStatus: 'available' | 'out_of_stock') => {
    if (reportedBranches.has(branchId)) {
      toast.error('คุณได้รายงานสาขานี้แล้ว');
      return;
    }

    // Award points
    addPoints(10, `รายงานสต็อก: ${branchName}`, '📦');
    
    // Mark as reported
    setReportedBranches(prev => new Set(prev).add(branchId));
    
    toast.success(
      <div className="flex flex-col gap-1">
        <p className="font-bold">+10 แต้ม!</p>
        <p className="text-sm">ขอบคุณที่รายงานสต็อก</p>
      </div>,
      { duration: 3000 }
    );
  };

  return (
    <div>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all"
      >
        <MapPin className="w-6 h-6" />
        Check Stock at Nearby Branches
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
          {availableCount}/{totalCount} available
        </span>
      </motion.button>

      {/* Branch List */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-6 space-y-3"
        >
          {/* Header */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-lg">
                Nearby Branches (within 5km)
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              Real-time stock availability for: <span className="font-semibold">{productTitle}</span>
            </p>
          </div>

          {/* Branch Cards */}
          {nearbyBranches.map((branch, index) => {
            const isAvailable = branch.stockStatus === 'available';
            
            return (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  bg-white rounded-xl border-2 p-4 transition-all
                  ${isAvailable 
                    ? 'border-green-300 hover:border-green-400 hover:shadow-lg' 
                    : 'border-gray-300 opacity-75'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                    ${isAvailable ? 'bg-green-100' : 'bg-red-100'}
                  `}>
                    {isAvailable ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>

                  {/* Branch Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{branch.name}</h4>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {branch.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Report Stock Button */}
                        {!reportedBranches.has(branch.id) && (
                          <button
                            onClick={() => handleReportStock(branch.id, branch.name, isAvailable ? 'out_of_stock' : 'available')}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-all"
                            title="รายงานสต็อกไม่ถูกต้อง +10 แต้ม"
                          >
                            <AlertCircle className="w-3 h-3" />
                            รายงาน
                          </button>
                        )}
                        <button
                          onClick={() => handleGetDirections(branch)}
                          className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all
                            ${isAvailable
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            }
                          `}
                          disabled={!isAvailable}
                        >
                          <Navigation className="w-4 h-4" />
                          Directions
                        </button>
                      </div>
                    </div>

                    {/* Distance & Actions */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                      <span className="text-sm text-gray-600 font-medium">
                        📍 {branch.distance} km away
                      </span>
                      <button
                        onClick={() => handleGetDirections(branch)}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all
                          ${isAvailable
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          }
                        `}
                        disabled={!isAvailable}
                      >
                        <Navigation className="w-4 h-4" />
                        Get Directions
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* No branches message */}
          {nearbyBranches.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No branches found within 5km</p>
              <p className="text-sm text-gray-500 mt-1">Try expanding your search radius</p>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-green-600">{availableCount}</span> out of{' '}
              <span className="font-bold text-gray-900">{totalCount}</span> nearby branches have this item in stock
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
