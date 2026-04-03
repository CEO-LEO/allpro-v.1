"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Rocket, Check, Zap, Clock, TrendingUp } from "lucide-react";
import { useProductStore, Product } from "@/store/useProductStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';

interface BoostPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BoostPromotionModal({ isOpen, onClose }: BoostPromotionModalProps) {
  const { user } = useAuthStore();
  const products = useProductStore((s) => s.products);
  const boostProduct = useProductStore((s) => s.boostProduct);
  const unboostProduct = useProductStore((s) => s.unboostProduct);
  const [confirming, setConfirming] = useState<string | null>(null);

  // Filter only this merchant's products
  // Match by shopName, user name, or "My Shop" fallback
  // Also include all merchant-created products (product- prefix) in case shopName changed
  const shopName = user?.shopName || "";
  const possibleNames = [shopName, user?.name, "My Shop"].filter(Boolean);
  const myProducts = products.filter(
    (p) => possibleNames.includes(p.shopName) || p.id.startsWith("product-")
  );

  const handleBoost = (product: Product) => {
    setConfirming(product.id);
  };

  const confirmBoost = (product: Product) => {
    boostProduct(product.id);
    toast.success(`"${product.title}" ถูกดันโพสต์แล้ว!`);
    setConfirming(null);
  };

  const handleUnboost = (product: Product) => {
    unboostProduct(product.id);
    toast.success(`ยกเลิกการดันโพสต์ "${product.title}" แล้ว`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">ดันโพสต์</h2>
                  <p className="text-xs text-gray-500">เลือกโปรโมชั่นที่ต้องการ Boost</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Info Banner */}
            <div className="mx-5 mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">โปรโมชั่นที่ Boost จะแสดงอันดับต้นๆ</p>
                  <p className="text-xs text-amber-700 mt-0.5">ลูกค้าจะเห็นโปรโมชั่นของคุณก่อนร้านอื่นในหน้า Feed และการค้นหา</p>
                </div>
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {myProducts.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-1">ยังไม่มีโปรโมชั่น</p>
                  <p className="text-gray-400 text-sm">สร้างโปรโมชั่นก่อน แล้วกลับมา Boost ได้เลย</p>
                </div>
              ) : (
                myProducts.map((product) => {
                  const isBoosted = product.isBoosted === true;
                  const isConfirming = confirming === product.id;
                  const discountPercent = product.discount || Math.round(
                    ((product.originalPrice - product.promoPrice) / product.originalPrice) * 100
                  );

                  return (
                    <div
                      key={product.id}
                      className={`relative border rounded-xl p-4 transition-all ${
                        isBoosted
                          ? "border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      {/* Boosted badge */}
                      {isBoosted && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <Zap className="w-3 h-3" />
                          Boosted
                        </div>
                      )}

                      <div className="flex gap-3">
                        {/* Product Image */}
                        <img
                          src={resolveImageUrl(product.image, getCategoryFallbackImage(product.category))}
                          alt={product.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{product.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-gray-900">฿{product.promoPrice.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 line-through">฿{product.originalPrice.toLocaleString()}</span>
                            <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">-{discountPercent}%</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">ถึง {product.validUntil}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3">
                        {isConfirming ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => confirmBoost(product)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
                            >
                              <Check className="w-4 h-4" />
                              ยืนยัน Boost
                            </button>
                            <button
                              onClick={() => setConfirming(null)}
                              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        ) : isBoosted ? (
                          <button
                            onClick={() => handleUnboost(product)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            ยกเลิก Boost
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBoost(product)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
                          >
                            <Rocket className="w-4 h-4" />
                            ดันโพสต์นี้
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
