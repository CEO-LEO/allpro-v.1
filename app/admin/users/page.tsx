'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Users, Search, Loader2, Store, ShieldCheck, User as UserIcon } from 'lucide-react';

interface ProfileRow {
  id: string;
  email: string | null;
  username: string | null;
  role: string | null;
  coins: number | null;
  xp: number | null;
  level: number | null;
  created_at: string | null;
}

const PAGE_SIZE = 50;

const ROLE_BADGE: Record<string, { label: string; className: string; icon: typeof UserIcon }> = {
  ADMIN: { label: 'Admin', className: 'bg-red-500/20 text-red-400 border-red-500/30', icon: ShieldCheck },
  MERCHANT: { label: 'Merchant', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Store },
  USER: { label: 'User', className: 'bg-gray-700 text-gray-300 border-gray-600', icon: UserIcon },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  const load = useCallback(async (pageIndex: number, term: string) => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    let query = supabase
      .from('profiles')
      .select('id, email, username, role, coins, xp, level, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE - 1);

    if (term.trim()) {
      query = query.or(`email.ilike.%${term.trim()}%,username.ilike.%${term.trim()}%`);
    }

    const { data, count, error } = await query;
    if (error) {
      console.error('[AdminUsers] load error:', error.message);
    } else {
      setUsers(data || []);
      setTotalCount(count ?? 0);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setPage(0);
    load(0, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    load(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = totalCount !== null ? Math.max(1, Math.ceil(totalCount / PAGE_SIZE)) : 1;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="mb-6">
          <h1 className="text-h1 text-white mb-2 flex items-center gap-3">
            <Users className="w-7 h-7 text-purple-400" /> User Management
          </h1>
          <p className="text-gray-400">
            รายชื่อผู้ใช้จริงจากตาราง profiles {totalCount !== null && `— ทั้งหมด ${totalCount.toLocaleString()} คน`}
          </p>
        </div>

        <div className="relative mb-4 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาด้วยอีเมลหรือชื่อผู้ใช้..."
            className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </div>

        <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex items-center justify-center text-gray-500">
              <Loader2 className="w-7 h-7 animate-spin mr-3" /> กำลังโหลด...
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 text-center text-gray-500">ไม่พบผู้ใช้</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-left">
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Username</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium text-right">Coins</th>
                    <th className="px-4 py-3 font-medium text-right">XP</th>
                    <th className="px-4 py-3 font-medium text-right">Level</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const badge = ROLE_BADGE[u.role || 'USER'] || ROLE_BADGE.USER;
                    const BadgeIcon = badge.icon;
                    return (
                      <tr key={u.id} className="border-b border-gray-900 hover:bg-gray-900/50">
                        <td className="px-4 py-3 text-white">{u.email || '—'}</td>
                        <td className="px-4 py-3 text-gray-300">{u.username || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
                            <BadgeIcon className="w-3 h-3" /> {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-yellow-400">{(u.coins ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-blue-400">{(u.xp ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-gray-300">{u.level ?? 1}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('th-TH') : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              ก่อนหน้า
            </button>
            <span className="text-gray-400 text-sm">หน้า {page + 1} จาก {totalPages}</span>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
