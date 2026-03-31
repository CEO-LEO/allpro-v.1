"use client";
import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Bell, Search, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const { user, loginAsUser, loginAsMerchant, logout } = useAppStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex justify-between items-center max-w-md mx-auto">
          {/* Logo */}
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            ALL PRO
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="bg-yellow-100 px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="text-xs font-bold text-yellow-700">🪙 {user.coins ?? 0}</span>
                </div>
                <Link href="/notifications" className="p-2 text-gray-600 hover:text-orange-500 relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>
                <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200" />
              </>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="bg-black text-white text-sm px-4 py-2 rounded-full font-bold hover:bg-gray-800 transition"
              >
                เข้าสู่ระบบ
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Login Modal (Simple Version) */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl animate-in fade-in zoom-in">
            <h2 className="text-xl font-bold mb-4">ยินดีต้อนรับนักล่า! 🏹</h2>
            <div className="space-y-3">
              <button
                onClick={() => { loginAsUser(); setIsLoginOpen(false); }}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600"
              >
                เข้าใช้งานลูกค้า (User)
              </button>
              <button
                onClick={() => { loginAsMerchant(); setIsLoginOpen(false); }}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700"
              >
                เข้าใช้งานร้านค้า (Merchant)
              </button>
            </div>
            <button onClick={() => setIsLoginOpen(false)} className="mt-4 text-gray-400 text-sm underline">
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </>
  );
}
