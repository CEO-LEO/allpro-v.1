"use client";
import React, { useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Heart, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import LoginModal from '@/components/Auth/LoginModal';

export default function SavedPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { products, savedProductIds, toggleSave } = useProductStore();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check authentication
  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Heart className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">กรุณาเข้าสู่ระบบ</h2>
            <p className="text-gray-600 mb-8">เข้าสู่ระบบเพื่อบันทึกโปรโมชั่นที่ชอบ</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
            >
              เข้าสู่ระบบ
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    );
  }

  // Filter saved products
  const savedProducts = products.filter(p => savedProductIds.includes(p.id));

  const handleRemove = (id: string, title: string) => {
    toggleSave(id);
    toast.success(`💔 ลบ "${title}" ออกจากรายการแล้ว`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-28">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 flex items-center gap-3">
            <Heart className="text-red-500 fill-red-500" size={36} /> 
            รายการที่บันทึก
          </h1>
          <p className="text-gray-600">โปรโมชั่นทั้งหมดที่คุณกดหัวใจไว้</p>
        </div>

        {savedProducts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-gray-100">
              <Heart size={40} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">ยังไม่มีโปรที่ถูกใจ</h2>
            <p className="text-gray-500 mb-8">เจอโปรเด็ดๆ อย่าลืมกดหัวใจไว้นะ!</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all text-lg"
            >
              ไปดูโปรโมชั่น 
              <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProducts.map((product) => {
              const savings = product.originalPrice - product.promoPrice;
              const discountPercent = Math.round((savings / product.originalPrice) * 100);

              return (
                <div key={product.id} className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-gray-100 group">
                  {/* Product Image */}
                  <Link href={`/product/${product.id}`} className="relative block">
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Discount Badge */}
                      {discountPercent > 0 && (
                        <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg text-sm">
                          -{discountPercent}%
                        </div>
                      )}
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-700">
                        {product.category}
                      </div>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-5">
                    {/* Shop Name */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs">
                        🏪
                      </div>
                      <span className="text-xs font-bold text-orange-700">{product.shopName}</span>
                    </div>

                    {/* Title */}
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-bold text-slate-900 text-lg line-clamp-2 mb-3 hover:text-orange-600 transition-colors leading-snug">
                        {product.title}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-black text-red-600">฿{product.promoPrice}</span>
                      {product.originalPrice > product.promoPrice && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 line-through">฿{product.originalPrice}</span>
                          <span className="text-[10px] text-red-500 font-bold">ประหยัด ฿{savings}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link 
                        href={`/product/${product.id}`}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-bold text-center hover:from-orange-600 hover:to-red-700 transition-all shadow-md text-sm"
                      >
                        ดูรายละเอียด
                      </Link>
                      <button
                        onClick={() => handleRemove(product.id, product.title)}
                        className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                        title="ลบออกจากรายการ"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {savedProducts.length > 0 && (
          <div className="mt-12 bg-white rounded-3xl shadow-lg p-8 border-2 border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">รวมทั้งหมด</p>
                <p className="text-3xl font-black text-slate-900">{savedProducts.length} รายการ</p>
              </div>
              <Heart className="text-red-500 fill-red-500" size={48} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
