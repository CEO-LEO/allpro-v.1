'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/promo/${promo.id}` 
    : '';

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareModal(true);
  };

  const closeModal = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowShareModal(false);
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
        setShowShareModal(false);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const shareToCommunity = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/community/share?promoId=${promo.id}`;
    }
  };

  const shareOptions = [
    {
      label: 'Community',
      icon: ChatBubbleLeftRightIcon,
      onClick: shareToCommunity,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์',
      icon: LinkIcon,
      onClick: copyToClipboard,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'แชร์ผ่าน...',
      icon: ShareIcon,
      onClick: shareToWeb,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'QR Code',
      icon: QrCodeIcon,
      onClick: () => {},
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  // Portal-rendered modal content
  const modalContent = (
    <AnimatePresence>
      {showShareModal && (
        <>
          {/* Backdrop — subtle blur, no dark mask */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-[9998] backdrop-blur-sm bg-black/5"
          />

          {/* Mobile: slide-up drawer | Desktop: centered mini popup */}
          <motion.div
            initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={
              isMobile
                ? 'fixed bottom-0 left-0 right-0 z-[9999]'
                : 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-xs'
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-white ${isMobile ? 'rounded-t-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.12)]' : 'rounded-xl shadow-2xl'}`}>
              {/* Drag handle (mobile) */}
              {isMobile && (
                <div className="flex justify-center pt-2 pb-1">
                  <div className="w-8 h-1 bg-gray-200 rounded-full" />
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{promo.title}</p>
                  <p className="text-xs text-slate-400">{promo.shop_name}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors ml-2 flex-shrink-0"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Share Options Grid */}
              <div className="grid grid-cols-4 gap-1 p-4">
                {shareOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.label}
                      onClick={option.onClick}
                      className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${option.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium leading-tight text-center">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Safe area padding for mobile */}
              {isMobile && <div className="h-6" />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.button
        onClick={handleShare}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 rounded-full bg-white/90 hover:bg-gray-50 border border-gray-100 shadow-sm backdrop-blur-sm transition-all"
      >
        <ShareIcon className="w-4 h-4 text-gray-500" />
      </motion.button>

      {/* Portal: render modal at document.body to escape all stacking contexts */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
