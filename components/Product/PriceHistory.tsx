'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown, Award, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

/* ── Types ─────────────────────────────────────────────────────────── */

interface PricePoint {
  date: string;
  dateDisplay: string;
  price: number;
  event?: string;
}

interface PriceStats {
  currentPrice: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  lowestDate: string;
}

interface PriceHistoryProps {
  productId: string;
  productName: string;
  currentPrice: number;
}

/* ── Deal Score ────────────────────────────────────────────────────── */

const calculateDealScore = (currentPrice: number, stats: PriceStats): number => {
  if (currentPrice <= stats.lowestPrice) return 10;
  const savingsFromAvg = ((stats.averagePrice - currentPrice) / stats.averagePrice) * 100;
  if (savingsFromAvg >= 30) return 9;
  if (savingsFromAvg >= 25) return 8;
  if (savingsFromAvg >= 20) return 7;
  if (savingsFromAvg >= 15) return 6;
  if (savingsFromAvg >= 10) return 5;
  if (savingsFromAvg >= 5) return 4;
  if (savingsFromAvg >= 0) return 3;
  return 2;
};

const getDealScoreInfo = (score: number) => {
  if (score >= 8) {
    return {
      label: '🔥 ดีลหายาก',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      description: 'ราคาดีที่สุดในรอบหลายสัปดาห์',
    };
  } else if (score >= 5) {
    return {
      label: '👍 ราคาดี',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      description: 'ต่ำกว่าราคาเฉลี่ย',
    };
  }
  return {
    label: '📊 ราคาปกติ',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    description: 'ราคาในช่วงปกติ',
  };
};

/* ── Custom Tooltip ───────────────────────────────────────────────── */

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as PricePoint;
    return (
      <div className="bg-white border-2 border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-900 mb-1">{data.dateDisplay}</p>
        <p className="text-lg font-bold text-red-600 mb-1">฿{data.price}</p>
        {data.event && (
          <p className="text-xs text-blue-600 font-semibold">📅 {data.event}</p>
        )}
      </div>
    );
  }
  return null;
};

/* ── Skeleton Loader ──────────────────────────────────────────────── */

function PriceHistorySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-gray-100 border-2 border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="h-5 w-12 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
        <div className="h-64 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────── */

export default function PriceHistory({ productId, productName, currentPrice }: PriceHistoryProps) {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchPriceHistory() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `/api/products/${encodeURIComponent(productId)}/price-history?currentPrice=${currentPrice}`,
        );
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (cancelled) return;
        setHistory(data.history);
        setStats(data.stats);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPriceHistory();
    return () => { cancelled = true; };
  }, [productId, currentPrice]);

  /* Loading */
  if (loading) return <PriceHistorySkeleton />;

  /* Error / no data */
  if (error || !stats || history.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
        <TrendingDown className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">ยังไม่มีข้อมูลราคาย้อนหลัง</p>
        <p className="text-sm text-gray-400 mt-1">ระบบจะเริ่มเก็บข้อมูลเมื่อมีการเปลี่ยนแปลงราคา</p>
      </div>
    );
  }

  const dealScore = calculateDealScore(currentPrice, stats);
  const scoreInfo = getDealScoreInfo(dealScore);

  /* Determine which point is the sale event for analysis text */
  const saleEvents = history.filter((p) => p.event && p.date !== history[history.length - 1].date);
  const saleEventText =
    saleEvents.length > 0
      ? saleEvents.map((e) => e.event).join(' และ ')
      : null;

  return (
    <div className="space-y-4">
      {/* Deal Score Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${scoreInfo.bgColor} border-2 ${scoreInfo.borderColor} rounded-xl p-5`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                {/* Circular Progress */}
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200" />
                  <circle
                    cx="32" cy="32" r="28"
                    stroke="currentColor" strokeWidth="6" fill="none"
                    strokeDasharray={`${(dealScore / 10) * 176} 176`}
                    className={scoreInfo.color}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold ${scoreInfo.color}`}>{dealScore}</span>
                </div>
              </div>

              <div>
                <h3 className={`text-xl font-bold ${scoreInfo.color} mb-1`}>{scoreInfo.label}</h3>
                <p className="text-sm text-gray-600">{scoreInfo.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">ราคาปัจจุบัน</p>
                <p className="text-lg font-bold text-red-600">฿{stats.currentPrice}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">ราคาเฉลี่ย</p>
                <p className="text-lg font-bold text-gray-900">฿{stats.averagePrice}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">ต่ำสุดเคย</p>
                <p className="text-lg font-bold text-green-600">฿{stats.lowestPrice}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Price History Chart */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">กราฟราคาย้อนหลัง</h3>
            <p className="text-sm text-gray-500">ข้อมูล 6 สัปดาห์ที่ผ่านมา</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="dateDisplay" stroke="#6B7280" fontSize={12} tickLine={false} />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} tickFormatter={(v) => `฿${v}`} />
              <Tooltip content={<CustomTooltip />} />

              {/* Average Price Reference Line */}
              <ReferenceLine
                y={stats.averagePrice}
                stroke="#F59E0B"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: 'ราคาเฉลี่ย',
                  position: 'right',
                  fill: '#F59E0B',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              />

              <Line
                type="monotone"
                dataKey="price"
                stroke="#6B7280"
                strokeWidth={3}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  const isLowest = payload.price === stats.lowestPrice;
                  const isCurrent = payload.date === history[history.length - 1].date;

                  if (isLowest && !isCurrent) {
                    return (
                      <g key={`dot-${payload.date}`}>
                        <circle cx={cx} cy={cy} r={8} fill="#10B981" stroke="#fff" strokeWidth={2} />
                        <text x={cx} y={cy - 15} textAnchor="middle" fill="#10B981" fontSize={11} fontWeight="bold">
                          ต่ำสุด
                        </text>
                      </g>
                    );
                  }

                  if (isCurrent) {
                    return (
                      <g key={`dot-${payload.date}`}>
                        <circle cx={cx} cy={cy} r={6} fill="#DC2626" stroke="#fff" strokeWidth={2}>
                          <animate attributeName="r" from="6" to="10" dur="1s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="1" to="0.5" dur="1s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={cx} cy={cy} r={6} fill="#DC2626" stroke="#fff" strokeWidth={2} />
                      </g>
                    );
                  }

                  return <circle key={`dot-${payload.date}`} cx={cx} cy={cy} r={4} fill="#6B7280" stroke="#fff" strokeWidth={2} />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full" />
            <span className="text-gray-600">ประวัติราคา</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-gray-600">ราคาเฉลี่ย</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-600">ราคาต่ำสุด</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
            <span className="text-gray-600">ราคาปัจจุบัน</span>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-semibold mb-1">ข้อมูลราคาจริงจาก CP ALL Ecosystem</p>
              <p className="text-xs text-blue-700">
                ตรวจสอบราคาจากระบบ Point of Sale (POS) ของ 7-Eleven, Lotus, Makro
                เพื่อความโปร่งใสและน่าเชื่อถือ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Analysis */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          การวิเคราะห์ราคา
        </h4>
        <div className="space-y-2 text-sm text-gray-700">
          {currentPrice <= stats.lowestPrice ? (
            <p className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>ราคานี้เป็น<strong className="text-green-600">ราคาต่ำสุดตลอดกาล</strong> ที่เราเคยเห็น</span>
            </p>
          ) : (
            <p className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>ราคาต่ำสุดที่เคยมีคือ <strong className="text-green-600">฿{stats.lowestPrice}</strong> ({stats.lowestDate})</span>
            </p>
          )}

          {currentPrice < stats.averagePrice ? (
            <p className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                ประหยัดกว่าราคาเฉลี่ย{' '}
                <strong className="text-green-600">฿{stats.averagePrice - currentPrice}</strong>{' '}
                ({Math.round(((stats.averagePrice - currentPrice) / stats.averagePrice) * 100)}%)
              </span>
            </p>
          ) : (
            <p className="flex items-start gap-2">
              <span className="text-yellow-600">•</span>
              <span>ราคาสูงกว่าราคาเฉลี่ย <strong>฿{currentPrice - stats.averagePrice}</strong></span>
            </p>
          )}

          {saleEventText && (
            <p className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>มีโปรโมชั่นพิเศษในช่วง {saleEventText}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
