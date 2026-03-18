'use client';

import { useState, useEffect } from 'react';
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
  const [showAccountNotFound, setShowAccountNotFound] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // รีเซ็ตฟอร์มเมื่อปิด modal
  const handleClose = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setSelectedRole(null);
    setError('');
    setIsLoading(false);
    setShowAccountNotFound(false);
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
    setShowAccountNotFound(false);

    try {
      // TODO: เปลี่ยนเป็น API จริง — e.g. const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role: selectedRole }) });
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // จำลอง: ตรวจสอบบัญชี — ถ้าไม่ใช่ demo account แสดงข้อผิดพลาดให้สมัครก่อน
      const isDemoAccount = email.toLowerCase() === 'demo@test.com' || email.toLowerCase() === 'test@test.com';

      if (!isDemoAccount) {
        setError('ไม่พบบัญชีผู้ใช้ กรุณาสมัครสมาชิกก่อน');
        setShowAccountNotFound(true);
        return;
      }

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-[340px] overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 px-5 pt-4 pb-3 text-white">
                <button
                  onClick={handleClose}
                  className="absolute top-2.5 right-2.5 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-8 h-8 mb-1.5" />
                  </motion.div>
                  <h2 className="text-base font-bold mb-0.5">Welcome Back!</h2>
                  <p className="text-white/80 text-[11px]">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleLogin} className="px-5 py-4 space-y-2.5">
                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 text-center font-medium"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="block text-xs font-medium text-gray-700 mb-1">อีเมล</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="login-password" className="block text-xs font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs text-gray-900 placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1.5">เลือกบทบาท</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('USER')}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all duration-200 ${
                        selectedRole === 'USER'
                          ? 'border-green-500 bg-green-50 ring-1 ring-green-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <UserCircle className={`w-5 h-5 transition-colors duration-200 ${selectedRole === 'USER' ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={`text-[11px] font-semibold transition-colors duration-200 ${selectedRole === 'USER' ? 'text-green-700' : 'text-gray-600'}`}>
                        ลูกค้า 🎯
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('MERCHANT')}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all duration-200 ${
                        selectedRole === 'MERCHANT'
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Store className={`w-5 h-5 transition-colors duration-200 ${selectedRole === 'MERCHANT' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`text-[11px] font-semibold transition-colors duration-200 ${selectedRole === 'MERCHANT' ? 'text-blue-700' : 'text-gray-600'}`}>
                        ร้านค้า 🏪
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:from-orange-700 active:to-red-700 text-white py-2 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    'เข้าสู่ระบบ'
                  )}
                </button>

                {/* Divider */}
                <div className="relative py-0.5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-400">ยังไม่มีบัญชี?</span>
                  </div>
                </div>

                {/* Register Link — pulsing when account not found */}
                <button
                  type="button"
                  onClick={() => {
                    if (onSwitchToRegister) {
                      handleClose();
                      onSwitchToRegister();
                    }
                  }}
                  className={`w-full text-center py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    showAccountNotFound
                      ? 'bg-orange-50 text-orange-600 border-2 border-orange-400 animate-pulse'
                      : 'text-orange-600 hover:text-orange-700'
                  }`}
                >
                  {showAccountNotFound ? '👉 สมัครสมาชิกใหม่เลย!' : 'สมัครสมาชิกใหม่ →'}
                </button>

                {/* Demo Notice */}
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-1.5">
                    <Lock className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold text-amber-800">Demo Mode</p>
                      <p className="text-[10px] text-amber-600 mt-0.5 leading-relaxed">
                        ใช้ demo@test.com เพื่อทดลองใช้งาน หรือสมัครสมาชิกก่อน
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
