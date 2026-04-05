"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStockStore } from "@/store/useStockStore";
import { useProductStore } from "@/store/useProductStore";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Upload, X, Zap, Package, AlertTriangle, Store, ArrowRight, CheckCircle as CheckCircleIcon, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import EditShopModal from "@/components/Merchant/EditShopModal";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1505252585461-04db1267ae5b?w=500&q=80";

const CATEGORIES = ['Food', 'Fashion', 'Travel', 'Gadget', 'Beauty'] as const;

// Helper: check if merchant profile is complete (derived from fields only)
function isMerchantProfileComplete(user: any): boolean {
  if (!user) return false;
  return !!(
    user.shopName?.trim() &&
    user.shopLogo &&
    user.shopAddress?.trim() &&
    user.phone?.trim() && user.phone.trim().length >= 9
  );
}

export default function CreateDealWidget() {
  const { user, isHydrating } = useAuthStore();
  const stockItems = useStockStore((s) => s.items);
  const deductStock = useStockStore((s) => s.deductStock);
  const fetchMerchantProducts = useProductStore((s) => s.fetchMerchantProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [useImageUrl, setUseImageUrl] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);



  // Stock-linked fields
  const [selectedStockId, setSelectedStockId] = useState<string>("");
  const [promoQuantity, setPromoQuantity] = useState<string>("");

  const selectedStockItem = stockItems.find((s) => s.id === selectedStockId);
  const availableStock = selectedStockItem?.quantity ?? 0;
  const quantityNum = parseInt(promoQuantity) || 0;
  const isOverStock = selectedStockId !== "" && quantityNum > availableStock;

  // Cleanup object URL to prevent memory leak
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    originalPrice: "",
    discountedPrice: "",
    category: "Food" as string,
    paymentInfo: "",
    isFlashSale: false,
  });

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  // Handle image URL input
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  // Calculate discount percentage
  const calculateDiscount = () => {
    if (!formData.originalPrice || !formData.discountedPrice) return 0;
    const original = parseInt(formData.originalPrice);
    const discounted = parseInt(formData.discountedPrice);
    return Math.round(((original - discounted) / original) * 100);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.productName || !formData.originalPrice || !formData.discountedPrice) {
      toast.error("กรุณากรอกข้อมูลให้ครบทั้งหมด");
      return;
    }

    if (isOverStock) {
      toast.error("จำนวนเกินสต็อกที่มี");
      return;
    }

    const original = parseInt(formData.originalPrice);
    const discounted = parseInt(formData.discountedPrice);

    if (discounted >= original) {
      toast.error("ราคาลดต้องน้อยกว่าราคาเดิม");
      return;
    }

    setIsLoading(true);

    try {
      // Build FormData and send to server API (bypasses client-side RLS issues)
      toast.loading('กำลังลงประกาศโปรโมชั่น...', { id: 'create-deal' });

      const apiFormData = new FormData();
      apiFormData.append('title', formData.productName);
      apiFormData.append('description', formData.description || `ลด ${calculateDiscount()}%`);
      apiFormData.append('price', formData.discountedPrice);
      apiFormData.append('original_price', formData.originalPrice);
      apiFormData.append('category', formData.category);
      apiFormData.append('shop_name', user?.shopName || user?.name || 'My Shop');
      apiFormData.append('discount', String(calculateDiscount()));
      apiFormData.append('location', 'กรุงเทพฯ');
      apiFormData.append('conditions', formData.isFlashSale ? 'Flash Sale - เวลาจำกัด' : 'โปรโมชั่นพิเศษ');

      // Attach image file if selected
      if (imageFile) {
        apiFormData.append('image', imageFile);
      } else if (useImageUrl && imageUrl) {
        apiFormData.append('image_url', imageUrl);
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
        // Session not available — still proceed without shop_id
      }

      let success = false;

      // Server API only — single source of insert (no client fallback to prevent duplicates)
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          body: apiFormData,
        });

        const result = await res.json();

        if (res.status === 409 && result.duplicate) {
          toast.error(result.error || 'สินค้านี้ถูกลงประกาศไปแล้ว', { id: 'create-deal' });
          return;
        }

        if (res.ok && !result.error) {
          console.log('[CreateDeal] ✅ API success:', result.data);
          success = true;
        } else {
          console.warn('[CreateDeal] API error:', result.error || res.status);
        }
      } catch (fetchErr) {
        console.warn('[CreateDeal] API fetch failed:', fetchErr);
      }

      if (!success) {
        toast.error('บันทึกไม่สำเร็จ กรุณาลองใหม่', { id: 'create-deal' });
        return;
      }

      toast.success('ลงประกาศโปรโมชั่นสำเร็จ! 🎉', { id: 'create-deal' });

      // Refresh products from DB so dashboard shows the new item
      const merchantId = user?.id || '';
      const merchantShopName = user?.shopName || user?.name || '';
      fetchMerchantProducts(merchantId, merchantShopName);

      // Success feedback
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Deduct stock if linked
      if (selectedStockId && quantityNum > 0) {
        const deducted = deductStock(selectedStockId, quantityNum);
        if (!deducted) {
          toast.error("สต็อกไม่เพียงพอ");
        }
      }

      // Reset form
      setFormData({
        productName: "",
        description: "",
        originalPrice: "",
        discountedPrice: "",
        category: "Food",
        paymentInfo: "",
        isFlashSale: false,
      });
      setSelectedStockId("");
      setPromoQuantity("");
      setImageFile(null);
      setImagePreview("");
      setImageUrl("");
    } catch (error) {
      console.error('[CreateDeal] Unexpected error:', error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่", { id: 'create-deal' });
    } finally {
      setIsLoading(false);
    }
  };

  const discountPercent = calculateDiscount();
  const profileComplete = isMerchantProfileComplete(user);

  // ★ รอให้ hydration เสร็จก่อนตัดสินใจว่า profile ครบหรือไม่
  if (isHydrating) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-100 p-8 shadow-sm mb-8">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-slate-500">กำลังโหลดข้อมูลร้านค้า...</p>
        </div>
      </div>
    );
  }

  // Profile incomplete state
  if (!profileComplete) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border-2 border-orange-200 p-8 shadow-sm mb-8">
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-3">
            <AlertTriangle className="w-7 h-7 text-orange-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            ตั้งค่าโปรไฟล์ก่อนลงประกาศ
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            กรอกข้อมูลร้านค้าให้ครบถ้วนก่อนจึงจะโพสต์โปรโมชันได้
          </p>

          <div className="w-full max-w-xs space-y-1.5 mb-4">
            {[
              { label: 'ชื่อร้านค้า', done: !!user?.shopName?.trim() },
              { label: 'โลโก้ร้านค้า', done: !!user?.shopLogo },
              { label: 'ที่ตั้งร้านค้า', done: !!user?.shopAddress?.trim() },
              { label: 'เบอร์โทรศัพท์', done: !!(user?.phone?.trim() && user.phone.trim().length >= 9) },
            ].map((item) => (
              <div key={item.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${item.done ? 'bg-green-50 text-green-700' : 'bg-white text-gray-500'}`}>
                {item.done ? (
                  <CheckCircleIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                )}
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all flex items-center gap-2"
          >
            <Store className="w-4 h-4" />
            ตั้งค่าโปรไฟล์
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <EditShopModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-100 p-8 shadow-sm mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 text-white p-3 rounded-xl">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ลงประกาศโปรโมชั่น</h2>
          <p className="text-sm text-slate-500">เพิ่มสินค้าใหม่ให้ผู้ซื้อค้นหา</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Section */}
        <div className="bg-white rounded-2xl p-6 border border-blue-100">
          <label className="block text-sm font-bold text-slate-700 mb-4">
            รูปสินค้า
          </label>

          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setUseImageUrl(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                !useImageUrl
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              อัปโหลดไฟล์
            </button>
            <button
              type="button"
              onClick={() => setUseImageUrl(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                useImageUrl
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              ลิงค์ URL
            </button>
          </div>

          {!useImageUrl ? (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-input"
              />
              <label
                htmlFor="image-input"
                className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition-colors bg-blue-50"
              >
                <Upload className="w-8 h-8 text-blue-500 mb-2" />
                <span className="text-sm font-medium text-slate-700">
                  {imageFile ? imageFile.name : "คลิกเพื่อเลือกรูปภาพ"}
                </span>
                <span className="text-xs text-slate-500 mt-1">PNG, JPG, GIF (Max 5MB)</span>
              </label>
            </div>
          ) : (
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={handleImageUrlChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {/* Image Preview */}
          {(imagePreview || imageUrl) && (
            <div className="mt-4 relative">
              <img
                src={imagePreview || imageUrl}
                alt="Preview"
                className="w-full h-40 object-cover rounded-xl"
                onError={() => setImageUrl("")}
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview("");
                  setImageUrl("");
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Stock Linking */}
        {stockItems.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-blue-100">
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              เชื่อมสินค้าจากคลัง (ไม่บังคับ)
            </label>
            <select
              value={selectedStockId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedStockId(id);
                setPromoQuantity("");
                const item = stockItems.find((s) => s.id === id);
                if (item) {
                  setFormData((prev) => ({ ...prev, productName: item.name }));
                  if (item.image) setImageUrl(item.image);
                }
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- ไม่เชื่อม --</option>
              {stockItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (คงเหลือ: {item.quantity})
                </option>
              ))}
            </select>

            {selectedStockId && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  จำนวนที่จะนำมาลดราคา
                </label>
                <input
                  type="number"
                  min="1"
                  max={availableStock}
                  placeholder={`สูงสุด ${availableStock}`}
                  value={promoQuantity}
                  onChange={(e) => setPromoQuantity(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    isOverStock
                      ? "border-red-400 focus:ring-red-500"
                      : "border-slate-200 focus:ring-blue-500"
                  }`}
                />
                {isOverStock && (
                  <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
                    <AlertTriangle className="w-3 h-3" />
                    จำนวนเกินสต็อกที่มี ({availableStock})
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Product Details */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              ชื่อสินค้า
            </label>
            <input
              type="text"
              placeholder="เช่น เสื้อยืดสีดำ"
              value={formData.productName}
              onChange={(e) =>
                setFormData({ ...formData, productName: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* รายละเอียดโปรโมชั่น */}
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              รายละเอียด
            </label>
            <textarea
              placeholder="เช่น ซื้อ 1 แถม 1, จำกัด 50 ชิ้นแรก"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                ราคาเดิม
              </label>
              <input
                type="number"
                placeholder="500"
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({ ...formData, originalPrice: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                ราคาลด
              </label>
              <input
                type="number"
                placeholder="299"
                value={formData.discountedPrice}
                onChange={(e) =>
                  setFormData({ ...formData, discountedPrice: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Category & Payment Info */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              หมวดหมู่
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'Food' ? 'อาหาร' :
                   cat === 'Fashion' ? 'แฟชั่น' :
                   cat === 'Travel' ? 'ท่องเที่ยว' :
                   cat === 'Gadget' ? 'แกดเจ็ต' :
                   cat === 'Beauty' ? 'ความงาม' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              ข้อมูลการชำระเงิน
            </label>
            <input
              type="text"
              placeholder="เช่น โอนผ่านธนาคาร / PromptPay / บัตรเครดิต"
              value={formData.paymentInfo}
              onChange={(e) =>
                setFormData({ ...formData, paymentInfo: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Discount Display & Flash Sale Toggle */}
        <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200">
          <div>
            <p className="text-sm text-slate-600">ลดราคา</p>
            <p className="text-3xl font-bold text-red-600">
              {discountPercent > 0 ? `-${discountPercent}%` : "-"}
            </p>
          </div>

          <div className="text-right">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFlashSale}
                onChange={(e) =>
                  setFormData({ ...formData, isFlashSale: e.target.checked })
                }
                className="w-5 h-5 rounded accent-red-500"
              />
              <span className="text-sm font-medium text-slate-700">
                Flash Sale
              </span>
            </label>
            <p className="text-xs text-slate-500 mt-2">เพิ่มความดึงดูด</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isOverStock}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          {isLoading ? "กำลังโพสต์..." : "ลงประกาศตอนนี้"}
        </button>
      </form>
    </div>
  );
}
