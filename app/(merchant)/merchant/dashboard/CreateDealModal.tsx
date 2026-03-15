'use client';

import { useState } from 'react';
import { X, Image as ImageIcon, DollarSign, Tag, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductStore } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = ['Food', 'Fashion', 'Service', 'Electronics', 'Beauty', 'Fitness', 'Other'] as const;

export default function CreateDealModal({ isOpen, onClose }: CreateDealModalProps) {
  const { user } = useAuthStore();
  const addProduct = useProductStore((state) => state.addProduct);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalPrice: '',
    promoPrice: '',
    category: 'Food' as typeof categories[number],
    validUntil: '',
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
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
    
    // Generate placeholder image based on category
    const imageSeeds: Record<string, string> = {
      Food: 'food',
      Fashion: 'fashion',
      Service: 'service',
      Electronics: 'tech',
      Beauty: 'beauty',
      Fitness: 'fitness',
      Other: 'product'
    };
    
    const newProduct = {
      title: formData.title,
      description: formData.description || 'Amazing deal! Limited time only.',
      originalPrice,
      promoPrice,
      discount,
      image: `https://picsum.photos/seed/${imageSeeds[formData.category]}-${Date.now()}/400/300`,
      shopName: user?.shopName || user?.name || 'Your Shop',
      shopLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.shopName || user?.name || 'Shop')}&background=3B82F6&color=fff`,
      category: formData.category,
      verified: true,
      distance: '0.0 km',
      validUntil: formData.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };
    
    addProduct(newProduct);
    
    // Success feedback
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    toast.success('🎉 Deal posted successfully!', {
      description: 'Your promotion is now live and visible to all users!'
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
                
                {/* Image Info */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <ImageIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-300 mb-1">Product Image</p>
                      <p className="text-xs text-gray-400">A placeholder image will be generated automatically. Image upload coming soon!</p>
                    </div>
                  </div>
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
