'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShareIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { 
  LinkIcon,
} from '@heroicons/react/24/solid';
import { toast } from 'sonner';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/promo/${promo.id}` 
    : '';
  const shareText = `${promo.title} - ${promo.shop_name}`;

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // On mobile, try native Web Share API first (opens LINE, Facebook, etc.)
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: promo.title,
          text: `${promo.shop_name}: ${promo.description || promo.title}`,
          url: shareUrl,
        });
        return; // User shared or cancelled — don't show modal
      } catch (err: unknown) {
        // User cancelled — that's fine, don't show modal
        if (err instanceof Error && err.name === 'AbortError') return;
        // navigator.share not fully supported, fall through to modal
      }
    }

    // Fallback: show share modal with platform links
    setShowShareModal(true);
  }, [promo, shareUrl]);

  const closeModal = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowShareModal(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('คัดลอกลิงก์แล้ว!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('คัดลอกลิงก์แล้ว!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToLine = () => {
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowShareModal(false);
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    setShowShareModal(false);
  };

  const shareToX = () => {
    const url = `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    setShowShareModal(false);
  };

  const shareOptions = [
    {
      label: 'LINE',
      onClick: shareToLine,
      color: 'bg-green-50 text-green-600',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
        </svg>
      ),
    },
    {
      label: 'Facebook',
      onClick: shareToFacebook,
      color: 'bg-blue-50 text-blue-600',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      label: 'X',
      onClick: shareToX,
      color: 'bg-gray-100 text-gray-800',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      label: copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์',
      onClick: copyToClipboard,
      color: 'bg-orange-50 text-orange-600',
      icon: <LinkIcon className="w-5 h-5" />,
    },
  ];

  // Portal-rendered modal content
  const modalContent = (
    <AnimatePresence>
      {showShareModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-[9998] backdrop-blur-sm bg-black/20"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[9999]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-t-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.12)] max-w-lg mx-auto">
              {/* Drag handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-8 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900">แชร์โปรโมชัน</p>
                  <p className="text-xs text-gray-400 truncate">{promo.title}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-4 gap-2 p-5">
                {shareOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={option.onClick}
                    className="flex flex-col items-center gap-2 py-3 px-1 rounded-xl hover:bg-gray-50 active:scale-95 transition-all touch-manipulation"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${option.color}`}>
                      {option.icon}
                    </div>
                    <span className="text-xs text-gray-600 font-medium leading-tight text-center">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* URL preview */}
              <div className="mx-5 mb-5 bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500 truncate flex-1">{shareUrl}</span>
                <button
                  onClick={copyToClipboard}
                  className="text-xs text-orange-500 font-semibold flex-shrink-0 hover:text-orange-600"
                >
                  {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                </button>
              </div>

              {/* Safe area */}
              <div className="h-6" />
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
        className="p-3 rounded-full bg-white/90 hover:bg-gray-50 border border-gray-100 shadow-sm backdrop-blur-sm transition-all touch-manipulation"
      >
        <ShareIcon className="w-5 h-5 text-gray-500" />
      </motion.button>

      {/* Portal: render modal at document.body to escape all stacking contexts */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
