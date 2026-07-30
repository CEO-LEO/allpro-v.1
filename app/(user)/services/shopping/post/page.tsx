'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, DollarSign, Clock, Camera, ArrowLeft, CheckCircle, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLoadScript } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { postShoppingRequest, type ShoppingUrgency } from '@/lib/shoppingService';
import { uploadProductImage } from '@/lib/uploadImage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const GOOGLE_MAPS_LIBS: ('places')[] = ['places'];

// ─── Pickup location — real Google Places Autocomplete when a Maps API key
// is configured, otherwise a plain always-usable text input ─────────────────
function PickupLocationInput({
  value,
  onChange,
  onSelectCoords,
  isMapsLoaded,
}: {
  value: string;
  onChange: (val: string) => void;
  onSelectCoords: (coords: { lat: number; lng: number }) => void;
  isMapsLoaded: boolean;
}) {
  const {
    ready,
    suggestions: { status, data },
    setValue: setAutocompleteValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: 'th' } },
    debounce: 300,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isMapsLoaded) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="เช่น: คอนโด The Address Asoke ชั้น 1"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        disabled={!ready}
        onChange={(e) => {
          onChange(e.target.value);
          setAutocompleteValue(e.target.value);
          setShowDropdown(true);
        }}
        placeholder="เช่น: คอนโด The Address Asoke ชั้น 1"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      {showDropdown && status === 'OK' && data.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {data.map(({ place_id, structured_formatting }) => (
            <li key={place_id}>
              <button
                type="button"
                onClick={async () => {
                  const description = structured_formatting.main_text + (structured_formatting.secondary_text ? ', ' + structured_formatting.secondary_text : '');
                  setAutocompleteValue(description, false);
                  clearSuggestions();
                  setShowDropdown(false);
                  onChange(description);
                  try {
                    const results = await getGeocode({ placeId: place_id });
                    const { lat, lng } = getLatLng(results[0]);
                    onSelectCoords({ lat, lng });
                  } catch {
                    // Address text is still saved even if geocoding fails
                  }
                }}
                className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors flex items-start gap-3 border-b border-gray-50 last:border-0"
              >
                <MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{structured_formatting.main_text}</p>
                  {structured_formatting.secondary_text && (
                    <p className="text-xs text-gray-400 truncate">{structured_formatting.secondary_text}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const CATEGORY_HINTS: Record<string, string> = {
  'อาหาร': 'food', food: 'food',
  'แฟชั่น': 'fashion', fashion: 'fashion',
  'อุปกรณ์': 'electronics', electronics: 'electronics',
  'ความงาม': 'beauty', beauty: 'beauty',
};

function PostShoppingRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  const prefillTitle = searchParams.get('title') || '';
  const prefillStoreName = searchParams.get('storeName') || '';
  const prefillBudget = searchParams.get('budget') || '';
  const prefillCategory = CATEGORY_HINTS[searchParams.get('category') || ''] || '';

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded: _isMapsLoaded } = useLoadScript({ googleMapsApiKey, libraries: GOOGLE_MAPS_LIBS });
  const isMapsLoaded = googleMapsApiKey ? _isMapsLoaded : false;

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: prefillTitle ? `ฝากซื้อ: ${prefillTitle}` : '',
    description: '',
    category: prefillCategory,
    storeName: prefillStoreName,
    storeLocation: '',
    pickupLocation: '',
    budget: prefillBudget,
    serviceFee: '',
    deadline: '',
    urgency: 'normal' as ShoppingUrgency,
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - imageFiles.length);
    if (files.length === 0) return;
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนโพสต์งาน');
      return;
    }
    const budgetNum = Number(formData.budget);
    const feeNum = Number(formData.serviceFee) || 0;
    if (!budgetNum || budgetNum <= 0) {
      toast.error('กรุณากรอกงบประมาณให้ถูกต้อง');
      return;
    }
    if (!formData.deadline) {
      toast.error('กรุณาระบุเวลาที่ต้องการ');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload any attached photos for real (Supabase Storage)
      const uploadedPaths: string[] = [];
      if (isSupabaseConfigured) {
        for (const file of imageFiles) {
          const path = await uploadProductImage(file, 'shopping-requests');
          if (path) {
            const { data: pub } = supabase.storage.from('promotions').getPublicUrl(path);
            uploadedPaths.push(pub.publicUrl);
          }
        }
      }

      const result = await postShoppingRequest({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        storeName: formData.storeName,
        storeLocation: formData.storeLocation,
        pickupLocation: formData.pickupLocation,
        pickupCoords,
        budget: budgetNum,
        serviceFee: feeNum,
        deadline: new Date(formData.deadline).toISOString(),
        urgency: formData.urgency,
        images: uploadedPaths,
      });

      if (!result.success) {
        toast.error(result.error || 'โพสต์งานไม่สำเร็จ กรุณาลองใหม่');
        return;
      }

      toast.success('โพสต์งานฝากซื้อสำเร็จ! 🎉', {
        description: 'รอคนหิ้วมารับงานได้เลย',
        duration: 3000,
      });

      setTimeout(() => {
        router.push('/services/shopping/my-requests');
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'food', label: 'อาหาร & เครื่องดื่ม', emoji: '🍔' },
    { id: 'fashion', label: 'เสื้อผ้า & แฟชั่น', emoji: '👕' },
    { id: 'electronics', label: 'อิเล็กทรอนิกส์', emoji: '📱' },
    { id: 'beauty', label: 'ความงาม', emoji: '💄' },
    { id: 'home', label: 'ของใช้ในบ้าน', emoji: '🏠' },
    { id: 'other', label: 'อื่นๆ', emoji: '📦' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">กรุณาเข้าสู่ระบบ</h2>
        <p className="text-sm text-gray-500 mb-6">เพื่อโพสต์งานฝากซื้อ</p>
        <Link href="/services/shopping" className="text-purple-600 font-semibold hover:underline">
          กลับหน้าบริการฝากหิ้ว
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-16">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white py-8">
          <div className="max-w-4xl mx-auto px-4">
            <Link
              href="/services/shopping"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              ย้อนกลับ
            </Link>
            <h1 className="text-3xl font-bold mb-2">โพสต์งานฝากซื้อ 🛍️</h1>
            <p className="text-purple-100">กรอกรายละเอียดสินค้าที่ต้องการฝากซื้อ</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: step === s ? 1.2 : 1,
                    backgroundColor: step >= s ? '#9333EA' : '#E5E7EB',
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    step >= s ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </motion.div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 ${
                      step > s ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      ข้อมูลพื้นฐาน
                    </h2>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่องาน *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="เช่น: ฝากซื้อไอศกรีม Haagen-Dazs จาก Tops"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      หมวดหมู่ *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, category: cat.id })
                          }
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.category === cat.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="text-3xl mb-2">{cat.emoji}</div>
                          <div className="text-sm font-medium text-gray-900">
                            {cat.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รายละเอียด *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="บอกรายละเอียดสินค้าให้ชัดเจน เช่น ขนาด สี จำนวน หรือข้อกำหนดพิเศษ"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.title || !formData.category || !formData.description}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    ถัดไป →
                  </button>
                </motion.div>
              )}

              {/* Step 2: Location & Budget */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      สถานที่และงบประมาณ
                    </h2>
                  </div>

                  {/* Store Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อร้านค้า *
                    </label>
                    <input
                      type="text"
                      value={formData.storeName}
                      onChange={(e) =>
                        setFormData({ ...formData, storeName: e.target.value })
                      }
                      placeholder="เช่น: Tops Central World"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Store Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      ที่ตั้งร้านค้า *
                    </label>
                    <input
                      type="text"
                      value={formData.storeLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, storeLocation: e.target.value })
                      }
                      placeholder="เช่น: ชั้น B ห้าง Central World"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Pickup Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      จุดรับสินค้า *
                    </label>
                    <PickupLocationInput
                      value={formData.pickupLocation}
                      onChange={(val) => { setFormData((p) => ({ ...p, pickupLocation: val })); setPickupCoords(null); }}
                      onSelectCoords={setPickupCoords}
                      isMapsLoaded={isMapsLoaded}
                    />
                    {pickupCoords ? (
                      <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> ปักหมุดแล้ว — คนหิ้วจะเห็นระยะทางจริง
                      </p>
                    ) : !isMapsLoaded ? (
                      <p className="text-xs text-amber-600 mt-1.5">
                        ระบบแนะนำที่อยู่ยังไม่เชื่อมต่อ — บันทึกเป็นข้อความได้ตามปกติ แต่จะยังไม่แสดงระยะทางจนกว่าจะตั้งค่า Google Maps
                      </p>
                    ) : null}
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      งบประมาณ (บาท) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({ ...formData, budget: e.target.value })
                      }
                      placeholder="500"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      ราคาสินค้าโดยประมาณ (ยังไม่รวมค่าบริการ)
                    </p>
                  </div>

                  {/* Service Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      ค่าบริการที่จะจ่ายให้คนหิ้ว (บาท) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.serviceFee}
                      onChange={(e) =>
                        setFormData({ ...formData, serviceFee: e.target.value })
                      }
                      placeholder="50"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      ยิ่งให้สูง ยิ่งมีคนรับงานเร็ว — จ่ายเงินสด/โอนโดยตรงกับคนหิ้วตอนรับของ (แอปยังไม่มีระบบชำระเงินในตัว)
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                      ← ย้อนกลับ
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!formData.storeName || !formData.storeLocation || !formData.pickupLocation || !formData.budget}
                      className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      ถัดไป →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Deadline & Submit */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      กำหนดเวลาและรูปภาพ
                    </h2>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      ต้องการภายใน *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ความเร่งด่วน
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'normal' as const, label: 'ปกติ' },
                        { id: 'urgent' as const, label: 'เร่งด่วน' },
                        { id: 'asap' as const, label: 'ด่วนมาก' },
                      ].map((urg) => (
                        <button
                          key={urg.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, urgency: urg.id })
                          }
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.urgency === urg.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-medium">{urg.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Camera className="w-4 h-4 inline mr-1" />
                      รูปภาพ (ไม่บังคับ)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {imagePreviews.map((src, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {imageFiles.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                      >
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">คลิกเพื่ออัพโหลดรูปสินค้า</p>
                        <p className="text-sm text-gray-400 mt-1">
                          รองรับ JPG, PNG (สูงสุด 5 รูป)
                        </p>
                      </button>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <h3 className="font-bold text-gray-900 mb-3">สรุปงาน</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>งาน:</strong> {formData.title}</p>
                      <p><strong>หมวดหมู่:</strong> {categories.find(c => c.id === formData.category)?.label}</p>
                      <p><strong>ร้านค้า:</strong> {formData.storeName}</p>
                      <p><strong>งบประมาณ:</strong> {formData.budget} บาท</p>
                      <p><strong>ค่าบริการ:</strong> {formData.serviceFee || 0} บาท</p>
                      <p><strong>รับที่:</strong> {formData.pickupLocation}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                      ← ย้อนกลับ
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                      {isSubmitting ? 'กำลังโพสต์...' : 'โพสต์งาน 🚀'}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PostShoppingRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      }
    >
      <PostShoppingRequestForm />
    </Suspense>
  );
}
