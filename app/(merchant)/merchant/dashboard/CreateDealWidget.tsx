'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Package, Zap } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function CreateDealWidget() {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    category: 'Food' as 'Food' | 'Fashion' | 'Travel' | 'Gadget' | 'Beauty' | 'Service' | 'Electronics' | 'Fitness' | 'Other',
    isFlashSale: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.productName.trim()) {
      toast.error('Please enter product name');
      return;
    }
    if (!formData.price) {
      toast.error('Please enter discounted price');
      return;
    }

    setIsSubmitting(true);

    const discountedPrice = parseFloat(formData.price);
    
    // Auto-calculate original price (assume 40% discount)
    const originalPrice = Math.round(discountedPrice / 0.6);
    const discount = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);

    // Generate image based on category
    const categoryImages: Record<string, string> = {
      Food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
      Fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
      Travel: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
      Gadget: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      Beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
      Service: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop',
      Electronics: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
      Fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
      Other: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop',
    };
    const selectedImage = categoryImages[formData.category] || categoryImages.Other;

    const shopName = user?.shopName || user?.name || 'Your Shop';
    const description = `${formData.isFlashSale ? '⚡ Flash Sale!' : 'Special Deal'} from ${shopName}`;
    const tags = [
      formData.category,
      ...(formData.isFlashSale ? ['Flash Sale', 'Limited Time'] : ['New Deal', 'Special Offer'])
    ];

    let success = false;

    // Server API only — single source of insert (no client fallback to prevent duplicates)
    try {
      const apiFormData = new FormData();
      apiFormData.append('title', formData.productName);
      apiFormData.append('description', description);
      apiFormData.append('price', String(discountedPrice));
      apiFormData.append('originalPrice', String(originalPrice));
      apiFormData.append('category', formData.category);

      const res = await fetch('/api/products', {
        method: 'POST',
        body: apiFormData,
      });

      const result = await res.json();

      if (res.status === 409 && result.duplicate) {
        toast.error(result.error || 'สินค้านี้ถูกลงประกาศไปแล้ว');
        setIsSubmitting(false);
        return;
      }

      if (res.ok && !result.error) {
        success = true;
      } else {
        console.warn('[CreateDealWidget] API error:', result.error);
      }
    } catch (err) {
      console.warn('[CreateDealWidget] Fetch error:', err);
    }

    if (!success) {
      toast.error('บันทึกไม่สำเร็จ กรุณาลองใหม่');
      setIsSubmitting(false);
      return;
    }

    // Dispatch event to trigger notifications for users with matching preferred_tags
    if (typeof window !== 'undefined') {
      const promoEvent = new CustomEvent('newPromoCreated', {
        detail: {
          title: formData.productName,
          shopName,
          tags,
          category: formData.category,
        }
      });
      window.dispatchEvent(promoEvent);
    }

    // Success feedback
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast.success('🎉 Deal posted successfully!');

    // Clear form
    setFormData({
      productName: '',
      price: '',
      category: 'Food',
      isFlashSale: false,
    });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-300 dark:border-slate-700 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create New Deal</h2>
            <p className="text-blue-100 text-sm">Post to user feed instantly</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Package className="w-4 h-4 inline mr-1" />
            Product Name
          </label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            placeholder="e.g., Salmon Set 50% OFF"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Discounted Price */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Zap className="w-4 h-4 inline mr-1" />
            Discounted Price (฿)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="299"
            min="1"
            step="0.01"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            💡 Original price will be calculated automatically
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Package className="w-4 h-4 inline mr-1" />
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="Food">🍔 Food</option>
            <option value="Fashion">👗 Fashion</option>
            <option value="Travel">✈️ Travel</option>
            <option value="Gadget">📱 Gadget</option>
            <option value="Beauty">💄 Beauty</option>
            <option value="Service">🛎️ Service</option>
            <option value="Electronics">💻 Electronics</option>
            <option value="Fitness">💪 Fitness</option>
            <option value="Other">📦 Other</option>
          </select>
        </div>

        {/* Flash Sale Toggle */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Flash Sale?</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Mark as limited-time offer</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="isFlashSale"
              checked={formData.isFlashSale}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="w-5 h-5" />
          {isSubmitting ? 'Posting...' : 'Post Deal Now'}
        </motion.button>
      </form>

      {/* Info Footer */}
      <div className="bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600 px-6 py-3">
        <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
          💡 Your deal will appear at the top of the user feed
        </p>
      </div>
    </motion.div>
  );
}
