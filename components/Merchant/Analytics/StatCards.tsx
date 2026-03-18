'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Eye, Bookmark, MousePointer, AlertTriangle } from 'lucide-react';

export interface StatData {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  description: string;
  color: string;
}

interface StatCardsProps {
  stats?: StatData[];
}

const defaultStats: StatData[] = [
  {
    label: 'Total Views',
    value: '0',
    change: 0,
    trend: 'up',
    description: 'Impressions today',
    color: 'blue'
  },
  {
    label: 'Coupons Saved',
    value: '0',
    change: 0,
    trend: 'up',
    description: 'High conversion rate',
    color: 'green'
  },
  {
    label: '"Check Stock" Clicks',
    value: '0',
    change: 0,
    trend: 'up',
    description: 'High purchase intent',
    color: 'purple'
  },
  {
    label: 'Sold Out Events',
    value: '0',
    change: 0,
    trend: 'down',
    description: 'Branches need restock',
    color: 'orange'
  }
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; iconBg: string; iconText: string; trend: string }> = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      trend: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      trend: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      trend: 'text-purple-600'
    },
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconText: 'text-orange-600',
      trend: 'text-orange-600'
    }
  };
  return colors[color] || { bg: 'bg-gray-50', iconBg: 'bg-gray-100', iconText: 'text-gray-600', trend: 'text-gray-600' };
};

export default function StatCards({ stats = defaultStats }: StatCardsProps) {
  const getIcon = (label: string) => {
    if (label.includes('Views')) return <Eye className="w-5 h-5" />;
    if (label.includes('Coupons') || label.includes('Saved')) return <Bookmark className="w-5 h-5" />;
    if (label.includes('Stock') || label.includes('Clicks')) return <MousePointer className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const colors = getColorClasses(stat.color);
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm hover:shadow-md transition-all"
          >
            {/* Icon & Value Row */}
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
                <div className={colors.iconText}>
                  {getIcon(stat.label)}
                </div>
              </div>
              
              {/* Trend Badge */}
              <div className={`
                flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
                ${stat.trend === 'up' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
                }
              `}>
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(stat.change)}%
              </div>
            </div>

            {/* Stats */}
            <div className="mb-1">
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-gray-700">
                {stat.label}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-500">
              {stat.description}
            </p>

            {/* Bottom Indicator */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                {stat.trend === 'up' ? '↑' : '↓'} 
                <span className={`font-semibold ml-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(stat.change)}%
                </span>
                {' '}vs yesterday
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
