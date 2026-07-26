'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { addPoints } from '@/lib/pointsUtils';
import toast from 'react-hot-toast';

interface BranchAvailabilityProps {
  productId: string;
  productTitle: string;
  userLocation?: { lat: number; lng: number };
}

interface BranchData {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: number | null;
  stockStatus: 'available' | 'out_of_stock';
}

// Haversine distance in km
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export default function BranchAvailability({ productId, productTitle, userLocation }: BranchAvailabilityProps) {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [noBranchesFound, setNoBranchesFound] = useState(false);
  const [reportedBranches, setReportedBranches] = useState<Set<string>>(new Set());
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(userLocation || null);

  // Best-effort geolocation if the caller didn't pass one — used only for
  // sorting/showing distance, never blocks the branch list from loading
  useEffect(() => {
    if (myLocation || typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {} // silently ignore — distance just won't be shown
    );
  }, [myLocation]);

  useEffect(() => {
    if (!isOpen || hasLoaded) return;

    const load = async () => {
      setIsLoading(true);
      try {
        if (!isSupabaseConfigured) {
          setNoBranchesFound(true);
          return;
        }

        const { data: product, error: productErr } = await supabase
          .from('products')
          .select('shop_id')
          .eq('id', productId)
          .maybeSingle();

        if (productErr || !product?.shop_id) {
          setNoBranchesFound(true);
          return;
        }

        const { data: branchRows, error: branchErr } = await supabase
          .from('merchant_branches')
          .select('id, branch_name, address, lat, lng')
          .eq('user_id', product.shop_id)
          .not('lat', 'is', null)
          .not('lng', 'is', null);

        if (branchErr || !branchRows || branchRows.length === 0) {
          setNoBranchesFound(true);
          return;
        }

        const branchIds = branchRows.map(b => b.id);
        const { data: stockRows } = await supabase
          .from('product_branch_stock')
          .select('branch_id, is_available')
          .eq('product_id', productId)
          .in('branch_id', branchIds);

        const stockByBranch = new Map<string, boolean>(
          (stockRows || []).map(r => [r.branch_id, r.is_available])
        );

        const mapped: BranchData[] = branchRows.map((b) => ({
          id: b.id,
          name: b.branch_name,
          address: b.address || '',
          lat: b.lat as number,
          lng: b.lng as number,
          distance: myLocation ? distanceKm(myLocation, { lat: b.lat as number, lng: b.lng as number }) : null,
          stockStatus: (stockByBranch.get(b.id) ?? true) ? 'available' : 'out_of_stock',
        }));

        setBranches(mapped);
      } catch (e) {
        console.error('[BranchAvailability] load error:', e);
        setNoBranchesFound(true);
      } finally {
        setIsLoading(false);
        setHasLoaded(true);
      }
    };

    load();
  }, [isOpen, hasLoaded, productId, myLocation]);

  // Filter to nearby branches when we know distance; otherwise show all
  const nearbyBranches = branches
    .filter(b => b.distance === null || b.distance <= 5)
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

  const availableCount = nearbyBranches.filter(b => b.stockStatus === 'available').length;
  const totalCount = nearbyBranches.length;

  const handleGetDirections = (branch: BranchData) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`,
      '_blank'
    );
  };

  const handleReportStock = async (branch: BranchData) => {
    if (reportedBranches.has(branch.id)) {
      toast.error('คุณได้รายงานสาขานี้แล้ว');
      return;
    }
    if (!user?.id) {
      toast.error('กรุณาเข้าสู่ระบบก่อนรายงานสต็อก');
      return;
    }

    const newStatus = branch.stockStatus === 'available' ? 'out_of_stock' : 'available';

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('product_branch_stock')
        .upsert(
          { product_id: productId, branch_id: branch.id, is_available: newStatus === 'available', updated_at: new Date().toISOString() },
          { onConflict: 'product_id,branch_id' }
        );

      if (error) {
        console.error('[BranchAvailability] report error:', error);
        toast.error('รายงานไม่สำเร็จ กรุณาลองใหม่');
        return;
      }
    }

    setBranches(prev => prev.map(b => (b.id === branch.id ? { ...b, stockStatus: newStatus } : b)));
    await addPoints(10, `รายงานสต็อก: ${branch.name}`, '📦');
    setReportedBranches(prev => new Set(prev).add(branch.id));

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
        {hasLoaded && !noBranchesFound && (
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
            {availableCount}/{totalCount} available
          </span>
        )}
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
                {myLocation ? 'Nearby Branches (within 5km)' : 'Branches'}
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
          ) : noBranchesFound || nearbyBranches.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">
                {noBranchesFound ? 'ร้านนี้ยังไม่ได้ตั้งค่าสาขาในระบบ' : 'ไม่พบสาขาภายในระยะ 5 กม.'}
              </p>
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
                            {!reportedBranches.has(branch.id) && (
                              <button
                                onClick={() => handleReportStock(branch)}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-all"
                                title="รายงานสต็อกไม่ถูกต้อง +10 แต้ม"
                              >
                                <AlertCircle className="w-3 h-3" />
                                รายงาน
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                          <span className="text-sm text-gray-600 font-medium">
                            {branch.distance != null ? `📍 ${branch.distance.toFixed(1)} km away` : '📍 ไม่ทราบระยะทาง'}
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

              <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-green-600">{availableCount}</span> out of{' '}
                  <span className="font-bold text-gray-900">{totalCount}</span> branches have this item in stock
                </p>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
