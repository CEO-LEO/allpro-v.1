'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Sparkles } from 'lucide-react';

// ═══════════════════════════════════════════════════════
// Types — API-ready JSON structure
// ═══════════════════════════════════════════════════════
interface GenderData {
  name: string;
  value: number;
  color: string;
  label: string;
}

interface AgeGroupData {
  range: string;
  label: string;
  count: number;
  percent: number;
  color: string;
}

interface CustomerInsightsProps {
  genderData?: GenderData[];
  ageData?: AgeGroupData[];
}

// ═══════════════════════════════════════════════════════
// Mock Data (replace with API: GET /api/merchant/analytics/demographics)
// ═══════════════════════════════════════════════════════
const MOCK_GENDER: GenderData[] = [
  { name: 'female', value: 58, color: '#f97316', label: 'หญิง' },
  { name: 'male', value: 32, color: '#64748b', label: 'ชาย' },
  { name: 'other', value: 7, color: '#cbd5e1', label: 'อื่นๆ' },
  { name: 'unknown', value: 3, color: '#e2e8f0', label: 'ไม่ระบุ' },
];

const MOCK_AGE: AgeGroupData[] = [
  { range: '18-24', label: 'Gen Z', count: 342, percent: 38, color: '#f97316' },
  { range: '25-34', label: 'Young Pro', count: 278, percent: 31, color: '#fb923c' },
  { range: '35-44', label: 'Family', count: 156, percent: 17, color: '#fdba74' },
  { range: '45-54', label: 'Mature', count: 89, percent: 10, color: '#fed7aa' },
  { range: '55+', label: 'Senior', count: 35, percent: 4, color: '#e2e8f0' },
];

// ═══════════════════════════════════════════════════════
// Custom Tooltip
// ═══════════════════════════════════════════════════════
function AgeTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: AgeGroupData }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <p className="font-semibold text-gray-900">{d.label} ({d.range} ปี)</p>
      <p className="text-gray-500">{d.count.toLocaleString()} คน · {d.percent}%</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════
export default function CustomerInsights({
  genderData = MOCK_GENDER,
  ageData = MOCK_AGE,
}: CustomerInsightsProps) {
  // Derive primary audience summary
  const summary = useMemo(() => {
    const topGender = [...genderData].sort((a, b) => b.value - a.value)[0];
    const topAge = [...ageData].sort((a, b) => b.count - a.count)[0];
    const totalCustomers = ageData.reduce((sum, a) => sum + a.count, 0);
    return { topGender, topAge, totalCustomers };
  }, [genderData, ageData]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm font-bold text-gray-900">สถิติลูกค้า</h3>
          <span className="text-[10px] font-medium bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">Customer Insights</span>
        </div>
        <span className="text-[10px] text-gray-400">{summary.totalCustomers.toLocaleString()} คนทั้งหมด</span>
      </div>

      <div className="p-5">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">
              กลุ่มลูกค้าหลักของคุณคือ <span className="text-orange-600">{summary.topGender.label}</span> อายุ <span className="text-orange-600">{summary.topAge.range} ปี</span>
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              คิดเป็น {summary.topGender.value}% ของลูกค้าทั้งหมด · กลุ่ม {summary.topAge.label}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ═══ Gender Donut Chart ═══ */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              สัดส่วนเพศ
            </p>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={56}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {genderData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-600">{item.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ Age Horizontal Bar Chart ═══ */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              กลุ่มอายุ
            </p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ageData}
                  layout="vertical"
                  margin={{ top: 0, right: 4, left: 0, bottom: 0 }}
                  barSize={16}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="range"
                    width={44}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<AgeTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="percent" radius={[0, 6, 6, 0]}>
                    {ageData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Inline labels */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              {ageData.map((item) => (
                <span key={item.range} className="text-[10px] text-gray-400">
                  {item.label} <span className="font-medium text-gray-600">{item.percent}%</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Top promotions by age group */}
        <div className="mt-5 pt-4 border-t border-gray-50">
          <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
            คำแนะนำเชิงกลยุทธ์
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-semibold text-orange-600 mb-0.5">กลุ่มหลัก: {summary.topAge.label}</p>
              <p className="text-[11px] text-gray-500">สร้างโปรโมชันเน้นกลุ่ม {summary.topAge.range} ปี เพื่อเพิ่ม Conversion</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-semibold text-blue-600 mb-0.5">ช่วงเวลาที่ดีที่สุด</p>
              <p className="text-[11px] text-gray-500">โพสต์ดีล 11:00-13:00 น. เพื่อเข้าถึงกลุ่มวัยทำงาน</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-semibold text-green-600 mb-0.5">เพิ่มกลุ่มใหม่</p>
              <p className="text-[11px] text-gray-500">ลองสร้างดีล Family-friendly เพื่อขยายฐานลูกค้า 35+</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
