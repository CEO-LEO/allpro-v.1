'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md mx-auto"
      >
        {/* Error Illustration */}
        <div className="mb-8">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="text-7xl sm:text-8xl mb-4"
          >
            ⚠️
          </motion.div>
        </div>

        {/* Message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
          เกิดข้อผิดพลาด
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mb-8 leading-relaxed">
          ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด
          <br />
          กรุณาลองใหม่อีกครั้ง หรือกลับไปหน้าหลัก
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-orange-200 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            ลองใหม่อีกครั้ง
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold px-6 py-3 rounded-xl border-2 border-slate-200 hover:border-[#FF5722] hover:text-[#FF5722] active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            กลับหน้าหลัก
          </a>
        </div>

        {/* Error details (dev mode) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left bg-red-50 border border-red-200 rounded-xl p-4">
            <summary className="text-sm font-semibold text-red-700 cursor-pointer">
              รายละเอียดข้อผิดพลาด (Development)
            </summary>
            <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40 whitespace-pre-wrap">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </motion.div>
    </div>
  );
}
