'use client';

import { Store, Package, TrendingUp, DollarSign, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductStore } from '@/store/useProductStore';

export default function MerchantShopPage() {
  const { user } = useAuthStore();
  const { products } = useProductStore();

  // Filter products for this merchant
  const myProducts = products.filter(p => p.shopName === (user?.shopName || 'My Shop'));
  
  // Calculate stats
  const activePromos = myProducts.length;
  const totalViews = myProducts.reduce((sum, p) => sum + ((p.likes || 0) * 10), 0);
  const estimatedRevenue = myProducts.reduce((sum, p) => {
    const price = p.promoPrice || p.price || 0;
    const sales = (p.reviews || 0);
    return sum + (price * sales);
  }, 0);
  
  const avgRating = myProducts.length > 0
    ? (myProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / myProducts.length).toFixed(1)
    : 'New';

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
        {/* Content Card Container */}
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
                  <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-sm">
                    Edit Shop Info
                  </button>
                  <button className="px-6 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium border border-gray-200">
                    View Public Page
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { icon: Package, label: 'Active Deals', value: activePromos.toString(), bgColor: 'bg-blue-50', borderColor: 'border-blue-200', iconColor: 'text-blue-500', textColor: 'text-blue-900' },
                { icon: TrendingUp, label: 'Total Engagement', value: totalViews.toLocaleString(), bgColor: 'bg-green-50', borderColor: 'border-green-200', iconColor: 'text-green-500', textColor: 'text-green-900' },
                { icon: DollarSign, label: 'Est. Revenue', value: `฿${estimatedRevenue.toLocaleString()}`, bgColor: 'bg-amber-50', borderColor: 'border-amber-200', iconColor: 'text-amber-500', textColor: 'text-amber-900' },
                { icon: Star, label: 'Avg Rating', value: avgRating, bgColor: 'bg-purple-50', borderColor: 'border-purple-200', iconColor: 'text-purple-500', textColor: 'text-purple-900' }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className={`p-4 ${stat.bgColor} rounded-xl border ${stat.borderColor}`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor} mb-2`} />
                    <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="bg-white border border-blue-200 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-blue-700 mb-2">More Features Coming Soon! 🚀</h3>
            <p className="text-gray-500">Shop customization, product management, and more...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
