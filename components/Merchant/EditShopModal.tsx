'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Store, Upload, Camera, Loader2, CheckCircle, MessageCircle, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { resolveImageUrl } from '@/lib/imageUrl';
import { formatLineUrl, formatFacebookUrl, formatInstagramUrl, formatWebsiteUrl } from '@/lib/socialLinks';

interface EditShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditShopModal({ isOpen, onClose }: EditShopModalProps) {
  const { user, updateUser } = useAuthStore();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // ═══ Controlled Form State ═══
  const [formData, setFormData] = useState({
    shopName: user?.shopName || '',
    description: user?.shopDescription || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.shopAddress || '',
    category: user?.shopCategory || '',
    openingHours: user?.shopOpeningHours || '',
    paymentMethods: user?.shopPaymentMethods || '',
    socialLine: user?.shopSocialLine || '',
    socialFacebook: user?.shopSocialFacebook || '',
    socialInstagram: user?.shopSocialInstagram || '',
    socialWebsite: user?.shopSocialWebsite || '',
  });

  // Re-sync form when modal opens (so updated user data is reflected)
  useEffect(() => {
    if (isOpen) {
      setFormData({
        shopName: user?.shopName || '',
        description: user?.shopDescription || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: user?.shopAddress || '',
        category: user?.shopCategory || '',
        openingHours: user?.shopOpeningHours || '',
        paymentMethods: user?.shopPaymentMethods || '',
        socialLine: user?.shopSocialLine || '',
        socialFacebook: user?.shopSocialFacebook || '',
        socialInstagram: user?.shopSocialInstagram || '',
        socialWebsite: user?.shopSocialWebsite || '',
      });
      setLogoPreview(null);
    }
  }, [isOpen, user]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    logoFileRef.current = file;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Helper: run promise with timeout (prevents hanging)
  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T | null> =>
    Promise.race([promise, new Promise<null>(resolve => setTimeout(() => resolve(null), ms))]);

  // Helper: getSession with retry (handles hydration delay / slow restore)
  const getSessionWithRetry = async (retries = 3, delayMs = 500): Promise<{ user: { id: string } } | null> => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await withTimeout(Promise.resolve(supabase.auth.getSession()), 5000);
        const session = res?.data?.session;
        if (session?.user?.id) {
          return session;
        }
        console.warn(`[EditShop] getSession attempt ${i + 1}/${retries}: no valid session, retrying...`);
      } catch (err) {
        console.warn(`[EditShop] getSession attempt ${i + 1}/${retries} error:`, err);
      }
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
    return null;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const logoVal = logoPreview || user?.shopLogo || undefined;

      const isComplete = !!(
        formData.shopName?.trim() &&
        logoVal &&
        formData.address?.trim() &&
        formData.phone?.trim() && formData.phone.trim().length >= 9
      );

      // ═══ 1) LOCAL SAVE FIRST (instant) ═══
      updateUser({
        shopName: formData.shopName || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        shopLogo: logoVal,
        shopDescription: formData.description || undefined,
        shopAddress: formData.address || undefined,
        shopCategory: formData.category || undefined,
        shopOpeningHours: formData.openingHours || undefined,
        shopPaymentMethods: formData.paymentMethods || undefined,
        shopSocialLine: formData.socialLine ? formatLineUrl(formData.socialLine) : undefined,
        shopSocialFacebook: formData.socialFacebook ? formatFacebookUrl(formData.socialFacebook) : undefined,
        shopSocialInstagram: formData.socialInstagram ? formatInstagramUrl(formData.socialInstagram) : undefined,
        shopSocialWebsite: formData.socialWebsite ? formatWebsiteUrl(formData.socialWebsite) : undefined,
        merchantProfileComplete: isComplete,
      });

      // ═══ 2) SHOW SUCCESS IMMEDIATELY ═══
      setSaveSuccess(true);
      setIsSaving(false);

      setTimeout(() => {
        setSaveSuccess(false);
        logoFileRef.current = null;
        onClose();
      }, 1200);

      // ═══ 3) SUPABASE SAVE IN BACKGROUND (fire-and-forget, with retry) ═══
      if (isSupabaseConfigured) {
        (async () => {
          try {
            const session = await getSessionWithRetry(3, 500);
            if (!session) {
              console.warn('[EditShop] ❌ getSession failed after 3 retries — no valid session');
              alert('ไม่สามารถซิงค์ข้อมูลกับเซิร์ฟเวอร์ได้ (session หมดอายุ)\nกรุณารีเฟรชหน้าใหม่ หรือ login ใหม่อีกครั้ง');
              return;
            }

            console.log('[EditShop] Supabase session: ✅ uid=' + session.user.id);

            // Upload logo if new file
            let finalLogo = logoVal;
            if (logoFileRef.current) {
              const file = logoFileRef.current;
              const fileExt = file.name.split('.').pop() || 'png';
              const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
              const filePath = `shop-logos/${fileName}`;
              const uploadRes = await withTimeout(
                Promise.resolve(supabase.storage.from('promotions').upload(filePath, file, { contentType: file.type, upsert: true })),
                8000
              );
              if (uploadRes && !uploadRes.error) {
                finalLogo = filePath;
                updateUser({ shopLogo: filePath });
              } else {
                console.warn('[EditShop] Logo upload failed or timed out');
              }
            }

            // Upsert merchant profile
            const upsertRes = await withTimeout(
              Promise.resolve(supabase.from('merchant_profiles').upsert({
                user_id: session.user.id,
                shop_name: formData.shopName || null,
                phone: formData.phone || null,
                shop_logo: finalLogo || null,
                shop_address: formData.address || null,
                line_id: formData.socialLine || null,
                instagram: formData.socialInstagram || null,
                facebook: formData.socialFacebook || null,
                website: formData.socialWebsite || null,
              }, { onConflict: 'user_id' }).select()),
              8000
            );

            if (upsertRes && !upsertRes.error) {
              console.log('[EditShop] ✅ Supabase upsert success:', upsertRes.data);
            } else {
              console.error('[EditShop] ❌ Supabase upsert error:', upsertRes?.error || 'timeout');
            }
          } catch (bgErr) {
            console.warn('[EditShop] Background save error:', bgErr);
          }
        })();
      }
    } catch (err) {
      console.error('EditShopModal save error:', err);
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-600" />
                แก้ไขข้อมูลร้านค้า
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Drag Handle (mobile) */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-gray-200 mx-auto mt-2" />

            <div className="p-5 sm:p-6 space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">โลโก้ร้านค้า</label>
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="relative group flex-shrink-0"
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all bg-gray-50 flex items-center justify-center">
                      {logoPreview || user?.shopLogo ? (
                        <img
                          src={logoPreview || resolveImageUrl(user?.shopLogo || '')}
                          alt="Shop logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-8 h-8 text-gray-400" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <Upload className="w-4 h-4" /> อัปโหลดโลโก้
                    </button>
                    <p className="text-xs text-gray-500 mt-1.5">PNG, JPG ขนาดไม่เกิน 2MB</p>
                  </div>
                </div>
              </div>

              {/* Shop Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อร้านค้า</label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                  placeholder="ชื่อร้านค้าของคุณ"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียดร้านค้า</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="อธิบายเกี่ยวกับร้านค้าของคุณ..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-none"
                />
              </div>

              {/* Contact Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="0xx-xxx-xxxx"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่ร้านค้า</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="เลขที่ ถนน แขวง เขต จังหวัด"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-none"
                />
              </div>

              {/* Category & Opening Hours */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทร้านค้า</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                  >
                    <option value="">เลือกประเภท</option>
                    <option value="อาหารและเครื่องดื่ม">อาหารและเครื่องดื่ม</option>
                    <option value="แฟชั่นและเครื่องแต่งกาย">แฟชั่นและเครื่องแต่งกาย</option>
                    <option value="สุขภาพและความงาม">สุขภาพและความงาม</option>
                    <option value="อิเล็กทรอนิกส์และแกดเจ็ต">อิเล็กทรอนิกส์และแกดเจ็ต</option>
                    <option value="ท่องเที่ยวและบริการ">ท่องเที่ยวและบริการ</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">เวลาทำการ</label>
                  <input
                    type="text"
                    value={formData.openingHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
                    placeholder="เช่น 09:00 - 21:00"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ช่องทางชำระเงิน</label>
                <input
                  type="text"
                  value={formData.paymentMethods}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethods: e.target.value }))}
                  placeholder="เช่น โอนผ่านธนาคาร, PromptPay, บัตรเครดิต"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                />
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">ช่องทางโซเชียล</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                        <MessageCircle className="w-3 h-3 text-white" />
                      </div>
                      <input
                        type="text"
                        value={formData.socialLine}
                        onChange={(e) => setFormData(prev => ({ ...prev, socialLine: e.target.value }))}
                        placeholder="LINE ID เช่น @myshop หรือ myshop123"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/40 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 ml-1">กรอก LINE ID ระบบจะสร้างลิงก์ให้อัตโนมัติ</p>
                  </div>
                  <div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">f</span>
                      </div>
                      <input
                        type="text"
                        value={formData.socialFacebook}
                        onChange={(e) => setFormData(prev => ({ ...prev, socialFacebook: e.target.value }))}
                        placeholder="ชื่อเพจ Facebook หรือวางลิงก์"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 ml-1">เช่น myshop หรือ https://facebook.com/myshop</p>
                  </div>
                  <div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">ig</span>
                      </div>
                      <input
                        type="text"
                        value={formData.socialInstagram}
                        onChange={(e) => setFormData(prev => ({ ...prev, socialInstagram: e.target.value }))}
                        placeholder="@username หรือวางลิงก์ Instagram"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500/40 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 ml-1">เช่น @myshop หรือ https://instagram.com/myshop</p>
                  </div>
                  <div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-orange-500 flex items-center justify-center">
                        <Globe className="w-3 h-3 text-white" />
                      </div>
                      <input
                        type="text"
                        value={formData.socialWebsite}
                        onChange={(e) => setFormData(prev => ({ ...prev, socialWebsite: e.target.value }))}
                        placeholder="เว็บไซต์ เช่น www.myshop.com"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 ml-1">ระบบจะเติม https:// ให้อัตโนมัติ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !formData.shopName.trim()}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all
                  ${saveSuccess
                    ? 'bg-green-100 text-green-600 ring-1 ring-green-300'
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm'
                  }
                  disabled:opacity-60 disabled:cursor-not-allowed
                `}
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
                ) : saveSuccess ? (
                  <><CheckCircle className="w-4 h-4" /> บันทึกสำเร็จ!</>
                ) : (
                  'บันทึกการเปลี่ยนแปลง'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
