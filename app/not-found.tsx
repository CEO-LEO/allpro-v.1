'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto"
      >
        {/* 404 Illustration */}
        <div className="mb-8">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="text-8xl sm:text-9xl mb-4"
          >
            🔍
          </motion.div>
          <h1 className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] to-[#FF7043]">
            404
          </h1>
        </div>

        {/* Message */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">
          ไม่พบหน้าที่คุณต้องการ
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mb-8 leading-relaxed">
          หน้านี้อาจถูกลบไปแล้ว หรือ URL ไม่ถูกต้อง
          <br />
          ลองกลับไปหน้าหลักเพื่อค้นหาโปรโมชั่นที่ดีที่สุด
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-orange-200 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            กลับหน้าหลัก
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold px-6 py-3 rounded-xl border-2 border-slate-200 hover:border-[#FF5722] hover:text-[#FF5722] active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            ค้นหาโปรโมชั่น
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
