'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, DollarSign, Tag, Calendar, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductStore, Product } from '@/store/useProductStore';
import { toast } from 'sonner';

interface EditPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const categories = ['Food', 'Fashion', 'Service', 'Electronics', 'Beauty', 'Fitness', 'Travel', 'Gadget', 'Other'] as const;

export default function EditPromotionModal({ isOpen, onClose, product }: EditPromotionModalProps) {
  const updateProduct = useProductStore((state) => state.updateProduct);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalPrice: '',
    promoPrice: '',
    category: 'Food' as Product['category'],
    validUntil: '',
    tags: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description,
        originalPrice: String(product.originalPrice),
        promoPrice: String(product.promoPrice),
        category: product.category,
        validUntil: product.validUntil,
        tags: product.tags.join(', '),
      });
      setErrors({});
    }
  }, [product]);

  const computedDiscount = useCallback(() => {
    const orig = parseFloat(formData.originalPrice);
    const promo = parseFloat(formData.promoPrice);
    if (!orig || !promo || orig <= 0) return 0;
    return Math.round(((orig - promo) / orig) * 100);
  }, [formData.originalPrice, formData.promoPrice]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const orig = parseFloat(formData.originalPrice);
    const promo = parseFloat(formData.promoPrice);

    if (!formData.title.trim()) newErrors.title = 'กรุณาใส่ชื่อสินค้า';
    if (!orig || orig <= 0) newErrors.originalPrice = 'ราคาเดิมต้องมากกว่า 0';
    if (!promo || promo <= 0) newErrors.promoPrice = 'ราคาโปรต้องมากกว่า 0';
    if (orig && promo && promo >= orig) newErrors.promoPrice = 'ราคาโปรต้องน้อยกว่าราคาเดิม';
    if (orig && promo && orig > 0) {
      const disc = ((orig - promo) / orig) * 100;
      if (disc > 99) newErrors.promoPrice = 'ส่วนลดต้องไม่เกิน 99%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const logPriceChange = async (productId: string, oldPrice: number, newPrice: number, oldOriginal: number, newOriginal: number) => {
    try {
      await fetch(`/api/products/${productId}/price-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPrice, newPrice, oldOriginal, newOriginal }),
      });
    } catch {
      // Non-blocking — price history logging is best-effort
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !validate()) return;

    setSaving(true);

    const originalPrice = parseFloat(formData.originalPrice);
    const promoPrice = parseFloat(formData.promoPrice);
    const discount = Math.round(((originalPrice - promoPrice) / originalPrice) * 100);

    // Log price change if price actually changed
    if (product.promoPrice !== promoPrice || product.originalPrice !== originalPrice) {
      await logPriceChange(product.id, product.promoPrice, promoPrice, product.originalPrice, originalPrice);
    }

    updateProduct(product.id, {
      title: formData.title.trim(),
      description: formData.description.trim() || product.description,
      originalPrice,
      promoPrice,
      discount,
      category: formData.category,
      validUntil: formData.validUntil,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setSaving(false);
    toast.success('อัปเดตโปรโมชั่นสำเร็จ!');
    onClose();
  };

  const discount = computedDiscount();

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-800">แก้ไขโปรโมชั่น</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              {/* Prices Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DollarSign className="w-3.5 h-3.5 inline mr-1" />
                    ราคาเดิม *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.originalPrice ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all`}
                  />
                  {errors.originalPrice && <p className="text-red-500 text-xs mt-1">{errors.originalPrice}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DollarSign className="w-3.5 h-3.5 inline mr-1" />
                    ราคาโปร *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.promoPrice}
                    onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.promoPrice ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all`}
                  />
                  {errors.promoPrice && <p className="text-red-500 text-xs mt-1">{errors.promoPrice}</p>}
                </div>
              </div>

              {/* Live Discount Preview */}
              <div className={`rounded-xl p-4 text-center ${discount > 0 && discount <= 99 ? 'bg-green-50 border border-green-200' : discount > 99 ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
                <p className="text-sm text-gray-600 mb-1">ส่วนลดที่คำนวณได้</p>
                <p className={`text-3xl font-bold ${discount > 0 && discount <= 99 ? 'text-green-600' : discount > 99 ? 'text-red-600' : 'text-gray-400'}`}>
                  {discount > 0 ? `-${discount}%` : '—'}
                </p>
                {discount > 99 && <p className="text-red-500 text-xs mt-1">ส่วนลดสูงเกินไป!</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tag className="w-3.5 h-3.5 inline mr-1" />
                  หมวดหมู่
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Product['category'] })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Valid Until */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  หมดอายุ
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">แท็ก (คั่นด้วย ,)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="เช่น อาหาร, ลดราคา, ของฝาก"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
