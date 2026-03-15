'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface FlashSaleControlProps {
  productId: number;
  productName: string;
  currentPrice: number;
  isFlashActive?: boolean;
  onActivate: (config: FlashSaleConfig) => void;
  onDeactivate: () => void;
}

export interface FlashSaleConfig {
  productId: number;
  duration: number; // in minutes
  discountPrice: number;
  endTime: Date;
}

const DURATION_PRESETS = [
  { label: '30 นาที', value: 30, popular: false },
  { label: '1 ชั่วโมง', value: 60, popular: true },
  { label: 'ถึงปิดร้าน', value: 180, popular: false },
];

export default function FlashSaleControl({
  productId,
  productName,
  currentPrice,
  isFlashActive = false,
  onActivate,
  onDeactivate
}: FlashSaleControlProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(60); // default 1 hour
  const [flashPrice, setFlashPrice] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  const discountPercentage = flashPrice 
    ? Math.round(((currentPrice - parseFloat(flashPrice)) / currentPrice) * 100)
    : 0;

  const isPriceValid = flashPrice && parseFloat(flashPrice) > 0 && parseFloat(flashPrice) < currentPrice;

  const handleLaunch = () => {
    if (!isPriceValid) {
      toast.error('ราคาลดต้องน้อยกว่าราคาปกติ!');
      return;
    }

    setIsLaunching(true);

    // Calculate end time
    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + selectedDuration);

    const config: FlashSaleConfig = {
      productId,
      duration: selectedDuration,
      discountPrice: parseFloat(flashPrice),
      endTime
    };

    // Trigger confetti celebration
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FF5722', '#FF9800', '#FFC107', '#FFEB3B']
    });

    // Simulate network delay
    setTimeout(() => {
      onActivate(config);
      setIsLaunching(false);
      setShowModal(false);
      
      toast.success(
        `⚡ Flash Sale เริ่มแล้ว!\nแจ้งเตือนผู้ใช้ในรัศมี 2km`,
        { 
          duration: 5000,
          icon: '🚨',
          style: {
            background: '#FF5722',
            color: 'white',
            fontWeight: 'bold'
          }
        }
      );

      // Simulate user notifications
      const userCount = Math.floor(Math.random() * 50) + 20;
      setTimeout(() => {
        toast.success(
          `✅ ส่งการแจ้งเตือนไปยัง ${userCount} ผู้ใช้แล้ว`,
          { duration: 3000 }
        );
      }, 1500);
    }, 1000);
  };

  const handleDeactivate = () => {
    if (confirm('ต้องการยกเลิก Flash Sale หรือไม่?')) {
      onDeactivate();
      toast.success('Flash Sale ถูกยกเลิกแล้ว');
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {!isFlashActive ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg font-bold shadow-lg transition-all"
        >
          <Zap className="w-4 h-4" />
          <span>Start Happy Hour</span>
        </motion.button>
      ) : (
        <motion.button
          initial={{ scale: 0.9 }}
          animate={{ 
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 0 0 rgba(255, 87, 34, 0.4)',
              '0 0 0 10px rgba(255, 87, 34, 0)',
              '0 0 0 0 rgba(255, 87, 34, 0)'
            ]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          onClick={handleDeactivate}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold shadow-lg"
        >
          <Zap className="w-4 h-4 animate-pulse" />
          <span>🔥 Active</span>
        </motion.button>
      )}

      {/* Configuration Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <Zap className="w-8 h-8" />
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-bold">เริ่ม Flash Sale</h2>
                      <p className="text-sm text-white/90">{productName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Duration Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                    <Clock className="w-4 h-4 text-orange-600" />
                    ระยะเวลา
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {DURATION_PRESETS.map((preset) => (
                      <motion.button
                        key={preset.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDuration(preset.value)}
                        className={`relative p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                          selectedDuration === preset.value
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {preset.popular && (
                          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            ฮิต
                          </span>
                        )}
                        {preset.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Price Override */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    ราคาพิเศษ
                  </label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          value={flashPrice}
                          onChange={(e) => setFlashPrice(e.target.value)}
                          placeholder="ใส่ราคาใหม่"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none text-lg font-bold"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                          ฿
                        </span>
                      </div>
                      
                      {isPriceValid && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex-shrink-0 bg-green-100 text-green-700 px-3 py-2 rounded-xl font-bold text-sm"
                        >
                          -{discountPercentage}%
                        </motion.div>
                      )}
                    </div>

                    {/* Price Comparison */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ราคาปกติ:</span>
                        <span className="font-bold text-gray-400 line-through">
                          ฿{currentPrice.toFixed(2)}
                        </span>
                      </div>
                      {isPriceValid && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">ราคา Flash Sale:</span>
                            <span className="font-bold text-orange-600">
                              ฿{parseFloat(flashPrice).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">ลูกค้าประหยัด:</span>
                            <span className="font-bold text-green-600">
                              ฿{(currentPrice - parseFloat(flashPrice)).toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Warning Alert */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-amber-900 mb-1">
                      การแจ้งเตือนจะส่งไปยัง:
                    </p>
                    <ul className="text-amber-800 space-y-1">
                      <li>• ผู้ใช้ในรัศมี 2 กม.</li>
                      <li>• ผู้ที่กด "แจ้งเตือนสินค้ามาใหม่"</li>
                      <li>• ผู้ที่เคยซื้อสินค้านี้</li>
                    </ul>
                  </div>
                </motion.div>

                {/* Launch Button */}
                <motion.button
                  whileHover={{ scale: isPriceValid ? 1.02 : 1 }}
                  whileTap={{ scale: isPriceValid ? 0.98 : 1 }}
                  onClick={handleLaunch}
                  disabled={!isPriceValid || isLaunching}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    isPriceValid && !isLaunching
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLaunching ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                      กำลังเปิด Flash Sale...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Zap className="w-5 h-5" />
                      เปิด Flash Sale เลย!
                    </span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
