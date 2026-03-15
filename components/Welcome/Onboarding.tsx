'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Package, Camera, Wallet, X, Gift } from 'lucide-react';
import { getReferralCodeFromURL, saveReferralSource } from '@/lib/referralUtils';

interface OnboardingProps {
  onComplete: () => void;
}

interface Slide {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  bgGradient: string;
}

const slides: Slide[] = [
  {
    id: 1,
    icon: <Package className="w-20 h-20" />,
    title: 'Real-Time Stock',
    subtitle: 'เช็กของก่อนไป ไม่เสียเที่ยว',
    description: 'ตรวจสอบสต็อกสินค้าแบบเรียลไทม์จากระบบ POS ของ 7-Eleven, Lotus, Makro',
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-emerald-50'
  },
  {
    id: 2,
    icon: <Camera className="w-20 h-20" />,
    title: 'Hunt & Earn',
    subtitle: 'เจอโปรฯ ถ่ายบอกเพื่อน รับแต้มทันที',
    description: 'แชร์โปรโมชั่นที่เจอ อัพโหลดรูป รับแต้มสะสม ปั้มเลเวลเป็น Deal Hunter มือโปร',
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-red-50'
  },
  {
    id: 3,
    icon: <Wallet className="w-20 h-20" />,
    title: 'Smart Wallet',
    subtitle: 'เก็บคูปองใช้ได้จริง ไม่ต้องค้นรูป',
    description: 'บันทึกโปรโมชั่นที่ชอบ สแกน QR Code ใช้งานได้ทันที ไม่ต้องเสียเวลาหารูปในแกลเลอรี่',
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-indigo-50'
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [referrerCode, setReferrerCode] = useState<string | null>(null);

  // Check for referral code in URL
  useEffect(() => {
    const code = getReferralCodeFromURL();
    if (code) {
      setReferrerCode(code);
      saveReferralSource(code);
    }
  }, []);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    onComplete();
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const currentSlideData = slides[currentSlide];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] bg-white overflow-hidden"
    >
      {/* Referral Welcome Banner (if referred) */}
      {referrerCode && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 animate-bounce" />
            <p className="text-sm font-bold">
              🎉 คุณถูกเชิญโดย <span className="underline">{referrerCode}</span>! 
              ลงทะเบียนเพื่อรับแต้มโบนัส 50 แต้ม
            </p>
          </div>
        </motion.div>
      )}

      {/* Skip Button */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={handleSkip}
        className="absolute top-6 right-6 z-10 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span className="text-sm font-medium">ข้าม</span>
        <X className="w-5 h-5" />
      </motion.button>

      {/* Slide Container */}
      <div className="h-full flex flex-col">
        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="w-full max-w-md text-center"
            >
              {/* Icon with Background */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2 
                }}
                className={`w-40 h-40 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${currentSlideData.bgGradient} flex items-center justify-center shadow-2xl`}
              >
                <div className={currentSlideData.color}>
                  {currentSlideData.icon}
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-gray-900 mb-3"
              >
                {currentSlideData.title}
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-semibold text-red-600 mb-4"
              >
                {currentSlideData.subtitle}
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 leading-relaxed px-4"
              >
                {currentSlideData.description}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pb-12 px-6"
        >
          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentSlide ? 1 : -1);
                  setCurrentSlide(index);
                }}
                className="group relative"
              >
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-8 bg-red-600'
                      : 'w-2 bg-gray-300 group-hover:bg-gray-400'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* Previous Button (if not first slide) */}
            {currentSlide > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handlePrevious}
                className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-colors"
              >
                ย้อนกลับ
              </motion.button>
            )}

            {/* Next/Get Started Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className={`${
                currentSlide === 0 ? 'flex-1' : 'flex-[2]'
              } py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg`}
            >
              <span>
                {currentSlide === slides.length - 1 ? 'เริ่มใช้งาน' : 'ถัดไป'}
              </span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Bottom Hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm text-gray-500 mt-4"
          >
            {currentSlide === slides.length - 1
              ? 'พร้อมล่าดีลแล้วหรือยัง? 🎯'
              : 'ปัดเพื่อดูเพิ่มเติม →'}
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
