'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users, MapPin, Navigation } from 'lucide-react';

interface AudienceLocationProps {
  /** Real gender breakdown joined from profiles.gender — may be empty */
  genderBreakdown: { gender: string; count: number }[];
  /** Real distance-from-nearest-branch buckets — may be empty */
  locationBuckets: { label: string; count: number }[];
}

const GENDER_LABEL: Record<string, { label: string; color: string }> = {
  male: { label: 'ชาย', color: '#3B82F6' },
  female: { label: 'หญิง', color: '#EC4899' },
  other: { label: 'อื่นๆ', color: '#8B5CF6' },
  prefer_not_to_say: { label: 'ไม่ระบุ', color: '#9CA3AF' },
  unknown: { label: 'ไม่มีข้อมูล', color: '#D1D5DB' },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold text-sm">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-900 mb-1">{payload[0].name}</p>
        <p className="text-xs text-gray-600">
          <span className="font-bold text-gray-900">{payload[0].value}</span> คน
        </p>
      </div>
    );
  }
  return null;
};

export default function AudienceLocation({ genderBreakdown, locationBuckets }: AudienceLocationProps) {
  const genderTotal = genderBreakdown.reduce((sum, g) => sum + g.count, 0);
  const genderData = genderBreakdown
    .map((g) => ({
      name: GENDER_LABEL[g.gender]?.label || g.gender,
      value: g.count,
      color: GENDER_LABEL[g.gender]?.color || '#D1D5DB',
    }))
    .sort((a, b) => b.value - a.value);

  const locationTotal = locationBuckets.reduce((sum, l) => sum + l.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Demographics Pie Chart */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Audience Demographics</h3>
            <p className="text-sm text-gray-500">เพศของผู้เข้าชม/กดรับโปรโมชั่นของคุณ (จากข้อมูลโปรไฟล์จริง)</p>
          </div>
        </div>

        {genderTotal === 0 ? (
          <div className="py-14 text-center">
            <p className="text-gray-500 font-medium">ยังไม่มีข้อมูลเพียงพอ</p>
            <p className="text-sm text-gray-400 mt-1">จะแสดงเมื่อมีผู้ใช้ที่ระบุเพศเข้าชมโปรโมชั่นของคุณ</p>
          </div>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                {genderData.slice(0, 2).map((g) => (
                  <div key={g.name} className="text-center bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">{g.name}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {genderTotal > 0 ? Math.round((g.value / genderTotal) * 100) : 0}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{g.value.toLocaleString()} คน</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Distance from your store */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">ระยะห่างจากร้านคุณ</h3>
            <p className="text-sm text-gray-500">
              คำนวณจากตำแหน่งจริงของผู้เข้าชม (เฉพาะที่เบราว์เซอร์อนุญาต location ไว้แล้ว)
            </p>
          </div>
        </div>

        {locationTotal === 0 ? (
          <div className="py-14 text-center">
            <p className="text-gray-500 font-medium">ยังไม่มีข้อมูลตำแหน่ง</p>
            <p className="text-sm text-gray-400 mt-1">
              ระบบเก็บพิกัดเฉพาะตอนที่ผู้ใช้เปิดสิทธิ์ location ไว้แล้วจากที่อื่นในแอป (เช่นหน้าแผนที่) — ไม่ได้ขอสิทธิ์เพิ่มเพื่อจุดประสงค์นี้โดยเฉพาะ
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {locationBuckets.map((zone) => (
              <div key={zone.label} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-gray-900">{zone.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{zone.count.toLocaleString()} คน</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${locationTotal > 0 ? (zone.count / locationTotal) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {locationTotal > 0 ? ((zone.count / locationTotal) * 100).toFixed(1) : '0'}% ของผู้เข้าชมที่ทราบตำแหน่ง
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
