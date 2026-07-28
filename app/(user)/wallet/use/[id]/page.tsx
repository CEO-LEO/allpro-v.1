"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProductStore } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getPromotionById } from '@/lib/getPromotions';
import { redeemClaimByPin } from '@/lib/analytics';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { X, Clock, Loader2, Copy, Check, CheckCircle, AlertCircle, Lock, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';

interface CouponProduct {
  id: string;
  shopName: string;
  title: string;
  validUntil?: string;
}

export default function UseCouponPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuthStore();
  const decodedId = decodeURIComponent(id as string);
  const [product, setProduct] = useState<CouponProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 นาที
  const [refCode] = useState(() => `PRO-${decodedId.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`);
  const [copied, setCopied] = useState(false);
  const [isUsed, setIsUsed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [redeemPin, setRedeemPin] = useState<string | null>(null);
  const [showStaffPin, setShowStaffPin] = useState(false);
  const [pinInput, setPinInput] = useState('');

  // Computed once on mount (lazy initializer) — NOT recomputed on every
  // re-render, otherwise the 15-min countdown timer (which ticks every
  // second) would produce a brand new Date.now() each time and the QR
  // image would change every second, making it impossible to scan.
  const [qrValue] = useState(() => `ALLPRO:${decodedId}:${Date.now()}`);

  // Find product from multiple sources
  useEffect(() => {
    async function findProduct() {
      const storeProduct = useProductStore.getState().products.find(p => p.id === decodedId);
      if (storeProduct) {
        setProduct({ id: storeProduct.id, shopName: storeProduct.shopName, title: storeProduct.title, validUntil: storeProduct.validUntil });
        setLoading(false);
        return;
      }

      const staticPromo = getPromotionById(decodedId);
      if (staticPromo) {
        setProduct({ id: staticPromo.id, shopName: staticPromo.shop_name, title: staticPromo.title, validUntil: staticPromo.valid_until });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/products/${encodeURIComponent(decodedId)}`);
        const json = await res.json();
        if (json.data) {
          setProduct({
            id: String(json.data.id),
            shopName: String(json.data.shop_name || json.data.shopName || 'ร้านค้า'),
            title: String(json.data.title || ''),
            validUntil: json.data.valid_until || json.data.validUntil,
          });
        }
      } catch {}

      setLoading(false);
    }
    findProduct();
  }, [decodedId]);

  // หา claim จริงของ user คนนี้สำหรับสินค้านี้ (ถ้ามี) เพื่อให้ "ใช้แล้ว" อัปเดต
  // สถานะจริงใน promotion_claims แทนการปลอมแค่ state ในเครื่อง
  useEffect(() => {
    async function findClaim() {
      if (!user?.id || !isSupabaseConfigured) return;
      const { data } = await supabase
        .from('promotion_claims')
        .select('id, redeem_pin')
        .eq('user_id', user.id)
        .eq('product_id', decodedId)
        .eq('status', 'claimed')
        .order('claimed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setClaimId(data.id);
        setRedeemPin(data.redeem_pin);
      }
    }
    findClaim();
  }, [user?.id, decodedId]);

  // นับถอยหลัง 15 นาที
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(refCode).then(() => {
      setCopied(true);
      toast.success('คัดลอกโค้ดแล้ว!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ไม่มี claim จริง (เช่น มาจากรายการที่บันทึกไว้แต่ไม่เคยกด "รับโปรโมชั่น" มาก่อน)
  // — ไม่มีอะไรให้ยืนยันด้วย PIN จริง จึงปิดหน้าได้เลยแบบเดิม แต่จะไม่มีประวัติ
  // เข้าไปในแท็บ "ที่กดรับ" เพราะไม่มี claim ให้ผูก
  const handleCloseWithoutClaim = () => {
    setIsUsed(true);
    toast.success('ปิดหน้าจอแล้ว');
  };

  // มี claim จริง — ต้องให้พนักงานพิมพ์ PIN ยืนยันก่อนถึงจะ mark ว่าใช้แล้วจริง
  const handleStaffConfirm = async () => {
    if (isConfirming || !claimId) return;
    setIsConfirming(true);
    try {
      const result = await redeemClaimByPin(claimId, pinInput);
      if (!result.success) {
        toast.error(result.message);
        setPinInput('');
        return;
      }
      setIsUsed(true);
      toast.success(result.message);
    } finally {
      setIsConfirming(false);
    }
  };

  // Days until expiry
  const daysLeft = product?.validUntil
    ? Math.ceil((new Date(product.validUntil).getTime() - Date.now()) / 86400000)
    : null;
  const isExpired = daysLeft !== null && daysLeft < 0;
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-white/70 mb-4">ไม่พบคูปองนี้</p>
        <button onClick={() => router.push('/wallet')} className="text-orange-400 underline">กลับกระเป๋า</button>
      </div>
    );
  }

  if (isUsed) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">ใช้คูปองสำเร็จ!</h2>
          <p className="text-white/60 mb-8">ขอบคุณที่ใช้บริการ All Pro</p>
          <button onClick={() => router.push('/')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-colors">
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative">
      {/* ปุ่มปิด */}
      <button onClick={() => router.back()} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
        <X className="w-8 h-8" />
      </button>

      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center">
          <p className="text-white/80 text-sm font-medium">ยื่นให้พนักงานสแกน</p>
          <h2 className="text-white font-black text-2xl mt-1">{product.shopName}</h2>
          <p className="text-white/70 text-sm mt-1 line-clamp-1">{product.title}</p>
        </div>

        {/* Expiry warning */}
        {isExpired && (
          <div className="mx-4 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-xs font-medium">คูปองนี้หมดอายุแล้ว ไม่สามารถใช้งานได้</p>
          </div>
        )}
        {!isExpired && isUrgent && (
          <div className="mx-4 mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-amber-700 text-xs font-medium">⚠️ หมดอายุใน <span className="font-bold">{daysLeft} วัน</span></p>
          </div>
        )}

        {/* QR Code */}
        <div className="p-8 flex flex-col items-center">
          <div className={`p-4 bg-white rounded-2xl border-2 ${isExpired ? 'border-gray-200 opacity-40 grayscale' : 'border-dashed border-orange-300'}`}>
            <QRCode value={qrValue} size={200} fgColor="#1f2937" />
          </div>

          {/* Coupon Code + Copy */}
          <div className="mt-4 w-full">
            <p className="text-gray-400 text-xs text-center mb-2">โค้ดสำรอง</p>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2">
              <span className="flex-1 font-mono text-sm font-bold text-gray-800 tracking-wider text-center select-all">
                {refCode}
              </span>
              <button onClick={handleCopy} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
          </div>

          {/* Staff PIN — only shown when there's a real claim to verify */}
          {claimId && redeemPin && !isExpired && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 mb-1.5 flex items-center justify-center gap-1">
                <KeyRound className="w-3.5 h-3.5" />
                แจ้งรหัสนี้ให้พนักงานเพื่อยืนยันการใช้งาน
              </p>
              <div className="inline-flex bg-amber-50 border-2 border-amber-300 rounded-xl px-5 py-2">
                <p className="text-2xl font-mono font-black text-amber-700 tracking-[0.3em]">
                  {redeemPin}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Timer Bar */}
        <div className="bg-gray-50 px-5 py-4 border-t border-gray-100">
          {/* Countdown progress bar */}
          <div className="h-1.5 bg-gray-200 rounded-full mb-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${timeLeft < 120 ? 'bg-red-500' : 'bg-orange-500'}`}
              style={{ width: `${(timeLeft / (15 * 60)) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className={`flex items-center gap-2 font-bold text-sm ${timeLeft < 120 ? 'text-red-500' : 'text-gray-700'}`}>
              <Clock className="w-4 h-4" />
              <span>หมดอายุใน {formatTime(timeLeft)}</span>
            </div>
            {!isExpired && !claimId && (
              <button
                onClick={handleCloseWithoutClaim}
                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                ใช้แล้ว
              </button>
            )}
            {!isExpired && claimId && !showStaffPin && (
              <button
                onClick={() => setShowStaffPin(true)}
                className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <Lock className="w-4 h-4" />
                ยืนยันการใช้งาน (พนักงาน)
              </button>
            )}
          </div>

          {/* Staff PIN entry panel */}
          {!isExpired && claimId && showStaffPin && (
            <div className="mt-4 p-4 bg-gray-900 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-yellow-400" />
                <p className="text-xs font-bold text-yellow-400">STAFF ONLY — กรอกรหัส PIN ที่ลูกค้าแจ้ง</p>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="0000"
                autoFocus
                className="w-full px-4 py-3 border-2 border-yellow-400 rounded-xl text-center text-2xl font-mono font-bold tracking-[0.3em] bg-white"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleStaffConfirm}
                  disabled={pinInput.length !== 4 || isConfirming}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  ยืนยัน
                </button>
                <button
                  onClick={() => { setShowStaffPin(false); setPinInput(''); }}
                  disabled={isConfirming}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
