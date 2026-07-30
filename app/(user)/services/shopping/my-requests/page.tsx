'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, MapPin, DollarSign, Clock, ArrowLeft, Loader2, Phone } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import {
  fetchMyPostedRequests,
  cancelShoppingRequest,
  type ShoppingRequest,
  type ShoppingRequestStatus,
} from '@/lib/shoppingService';

const STATUS_LABEL: Record<ShoppingRequestStatus, { label: string; className: string }> = {
  open: { label: 'รอคนรับงาน', className: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'มีคนรับงานแล้ว', className: 'bg-purple-100 text-purple-700' },
  completed: { label: 'ส่งมอบสำเร็จ', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'ยกเลิกแล้ว', className: 'bg-gray-100 text-gray-500' },
};

export default function MyShoppingRequestsPage() {
  const { isAuthenticated } = useAuthStore();
  const [requests, setRequests] = useState<ShoppingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchMyPostedRequests();
    setRequests(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (request: ShoppingRequest) => {
    if (!confirm('ยืนยันยกเลิกงานนี้?')) return;
    setBusyId(request.id);
    try {
      const result = await cancelShoppingRequest(request.id);
      if (result.success) {
        toast.success(result.message);
        setRequests((prev) =>
          prev.map((r) => (r.id === request.id ? { ...r, status: 'cancelled' } : r))
        );
      } else {
        toast.error(result.message);
      }
    } finally {
      setBusyId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">กรุณาเข้าสู่ระบบ</h2>
        <p className="text-sm text-gray-500 mb-6">เพื่อดูงานที่คุณโพสต์</p>
        <Link href="/services/shopping" className="text-purple-600 font-semibold hover:underline">
          กลับหน้าบริการฝากหิ้ว
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-16">
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white py-8">
          <div className="max-w-4xl mx-auto px-4">
            <Link
              href="/services/shopping"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              ย้อนกลับ
            </Link>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">งานที่ฉันโพสต์ 📋</h1>
                <p className="text-purple-100">ติดตามสถานะงานฝากซื้อของคุณ</p>
              </div>
              <Link
                href="/services/shopping/post"
                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold hover:bg-purple-50 transition-colors text-sm"
              >
                + โพสต์งานใหม่
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">ยังไม่มีงานที่โพสต์</h3>
              <Link
                href="/services/shopping/post"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors mt-2"
              >
                โพสต์งานแรกของคุณ
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {requests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${STATUS_LABEL[request.status].className}`}
                          >
                            {STATUS_LABEL[request.status].label}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900">{request.title}</h3>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-purple-600" />
                          <span>{request.storeName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span>งบ {request.budget.toLocaleString()} บาท + ค่าบริการ {request.serviceFee.toLocaleString()} บาท</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>รับที่: {request.pickupLocation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span>ภายใน: {new Date(request.deadline).toLocaleString('th-TH')}</span>
                        </div>
                      </div>

                      {request.status === 'accepted' && request.runner && (
                        <div className="bg-purple-50 rounded-lg p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            {request.runner.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={request.runner.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold">
                                {request.runner.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{request.runner.name}</p>
                              <p className="text-xs text-gray-500">คนหิ้วที่รับงานนี้</p>
                            </div>
                          </div>
                          {request.runner.phone && (
                            <a
                              href={`tel:${request.runner.phone}`}
                              className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700"
                            >
                              <Phone className="w-4 h-4" />
                              {request.runner.phone}
                            </a>
                          )}
                        </div>
                      )}

                      {request.status === 'completed' && (
                        <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3 mb-4">
                          ✅ ส่งมอบสำเร็จแล้ว — อย่าลืมจ่ายเงินให้คนหิ้วหากยังไม่ได้จ่าย
                        </p>
                      )}

                      {(request.status === 'open' || request.status === 'accepted') && (
                        <button
                          onClick={() => handleCancel(request)}
                          disabled={busyId === request.id}
                          className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          {busyId === request.id && <Loader2 className="w-4 h-4 animate-spin" />}
                          ยกเลิกงานนี้
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
