'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import QRCodeSVG from 'react-qr-code';
import { WalletCoupon } from '@/data/walletCoupons';
import { 
  Calendar, 
  CheckCircle, 
  Info, 
  Wallet as WalletIcon,
  Sparkles,
  Download
} from 'lucide-react';

interface CouponTicketProps {
  coupon: WalletCoupon;
  onMarkAsUsed?: (id: string) => void;
}

export default function CouponTicket({ coupon, onMarkAsUsed }: CouponTicketProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAppleWallet, setShowAppleWallet] = useState(false);

  const isExpired = coupon.status === 'expired';
  const isUsed = coupon.status === 'used';
  const isActive = coupon.status === 'active';

  const handleAddToAppleWallet = () => {
    setShowAppleWallet(true);
    setTimeout(() => setShowAppleWallet(false), 2000);
  };

  return (
    <>
      <motion.div
        className="relative perspective-1000"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="relative w-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
          style={{ 
            transformStyle: 'preserve-3d',
            cursor: isActive ? 'pointer' : 'default'
          }}
          onClick={() => isActive && setIsFlipped(!isFlipped)}
        >
          {/* Front Side */}
          <motion.div
            className={`
              relative bg-white rounded-2xl shadow-xl overflow-hidden
              ${isExpired || isUsed ? 'opacity-60 grayscale' : ''}
            `}
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            {/* Perforated Edge Effect */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-100 to-transparent">
              <div className="flex flex-col h-full justify-around items-center py-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-gray-300" />
                ))}
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-100 to-transparent">
              <div className="flex flex-col h-full justify-around items-center py-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-gray-300" />
                ))}
              </div>
            </div>

            {/* Status Badge */}
            {!isActive && (
              <div className="absolute top-4 right-4 z-10">
                <span className={`
                  px-3 py-1 rounded-full text-xs font-bold
                  ${isUsed ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}
                `}>
                  {isUsed ? '✓ USED' : 'EXPIRED'}
                </span>
              </div>
            )}

            <div className="flex h-64">
              {/* Left: Image Section */}
              <div className="w-1/3 relative">
                <Image
                  src={coupon.imageUrl}
                  alt={coupon.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                  <Image
                    src={coupon.brandLogo}
                    alt={coupon.brand}
                    width={60}
                    height={30}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Right: Details Section */}
              <div className="w-2/3 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {coupon.discount}
                    </span>
                    {isActive && (
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {coupon.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {coupon.description}
                  </p>
                </div>

                <div className="space-y-2">
                  {/* Expiry */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      Valid until: <span className="font-semibold text-gray-900">{coupon.expiryDate}</span>
                    </span>
                  </div>

                  {/* Code */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">CODE:</span>
                    <code className="text-sm font-mono bg-gray-100 px-3 py-1 rounded border border-gray-200">
                      {coupon.code}
                    </code>
                  </div>

                  {/* Click to flip hint */}
                  {isActive && (
                    <div className="mt-4 text-center py-2 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700 font-medium">
                        👆 Click to reveal QR Code
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Back Side */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl overflow-hidden"
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="h-full p-8 flex flex-col items-center justify-center text-white">
              {/* QR Code */}
              <div className="bg-white p-6 rounded-2xl mb-6 shadow-2xl">
                <QRCodeSVG 
                  value={coupon.qrData} 
                  size={200}
                  level="H"
                />
              </div>

              {/* Barcode */}
              <div className="bg-white px-6 py-4 rounded-lg mb-6">
                <div className="flex gap-1">
                  {coupon.barcode.split('').map((digit, i) => (
                    <div key={i} className={`w-1 ${i % 2 === 0 ? 'bg-black h-12' : 'bg-gray-300 h-10'}`} />
                  ))}
                </div>
                <p className="text-center text-xs text-gray-900 font-mono mt-2">
                  {coupon.barcode}
                </p>
              </div>

              {/* Instructions */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-300 mb-2">
                  💡 <strong>Maximize screen brightness</strong> for best results
                </p>
                <p className="text-xs text-gray-400">
                  Show this QR code to the cashier to redeem
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full max-w-sm">
                {isActive && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToAppleWallet();
                      }}
                      className="flex-1 bg-white text-gray-900 px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                    >
                      <WalletIcon className="w-4 h-4" />
                      Add to Wallet
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsUsed?.(coupon.id);
                        setIsFlipped(false);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Used
                    </button>
                  </>
                )}
              </div>

              {/* Terms */}
              <div className="mt-6 w-full max-w-sm">
                <button className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Terms & Conditions
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Apple Wallet Success Animation */}
      <AnimatePresence>
        {showAppleWallet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 1, y: 0 }}
              animate={{ scale: 0.5, y: 500 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              className="bg-white rounded-3xl shadow-2xl p-8 text-center"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: 'linear' }}
              >
                <WalletIcon className="w-24 h-24 text-blue-600 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Added to Wallet!
              </h3>
              <p className="text-gray-600">
                Your coupon is now saved
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
