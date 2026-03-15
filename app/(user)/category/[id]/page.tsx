'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Promotion } from '@/lib/types';
import {
  ShoppingBagIcon,
  SparklesIcon,
  CakeIcon,
  HeartIcon,
  BeakerIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  PaperAirplaneIcon,
  TruckIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ScissorsIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import PromoCard from '@/components/PromoCard';

// Category data structure
const CATEGORY_DATA: Record<string, any> = {
  'แฟชั่นผู้หญิง': {
    name: 'แฟชั่นผู้หญิง',
    icon: SparklesIcon,
    color: 'from-purple-500 to-pink-500',
    subcategories: [
      { id: 'รองเท้าผู้หญิง', name: 'รองเท้าผู้หญิง', icon: ShoppingBagIcon },
      { id: 'รองเท้าแตะ', name: 'รองเท้าแตะ', icon: ShoppingBagIcon },
      { id: 'รองเท้าบูท', name: 'รองเท้าบูท', icon: ShoppingBagIcon },
      { id: 'เสื้อผ้าผู้หญิง', name: 'เสื้อผ้า', icon: SparklesIcon },
      { id: 'เสื้อ', name: 'เสื้อ', icon: SparklesIcon },
      { id: 'เสื้ออก', name: 'เสื้ออก', icon: ShoppingBagIcon },
      { id: 'กางเกง', name: 'กางเกง', icon: ShoppingBagIcon },
      { id: 'กระโปรง', name: 'กระโปรง', icon: SparklesIcon },
      { id: 'ชุดเดรส', name: 'ชุดเดรส', icon: SparklesIcon },
      { id: 'เครื่องแต่งกาย', name: 'เครื่องแต่งกาย', icon: ShoppingBagIcon },
      { id: 'ชุดโม่ง', name: 'ชุดโม่ง', icon: ShoppingBagIcon },
      { id: 'ชุดชั้นใน', name: 'ชุดชั้นใน', icon: HeartIcon },
    ]
  },
  'แฟชั่นผู้ชาย': {
    name: 'แฟชั่นผู้ชาย',
    icon: ShoppingBagIcon,
    color: 'from-indigo-500 to-purple-500',
    subcategories: [
      { id: 'รองเท้าผู้ชาย', name: 'รองเท้าผู้ชาย', icon: ShoppingBagIcon },
      { id: 'แตะผู้ชาย', name: 'รองเท้าแตะ', icon: ShoppingBagIcon },
      { id: 'รองเท้าบูทชาย', name: 'รองเท้าบูท', icon: ShoppingBagIcon },
      { id: 'เสื้อผ้าชาย', name: 'เสื้อผ้า', icon: ShoppingBagIcon },
      { id: 'เสื้อชาย', name: 'เสื้อ', icon: ShoppingBagIcon },
      { id: 'เสื้ออกชาย', name: 'เสื้ออก', icon: ShoppingBagIcon },
      { id: 'กางเกงชาย', name: 'กางเกง', icon: ShoppingBagIcon },
      { id: 'เครื่องแต่งกายชาย', name: 'เครื่องแต่งกาย', icon: ShoppingBagIcon },
      { id: 'ชุดโม่งชาย', name: 'ชุดโม่ง', icon: ShoppingBagIcon },
      { id: 'ชุดชั้นในชาย', name: 'ชุดชั้นใน', icon: ShoppingBagIcon },
    ]
  },
  'กระเป๋า': {
    name: 'กระเป๋า',
    icon: ShoppingBagIcon,
    color: 'from-amber-500 to-orange-600',
    subcategories: [
      { id: 'กระเป๋าสตางค์', name: 'กระเป๋าสตางค์', icon: CurrencyDollarIcon },
      { id: 'กระเป๋าถือ', name: 'กระเป๋าถือ', icon: ShoppingBagIcon },
      { id: 'กระเป๋าเป้', name: 'กระเป๋าเป้', icon: ShoppingBagIcon },
      { id: 'กระเป๋านักเรียน', name: 'กระเป๋านักเรียน', icon: ShoppingBagIcon },
      { id: 'กระเป๋าเดินทาง', name: 'กระเป๋าเดินทาง', icon: TruckIcon },
      { id: 'กระเป๋าสะพาย', name: 'กระเป๋าสะพาย', icon: ShoppingBagIcon },
      { id: 'กระเป๋าคาดเอว', name: 'กระเป๋าคาดเอว', icon: ShoppingBagIcon },
    ]
  },
  'อาหาร': {
    name: 'อาหาร',
    icon: CakeIcon,
    color: 'from-pink-500 to-rose-500',
    subcategories: [
      { id: 'อาหารญี่ปุ่น', name: 'อาหารญี่ปุ่น', icon: CakeIcon },
      { id: 'อาหารไทย', name: 'อาหารไทย', icon: CakeIcon },
      { id: 'บุฟเฟ่ต์', name: 'บุฟเฟ่ต์', icon: ClipboardDocumentListIcon },
      { id: 'ฟาสต์ฟู้ด', name: 'ฟาสต์ฟู้ด', icon: CakeIcon },
      { id: 'อาหารทะเล', name: 'อาหารทะเล', icon: CakeIcon },
    ]
  },
  'เครื่องดื่ม': {
    name: 'เครื่องดื่ม',
    icon: BeakerIcon,
    color: 'from-blue-500 to-cyan-500',
    subcategories: [
      { id: 'กาแฟ', name: 'กาแฟ', icon: BeakerIcon },
      { id: 'ชา', name: 'ชา', icon: BeakerIcon },
      { id: 'น้ำผลไม้', name: 'น้ำผลไม้', icon: BeakerIcon },
      { id: 'นม', name: 'นม', icon: BeakerIcon },
    ]
  },
  'ท่องเที่ยว': {
    name: 'ท่องเที่ยว',
    icon: GlobeAltIcon,
    color: 'from-sky-500 to-blue-600',
    subcategories: [
      { id: 'โรงแรม', name: 'โรงแรม', icon: BuildingStorefrontIcon },
      { id: 'ตั๋วเครื่องบิน', name: 'ตั๋วเครื่องบิน', icon: PaperAirplaneIcon },
      { id: 'แพ็คเกจทัวร์', name: 'แพ็คเกจทัวร์', icon: GlobeAltIcon },
      { id: 'รถเช่า', name: 'รถเช่า', icon: TruckIcon },
    ]
  },
  'ความงาม': {
    name: 'ความงาม',
    icon: HeartIcon,
    color: 'from-pink-500 to-fuchsia-500',
    subcategories: [
      { id: 'เครื่องสำอาง', name: 'เครื่องสำอาง', icon: SparklesIcon },
      { id: 'ผลิตภัณฑ์ผิว', name: 'ผลิตภัณฑ์ผิว', icon: HeartIcon },
      { id: 'ผลิตภัณฑ์ผม', name: 'ผลิตภัณฑ์ผม', icon: ScissorsIcon },
      { id: 'สปา', name: 'สปา', icon: HomeIcon },
    ]
  },
  'สุขภาพ': {
    name: 'สุขภาพ',
    icon: ShieldCheckIcon,
    color: 'from-green-500 to-emerald-500',
    subcategories: [
      { id: 'อาหารเสริม', name: 'อาหารเสริม', icon: ShieldCheckIcon },
      { id: 'ฟิตเนส', name: 'ฟิตเนส', icon: ShieldCheckIcon },
      { id: 'โยคะ', name: 'โยคะ', icon: ShieldCheckIcon },
    ]
  },
};

// Mock promotions data for demo
const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: '1',
    shop_name: 'Starbucks Thailand',
    title: 'ลดสูงสุด 50% ทุกเมนู',
    description: 'ลดสูงสุด 50% ทุกเมนู เฉพาะสมาชิก',
    price: 150,
    discount_rate: 50,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
    category: 'เครื่องดื่ม',
    location: 'สาขาเซ็นทรัลเวิลด์',
    is_verified: true,
    is_sponsored: false,
    search_volume: 1250,
    valid_until: '2026-03-31',
    views: 2340,
    saves: 456,
  },
  {
    id: '2',
    shop_name: 'KFC Thailand',
    title: 'ซื้อ 1 แถม 1',
    description: 'ซื้อ 1 แถม 1 ทุกเมนู',
    price: 299,
    discount_rate: 50,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500',
    category: 'อาหาร',
    location: 'ทุกสาขา',
    is_verified: true,
    is_sponsored: true,
    search_volume: 3450,
    valid_until: '2026-04-15',
    views: 5670,
    saves: 890,
  },
  {
    id: '3',
    shop_name: 'Nike Store',
    title: 'Sale สูงสุด 60%',
    description: 'Sale สูงสุด 60% รองเท้าผ้าใบ',
    price: 3990,
    discount_rate: 60,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    category: 'แฟชั่น',
    location: 'สาขาสยามพารากอน',
    is_verified: true,
    is_sponsored: false,
    search_volume: 2100,
    valid_until: '2026-03-20',
    views: 4200,
    saves: 678,
  },
];

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryId = decodeURIComponent(params.id as string);
  
  const category = CATEGORY_DATA[categoryId];

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-display text-gray-800 mb-4">404</h1>
          <p className="text-gray-600 mb-6">ไม่พบหมวดหมู่นี้</p>
          <Link
            href="/categories"
            className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
          >
            กลับไปหน้าหมวดหมู่
          </Link>
        </div>
      </div>
    );
  }

  const Icon = category.icon;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className={`bg-gradient-to-r ${category.color} text-white sticky top-0 z-50 shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/categories" className="hover:bg-white/10 p-2 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <h1 className="text-h3">{category.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-h4 text-gray-800 mb-4">หมวดหมู่ย่อย</h2>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 xl:grid-cols-12 gap-4 mb-8">
          {category.subcategories.map((subcat: any, index: number) => {
            const SubcatIcon = subcat.icon;
            return (
              <motion.div
                key={subcat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <Link
                  href={`/search?category=${subcat.id}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-red-200 hover:shadow-md transition-all group"
                >
                  <div className={`w-14 h-14 rounded-lg bg-gray-100 group-hover:bg-gradient-to-br group-hover:${category.color} flex items-center justify-center transition-all shadow-sm`}>
                    <SubcatIcon className="w-7 h-7 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-caption text-center leading-tight text-gray-700 group-hover:text-red-600 transition-colors">
                    {subcat.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Promotions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h4 text-gray-800">โปรโมชั่นแนะนำ</h2>
            <span className="text-body text-gray-500">{MOCK_PROMOTIONS.length} รายการ</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {MOCK_PROMOTIONS.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
              >
                <PromoCard promo={promo} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
