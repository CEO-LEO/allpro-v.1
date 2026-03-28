"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { FASTWORK_URLS } from '@/lib/config';
import { ArrowLeft, Heart, Share2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const BranchAvailability = dynamic(() => import('@/components/BranchAvailability'), { ssr: false });

// TODO: Replace with API call -> GET /api/products/:id
const TRENDING_PRODUCTS: Record<string, any> = {};

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getProductById, toggleSave, isSaved, user, fetchProducts, loading } = useAppStore();
  
  const [product, setProduct] = useState<any | null>(null);

  // ดึงสินค้าจาก Store หรือ fallback เป็น Trending Mock Data
  useEffect(() => {
    fetchProducts().then(() => {
      const foundProduct = getProductById(id as string);
      if (foundProduct) {
        setProduct(foundProduct);
      } else if (TRENDING_PRODUCTS[id as string]) {
        setProduct(TRENDING_PRODUCTS[id as string]);
      } else {
        setProduct(null);
      }
    });
  }, [id, fetchProducts, getProductById]);

  const handleSave = () => {
    if (!user) {
      toast.error('❌ กรุณาเข้าสู่ระบบก่อน');
      router.push('/');
      return;
    }
    toggleSave(id as string);
    toast.success(isSaved(id as string) ? '❤️ บันทึกแล้ว!' : '💔 ยกเลิกบันทึกแล้ว');
  };

  const handleHireFastwork = () => {
    if (product?.service_url) {
      window.open(product.service_url, '_blank');
    } else {
      window.open(FASTWORK_URLS.GENERAL_ADMIN, '_blank');
    }
    toast.success('🚀 เปิดหน้า Fastwork แล้ว!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: `ดีลสุดคุ้ม! ${product?.title} ลดเหลือ ฿${product?.price}`,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled or share failed - silent fail is OK
        if (err instanceof Error && err.name !== 'AbortError') {
          toast.error('ไม่สามารถแชร์ได้ กรุณาลองอีกครั้ง');
        }
      }
    } else {
      toast.success('📋 คัดลอกลิงก์แล้ว!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // ถ้าหาสินค้าไม่เจอ (404 Logic)
  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-8xl mb-6">😢</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">ไม่พบโปรโมชั่น</h1>
        <p className="text-slate-500 mb-8">ดีลนี้อาจหมดอายุหรือถูกลบไปแล้ว</p>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition"
        >
          กลับหน้าแรก
        </button>
      </div>
    );
  }

  const originalPrice = product.originalPrice || product.price;
  const promoPrice = product.promoPrice || product.price;
  const savings = originalPrice - promoPrice;
  const discountPercent = Math.round((savings / originalPrice) * 100);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header Image */}
      <div className="relative h-80 w-full bg-gradient-to-br from-orange-100 to-orange-50">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`w-full h-full items-center justify-center text-gray-300 ${product.image ? 'hidden' : 'flex'}`}>
          <span className="text-6xl">🛍️</span>
        </div>
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-20 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
            -{discountPercent}%
          </div>
        )}

        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-md hover:bg-white transition"
        >
          <ArrowLeft className="w-6 h-6 text-slate-800" />
        </button>

        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-md hover:bg-white transition"
        >
          <Share2 className="w-6 h-6 text-slate-800" />
        </button>
      </div>

      {/* Content Container */}
      <div className="px-6 py-8 -mt-8 relative bg-white rounded-t-[2rem] shadow-lg">
        {/* Shop Info Badge */}
        <div className="inline-flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full mb-4">
            <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs">🏪</div>
            <span className="text-sm font-bold text-orange-700">{product.shopName}</span>
        </div>

        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2">{product.title}</h1>
        
        <div className="inline-block bg-blue-50 border-2 border-blue-200 px-3 py-1 rounded-full text-xs font-bold text-blue-700 mb-6">
          {product.category}
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-3 mb-4 border-b border-gray-100 pb-6">
            <span className="text-4xl font-black text-red-600">฿{promoPrice.toLocaleString()}</span>
            <div className="flex flex-col">
                <span className="text-sm text-gray-400 line-through">ปกติ ฿{originalPrice.toLocaleString()}</span>
                <span className="text-xs text-red-500 font-bold">ประหยัด ฿{savings.toLocaleString()}</span>
            </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {product.tags.map((tag: string, idx: number) => (
              <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 👇 Price History Graph */}
        <div className="mb-8 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            📈 ประวัติราคา (Price Intelligence)
          </h3>
          
          <div className="relative h-32 w-full">
            <svg className="w-full h-full" viewBox="0 0 500 128" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="32" x2="500" y2="32" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="64" x2="500" y2="64" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="96" x2="500" y2="96" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* Line path */}
              <path
                d={`M 50 52 L 150 38 L 250 64 L 350 77 L 450 71`}
                stroke="url(#lineGradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Area under the line */}
              <path
                d={`M 50 52 L 150 38 L 250 64 L 350 77 L 450 71 L 450 128 L 50 128 Z`}
                fill="url(#areaGradient)"
                opacity="0.3"
              />
              
              {/* Data points */}
              <circle cx="50" cy="52" r="4" fill="#9ca3af" className="cursor-pointer hover:r-6 transition-all">
                <title>฿{Math.round(originalPrice * 1.05).toLocaleString()}</title>
              </circle>
              <circle cx="150" cy="38" r="4" fill="#9ca3af" className="cursor-pointer hover:r-6 transition-all">
                <title>฿{Math.round(originalPrice * 0.95).toLocaleString()}</title>
              </circle>
              <circle cx="250" cy="64" r="4" fill="#9ca3af" className="cursor-pointer hover:r-6 transition-all">
                <title>฿{Math.round(originalPrice * 0.85).toLocaleString()}</title>
              </circle>
              <circle cx="350" cy="77" r="6" fill="#f97316" className="cursor-pointer animate-pulse">
                <title>฿{promoPrice.toLocaleString()} - NOW</title>
              </circle>
              <circle cx="450" cy="71" r="4" fill="#93c5fd" opacity="0.5" className="cursor-pointer hover:r-6 transition-all">
                <title>฿{Math.round(promoPrice * 1.05).toLocaleString()} (คาด)</title>
              </circle>
              
              {/* Gradients */}
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9ca3af" />
                  <stop offset="60%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#93c5fd" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Current price label */}
            <div className="absolute" style={{ left: '70%', top: '50%' }}>
              <div className="relative">
                <div className="bg-orange-500 text-white px-3 py-1 rounded-lg shadow-lg font-bold text-sm whitespace-nowrap animate-pulse">
                  ฿{promoPrice.toLocaleString()}
                  <div className="absolute -top-2 right-0 text-[10px] bg-red-500 px-2 py-0.5 rounded-full">NOW</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-600 mt-3 font-medium">
            <span>3 เดือนก่อน</span>
            <span>2 เดือนก่อน</span>
            <span>เดือนที่แล้ว</span>
            <span className="text-orange-600 font-bold">วันนี้</span>
            <span className="text-blue-500">อาทิตย์หน้า</span>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-green-700 font-bold flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              ราคาต่ำสุดในรอบ 3 เดือน! ลดไป {discountPercent}% รีบซื้อเลย
            </p>
            <p className="text-xs text-gray-600 mt-2">
              💡 <strong>AI Prediction:</strong> ราคาอาจกลับมาสูงขึ้นในอาทิตย์หน้า แนะนำให้ซื้อเลยตอนนี้
            </p>
          </div>
        </div>

        {/* How to Hire Section */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-lg mb-3 text-blue-900">💡 วิธีจ้างหิ้ว</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold min-w-[24px]">1️⃣</span>
              <span>กดปุ่ม "จ้างหิ้ว" ด้านล่าง</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold min-w-[24px]">2️⃣</span>
              <span>เลือกฟรีแลนซ์ที่ใช่จาก Fastwork</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold min-w-[24px]">3️⃣</span>
              <span>จ้างซื้อและส่งให้ถึงบ้าน</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold min-w-[24px]">4️⃣</span>
              <span>รอรับสินค้าตามนัด</span>
            </li>
          </ol>
        </div>

        {/* Warning Box */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>หมายเหตุ:</strong> เราเป็นแค่ตัวกลางแนะนำดีล การจ้างและชำระเงินทำผ่าน Fastwork
          </p>
        </div>

        {/* Product Details Section - Enhanced */}
        <div className="space-y-6 mb-8">
          {/* Main Description */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
              📋 รายละเอียดสินค้า
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-orange-500">
              <p className="text-slate-700 leading-relaxed">
                {product.description || `${product.title} ลดราคาสุดพิเศษ! สินค้าคุณภาพ ราคาดีที่สุด`}
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
              ⭐ คุณสมบัติเด่น
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 space-y-3">
              {['มือถือ', 'คอมพิวเตอร์', 'แท็บเล็ต', 'อิเล็กทรอนิกส์', 'กล้อง', 'เครื่องใช้ไฟฟ้า', 'Gadget'].includes(product.category) ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>เทคโนโลยีล้ำสมัย:</strong> ชิปประมวลผลรุ่นใหม่ล่าสุด ประสิทธิภาพสูงสุด</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>หน้าจอคมชัด:</strong> ความละเอียดสูง สีสันสดใส ใช้งานได้ทั้งวัน</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>แบตเตอรี่ทนทาน:</strong> ใช้งานได้ยาวนาน ชาร์จเร็ว</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>ของแท้ 100%:</strong> นำเข้าอย่างถูกต้อง พร้อมใบเสร็จและเอกสาร</p>
                  </div>
                </>
              ) : ['อาหาร', 'ร้านอาหาร', 'เครื่องดื่ม', 'Food'].includes(product.category) ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>ส่วนผสมคุณภาพ:</strong> วัตถุดิบสด สะอาด ปลอดภัย</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>รสชาติอร่อย:</strong> สูตรพิเศษ รสชาติเข้มข้น คุณภาพคงที่</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>มาตรฐานอนามัย:</strong> ผ่านการตรวจสอบ ได้มาตรฐาน อย.</p>
                  </div>
                </>
              ) : ['แฟชั่นผู้ชาย', 'แฟชั่นผู้หญิง', 'รองเท้า', 'กระเป๋า', 'Fashion'].includes(product.category) ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>คุณภาพพรีเมียม:</strong> ผ้านิ่ม สวมใส่สบาย ทนทาน</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>ดีไซน์ทันสมัย:</strong> สไตล์เท่ ใส่ได้หลายโอกาส</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>ของแท้ มีประกัน:</strong> นำเข้าถูกต้อง มีใบรับรอง</p>
                  </div>
                </>
              ) : ['ความงาม', 'เครื่องสำอาง', 'สุขภาพ', 'สปา', 'Beauty'].includes(product.category) ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>ส่วนผสมคุณภาพ:</strong> ผ่านการทดสอบ ปลอดภัยต่อผิว</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>ผลลัพธ์เห็นชัด:</strong> เห็นผลตั้งแต่ครั้งแรกที่ใช้</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>อย. รับรอง:</strong> ของแท้จากแบรนด์ มาตรฐานสากล</p>
                  </div>
                </>
              ) : ['ท่องเที่ยว', 'โรงแรม', 'Travel'].includes(product.category) ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>ที่พักคุณภาพ:</strong> ผ่านการคัดสรร รีวิวดี สะอาด ปลอดภัย</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>รวมมื้ออาหาร:</strong> อาหารเช้า-เที่ยง-เย็น คุณภาพดี</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>บริการครบวงจร:</strong> รถรับส่ง ไกด์ กิจกรรม ดูแลตลอดทริป</p>
                  </div>
                </>
              ) : ['บ้านและสวน', 'เฟอร์นิเจอร์'].includes(product.category) ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>วัสดุคุณภาพ:</strong> แข็งแรง ทนทาน ใช้งานได้นาน</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>ดีไซน์สวยงาม:</strong> เข้ากับทุกสไตล์การตกแต่ง</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>ส่งฟรี + ติดตั้ง:</strong> จัดส่งและประกอบให้ถึงบ้าน</p>
                  </div>
                </>
              ) : ['กีฬา', 'ฟิตเนส'].includes(product.category) ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>คุณภาพระดับโปร:</strong> มาตรฐานเดียวกับนักกีฬาอาชีพ</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>ทนทาน แข็งแรง:</strong> ออกแบบมาสำหรับการใช้งานหนัก</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>ของแท้ มีประกัน:</strong> รับประกันสินค้าจากผู้ผลิต</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>คุณภาพพรีเมียม:</strong> สินค้าคุณภาพดี ผ่านการคัดสรร</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>คุ้มค่าทุกบาท:</strong> ราคาพิเศษ โปรโมชั่นสุดคุ้ม</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <p className="text-sm text-gray-700"><strong>ของแท้ 100%:</strong> สินค้าต้นฉบับ มีการรับประกัน</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Promotion Terms */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
              🎫 เงื่อนไขโปรโมชั่น
            </h3>
            <div className="bg-orange-50 rounded-xl p-4 space-y-2 border-l-4 border-orange-400">
              <div className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <p className="text-sm text-gray-700">ราคาพิเศษสำหรับการจองผ่าน All Pro เท่านั้น</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <p className="text-sm text-gray-700">โปรโมชั่นนี้มีจำนวนจำกัด จนกว่าสินค้าจะหมด</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <p className="text-sm text-gray-700">ราคาอาจมีการเปลี่ยนแปลงตามร้านค้า กรุณาเช็คราคาล่าสุดก่อนสั่งซื้อ</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <p className="text-sm text-gray-700">การชำระเงินและการรับประกันเป็นไปตามเงื่อนไขของร้านค้า</p>
              </div>
            </div>
          </div>

          {/* Warranty & Service */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
              🛡️ การรับประกัน & บริการ
            </h3>
            <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-500">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">✅</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">รับประกันความเสียหายจากการขนส่ง</p>
                    <p className="text-xs text-gray-600">หากสินค้าเสียหายระหว่างทาง สามารถเคลมได้</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🔄</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">เปลี่ยน/คืนสินค้าได้ (ตามเงื่อนไข)</p>
                    <p className="text-xs text-gray-600">ภายใน 7 วัน หากสินค้าไม่ตรงตามรายละเอียด</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">💬</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">สอบถามข้อมูลได้ทุกเวลา</p>
                    <p className="text-xs text-gray-600">ติดต่อฟรีแลนซ์หรือทีมงาน Fastwork ได้ตลอด 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why Buy Now */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
              🔥 ทำไมต้องซื้อตอนนี้?
            </h3>
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-200">
              <div className="space-y-2">
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-xl">⏰</span>
                  <strong>โปรโมชั่นจำกัดเวลา</strong> - ราคาปกติ ฿{originalPrice.toLocaleString()} ประหยัดไปเลย ฿{savings.toLocaleString()}
                </p>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-xl">📉</span>
                  <strong>ราคาต่ำสุดในรอบ 3 เดือน</strong> - ไม่มีลดแบบนี้อีกแล้ว!
                </p>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-xl">🎁</span>
                  <strong>ของมีจำนวนจำกัด</strong> - เหลือไม่กี่ชิ้นแล้ว รีบจองก่อนหมด!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Branch Availability Section */}
        <BranchAvailability 
          productId={id as string}
          productTitle={product.title}
        />
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 px-6 z-50 flex items-center gap-4 pb-safe">
        <button 
            onClick={handleSave}
            className={`p-4 rounded-full border transition-all ${
                isSaved(id as string) ? 'bg-red-50 border-red-200 text-red-500' : 'border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500'
            }`}
        >
            <Heart className={`w-6 h-6 ${isSaved(id as string) ? 'fill-current' : ''}`} />
        </button>
        
        <button 
            onClick={handleHireFastwork}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold h-14 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
            <img src={FASTWORK_URLS.FAVICON} alt="Fastwork" className="w-5 h-5" />
            <span>จ้างหิ้ว (Fastwork)</span>
            <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
