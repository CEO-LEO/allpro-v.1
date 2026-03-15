"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductStore } from '@/store/useProductStore'; // Import Store
import { toast } from 'sonner';
import { FASTWORK_URLS } from '@/lib/config';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/solid'; // UI Icons

export default function AddProductPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const addProduct = useProductStore((state) => state.addProduct); // Use Store Action
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState<any>('Food');
  const [description, setDescription] = useState('');
  const [serviceUrl, setServiceUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Convert to Base64 for local storage persistence
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('⚠️ กรุณาล็อกอินก่อนลงขายสินค้า!');
      return;
    }

    if (Number(price) >= Number(originalPrice)) {
      toast.error('⚠️ ราคาลดต้องน้อยกว่าราคาเดิม');
      return;
    }

    setLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Calculate discount
      const discount = Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100);

      // Create new product object
      const newProduct = {
        title,
        description: description || `${title} ลดราคาสุดพิเศษ!`,
        originalPrice: Number(originalPrice),
        promoPrice: Number(price), // Map price to promoPrice
        discount,
        // Use uploaded image preview or fallback to placeholder
        image: imagePreview || `https://source.unsplash.com/400x300/?${category.toLowerCase()},product`,
        shopName: user.shopName || user.name || 'ร้านค้าของฉัน',
        shopLogo: user.shopLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.shopName || user.name || 'Shop')}&background=random`,
        category: category,
        verified: !!user.verified,
        distance: '0.0 km', // Mock distance
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
        tags: [category, 'New Arrival', 'Promo']
      };

      // Add to store
      addProduct(newProduct);

      toast.success('🎉 ลงสินค้าสำเร็จ!');
      
      // Reset form
      setTitle('');
      setPrice('');
      setOriginalPrice('');
      setDescription('');
      setImageFile(null);
      setImagePreview('');
      
      // Redirect to stock page to see the product
      setTimeout(() => {
        router.push('/merchant/stock');
      }, 1000);

    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🏪</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">ลงสินค้าใหม่</h1>
              <p className="text-slate-600">อัปโหลดรูป กรอกข้อมูล กดโพสต์!</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">📸 รูปสินค้า</label>
              
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-64 object-cover rounded-2xl border-4 border-orange-100"
                  />
                  <div 
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition cursor-pointer shadow-lg"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </div>
                </div>
              ) : (
                <label className="group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-orange-500 transition bg-gray-50 hover:bg-orange-50">
                  <div className="text-center group-hover:scale-105 transition-transform">
                    <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-2 group-hover:text-orange-500 transition-colors" />
                    <p className="text-lg font-semibold text-gray-700">คลิกเพื่อเลือกรูป</p>
                    <p className="text-sm text-gray-500 mt-2">รองรับ JPG, PNG (แนะนำ 1:1)</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    // required // Optional for mock
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">📝 ชื่อสินค้า</label>
              <input 
                type="text" 
                required
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-orange-500 focus:outline-none transition"
                placeholder="เช่น ข้าวมันไก่พิเศษ ชุดใหญ่..."
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">🏷️ หมวดหมู่</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-orange-500 focus:outline-none transition"
              >
                <option value="Food">🍔 อาหาร</option>
                <option value="Fashion">👗 แฟชั่น</option>
                <option value="Travel">✈️ ท่องเที่ยว</option>
                <option value="Gadget">📱 อุปกรณ์</option>
                <option value="Beauty">💄 ความงาม</option>
              </select>
            </div>

            {/* Prices Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Original Price */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">💰 ราคาเดิม</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-orange-500 focus:outline-none transition"
                  placeholder="เช่น 100"
                  value={originalPrice} 
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
              </div>

              {/* Discounted Price */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🔥 ราคาลด</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-orange-500 focus:outline-none transition"
                  placeholder="เช่น 50"
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Discount Preview */}
            {price && originalPrice && Number(price) < Number(originalPrice) && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <p className="text-green-800 font-bold text-center">
                  🎉 ลด {Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}% 
                  (ประหยัด {Number(originalPrice) - Number(price)} บาท!)
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">📄 รายละเอียด (ไม่บังคับ)</label>
              <textarea 
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-orange-500 focus:outline-none transition"
                placeholder="เช่น อร่อยมาก ของสด ทำสด..."
                rows={3}
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Fastwork Service URL */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">🔗 ลิงก์จ้างหิ้ว (Fastwork)</label>
              <input 
                type="url"
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none transition text-sm"
                placeholder={FASTWORK_URLS.QUEUE_SERVICE}
                value={serviceUrl} 
                onChange={(e) => setServiceUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">💡 ไม่ใส่ = ลิงก์ไปหน้ารวมฟรีแลนซ์ทั่วไป</p>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-4 rounded-xl hover:from-orange-700 hover:to-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  กำลังอัปโหลด...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🚀 ลงขายทันที
                </span>
              )}
            </button>

            {/* Help Text */}
            <p className="text-sm text-gray-500 text-center">
              💡 เคล็ดลับ: รูปที่ชัดเจน + ข้อความน่าสนใจ = ขายดีแน่นอน!
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
