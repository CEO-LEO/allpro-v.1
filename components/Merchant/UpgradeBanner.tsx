'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { XMarkIcon, SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

export default function UpgradeBanner() {
  const [isPro, setIsPro] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check PRO status
    const currentMerchant = localStorage.getItem('current_merchant') || 'merchant-demo';
    const proStatus = localStorage.getItem(`merchant_${currentMerchant}_isPro`) === 'true';
    setIsPro(proStatus);
    
    // Check if banner was dismissed
    const dismissed = localStorage.getItem(`merchant_${currentMerchant}_banner_dismissed`) === 'true';
    setIsDismissed(dismissed);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    const currentMerchant = localStorage.getItem('current_merchant') || 'merchant-demo';
    localStorage.setItem(`merchant_${currentMerchant}_banner_dismissed`, 'true');
  };

  // Don't show banner if PRO or dismissed
  if (isPro || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-pink-400/10 animate-pulse"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                {/* Icon */}
                <div className="hidden sm:flex w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex-shrink-0 items-center justify-center">
                  <RocketLaunchIcon className="w-6 h-6 text-white" />
                </div>
                
                {/* Message */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <SparklesIcon className="w-5 h-5 text-yellow-300" />
                    <h3 className="text-white font-bold text-lg">
                      Get 3x More Customers with PRO
                    </h3>
                  </div>
                  <p className="text-indigo-100 text-sm">
                    🚀 AI Priority • 🤖 Auto-Reply • ✅ Verified Badge • Only ฿599/month
                  </p>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex items-center gap-3">
                <Link
                  href="/merchant/upgrade"
                  className="px-6 py-2.5 bg-white hover:bg-gray-50 text-indigo-600 font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all whitespace-nowrap"
                >
                  Upgrade Now
                </Link>
                
                <button
                  onClick={handleDismiss}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Dismiss"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Stats ticker */}
          <div className="relative bg-black/20 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <div className="flex items-center justify-center gap-8 text-xs text-white/90">
                <div className="flex items-center gap-1.5">
                  <span className="text-yellow-300">⭐</span>
                  <span>1,200+ PRO Merchants</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-green-300">📈</span>
                  <span>280% Avg Sales Increase</span>
                </div>
                <div className="hidden md:flex items-center gap-1.5">
                  <span className="text-blue-300">🤖</span>
                  <span>450+ Questions Answered Daily</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
