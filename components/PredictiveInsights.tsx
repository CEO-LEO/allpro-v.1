'use client';

import { useMemo, useState } from 'react';
import {
  TrendingUp,
  Clock,
  Lightbulb,
  Activity,
  Zap,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface HourlyPoint {
  hour: number;
  views: number;
  claims: number;
}

interface PredictiveInsightsProps {
  location: string;
  /** Real per-hour views from fetchMerchantAnalytics — no synthetic data */
  hourlyData: HourlyPoint[];
}

function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="font-bold text-gray-700">{title}</p>
      <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">{description}</p>
      <span className="inline-block mt-4 px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
        Coming Soon
      </span>
    </div>
  );
}

export default function PredictiveInsights({ location, hourlyData }: PredictiveInsightsProps) {
  const [activeTab, setActiveTab] = useState<'peak' | 'trend' | 'advice'>('peak');

  const peakHoursData = useMemo(
    () => hourlyData.map((h) => ({ hour: `${h.hour.toString().padStart(2, '0')}:00`, searches: h.views })),
    [hourlyData]
  );

  const totalViews = peakHoursData.reduce((sum, h) => sum + h.searches, 0);

  const top3 = useMemo(
    () => [...peakHoursData].sort((a, b) => b.searches - a.searches).slice(0, 3),
    [peakHoursData]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-purple-600" />
          Predictive Analytics
        </h3>
        <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-full text-sm font-semibold text-purple-900">
          <Zap className="w-3 h-3 inline mr-1" />
          Data-Driven
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('peak')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'peak' ? 'text-purple-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Peak Hours
          {activeTab === 'peak' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />}
        </button>
        <button
          onClick={() => setActiveTab('trend')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'trend' ? 'text-purple-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Trend Predictor
          {activeTab === 'trend' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />}
        </button>
        <button
          onClick={() => setActiveTab('advice')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'advice' ? 'text-purple-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lightbulb className="w-4 h-4 inline mr-2" />
          Inventory Advice
          {activeTab === 'advice' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />}
        </button>
      </div>

      {/* Content */}
      <div className="card p-6">
        {/* Peak Hours Tab — real data */}
        {activeTab === 'peak' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium mb-2">
                🕐 ช่วงเวลาที่คนเข้าชมโปรโมชั่นของร้านคุณมากที่สุด {location ? `(ย่าน${location})` : ''}
              </p>
              <p className="text-xs text-blue-700">
                ข้อมูลจริงจาก promotion_views ในช่วง 30 วันล่าสุด
              </p>
            </div>

            {totalViews === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">ยังไม่มีข้อมูล Peak Hours</p>
                <p className="text-sm text-gray-400 mt-1">จะแสดงเมื่อมีคนเข้าชมโปรโมชั่นของคุณ</p>
              </div>
            ) : (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakHoursData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="searches" name="Views" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {top3.map((h, idx) => (
                    <div
                      key={h.hour}
                      className={`border rounded-lg p-4 ${
                        idx === 0 ? 'bg-green-50 border-green-200' : idx === 1 ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'
                      }`}
                    >
                      <p className={`text-xs font-semibold mb-1 ${idx === 0 ? 'text-green-600' : idx === 1 ? 'text-blue-600' : 'text-purple-600'}`}>
                        PEAK TIME #{idx + 1}
                      </p>
                      <p className={`text-2xl font-bold ${idx === 0 ? 'text-green-900' : idx === 1 ? 'text-blue-900' : 'text-purple-900'}`}>
                        {h.hour}
                      </p>
                      <p className={`text-sm mt-2 ${idx === 0 ? 'text-green-700' : idx === 1 ? 'text-blue-700' : 'text-purple-700'}`}>
                        {h.searches.toLocaleString()} views ในช่วง 30 วันล่าสุด
                      </p>
                    </div>
                  ))}
                </div>

                {top3[0] && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4">
                    <p className="font-bold text-purple-900 mb-2">💡 คำแนะนำ:</p>
                    <p className="text-sm text-purple-800">
                      ควรเปิดโปรโมชั่นของคุณในช่วง <strong>{top3[0].hour} น.</strong> เพราะเป็นช่วงที่มีคนเข้าชมมากที่สุดจริง
                      ({top3[0].searches.toLocaleString()} views ใน 30 วันล่าสุด)
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Trend Predictor Tab — no real data source exists (no search-volume/
            trend table anywhere in the app) — honestly marked Coming Soon
            rather than showing invented numbers */}
        {activeTab === 'trend' && (
          <ComingSoon
            title="Trend Predictor"
            description="ฟีเจอร์คาดการณ์เทรนด์สินค้าต้องใช้ข้อมูล search volume และ social trends ซึ่งระบบยังไม่มีการเก็บข้อมูลส่วนนี้"
          />
        )}

        {/* Inventory Advice Tab — same: no competitor/seasonal/ROI data source exists yet */}
        {activeTab === 'advice' && (
          <ComingSoon
            title="Inventory Advice"
            description="คำแนะนำสต็อกสินค้า, การแจ้งเตือนคู่แข่ง และ ROI Calculator ต้องใช้ข้อมูลเพิ่มเติมที่ระบบยังไม่มีการเก็บข้อมูลส่วนนี้"
          />
        )}
      </div>
    </div>
  );
}
