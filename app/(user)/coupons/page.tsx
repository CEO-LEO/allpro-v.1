'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TicketIcon, ClockIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

/*
 * Expected API Response: GET /api/coupons
 * Response: { coupons: CouponItem[] }
 *
 * interface CouponItem {
 *   id: number;
 *   code: string;
 *   title: string;
 *   description: string;
 *   discount: string;        // e.g. "100฿", "20%"
 *   minPurchase: string;     // e.g. "500฿"
 *   validUntil: string;      // ISO date
 *   usage: string;           // e.g. "245/1000"
 *   type: 'verified' | 'new' | 'special' | 'merchant';
 * }
 */

interface CouponItem {
  id: number;
  code: string;
  title: string;
  description: string;
  discount: string;
  minPurchase: string;
  validUntil: string;
  usage: string;
  type: 'verified' | 'new' | 'special' | 'merchant';
}

export default function CouponsPage() {
  // ── API-Ready State ──
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // TODO: Replace with actual API call
  // useEffect(() => {
  //   const fetchCoupons = async () => {
  //     setIsLoading(true);
  //     setIsError(false);
  //     try {
  //       const res = await fetch('/api/coupons');
  //       if (!res.ok) throw new Error('Failed to fetch');
  //       const data = await res.json();
  //       setCoupons(data.coupons);
  //     } catch {
  //       setIsError(true);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchCoupons();
  // }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`คัดลอกโค้ด ${code} แล้ว!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-base sm:text-xl font-bold text-[#FF5722] hover:text-[#E64A19] transition-colors">
              ← All Pro
            </Link>
            <h1 className="text-sm sm:text-lg font-semibold">คูปองส่วนลด</h1>
            <div className="w-8 sm:w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-3">
            <TicketIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">คูปองส่วนลด</h1>
          </div>
          <p className="text-sm sm:text-base text-white/90">
            รวมโค้ดส่วนลดพิเศษ ใช้ได้ทันที!
          </p>
        </div>

        {/* Coupons Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200 animate-pulse">
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-12 bg-gray-100 rounded-lg" />
                </div>
                <div className="p-5 space-y-3 border-t">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-2 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-sm text-gray-600">ไม่สามารถโหลดคูปองได้ กรุณาลองใหม่</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TicketIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">ยังไม่มีคูปองในขณะนี้</h3>
            <p className="text-sm text-gray-500">กลับมาตรวจสอบใหม่เร็วๆ นี้</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {coupons.map((coupon) => (
            <div 
              key={coupon.id} 
              className={`card overflow-hidden border-2 hover:shadow-2xl transition-all ${
                coupon.type === 'verified' ? 'border-green-300' :
                coupon.type === 'merchant' ? 'border-orange-300' :
                coupon.type === 'new' ? 'border-blue-300' : 'border-purple-300'
              }`}
            >
              {/* Header */}
              <div className={`p-4 sm:p-5 ${
                coupon.type === 'verified' ? 'bg-gradient-to-r from-green-50 to-emerald-50' :
                coupon.type === 'merchant' ? 'bg-gradient-to-r from-orange-50 to-red-50' :
                coupon.type === 'new' ? 'bg-gradient-to-r from-blue-50 to-cyan-50' :
                'bg-gradient-to-r from-purple-50 to-pink-50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {coupon.type === 'verified' && (
                        <span className="badge-verified">
                          <CheckCircleIcon className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      {coupon.type === 'merchant' && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          💼 สำหรับร้านค้า
                        </span>
                      )}
                      {coupon.type === 'new' && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          ✨ สมาชิกใหม่
                        </span>
                      )}
                      {coupon.type === 'special' && (
                        <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                          <SparklesIcon className="w-3 h-3 inline mr-1" />
                          Special
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                      {coupon.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700">
                      {coupon.description}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-2xl sm:text-3xl font-bold text-[#FF5722]">
                      {coupon.discount}
                    </p>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">รหัสคูปอง:</p>
                    <p className="text-lg sm:text-xl font-mono font-bold text-gray-900">
                      {coupon.code}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(coupon.code)}
                    className="bg-[#FF5722] hover:bg-[#E64A19] text-white px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
                  >
                    คัดลอก
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">ขั้นต่ำ:</span>
                  <span className="font-semibold text-gray-900">{coupon.minPurchase}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    ใช้ได้ถึง:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {new Date(coupon.validUntil).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>จำนวนที่ใช้แล้ว:</span>
                    <span>{coupon.usage}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#FF5722] to-[#FF7043]"
                      style={{ width: `${parseInt(coupon.usage.split('/')[0]) / parseInt(coupon.usage.split('/')[1]) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8">
          <p className="text-lg font-bold text-blue-900 mb-4">
            💡 อยากได้คูปองเพิ่ม?
          </p>
          <p className="text-sm text-blue-700 mb-6">
            สมัครสมาชิก All Pro วันนี้ รับคูปองส่วนลดทันที!
          </p>
          <button className="btn-primary">
            สมัครสมาชิกฟรี
          </button>
        </div>
      </main>
    </div>
  );
}
