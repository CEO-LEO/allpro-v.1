'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, DollarSign, Clock, Camera, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

export default function PostShoppingRequestPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    storeName: '',
    storeLocation: '',
    pickupLocation: '',
    budget: '',
    deadline: '',
    urgency: 'normal',
    images: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show success toast
    toast.success('โพสต์งานฝากซื้อสำเร็จ! 🎉', {
      description: 'กำลังหาผู้รับงานให้คุณ...',
      duration: 3000,
    });

    // Reset form
    setTimeout(() => {
      window.location.href = '/services/shopping/browse';
    }, 1500);
  };

  const categories = [
    { id: 'food', label: 'อาหาร & เครื่องดื่ม', emoji: '🍔' },
    { id: 'fashion', label: 'เสื้อผ้า & แฟชั่น', emoji: '👕' },
    { id: 'electronics', label: 'อิเล็กทรอนิกส์', emoji: '📱' },
    { id: 'beauty', label: 'ความงาม', emoji: '💄' },
    { id: 'home', label: 'ของใช้ในบ้าน', emoji: '🏠' },
    { id: 'other', label: 'อื่นๆ', emoji: '📦' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-16">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white py-8">
          <div className="max-w-4xl mx-auto px-4">
            <Link
              href="/services/shopping"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              ย้อนกลับ
            </Link>
            <h1 className="text-3xl font-bold mb-2">โพสต์งานฝากซื้อ 🛍️</h1>
            <p className="text-purple-100">กรอกรายละเอียดสินค้าที่ต้องการฝากซื้อ</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: step === s ? 1.2 : 1,
                    backgroundColor: step >= s ? '#9333EA' : '#E5E7EB',
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    step >= s ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </motion.div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 ${
                      step > s ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      ข้อมูลพื้นฐาน
                    </h2>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่องาน *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="เช่น: ฝากซื้อไอศกรีม Haagen-Dazs จาก Tops"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      หมวดหมู่ *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, category: cat.id })
                          }
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.category === cat.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="text-3xl mb-2">{cat.emoji}</div>
                          <div className="text-sm font-medium text-gray-900">
                            {cat.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รายละเอียด *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="บอกรายละเอียดสินค้าให้ชัดเจน เช่น ขนาด สี จำนวน หรือข้อกำหนดพิเศษ"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.title || !formData.category || !formData.description}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    ถัดไป →
                  </button>
                </motion.div>
              )}

              {/* Step 2: Location & Budget */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      สถานที่และงบประมาณ
                    </h2>
                  </div>

                  {/* Store Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อร้านค้า *
                    </label>
                    <input
                      type="text"
                      value={formData.storeName}
                      onChange={(e) =>
                        setFormData({ ...formData, storeName: e.target.value })
                      }
                      placeholder="เช่น: Tops Central World"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Store Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      ที่ตั้งร้านค้า *
                    </label>
                    <input
                      type="text"
                      value={formData.storeLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, storeLocation: e.target.value })
                      }
                      placeholder="เช่น: ชั้น B ห้าง Central World"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Pickup Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      จุดรับสินค้า *
                    </label>
                    <input
                      type="text"
                      value={formData.pickupLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, pickupLocation: e.target.value })
                      }
                      placeholder="เช่น: คอนโด The Address Asoke ชั้น 1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      งบประมาณ (บาท) *
                    </label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({ ...formData, budget: e.target.value })
                      }
                      placeholder="500"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      ราคาสินค้าโดยประมาณ (ยังไม่รวมค่าบริการ)
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                      ← ย้อนกลับ
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!formData.storeName || !formData.storeLocation || !formData.pickupLocation || !formData.budget}
                      className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      ถัดไป →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Deadline & Submit */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      กำหนดเวลาและรูปภาพ
                    </h2>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      ต้องการภายใน *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ความเร่งด่วน
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'normal', label: 'ปกติ', color: 'blue' },
                        { id: 'urgent', label: 'เร่งด่วน', color: 'orange' },
                        { id: 'asap', label: 'ด่วนมาก', color: 'red' },
                      ].map((urg) => (
                        <button
                          key={urg.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, urgency: urg.id })
                          }
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.urgency === urg.id
                              ? `border-${urg.color}-500 bg-${urg.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-medium">{urg.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Camera className="w-4 h-4 inline mr-1" />
                      รูปภาพ (ไม่บังคับ)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">คลิกเพื่ออัพโหลดรูปสินค้า</p>
                      <p className="text-sm text-gray-400 mt-1">
                        รองรับ JPG, PNG (สูงสุด 5 รูป)
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <h3 className="font-bold text-gray-900 mb-3">สรุปงาน</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>งาน:</strong> {formData.title}</p>
                      <p><strong>หมวดหมู่:</strong> {categories.find(c => c.id === formData.category)?.label}</p>
                      <p><strong>ร้านค้า:</strong> {formData.storeName}</p>
                      <p><strong>งบประมาณ:</strong> {formData.budget} บาท</p>
                      <p><strong>รับที่:</strong> {formData.pickupLocation}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                      ← ย้อนกลับ
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      โพสต์งาน 🚀
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
