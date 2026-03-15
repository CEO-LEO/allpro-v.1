'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users, MapPin, TrendingUp, Navigation } from 'lucide-react';

// Demographics data
const demographicsData = [
  { name: 'Female', value: 60, color: '#EC4899' },
  { name: 'Male', value: 40, color: '#3B82F6' }
];

// Hot zones data
const hotZones = [
  {
    id: 1,
    name: 'Siam Paragon',
    location: 'Pathum Wan, Bangkok',
    views: 3250,
    trend: 'up',
    change: 15,
    distance: '0.5 km'
  },
  {
    id: 2,
    name: 'Central Ladprao',
    location: 'Chatuchak, Bangkok',
    views: 2890,
    trend: 'up',
    change: 22,
    distance: '3.2 km'
  },
  {
    id: 3,
    name: 'Mega Bangna',
    location: 'Bang Phli, Samut Prakan',
    views: 2450,
    trend: 'up',
    change: 8,
    distance: '12.5 km'
  },
  {
    id: 4,
    name: 'Central World',
    location: 'Pathum Wan, Bangkok',
    views: 2180,
    trend: 'up',
    change: 12,
    distance: '0.8 km'
  },
  {
    id: 5,
    name: 'Icon Siam',
    location: 'Khlong San, Bangkok',
    views: 1920,
    trend: 'down',
    change: -3,
    distance: '4.7 km'
  }
];

// Custom label for pie chart
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="font-bold text-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-900 mb-1">
          {payload[0].name}
        </p>
        <p className="text-xs text-gray-600">
          <span className="font-bold text-gray-900">{payload[0].value}%</span> of total audience
        </p>
      </div>
    );
  }
  return null;
};

export default function AudienceLocation() {
  const totalViews = hotZones.reduce((sum, zone) => sum + zone.views, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Demographics Pie Chart */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Audience Demographics
            </h3>
            <p className="text-sm text-gray-500">
              Who is looking at your promotions?
            </p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={demographicsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {demographicsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center bg-pink-50 rounded-lg p-3">
              <p className="text-xs text-pink-600 mb-1">Female Audience</p>
              <p className="text-2xl font-bold text-pink-700">60%</p>
              <p className="text-xs text-gray-600 mt-1">Primary demographic</p>
            </div>
            <div className="text-center bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600 mb-1">Male Audience</p>
              <p className="text-2xl font-bold text-blue-700">40%</p>
              <p className="text-xs text-gray-600 mt-1">Growing segment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hot Zones List */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Top Locations
            </h3>
            <p className="text-sm text-gray-500">
              Where users are checking this promo
            </p>
          </div>
        </div>

        {/* Hot Zones List */}
        <div className="space-y-3">
          {hotZones.map((zone, index) => (
            <div 
              key={zone.id}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  {/* Rank Badge */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                      index === 1 ? 'bg-gray-300 text-gray-700' : 
                      index === 2 ? 'bg-orange-300 text-orange-900' :
                      'bg-gray-200 text-gray-600'}
                  `}>
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">
                      {zone.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{zone.location}</span>
                      <span className="text-gray-400">•</span>
                      <Navigation className="w-3 h-3" />
                      <span>{zone.distance}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">
                        👁️ {zone.views.toLocaleString()} views
                      </span>
                      <span className={`
                        text-xs font-semibold px-2 py-0.5 rounded-full
                        ${zone.trend === 'up' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                        }
                      `}>
                        {zone.trend === 'up' ? '↑' : '↓'} {Math.abs(zone.change)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Percentage bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${(zone.views / totalViews) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((zone.views / totalViews) * 100).toFixed(1)}% of total traffic
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 bg-purple-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-purple-900 uppercase tracking-wide">
              Location Insight
            </span>
          </div>
          <p className="text-sm text-purple-800">
            <strong>{hotZones[0].name}</strong> is your top traffic source with{' '}
            <strong>{hotZones[0].views.toLocaleString()} views</strong>.{' '}
            Consider prioritizing stock at nearby branches.
          </p>
        </div>
      </div>
    </div>
  );
}
