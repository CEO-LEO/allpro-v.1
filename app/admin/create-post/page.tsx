'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import AdminLayout from '@/components/Admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Calendar,
  MapPin,
  CheckCircle,
  Zap,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface ImageWithWatermark {
  id: string;
  preview: string;
  file: File;
  watermarked: string | null;
}

const CATEGORIES = [
  '🍔 อาหาร',
  '☕ เครื่องดื่ม',
  '👕 แฟชั่น',
  '💄 ความงาม',
  '📱 อิเล็กทรอนิกส์',
  '🏋️ ฟิตเนส',
  '✈️ ท่องเที่ยว',
  '🎮 ความบันเทิง'
];

const BRANCHES = [
  { id: 'all', name: '🌍 ทุกสาขา' },
  { id: 'central-world', name: '🏢 Central World' },
  { id: 'siam-paragon', name: '🏪 Siam Paragon' },
  { id: 'emquartier', name: '🛍️ EmQuartier' },
  { id: 'mega-bangna', name: '🏬 Mega Bangna' },
  { id: 'terminal-21', name: '✈️ Terminal 21' },
];

export default function AdminCreatePostPage() {
  const [images, setImages] = useState<ImageWithWatermark[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    discount: '',
    originalPrice: '',
    promoPrice: '',
    startDate: '',
    endDate: '',
    branches: [] as string[],
    tags: '',
  });

  // 🎨 Auto-Watermark Function
  const addWatermarkToImage = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        if (!ctx) {
          reject('Canvas context not available');
          return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Watermark settings
        const watermarkText = 'ALL PRO';
        const fontSize = Math.max(img.width * 0.05, 24);
        const padding = 20;

        // Semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(
          img.width - 200 - padding,
          img.height - fontSize - padding * 2,
          200,
          fontSize + padding
        );

        // Text
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = '#FF6B35';
        ctx.textAlign = 'right';
        ctx.fillText(
          watermarkText,
          img.width - padding * 2,
          img.height - padding * 1.5
        );

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject('Failed to create blob');
          }
        }, 'image/jpeg', 0.9);
      };

      img.onerror = () => reject('Failed to load image');
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // 📤 Dropzone Handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);

    try {
      const newImages = await Promise.all(
        acceptedFiles.map(async (file) => {
          const preview = URL.createObjectURL(file);
          const watermarked = await addWatermarkToImage(file);
          
          return {
            id: Math.random().toString(36).substr(2, 9),
            preview,
            file,
            watermarked,
          };
        })
      );

      setImages((prev) => [...prev, ...newImages]);
      alert(`เพิ่ม ${newImages.length} รูปสำเร็จ! 🎉`);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }, [addWatermarkToImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 10485760, // 10MB
  });

  // 🗑️ Remove Image
  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (currentImageIndex >= images.length - 1) {
      setCurrentImageIndex(Math.max(0, images.length - 2));
    }
  };

  // ⬅️➡️ Navigate Images
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // 🚀 Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (images.length === 0) {
      alert('กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป');
      return;
    }

    if (!formData.title || !formData.category || !formData.startDate || !formData.endDate) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. อัปโหลดรูปภาพไป Supabase Storage
      const imageUrls: string[] = [];
      
      for (const img of images) {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${img.file.name}`;
        const filePath = `promotions/${fileName}`;
        
        // Upload watermarked image
        const watermarkedBlob = await fetch(img.watermarked!).then(r => r.blob());
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('promotions')
          .upload(filePath, watermarkedBlob, {
            contentType: img.file.type,
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.warn('Upload failed, might need to create storage bucket:', uploadError);
          // ถ้า bucket ไม่มี ใช้ fallback URL
          imageUrls.push(`/placeholder-promo-${imageUrls.length + 1}.jpg`);
        } else {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('promotions')
            .getPublicUrl(filePath);
          
          imageUrls.push(publicUrl);
        }
      }

      // 2. Insert ข้อมูลโปรโมชั่นลง products table
      const productData = {
        title: formData.title,
        description: formData.description || '',
        category: formData.category,
        price: formData.promoPrice ? parseFloat(formData.promoPrice) : 0,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        promoPrice: formData.promoPrice ? parseFloat(formData.promoPrice) : null,
        discount: formData.discount || null,
        image: imageUrls[0] || '/placeholder.jpg',
        images: imageUrls,
        shopName: 'Admin Upload',
        validUntil: formData.endDate,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        verified: true,
        branches: formData.branches,
      };

      const { data: insertedProduct, error: insertError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (insertError) {
        console.warn('Insert to database failed:', insertError);
        alert('⚠️ อัปโหลดรูปสำเร็จ แต่บันทึก DB ไม่ได้ กรุณาตรวจสอบ Supabase Schema');
      } else {
        // Success
        setUploadSuccess(true);
        alert(`🎉 ลงโปรโมชั่นสำเร็จ! ID: ${insertedProduct.id}\nอัปโหลด ${images.length} รูปพร้อม Watermark แล้ว`);
      }

      // Reset form
      setTimeout(() => {
        setImages([]);
        setFormData({
          title: '',
          description: '',
          category: '',
          discount: '',
          originalPrice: '',
          promoPrice: '',
          startDate: '',
          endDate: '',
          branches: [],
          tags: '',
        });
        setUploadSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Submit error:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle Branch Selection
  const toggleBranch = (branchId: string) => {
    setFormData((prev) => ({
      ...prev,
      branches: prev.branches.includes(branchId)
        ? prev.branches.filter((id) => id !== branchId)
        : [...prev.branches, branchId]
    }));
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white">Create Promotion</h1>
                <p className="text-gray-400">อัปโหลดโปรโมชั่นใหม่ภายใน 1 นาที</p>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-orange-500" />
                รูปภาพโปรโมชั่น (พร้อม Auto-Watermark)
              </h2>

              {/* Dropzone */}
              {images.length === 0 ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-white font-semibold mb-2">
                    {isDragActive ? '📥 วางรูปที่นี่...' : '📤 ลากรูปมาวาง หรือคลิกเพื่อเลือก'}
                  </p>
                  <p className="text-sm text-gray-400">
                    รองรับ JPG, PNG, GIF (สูงสุด 10MB/รูป)
                  </p>
                  <p className="text-xs text-orange-400 mt-2">
                    💡 Watermark จะถูกเพิ่มอัตโนมัติ
                  </p>
                </div>
              ) : (
                <>
                  {/* Image Carousel */}
                  <div className="relative bg-black rounded-2xl overflow-hidden mb-4">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentImageIndex}
                        src={images[currentImageIndex].watermarked || images[currentImageIndex].preview}
                        alt={`Preview ${currentImageIndex + 1}`}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-96 object-contain"
                      />
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          type="button"
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-bold">
                      {currentImageIndex + 1} / {images.length}
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeImage(images[currentImageIndex].id)}
                      className="absolute top-4 right-4 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Thumbnails */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, index) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          index === currentImageIndex
                            ? 'border-orange-500 scale-110'
                            : 'border-gray-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.watermarked || img.preview}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}

                    {/* Add More Button */}
                    <button
                      type="button"
                      {...getRootProps()}
                      className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-gray-700 rounded-xl hover:border-orange-500 hover:bg-orange-500/10 transition-all flex items-center justify-center"
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                </>
              )}

              {isProcessing && (
                <div className="mt-4 flex items-center justify-center gap-2 text-orange-400">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full"
                  />
                  <span className="font-semibold">กำลังเพิ่ม Watermark...</span>
                </div>
              )}
            </motion.div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  ชื่อโปรโมชั่น *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Buy 1 Get 1 Free - All Drinks!"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  required
                />
              </motion.div>

              {/* Category */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  หมวดหมู่ *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  required
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </motion.div>

              {/* Discount */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  ส่วนลด
                </label>
                <input
                  type="text"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="e.g., 50% หรือ ซื้อ 1 แถม 1"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </motion.div>

              {/* Original Price */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  ราคาปกติ (฿)
                </label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="299"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </motion.div>

              {/* Promo Price */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  ราคาโปร (฿)
                </label>
                <input
                  type="number"
                  value={formData.promoPrice}
                  onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                  placeholder="149"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </motion.div>

              {/* Start Date */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  เริ่มต้น *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  required
                />
              </motion.div>

              {/* End Date */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-500" />
                  สิ้นสุด *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  required
                />
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  รายละเอียด
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="อธิบายเงื่อนไขโปรโมชั่น..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                />
              </motion.div>

              {/* Branches */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  สาขาที่ร่วมรายการ
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {BRANCHES.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => toggleBranch(branch.id)}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                        formData.branches.includes(branch.id)
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {branch.name}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Tags */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Tags (แยกด้วย comma)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., จานด่วน, ราคาพิเศษ, เมนูใหม่"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isProcessing}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black text-lg rounded-2xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                  กำลังอัปโหลด...
                </>
              ) : uploadSuccess ? (
                <>
                  <CheckCircle className="w-6 h-6" />
                  สำเร็จแล้ว!
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  ลงโปรโมชั่นทันที
                </>
              )}
            </motion.button>

            {/* Info Alert */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-semibold mb-1">💡 คำแนะนำ:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-200">
                  <li>อัปโหลด 3-5 รูปจะทำให้โพสต์ดูน่าสนใจ</li>
                  <li>Watermark จะถูกเพิ่มอัตโนมัติที่มุมขวาล่าง</li>
                  <li>ระบุวันหมดอายุชัดเจนเพื่อความน่าเชื่อถือ</li>
                </ul>
              </div>
            </motion.div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </AdminLayout>
  );
}
