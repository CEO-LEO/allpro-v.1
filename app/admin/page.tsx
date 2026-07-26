'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/Admin/AdminLayout';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Flag,
  Image,
  Users,
  Store,
  Ticket,
  Activity,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface PlatformStats {
  totalUsers: number;
  totalMerchants: number;
  totalPromotions: number;
  totalRedemptions: number;
}

interface ActivityItem {
  id: string;
  kind: 'merchant' | 'post' | 'redemption';
  label: string;
  detail: string;
  time: string;
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'เมื่อกี้';
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        setDbHealthy(false);
        return;
      }

      try {
        const [usersRes, merchantsRes, promosRes, redemptionsRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('merchant_profiles').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('voucher_redemptions').select('*', { count: 'exact', head: true }),
        ]);

        setDbHealthy(!usersRes.error);
        setStats({
          totalUsers: usersRes.count ?? 0,
          totalMerchants: merchantsRes.count ?? 0,
          totalPromotions: promosRes.count ?? 0,
          totalRedemptions: redemptionsRes.count ?? 0,
        });

        const [recentMerchants, recentPosts, recentRedemptions] = await Promise.all([
          supabase.from('merchant_profiles').select('shop_name, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('community_posts').select('display_name, content, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('voucher_redemptions').select('reward_name, redeemed_at').order('redeemed_at', { ascending: false }).limit(5),
        ]);

        const items: ActivityItem[] = [
          ...(recentMerchants.data || []).map((m, i) => ({
            id: `m-${i}`,
            kind: 'merchant' as const,
            label: 'ร้านค้าใหม่',
            detail: m.shop_name || 'ร้านค้าไม่ระบุชื่อ',
            time: m.created_at,
          })),
          ...(recentPosts.data || []).map((p, i) => ({
            id: `p-${i}`,
            kind: 'post' as const,
            label: 'โพสต์ใหม่ในคอมมูนิตี้',
            detail: `${p.display_name || 'Anonymous'}: ${(p.content || '').slice(0, 60)}`,
            time: p.created_at,
          })),
          ...(recentRedemptions.data || []).map((r, i) => ({
            id: `r-${i}`,
            kind: 'redemption' as const,
            label: 'แลกของรางวัล',
            detail: r.reward_name || '',
            time: r.redeemed_at,
          })),
        ]
          .filter((it) => !!it.time)
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 6);

        setActivity(items);
      } catch (e) {
        console.error('[AdminDashboard] load error:', e);
        setDbHealthy(false);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const KIND_ICON: Record<ActivityItem['kind'], { icon: typeof CheckCircle; color: string }> = {
    merchant: { icon: Store, color: 'text-blue-400' },
    post: { icon: Users, color: 'text-purple-400' },
    redemption: { icon: Ticket, color: 'text-green-400' },
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h1 text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Platform overview and quick actions</p>
        </div>

        {isLoading ? (
          <div className="py-24 flex items-center justify-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            กำลังโหลดข้อมูลจริงจากฐานข้อมูล...
          </div>
        ) : (
        <>
        {/* Stats Grid — real counts from Supabase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-display text-white mb-1">{(stats?.totalUsers ?? 0).toLocaleString()}</p>
            <p className="text-body-sm text-gray-400">Total Users</p>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-display text-white mb-1">{(stats?.totalMerchants ?? 0).toLocaleString()}</p>
            <p className="text-body-sm text-gray-400">Registered Merchants</p>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Image className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-display text-white mb-1">{(stats?.totalPromotions ?? 0).toLocaleString()}</p>
            <p className="text-body-sm text-gray-400">Live Promotions</p>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <p className="text-display text-white mb-1">{(stats?.totalRedemptions ?? 0).toLocaleString()}</p>
            <p className="text-body-sm text-gray-400">Rewards Redeemed</p>
          </div>
        </div>

        {/* Quick Actions — badges show real counts (0 = feature not wired to a real queue yet) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/admin/moderation"
            className="bg-gradient-to-br from-red-500 to-orange-600 rounded-xl p-8 hover:shadow-2xl hover:shadow-red-500/20 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <Flag className="w-10 h-10 text-white" />
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                0 Pending
              </span>
            </div>
            <h3 className="text-h2 text-white mb-2">Moderation Queue</h3>
            <p className="text-red-100 mb-4">
              ยังไม่มีระบบส่งโพสต์เข้าคิวตรวจสอบจริง — โพสต์คอมมูนิตี้ตอนนี้เผยแพร่ทันทีโดยไม่ผ่านการอนุมัติ
            </p>
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
                0 Active
              </span>
            </div>
            <h3 className="text-h2 text-white mb-2">Hero Banners</h3>
            <p className="text-blue-100 mb-4">
              ยังไม่มีตารางเก็บ banner จริงในฐานข้อมูล — หน้านี้ยังเป็น state ในเครื่องเท่านั้น
            </p>
            <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
              <span>Manage Banners</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        </div>

        {/* System Health — one real check, no fabricated latency/uptime numbers */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-h3 text-white mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-400" />
            System Health
          </h3>

          <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {dbHealthy ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <div>
                <p className="text-body-sm text-gray-400">Supabase Database</p>
                <p className="text-h4 text-white">
                  {dbHealthy ? 'เชื่อมต่อสำเร็จ' : 'เชื่อมต่อไม่สำเร็จ / ยังไม่ได้ตั้งค่า'}
                </p>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${dbHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          </div>
          <p className="text-caption text-gray-500 mt-3">
            ตรวจจากการ query จริงตอนโหลดหน้านี้ — ไม่มีระบบ APM/CDN monitoring แยกต่างหาก จึงไม่แสดงตัวเลข latency/uptime ปลอม
          </p>
        </div>

        {/* Recent Activity — real events from merchant_profiles / community_posts / voucher_redemptions */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
          <h3 className="text-h3 text-white mb-6">Recent Activity</h3>

          {activity.length === 0 ? (
            <div className="py-10 text-center">
              <Activity className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">ยังไม่มีกิจกรรมล่าสุด</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.map((a) => {
                const { icon: Icon, color } = KIND_ICON[a.kind];
                return (
                  <div key={a.id} className="flex items-start gap-4 bg-gray-900 rounded-lg p-4">
                    <div className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white mb-1">{a.label}</p>
                      <p className="text-body-sm text-gray-400 truncate">{a.detail}</p>
                    </div>
                    <span className="text-caption text-gray-500 flex-shrink-0">{timeAgo(a.time)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </AdminLayout>
  );
}
