'use client';

import Link from 'next/link';
import { BarChart3, ArrowLeft, Download, RefreshCw } from 'lucide-react';
import StatCards, { StatData } from '@/components/Merchant/Analytics/StatCards';
import EngagementChart from '@/components/Merchant/Analytics/EngagementChart';
import AudienceLocation from '@/components/Merchant/Analytics/AudienceLocation';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchMerchantAnalytics, type MerchantDashboardStats } from '@/lib/analytics';
import { useMemo, useState, useEffect } from 'react';

// Real day-over-day % change from the last two entries of dailyStats
// (both real, already fetched) — returns 0 when there's no prior-day
// data to compare against, never a fabricated number
function dayOverDayChange(daily: MerchantDashboardStats['dailyStats'], key: 'views' | 'claims' | 'revenue'): { change: number; trend: 'up' | 'down' } {
  if (daily.length < 2) return { change: 0, trend: 'up' };
  const today = daily[daily.length - 1][key];
  const yesterday = daily[daily.length - 2][key];
  if (yesterday === 0) return { change: today > 0 ? 100 : 0, trend: 'up' };
  const pct = Math.round(((today - yesterday) / yesterday) * 1000) / 10;
  return { change: pct, trend: pct >= 0 ? 'up' : 'down' };
}

export default function AnalyticsDashboard() {
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<MerchantDashboardStats | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (!user?.id) return;
        const data = await fetchMerchantAnalytics(user.id, user.shopName || user.name || '', 30);
        setAnalytics(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id, user?.shopName, user?.name]);

  const merchantStats = useMemo((): StatData[] => {
    if (!analytics) {
      return [
        { label: 'Total Views', value: '0', change: 0, trend: 'up', description: 'ยอดเข้าชม 30 วันล่าสุด', color: 'blue' },
        { label: 'Coupons Saved', value: '0', change: 0, trend: 'up', description: 'ยอดกดรับโปร 30 วันล่าสุด', color: 'green' },
        { label: 'Revenue', value: '฿0', change: 0, trend: 'up', description: 'ยอดขายจากคูปองที่กดรับ', color: 'purple' },
        { label: 'Conversion Rate', value: '0%', change: 0, trend: 'up', description: 'กดรับโปร / ยอดเข้าชม', color: 'orange' },
      ];
    }
    const viewsChange = dayOverDayChange(analytics.dailyStats, 'views');
    const claimsChange = dayOverDayChange(analytics.dailyStats, 'claims');
    const revenueChange = dayOverDayChange(analytics.dailyStats, 'revenue');

    return [
      {
        label: 'Total Views',
        value: analytics.totalViews.toLocaleString(),
        change: viewsChange.change,
        trend: viewsChange.trend,
        description: 'ยอดเข้าชม 30 วันล่าสุด',
        color: 'blue'
      },
      {
        label: 'Coupons Saved',
        value: analytics.totalClaims.toLocaleString(),
        change: claimsChange.change,
        trend: claimsChange.trend,
        description: 'ยอดกดรับโปร 30 วันล่าสุด',
        color: 'green'
      },
      {
        label: 'Revenue',
        value: `฿${analytics.totalRevenue.toLocaleString()}`,
        change: revenueChange.change,
        trend: revenueChange.trend,
        description: 'ยอดขายจากคูปองที่กดรับ',
        color: 'purple'
      },
      {
        label: 'Conversion Rate',
        value: `${analytics.conversionRate}%`,
        change: 0,
        trend: 'up',
        description: 'กดรับโปร / ยอดเข้าชม',
        color: 'orange'
      }
    ];
  }, [analytics]);

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
        {isLoading ? (
          /* ═══ Loading Skeleton ═══ */
          <div className="space-y-6 animate-pulse">
            <div className="bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl h-40"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 h-28 border border-gray-200"></div>
              ))}
            </div>
            <div className="bg-white rounded-xl h-64 border border-gray-200"></div>
            <div className="bg-white rounded-xl h-48 border border-gray-200"></div>
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
        <>
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
          <EngagementChart hourlyData={analytics?.demographicData.hourlyDistribution || []} />
        </div>

        {/* Audience & Location Section */}
        <div className="mb-6">
          <AudienceLocation
            genderBreakdown={analytics?.demographicData.genderBreakdown || []}
            locationBuckets={analytics?.demographicData.locationBuckets || []}
          />
        </div>

        {/* ROI Insights Card — no real ad-spend/investment tracking exists
            anywhere in the app yet, so this honestly stays an empty state
            rather than dividing real numbers by a made-up investment figure */}
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-10 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">ยังไม่มีข้อมูล ROI</h3>
          <p className="text-sm text-gray-500">ฟีเจอร์นี้ต้องมีข้อมูลค่าใช้จ่ายโฆษณา/แพ็กเกจจริงก่อน ซึ่งระบบยังไม่มีการเก็บข้อมูลส่วนนี้</p>
        </div>

        {/* Action Items — TODO: Fetch from /api/merchant/analytics/actions */}
        <div className="mt-6 bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📋 Recommended Actions
          </h3>
          <div className="py-8 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-gray-500 font-medium">ยังไม่มีคำแนะนำ</p>
            <p className="text-sm text-gray-400 mt-1">ระบบจะวิเคราะห์และแนะนำแอคชั่นให้เมื่อมีข้อมูลเพียงพอ</p>
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
        </>
        )}
      </main>
    </div>
  );
}
