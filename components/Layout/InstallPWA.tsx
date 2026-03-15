'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isInStandaloneMode = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      );
    };

    setIsStandalone(isInStandaloneMode());

    // Check if user has dismissed before
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
        return;
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Wait 3 seconds before showing prompt (let user see the app first)
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
    setIsDismissed(true);
  };

  // Don't show if already installed or dismissed
  if (isStandalone || isDismissed || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showInstallPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden" // Mobile only
        >
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9L12 2L21 9V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V9Z" fill="#FFD700"/>
                    <path d="M9 21V12H15V21" fill="#FF5722"/>
                    <text x="12" y="10" fontSize="8" fontWeight="bold" fill="#FF5722" textAnchor="middle">%</text>
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-body-sm mb-0.5">
                    Install All Pro App
                  </h3>
                  <p className="text-caption text-white/90">
                    🚀 Faster access • 📱 Works offline • 💾 Save to home screen
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="px-4 py-2 bg-white text-orange-600 rounded-lg shadow-lg hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-2 text-body-sm"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Install
                  </button>
                  
                  <button
                    onClick={handleDismiss}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Not now"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Features Bar */}
            <div className="bg-black/20 backdrop-blur-sm border-t border-white/10">
              <div className="max-w-7xl mx-auto px-4 py-2">
                <div className="flex items-center justify-center gap-6 text-caption">
                  <div className="flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>Instant Load</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>📵</span>
                    <span>Offline Mode</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>🔔</span>
                    <span>Push Alerts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
