'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCircle, Store, Sparkles, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

// บทบาทที่เลือกได้
type SelectedRole = 'USER' | 'MERCHANT' | null;

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const router = useRouter();
  const { loginAsUser, loginAsMerchant } = useAuthStore();

  // ฟอร์ม state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // รีเซ็ตฟอร์มเมื่อปิด modal
  const handleClose = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setSelectedRole(null);
    setError('');
    setIsLoading(false);
    onClose();
  };

  // จำลอง API login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim()) {
      setError('กรุณากรอกอีเมล');
      return;
    }
    if (!password) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }
    if (!selectedRole) {
      setError('กรุณาเลือกบทบาท');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: เปลี่ยนเป็น API จริง — e.g. const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role: selectedRole }) });
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // จำลอง: demo@test.com / password ล็อกอินสำเร็จเสมอ (Demo Mode)
      if (selectedRole === 'USER') {
        loginAsUser();
        toast.success('🎉 ยินดีต้อนรับกลับ Hunter 007!');
        handleClose();
      } else {
        loginAsMerchant();
        toast.success('✅ ยินดีต้อนรับ Siam Store!');
        handleClose();
        setTimeout(() => {
          router.push('/merchant/dashboard');
        }, 500);
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
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
            onClick={handleClose}
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
              <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 px-8 pt-8 pb-7 text-white">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-14 h-14 mb-3" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-1">Welcome Back!</h2>
                  <p className="text-white/80 text-sm">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-4">
                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center font-medium"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่าน</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">เลือกบทบาท</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('USER')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedRole === 'USER'
                          ? 'border-green-500 bg-green-50 ring-1 ring-green-200 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <UserCircle className={`w-7 h-7 transition-colors duration-200 ${selectedRole === 'USER' ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-semibold transition-colors duration-200 ${selectedRole === 'USER' ? 'text-green-700' : 'text-gray-600'}`}>
                        ลูกค้า 🎯
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('MERCHANT')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedRole === 'MERCHANT'
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <Store className={`w-7 h-7 transition-colors duration-200 ${selectedRole === 'MERCHANT' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-semibold transition-colors duration-200 ${selectedRole === 'MERCHANT' ? 'text-blue-700' : 'text-gray-600'}`}>
                        ร้านค้า 🏪
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:from-orange-700 active:to-red-700 text-white py-3.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    'เข้าสู่ระบบ'
                  )}
                </button>

                {/* Divider */}
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-400">ยังไม่มีบัญชี?</span>
                  </div>
                </div>

                {/* Register Link */}
                <button
                  type="button"
                  onClick={() => {
                    if (onSwitchToRegister) {
                      handleClose();
                      onSwitchToRegister();
                    }
                  }}
                  className="w-full text-center py-3 text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                >
                  สมัครสมาชิกใหม่ →
                </button>

                {/* Demo Notice */}
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800">Demo Mode</p>
                      <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                        ใช้อีเมลและรหัสผ่านใดก็ได้เพื่อทดลองใช้งาน ระบบจำลองจะล็อกอินอัตโนมัติ
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
