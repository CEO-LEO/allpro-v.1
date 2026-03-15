'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  ShareIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { 
  ChatBubbleLeftRightIcon,
  LinkIcon,
  QrCodeIcon 
} from '@heroicons/react/24/solid';

interface ShareButtonProps {
  promo: {
    id: string;
    title: string;
    shop_name: string;
    description?: string;
  };
}

export default function ShareButton({ promo }: ShareButtonProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/promo/${promo.id}` 
    : '';

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareModal(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToWeb = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: promo.title,
          text: `${promo.shop_name}: ${promo.description || promo.title}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const shareToCommunity = () => {
    // Navigate to community share page
    if (typeof window !== 'undefined') {
      window.location.href = `/community/share?promoId=${promo.id}`;
    }
  };

  return (
    <>
      <motion.button
        onClick={handleShare}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 rounded-full bg-white/90 hover:bg-blue-50 border border-gray-200 shadow-lg backdrop-blur-sm transition-all duration-300"
      >
        <ShareIcon className="w-5 h-5 text-gray-700" />
      </motion.button>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">แชร์โปรโมชั่น</h3>
                    <button
                      onClick={() => setShowShareModal(false)}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Promo Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {promo.title}
                    </h4>
                    <p className="text-sm text-gray-600">{promo.shop_name}</p>
                  </div>

                  {/* Share Options */}
                  <div className="space-y-3">
                    {/* Share to Community */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={shareToCommunity}
                      className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl text-white transition-all shadow-lg"
                    >
                      <div className="p-2 bg-white/20 rounded-lg">
                        <ChatBubbleLeftRightIcon className="w-6 h-6" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold">แชร์ไปยัง Community</p>
                        <p className="text-xs opacity-90">แบ่งปันกับเพื่อนสมาชิก</p>
                      </div>
                    </motion.button>

                    {/* Copy Link */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={copyToClipboard}
                      className="w-full flex items-center gap-4 p-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <LinkIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-gray-900">
                          {copied ? '✓ คัดลอกแล้ว!' : 'คัดลอกลิงก์'}
                        </p>
                        <p className="text-xs text-gray-600">แชร์ลิงก์ไปที่อื่น</p>
                      </div>
                    </motion.button>

                    {/* Share via Web API */}
                    {typeof navigator !== 'undefined' && 'share' in navigator && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={shareToWeb}
                        className="w-full flex items-center gap-4 p-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                      >
                        <div className="p-2 bg-green-100 rounded-lg">
                          <ShareIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold text-gray-900">แชร์ผ่าน...</p>
                          <p className="text-xs text-gray-600">เลือกแอปที่ต้องการแชร์</p>
                        </div>
                      </motion.button>
                    )}

                    {/* QR Code */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-4 p-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                    >
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <QrCodeIcon className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-gray-900">แสดง QR Code</p>
                        <p className="text-xs text-gray-600">สแกนเพื่อดูโปรโมชั่น</p>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
