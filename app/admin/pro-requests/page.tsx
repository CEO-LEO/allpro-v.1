'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Crown, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface RequestRow {
  id: string;
  merchant_id: string;
  billing_cycle: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  shopName: string;
  email: string;
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pending: { label: 'รอตรวจสอบ', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  approved: { label: 'อนุมัติแล้ว', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  rejected: { label: 'ปฏิเสธแล้ว', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export default function AdminProRequestsPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const load = useCallback(async (currentFilter: 'pending' | 'all') => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    let query = supabase
      .from('pro_upgrade_requests')
      .select('id, merchant_id, billing_cycle, price, status, admin_note, created_at, reviewed_at')
      .order('created_at', { ascending: false });

    if (currentFilter === 'pending') {
      query = query.eq('status', 'pending');
    }

    const { data, error } = await query;
    if (error) {
      console.error('[AdminProRequests] load error:', error.message);
      setIsLoading(false);
      return;
    }

    const merchantIds = Array.from(new Set((data || []).map((r) => r.merchant_id)));
    const profileById = new Map<string, { email: string | null; username: string | null }>();
    const shopNameById = new Map<string, string>();

    if (merchantIds.length > 0) {
      const [{ data: profiles }, { data: merchantProfiles }] = await Promise.all([
        supabase.from('profiles').select('id, email, username').in('id', merchantIds),
        supabase.from('merchant_profiles').select('user_id, shop_name').in('user_id', merchantIds),
      ]);
      (profiles || []).forEach((p) => profileById.set(p.id, p));
      (merchantProfiles || []).forEach((m) => shopNameById.set(m.user_id, m.shop_name || ''));
    }

    setRequests(
      (data || []).map((r) => ({
        ...r,
        shopName: shopNameById.get(r.merchant_id) || '-',
        email: profileById.get(r.merchant_id)?.email || profileById.get(r.merchant_id)?.username || '-',
      }))
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  const handleReview = async (requestId: string, approve: boolean) => {
    if (approve || confirm('ยืนยันปฏิเสธคำขอนี้?')) {
      setBusyId(requestId);
      try {
        const { data, error } = await supabase.rpc('review_pro_upgrade_request', {
          p_request_id: requestId,
          p_approve: approve,
          p_admin_note: null,
        });
        if (error) {
          toast.error('เกิดข้อผิดพลาด: ' + error.message);
          return;
        }
        const row = Array.isArray(data) ? data[0] : data;
        if (row?.success) {
          toast.success(row.message);
          load(filter);
        } else {
          toast.error(row?.message || 'เกิดข้อผิดพลาด');
        }
      } finally {
        setBusyId(null);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="mb-6">
          <h1 className="text-h1 text-white mb-2 flex items-center gap-3">
            <Crown className="w-7 h-7 text-yellow-400" /> คำขออัพเกรด Pro
          </h1>
          <p className="text-gray-400">รายการคำขอจริงจากตาราง pro_upgrade_requests</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            รอตรวจสอบ
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            ทั้งหมด
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            ไม่มีคำขอ{filter === 'pending' ? 'ที่รอตรวจสอบ' : ''}
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_LABEL[r.status].className}`}>
                        {STATUS_LABEL[r.status].label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(r.created_at).toLocaleString('th-TH')}
                      </span>
                    </div>
                    <p className="text-white font-bold">{r.shopName}</p>
                    <p className="text-sm text-gray-400">{r.email}</p>
                    <p className="text-sm text-gray-300 mt-1">
                      แพ็กเกจ {r.billing_cycle === 'monthly' ? 'รายเดือน' : 'รายปี'} — ฿{Number(r.price).toLocaleString()}
                    </p>
                  </div>

                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(r.id, true)}
                        disabled={busyId === r.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        {busyId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => handleReview(r.id, false)}
                        disabled={busyId === r.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        ปฏิเสธ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
