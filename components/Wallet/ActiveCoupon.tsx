'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Shield, AlertCircle, CheckCircle, X, Lock } from 'lucide-react';
import QRCode from 'react-qr-code';
import { markVoucherAsUsed } from '@/lib/pointsUtils';
import toast from 'react-hot-toast';

interface ActiveCouponProps {
  voucherId: string;
  voucherCode: string;
  voucherName: string;
  voucherValue: string;
  brand: string;
  qrData: string;
  onClose: () => void;
  onExpire: () => void;
}

const COUPON_DURATION = 15 * 60; // 15 minutes in seconds
const STORAGE_KEY_PREFIX = 'active_coupon_';

export default function ActiveCoupon({
  voucherId,
  voucherCode,
  voucherName,
  voucherValue,
  brand,
  qrData,
  onClose,
  onExpire
}: ActiveCouponProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState(COUPON_DURATION);
  const [isExpired, setIsExpired] = useState(false);
  const [showStaffPin, setShowStaffPin] = useState(false);
  const [pin, setPin] = useState('');
  const [startTime] = useState(() => {
    // Check if there's an existing timer
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${voucherId}`);
    if (stored) {
      const storedTime = parseInt(stored, 10);
      const elapsed = Math.floor((Date.now() - storedTime) / 1000);
      const remaining = Math.max(0, COUPON_DURATION - elapsed);
      
      if (remaining === 0) {
        setIsExpired(true);
        return Date.now();
      }
      
      setTimeRemaining(remaining);
      return storedTime;
    } else {
      // Start new timer
      const now = Date.now();
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${voucherId}`, now.toString());
      return now;
    }
  });

  useEffect(() => {
    // Update current time every second
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    if (isExpired) return;

    // Update countdown every second
    const countdownInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          onExpire();
          localStorage.removeItem(`${STORAGE_KEY_PREFIX}${voucherId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [isExpired, voucherId, onExpire]);

  useEffect(() => {
    // Cleanup on unmount if expired
    return () => {
      if (isExpired) {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${voucherId}`);
      }
    };
  }, [isExpired, voucherId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatClock = (date: Date) => {
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const handleStaffMarkUsed = () => {
    if (pin === '1234') {
      const success = markVoucherAsUsed(voucherId);
      if (success) {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${voucherId}`);
        toast.success('ทำเครื่องหมายใช้งานแล้ว (Staff)');
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } else {
      toast.error('รหัส PIN ไม่ถูกต้อง');
      setPin('');
    }
  };

  const progressPercent = (timeRemaining / COUPON_DURATION) * 100;
  const isUrgent = timeRemaining <= 60; // Last minute

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative ${
          isExpired ? 'opacity-60' : ''
        }`}
      >
        {/* Animated Background Particles */}
        {!isExpired && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-green-400 rounded-full opacity-20"
                initial={{
                  x: Math.random() * 400,
                  y: Math.random() * 800
                }}
                animate={{
                  y: [null, Math.random() * 800],
                  x: [null, Math.random() * 400],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: Math.random() * 5 + 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        )}

        {/* Animated Gradient Background */}
        {!isExpired && (
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              background: [
                'linear-gradient(45deg, #10b981 0%, #34d399 100%)',
                'linear-gradient(90deg, #34d399 0%, #10b981 100%)',
                'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                'linear-gradient(45deg, #10b981 0%, #34d399 100%)'
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        {/* Header */}
        <div className={`relative p-6 text-white ${
          isExpired 
            ? 'bg-gradient-to-r from-gray-500 to-slate-500' 
            : 'bg-gradient-to-r from-green-500 to-emerald-500'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              {isExpired ? (
                <AlertCircle className="w-7 h-7" />
              ) : (
                <Shield className="w-7 h-7" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {isExpired ? '⏰ Coupon Expired' : '✓ Verified Coupon'}
              </h2>
              <p className="text-green-100">
                {isExpired ? 'No longer valid' : 'Active - Live Verification'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Clock */}
        <div className="px-6 py-4 bg-gray-900 text-white relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"
            animate={{ x: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Current Time:</span>
            </div>
            <span className="text-2xl font-mono font-bold tracking-wider">
              {formatClock(currentTime)}
            </span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className={`px-6 py-6 ${
          isExpired ? 'bg-gray-100' : isUrgent ? 'bg-red-50' : 'bg-green-50'
        }`}>
          <p className="text-center text-sm font-semibold text-gray-700 mb-2">
            {isExpired ? 'Expired' : 'Time Remaining'}
          </p>
          <div className="relative">
            <motion.div
              className={`text-center text-6xl font-black font-mono ${
                isExpired ? 'text-gray-400' : isUrgent ? 'text-red-600' : 'text-green-600'
              }`}
              animate={!isExpired && isUrgent ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              {formatTime(timeRemaining)}
            </motion.div>
            
            {/* Progress Bar */}
            <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className={`h-full ${
                  isExpired ? 'bg-gray-400' : isUrgent ? 'bg-red-500' : 'bg-green-500'
                }`}
                initial={{ width: '100%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {isUrgent && !isExpired && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 bg-red-100 border-2 border-red-300 rounded-xl p-3 text-center"
            >
              <p className="text-red-800 font-bold text-sm">
                ⚠️ รีบใช้ด่วน! เหลือเวลาไม่ถึง 1 นาที
              </p>
            </motion.div>
          )}
        </div>

        {/* QR Code & Code */}
        <div className={`p-6 ${isExpired ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200 mb-4">
            <div className="flex justify-center mb-4">
              <QRCode
                value={qrData}
                size={200}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                viewBox={`0 0 200 200`}
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Coupon Code</p>
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4">
                <p className="text-3xl font-mono font-bold text-gray-900 tracking-wider">
                  {voucherCode}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <p className="font-bold text-blue-900 mb-1">{voucherName}</p>
            <p className="text-sm text-blue-700">{brand}</p>
            <p className="text-lg font-bold text-blue-900 mt-2">Value: {voucherValue}</p>
          </div>
        </div>

        {/* Staff Controls */}
        {!isExpired && (
          <div className="p-6 bg-gray-900 border-t-4 border-yellow-400">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-yellow-400" />
              <p className="text-sm font-bold text-yellow-400">STAFF ONLY</p>
            </div>
            
            {!showStaffPin ? (
              <button
                onClick={() => setShowStaffPin(true)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-xl transition-all"
              >
                🔒 Mark as Used (Staff Verification)
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4-digit PIN"
                  className="w-full px-4 py-3 border-2 border-yellow-400 rounded-xl text-center text-2xl font-mono font-bold"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleStaffMarkUsed}
                    disabled={pin.length !== 4}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition-all disabled:cursor-not-allowed"
                  >
                    ✓ Confirm
                  </button>
                  <button
                    onClick={() => {
                      setShowStaffPin(false);
                      setPin('');
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Demo PIN: 1234
                </p>
              </div>
            )}
          </div>
        )}

        {/* Expired Overlay */}
        {isExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gray-900/90 flex items-center justify-center"
          >
            <div className="text-center text-white p-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <AlertCircle className="w-24 h-24 mx-auto mb-4 text-red-400" />
              </motion.div>
              <h3 className="text-3xl font-bold mb-2">Coupon Expired</h3>
              <p className="text-gray-300 mb-6">
                This coupon has expired and can no longer be used
              </p>
              <button
                onClick={onClose}
                className="bg-white text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
