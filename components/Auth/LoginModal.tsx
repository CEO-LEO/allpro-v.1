'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCircle, Store, Sparkles, Lock, Mail, Eye, EyeOff, Loader2, Fingerprint, Send } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { signIn, signOut as supabaseSignOut } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { setLoginInProgress } from '@/components/Auth/AuthListener';
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
  const { login, loginAsUser, loginAsMerchant } = useAuthStore();

  // ฟอร์ม state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAccountNotFound, setShowAccountNotFound] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Detect mobile for bottom-sheet layout
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Check WebAuthn (FaceID/TouchID) availability
  useEffect(() => {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => setBiometricAvailable(available))
        .catch(() => setBiometricAvailable(false));
    }
  }, []);

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
    setShowMagicLink(false);
    setMagicLinkEmail('');
    setMagicLinkSent(false);
    onClose();
  };

  // Social login handlers (demo mode — will redirect to real OAuth in production)
  const handleAppleLogin = async () => {
    if (!selectedRole) {
      setError('กรุณาเลือกบทบาทก่อน');
      return;
    }
    setIsLoading(true);
    // TODO: Replace with real Apple Sign-In
    // window.location.href = '/api/auth/apple?role=' + selectedRole;
    await new Promise((r) => setTimeout(r, 800));
    if (selectedRole === 'USER') {
      loginAsUser();
    } else {
      loginAsMerchant();
    }
    toast.success('เข้าสู่ระบบด้วย Apple สำเร็จ!');
    handleClose();
    if (selectedRole === 'MERCHANT') router.push('/merchant/dashboard');
  };

  const handleLineLogin = async () => {
    if (!selectedRole) {
      setError('กรุณาเลือกบทบาทก่อน');
      return;
    }
    setIsLoading(true);
    // TODO: Replace with real LINE Login
    // window.location.href = '/api/auth/line?role=' + selectedRole;
    await new Promise((r) => setTimeout(r, 800));
    if (selectedRole === 'USER') {
      loginAsUser();
    } else {
      loginAsMerchant();
    }
    toast.success('เข้าสู่ระบบด้วย LINE สำเร็จ!');
    handleClose();
    if (selectedRole === 'MERCHANT') router.push('/merchant/dashboard');
  };

  // Biometric (WebAuthn) login handler
  const handleBiometricLogin = async () => {
    if (!selectedRole) {
      setError('กรุณาเลือกบทบาทก่อน');
      return;
    }
    try {
      setIsLoading(true);
      // TODO: Replace with real WebAuthn assertion
      // const credential = await navigator.credentials.get({
      //   publicKey: { challenge, rpId, allowCredentials, userVerification: 'required' }
      // });
      await new Promise((r) => setTimeout(r, 600));
      if (selectedRole === 'USER') {
        loginAsUser();
      } else {
        loginAsMerchant();
      }
      toast.success('เข้าสู่ระบบด้วย FaceID/TouchID สำเร็จ!');
      handleClose();
      if (selectedRole === 'MERCHANT') router.push('/merchant/dashboard');
    } catch {
      setError('ไม่สามารถยืนยันตัวตนได้ กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  // Magic Link handler
  const handleMagicLink = async () => {
    if (!magicLinkEmail.trim()) {
      setError('กรุณากรอกอีเมล');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // TODO: Replace with real magic link API
      // await fetch('/api/auth/magic-link', { method: 'POST', body: JSON.stringify({ email: magicLinkEmail }) });
      await new Promise((r) => setTimeout(r, 800));
      setMagicLinkSent(true);
      toast.success('ส่งลิงก์ล็อกอินไปที่อีเมลแล้ว!');
    } catch {
      setError('ไม่สามารถส่งลิงก์ได้ กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  // Supabase Auth Login (พร้อม Demo fallback)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowAccountNotFound(false);

    // Validation — ไม่ต้อง set loading ถ้า validate ไม่ผ่าน
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
    console.log('[Login] Starting login —', { email: email.trim(), role: selectedRole, supabaseConfigured: isSupabaseConfigured });

    try {
      // ── ถ้า Supabase ยังไม่ได้ตั้งค่า → ใช้ Demo Mode ──
      if (!isSupabaseConfigured) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (selectedRole === 'USER') {
          loginAsUser();
          toast.success('Demo Mode — ยินดีต้อนรับ!');
        } else {
          loginAsMerchant();
          toast.success('Demo Mode — Merchant Dashboard');
        }
        handleClose();
        if (selectedRole === 'MERCHANT') {
          router.push('/merchant/dashboard');
        }
        return;
      }

      // ── Supabase Auth — timeout protection (10s) ──
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 10000)
      );

      // ★ Tell AuthListener to NOT handle the SIGNED_IN event — we'll do it ourselves
      setLoginInProgress(true);

      console.log('[Login] Calling signIn...');
      const result = await Promise.race([
        signIn(email.trim(), password),
        timeoutPromise,
      ]);
      console.log('[Login] signIn result:', { success: result.success, hasUser: !!result.user, error: result.error });

      if (!result.success) {
        setError(result.error || 'เข้าสู่ระบบไม่สำเร็จ');
        // แสดงปุ่มสมัครถ้าอีเมลไม่ถูกต้องหรือไม่พบ
        if (
          result.error?.includes('ไม่ถูกต้อง') || 
          result.error?.includes('ไม่พบ')
        ) {
          setShowAccountNotFound(true);
        }
        // ถ้า email_not_confirmed → ไม่ต้องแสดงปุ่มสมัคร เพราะบัญชีมีอยู่แล้ว
        return;
      }

      // ── Guard: ตรวจสอบว่า result.user มีข้อมูลครบ ──
      if (!result.user) {
        setError('เข้าสู่ระบบสำเร็จแต่ไม่พบข้อมูลผู้ใช้ กรุณาลองใหม่');
        return;
      }

      // ── เช็ค Role จาก Database vs แท็บที่เลือก ──
      const dbRole = result.user.role;

      if (selectedRole === 'MERCHANT' && dbRole !== 'MERCHANT') {
        setLoginInProgress(false);
        await supabaseSignOut();
        setError('บัญชีนี้ไม่ใช่บัญชีร้านค้า กรุณาสมัครสมาชิกเป็นร้านค้าก่อน');
        setShowAccountNotFound(true);
        return;
      }

      if (selectedRole === 'USER' && dbRole === 'MERCHANT') {
        setLoginInProgress(false);
        await supabaseSignOut();
        setError('บัญชีนี้เป็นบัญชีร้านค้า กรุณาเลือกแท็บ "ร้านค้า" เพื่อเข้าสู่ระบบ');
        return;
      }

      // ── Role ตรงกัน → set store + redirect ──
      console.log('[Login] Calling store login —', { role: dbRole, name: result.user.name, shopName: result.user.shopName });
      login({
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: dbRole,
        avatar: result.user.avatar,
        xp: result.user.xp ?? 0,
        coins: result.user.coins ?? 0,
        level: result.user.level ?? 1,
        preferred_tags: [],
        onboardingCompleted: false,
        // Merchant fields from Supabase merchant_profiles table
        shopName: result.user.shopName,
        shopLogo: result.user.shopLogo,
        shopAddress: result.user.shopAddress,
        phone: result.user.phone,
        shopSocialLine: result.user.shopSocialLine,
        shopSocialFacebook: result.user.shopSocialFacebook,
        shopSocialInstagram: result.user.shopSocialInstagram,
        shopSocialWebsite: result.user.shopSocialWebsite,
      });
      console.log('[Login] Store login completed');

      if (dbRole === 'MERCHANT') {
        toast.success(`ยินดีต้อนรับ ${result.user.name}!`);
        handleClose();
        router.push('/merchant/dashboard');
      } else {
        toast.success(`ยินดีต้อนรับกลับ ${result.user.name}!`);
        handleClose();
      }
    } catch (err) {
      console.error('[Login] Error:', err);
      if (err instanceof Error && err.message === 'TIMEOUT') {
        setError('เซิร์ฟเวอร์ไม่ตอบสนอง กรุณาลองใหม่ หรือใช้โหมดทดลอง');
      } else {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      console.log('[Login] Finally — setIsLoading(false)');
      setIsLoading(false);
      setLoginInProgress(false);
    }
  };

  // Demo mode fallback — ใช้เมื่อ Supabase ไม่ทำงาน
  const handleDemoLogin = () => {
    if (!selectedRole) {
      setError('กรุณาเลือกบทบาทก่อน');
      return;
    }
    if (selectedRole === 'USER') {
      loginAsUser();
      toast.success('เข้าสู่ระบบโหมดทดลอง!');
    } else {
      loginAsMerchant();
      toast.success('เข้าสู่ระบบร้านค้าโหมดทดลอง!');
    }
    handleClose();
    if (selectedRole === 'MERCHANT') {
      router.push('/merchant/dashboard');
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
          />

          {/* Modal — Portal ไปที่ body เพื่อให้เงาคลุมเมนูด้านบน */}
          <div className={`fixed inset-0 z-[9999] overflow-y-auto ${isMobile ? 'flex items-end' : 'flex items-center justify-center p-4'}`}>
            <motion.div
              initial={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0, y: 20 }}
              animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1, y: 0 }}
              exit={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className={`bg-white shadow-2xl w-full overflow-hidden ${isMobile ? 'rounded-t-2xl max-h-[92vh] overflow-y-auto' : 'rounded-2xl max-w-[340px]'}`}
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
              <form onSubmit={handleLogin} className={`px-5 py-4 space-y-2.5 ${isMobile ? 'pb-6' : ''}`}>
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
                      name="email"
                      type="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="username email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
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
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
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
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:from-orange-700 active:to-red-700 text-white py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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

                {/* Social Login Divider */}
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-400">หรือเข้าสู่ระบบด้วย</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-2">
                  {/* Continue with Apple */}
                  <button
                    type="button"
                    onClick={handleAppleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-black text-white rounded-lg text-xs font-semibold hover:bg-gray-900 active:bg-gray-800 transition-all disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Continue with Apple
                  </button>

                  {/* Login with LINE */}
                  <button
                    type="button"
                    onClick={handleLineLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-[#06C755] text-white rounded-lg text-xs font-semibold hover:bg-[#05b34d] active:bg-[#049a42] transition-all disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    Login with LINE
                  </button>

                  {/* Biometric Login (FaceID/TouchID) */}
                  {biometricAvailable && (
                    <button
                      type="button"
                      onClick={handleBiometricLogin}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100 active:bg-gray-200 transition-all disabled:opacity-50"
                    >
                      <Fingerprint className="w-4 h-4 text-blue-500" />
                      เข้าสู่ระบบด้วย FaceID / TouchID
                    </button>
                  )}
                </div>

                {/* Magic Link Toggle */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowMagicLink(!showMagicLink)}
                    className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showMagicLink ? '← กลับไปกรอกรหัสผ่าน' : '📧 ส่งลิงก์ล็อกอินไปที่อีเมล'}
                  </button>
                </div>

                {/* Magic Link Form */}
                <AnimatePresence>
                  {showMagicLink && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {magicLinkSent ? (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                          <Send className="w-5 h-5 text-green-500 mx-auto mb-1" />
                          <p className="text-xs font-semibold text-green-700">ส่งลิงก์แล้ว!</p>
                          <p className="text-[10px] text-green-600 mt-0.5">กรุณาตรวจสอบอีเมลของคุณแล้วคลิกลิงก์เพื่อเข้าสู่ระบบ</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="email"
                              inputMode="email"
                              value={magicLinkEmail}
                              onChange={(e) => setMagicLinkEmail(e.target.value)}
                              placeholder="กรอกอีเมลของคุณ"
                              autoComplete="email"
                              autoCapitalize="none"
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleMagicLink}
                            disabled={isLoading}
                            className="w-full py-2 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            ส่งลิงก์ล็อกอิน
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Register Divider */}
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

                {/* Demo Notice + Quick Login */}
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-1.5">
                    <Lock className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-amber-800">ล็อคอินไม่ได้?</p>
                      <p className="text-[10px] text-amber-600 mt-0.5 leading-relaxed">
                        ใช้โหมดทดลองเพื่อเข้าใช้งานทันที
                      </p>
                      <button
                        type="button"
                        onClick={handleDemoLogin}
                        className="mt-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-semibold rounded-md transition-colors"
                      >
                        เข้าสู่ระบบโหมดทดลอง
                      </button>
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

  // Portal ไปที่ document.body เพื่อให้อยู่นอก stacking context ของ Navbar
  if (typeof window === 'undefined') return null;
  return createPortal(portalContent, document.body);
}
