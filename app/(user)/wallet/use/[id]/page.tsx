"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProductStore } from '@/store/useProductStore';
import { getPromotionById } from '@/lib/getPromotions';
import { X, Clock, Loader2 } from 'lucide-react';

interface CouponProduct {
  id: string;
  shopName: string;
  title: string;
}

export default function UseCouponPage() {
  const router = useRouter();
  const { id } = useParams();
  const decodedId = decodeURIComponent(id as string);
  const [product, setProduct] = useState<CouponProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 นาที
  const [refCode] = useState(() => `${Math.floor(1000 + Math.random() * 9000)}`);

  // Find product from multiple sources
  useEffect(() => {
    async function findProduct() {
      // Source 1: Zustand product store
      const storeProduct = useProductStore.getState().products.find(p => p.id === decodedId);
      if (storeProduct) {
        setProduct({ id: storeProduct.id, shopName: storeProduct.shopName, title: storeProduct.title });
        setLoading(false);
        return;
      }

      // Source 2: Static promotions
      const staticPromo = getPromotionById(decodedId);
      if (staticPromo) {
        setProduct({ id: staticPromo.id, shopName: staticPromo.shop_name, title: staticPromo.title });
        setLoading(false);
        return;
      }

      // Source 3: API fallback
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(decodedId)}`);
        const json = await res.json();
        if (json.data) {
          setProduct({
            id: String(json.data.id),
            shopName: String(json.data.shop_name || json.data.shopName || 'ร้านค้า'),
            title: String(json.data.title || ''),
          });
        }
      } catch {}

      setLoading(false);
    }
    findProduct();
  }, [decodedId]);

  // นับถอยหลัง
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // จัดรูปแบบเวลา MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-white/70 mb-4">ไม่พบคูปองนี้</p>
        <button onClick={() => router.push('/wallet')} className="text-orange-400 underline">กลับกระเป๋า</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative">
      {/* ปุ่มปิด */}
      <button 
        onClick={() => router.back()} 
        className="absolute top-6 right-6 text-white/50 hover:text-white"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Header สีส้ม */}
        <div className="bg-orange-500 p-6 text-center">
          <h2 className="text-white font-bold text-lg opacity-90">ยื่นให้พนักงานสแกน</h2>
          <p className="text-white text-2xl font-black mt-1">{product.shopName}</p>
        </div>

        {/* QR Code Area */}
        <div className="p-8 flex flex-col items-center">
          <div className="w-64 h-64 bg-slate-100 rounded-xl flex items-center justify-center border-4 border-slate-900 overflow-hidden relative group">
             {/* QR Code จำลอง (ใช้ CSS สร้างลาย) */}
             <div className="grid grid-cols-6 grid-rows-6 gap-1 w-48 h-48 opacity-80">
                {[...Array(36)].map((_, i) => (
                    <div key={i} className={`bg-black ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>
                ))}
             </div>
             {/* Logo ตรงกลาง */}
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="font-bold text-orange-500">AP</span>
                </div>
             </div>
          </div>
          
          <p className="text-slate-400 text-sm mt-4">รหัสอ้างอิง: {product.id.slice(0, 8).toUpperCase()}-{refCode}</p>
        </div>

        {/* Timer Bar */}
        <div className="bg-slate-50 p-4 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-red-500 font-bold">
                <Clock className="w-5 h-5" />
                <span>หมดอายุใน {formatTime(timeLeft)}</span>
            </div>
            <button 
                onClick={() => { alert('ใช้คูปองสำเร็จ!'); router.push('/wallet'); }}
                className="text-sm text-slate-400 underline hover:text-slate-600"
            >
                ทำรายการสำเร็จแล้ว
            </button>
        </div>
      </div>
    </div>
  );
}
