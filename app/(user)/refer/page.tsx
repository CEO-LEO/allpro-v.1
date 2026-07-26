'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Sparkles,
  QrCode,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import { 
  getUserReferralCode, 
  getReferralLink, 
  getReferralStats 
} from '@/lib/referralUtils';

// Dynamic import QR Code to avoid SSR issues
const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), {
  ssr: false,
  loading: () => (
    <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-2xl" />
  )
});

export default function ReferPage() {
  const [referralCode, setReferralCode] = useState('HUNTER-000');
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [stats, setStats] = useState({ totalReferrals: 0, pointsEarned: 0, pendingReferrals: 0 });

  useEffect(() => {
    const code = getUserReferralCode();
    const link = getReferralLink(code);
    const referralStats = getReferralStats();
    
    setReferralCode(code);
    setReferralLink(link);
    setStats(referralStats);
  }, []);

  const copyCode = async () => {
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('คัดลอกโค้ดแล้ว!', { icon: '✨' });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    toast.success('คัดลอกลิงก์แล้ว!', { icon: '🔗' });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FCD34D', '#FBBF24', '#F59E0B', '#F97316', '#DC2626']
    });
  };

  const shareToLine = () => {
    const message = `🎁 มาล่าโปรโมชั่นกับฉันสิ! ใช้โค้ด ${referralCode} รับแต้มฟรี 50 แต้ม!\n${referralLink}`;
    const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(message)}`;
    window.open(lineUrl, '_blank');
    triggerConfetti();
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(`🎁 ชวนเพื่อนล่าดีล! ใช้โค้ด ${referralCode} รับแต้มฟรี!`)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
    triggerConfetti();
  };

  const shareGeneric = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'All Pro - ล่าโปรโมชั่น',
          text: `🎁 มาล่าโปรโมชั่นกับฉันสิ! ใช้โค้ด ${referralCode} รับแต้มฟรี 50 แต้ม!`,
          url: referralLink
        });
        triggerConfetti();
      } catch (err) {
        // User cancelled share - this is expected behavior
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-amber-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-amber-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">ชวนเพื่อนรับแต้ม</h1>
            <p className="text-xs text-amber-600">แชร์แล้วได้เลย 50 แต้ม/คน</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-8 text-center shadow-2xl"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10">
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block mb-4"
            >
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl">
                <Gift className="w-16 h-16 text-yellow-600 mx-auto" />
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-2">
              ชวนเพื่อน คุณได้ 50 แต้ม
            </h2>
            <p className="text-white/90 text-lg mb-4">
              เพื่อนก็ได้ 50 แต้ม คุ้มทั้งสองฝ่าย!
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <div className="text-2xl font-bold text-white">{stats.totalReferrals}</div>
                <div className="text-xs text-white/80">เพื่อนที่ชวนมา</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <div className="text-2xl font-bold text-white">{stats.pointsEarned}</div>
                <div className="text-xs text-white/80">แต้มที่ได้</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <div className="text-2xl font-bold text-white">{stats.pendingReferrals}</div>
                <div className="text-xs text-white/80">รอยืนยัน</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Referral Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-600" />
            <h3 className="font-bold text-gray-900">โค้ดของคุณ</h3>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">รหัสแนะนำ</div>
                <div className="text-3xl font-bold text-gray-900 tracking-wider font-mono">
                  {referralCode}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyCode}
                className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-xl transition-colors"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          <p className="text-sm text-gray-600 text-center">
            เพื่อนกรอกโค้ดนี้ตอนสมัคร คุณกับเพื่อนได้แต้มทันที!
          </p>
        </motion.div>

        {/* QR Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-yellow-600" />
            <h3 className="font-bold text-gray-900">สแกน QR เพื่อแชร์</h3>
          </div>

          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-2xl shadow-inner">
              <QRCodeSVG 
                value={referralLink}
                size={192}
                level="H"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </div>

          <p className="text-sm text-gray-600 text-center">
            ให้เพื่อนสแกนเพื่อเปิดลิงก์ลงทะเบียน
          </p>
        </motion.div>

        {/* Share Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-yellow-600" />
            แชร์ไปยัง
          </h3>

          {/* Line Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={shareToLine}
            className="w-full bg-[#06C755] hover:bg-[#05b04b] text-white rounded-xl p-4 flex items-center justify-center gap-3 shadow-lg transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            <span className="font-bold text-lg">Share to Line</span>
            <ExternalLink className="w-4 h-4" />
          </motion.button>

          {/* Facebook Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={shareToFacebook}
            className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl p-4 flex items-center justify-center gap-3 shadow-lg transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="font-bold text-lg">Share to Facebook</span>
            <ExternalLink className="w-4 h-4" />
          </motion.button>

          {/* Copy Link Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={shareGeneric}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl p-4 flex items-center justify-center gap-3 shadow-lg transition-colors"
          >
            <AnimatePresence mode="wait">
              {linkCopied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-3"
                >
                  <Check className="w-6 h-6" />
                  <span className="font-bold text-lg">Copied!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="share"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-3"
                >
                  <Share2 className="w-6 h-6" />
                  <span className="font-bold text-lg">Share Link</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200"
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-600" />
            วิธีรับแต้ม
          </h3>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <div className="font-semibold text-gray-900">แชร์โค้ดหรือลิงก์</div>
                <div className="text-sm text-gray-600">ส่งให้เพื่อนผ่าน Line, Facebook หรือคัดลอกลิงก์</div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <div className="font-semibold text-gray-900">เพื่อนสมัครสมาชิก</div>
                <div className="text-sm text-gray-600">เพื่อนกรอกโค้ดของคุณตอนลงทะเบียน</div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <div className="font-semibold text-gray-900">รับแต้มทันที!</div>
                <div className="text-sm text-gray-600">คุณได้ 50 แต้ม เพื่อนก็ได้ 50 แต้ม</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Terms */}
        <div className="text-xs text-gray-500 text-center space-y-1 pb-8">
          <p>* แต้มจะเข้าเมื่อเพื่อนยืนยันอีเมลและใช้งานครั้งแรก</p>
          <p>* ชวนได้ไม่จำกัดจำนวน ยิ่งชวนเยอะยิ่งได้เยอะ</p>
        </div>
      </div>
    </div>
  );
}
