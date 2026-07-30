'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, MapPin, DollarSign, Clock, ArrowLeft, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import {
  fetchOpenShoppingRequests,
  acceptShoppingRequest,
  type ShoppingRequest,
} from '@/lib/shoppingService';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'เมื่อสักครู่';
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return `${Math.floor(hours / 24)} วันที่แล้ว`;
}

export default function BrowseShoppingRequestsPage() {
  const { isAuthenticated } = useAuthStore();
  const [requests, setRequests] = useState<ShoppingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'urgent' | 'highest'>('recent');

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchOpenShoppingRequests();
    setRequests(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const categories = [
    { id: 'all', label: 'ทั้งหมด', emoji: '📦' },
    { id: 'food', label: 'อาหาร', emoji: '🍔' },
    { id: 'fashion', label: 'แฟชั่น', emoji: '👕' },
    { id: 'electronics', label: 'อิเล็กทรอนิกส์', emoji: '📱' },
    { id: 'beauty', label: 'ความงาม', emoji: '💄' },
    { id: 'home', label: 'บ้าน', emoji: '🏠' },
    { id: 'other', label: 'อื่นๆ', emoji: '📦' },
  ];

  const urgencyRank = { asap: 0, urgent: 1, normal: 2 } as const;

  const visibleRequests = useMemo(() => {
    let list = requests.filter(
      (req) => selectedCategory === 'all' || req.category === selectedCategory
    );
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (req) =>
          req.title.toLowerCase().includes(q) ||
          req.storeName.toLowerCase().includes(q) ||
          req.description.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      if (sortBy === 'urgent') return urgencyRank[a.urgency] - urgencyRank[b.urgency];
      if (sortBy === 'highest') return b.serviceFee - a.serviceFee;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [requests, selectedCategory, searchQuery, sortBy]);

  const handleAcceptJob = async (request: ShoppingRequest) => {
    if (!isAuthenticated) {
      toast.error('กรุณาเข้าสู่ระบบก่อนรับงาน');
      return;
    }
    setAcceptingId(request.id);
    try {
      const result = await acceptShoppingRequest(request.id);
      if (result.success) {
        toast.success(result.message, {
          description: request.requester?.phone
            ? `ติดต่อผู้โพสต์: ${request.requester.phone}`
            : 'ดูรายละเอียดการติดต่อได้ที่หน้า "งานที่รับ"',
          duration: 4000,
        });
        setRequests((prev) => prev.filter((r) => r.id !== request.id));
      } else {
        toast.error(result.message);
        // Someone else may have taken it already — refresh the real list
        loadRequests();
      }
    } finally {
      setAcceptingId(null);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'asap':
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
            🔥 ด่วนมาก
          </span>
        );
      case 'urgent':
        return (
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
            ⚡ เร่งด่วน
          </span>
        );
      default:
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            📅 ปกติ
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-16">
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <Link
              href="/services/shopping"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              ย้อนกลับ
            </Link>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">งานฝากซื้อทั้งหมด 🛍️</h1>
                <p className="text-purple-100">เลือกงานที่สนใจและรับรายได้</p>
              </div>
              <Link
                href="/services/shopping/my-jobs"
                className="bg-white/15 hover:bg-white/25 backdrop-blur-sm px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                งานที่ฉันรับ →
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหางาน..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="recent">ล่าสุด</option>
                  <option value="urgent">ด่วนที่สุด</option>
                  <option value="highest">ค่าบริการสูงสุด</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {visibleRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getUrgencyBadge(request.urgency)}
                            <span className="text-sm text-gray-500">
                              {timeAgo(request.createdAt)}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {request.title}
                          </h3>
                          <p className="text-gray-600 mb-3">{request.description}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ShoppingBag className="w-4 h-4 text-purple-600" />
                            <span className="font-medium">{request.storeName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <span>{request.storeLocation}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span>รับที่: {request.pickupLocation}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span>งบ: <strong>{request.budget.toLocaleString()} บาท</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span>ต้องการภายใน: {new Date(request.deadline).toLocaleString('th-TH')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 my-4" />

                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          {request.requester?.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={request.requester.avatar}
                              alt={request.requester.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                              {(request.requester?.name || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {request.requester?.name || 'ผู้ใช้'}
                            </p>
                            <p className="text-xs text-gray-500">ผู้โพสต์งาน</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">ค่าบริการ</p>
                            <p className="text-2xl font-bold text-green-600">
                              +{request.serviceFee.toLocaleString()} ฿
                            </p>
                          </div>
                          <button
                            onClick={() => handleAcceptJob(request)}
                            disabled={acceptingId === request.id}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center gap-2"
                          >
                            {acceptingId === request.id && <Loader2 className="w-4 h-4 animate-spin" />}
                            รับงาน
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!isLoading && visibleRequests.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">ไม่มีงานในขณะนี้</h3>
              <p className="text-gray-600 mb-6">
                ลองเปลี่ยนตัวกรองหรือกลับมาตรวจสอบใหม่ภายหลัง
              </p>
              <Link
                href="/services/shopping/post"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors"
              >
                หรือโพสต์งานของคุณเอง
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
