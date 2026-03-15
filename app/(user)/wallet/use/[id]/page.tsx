"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { X, Clock } from 'lucide-react';

export default function UseCouponPage() {
  const router = useRouter();
  const { id } = useParams();
  const product = useAppStore((state) => state.getProductById(id as string));
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 นาที

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

  if (!product) return null;

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
          
          <p className="text-slate-400 text-sm mt-4">รหัสอ้างอิง: {product.id.toUpperCase()}-{Math.floor(Math.random() * 9999)}</p>
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
