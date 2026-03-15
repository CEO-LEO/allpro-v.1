'use client';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-16">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🎁</span>
              <span className="text-xl font-bold">All Pro</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              แพลตฟอร์มค้นหาโปรโมชั่นที่ใช้ Big Data และ AI
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <span>f</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <span>📷</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <span>🐦</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <span>▶️</span>
              </a>
            </div>
          </div>

          {/* โปรโมชัน */}
          <div>
            <h3 className="font-bold text-[#FF5722] mb-4">โปรโมชัน</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/" className="hover:text-white transition-colors">โปร 1 แถม 1</a></li>
              <li><a href="/" className="hover:text-white transition-colors">50% up</a></li>
              <li><a href="/" className="hover:text-white transition-colors">โปรมือถือ</a></li>
              <li><a href="/" className="hover:text-white transition-colors">โปรอาหาร</a></li>
              <li><a href="/" className="hover:text-white transition-colors">ตั๋วถูก</a></li>
              <li><a href="/" className="hover:text-white transition-colors">โค้ดส่วนลด</a></li>
            </ul>
          </div>

          {/* บทความ */}
          <div>
            <h3 className="font-bold text-[#FF5722] mb-4">บทความ</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/articles" className="hover:text-white transition-colors">Tips & Tricks</a></li>
              <li><a href="/articles" className="hover:text-white transition-colors">ข่าวโปรโมชั่น</a></li>
              <li><a href="/articles" className="hover:text-white transition-colors">Data Insights</a></li>
              <li><a href="/articles" className="hover:text-white transition-colors">สำหรับร้านค้า</a></li>
            </ul>
          </div>

          {/* บริการ */}
          <div>
            <h3 className="font-bold text-[#FF5722] mb-4">บริการ</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/merchant/dashboard" className="hover:text-white transition-colors">Merchant Dashboard</a></li>
              <li><a href="/merchant/dashboard" className="hover:text-white transition-colors">Market Insights</a></li>
              <li><a href="/merchant/dashboard" className="hover:text-white transition-colors">SEO Ranking</a></li>
              <li><a href="/coupons" className="hover:text-white transition-colors">คูปอง</a></li>
            </ul>
          </div>

          {/* เกี่ยวกับเรา */}
          <div>
            <h3 className="font-bold text-[#FF5722] mb-4">เกี่ยวกับเรา</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/contact" className="hover:text-white transition-colors">ติดต่อเรา</a></li>
              <li><a href="#" className="hover:text-white transition-colors">เกี่ยวกับเรา</a></li>
              <li><a href="#" className="hover:text-white transition-colors">ร่วมงานกับเรา</a></li>
              <li><a href="#" className="hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</a></li>
              <li><a href="#" className="hover:text-white transition-colors">ข้อกำหนดและเงื่อนไข</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
                © 2026 PRO HUNTER Co., Ltd. All rights reserved
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>

        {/* Powered by */}
        <div className="mt-6 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            🚀 Powered by Next.js 16 + AI-Powered Data Intelligence
          </p>
        </div>
      </div>
    </footer>
  );
}
