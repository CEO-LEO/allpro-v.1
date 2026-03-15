'use client';

import AdminLayout from '@/components/Admin/AdminLayout';
import Link from 'next/link';
import { 
  Flag, 
  Image, 
  Users, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h1 text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Platform overview and quick actions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Flag className="w-6 h-6 text-red-400" />
              </div>
              <span className="bg-red-500 text-white text-caption px-2 py-1 rounded-full">
                Urgent
              </span>
            </div>
            <p className="text-display text-white mb-1">12</p>
            <p className="text-body-sm text-gray-400">Pending Moderation</p>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-display text-green-400 mb-1">487</p>
            <p className="text-body-sm text-gray-400">Posts Approved Today</p>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Image className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-display text-white mb-1">5</p>
            <p className="text-body-sm text-gray-400">Active Hero Banners</p>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-display text-white mb-1">15.2k</p>
            <p className="text-body-sm text-gray-400">Active Users</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link 
            href="/admin/moderation"
            className="bg-gradient-to-br from-red-500 to-orange-600 rounded-xl p-8 hover:shadow-2xl hover:shadow-red-500/20 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <Flag className="w-10 h-10 text-white" />
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                12 Pending
              </span>
            </div>
            <h3 className="text-h2 text-white mb-2">Moderation Queue</h3>
            <p className="text-red-100 mb-4">Review community posts and award points</p>
            <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
              <span>Open Queue</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          <Link 
            href="/admin/banners"
            className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-8 hover:shadow-2xl hover:shadow-blue-500/20 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <Image className="w-10 h-10 text-white" />
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                5 Active
              </span>
            </div>
            <h3 className="text-h2 text-white mb-2">Hero Banners</h3>
            <p className="text-blue-100 mb-4">Manage homepage slider and monetization slots</p>
            <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
              <span>Manage Banners</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        </div>

        {/* System Health */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-h3 text-white mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-400" />
            System Health
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-sm text-gray-400">Database</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-h4 text-white">Operational</p>
              <p className="text-caption text-gray-500">Response time: 45ms</p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-sm text-gray-400">CDN</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-h4 text-white">All Regions Live</p>
              <p className="text-caption text-gray-500">99.99% uptime</p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-sm text-gray-400">API Gateway</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-h4 text-white">Healthy</p>
              <p className="text-caption text-gray-500">15.2k req/min</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
          <h3 className="text-h3 text-white mb-6">Recent Activity</h3>
          
          <div className="space-y-3">
            {[
              { icon: CheckCircle, color: 'text-green-400', action: 'Post Approved', detail: 'User Sarah Wilson earned +50 points', time: '2 mins ago' },
              { icon: XCircle, color: 'text-red-400', action: 'Post Rejected', detail: 'Spam content removed from queue', time: '5 mins ago' },
              { icon: Flag, color: 'text-yellow-400', action: 'New Report', detail: '3 users flagged inappropriate content', time: '12 mins ago' },
              { icon: Eye, color: 'text-blue-400', action: 'Banner Updated', detail: 'NIVEA promotion pinned to #1 spot', time: '28 mins ago' },
              { icon: Users, color: 'text-purple-400', action: 'User Banned', detail: 'Account suspended for spam violations', time: '1 hour ago' }
            ].map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={idx} className="flex items-start gap-4 bg-gray-900 rounded-lg p-4">
                  <div className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white mb-1">{activity.action}</p>
                    <p className="text-body-sm text-gray-400">{activity.detail}</p>
                  </div>
                  <span className="text-caption text-gray-500">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
