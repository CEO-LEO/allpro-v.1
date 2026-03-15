'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, AlertTriangle, X } from 'lucide-react';

interface RedemptionSliderProps {
  onUnlock: () => void;
  voucherName: string;
}

export default function RedemptionSlider({ onUnlock, voucherName }: RedemptionSliderProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = () => {
    setIsDragging(true);
    if (!showWarning) {
      setShowWarning(true);
    }
  };

  const handleDrag = (event: any, info: any) => {
    const containerWidth = containerRef.current?.offsetWidth || 300;
    const maxDrag = containerWidth - 80; // 80px is button width
    
    if (info.offset.x >= 0 && info.offset.x <= maxDrag) {
      setDragX(info.offset.x);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const containerWidth = containerRef.current?.offsetWidth || 300;
    const threshold = containerWidth * 0.75; // 75% to unlock

    if (info.offset.x >= threshold) {
      // Unlocked!
      setIsUnlocked(true);
      setDragX(containerWidth - 80);
      setTimeout(() => {
        onUnlock();
      }, 300);
    } else {
      // Snap back
      setDragX(0);
    }
  };

  const handleConfirmWarning = () => {
    setShowWarning(false);
  };

  const progress = containerRef.current 
    ? Math.min(100, (dragX / (containerRef.current.offsetWidth - 80)) * 100)
    : 0;

  return (
    <>
      <div className="space-y-4">
        {/* Instructions */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-orange-900 mb-1">
            📱 ก่อนใช้งาน
          </p>
          <p className="text-xs text-orange-700">
            เลื่อนเพื่อปลดล็อกคูปองต่อหน้าพนักงาน<br />
            รหัสจะใช้งานได้เพียง 15 นาที
          </p>
        </div>

        {/* Slider */}
        <div 
          ref={containerRef}
          className="relative bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-2 border-2 border-green-300 overflow-hidden shadow-lg"
        >
          {/* Progress Bar */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-30"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />

          {/* Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.p
              className="font-bold text-green-800"
              initial={{ opacity: 1 }}
              animate={{ opacity: progress > 50 ? 0 : 1 }}
            >
              {isUnlocked ? '✓ ปลดล็อกแล้ว' : '← เลื่อนเพื่อใช้สิทธิ์ →'}
            </motion.p>
          </div>

          {/* Draggable Button */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: containerRef.current ? containerRef.current.offsetWidth - 80 : 0 }}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            animate={{ x: dragX }}
            className={`relative w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing ${
              isUnlocked ? 'bg-green-500' : ''
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {isUnlocked ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl"
              >
                ✓
              </motion.span>
            ) : (
              <>
                <ChevronRight className="w-8 h-8 text-green-600 absolute" />
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ChevronRight className="w-8 h-8 text-green-600" />
                </motion.div>
              </>
            )}
          </motion.div>
        </div>

        {/* Warning Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            ⚠️ อย่าเลื่อนหากไม่ได้อยู่ต่อหน้าพนักงาน
          </p>
        </div>
      </div>

      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative">
                <button
                  onClick={() => setShowWarning(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-bold">คำเตือนสำคัญ!</h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="bg-orange-50 rounded-xl p-4 mb-4 border-2 border-orange-200">
                  <p className="font-bold text-orange-900 mb-2">
                    🎫 {voucherName}
                  </p>
                  <div className="space-y-2 text-sm text-orange-800">
                    <p className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <span>อย่าเลื่อนปลดล็อกหากคุณไม่ได้อยู่ต่อหน้าพนักงานร้านค้า</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <span>เมื่อปลดล็อก รหัสจะใช้งานได้เพียง <strong className="text-red-600">15 นาที</strong> เท่านั้น</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <span>หลังหมดเวลา คูปองจะหมดอายุและไม่สามารถใช้งานได้อีก</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      <span>การสกรีนช็อตรหัสไม่สามารถนำไปใช้ได้ (ระบบตรวจจับ)</span>
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-4 mb-6 border-2 border-red-200">
                  <p className="text-center font-bold text-red-900 mb-2">
                    ⛔ ห้ามทำ!
                  </p>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• สกรีนช็อตหน้าจอเพื่อใช้ซ้ำ</li>
                    <li>• แชร์รหัสให้ผู้อื่น</li>
                    <li>• เปิดรหัสก่อนเวลา</li>
                  </ul>
                </div>

                <button
                  onClick={handleConfirmWarning}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all"
                >
                  ✓ เข้าใจแล้ว เลื่อนเพื่อใช้งาน
                </button>

                <button
                  onClick={() => setShowWarning(false)}
                  className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all"
                >
                  ยกเลิก
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
