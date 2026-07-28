"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Clock, Check, Loader2, Square } from "lucide-react";
import { useProductStore, Product } from "@/store/useProductStore";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { resolveImageUrl, getCategoryFallbackImage } from "@/lib/imageUrl";

interface CreateFlashSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FlashSaleRow {
  id: string;
  title: string;
  image_url: string | null;
  promo_price: number;
  original_price: number;
  total_quota: number | null;
  used_quota: number;
  starts_at: string;
  ends_at: string;
}

const DURATION_OPTIONS = [
  { label: "1 ชม.", minutes: 60 },
  { label: "3 ชม.", minutes: 180 },
  { label: "6 ชม.", minutes: 360 },
  { label: "24 ชม.", minutes: 1440 },
];

function CountdownLabel({ startsAt, endsAt }: { startsAt: string; endsAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const startMs = new Date(startsAt).getTime();
  const endMs = new Date(endsAt).getTime();

  const fmt = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (now < startMs) {
    return <span className="text-blue-600 font-semibold">เริ่มใน {fmt(startMs - now)}</span>;
  }
  if (now < endMs) {
    return <span className="text-red-600 font-semibold">เหลือเวลา {fmt(endMs - now)}</span>;
  }
  return <span className="text-gray-400">หมดเวลาแล้ว</span>;
}

export default function CreateFlashSaleModal({ isOpen, onClose }: CreateFlashSaleModalProps) {
  const { user } = useAuthStore();
  const products = useProductStore((s) => s.products);

  const shopName = user?.shopName || "";
  const possibleNames = [shopName, user?.name, "My Shop"].filter(Boolean);
  const myProducts = products.filter(
    (p) => possibleNames.includes(p.shopName) || p.id.startsWith("product-")
  );

  const [myFlashSales, setMyFlashSales] = useState<FlashSaleRow[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [merchantStatus, setMerchantStatus] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [promoPrice, setPromoPrice] = useState<string>("");
  const [totalQuota, setTotalQuota] = useState<string>("50");
  const [durationMinutes, setDurationMinutes] = useState<number>(180);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [endingId, setEndingId] = useState<string | null>(null);

  const loadMyFlashSales = useCallback(async () => {
    if (!isSupabaseConfigured || !user?.id) return;
    setIsLoadingList(true);
    try {
      const { data: merchant } = await supabase
        .from("merchants")
        .select("id, status")
        .eq("owner_id", user.id)
        .maybeSingle();

      setMerchantId(merchant?.id || null);
      setMerchantStatus(merchant?.status || null);

      if (merchant?.id) {
        const { data } = await supabase
          .from("promotions")
          .select("id, title, image_url, promo_price, original_price, total_quota, used_quota, starts_at, ends_at")
          .eq("merchant_id", merchant.id)
          .eq("promo_type", "flash_sale")
          .eq("status", "active")
          .gt("ends_at", new Date().toISOString())
          .order("created_at", { ascending: false });
        setMyFlashSales(data || []);
      }
    } catch (e) {
      console.error("[CreateFlashSaleModal] load error:", e);
    } finally {
      setIsLoadingList(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isOpen) loadMyFlashSales();
  }, [isOpen, loadMyFlashSales]);

  const resetForm = () => {
    setSelectedProduct(null);
    setPromoPrice("");
    setTotalQuota("50");
    setDurationMinutes(180);
    setShowForm(false);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setPromoPrice(String(product.promoPrice));
  };

  const handleSubmit = async () => {
    if (!selectedProduct || !merchantId) return;
    const promoPriceNum = Number(promoPrice);
    const quotaNum = Number(totalQuota);

    if (!promoPriceNum || promoPriceNum <= 0 || promoPriceNum >= selectedProduct.originalPrice) {
      toast.error("ราคา Flash Sale ต้องมากกว่า 0 และน้อยกว่าราคาเต็ม");
      return;
    }
    if (!quotaNum || quotaNum <= 0) {
      toast.error("กรุณาระบุจำนวนสิทธิ์ที่มากกว่า 0");
      return;
    }
    if (merchantStatus !== "active") {
      toast.error("บัญชีร้านค้ายังไม่ active กรุณารอการอนุมัติก่อนเปิด Flash Sale");
      return;
    }

    setIsSubmitting(true);
    try {
      const startsAt = new Date();
      const endsAt = new Date(startsAt.getTime() + durationMinutes * 60000);
      const discountPct = Math.round(
        ((selectedProduct.originalPrice - promoPriceNum) / selectedProduct.originalPrice) * 100
      );

      const { error } = await supabase.from("promotions").insert({
        merchant_id: merchantId,
        title: selectedProduct.title,
        description: selectedProduct.description,
        promo_type: "flash_sale",
        status: "active",
        original_price: selectedProduct.originalPrice,
        promo_price: promoPriceNum,
        discount_pct: discountPct,
        category: selectedProduct.category,
        image_url: resolveImageUrl(selectedProduct.image, getCategoryFallbackImage(selectedProduct.category)),
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        total_quota: quotaNum,
        used_quota: 0,
      });

      if (error) {
        console.error("[CreateFlashSaleModal] insert error:", error);
        toast.error("เปิด Flash Sale ไม่สำเร็จ กรุณาลองใหม่");
        return;
      }

      toast.success(`เปิด Flash Sale "${selectedProduct.title}" แล้ว!`);
      resetForm();
      await loadMyFlashSales();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndEarly = async (id: string) => {
    setEndingId(id);
    try {
      const { error } = await supabase
        .from("promotions")
        .update({ ends_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        toast.error("จบ Flash Sale ไม่สำเร็จ");
        return;
      }
      toast.success("จบ Flash Sale ก่อนเวลาแล้ว");
      await loadMyFlashSales();
    } finally {
      setEndingId(null);
    }
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
            className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Flash Sale</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">เปิดดีลเวลาจำกัดจริง มีนับถอยหลังจริง</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Active flash sales */}
              {isLoadingList ? (
                <div className="py-8 text-center text-gray-400 dark:text-gray-500">
                  <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
                  <p className="text-sm">กำลังโหลด...</p>
                </div>
              ) : myFlashSales.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Flash Sale ที่กำลังเปิดอยู่</p>
                  {myFlashSales.map((fs) => (
                    <div
                      key={fs.id}
                      className="border border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl p-3 flex gap-3"
                    >
                      <img
                        src={resolveImageUrl(fs.image_url || "", "/icons/icon-192x192.png")}
                        alt={fs.title}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{fs.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ขายแล้ว {fs.used_quota}/{fs.total_quota ?? "∞"}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <CountdownLabel startsAt={fs.starts_at} endsAt={fs.ends_at} />
                        </div>
                      </div>
                      <button
                        onClick={() => handleEndEarly(fs.id)}
                        disabled={endingId === fs.id}
                        className="flex-shrink-0 self-start flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Square className="w-3 h-3" />
                        จบก่อนเวลา
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Create new */}
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 transition-colors font-semibold text-sm"
                >
                  + เปิด Flash Sale ใหม่
                </button>
              ) : !selectedProduct ? (
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">เลือกสินค้าที่จะลดราคา</p>
                  {myProducts.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">ยังไม่มีสินค้า สร้างสินค้าก่อนแล้วกลับมาเปิด Flash Sale ได้เลย</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {myProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectProduct(p)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-colors text-left"
                        >
                          <img
                            src={resolveImageUrl(p.image, getCategoryFallbackImage(p.category))}
                            alt={p.title}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{p.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">฿{p.originalPrice.toLocaleString()}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setShowForm(false)}
                    className="mt-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <img
                      src={resolveImageUrl(selectedProduct.image, getCategoryFallbackImage(selectedProduct.category))}
                      alt={selectedProduct.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{selectedProduct.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ราคาเต็ม ฿{selectedProduct.originalPrice.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      เปลี่ยน
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      ราคา Flash Sale (บาท)
                    </label>
                    <input
                      type="number"
                      value={promoPrice}
                      onChange={(e) => setPromoPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    {Number(promoPrice) > 0 && Number(promoPrice) < selectedProduct.originalPrice && (
                      <p className="text-xs text-green-600 mt-1">
                        ลด {Math.round(((selectedProduct.originalPrice - Number(promoPrice)) / selectedProduct.originalPrice) * 100)}%
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      จำนวนสิทธิ์ทั้งหมด
                    </label>
                    <input
                      type="number"
                      value={totalQuota}
                      onChange={(e) => setTotalQuota(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      ระยะเวลา (เริ่มทันที)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DURATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.minutes}
                          onClick={() => setDurationMinutes(opt.minutes)}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            durationMinutes === opt.minutes
                              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        กำลังเปิด...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        เปิด Flash Sale
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
