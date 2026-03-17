'use client';

import Link from 'next/link';
import { BarChart3, ArrowLeft, Download, RefreshCw } from 'lucide-react';
import StatCards, { StatData } from '@/components/Merchant/Analytics/StatCards';
import EngagementChart from '@/components/Merchant/Analytics/EngagementChart';
import AudienceLocation from '@/components/Merchant/Analytics/AudienceLocation';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductStore } from '@/store/useProductStore';
import { useMemo } from 'react';

export default function AnalyticsDashboard() {
  const { user } = useAuthStore();
  const { products } = useProductStore();

  const merchantStats = useMemo(() => {
    const myProducts = products.filter(p => p.shopName === user?.shopName);
    
    const totalLikes = myProducts.reduce((acc, p) => acc + (p.likes || 0), 0);
    const totalReviews = myProducts.reduce((acc, p) => acc + (p.reviews || 0), 0);
    
    // Mock calculations based on available data
    const totalViews = (totalLikes * 45) + (totalReviews * 120); 
    const savedCoupons = totalLikes * 3;
    const stockClicks = Math.floor(totalViews * 0.05);
    
    return [
      {
        label: 'Total Views',
        value: totalViews.toLocaleString(),
        change: 12,
        trend: 'up',
        description: 'Impressions today',
        color: 'blue'
      },
      {
        label: 'Coupons Saved',
        value: savedCoupons.toLocaleString(),
        change: 8.5,
        trend: 'up',
        description: 'High conversion rate',
        color: 'green'
      },
      {
        label: '"Check Stock" Clicks',
        value: stockClicks.toLocaleString(),
        change: 23,
        trend: 'up',
        description: 'High purchase intent',
        color: 'purple'
      },
      {
        label: 'Sold Out Events',
        value: '0', // We don't have stock data yet
        change: 0,
        trend: 'down',
        description: 'Branches need restock',
        color: 'orange'
      }
    ] as StatData[];
  }, [products, user?.shopName]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/merchant/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Back</span>
              </Link>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Promotion Intelligence Dashboard
                  </h1>
                  <p className="text-sm text-gray-500">
                    Real-time ROI & engagement analytics
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold transition-all border border-gray-300">
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-sm">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Live Status Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold uppercase tracking-wide">
                  System Live
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Your Promotions Are Driving Real Traffic
              </h2>
              <p className="text-blue-100 text-sm max-w-2xl">
                Track exactly how customers interact with your promotions. Data updates every 5 minutes. 
                Use these insights to optimize stock levels and maximize ROI.
              </p>
            </div>
            <div className="hidden lg:block bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-xs text-blue-100 mb-1">Last Updated</p>
              <p className="text-lg font-bold">Just now</p>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <StatCards stats={merchantStats} />

        {/* 24-Hour Performance Chart */}
        <div className="mb-6">
          <EngagementChart />
        </div>

        {/* Audience & Location Section */}
        <div className="mb-6">
          <AudienceLocation />
        </div>

        {/* ROI Insights Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">💰</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-2">
                ROI Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-xs text-gray-500 mb-1">Platform Investment</p>
                  <p className="text-2xl font-bold text-gray-900">฿2,499</p>
                  <p className="text-xs text-gray-600">Monthly SEO package</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-xs text-gray-500 mb-1">Estimated Conversions</p>
                  <p className="text-2xl font-bold text-green-600">4,800</p>
                  <p className="text-xs text-gray-600">Coupons saved → Store visits</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-xs text-gray-500 mb-1">Projected ROI</p>
                  <p className="text-2xl font-bold text-green-600">192%</p>
                  <p className="text-xs text-gray-600">Based on avg. basket size</p>
                </div>
              </div>
              <ul className="text-sm text-green-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>
                    <strong>15,200 impressions</strong> - Your promotions were shown to potential customers
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>
                    <strong>31.6% save rate</strong> - Above industry average (25%), showing strong product-market fit
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>
                    <strong>850 stock check clicks</strong> - High purchase intent. These users are ready to buy.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="mt-6 bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📋 Recommended Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <span className="font-bold text-orange-900">Urgent: Restock Needed</span>
              </div>
              <p className="text-sm text-orange-800 mb-3">
                3 branches reported sold out. Peak evening traffic (18:00-20:00) approaching.
              </p>
              <Link 
                href="/merchant/stock"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                Manage Stock Now →
              </Link>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📍</span>
                <span className="font-bold text-blue-900">Expand to Hot Zones</span>
              </div>
              <p className="text-sm text-blue-800 mb-3">
                Siam Paragon area shows 3,250 views. Consider opening promotions at nearby branches.
              </p>
              <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all">
                View Map →
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Data refreshes every 5 minutes • Last update: {new Date().toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </p>
        </div>
      </main>
    </div>
  );
}
