'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Store, Shield, AlertCircle } from 'lucide-react';
import { useAuthStore, type UserRole } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface RoleSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleSwitcher({ isOpen, onClose }: RoleSwitcherProps) {
  const { user, switchRole } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'USER');
  const router = useRouter();

  const handleSwitch = () => {
    if (!selectedRole) return;

    switchRole(selectedRole);
    
    // Redirect based on role
    if (selectedRole === 'MERCHANT') {
      toast.success('Switched to Merchant View! 🏪', {
        description: 'Redirecting to dashboard...'
      });
      router.push('/merchant/dashboard');
    } else {
      toast.success('Switched to User View! 🎯', {
        description: 'Redirecting to home...'
      });
      router.push('/');
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                <h2 className="text-h3">Switch View Mode</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-body-sm text-purple-100">
              For testing and demonstration purposes only
            </p>
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-body-sm text-amber-800">
                <p className="font-semibold mb-1">Demo Feature</p>
                <p>This switcher is for development and testing. In production, users would login with their specific account type.</p>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="p-6 space-y-4">
            <p className="text-body-sm text-gray-700 mb-3">
              Current Role: <span className="font-bold text-purple-600">{user?.role}</span>
            </p>

            {/* User Option */}
            <button
              onClick={() => setSelectedRole('USER')}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedRole === 'USER'
                  ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/20'
                  : 'border-gray-200 hover:border-orange-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedRole === 'USER'
                    ? 'bg-gradient-to-br from-orange-500 to-red-600'
                    : 'bg-gray-200'
                }`}>
                  <Users className={`w-6 h-6 ${
                    selectedRole === 'USER' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`font-bold mb-1 ${
                    selectedRole === 'USER' ? 'text-orange-600' : 'text-gray-900'
                  }`}>
                    User (Hunter) Mode
                  </h3>
                  <p className="text-sm text-gray-600">
                    Browse deals, scan QR codes, earn points
                  </p>
                </div>
                {selectedRole === 'USER' && (
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            {/* Merchant Option */}
            <button
              onClick={() => setSelectedRole('MERCHANT')}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedRole === 'MERCHANT'
                  ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                  : 'border-gray-200 hover:border-blue-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedRole === 'MERCHANT'
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    : 'bg-gray-200'
                }`}>
                  <Store className={`w-6 h-6 ${
                    selectedRole === 'MERCHANT' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`font-bold mb-1 ${
                    selectedRole === 'MERCHANT' ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    Merchant (Brand) Mode
                  </h3>
                  <p className="text-sm text-gray-600">
                    Manage shop, create promos, view analytics
                  </p>
                </div>
                {selectedRole === 'MERCHANT' && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSwitch}
              disabled={selectedRole === user?.role}
              className={`flex-1 py-3 px-6 font-bold rounded-xl transition-all ${
                selectedRole === user?.role
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : selectedRole === 'MERCHANT'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg'
              }`}
            >
              Switch Mode
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
