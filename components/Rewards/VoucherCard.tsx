'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { Voucher } from '@/lib/rewardTypes';
import { usePoints } from '@/lib/pointsContext';
import { X, Calendar, Barcode, CheckCircle2, Copy, Check } from 'lucide-react';

interface VoucherCardProps {
  voucher: Voucher;
}

export default function VoucherCard({ voucher }: VoucherCardProps) {
  const { markVoucherAsUsed } = usePoints();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const isExpired = new Date(voucher.expiresAt) < new Date();
  const isUsed = voucher.status === 'used';
  const daysLeft = Math.ceil((new Date(voucher.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkAsUsed = () => {
    if (confirm('ต้องการทำเครื่องหมายว่าใช้แล้วใช่หรือไม่?')) {
      markVoucherAsUsed(voucher.id);
      setShowModal(false);
    }
  };

  return (
    <>
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: isUsed ? 1 : 1.02 }}
        onClick={() => !isUsed && setShowModal(true)}
        className={`
          relative bg-white rounded-2xl overflow-hidden border-2 shadow-lg cursor-pointer
          transition-all duration-300
          ${isUsed ? 'opacity-60 border-gray-300' : 'border-green-400 hover:shadow-green-200'}
          ${isExpired && !isUsed ? 'opacity-40' : ''}
        `}
      >
        {/* Used Badge */}
        {isUsed && (
          <div className="absolute top-3 right-3 z-10 bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 size={14} />
            ใช้แล้ว
          </div>
        )}

        {/* Image */}
        <div className="relative h-32 bg-gradient-to-br from-green-100 to-blue-100">
          <Image
            src={voucher.rewardImage}
            alt={voucher.rewardName}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-gray-500 font-semibold mb-1">{voucher.brand}</p>
          <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">
            {voucher.rewardName}
          </h3>

          {/* Code Preview */}
          <div className="bg-gray-100 rounded-lg p-2 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Barcode size={16} className="text-gray-600" />
              <code className="text-xs font-mono">{voucher.code}</code>
            </div>
          </div>

          {/* Expiry */}
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Calendar size={12} />
            <span>
              {isExpired ? (
                <span className="text-red-600 font-semibold">หมดอายุแล้ว</span>
              ) : (
                <>เหลือ {daysLeft} วัน</>
              )}
            </span>
          </div>
        </div>

        {/* Tap to View */}
        {!isUsed && !isExpired && (
          <div className="bg-green-500 text-white text-center py-2 text-xs font-bold">
            แตะเพื่อใช้งาน →
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-green-500 to-blue-600 text-white p-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                >
                  <X size={20} />
                </button>

                <h2 className="text-2xl font-black mb-2">{voucher.rewardName}</h2>
                <p className="text-sm opacity-90">{voucher.brand}</p>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* QR Code */}
                <div className="bg-white border-4 border-gray-200 rounded-2xl p-6 mb-6 flex flex-col items-center">
                  <p className="text-sm text-gray-600 mb-3 font-semibold">แสดงคิวอาร์โค้ดนี้ที่ร้านค้า</p>
                  <div className="bg-white p-4 rounded-xl">
                    <QRCodeSVG
                      value={voucher.qrData || voucher.code}
                      size={200}
                      level="H"
                      includeMargin
                    />
                  </div>
                </div>

                {/* Voucher Code */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-4 border-2 border-blue-200">
                  <p className="text-xs text-gray-600 mb-2 font-semibold text-center">รหัสคูปอง</p>
                  <div className="flex items-center justify-between bg-white rounded-lg p-3">
                    <code className="font-mono font-bold text-lg text-gray-900">{voucher.code}</code>
                    <button
                      onClick={handleCopyCode}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">แลกเมื่อ:</span>
                    <span className="font-semibold">{new Date(voucher.redeemedAt).toLocaleDateString('th-TH')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">หมดอายุ:</span>
                    <span className={`font-semibold ${daysLeft < 7 ? 'text-red-600' : 'text-green-600'}`}>
                      {new Date(voucher.expiresAt).toLocaleDateString('th-TH')} ({daysLeft} วัน)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ใช้แต้ม:</span>
                    <span className="font-bold text-orange-600">{voucher.pointsSpent} แต้ม</span>
                  </div>
                </div>

                {/* Mark as Used Button */}
                {voucher.status === 'active' && !isExpired && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMarkAsUsed}
                    className="w-full bg-gray-700 hover:bg-gray-800 text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    ทำเครื่องหมายว่าใช้แล้ว
                  </motion.button>
                )}

                {voucher.status === 'used' && (
                  <div className="text-center py-4 bg-gray-100 rounded-xl">
                    <CheckCircle2 size={32} className="text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-600 font-semibold">ใช้งานแล้ว</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
