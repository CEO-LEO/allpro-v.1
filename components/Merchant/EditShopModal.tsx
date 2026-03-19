'use client';

import { useState, useRef } from 'react';
import { X, Store, Upload, Camera, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

interface EditShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditShopModal({ isOpen, onClose }: EditShopModalProps) {
  const { user, updateUser } = useAuthStore();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // ═══ Controlled Form State ═══
  const [formData, setFormData] = useState({
    shopName: user?.shopName || '',
    description: '',
    phone: user?.phone || '',
    email: user?.email || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // TODO: Replace with real API call
      // const res = await fetch('/api/merchant/shop', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...formData, shopLogo: logoPreview }),
      // });
      // if (!res.ok) throw new Error('Failed to save');

      await new Promise(r => setTimeout(r, 800));

      // Update local auth store
      updateUser({
        shopName: formData.shopName || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        shopLogo: logoPreview || user?.shopLogo || undefined,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch {
      // Error handling for future API integration
    } finally {
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
                          src={logoPreview || user?.shopLogo || ''}
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
