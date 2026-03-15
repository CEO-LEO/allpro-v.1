"use client";
import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Settings, LogOut, ChevronRight, Bell, HelpCircle, LayoutDashboard, Store } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
        <h2 className="text-xl font-bold text-slate-700">กรุณาเข้าสู่ระบบ</h2>
        <p className="text-slate-400 mb-6">เพื่อดูข้อมูลนักล่าของคุณ</p>
        {/* ในความเป็นจริง Navbar จะจัดการเรื่อง Login Modal ให้ */}
        <div className="text-sm text-orange-500">กดปุ่ม "เข้าสู่ระบบ" ที่มุมขวาบน</div>
      </div>
    );
  }

  // Determine if merchant or user
  const isMerchant = user.role === 'MERCHANT';

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Profile - Different for User vs Merchant */}
      <div className={`pt-12 pb-20 px-6 text-white rounded-b-[2.5rem] shadow-lg relative ${
        isMerchant 
          ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700' 
          : 'bg-gradient-to-br from-orange-500 to-red-600'
      }`}>
        <div className="flex items-center gap-4">
            <img src={user.avatar} alt="Profile" className="w-20 h-20 rounded-full border-4 border-white/30 shadow-md" />
            <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                    {isMerchant ? (
                      <div className="flex items-center gap-2">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-1">
                          <Store className="w-4 h-4" />
                          {user.verified ? 'Verified Merchant' : 'Merchant'}
                        </span>
                        {user.isPro && (
                          <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                            PRO
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                        Level {user.level} Hunter
                      </span>
                    )}
                </div>
            </div>
        </div>
        
        {/* Stats Card (Floating) - Different stats for User vs Merchant */}
        <div className="absolute -bottom-10 left-6 right-6 bg-white rounded-2xl p-4 shadow-xl flex justify-around text-center">
            {isMerchant ? (
              // Merchant Stats
              <>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Products</p>
                  <p className="text-2xl font-black text-blue-600">12</p>
                </div>
                <div className="w-px bg-slate-100"></div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Views</p>
                  <p className="text-2xl font-black text-purple-600">2.4K</p>
                </div>
                <div className="w-px bg-slate-100"></div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Revenue</p>
                  <p className="text-2xl font-black text-green-600">฿45K</p>
                </div>
              </>
            ) : (
              // User Stats
              <>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Coins</p>
                  <p className="text-2xl font-black text-yellow-500">{user.coins}</p>
                </div>
                <div className="w-px bg-slate-100"></div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">XP</p>
                  <p className="text-2xl font-black text-blue-500">{user.xp}</p>
                </div>
                <div className="w-px bg-slate-100"></div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Saved</p>
                  <p className="text-2xl font-black text-red-500">0</p>
                </div>
              </>
            )}
        </div>
      </div>

      {/* Menu List - Different for User vs Merchant */}
      <div className="mt-16 px-6 space-y-4">
        {isMerchant ? (
          // MERCHANT MENU
          <>
            {/* Dashboard Quick Access */}
            <Link href="/merchant/dashboard" className="block">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">Dashboard</p>
                    <p className="text-sm text-white/80">จัดการโปรโมชั่นและดูสถิติ</p>
                  </div>
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <MenuItem icon={Store} title="ตั้งค่าร้านค้า" href="/merchant/settings" />
              <MenuItem icon={Settings} title="การตั้งค่า" />
              <MenuItem icon={HelpCircle} title="ช่วยเหลือ" />
            </div>
          </>
        ) : (
          // USER MENU
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <MenuItem icon={Bell} title="การแจ้งเตือน" badge="2" />
            <MenuItem icon={Settings} title="ตั้งค่าบัญชี" />
            <MenuItem icon={HelpCircle} title="ช่วยเหลือ" />
          </div>
        )}
        

        <button 
            onClick={logout}
            className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 text-red-500 font-bold hover:bg-red-50 transition"
        >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
            </div>
            <span>ออกจากระบบ</span>
        </button>

        <p className="text-center text-xs text-slate-300 mt-8">
          Version 1.0.0 {isMerchant ? '(Merchant Edition)' : '(Hunter Build)'}
        </p>
      </div>
    </div>
  );
}

// Component ย่อยสำหรับเมนู
function MenuItem({ icon: Icon, title, badge, href }: any) {
    const content = (
        <div className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition border-b border-gray-50 last:border-0">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <Icon className="w-5 h-5" />
            </div>
            <span className="flex-1 text-left font-medium text-slate-700">{title}</span>
            {badge && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{badge}</span>}
            <ChevronRight className="w-5 h-5 text-slate-300" />
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }
    
    return <button className="w-full">{content}</button>;
}
