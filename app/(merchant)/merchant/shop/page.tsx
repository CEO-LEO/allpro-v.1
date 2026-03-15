'use client';

import { Store, Package, TrendingUp, DollarSign, Star } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductStore } from '@/store/useProductStore';

export default function MerchantShopPage() {
  const { user } = useAuthStore();
  const { products } = useProductStore();

  // Filter products for this merchant
  const myProducts = products.filter(p => p.shopName === (user?.shopName || 'My Shop'));
  
  // Calculate stats
  const activePromos = myProducts.length;
  // Estimate views based on likes/reviews if real view count is not available
  const totalViews = myProducts.reduce((sum, p) => sum + ((p.likes || 0) * 10), 0);
  // Estimate revenue (mock calculation: price * reviews * 0.5 conversion rate)
  const estimatedRevenue = myProducts.reduce((sum, p) => {
    const price = p.promoPrice || p.price || 0;
    const sales = (p.reviews || 0);
    return sum + (price * sales);
  }, 0);
  
  const avgRating = myProducts.length > 0
    ? (myProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / myProducts.length).toFixed(1)
    : 'New';

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Shop</h1>
          <p className="text-gray-400">Manage your shop information and settings</p>
        </div>

        {/* Shop Info Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-8 mb-6">
          <div className="flex items-start gap-6 mb-8">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden ${user?.shopLogo ? '' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
              {user?.shopLogo ? (
                <img src={user.shopLogo} alt={user.shopName} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-12 h-12 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{user?.shopName || 'My Shop'}</h2>
              <p className="text-gray-400 mb-4 flex items-center gap-2">
                {user?.verified ? (
                  <span className="flex items-center gap-1 text-green-400">
                     Verified Merchant <span className="text-xs bg-green-500/20 px-2 py-0.5 rounded-full">✓</span>
                  </span>
                ) : (
                  'Unverified Merchant'
                )}
                <span className="text-slate-600">•</span>
                <span>Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</span>
              </p>
              <div className="flex gap-4">
                <button className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all">
                  Edit Shop Info
                </button>
                <button className="px-6 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all">
                  View Public Page
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: Package, label: 'Active Deals', value: activePromos.toString(), color: 'blue' },
              { icon: TrendingUp, label: 'Total Engagement', value: totalViews.toLocaleString(), color: 'green' },
              { icon: DollarSign, label: 'Est. Revenue', value: `฿${estimatedRevenue.toLocaleString()}`, color: 'yellow' },
              { icon: Star, label: 'Avg Rating', value: avgRating, color: 'purple' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <Icon className={`w-6 h-6 text-${stat.color}-400 mb-2`} />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold text-blue-400 mb-2">More Features Coming Soon! 🚀</h3>
          <p className="text-gray-400">Shop customization, product management, and more...</p>
        </div>
      </div>
    </div>
  );
}
