'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCircle, Store, Sparkles, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const { loginAsUser, loginAsMerchant } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (role: 'USER' | 'MERCHANT') => {
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      if (role === 'USER') {
        // Login as Customer
        loginAsUser();

        // Celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        toast.success('🎉 Welcome back, Hunter 007!', {
          description: 'Happy hunting for the best deals!'
        });

        onClose();
      } else {
        // Login as Merchant
        loginAsMerchant();

        toast.success('✅ Welcome, Siam Store!', {
          description: 'Redirecting to Merchant Dashboard...'
        });

        onClose();

        // Redirect to merchant dashboard
        setTimeout(() => {
          router.push('/merchant/dashboard');
        }, 500);
      }

      setIsLoading(false);
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-8 text-white">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-16 h-16 mb-4" />
                  </motion.div>
                  <h2 className="text-display mb-2">Welcome Back!</h2>
                  <p className="text-white/90 text-body-sm">
                    Choose your role to continue
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-4">
                <p className="text-center text-gray-600 text-body-sm mb-6">
                  Select how you want to login:
                </p>

                {/* Login as Customer Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLogin('USER')}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-xl">
                        <UserCircle className="w-8 h-8" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-h4">Login as Customer</h3>
                        <p className="text-white/80 text-body-sm">Hunt for deals & earn points</p>
                      </div>
                    </div>
                    <div className="text-3xl">🎯</div>
                  </div>
                </motion.button>

                {/* Login as Merchant Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLogin('MERCHANT')}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-xl">
                        <Store className="w-8 h-8" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-h4">Login as Merchant</h3>
                        <p className="text-white/80 text-body-sm">Manage your shop & deals</p>
                      </div>
                    </div>
                    <div className="text-3xl">🏪</div>
                  </div>
                </motion.button>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-body-sm">
                    <span className="px-4 bg-white text-gray-500">Don't have an account?</span>
                  </div>
                </div>

                {/* Register Link */}
                <button
                  onClick={onClose}
                  className="w-full text-center py-3 text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                >
                  Register New Account →
                </button>

                {/* Demo Notice */}
                <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-body-sm text-amber-900">Demo Mode</p>
                      <p className="text-caption text-amber-700 mt-1">
                        This is a simulated login. No real authentication required.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
