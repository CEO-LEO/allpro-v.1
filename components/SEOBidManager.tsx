'use client';

import { Search, Target, Crown, AlertCircle } from 'lucide-react';

export default function SEOBidManager() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-[#FF5722]" />
            SEO Bid Manager
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            พร้อมสำหรับการเชื่อมต่อข้อมูลจริงของระบบ SEO Bidding
          </p>
        </div>
        <Crown className="w-8 h-8 text-yellow-500" />
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 font-medium mb-1">💡 ระบบ SEO Bidding พร้อมใช้งาน</p>
            <p className="text-xs text-blue-700">
              เมื่อเชื่อมต่อข้อมูลจริงแล้ว คุณจะสามารถค้นหาและเลือก Keyword เพื่อเริ่มประมูลได้ทันที
            </p>
          </div>
        </div>
      </div>

      {/* Empty Ready State */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">ค้นหา Keyword</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="พิมพ์คำค้นหา เช่น กาแฟ, โปรตีน, ข้าวกล่อง"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
          />
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <p className="text-lg font-semibold text-gray-800 mb-2">
            🔍 ค้นหาและเลือก Keyword เพื่อเริ่มการประมูล (Bidding) และเพิ่มยอดขายของคุณ
          </p>
          <p className="text-sm text-gray-500">
            ยังไม่มีข้อมูลประวัติการประมูลในระบบ ข้อมูลจะแสดงที่นี่เมื่อเริ่มใช้งานจริง
          </p>
        </div>
      </div>
    </div>
  );
}
