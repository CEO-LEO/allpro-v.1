'use client';

import { useState, useEffect } from 'react';
import { WifiIcon, SignalSlashIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    // Update on online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Show "Back online" message briefly
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator if offline on mount
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          {!isOnline ? (
            // Offline Bar - Red
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-center gap-3">
                  <SignalSlashIcon className="w-5 h-5 animate-pulse" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">
                      ⚠️ You are offline
                    </div>
                    <div className="text-xs text-red-100">
                      Showing cached data • Some features may be limited
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Back Online Bar - Green
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-center gap-3">
                  <WifiIcon className="w-5 h-5" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">
                      ✅ Back online!
                    </div>
                    <div className="text-xs text-green-100">
                      All features are now available
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
