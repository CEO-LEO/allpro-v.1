'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

interface PhotoGalleryProps {
  photos: string[];
  officialImage: string;
  productName: string;
}

export default function PhotoGallery({ photos, officialImage, productName }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openLightbox = (photo: string, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  };

  const nextPhoto = () => {
    const newIndex = (selectedIndex + 1) % photos.length;
    setSelectedIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  const prevPhoto = () => {
    const newIndex = selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1;
    setSelectedIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  if (photos.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-900">
              ภาพจากทางบ้าน ({photos.length})
            </h3>
          </div>
          <span className="text-xs text-gray-500 bg-purple-50 px-3 py-1 rounded-full font-semibold">
            Real Photos
          </span>
        </div>

        {/* Horizontal Scroll Gallery */}
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {photos.map((photo, index) => (
              <motion.button
                key={index}
                onClick={() => openLightbox(photo, index)}
                className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-100 hover:ring-4 hover:ring-purple-300 transition-all group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src={photo}
                  alt={`User photo ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">
                    เปรียบเทียบ
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2 text-center">
          👆 แตะเพื่อเปรียบเทียบกับภาพโฆษณา
        </p>
      </div>

      {/* Lightbox - Comparison View */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          >
            <div className="max-w-6xl w-full p-4">
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-all z-10"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Navigation */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevPhoto();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-all z-10"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextPhoto();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-all z-10"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <motion.h2
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-3xl font-black text-white mb-2"
                >
                  Expectation vs Reality
                </motion.h2>
                <p className="text-gray-400">
                  ภาพโฆษณา vs ภาพจริงจากลูกค้า ({selectedIndex + 1}/{photos.length})
                </p>
              </div>

              {/* Split Screen Comparison */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="grid md:grid-cols-2 gap-4"
              >
                {/* Left: Official Ad Image */}
                <div className="relative">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                      📸 ภาพโฆษณา
                    </span>
                  </div>
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900 border-4 border-blue-500">
                    <Image
                      src={officialImage}
                      alt={productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-center mt-3 text-white font-semibold">
                    Official Advertisement
                  </p>
                </div>

                {/* Right: User Photo */}
                <div className="relative">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                      ✨ ภาพจริง
                    </span>
                  </div>
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900 border-4 border-purple-500">
                    <Image
                      src={selectedPhoto}
                      alt="User submitted photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-center mt-3 text-white font-semibold">
                    Real Customer Photo
                  </p>
                </div>
              </motion.div>

              {/* Tips */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  💡 เทียบให้ดีก่อนตัดสินใจไปซื้อ
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
