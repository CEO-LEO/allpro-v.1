"use client";

import React, { useState, useEffect } from "react";
import { useProductStore } from "@/store/useProductStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useStockStore } from "@/store/useStockStore";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Upload, X, Zap, Package, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1505252585461-04db1267ae5b?w=500&q=80";

const CATEGORIES = ['Food', 'Fashion', 'Travel', 'Gadget', 'Beauty'] as const;

export default function CreateDealWidget() {
  const addProduct = useProductStore((s) => s.addProduct);
  const { user } = useAuthStore();
  const stockItems = useStockStore((s) => s.items);
  const deductStock = useStockStore((s) => s.deductStock);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [useImageUrl, setUseImageUrl] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

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
      // Determine which image to use
      let finalImage = DEFAULT_IMAGE;
      
      if (imageFile) {
        finalImage = imagePreview;
      } else if (useImageUrl && imageUrl) {
        finalImage = imageUrl;
      }

      // Add product to local store
      addProduct({
        title: formData.productName,
        description: `ลดราคาถึง ${calculateDiscount()}% สำหรับคำสั่งซื้อทั้งหมด`,
        originalPrice: original,
        promoPrice: discounted,
        discount: calculateDiscount(),
        image: finalImage,
        category: formData.category as 'Food' | 'Fashion' | 'Travel' | 'Gadget' | 'Beauty' | 'Service' | 'Electronics' | 'Fitness' | 'Other',
        shopName: user?.shopName || user?.name || "My Shop",
        shopLogo: "",
        verified: true,
        tags: formData.isFlashSale ? ["Flash Sale", "Limited Time"] : ["Special Offer"],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Also save to Supabase products table
      if (isSupabaseConfigured) {
        const shopName = user?.shopName || user?.name || 'My Shop';
        const { error: dbError } = await supabase.from('products').insert({
          title: formData.productName,
          description: `ลดราคาถึง ${calculateDiscount()}%${formData.paymentInfo ? ' | ชำระเงิน: ' + formData.paymentInfo : ''}`,
          "promoPrice": discounted,
          "originalPrice": original,
          image: finalImage,
          category: formData.category,
          "shopName": shopName,
          "shopId": user?.id || 'unknown',
          discount: calculateDiscount(),
          location: 'กรุงเทพฯ',
          conditions: formData.isFlashSale ? 'Flash Sale - เวลาจำกัด' : 'โปรโมชั่นพิเศษ',          ...(selectedStockId ? { product_id: selectedStockId, promo_quantity: quantityNum } : {}),        });
        if (dbError) {
          console.error('Supabase insert error:', dbError);
          toast.error('บันทึกลง Supabase ไม่สำเร็จ: ' + dbError.message);
        }
      }

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

      toast.success(`${formData.productName} ลงประกาศแล้ว!`);

      // Reset form
      setFormData({
        productName: "",
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
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsLoading(false);
    }
  };

  const discountPercent = calculateDiscount();

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
