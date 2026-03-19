'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCircle, Store, UserPlus, Lock, Mail, Eye, EyeOff, Loader2, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { signUp } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

// บทบาทที่เลือกได้
type SelectedRole = 'USER' | 'MERCHANT' | null;

// ตรวจสอบรูปแบบอีเมลเบื้องต้น
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  // ฟอร์ม state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setSelectedRole(null);
    setError('');
    setIsLoading(false);
    onClose();
  };

  // สลับไปหน้า Login
  const handleGoToLogin = () => {
    handleClose();
    onSwitchToLogin();
  };

  // Client-side Validation
  const validate = (): string | null => {
    if (!name.trim()) return 'กรุณากรอกชื่อ-นามสกุล';
    if (!email.trim()) return 'กรุณากรอกอีเมล';
    if (!EMAIL_REGEX.test(email)) return 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!password) return 'กรุณากรอกรหัสผ่าน';
    if (password.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    if (password !== confirmPassword) return 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน';
    if (!selectedRole) return 'กรุณาเลือกบทบาท';
    return null;
  };

  // Supabase Auth Register (พร้อม Demo fallback)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // ── ถ้า Supabase ยังไม่ได้ตั้งค่า → Demo Mode ──
      if (!isSupabaseConfigured) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        toast.success('🎉 Demo Mode — สมัครสำเร็จ! กรุณาเข้าสู่ระบบ');
        handleGoToLogin();
        return;
      }

      // ── Supabase Auth — Register จริง ──
      console.log('📝 Calling signUp with:', { email, name, selectedRole });
      const result = await signUp(email, password, name, selectedRole);
      console.log('📦 signUp result:', { success: result.success, error: result.error });

      if (!result.success) {
        setError(result.error || 'สมัครสมาชิกไม่สำเร็จ');
        return;
      }

      toast.success('🎉 สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      handleGoToLogin();
    } catch (err) {
      console.error('❌ Register error:', err);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const portalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
          />

          {/* Modal — Portal ไปที่ body เพื่อให้เงาคลุมเมนูด้านบน */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header — Gradient ส้ม-ชมพู เหมือน Login */}
              <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 px-6 pt-5 pb-4 text-white">
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <UserPlus className="w-10 h-10 mb-2" />
                  </motion.div>
                  <h2 className="text-lg font-bold mb-0.5">สมัครสมาชิก</h2>
                  <p className="text-white/80 text-xs">สร้างบัญชีเพื่อเริ่มต้นใช้งาน All Pro</p>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleRegister} className="p-5 space-y-3">
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

                {/* ชื่อ-นามสกุล */}
                <div>
                  <label htmlFor="register-name" className="block text-xs font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="register-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="กรอกชื่อ-นามสกุล"
                      autoComplete="name"
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* อีเมล */}
                <div>
                  <label htmlFor="register-email" className="block text-xs font-medium text-gray-700 mb-1">อีเมล</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* รหัสผ่าน */}
                <div>
                  <label htmlFor="register-password" className="block text-xs font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                      autoComplete="new-password"
                      className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
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

                {/* ยืนยันรหัสผ่าน */}
                <div>
                  <label htmlFor="register-confirm-password" className="block text-xs font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                      autoComplete="new-password"
                      className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* เลือกบทบาท */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1.5">เลือกบทบาท</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('USER')}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all duration-200 ${
                        selectedRole === 'USER'
                          ? 'border-green-500 bg-green-50 ring-1 ring-green-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <UserCircle className={`w-6 h-6 transition-colors duration-200 ${selectedRole === 'USER' ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={`text-xs font-semibold transition-colors duration-200 ${selectedRole === 'USER' ? 'text-green-700' : 'text-gray-600'}`}>
                        ลูกค้า 🎯
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('MERCHANT')}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all duration-200 ${
                        selectedRole === 'MERCHANT'
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Store className={`w-6 h-6 transition-colors duration-200 ${selectedRole === 'MERCHANT' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`text-xs font-semibold transition-colors duration-200 ${selectedRole === 'MERCHANT' ? 'text-blue-700' : 'text-gray-600'}`}>
                        ร้านค้า 🏪
                      </span>
                    </button>
                  </div>
                </div>

                {/* ปุ่มสมัครสมาชิก */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:from-orange-700 active:to-red-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังสมัครสมาชิก...
                    </>
                  ) : (
                    'สมัครสมาชิก'
                  )}
                </button>

                {/* Divider */}
                <div className="relative py-0.5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-400">มีบัญชีอยู่แล้ว?</span>
                  </div>
                </div>

                {/* ลิงก์กลับไปหน้า Login */}
                <button
                  type="button"
                  onClick={handleGoToLogin}
                  className="w-full text-center py-2 text-orange-600 hover:text-orange-700 text-sm font-semibold transition-colors"
                >
                  ← เข้าสู่ระบบ
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(portalContent, document.body);
}
