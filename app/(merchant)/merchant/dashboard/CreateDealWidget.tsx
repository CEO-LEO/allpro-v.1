'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Package, Zap } from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function CreateDealWidget() {
  const { user } = useAuthStore();
  const addProduct = useProductStore((state) => state.addProduct);
  
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    isFlashSale: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
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

    const discountedPrice = parseFloat(formData.price);
    
    // Auto-calculate original price (assume 40% discount)
    const originalPrice = Math.round(discountedPrice / 0.6);
    const discount = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);

    // Generate image based on category
    const imageSeeds = ['food', 'fashion', 'service', 'electronics', 'beauty', 'fitness'];
    const randomSeed = imageSeeds[Math.floor(Math.random() * imageSeeds.length)];

    // Create new product
    const newProduct = {
      title: formData.productName,
      description: `${formData.isFlashSale ? '⚡ Flash Sale!' : 'Special Deal'} from ${user?.shopName || user?.name || 'Our Shop'}`,
      originalPrice: originalPrice,
      promoPrice: discountedPrice,
      discount: discount,
      image: `https://picsum.photos/seed/${randomSeed}-${Date.now()}/400/300`,
      shopName: user?.shopName || user?.name || 'Your Shop',
      shopLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.shopName || user?.name || 'YS')}&background=4F46E5&color=fff`,
      category: 'Other' as const,
      verified: true,
      distance: '0.5 km',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: formData.isFlashSale ? ['Flash Sale', 'Limited Time'] : ['New Deal', 'Special Offer'],
    };

    // Add to store (adds to BEGINNING of array)
    addProduct(newProduct);

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
      isFlashSale: false,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="w-5 h-5" />
          Post Deal Now
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
