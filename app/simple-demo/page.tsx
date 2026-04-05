'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useSimpleStore';
import { resolveImageUrl } from '@/lib/imageUrl';

export default function SimpleDemo() {
  const { products, isLoading, fetchProducts, getProductById } = useAppStore();

  // ✨ ดึงข้อมูลตอนเข้าหน้าเว็บครั้งแรก
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 🔄 Loading State: ถ้ากำลังโหลด ให้หมุนติ้วๆ
  if (isLoading && products.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-orange-100 to-red-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mb-4"></div>
        <p className="text-h3 text-orange-600">กำลังโหลดโปรโมชั่นล่าสุด... ⏳</p>
        <p className="text-body-sm text-gray-500 mt-2">กำลังดึงข้อมูลจาก Supabase Cloud</p>
      </div>
    );
  }

  // 📭 Empty State: ถ้าไม่มีสินค้า
  if (!isLoading && products.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <p className="text-h2 text-gray-400 mb-4">😕 ไม่พบโปรโมชั่น</p>
        <p className="text-gray-500">ลองรัน SQL Schema ใน Supabase Dashboard</p>
      </div>
    );
  }

  // 🎉 Success State: แสดงสินค้า
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display-lg bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-4">
            🎯 Supabase Migration Demo
          </h1>
          <p className="text-h3 text-gray-600">
            ข้อมูลที่คุณเห็นนี้บินมาจาก <span className="font-bold text-orange-500">Supabase Cloud</span> จริงๆ! 🚀
          </p>
          <p className="text-body-sm text-gray-500 mt-2">
            ทั้งหมด {products.length} โปรโมชั่น
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300"
            >
              {/* Product Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={resolveImageUrl(product.image)}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full text-body-sm shadow-lg">
                  {product.category || 'โปรโมชั่น'}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-h2 text-gray-800 mb-2">
                  {product.title}
                </h3>
                <p className="text-gray-500 mb-4 line-clamp-2">
                  {product.description || 'ไม่มีรายละเอียด'}
                </p>

                {/* Shop Name */}
                <div className="flex items-center gap-2 mb-4 text-body-sm text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  <span className="font-medium">{product.shopName}</span>
                </div>

                {/* Prices */}
                <div className="flex items-end gap-3 mb-4">
                  <div className="text-display text-orange-500">
                    ฿{product.price.toLocaleString()}
                  </div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-h4 text-gray-400 line-through mb-1">
                      ฿{product.originalPrice.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Discount Badge */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="inline-block bg-red-100 text-red-600 px-4 py-2 rounded-full text-body-sm">
                    ประหยัด ฿{(product.originalPrice - product.price).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-2xl text-button hover:shadow-2xl transition-all">
                  ดูรายละเอียด 🔥
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-2xl shadow-lg px-8 py-6">
            <p className="text-body-sm text-gray-500 mb-2">✅ Data Source</p>
            <p className="text-h4 text-gray-800">Supabase PostgreSQL Database</p>
            <p className="text-body-sm text-orange-500 mt-2">Real-time sync • No mock data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
