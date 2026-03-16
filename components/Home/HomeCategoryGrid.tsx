'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
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

// ============================================
// CATEGORY_GROUPS — ข้อมูลหมวดหมู่แบบแบ่งกลุ่ม
// ============================================
const CATEGORY_GROUPS = [
  {
    id: 'แฟชั่นผู้หญิง',
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
    ],
  },
  {
    id: 'แฟชั่นผู้ชาย',
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
    ],
  },
  {
    id: 'กระเป๋า',
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
    ],
  },
  {
    id: 'อาหาร',
    name: 'อาหาร',
    icon: CakeIcon,
    color: 'from-pink-500 to-rose-500',
    subcategories: [
      { id: 'อาหารญี่ปุ่น', name: 'อาหารญี่ปุ่น', icon: CakeIcon },
      { id: 'อาหารไทย', name: 'อาหารไทย', icon: CakeIcon },
      { id: 'บุฟเฟ่ต์', name: 'บุฟเฟ่ต์', icon: ClipboardDocumentListIcon },
      { id: 'ฟาสต์ฟู้ด', name: 'ฟาสต์ฟู้ด', icon: CakeIcon },
      { id: 'อาหารทะเล', name: 'อาหารทะเล', icon: CakeIcon },
    ],
  },
  {
    id: 'เครื่องดื่ม',
    name: 'เครื่องดื่ม',
    icon: BeakerIcon,
    color: 'from-blue-500 to-cyan-500',
    subcategories: [
      { id: 'กาแฟ', name: 'กาแฟ', icon: BeakerIcon },
      { id: 'ชา', name: 'ชา', icon: BeakerIcon },
      { id: 'น้ำผลไม้', name: 'น้ำผลไม้', icon: BeakerIcon },
      { id: 'นม', name: 'นม', icon: BeakerIcon },
    ],
  },
  {
    id: 'ท่องเที่ยว',
    name: 'ท่องเที่ยว',
    icon: GlobeAltIcon,
    color: 'from-sky-500 to-blue-600',
    subcategories: [
      { id: 'โรงแรม', name: 'โรงแรม', icon: BuildingStorefrontIcon },
      { id: 'ตั๋วเครื่องบิน', name: 'ตั๋วเครื่องบิน', icon: PaperAirplaneIcon },
      { id: 'แพ็คเกจทัวร์', name: 'แพ็คเกจทัวร์', icon: GlobeAltIcon },
      { id: 'รถเช่า', name: 'รถเช่า', icon: TruckIcon },
    ],
  },
  {
    id: 'ความงาม',
    name: 'ความงาม',
    icon: HeartIcon,
    color: 'from-pink-500 to-fuchsia-500',
    subcategories: [
      { id: 'เครื่องสำอาง', name: 'เครื่องสำอาง', icon: SparklesIcon },
      { id: 'ผลิตภัณฑ์ผิว', name: 'ผลิตภัณฑ์ผิว', icon: HeartIcon },
      { id: 'ผลิตภัณฑ์ผม', name: 'ผลิตภัณฑ์ผม', icon: ScissorsIcon },
      { id: 'สปา', name: 'สปา', icon: HomeIcon },
    ],
  },
  {
    id: 'สุขภาพ',
    name: 'สุขภาพ',
    icon: ShieldCheckIcon,
    color: 'from-green-500 to-emerald-500',
    subcategories: [
      { id: 'อาหารเสริม', name: 'อาหารเสริม', icon: ShieldCheckIcon },
      { id: 'ฟิตเนส', name: 'ฟิตเนส', icon: ShieldCheckIcon },
      { id: 'โยคะ', name: 'โยคะ', icon: ShieldCheckIcon },
    ],
  },
];

const GROUP_ROUTE_MAP: Record<string, string> = {
  'แฟชั่นผู้หญิง': 'Fashion',
  'แฟชั่นผู้ชาย': 'Fashion',
  'กระเป๋า': 'Fashion',
  'อาหาร': 'Food',
  'เครื่องดื่ม': 'Food',
  'ท่องเที่ยว': 'Travel',
  'ความงาม': 'Beauty',
  'สุขภาพ': 'Beauty',
};

export default function HomeCategoryGrid() {
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-h3 text-gray-800">หมวดหมู่</h2>
        <Link
          href="/categories"
          className="text-body-sm text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1 font-medium"
        >
          ดูทั้งหมด
          <span>→</span>
        </Link>
      </div>

      {/* Category Groups */}
      {CATEGORY_GROUPS.map((group, groupIndex) => {
        const Icon = group.icon;

        return (
          <div key={group.id} className="mb-8">
            {/* Group Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center shadow-sm`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-h4 text-gray-800">{group.name}</h3>
              </div>
              <Link
                href={`/category/${encodeURIComponent(GROUP_ROUTE_MAP[group.id] || 'all')}`}
                className="text-caption text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
              >
                ดูทั้งหมด →
              </Link>
            </div>

            {/* Subcategories Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-12 gap-3">
              {group.subcategories.map((subcat, index) => {
                const SubcatIcon = subcat.icon;
                return (
                  <motion.div
                    key={subcat.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: groupIndex * 0.04 + index * 0.02,
                    }}
                  >
                    <Link
                      href={`/categories/${encodeURIComponent(subcat.id)}?group=${encodeURIComponent(group.id)}`}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all group"
                    >
                      <div
                        className={`w-12 h-12 rounded-lg bg-gray-100 group-hover:bg-gradient-to-br group-hover:${group.color} flex items-center justify-center transition-all shadow-sm`}
                      >
                        <SubcatIcon className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-caption font-medium text-center leading-tight text-gray-700 group-hover:text-orange-600 transition-colors">
                        {subcat.name}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}

              {/* "อื่นๆ" button */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay:
                    groupIndex * 0.04 +
                    group.subcategories.length * 0.02,
                }}
              >
                <Link
                  href={`/categories/${encodeURIComponent(group.id)}?group=${encodeURIComponent(group.id)}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-orange-50 group-hover:bg-gradient-to-br group-hover:from-orange-100 group-hover:to-red-100 flex items-center justify-center transition-all">
                    <span className="text-h5 font-bold text-orange-600">+</span>
                  </div>
                  <span className="text-caption font-bold text-center leading-tight text-orange-600">
                    อื่นๆ
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
