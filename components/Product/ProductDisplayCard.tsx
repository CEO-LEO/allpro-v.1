'use client';

import { Product } from '@/store/useProductStore';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Heart, Bookmark, Star, Clock, MapPin, TrendingUp } from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';

interface ProductDisplayCardProps {
  product: Product;
  showSaveButton?: boolean;
}

export default function ProductDisplayCard({ product, showSaveButton = true }: ProductDisplayCardProps) {
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { savedProductIds, toggleSave } = useProductStore();
  const { isAuthenticated, user, addCoins } = useAuthStore();
  
  const isSaved = savedProductIds.includes(product.id);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to save deals');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const wasNotSaved = !isSaved;
      toggleSave(product.id, user?.id);
      
      // Award coins on first save
      if (wasNotSaved) {
        addCoins(10);
        toast.success('💾 Deal saved! +10 coins');
      } else {
        toast.success('Removed from wallet');
      }
      
      setIsSaving(false);
    }, 300);
  };

  if (!mounted) {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 h-96" />
    );
  }

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        whileHover={{ y: -6 }}
        className="relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 h-full flex flex-col"
      >
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={resolveImageUrl(product.image, getCategoryFallbackImage(product.category))}
            alt={product.title}
            className="w-full h-full object-cover"
          />

          {/* Discount Badge */}
          <div className="absolute top-3 left-3 bg-red-600 text-white rounded-lg px-3 py-1.5 font-bold shadow-lg">
            <div className="text-xs font-semibold">SAVE</div>
            <div className="text-lg leading-none">{product.discount}%</div>
          </div>

          {/* Save Button */}
          {showSaveButton && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={isSaving}
              className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition-all"
            >
              <motion.div
                animate={isSaved ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Bookmark
                  className={`w-5 h-5 ${
                    isSaved
                      ? 'fill-orange-600 text-orange-600'
                      : 'text-gray-600'
                  }`}
                />
              </motion.div>
            </motion.button>
          )}

          {/* Rating Badge */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-md">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-bold text-gray-900">{product.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 leading-tight">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Store Info */}
          <div className="flex items-center gap-2 mb-3">
            {product.shopLogo && (
              <img
                src={product.shopLogo}
                alt={product.shopName}
                className="w-6 h-6 rounded-full"
              />
            )}
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-900">{product.shopName}</p>
              <p className="text-xs text-gray-500">
                {product.verified && '✓ Verified'}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {product.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Distance and Time */}
          {(product.distance || product.validUntil) && (
            <div className="flex gap-3 text-xs text-gray-600 mb-3">
              {product.distance && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {product.distance}
                </div>
              )}
              {product.validUntil && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(product.validUntil).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          {/* Price Section */}
          <div className="mt-auto pt-3 border-t border-gray-200">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-red-600">
                ฿{product.promoPrice.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ฿{product.originalPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
              <Heart className="w-4 h-4" />
              <span>{product.likes} saves</span>
              <TrendingUp className="w-4 h-4 ml-2" />
              <span>Trending</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
