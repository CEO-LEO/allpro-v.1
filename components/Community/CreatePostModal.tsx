'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  BuildingStorefrontIcon, 
  UserGroupIcon, 
  PhotoIcon, 
  MapPinIcon, 
  TagIcon, 
  ArrowUpTrayIcon, 
  CalendarIcon 
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useGamification } from '@/hooks/useGamification';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'brands' | 'users';
}

export default function CreatePostModal({ isOpen, onClose, defaultTab = 'users' }: CreatePostModalProps) {
  const [postType, setPostType] = useState<'brands' | 'users'>(defaultTab);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [discount, setDiscount] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { earnPoints } = useGamification();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !location || !imagePreview) {
      toast.error('Please fill in all required fields!');
      return;
    }

    // Award points based on post type
    const points = postType === 'brands' ? 100 : 50;
    earnPoints('WRITE_REVIEW', points);

    // Show success
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast.success(`Post created! +${points} points 🎉\nYour post is now live!`);

    // Reset and close
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setCategory('');
    setDiscount('');
    setValidUntil('');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Create New Post</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Post Type Tabs */}
            <div className="flex gap-3">
              <button
                onClick={() => setPostType('brands')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  postType === 'brands'
                    ? 'bg-white text-orange-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <BuildingStorefrontIcon className="w-5 h-5" />
                <span>Brand Post</span>
              </button>
              <button
                onClick={() => setPostType('users')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  postType === 'users'
                    ? 'bg-white text-orange-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <UserGroupIcon className="w-5 h-5" />
                <span>User Post</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <PhotoIcon className="w-4 h-4 inline-block mr-1" />
                Upload Image *
              </label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 transition-colors flex flex-col items-center justify-center gap-3 bg-gray-50"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="w-12 h-12 text-gray-400" />
                      <span className="text-sm text-gray-600 font-medium">Click to upload image</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {postType === 'brands' ? 'Promotion Title *' : 'Post Caption *'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={postType === 'brands' ? 'e.g., Buy 1 Get 1 Free!' : 'e.g., Amazing coffee deal!'}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-400 focus:outline-none"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us more about this deal..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-400 focus:outline-none resize-none"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <MapPinIcon className="w-4 h-4 inline-block mr-1" />
                Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Starbucks Siam Paragon"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-400 focus:outline-none"
                required
              />
            </div>

            {/* Brand-specific fields */}
            {postType === 'brands' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <TagIcon className="w-4 h-4 inline-block mr-1" />
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-400 focus:outline-none"
                    >
                      <option value="">Select...</option>
                      <option value="Food">Food</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Discount
                    </label>
                    <input
                      type="text"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="e.g., 50% OFF"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Valid Until */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <CalendarIcon className="w-4 h-4 inline-block mr-1" />
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-400 focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-lg transition-all hover:shadow-lg"
              >
                Post to Community
                <span className="ml-2 text-sm">
                  +{postType === 'brands' ? '100' : '50'} points
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
