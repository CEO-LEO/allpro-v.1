'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Target,
  Zap,
  Brain,
  AlertTriangle,
  Crown,
  ChevronUp,
  Activity,
  Database
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import consumerData from '@/data/consumer_insights.json';

const COLORS = ['#FF5722', '#FF7043', '#FF8A65', '#FFAB91', '#FFCCBC'];

// ประเภทข้อมูล Trending Keyword
interface TrendingKeyword {
  keyword: string;
  search_volume: number;
  growth: number;
  top_area: string;
  peak_time: string;
  demographic: string;
}

// ตัวเลือกการเรียงลำดับ
type SortField = 'rank' | 'volume' | 'growth';

// จำลอง API call สำหรับดึงข้อมูล Trending Keywords
// TODO: เปลี่ยนเป็น API จริง — e.g. const res = await fetch('/api/merchant/trending-keywords');
async function fetchTrendingKeywords(): Promise<TrendingKeyword[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return consumerData.search_intent_trends;
}

export default function MarketInsights() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trends' | 'engagement' | 'prediction' | 'competition'>('trends');

  // สถานะสำหรับ Trending Keywords (dynamic)
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([]);
  const [isKeywordsLoading, setIsKeywordsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('rank');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // โหลดข้อมูล Trending Keywords
  useEffect(() => {
    let cancelled = false;
    setIsKeywordsLoading(true);
    fetchTrendingKeywords()
      .then((data) => {
        if (!cancelled) {
          setTrendingKeywords(data);
          setIsKeywordsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsKeywordsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // เรียงลำดับ keywords ตาม sortField
  const sortedKeywords = [...trendingKeywords].sort((a, b) => {
    if (sortField === 'volume') return b.search_volume - a.search_volume;
    if (sortField === 'growth') return b.growth - a.growth;
    return 0; // rank = ลำดับเดิมจาก API
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FF5722] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล Big Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with AI Badge */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-[#FF5722] to-[#FF7043] p-2 sm:p-3 rounded-lg sm:rounded-xl">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                <span className="hidden sm:inline">IAMROOT AI AI Intelligence</span>
                <span className="sm:hidden">AI Intelligence</span>
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm">
                <span className="hidden md:inline">Real-time Consumer Behavior Analytics</span>
                <span className="md:hidden">Real-time Analytics</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
              ● LIVE
            </span>
            <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
              🤖 AI-Powered
            </span>
          </div>
        </div>

        {/* Platform Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
          {[
            { label: 'Total Keywords', value: consumerData.search_intent_trends.length.toLocaleString(), icon: Database },
            { label: 'Avg Growth', value: Math.round(consumerData.search_intent_trends.reduce((s, t) => s + t.growth, 0) / consumerData.search_intent_trends.length) + '%', icon: TrendingUp },
            { label: 'Data Accuracy', value: '98.5%', icon: Target },
            { label: 'Active Areas', value: new Set(consumerData.search_intent_trends.map(t => t.top_area)).size.toString(), icon: Activity }
          ].map((stat, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 text-[#FF5722]" />
                <p className="text-xs text-gray-500 truncate">{stat.label}</p>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b border-gray-300 overflow-x-auto scrollbar-hide">
        {[
          { id: 'trends', label: 'Trending Keywords', shortLabel: 'Trends', icon: TrendingUp },
          { id: 'engagement', label: 'Peak Hours', shortLabel: 'Peak', icon: Users },
          { id: 'prediction', label: 'AI Prediction', shortLabel: 'AI', icon: Brain },
          { id: 'competition', label: 'Competition', shortLabel: 'Compete', icon: Crown }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold transition-all relative ${
              activeTab === tab.id
                ? 'text-[#FF5722]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden">{tab.shortLabel}</span>
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF5722] to-[#FF7043]" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Trending Keywords Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-orange-900 mb-2">🔥 Hyper-Local Search Intelligence</h3>
                  <p className="text-sm text-orange-800">
                    ข้อมูลเหล่านี้แสดง <strong>Search Intent</strong> ในแต่ละย่าน - ร้านค้าสามารถวางแผนโปรโมชั่นได้ตรงเป้าหมาย
                    และ <strong>แบรนด์ใหญ่</strong> สามารถซื้อข้อมูลนี้เพื่อวางกลยุทธ์การตลาด
                  </p>
                </div>
              </div>
            </div>

            {/* Trending Keywords Table */}
            <div className="card overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Trending Search Keywords</h3>
                  <p className="text-gray-500 text-sm">อัปเดตทุก 15 นาที จาก Search Behavior Analytics</p>
                </div>
                {/* Sort controls */}
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722] bg-white"
                >
                  <option value="rank">เรียงตาม: อันดับ</option>
                  <option value="volume">เรียงตาม: ปริมาณค้นหา</option>
                  <option value="growth">เรียงตาม: การเติบโต</option>
                </select>
              </div>

              {isKeywordsLoading ? (
                /* Skeleton Loading */
                <div className="p-4 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/4" />
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-16" />
                      <div className="h-4 bg-gray-200 rounded w-12" />
                    </div>
                  ))}
                </div>
              ) : sortedKeywords.length === 0 ? (
                /* Empty State */
                <div className="p-10 text-center">
                  <p className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีข้อมูล Trending Keywords</p>
                  <p className="text-sm text-gray-500">ข้อมูลจะปรากฏเมื่อระบบรวบรวมเพียงพอ</p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700">Rank</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700">Keyword</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700">Search Volume</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700">Growth</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700">Top Area</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700">Peak Time</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700">Demographic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedKeywords.map((trend, idx) => (
                      <tr key={trend.keyword} className="border-t border-gray-100 hover:bg-orange-50 transition-colors">
                        <td className="p-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-gray-300'
                          }`}>
                            {idx + 1}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{trend.keyword}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-gray-900">{trend.search_volume.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">searches/วัน</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <ChevronUp className={`w-5 h-5 ${trend.growth > 50 ? 'text-green-600' : 'text-blue-600'}`} />
                            <span className={`font-bold text-lg ${trend.growth > 50 ? 'text-green-600' : 'text-blue-600'}`}>
                              +{trend.growth}%
                            </span>
                            {trend.growth > 80 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                                🔥 HOT
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-medium text-gray-900">{trend.top_area}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-gray-700">{trend.peak_time}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-gray-600">{trend.demographic}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>

            {/* Value Proposition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300">
                <h4 className="font-bold text-purple-900 mb-3">💰 ขายให้ร้านค้า SME</h4>
                <ul className="text-sm text-purple-800 space-y-2">
                  <li>✓ รู้ว่าควรจัดโปรโมชั่นอะไร</li>
                  <li>✓ รู้ว่าคนในย่านนั้นกำลังต้องการอะไร</li>
                  <li>✓ ซื้อ SEO Keyword ที่มี ROI สูงสุด</li>
                </ul>
              </div>
              <div className="card p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
                <h4 className="font-bold text-green-900 mb-3">🏢 ขายให้แบรนด์ใหญ่</h4>
                <ul className="text-sm text-green-800 space-y-2">
                  <li>✓ Consumer Insights Report (999฿/เดือน)</li>
                  <li>✓ Market Trend Analysis</li>
                  <li>✓ Competitor Intelligence</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Peak Hours Tab */}
        {activeTab === 'engagement' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">⏰ Peak Engagement Hours</h3>
                  <p className="text-sm text-blue-800">
                    วิเคราะห์ว่าช่วงเวลาไหนมี User Active มากที่สุด - <strong>ร้านค้าควรซื้อ SEO ในช่วงนี้</strong> เพื่อ ROI สูงสุด
                  </p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="card p-4 sm:p-6">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-4 sm:mb-6">
                <span className="hidden sm:inline">Active Users Throughout The Day</span>
                <span className="sm:hidden">Active Users (24h)</span>
              </h3>
              <div className="h-64 sm:h-80 md:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={consumerData.peak_engagement_hours}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF5722" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FF5722" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-4 rounded-lg shadow-xl border-2 border-[#FF5722]">
                              <p className="font-bold text-gray-900 mb-2">{data.hour}</p>
                              <p className="text-sm text-gray-700">
                                <strong>{data.active_users.toLocaleString()}</strong> Active Users
                              </p>
                              <p className="text-sm text-gray-700">
                                Category: <strong>{data.top_category}</strong>
                              </p>
                              <p className="text-sm text-green-600 font-semibold">
                                Conversion: {data.conversion_rate}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="active_users" 
                      stroke="#FF5722" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorUsers)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Peak Time Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {consumerData.peak_engagement_hours
                .sort((a, b) => b.active_users - a.active_users)
                .slice(0, 3)
                .map((peak, idx) => (
                  <div key={idx} className="card p-5 border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-red-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-orange-600">PEAK #{idx + 1}</span>
                      <Zap className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-orange-900 mb-2">{peak.hour}</p>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>{peak.active_users.toLocaleString()}</strong> Active Users
                    </p>
                    <p className="text-sm text-gray-600">{peak.top_category}</p>
                    <div className="mt-3 pt-3 border-t border-orange-200">
                      <p className="text-xs text-green-600 font-semibold">
                        ✓ Conversion Rate: {peak.conversion_rate}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            {/* SEO Recommendation */}
            <div className="card p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400">
              <h4 className="font-bold text-yellow-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                💡 AI Recommendation: Best Time to Buy SEO
              </h4>
              <p className="text-sm text-yellow-800 mb-4">
                จากข้อมูล Peak Hours คุณควร <strong>ซื้อ SEO Boost ในช่วง 18:00-20:00 น.</strong> 
                เพราะมี User Active มากกว่า 9,000 คน/ชม. และมี Conversion Rate สูงถึง <strong>12-13%</strong>
              </p>
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                ซื้อ SEO Package ตอนนี้เลย
              </button>
            </div>
          </div>
        )}

        {/* AI Prediction Tab */}
        {activeTab === 'prediction' && (
          <div className="space-y-6">
            {/* Main Prediction Card */}
            <div className="card overflow-hidden border-2 border-purple-400">
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Brain className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">IAMROOT AI AI Intelligence</h3>
                    <p className="text-white/80 text-sm">Predictive Market Analysis</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p className="text-lg font-semibold mb-2">🔮 Next Week Prediction:</p>
                  <p className="text-white/90 leading-relaxed">
                    {consumerData.predictive_analysis.next_week_prediction}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                    <p className="text-sm text-green-700 font-medium mb-2">✓ Recommended Promo</p>
                    <p className="font-bold text-green-900">
                      {consumerData.predictive_analysis.recommended_promo}
                    </p>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                    <p className="text-sm text-blue-700 font-medium mb-2">🎯 Confidence Score</p>
                    <p className="text-4xl font-bold text-blue-900">
                      {consumerData.predictive_analysis.confidence_score}%
                    </p>
                    <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600"
                        style={{ width: `${consumerData.predictive_analysis.confidence_score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-lg p-5">
                  <h4 className="font-bold text-orange-900 mb-3">📊 Additional Insights</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-orange-900">Weather Impact</p>
                        <p className="text-sm text-orange-800">{consumerData.predictive_analysis.weather_impact}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-pink-900">Seasonal Trend</p>
                        <p className="text-sm text-pink-800">{consumerData.predictive_analysis.seasonal_trend}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Value Proposition for Brands */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">💎 Premium Data Package สำหรับแบรนด์ใหญ่</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Package: Market Intelligence</p>
                      <p className="text-3xl font-bold text-[#FF5722]">4,999฿<span className="text-lg">/เดือน</span></p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">✓ Weekly Trend Report</p>
                      <p className="text-gray-600">✓ Predictive Analytics</p>
                      <p className="text-gray-600">✓ Consumer Behavior Data</p>
                      <p className="text-gray-600">✓ Competitor Intelligence</p>
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-sm transition-all">
                    สอบถามแพ็กเกจ Enterprise
                  </button>
                </div>
              </div>
            </div>

            {/* SEO ROI Comparison */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-6">📈 SEO Performance: Organic vs Sponsored</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-300">
                    <p className="text-sm text-gray-600 mb-2">Organic Reach (ไม่จ่าย SEO)</p>
                    <p className="text-4xl font-bold text-gray-900 mb-4">
                      {consumerData.seo_roi_metrics.organic_reach.toLocaleString()}
                    </p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>Conversion Rate: <strong>{consumerData.seo_roi_metrics.conversion_rate_organic}%</strong></p>
                      <p>Avg Revenue/Click: <strong>฿{consumerData.seo_roi_metrics.avg_revenue_per_click_organic}</strong></p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-400">
                    <p className="text-sm text-green-700 mb-2 flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Sponsored Reach (จ่าย SEO)
                    </p>
                    <p className="text-4xl font-bold text-green-900 mb-4">
                      {consumerData.seo_roi_metrics.sponsored_reach.toLocaleString()}
                    </p>
                    <div className="space-y-2 text-sm text-green-800">
                      <p>Conversion Rate: <strong>{consumerData.seo_roi_metrics.conversion_rate_sponsored}%</strong></p>
                      <p>Avg Revenue/Click: <strong>฿{consumerData.seo_roi_metrics.avg_revenue_per_click_sponsored}</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-5 text-center">
                <p className="text-sm text-purple-700 mb-2">🚀 ROI Multiplier</p>
                <p className="text-5xl font-bold text-purple-900 mb-2">
                  {consumerData.seo_roi_metrics.roi_multiplier}x
                </p>
                <p className="text-sm text-purple-800">
                  ร้านค้าที่จ่าย SEO ได้รายได้มากกว่า <strong>{consumerData.seo_roi_metrics.roi_multiplier}เท่า</strong>!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Competition Tab */}
        {activeTab === 'competition' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Crown className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-red-900 mb-2">👥 Competitor Intelligence</h3>
                  <p className="text-sm text-red-800">
                    วิเคราะห์คู่แข่งในย่านเดียวกัน - <strong>รู้ว่าโปรโมชั่นอะไรของเขาได้รับความสนใจ</strong> เพื่อวางแผนรับมือ
                  </p>
                </div>
              </div>
            </div>

            {/* Competitor Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {consumerData.competitor_intelligence.map((comp, idx) => (
                <div key={idx} className="card p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-2xl font-bold ${
                      idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-orange-600'
                    }`}>
                      #{idx + 1}
                    </span>
                    <span className="text-3xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-3">{comp.competitor}</h4>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-xs text-gray-600 mb-1">Top Promo:</p>
                    <p className="font-semibold text-gray-900">{comp.top_promo}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Engagement</p>
                      <p className="text-2xl font-bold text-[#FF5722]">{comp.engagement.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Market Share</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#FF5722] to-[#FF7043]"
                            style={{ width: `${comp.market_share}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{comp.market_share}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Market Share Pie Chart */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-6">📊 Market Share Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={consumerData.competitor_intelligence}
                      dataKey="market_share"
                      nameKey="competitor"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => `${name?.split(' ')[0]} (${value}%)`}
                    >
                      {consumerData.competitor_intelligence.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Action Items */}
            <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300">
              <h4 className="font-bold text-blue-900 mb-4">💡 AI-Powered Action Items</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-white rounded-lg p-4">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">7-Eleven กำลังเป็นผู้นำในย่านอารีย์</p>
                    <p className="text-sm text-gray-700">
                      คุณควรสร้างโปรโมชั่นที่แข่งขันได้ หรือเน้น Unique Value ของร้านคุณ
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white rounded-lg p-4">
                  <span className="text-2xl">✓</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">ร้านอิสระมี Market Share ต่ำ (8.7%)</p>
                    <p className="text-sm text-gray-700">
                      นี่คือโอกาสของคุณ! ถ้าซื้อ SEO Ranking ตอนนี้ คุณจะแข่งขันได้ง่ายขึ้น
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
