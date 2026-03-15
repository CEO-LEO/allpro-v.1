'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, CheckCircle, TrendingUp, Award } from 'lucide-react';
import Image from 'next/image';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [store, setStore] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage || !caption) return;

    setIsUploading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUploading(false);
      setShowSuccess(true);
    }, 1500);
  };

  const handleClose = () => {
    setSelectedImage(null);
    setCaption('');
    setStore('');
    setShowSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 z-[1100] backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-[1101] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {!showSuccess ? (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-6 h-6" />
                    <h2 className="text-xl font-bold">Share a Deal</h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {/* Image Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Photo <span className="text-red-600">*</span>
                    </label>
                    {!selectedImage ? (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors">
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-600 font-medium mb-1">Click to upload photo</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </label>
                    ) : (
                      <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-gray-200">
                        <Image
                          src={selectedImage}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => setSelectedImage(null)}
                          className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Caption */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      What promotion did you find? <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="e.g., Buy 1 Get 1 Free on all drinks!"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Store */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Store Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={store}
                      onChange={(e) => setStore(e.target.value)}
                      placeholder="e.g., 7-Eleven Sukhumvit 23"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0"
                    />
                  </div>

                  {/* Points Preview */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-yellow-900" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">You'll earn</p>
                        <p className="text-2xl font-bold text-yellow-900">+50 Points</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedImage || !caption || isUploading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Post Deal
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                {/* Animated Checkmark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="w-24 h-24 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-16 h-16 text-white" />
                </motion.div>

                {/* Success Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    Deal Posted! 🎉
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thanks for sharing with the community!
                  </p>

                  {/* Points Earned */}
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <TrendingUp className="w-8 h-8 text-white" />
                      <p className="text-5xl font-bold text-white">+50</p>
                    </div>
                    <p className="text-white font-semibold text-lg">Points Earned!</p>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={handleClose}
                    className="w-full px-6 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors"
                  >
                    Awesome!
                  </button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
