'use client';

import { Store, Package, TrendingUp, DollarSign, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductStore } from '@/store/useProductStore';
import { useState, useEffect } from 'react';
import EditShopModal from '@/components/Merchant/EditShopModal';

/**
 * Shop Data — คาดหวัง data structure จาก API:
 * GET /api/merchant/shop
 * Response: {
 *   activePromos: number,
 *   totalViews: number,
 *   estimatedRevenue: number,
 *   avgRating: string
 * }
 */
interface ShopStats {
  activePromos: number;
  totalViews: number;
  estimatedRevenue: number;
  avgRating: string;
}

export default function MerchantShopPage() {
  const { user } = useAuthStore();
  const { products } = useProductStore();

  // ═══ API-Ready State Management ═══
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shopStats, setShopStats] = useState<ShopStats | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with real API call
        // const res = await fetch('/api/merchant/shop');
        // if (!res.ok) throw new Error('Failed to fetch shop data');
        // const data = await res.json();
        // setShopStats(data);

        await new Promise(r => setTimeout(r, 500));

        // Compute from local store until API is connected
        const myProducts = products.filter(p => p.shopName === user?.shopName);
        const activePromos = myProducts.length;
        const totalViews = myProducts.reduce((sum, p) => sum + ((p.likes || 0) * 10), 0);
        const estimatedRevenue = myProducts.reduce((sum, p) => {
          const price = p.promoPrice || p.originalPrice || 0;
          const sales = (p.reviews || 0);
          return sum + (price * sales);
        }, 0);
        const avgRating = myProducts.length > 0
          ? (myProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / myProducts.length).toFixed(1)
          : 'New';

        setShopStats({ activePromos, totalViews, estimatedRevenue, avgRating });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchShopData();
  }, [user, products]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/merchant/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              ← Dashboard
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">My Shop</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isLoading ? (
          /* ═══ Loading Skeleton ═══ */
          <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 md:p-8 animate-pulse space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-2xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="flex gap-3">
                    <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
                    <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="p-4 bg-gray-100 rounded-xl h-24"></div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          /* ═══ Error State ═══ */
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              ลองใหม่อีกครั้ง
            </button>
          </div>
        ) : (
        <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 md:p-8">
          {/* Shop Header */}
          <p className="text-gray-500 mb-6">Manage your shop information and settings</p>

          {/* Shop Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
            <div className="flex items-start gap-6 mb-8">
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden ${user?.shopLogo ? '' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                {user?.shopLogo ? (
                  <img src={user.shopLogo} alt={user.shopName} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-12 h-12 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{user?.shopName || 'My Shop'}</h2>
                <p className="text-gray-500 mb-4 flex items-center gap-2">
                  {user?.verified ? (
                    <span className="flex items-center gap-1 text-green-600">
                       Verified Merchant <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓</span>
                    </span>
                  ) : (
                    'Unverified Merchant'
                  )}
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500">Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-sm"
                  >
                    Edit Shop Info
                  </button>
                  <Link
                    href={`/shop/${encodeURIComponent(user?.shopName || '')}`}
                    className="px-6 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium border border-gray-200 inline-flex items-center"
                  >
                    View Public Page
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {shopStats ? [
                { icon: Package, label: 'Active Deals', value: shopStats.activePromos.toString(), bgColor: 'bg-blue-50', borderColor: 'border-blue-200', iconColor: 'text-blue-500', textColor: 'text-blue-900' },
                { icon: TrendingUp, label: 'Total Engagement', value: shopStats.totalViews.toLocaleString(), bgColor: 'bg-green-50', borderColor: 'border-green-200', iconColor: 'text-green-500', textColor: 'text-green-900' },
                { icon: DollarSign, label: 'Est. Revenue', value: `฿${shopStats.estimatedRevenue.toLocaleString()}`, bgColor: 'bg-amber-50', borderColor: 'border-amber-200', iconColor: 'text-amber-500', textColor: 'text-amber-900' },
                { icon: Star, label: 'Avg Rating', value: shopStats.avgRating, bgColor: 'bg-purple-50', borderColor: 'border-purple-200', iconColor: 'text-purple-500', textColor: 'text-purple-900' }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className={`p-4 ${stat.bgColor} rounded-xl border ${stat.borderColor}`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor} mb-2`} />
                    <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-8 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-gray-500 font-medium">ยังไม่มีข้อมูลสถิติ</p>
                  <p className="text-sm text-gray-400 mt-1">ลงโปรโมชั่นเพื่อเริ่มเก็บสถิติ</p>
                </div>
              )}
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="bg-white border border-blue-200 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-blue-700 mb-2">More Features Coming Soon! 🚀</h3>
            <p className="text-gray-500">Shop customization, product management, and more...</p>
          </div>
        </div>
        )}
      </div>

      {/* Edit Shop Modal */}
      <EditShopModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} />
    </div>
  );
}
