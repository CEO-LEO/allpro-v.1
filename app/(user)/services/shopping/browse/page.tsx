'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, DollarSign, Clock, User, Star, ArrowLeft, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

interface ShoppingRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  storeName: string;
  storeLocation: string;
  pickupLocation: string;
  budget: number;
  serviceFee: number;
  deadline: string;
  urgency: 'normal' | 'urgent' | 'asap';
  distance: number;
  requester: {
    name: string;
    avatar: string;
    rating: number;
    completedJobs: number;
  };
  postedAt: string;
}

export default function BrowseShoppingRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Mock data
  const mockRequests: ShoppingRequest[] = [
    {
      id: '1',
      title: 'ฝากซื้อไอศกรีม Haagen-Dazs จาก Tops',
      description: 'ต้องการรสสตรอว์เบอร์รี่ 2 กล่อง',
      category: 'food',
      storeName: 'Tops Central World',
      storeLocation: 'ชั้น B ห้าง Central World',
      pickupLocation: 'คอนโด The Address Asoke ชั้น 1',
      budget: 500,
      serviceFee: 50,
      deadline: '2026-02-04T18:00',
      urgency: 'urgent',
      distance: 2.5,
      requester: {
        name: 'Sarah K.',
        avatar: 'https://i.pravatar.cc/150?img=5',
        rating: 4.8,
        completedJobs: 24,
      },
      postedAt: '15 นาทีที่แล้ว',
    },
    {
      id: '2',
      title: 'ฝากซื้อเสื้อยืด Uniqlo สีขาว Size M',
      description: 'ต้องการเสื้อยืดคอกลมสีขาว ขนาด M จำนวน 3 ตัว',
      category: 'fashion',
      storeName: 'Uniqlo Siam Paragon',
      storeLocation: 'ชั้น 3 ห้าง Siam Paragon',
      pickupLocation: 'BTS สยาม ทางออก 4',
      budget: 900,
      serviceFee: 80,
      deadline: '2026-02-05T20:00',
      urgency: 'normal',
      distance: 1.8,
      requester: {
        name: 'Mike T.',
        avatar: 'https://i.pravatar.cc/150?img=12',
        rating: 4.9,
        completedJobs: 35,
      },
      postedAt: '1 ชั่วโมงที่แล้ว',
    },
    {
      id: '3',
      title: 'ฝากซื้อชาเขียว Matcha จากร้าน After You',
      description: 'ต้องการชาเขียวเย็น ไซส์ L ไม่ใส่น้ำตาล',
      category: 'food',
      storeName: 'After You Emquartier',
      storeLocation: 'ชั้น 1 Emquartier',
      pickupLocation: 'สำนักงาน Exchange Tower',
      budget: 150,
      serviceFee: 30,
      deadline: '2026-02-04T14:00',
      urgency: 'asap',
      distance: 0.8,
      requester: {
        name: 'Lisa W.',
        avatar: 'https://i.pravatar.cc/150?img=23',
        rating: 5.0,
        completedJobs: 12,
      },
      postedAt: '30 นาทีที่แล้ว',
    },
    {
      id: '4',
      title: 'ฝากซื้อหูฟัง AirPods Pro จาก Apple Store',
      description: 'ต้องการ AirPods Pro รุ่นล่าสุด ต้องการใบเสร็จด้วย',
      category: 'electronics',
      storeName: 'Apple IconSiam',
      storeLocation: 'ชั้น 3 IconSiam',
      pickupLocation: 'คอนโด Magnolias Waterfront',
      budget: 9900,
      serviceFee: 150,
      deadline: '2026-02-06T19:00',
      urgency: 'normal',
      distance: 3.2,
      requester: {
        name: 'David R.',
        avatar: 'https://i.pravatar.cc/150?img=33',
        rating: 4.7,
        completedJobs: 18,
      },
      postedAt: '2 ชั่วโมงที่แล้ว',
    },
  ];

  const categories = [
    { id: 'all', label: 'ทั้งหมด', emoji: '📦' },
    { id: 'food', label: 'อาหาร', emoji: '🍔' },
    { id: 'fashion', label: 'แฟชั่น', emoji: '👕' },
    { id: 'electronics', label: 'อิเล็กทรอนิกส์', emoji: '📱' },
    { id: 'beauty', label: 'ความงาม', emoji: '💄' },
    { id: 'home', label: 'บ้าน', emoji: '🏠' },
  ];

  const handleAcceptJob = (request: ShoppingRequest) => {
    toast.success('ยอมรับงานสำเร็จ! 🎉', {
      description: `กรุณาติดต่อ ${request.requester.name} เพื่อยืนยันรายละเอียด`,
      duration: 3000,
    });
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
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <Link
              href="/services/shopping"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              ย้อนกลับ
            </Link>
            <h1 className="text-3xl font-bold mb-2">งานฝากซื้อทั้งหมด 🛍️</h1>
            <p className="text-purple-100">เลือกงานที่สนใจและรับรายได้</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search & Filter */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
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

              {/* Sort */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="recent">ล่าสุด</option>
                  <option value="urgent">ด่วนที่สุด</option>
                  <option value="nearest">ใกล้ที่สุด</option>
                  <option value="highest">ค่าบริการสูงสุด</option>
                </select>
              </div>
            </div>

            {/* Category Filter */}
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

          {/* Request List */}
          <div className="space-y-4">
            {mockRequests
              .filter((req) =>
                selectedCategory === 'all' || req.category === selectedCategory
              )
              .map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getUrgencyBadge(request.urgency)}
                          <span className="text-sm text-gray-500">
                            {request.postedAt}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {request.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {request.description}
                        </p>
                      </div>
                    </div>

                    {/* Info Grid */}
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
                          <span>งบ: <strong>{request.budget} บาท</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span>ต้องการภายใน: {new Date(request.deadline).toLocaleString('th-TH')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{request.distance} km</span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-4" />

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      {/* Requester Info */}
                      <div className="flex items-center gap-3">
                        <img
                          src={request.requester.avatar}
                          alt={request.requester.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {request.requester.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span>{request.requester.rating}</span>
                            </div>
                            <span>·</span>
                            <span>{request.requester.completedJobs} งาน</span>
                          </div>
                        </div>
                      </div>

                      {/* Service Fee & Action */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">ค่าบริการ</p>
                          <p className="text-2xl font-bold text-green-600">
                            +{request.serviceFee} ฿
                          </p>
                        </div>
                        <button
                          onClick={() => handleAcceptJob(request)}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                        >
                          รับงาน
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Empty State */}
          {mockRequests.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ไม่มีงานในขณะนี้
              </h3>
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
