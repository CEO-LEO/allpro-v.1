"use client";
import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';
import { QrCode, Trash2, ArrowRight } from 'lucide-react';

export default function WalletPage() {
  const { savedProductIds, products, toggleSave } = useAppStore();

  // กรองเอาเฉพาะสินค้าที่อยู่ในรายการ savedProductIds
  const savedProducts = products.filter((p) => savedProductIds.includes(p.id));

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-24">
      <h1 className="text-2xl font-black text-slate-800 mb-6">กระเป๋าคูปองของฉัน 💼</h1>

      {savedProducts.length > 0 ? (
        <div className="space-y-4">
          {savedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4">
              {/* Thumbnail */}
              <img src={product.image} alt={product.title} className="w-20 h-20 rounded-xl object-cover bg-gray-200" />
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 line-clamp-1">{product.title}</h3>
                  <p className="text-xs text-slate-400">{product.shopName}</p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-red-500 font-bold">฿{product.promoPrice}</span>
                  
                  <div className="flex gap-2">
                    {/* ปุ่มลบ */}
                    <button 
                      onClick={() => toggleSave(product.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {/* ปุ่มใช้คูปอง */}
                    <Link 
                      href={`/wallet/use/${product.id}`}
                      className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 shadow-md hover:bg-orange-600 active:scale-95 transition"
                    >
                      <QrCode className="w-4 h-4" /> ใช้คูปอง
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State (ถ้าไม่มีของ)
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <QrCode className="w-10 h-10 text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">กระเป๋ายังว่างอยู่</h3>
          <p className="text-slate-400 mb-6">ไปล่าโปรโมชั่นเด็ดๆ มาเก็บไว้ก่อนสิ!</p>
          <Link href="/" className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-slate-800">
            ไปหน้าแรก <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
