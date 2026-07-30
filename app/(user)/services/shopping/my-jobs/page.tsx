'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, MapPin, DollarSign, Clock, ArrowLeft, Loader2, Phone, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import {
  fetchMyAcceptedJobs,
  completeShoppingRequest,
  getCompletedJobCount,
  type ShoppingRequest,
  type ShoppingRequestStatus,
} from '@/lib/shoppingService';

const STATUS_LABEL: Record<ShoppingRequestStatus, { label: string; className: string }> = {
  open: { label: 'เปิดรับ', className: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'กำลังดำเนินการ', className: 'bg-purple-100 text-purple-700' },
  completed: { label: 'ส่งมอบสำเร็จ', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'ยกเลิกแล้ว', className: 'bg-gray-100 text-gray-500' },
};

export default function MyShoppingJobsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [jobs, setJobs] = useState<ShoppingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchMyAcceptedJobs();
    setJobs(data);
    if (user?.id) {
      setCompletedCount(await getCompletedJobCount(user.id));
    }
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleComplete = async (job: ShoppingRequest) => {
    if (!confirm('ยืนยันว่าส่งมอบสินค้าเรียบร้อยแล้ว?')) return;
    setBusyId(job.id);
    try {
      const result = await completeShoppingRequest(job.id);
      if (result.success) {
        toast.success(result.message);
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, status: 'completed' } : j))
        );
        setCompletedCount((c) => c + 1);
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
        <p className="text-sm text-gray-500 mb-6">เพื่อดูงานที่คุณรับ</p>
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
              href="/services/shopping/browse"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              ย้อนกลับ
            </Link>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">งานที่ฉันรับ 🚚</h1>
                <p className="text-purple-100">
                  ส่งมอบสำเร็จแล้ว {completedCount} งาน
                </p>
              </div>
              <Link
                href="/services/shopping/browse"
                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold hover:bg-purple-50 transition-colors text-sm"
              >
                หางานเพิ่ม
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">ยังไม่มีงานที่รับ</h3>
              <Link
                href="/services/shopping/browse"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors mt-2"
              >
                ไปหางานฝากซื้อ
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${STATUS_LABEL[job.status].className}`}
                          >
                            {STATUS_LABEL[job.status].label}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{job.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-500">ค่าบริการ</p>
                          <p className="text-xl font-bold text-green-600">+{job.serviceFee.toLocaleString()} ฿</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-purple-600" />
                          <span>{job.storeName} — {job.storeLocation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span>งบสินค้า {job.budget.toLocaleString()} บาท</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>ส่งที่: {job.pickupLocation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span>ภายใน: {new Date(job.deadline).toLocaleString('th-TH')}</span>
                        </div>
                      </div>

                      {job.requester && (
                        <div className="bg-purple-50 rounded-lg p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            {job.requester.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={job.requester.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold">
                                {job.requester.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{job.requester.name}</p>
                              <p className="text-xs text-gray-500">ผู้โพสต์งาน</p>
                            </div>
                          </div>
                          {job.requester.phone && (
                            <a
                              href={`tel:${job.requester.phone}`}
                              className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700"
                            >
                              <Phone className="w-4 h-4" />
                              {job.requester.phone}
                            </a>
                          )}
                        </div>
                      )}

                      {job.status === 'accepted' && (
                        <button
                          onClick={() => handleComplete(job)}
                          disabled={busyId === job.id}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {busyId === job.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5" />
                          )}
                          ยืนยันส่งมอบสินค้าแล้ว
                        </button>
                      )}

                      {job.status === 'completed' && (
                        <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3">
                          ✅ ส่งมอบสำเร็จแล้ว — อย่าลืมเก็บเงินจากผู้โพสต์หากยังไม่ได้รับ
                        </p>
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
