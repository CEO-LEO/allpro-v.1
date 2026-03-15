'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Clock, TrendingUp } from 'lucide-react';

// Generate realistic 24-hour data with peaks at lunch (12:00) and evening (18:00)
const generateHourlyData = () => {
  const data = [];
  for (let hour = 0; hour < 24; hour++) {
    // Base traffic
    let viewsBase = 300;
    let savesBase = 150;

    // Lunch hour peak (11:00 - 13:00)
    if (hour >= 11 && hour <= 13) {
      viewsBase += 400 + Math.random() * 200;
      savesBase += 180 + Math.random() * 100;
    }
    // Evening peak (17:00 - 20:00)
    else if (hour >= 17 && hour <= 20) {
      viewsBase += 600 + Math.random() * 300;
      savesBase += 250 + Math.random() * 150;
    }
    // Night drop (00:00 - 06:00)
    else if (hour >= 0 && hour <= 6) {
      viewsBase = 100 + Math.random() * 80;
      savesBase = 40 + Math.random() * 30;
    }
    // Normal hours
    else {
      viewsBase += Math.random() * 150;
      savesBase += Math.random() * 80;
    }

    data.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      views: Math.round(viewsBase),
      saves: Math.round(savesBase),
      hour
    });
  }
  return data;
};

const data = generateHourlyData();

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-900 mb-2">
          {payload[0].payload.time}
        </p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Views:</span>
            <span className="text-sm font-bold text-blue-600">
              {payload[0].value.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Saves:</span>
            <span className="text-sm font-bold text-orange-600">
              {payload[1].value.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Conversion: {((payload[1].value / payload[0].value) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Find peak hours
const peakViewsHour = data.reduce((max, item) => item.views > max.views ? item : max, data[0]);
const peakSavesHour = data.reduce((max, item) => item.saves > max.saves ? item : max, data[0]);

export default function EngagementChart() {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            24-Hour Engagement Performance
          </h3>
          <p className="text-sm text-gray-500">
            Real-time activity tracking across all promotions
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold">Live Data</span>
        </div>
      </div>

      {/* Peak Time Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
              Peak Views Time
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mb-1">
            {peakViewsHour.time}
          </p>
          <p className="text-xs text-blue-700">
            {peakViewsHour.views.toLocaleString()} impressions - Perfect time to boost stock
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-semibold text-orange-900 uppercase tracking-wide">
              Peak Conversion Time
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-900 mb-1">
            {peakSavesHour.time}
          </p>
          <p className="text-xs text-orange-700">
            {peakSavesHour.saves.toLocaleString()} saves - High purchase intent detected
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSaves" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="time" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="views"
              name="Views (Impressions)"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorViews)"
            />
            <Area
              type="monotone"
              dataKey="saves"
              name="Saves (Intent)"
              stroke="#F97316"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSaves)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Average Hourly Views</p>
            <p className="text-xl font-bold text-gray-900">
              {Math.round(data.reduce((sum, item) => sum + item.views, 0) / data.length).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Average Conversion Rate</p>
            <p className="text-xl font-bold text-green-600">
              {((data.reduce((sum, item) => sum + item.saves, 0) / data.reduce((sum, item) => sum + item.views, 0)) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Peak Hour Multiplier</p>
            <p className="text-xl font-bold text-purple-600">
              {(peakViewsHour.views / (data.reduce((sum, item) => sum + item.views, 0) / data.length)).toFixed(1)}x
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
