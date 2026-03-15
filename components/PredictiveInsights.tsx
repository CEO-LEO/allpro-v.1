'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Lightbulb, 
  Activity,
  Package,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line 
} from 'recharts';

// Mock data for peak search hours
const peakHoursData = [
  { hour: '00:00', searches: 120 },
  { hour: '03:00', searches: 80 },
  { hour: '06:00', searches: 250 },
  { hour: '09:00', searches: 820 },
  { hour: '12:00', searches: 1450 },
  { hour: '15:00', searches: 980 },
  { hour: '18:00', searches: 1680 },
  { hour: '21:00', searches: 1200 },
];

// Mock data for trending products
const trendingProducts = [
  { 
    name: 'นมโปรตีน', 
    currentVolume: 1250,
    predictedGrowth: 30,
    reason: 'New Year Resolution - คนหันมาใส่ใจสุขภาพ',
    confidence: 92
  },
  { 
    name: 'ข้าวกล่อง', 
    currentVolume: 2100,
    predictedGrowth: 15,
    reason: 'กลับเข้าออฟฟิศหลังวันหยุดยาว',
    confidence: 85
  },
  { 
    name: 'กาแฟ', 
    currentVolume: 3500,
    predictedGrowth: -5,
    reason: 'ตลาดอิ่มตัว - ควรมีโปรโมชั่นเพื่อรักษาส่วนแบ่ง',
    confidence: 78
  },
];

// Mock data for weekly trend
const weeklyTrendData = [
  { day: 'จันทร์', volume: 15000 },
  { day: 'อังคาร', volume: 18000 },
  { day: 'พุธ', volume: 22000 },
  { day: 'พฤหัสฯ', volume: 25000 },
  { day: 'ศุกร์', volume: 32000 },
  { day: 'เสาร์', volume: 38000 },
  { day: 'อาทิตย์', volume: 35000 },
];

interface PredictiveInsightsProps {
  location: string;
}

export default function PredictiveInsights({ location }: PredictiveInsightsProps) {
  const [activeTab, setActiveTab] = useState<'peak' | 'trend' | 'advice'>('peak');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-purple-600" />
          Predictive Analytics - AI วิเคราะห์ตลาด
        </h3>
        <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-full text-sm font-semibold text-purple-900">
          <Zap className="w-3 h-3 inline mr-1" />
          AI-Powered
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('peak')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'peak'
              ? 'text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Peak Hours
          {activeTab === 'peak' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('trend')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'trend'
              ? 'text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Trend Predictor
          {activeTab === 'trend' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('advice')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'advice'
              ? 'text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lightbulb className="w-4 h-4 inline mr-2" />
          Inventory Advice
          {activeTab === 'advice' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="card p-6">
        {/* Peak Hours Tab */}
        {activeTab === 'peak' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium mb-2">
                🕐 ช่วงเวลาที่คนค้นหาโปรโมชั่นในย่าน{location}สูงที่สุด
              </p>
              <p className="text-xs text-blue-700">
                ข้อมูลจาก Search Behavior Analytics - อัปเดตทุก 15 นาที
              </p>
            </div>

            {/* Heatmap Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="searches" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Peak Insight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-600 font-semibold mb-1">PEAK TIME #1</p>
                <p className="text-2xl font-bold text-green-900">18:00-21:00</p>
                <p className="text-sm text-green-700 mt-2">
                  1,680 searches/hr - เวลาเลิกงาน
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-600 font-semibold mb-1">PEAK TIME #2</p>
                <p className="text-2xl font-bold text-blue-900">12:00-13:00</p>
                <p className="text-sm text-blue-700 mt-2">
                  1,450 searches/hr - พักเที่ยง
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-xs text-purple-600 font-semibold mb-1">PEAK TIME #3</p>
                <p className="text-2xl font-bold text-purple-900">09:00-10:00</p>
                <p className="text-sm text-purple-700 mt-2">
                  820 searches/hr - เช้าวันทำงาน
                </p>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4">
              <p className="font-bold text-purple-900 mb-2">💡 คำแนะนำ AI:</p>
              <p className="text-sm text-purple-800">
                ควรเปิดโปรโมชั่นของคุณในช่วง <strong>18:00-21:00 น.</strong> เพื่อเพิ่ม Visibility สูงสุด 
                หรือซื้อ SEO Boost ในช่วงเวลาดังกล่าวเพื่อ ROI ที่ดีที่สุด
              </p>
            </div>
          </div>
        )}

        {/* Trend Predictor Tab */}
        {activeTab === 'trend' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-900 font-medium mb-2">
                📈 AI วิเคราะห์เทรนด์สินค้าสัปดาห์หน้า
              </p>
              <p className="text-xs text-orange-700">
                คำนวณจาก Search Volume, Social Media Trends และ Seasonal Patterns
              </p>
            </div>

            {/* Weekly Trend Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    dot={{ fill: '#f97316', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Trending Products */}
            <div className="space-y-4">
              {trendingProducts.map((product, idx) => (
                <div 
                  key={idx}
                  className={`border-2 rounded-lg p-4 ${
                    product.predictedGrowth > 0 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-yellow-50 border-yellow-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Package className="w-5 h-5 text-gray-700" />
                        <h4 className="font-bold text-lg text-gray-900">{product.name}</h4>
                        {idx === 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                            🔥 HOT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Search Volume ปัจจุบัน:</strong> {product.currentVolume.toLocaleString()} searches/วัน
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>เหตุผล:</strong> {product.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${
                        product.predictedGrowth > 0 ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {product.predictedGrowth > 0 ? '+' : ''}{product.predictedGrowth}%
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        คาดการณ์ 7 วันข้างหน้า
                      </p>
                      <div className="mt-2">
                        <span className="text-xs bg-white px-2 py-1 rounded-full border">
                          Confidence: {product.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full ${
                        product.predictedGrowth > 0 ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${product.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Prediction Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4">
              <p className="font-bold text-purple-900 mb-2">🤖 AI Prediction Summary:</p>
              <p className="text-sm text-purple-800">
                สัปดาห์หน้า <strong>"นมโปรตีน"</strong> มีโอกาสเป็นเทรนด์สูงขึ้น <strong>30%</strong> 
                จาก New Year Resolution และคนหันมาใส่ใจสุขภาพ 
                <br/><br/>
                <strong>คำแนะนำ:</strong> ถ้าร้านคุณมีสินค้าเกี่ยวกับ Health & Wellness 
                ควรสร้างโปรโมชั่นตอนนี้เลย!
              </p>
            </div>
          </div>
        )}

        {/* Inventory Advice Tab */}
        {activeTab === 'advice' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900 font-medium mb-2">
                💼 คำแนะนำสินค้าคงคลังจาก AI
              </p>
              <p className="text-xs text-green-700">
                วิเคราะห์จาก Search Intent, Seasonal Trends และ Competitor Analysis
              </p>
            </div>

            {/* Actionable Advice Cards */}
            <div className="space-y-4">
              {/* Advice 1 */}
              <div className="card p-5 border-l-4 border-l-green-500">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">
                      🎯 โปรโมชั่นแนะนำ: นมโปรตีน
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      จากสถิติการค้นหา คนในย่าน{location}กำลังค้นหา <strong>"นมโปรตีน"</strong> เพิ่มขึ้น <strong>50%</strong> 
                      และคาดว่าจะเพิ่มขึ้นอีก <strong>30%</strong> สัปดาห์หน้า
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-green-800 mb-2">💡 AI Suggestion:</p>
                      <p className="text-sm text-green-700">
                        จัดโปรโมชั่น "ซื้อ 2 แถม 1" หรือ "ลด 30%" สำหรับนมโปรตีนในช่วง <strong>18:00-21:00 น.</strong> 
                        เพื่อดึง Traffic ในช่วง Peak Hours
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        สร้างโปรโมชั่นทันที
                      </button>
                      <button className="text-xs border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">
                        ดูข้อมูลเพิ่มเติม
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advice 2 */}
              <div className="card p-5 border-l-4 border-l-blue-500">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">
                      ⏰ ช่วงเทศกาลใกล้เข้ามา
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      อีก <strong>14 วัน</strong> จะถึงวันวาเลนไทน์ 
                      ประวัติศาสตร์ในปีที่แล้วมีการค้นหา <strong>"ของขวัญ"</strong> เพิ่มขึ้น <strong>200%</strong>
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-blue-800 mb-2">💡 AI Suggestion:</p>
                      <p className="text-sm text-blue-700">
                        เตรียมสต็อกสินค้าประเภท: ช็อกโกแลต, ดอกไม้, ของขวัญ และสร้างโปรโมชั่น 
                        <strong>"Valentine Special"</strong> ตั้งแต่ตอนนี้
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        วางแผนแคมเปญ
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advice 3 */}
              <div className="card p-5 border-l-4 border-l-orange-500">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Lightbulb className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">
                      💰 Competitor Alert
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      ร้าน <strong>"7-Eleven สาขาอารีย์"</strong> กำลังจัดโปรโมชั่นกาแฟ 2 แก้ว 50 บาท 
                      และได้รับ Engagement สูงมาก (<strong>142 views/ชม.</strong>)
                    </p>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-orange-800 mb-2">💡 AI Suggestion:</p>
                      <p className="text-sm text-orange-700">
                        คุณอาจต้องจัดโปรโมชั่นสินค้าเดียวกันในราคาที่ดีกว่า หรือสร้าง <strong>Unique Value</strong> 
                        เช่น "กาแฟ + ขนมฟรี" เพื่อแข่งขัน
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-xs bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                        สร้าง Counter Promo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROI Calculator */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-5">
              <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                📊 ROI Calculator
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-purple-700 mb-1">ถ้าคุณจัดโปรโมชั่นนมโปรตีน</p>
                  <p className="text-2xl font-bold text-purple-900">+280 คน</p>
                  <p className="text-xs text-purple-600">คาดว่าจะมาดูร้านคุณ</p>
                </div>
                <div>
                  <p className="text-xs text-purple-700 mb-1">Conversion Rate โดยเฉลี่ย</p>
                  <p className="text-2xl font-bold text-purple-900">23%</p>
                  <p className="text-xs text-purple-600">= ~64 ยอดขาย</p>
                </div>
                <div>
                  <p className="text-xs text-purple-700 mb-1">ถ้าขายขวดละ 49฿</p>
                  <p className="text-2xl font-bold text-green-600">+3,136฿</p>
                  <p className="text-xs text-purple-600">รายได้เพิ่มที่คาดการณ์</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
