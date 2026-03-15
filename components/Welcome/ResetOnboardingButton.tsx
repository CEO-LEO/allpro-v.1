'use client';

import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetOnboardingButton() {
  const handleReset = () => {
    localStorage.removeItem('hasSeenOnboarding');
    toast.success('รีเซ็ตสำเร็จ! รีเฟรชหน้าเพื่อดู Onboarding อีกครั้ง', {
      duration: 5000,
      icon: '🔄',
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <motion.button
      onClick={handleReset}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      className="fixed bottom-20 right-6 z-50 bg-gray-900 hover:bg-gray-800 text-white p-4 rounded-full shadow-2xl flex items-center gap-2"
      title="รีเซ็ต Onboarding (Demo)"
    >
      <RotateCcw className="w-5 h-5" />
      <span className="text-sm font-medium hidden sm:inline">รีเซ็ต</span>
    </motion.button>
  );
}
