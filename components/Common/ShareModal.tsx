'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Download, Instagram } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deal' | 'badge' | 'level';
  data: {
    title?: string;
    description?: string;
    price?: string;
    originalPrice?: string;
    badgeName?: string;
    badgeEmoji?: string;
    level?: number;
    rankTitle?: string;
    points?: number;
  };
}

export default function ShareModal({ isOpen, onClose, type, data }: ShareModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate shareable image
  const generateImage = async () => {
    if (!cardRef.current) return null;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      return blob;
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('ไม่สามารถสร้างรูปภาพได้');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('คัดลอกลิงก์แล้ว!');
    } catch (error) {
      toast.error('ไม่สามารถคัดลอกได้');
    }
  };

  // Share to Story (uses Web Share API)
  const handleShareToStory = async () => {
    const imageBlob = await generateImage();
    if (!imageBlob) return;

    const shareText = getShareText();
    const url = window.location.href;

    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([imageBlob], 'share.png', { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: shareText,
            text: shareText,
            url: url,
            files: [file],
          });
          toast.success('แชร์สำเร็จ!');
        } else {
          // Fallback: Download image
          downloadImage(imageBlob);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fallback: Download image
          downloadImage(imageBlob);
        }
      }
    } else {
      // Fallback: Download image
      downloadImage(imageBlob);
    }
  };

  // Download image
  const downloadImage = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-promo-hunter-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('ดาวน์โหลดรูปภาพแล้ว!');
  };

  // Generate share text
  const getShareText = () => {
    if (type === 'deal') {
      return `เจอดีลเด็ด! ${data.title} ราคาแค่ ${data.price}! มาล่าด้วยกันที่ All Pro`;
    } else if (type === 'badge') {
      return `ปลดล็อค Badge "${data.badgeName}" แล้ว! ${data.badgeEmoji} มาเล่นด้วยกันที่ All Pro`;
    } else {
      return `เลเวลขึ้น ${data.level}! ตอนนี้เป็น "${data.rankTitle}" แล้ว! มาล่าดีลด้วยกันที่ All Pro`;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-md bg-dark-surface rounded-3xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <Share2 className="w-6 h-6 text-brand-500" />
              <h2 className="text-xl font-bold text-white">แชร์ให้เพื่อน</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Preview Card (Instagram Story style 9:16) */}
          <div className="p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-3 text-center">
                แชร์ลง Story หรือดาวน์โหลดเพื่อโพสต์
              </p>
              
              {/* Scrollable container for tall card */}
              <div className="max-h-[400px] overflow-y-auto rounded-2xl">
                <div
                  ref={cardRef}
                  className="relative w-full aspect-[9/16] bg-gradient-to-br from-gray-900 via-brand-900 to-black rounded-2xl overflow-hidden shadow-2xl"
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-brand-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-500 rounded-full blur-3xl" />
                  </div>

                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
                    {/* Top Logo */}
                    <div className="absolute top-8 left-0 right-0">
                      <div className="text-center">
                        <div className="text-3xl font-bold gradient-text-gold">
                          All Pro
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ล่าโปรให้เจอ แบบเรียลไทม์
                        </div>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-6">
                      {type === 'deal' && (
                        <>
                          <div className="text-6xl">🎁</div>
                          <div>
                            <div className="text-2xl font-bold text-white mb-2">
                              เจอดีลเด็ด!
                            </div>
                            <div className="text-xl text-brand-200 font-semibold mb-3">
                              {data.title}
                            </div>
                            <div className="flex items-center justify-center gap-3">
                              {data.originalPrice && (
                                <span className="text-gray-500 line-through text-lg">
                                  {data.originalPrice}
                                </span>
                              )}
                              <span className="text-4xl font-bold text-brand-400">
                                {data.price}
                              </span>
                            </div>
                          </div>
                        </>
                      )}

                      {type === 'badge' && (
                        <>
                          <div className="text-7xl">{data.badgeEmoji}</div>
                          <div>
                            <div className="text-xl text-brand-200 mb-2">
                              Achievement Unlocked!
                            </div>
                            <div className="text-3xl font-bold text-white mb-3">
                              {data.badgeName}
                            </div>
                            <div className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                              <span className="text-white font-semibold text-sm">
                                🏆 Epic Badge
                              </span>
                            </div>
                          </div>
                        </>
                      )}

                      {type === 'level' && (
                        <>
                          <div className="text-7xl">⚡</div>
                          <div>
                            <div className="text-xl text-brand-200 mb-2">
                              Level Up!
                            </div>
                            <div className="text-5xl font-bold gradient-text-gold mb-3">
                              Level {data.level}
                            </div>
                            <div className="text-2xl text-white mb-3">
                              {data.rankTitle}
                            </div>
                            <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-brand-400">
                              <span className="text-brand-300 font-semibold">
                                {data.points?.toLocaleString()} Points
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Bottom CTA */}
                    <div className="absolute bottom-8 left-0 right-0 px-8">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                        <div className="text-white font-semibold mb-1">
                          มาล่าดีลด้วยกัน!
                        </div>
                        <div className="text-xs text-gray-300">
                          ดาวน์โหลด All Pro App
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleShareToStory}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-lg transition-all press-effect disabled:opacity-50"
              >
                <Instagram className="w-5 h-5" />
                {isGenerating ? 'กำลังสร้างรูปภาพ...' : 'แชร์ลง Story'}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-bg hover:bg-gray-800 text-white rounded-xl font-medium transition-colors press-effect"
                >
                  <Copy className="w-4 h-4" />
                  คัดลอกลิงก์
                </button>

                <button
                  onClick={async () => {
                    const blob = await generateImage();
                    if (blob) downloadImage(blob);
                  }}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-bg hover:bg-gray-800 text-white rounded-xl font-medium transition-colors press-effect disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลด
                </button>
              </div>
            </div>

            {/* Hint */}
            <p className="text-xs text-center text-gray-500 mt-4">
              💡 แชร์ให้เพื่อนเพื่อรับ <strong className="text-brand-400">+200 แต้ม</strong>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
