'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Copy, Check, Tag, Clock, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import clsx from 'clsx';

/*
 * Expected API Response: GET /api/coupons/active
 * Response: { coupons: Coupon[] }
 *
 * interface Coupon {
 *   id: string;
 *   code: string;
 *   discount: string;       // e.g. "50%", "฿100", "Free Shipping"
 *   description: string;
 *   expiresIn: string;      // e.g. "2 days", "5 hours"
 *   store: string;
 *   color: 'red' | 'blue' | 'green';
 * }
 */

interface Coupon {
  id: string;
  code: string;
  discount: string;
  description: string;
  expiresIn: string;
  store: string;
  color: string;
}

export default function CouponSection() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── API-Ready State ──
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: Replace with actual API call
  // useEffect(() => {
  //   const fetchCoupons = async () => {
  //     try {
  //       const res = await fetch('/api/coupons/active');
  //       const data = await res.json();
  //       setCoupons(data.coupons);
  //     } catch { }
  //     finally { setIsLoading(false); }
  //   };
  //   fetchCoupons();
  // }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyCode = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    
    // Professional toast notification
    toast.success(
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="font-bold text-gray-900">Code Copied Successfully</p>
          <p className="text-sm text-gray-600">{coupon.code}</p>
        </div>
      </div>,
      {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#fff',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e5e7eb',
        },
      }
    );

    setTimeout(() => {
      setCopiedId(null);
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-8">
      <Toaster />
      
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Tag className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Active Coupon Codes
          </h2>
        </div>
        <p className="text-gray-600">Click to copy and use instantly at checkout</p>
      </div>

      {/* Coupons Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
              <div className="p-4 bg-gray-200 h-28" />
              <div className="h-4 bg-gray-100" />
              <div className="p-4 space-y-3">
                <div className="h-12 bg-gray-100 rounded-lg" />
                <div className="h-10 bg-gray-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">ยังไม่มีคูปองในขณะนี้</h3>
          <p className="text-sm text-gray-500">กลับมาตรวจสอบใหม่เร็วๆ นี้</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map((coupon, index) => {
          const colorClasses = {
            red: 'bg-red-600',
            blue: 'bg-blue-600',
            green: 'bg-green-600'
          };

          return (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative"
            >
              {/* Professional Coupon Card */}
              <div className="relative overflow-hidden bg-white rounded-lg border-2 border-gray-200 shadow-md hover:shadow-xl transition-all">
                {/* Header with Store Info */}
                <div className={clsx('p-4 text-white', colorClasses[coupon.color as keyof typeof colorClasses])}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">{coupon.store}</span>
                    <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-xs">
                      <Clock className="w-3 h-3" />
                      {coupon.expiresIn}
                    </div>
                  </div>
                  <div className="text-3xl font-black mb-1">
                    {coupon.discount}
                  </div>
                  <div className="text-sm opacity-90">
                    {coupon.description}
                  </div>
                </div>

                {/* Dashed Separator */}
                <div className="relative h-4 bg-gray-50">
                  <div className="absolute top-1/2 left-0 right-0 border-t-2 border-dashed border-gray-300" />
                  <div className="absolute left-0 top-1/2 w-4 h-4 bg-white rounded-full transform -translate-y-1/2 -translate-x-2 border-2 border-gray-200" />
                  <div className="absolute right-0 top-1/2 w-4 h-4 bg-white rounded-full transform -translate-y-1/2 translate-x-2 border-2 border-gray-200" />
                </div>

                {/* Code Section */}
                <div className="p-4">
                  {/* Coupon Code Display */}
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 mb-3">
                    <div className="text-xs text-gray-600 mb-1 font-medium">COUPON CODE</div>
                    <div className="text-xl font-black text-gray-900 tracking-wider">
                      {coupon.code}
                    </div>
                  </div>

                  {/* Copy Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCopyCode(coupon)}
                    className={clsx(
                      'w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center gap-2',
                      copiedId === coupon.id
                        ? 'bg-green-600'
                        : `${colorClasses[coupon.color as keyof typeof colorClasses]} hover:opacity-90`
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {copiedId === coupon.id ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Check className="w-5 h-5" />
                          <span>Copied!</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Copy className="w-5 h-5" />
                          <span>Copy Code</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Info */}
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Valid for {coupon.expiresIn}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}
    </div>
  );
}
