'use client';

import { useState, useRef } from 'react';
import { X, Image as ImageIcon, DollarSign, Tag, Calendar, Sparkles, Upload, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductStore } from '@/store/useProductStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = ['Food', 'Fashion', 'Service', 'Electronics', 'Beauty', 'Fitness', 'Other'] as const;

export default function CreateDealModal({ isOpen, onClose }: CreateDealModalProps) {
  const { user } = useAuthStore();
  const addProduct = useProductStore((s) => s.addProduct);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const imageFileRef = useRef<File | null>(null);


  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalPrice: '',
    promoPrice: '',
    category: 'Food' as typeof categories[number],
    validUntil: '',
    tags: ''
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    imageFileRef.current = file;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const originalPrice = parseFloat(formData.originalPrice);
    const promoPrice = parseFloat(formData.promoPrice);
    
    if (!formData.title || !originalPrice || !promoPrice) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (promoPrice >= originalPrice) {
      toast.error('Promo price must be lower than original price');
      return;
    }
    
    const discount = Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
    
    // Send everything to server API (bypasses client-side RLS issues)
    toast.loading('กำลังลงประกาศโปรโมชั่น...', { id: 'create-deal' });

    const apiFormData = new FormData();
    apiFormData.append('title', formData.title);
    apiFormData.append('description', formData.description || 'โปรโมชั่นพิเศษ!');
    apiFormData.append('price', String(promoPrice));
    apiFormData.append('original_price', String(originalPrice));
    apiFormData.append('category', formData.category);
    apiFormData.append('shop_name', user?.shopName || user?.name || 'Your Shop');
    apiFormData.append('discount', String(discount));
    apiFormData.append('location', 'กรุงเทพฯ');
    apiFormData.append('conditions', 'โปรโมชั่นพิเศษ');

    // Attach image file if selected
    if (imageFileRef.current) {
      apiFormData.append('image', imageFileRef.current);
    }

    // Try to get user session for shop_id
    let userId = '';
    try {
      const sessionRes = await supabase.auth.getSession();
      if (sessionRes?.data?.session?.user?.id) {
        userId = sessionRes.data.session.user.id;
        apiFormData.append('shop_id', userId);
      }
    } catch {
      // Continue without shop_id
    }

    let success = false;

    // Attempt 1: Server API
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: apiFormData,
      });

      const result = await res.json();

      if (res.ok && !result.error) {
        console.log('[CreateDealModal] ✅ API success:', result.data);
        success = true;
      } else {
        console.warn('[CreateDealModal] API error:', result.error || res.status);
      }
    } catch (err) {
      console.warn('[CreateDealModal] Fetch error:', err);
    }

    // Attempt 2: Direct Supabase insert (fallback)
    if (!success) {
      try {
        const insertData: Record<string, unknown> = {
          title: formData.title,
          description: formData.description || 'โปรโมชั่นพิเศษ!',
          price: promoPrice,
          original_price: originalPrice,
          image: '',
          category: formData.category,
          shop_name: user?.shopName || user?.name || 'Your Shop',
        };
        if (userId) insertData.shop_id = userId;

        const { error: dbError } = await supabase.from('products').insert(insertData);
        if (!dbError) {
          console.log('[CreateDealModal] ✅ Direct insert success');
          success = true;
        } else {
          console.warn('[CreateDealModal] Direct insert failed:', dbError.message);
        }
      } catch (directErr) {
        console.warn('[CreateDealModal] Direct fallback error:', directErr);
      }
    }

    if (!success) {
      toast.error('บันทึกไม่สำเร็จ กรุณาลองใหม่', { id: 'create-deal' });
      return;
    }

    toast.success('ลงประกาศโปรโมชั่นสำเร็จ! 🎉', { id: 'create-deal' });

    // Add to local Zustand store so dashboard shows it immediately
    const origP = parseFloat(formData.originalPrice);
    const promoP = parseFloat(formData.promoPrice);
    addProduct({
      title: formData.title,
      description: formData.description || 'โปรโมชั่นพิเศษ!',
      originalPrice: origP,
      promoPrice: promoP,
      discount,
      image: imagePreview || '',
      shopName: user?.shopName || user?.name || 'Your Shop',
      category: formData.category as any,
      verified: true,
      validUntil: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [formData.category],
      isBoosted: false,
    });

    // Success animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      originalPrice: '',
      promoPrice: '',
      category: 'Food',
      validUntil: '',
      tags: ''
    });
    setImagePreview('');
    imageFileRef.current = null;
    
    onClose();
  };

  const discount = formData.originalPrice && formData.promoPrice
    ? Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.promoPrice)) / parseFloat(formData.originalPrice)) * 100)
    : 0;

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
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-blue-500/30">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Create Flash Sale</h2>
                      <p className="text-blue-100 text-sm">Post a new deal for your customers</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Product Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Product/Service Name *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Premium Salmon Sashimi Set"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your amazing offer..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  />
                </div>
                
                {/* Price Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Original Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Original Price *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        placeholder="999"
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Promo Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Promo Price *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="number"
                        value={formData.promoPrice}
                        onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                        placeholder="599"
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Discount Preview */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Discount
                    </label>
                    <div className="h-12 px-4 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-400">
                        {discount > 0 ? `-${discount}%` : '0%'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Category and Valid Until */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Category *
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof categories[number] })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Valid Until */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Valid Until
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., Premium, Japanese, Seafood"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Product Image
                  </label>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          if (imageInputRef.current) imageInputRef.current.value = '';
                        }}
                        className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-slate-600 rounded-xl hover:border-blue-500 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                      <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <Camera className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <p className="text-sm font-medium text-gray-400 group-hover:text-blue-400 transition-colors">คลิกเพื่อเลือกรูปสินค้า</p>
                      <p className="text-xs text-gray-500">PNG, JPG (แนะนำ 1:1)</p>
                    </button>
                  )}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {!imagePreview && (
                    <p className="text-xs text-gray-500 mt-2">ถ้าไม่อัปโหลด จะใช้รูปอัตโนมัติตามหมวดหมู่</p>
                  )}
                </div>
                
                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105 active:scale-95"
                  >
                    🚀 Post Deal
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
