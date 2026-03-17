'use client';

import { useState, useEffect } from 'react';
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

// Interface สำหรับข้อมูลสาขา
// interface BranchData extends Store {
//   stockStatus: 'available' | 'out_of_stock';
//   lastUpdate: string;
// }

type BranchData = Store & { stockStatus: 'available' | 'out_of_stock'; lastUpdate: string };

export default function BranchAvailability({ productId, productTitle }: BranchAvailabilityProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportedBranches, setReportedBranches] = useState<Set<string>>(new Set());

  // TODO: เชื่อมต่อ API จริง
  // useEffect(() => {
  //   if (!isOpen) return;
  //   const fetchBranches = async () => {
  //     setIsLoading(true);
  //     try {
  //       const res = await fetch(`/api/branches/stock?productId=${productId}`);
  //       const data = await res.json();
  //       setBranches(data.branches);
  //     } catch (err) { console.error(err); }
  //     finally { setIsLoading(false); }
  //   };
  //   fetchBranches();
  // }, [isOpen, productId]);

  useEffect(() => {
    if (!isOpen || branches.length > 0) return;
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [isOpen, branches.length]);

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
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-4 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-2/3" />
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                      <div className="h-4 bg-gray-100 rounded w-1/3 mt-3" />
                    </div>
                    <div className="h-9 w-24 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : nearbyBranches.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">ไม่พบสาขาภายในระยะ 5 กม.</p>
              <p className="text-sm text-gray-500 mt-1">ลองขยายรัศมีการค้นหา</p>
            </div>
          ) : (
          <>
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

          {/* Summary */}
          {nearbyBranches.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-green-600">{availableCount}</span> out of{' '}
              <span className="font-bold text-gray-900">{totalCount}</span> nearby branches have this item in stock
            </p>
          </div>
          )}
          </>
          )}
        </motion.div>
      )}
    </div>
  );
}
