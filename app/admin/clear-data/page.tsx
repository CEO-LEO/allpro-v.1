'use client';

import { useEffect, useState } from 'react';
import { useProductStore } from '@/store/useProductStore';

export default function ClearDataPage() {
  const resetProducts = useProductStore((s) => s.resetProducts);
  const products = useProductStore((s) => s.products);
  const [cleared, setCleared] = useState(false);

  const handleClear = () => {
    // Clear Zustand persisted store
    resetProducts();
    // Also clear raw localStorage keys
    if (typeof window !== 'undefined') {
      localStorage.removeItem('product-storage');
      localStorage.removeItem('auth-storage');
    }
    setCleared(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">🗑️ Clear All Data</h1>
        
        <div className="text-sm text-slate-500 space-y-1">
          <p>Products in local store: <strong className="text-slate-900">{products.length}</strong></p>
        </div>

        {!cleared ? (
          <button
            onClick={handleClear}
            className="w-full py-3 px-6 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all active:scale-95"
          >
            ลบข้อมูลทั้งหมด (Clear All)
          </button>
        ) : (
          <div className="space-y-4">
            <div className="py-3 px-6 bg-green-100 text-green-700 font-bold rounded-xl">
              ✅ เคลียร์ข้อมูลเรียบร้อยแล้ว!
            </div>
            <a
              href="/"
              className="block py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all"
            >
              กลับหน้าหลัก
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
