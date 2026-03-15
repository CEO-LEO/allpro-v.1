'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Slide {
  id: number;
  emoji: string;
  title: string;
  description: string;
  visual: 'hero' | 'ai' | 'badges';
}

const SLIDES: Slide[] = [
  {
    id: 1,
    emoji: '👋',
    title: 'Hunter, Welcome to the Arena!',
    description: 'ยินดีต้อนรับสู่แพลตฟอร์มล่าโปรที่ดีที่สุด! เราจะช่วยคุณเจอดีลเทพๆ แบบเรียลไทม์',
    visual: 'hero',
  },
  {
    id: 2,
    emoji: '🤖',
    title: "Don't Search. Just Ask.",
    description: 'อย่าเสียเวลาค้นหา! ใช้ AI Chatbot ถามอะไรก็ได้ "หาซูชิใกล้ๆ" แล้วปล่อยให้เราจัดการ',
    visual: 'ai',
  },
  {
    id: 3,
    emoji: '🏆',
    title: 'Play & Earn. Get Free Food.',
    description: 'สะสมแต้ม ปลดล็อค Badge และขึ้นเลเวล! ยิ่งใช้บ่อย ยิ่งได้ของฟรี',
    visual: 'badges',
  },
];

export default function WelcomeTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    // Check if user has seen the tutorial
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    
    if (!hasSeenTutorial) {
      // Delay opening by 500ms for smooth entry
      setTimeout(() => {
        setIsOpen(true);
      }, 500);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenTutorial', 'true');
    
    // Celebration!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
    });
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const slide = SLIDES[currentSlide];
  const isLastSlide = currentSlide === SLIDES.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleSkip}
      >
        <motion.div
          className="relative w-full max-w-md bg-gradient-to-br from-dark-surface to-dark-bg rounded-3xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Slide Content */}
          <div className="relative h-[600px] flex flex-col">
            {/* Visual Section */}
            <div className="relative h-[350px] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-300 rounded-full blur-3xl" />
              </div>

              {/* Emoji & Visual */}
              <div className="relative h-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, x: direction * 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -100 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    {slide.visual === 'hero' && (
                      <div className="space-y-4">
                        <motion.div
                          className="text-9xl"
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          {slide.emoji}
                        </motion.div>
                        <div className="flex items-center justify-center gap-3">
                          <motion.div
                            className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center text-3xl"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            🏪
                          </motion.div>
                          <motion.div
                            className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center text-3xl"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 1.5, delay: 0.2, repeat: Infinity }}
                          >
                            🎁
                          </motion.div>
                          <motion.div
                            className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center text-3xl"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 1.5, delay: 0.4, repeat: Infinity }}
                          >
                            💰
                          </motion.div>
                        </div>
                      </div>
                    )}

                    {slide.visual === 'ai' && (
                      <div className="space-y-6">
                        <motion.div
                          className="text-8xl"
                          animate={{ 
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          {slide.emoji}
                        </motion.div>
                        {/* Chat Bubble */}
                        <motion.div
                          className="relative mx-auto max-w-xs"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="bg-white/90 rounded-2xl p-4 shadow-lg">
                            <p className="text-gray-800 font-medium text-sm">
                              "หาซูชิใกล้ๆ ส่วนลดเยอะๆ"
                            </p>
                          </div>
                        </motion.div>
                        <motion.div
                          className="mt-2 bg-brand-100 rounded-2xl p-4 shadow-lg border-2 border-brand-400"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <p className="text-gray-800 font-medium text-sm">
                            🍣 เจอแล้ว! <strong>Sushi Buffet -50%</strong> แค่ 500m
                          </p>
                        </motion.div>
                      </div>
                    )}

                    {slide.visual === 'badges' && (
                      <div className="space-y-6">
                        <motion.div
                          className="text-8xl"
                          animate={{ 
                            rotate: [0, -10, 10, 0],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                          }}
                        >
                          {slide.emoji}
                        </motion.div>
                        {/* Badge Grid */}
                        <div className="flex items-center justify-center gap-3">
                          {['🏪', '⭐', '👑', '🔥'].map((emoji, i) => (
                            <motion.div
                              key={i}
                              className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              whileHover={{ scale: 1.1 }}
                            >
                              {emoji}
                            </motion.div>
                          ))}
                        </div>
                        {/* Points Counter */}
                        <motion.div
                          className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <span className="text-white font-bold text-xl">+50 แต้ม</span>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1 bg-dark-surface p-8 flex flex-col justify-between">
              <div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-3">
                      {slide.title}
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                      {slide.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="space-y-4">
                {/* Dots */}
                <div className="flex items-center justify-center gap-2">
                  {SLIDES.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setDirection(index > currentSlide ? 1 : -1);
                        setCurrentSlide(index);
                      }}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? 'w-8 bg-brand-500'
                          : 'w-2 bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  {currentSlide > 0 && (
                    <button
                      onClick={handlePrev}
                      className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-semibold transition-colors press-effect"
                    >
                      ย้อนกลับ
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-full font-semibold shadow-lg transition-all press-effect"
                  >
                    {isLastSlide ? '🚀 เริ่มล่า!' : 'ต่อไป'}
                  </button>
                </div>

                {/* Skip */}
                {!isLastSlide && (
                  <button
                    onClick={handleSkip}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-400 transition-colors"
                  >
                    ข้าม
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
