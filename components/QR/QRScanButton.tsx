'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, CheckCircle, Gift, Zap } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function QRScanButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const { earnPoints } = useGamification();

  const mockScan = () => {
    setIsScanning(true);
    
    // TODO: Replace with real QR scan -> POST /api/qr/scan
    setTimeout(() => {
      setScanResult(null);
      setIsScanning(false);
      toast.success('ไม่พบโปรโมชั่นสำหรับ QR นี้', {
        icon: '📱',
        duration: 3000,
      });
    }, 2000);
  };

  const handleScan = () => {
    setScanResult(null);
    mockScan();
  };

  return (
    <>
      {/* QR Scan Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => {
              setIsOpen(true);
              toast.info('เปิดกล้องเพื่อสแกน QR Code');
            }}
            className="fixed bottom-24 right-6 z-40 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full p-4 shadow-2xl hover:shadow-orange-500/50 hover:scale-110 transition-all duration-300 group"
          >
            <QrCode className="w-6 h-6" />
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 text-2xl"
            >
              📱
            </motion.div>
            <div className="absolute -top-12 right-0 bg-black text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Scan QR Code
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isScanning && setIsOpen(false)}
              className="fixed inset-0 bg-black/80 z-50"
            />

            {/* Scanner Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 text-center">
                  <div className="inline-block bg-white/20 p-4 rounded-2xl mb-3">
                    <QrCode className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-bold mb-1">Scan QR Code</h2>
                  <p className="text-orange-100 text-sm">
                    สแกนเพื่อรับโปรโมชั่นและคะแนน
                  </p>
                </div>

                {/* Scanner Area */}
                <div className="p-6">
                  {!scanResult && !isScanning && (
                    <div className="relative">
                      {/* Mock Camera View */}
                      <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            {/* Scanning Frame */}
                            <div className="w-64 h-64 relative">
                              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl" />
                              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl" />
                              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-orange-500 rounded-bl-2xl" />
                              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-orange-500 rounded-br-2xl" />
                              
                              {/* Center Icon */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <QrCode className="w-24 h-24 text-white/20" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Instructions */}
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <p className="text-white text-sm bg-black/50 inline-block px-4 py-2 rounded-full">
                            วาง QR Code ไว้ในกรอบ
                          </p>
                        </div>
                      </div>

                      {/* Scan Button */}
                      <button
                        onClick={handleScan}
                        className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <Zap className="w-5 h-5" />
                        เริ่มสแกน
                      </button>
                    </div>
                  )}

                  {/* Scanning Animation */}
                  {isScanning && (
                    <div className="text-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="inline-block"
                      >
                        <QrCode className="w-20 h-20 text-orange-500" />
                      </motion.div>
                      <p className="mt-4 text-lg font-bold text-gray-900">
                        กำลังสแกน...
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        กรุณารอสักครู่
                      </p>
                    </div>
                  )}

                  {/* Scan Result */}
                  {scanResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="inline-block mb-4"
                      >
                        <CheckCircle className="w-20 h-20 text-green-500" />
                      </motion.div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        สแกนสำเร็จ! 🎉
                      </h3>

                      {/* Promo Details */}
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 mt-4 border-2 border-orange-200">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Gift className="w-6 h-6 text-orange-600" />
                          <h4 className="text-lg font-bold text-gray-900">
                            {scanResult.title}
                          </h4>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-700">
                            <strong>ส่วนลด:</strong> {scanResult.discount}
                          </p>
                          <p className="text-gray-700">
                            <strong>ใช้ได้ถึง:</strong> {scanResult.validUntil}
                          </p>
                          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold mt-3">
                            +{scanResult.points} แต้ม
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => {
                            setScanResult(null);
                            handleScan();
                          }}
                          className="flex-1 bg-white text-orange-600 border-2 border-orange-600 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors"
                        >
                          สแกนต่อ
                        </button>
                        <button
                          onClick={() => setIsOpen(false)}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all"
                        >
                          เสร็จสิ้น
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Close Button */}
                {!isScanning && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
