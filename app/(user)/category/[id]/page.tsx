'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/solid';
import {
  ShoppingBagIcon,
  CakeIcon,
  HeartIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  SparklesIcon,
  BeakerIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  PaperAirplaneIcon,
  TruckIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ScissorsIcon,
  ClipboardDocumentListIcon,
  ComputerDesktopIcon,
  MusicalNoteIcon,
  CameraIcon,
  WrenchScrewdriverIcon,
  FireIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { getPromotions } from '@/lib/getPromotions';

// ============================================
// CATEGORY META (route → display info)
// ============================================
const CATEGORY_META = {
  all: { label: 'ทั้งหมด', labelEn: 'All', color: 'from-red-600 to-pink-600', icon: ShoppingBagIcon },
  Food: { label: 'อาหาร', labelEn: 'Food', color: 'from-red-600 to-pink-600', icon: CakeIcon },
  Fashion: { label: 'แฟชั่น', labelEn: 'Fashion', color: 'from-red-600 to-pink-600', icon: ShoppingBagIcon },
  Travel: { label: 'ท่องเที่ยว', labelEn: 'Travel', color: 'from-red-600 to-pink-600', icon: GlobeAltIcon },
  Gadget: { label: 'อุปกรณ์', labelEn: 'Gadget', color: 'from-red-600 to-pink-600', icon: DevicePhoneMobileIcon },
  Beauty: { label: 'ความงาม', labelEn: 'Beauty', color: 'from-red-600 to-pink-600', icon: HeartIcon },
} as const;

type CategoryKey = keyof typeof CATEGORY_META;

// ============================================
// SUBCATEGORY GROUPS per main category
// ============================================
interface SubcategoryItem {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface CategoryGroup {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  subcategories: SubcategoryItem[];
}

const ALL_CATEGORY_GROUPS: Record<string, CategoryGroup[]> = {
  Fashion: [
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
  ],
  Food: [
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
        { id: 'อาหารอิตาเลียน', name: 'อาหารอิตาเลียน', icon: CakeIcon },
        { id: 'สตรีทฟู้ด', name: 'สตรีทฟู้ด', icon: BuildingStorefrontIcon },
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
        { id: 'สมูทตี้', name: 'สมูทตี้', icon: BeakerIcon },
      ],
    },
    {
      id: 'ขนมและเบเกอรี่',
      name: 'ขนมและเบเกอรี่',
      icon: CakeIcon,
      color: 'from-amber-400 to-orange-500',
      subcategories: [
        { id: 'เค้ก', name: 'เค้ก', icon: CakeIcon },
        { id: 'คุกกี้', name: 'คุกกี้', icon: CakeIcon },
        { id: 'ขนมไทย', name: 'ขนมไทย', icon: CakeIcon },
        { id: 'ไอศกรีม', name: 'ไอศกรีม', icon: CakeIcon },
      ],
    },
  ],
  Travel: [
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
        { id: 'ประกันเดินทาง', name: 'ประกันเดินทาง', icon: ShieldCheckIcon },
      ],
    },
    {
      id: 'กิจกรรมท่องเที่ยว',
      name: 'กิจกรรมท่องเที่ยว',
      icon: GlobeAltIcon,
      color: 'from-teal-500 to-green-500',
      subcategories: [
        { id: 'สวนสนุก', name: 'สวนสนุก', icon: SparklesIcon },
        { id: 'ดำน้ำ', name: 'ดำน้ำ', icon: GlobeAltIcon },
        { id: 'ปีนเขา', name: 'ปีนเขา', icon: GlobeAltIcon },
        { id: 'ล่องเรือ', name: 'ล่องเรือ', icon: PaperAirplaneIcon },
        { id: 'แคมป์ปิ้ง', name: 'แคมป์ปิ้ง', icon: HomeIcon },
      ],
    },
  ],
  Gadget: [
    {
      id: 'มือถือและแท็บเล็ต',
      name: 'มือถือและแท็บเล็ต',
      icon: DevicePhoneMobileIcon,
      color: 'from-indigo-500 to-blue-600',
      subcategories: [
        { id: 'มือถือ', name: 'มือถือ', icon: DevicePhoneMobileIcon },
        { id: 'แท็บเล็ต', name: 'แท็บเล็ต', icon: DevicePhoneMobileIcon },
        { id: 'เคสมือถือ', name: 'เคสมือถือ', icon: ShieldCheckIcon },
        { id: 'สายชาร์จ', name: 'สายชาร์จ', icon: WrenchScrewdriverIcon },
        { id: 'หูฟัง', name: 'หูฟัง', icon: MusicalNoteIcon },
      ],
    },
    {
      id: 'คอมพิวเตอร์',
      name: 'คอมพิวเตอร์',
      icon: ComputerDesktopIcon,
      color: 'from-gray-700 to-gray-900',
      subcategories: [
        { id: 'โน้ตบุ๊ก', name: 'โน้ตบุ๊ก', icon: ComputerDesktopIcon },
        { id: 'เดสก์ท็อป', name: 'เดสก์ท็อป', icon: ComputerDesktopIcon },
        { id: 'จอมอนิเตอร์', name: 'จอมอนิเตอร์', icon: ComputerDesktopIcon },
        { id: 'คีย์บอร์ด', name: 'คีย์บอร์ด', icon: WrenchScrewdriverIcon },
        { id: 'เมาส์', name: 'เมาส์', icon: WrenchScrewdriverIcon },
      ],
    },
    {
      id: 'กล้องและอุปกรณ์',
      name: 'กล้องและอุปกรณ์',
      icon: CameraIcon,
      color: 'from-orange-500 to-red-500',
      subcategories: [
        { id: 'กล้อง DSLR', name: 'กล้อง DSLR', icon: CameraIcon },
        { id: 'กล้อง Mirrorless', name: 'กล้อง Mirrorless', icon: CameraIcon },
        { id: 'เลนส์', name: 'เลนส์', icon: CameraIcon },
        { id: 'ขาตั้งกล้อง', name: 'ขาตั้งกล้อง', icon: WrenchScrewdriverIcon },
        { id: 'โดรน', name: 'โดรน', icon: PaperAirplaneIcon },
      ],
    },
  ],
  Beauty: [
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
        { id: 'น้ำหอม', name: 'น้ำหอม', icon: SparklesIcon },
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
        { id: 'วิตามิน', name: 'วิตามิน', icon: ShieldCheckIcon },
      ],
    },
  ],
};

// ============================================
// BRAND DATA
// ============================================
type BrandCategory = 'แฟชั่น' | 'อาหาร' | 'เครื่องดื่ม' | 'อิเล็กทรอนิกส์' | 'ความงาม' | 'ซูเปอร์มาร์เก็ต' | 'ท่องเที่ยว' | 'สุขภาพ';

interface Brand {
  id: string;
  name: string;
  logo: string;
  category: BrandCategory;
  promoCount: number;
  rating: number;
  isHot?: boolean;
  discount?: string;
  color: string;
}

const BRAND_CATEGORIES: { id: BrandCategory; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'แฟชั่น', label: 'แฟชั่น', icon: SparklesIcon },
  { id: 'อาหาร', label: 'อาหาร', icon: CakeIcon },
  { id: 'เครื่องดื่ม', label: 'เครื่องดื่ม', icon: BeakerIcon },
  { id: 'อิเล็กทรอนิกส์', label: 'อิเล็กทรอนิกส์', icon: DevicePhoneMobileIcon },
  { id: 'ความงาม', label: 'ความงาม', icon: HeartIcon },
  { id: 'ซูเปอร์มาร์เก็ต', label: 'ซูเปอร์มาร์เก็ต', icon: BuildingStorefrontIcon },
  { id: 'ท่องเที่ยว', label: 'ท่องเที่ยว', icon: GlobeAltIcon },
  { id: 'สุขภาพ', label: 'สุขภาพ', icon: ShieldCheckIcon },
];

const BRANDS: Brand[] = [
  { id: 'nike', name: 'Nike', logo: 'https://logo.clearbit.com/nike.com', category: 'แฟชั่น', promoCount: 24, rating: 4.9, isHot: true, discount: 'สูงสุด 50%', color: 'bg-black' },
  { id: 'adidas', name: 'Adidas', logo: 'https://logo.clearbit.com/adidas.com', category: 'แฟชั่น', promoCount: 18, rating: 4.8, isHot: true, discount: 'สูงสุด 40%', color: 'bg-black' },
  { id: 'uniqlo', name: 'UNIQLO', logo: 'https://logo.clearbit.com/uniqlo.com', category: 'แฟชั่น', promoCount: 15, rating: 4.7, discount: 'สูงสุด 30%', color: 'bg-red-600' },
  { id: 'hm', name: 'H&M', logo: 'https://logo.clearbit.com/hm.com', category: 'แฟชั่น', promoCount: 12, rating: 4.5, discount: 'สูงสุด 60%', color: 'bg-red-700' },
  { id: 'zara', name: 'ZARA', logo: 'https://logo.clearbit.com/zara.com', category: 'แฟชั่น', promoCount: 8, rating: 4.6, color: 'bg-black' },
  { id: 'converse', name: 'Converse', logo: 'https://logo.clearbit.com/converse.com', category: 'แฟชั่น', promoCount: 10, rating: 4.7, discount: 'สูงสุด 35%', color: 'bg-black' },
  { id: 'mcdonalds', name: "McDonald's", logo: 'https://logo.clearbit.com/mcdonalds.com', category: 'อาหาร', promoCount: 32, rating: 4.5, isHot: true, discount: '1 แถม 1', color: 'bg-red-600' },
  { id: 'kfc', name: 'KFC', logo: 'https://logo.clearbit.com/kfc.com', category: 'อาหาร', promoCount: 28, rating: 4.4, isHot: true, discount: 'เริ่มต้น 59 บาท', color: 'bg-red-700' },
  { id: 'pizzahut', name: 'Pizza Hut', logo: 'https://logo.clearbit.com/pizzahut.com', category: 'อาหาร', promoCount: 15, rating: 4.3, discount: 'สูงสุด 50%', color: 'bg-red-600' },
  { id: 'shabushi', name: 'Shabushi', logo: 'https://ui-avatars.com/api/?name=SB&background=E11D48&color=fff&size=128', category: 'อาหาร', promoCount: 9, rating: 4.5, discount: 'บุฟเฟ่ต์ 299', color: 'bg-red-500' },
  { id: 'starbucks', name: 'Starbucks', logo: 'https://logo.clearbit.com/starbucks.com', category: 'เครื่องดื่ม', promoCount: 20, rating: 4.8, isHot: true, discount: '1 แถม 1', color: 'bg-green-700' },
  { id: 'cafe-amazon', name: 'Cafe Amazon', logo: 'https://ui-avatars.com/api/?name=CA&background=2D5016&color=fff&size=128', category: 'เครื่องดื่ม', promoCount: 16, rating: 4.5, discount: 'ลด 20%', color: 'bg-green-800' },
  { id: 'apple', name: 'Apple', logo: 'https://logo.clearbit.com/apple.com', category: 'อิเล็กทรอนิกส์', promoCount: 12, rating: 4.9, isHot: true, discount: 'ลดสูงสุด 15%', color: 'bg-gray-900' },
  { id: 'samsung', name: 'Samsung', logo: 'https://logo.clearbit.com/samsung.com', category: 'อิเล็กทรอนิกส์', promoCount: 22, rating: 4.7, isHot: true, discount: 'ลดสูงสุด 40%', color: 'bg-blue-900' },
  { id: 'xiaomi', name: 'Xiaomi', logo: 'https://logo.clearbit.com/xiaomi.com', category: 'อิเล็กทรอนิกส์', promoCount: 18, rating: 4.5, discount: 'ลดสูงสุด 50%', color: 'bg-orange-500' },
  { id: 'loreal', name: "L'Oréal", logo: 'https://logo.clearbit.com/loreal.com', category: 'ความงาม', promoCount: 14, rating: 4.7, discount: 'ลด 30%', color: 'bg-black' },
  { id: 'mac', name: 'MAC', logo: 'https://logo.clearbit.com/maccosmetics.com', category: 'ความงาม', promoCount: 8, rating: 4.8, isHot: true, color: 'bg-black' },
  { id: 'innisfree', name: 'Innisfree', logo: 'https://logo.clearbit.com/innisfree.com', category: 'ความงาม', promoCount: 9, rating: 4.6, color: 'bg-green-600' },
  { id: 'agoda', name: 'Agoda', logo: 'https://logo.clearbit.com/agoda.com', category: 'ท่องเที่ยว', promoCount: 20, rating: 4.6, isHot: true, discount: 'ลดสูงสุด 75%', color: 'bg-blue-700' },
  { id: 'airasia', name: 'AirAsia', logo: 'https://logo.clearbit.com/airasia.com', category: 'ท่องเที่ยว', promoCount: 15, rating: 4.4, discount: 'เริ่มต้น 0 บาท', color: 'bg-red-600' },
  { id: 'klook', name: 'Klook', logo: 'https://logo.clearbit.com/klook.com', category: 'ท่องเที่ยว', promoCount: 12, rating: 4.5, discount: 'ลด 10%', color: 'bg-orange-500' },
  { id: 'watsons', name: 'Watsons', logo: 'https://logo.clearbit.com/watsons.com', category: 'สุขภาพ', promoCount: 18, rating: 4.5, isHot: true, discount: 'ลดสูงสุด 50%', color: 'bg-green-600' },
  { id: 'boots', name: 'Boots', logo: 'https://logo.clearbit.com/boots.com', category: 'สุขภาพ', promoCount: 12, rating: 4.4, discount: '1 แถม 1', color: 'bg-blue-700' },
  { id: '7eleven', name: '7-Eleven', logo: 'https://logo.clearbit.com/7-eleven.com', category: 'ซูเปอร์มาร์เก็ต', promoCount: 45, rating: 4.3, isHot: true, discount: 'ลดทุกวัน', color: 'bg-green-600' },
  { id: 'lotuss', name: "Lotus's", logo: 'https://ui-avatars.com/api/?name=LT&background=0EA5E9&color=fff&size=128', category: 'ซูเปอร์มาร์เก็ต', promoCount: 38, rating: 4.4, discount: 'ลดสูงสุด 50%', color: 'bg-sky-600' },
];

// Map route category to brand categories for filtering
const CATEGORY_TO_BRAND: Record<string, BrandCategory[]> = {
  all: ['แฟชั่น', 'อาหาร', 'เครื่องดื่ม', 'อิเล็กทรอนิกส์', 'ความงาม', 'ซูเปอร์มาร์เก็ต', 'ท่องเที่ยว', 'สุขภาพ'],
  Fashion: ['แฟชั่น'],
  Food: ['อาหาร', 'เครื่องดื่ม', 'ซูเปอร์มาร์เก็ต'],
  Travel: ['ท่องเที่ยว'],
  Gadget: ['อิเล็กทรอนิกส์'],
  Beauty: ['ความงาม', 'สุขภาพ'],
};

// ============================================
// HELPERS
// ============================================
function resolveCategory(rawId: string): CategoryKey {
  const id = rawId.trim().toLowerCase();
  if (id === 'all') return 'all';
  if (id === 'food') return 'Food';
  if (id === 'fashion') return 'Fashion';
  if (id === 'travel') return 'Travel';
  if (id === 'gadget') return 'Gadget';
  if (id === 'beauty') return 'Beauty';
  return 'all';
}

export default function CategoryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const routeId = decodeURIComponent(params.id || 'all');
  const activeCategory = resolveCategory(routeId);
  const categoryMeta = CATEGORY_META[activeCategory];

  const [selectedTab, setSelectedTab] = useState('สินค้า');
  const [brandFilter, setBrandFilter] = useState<BrandCategory | 'ทั้งหมด'>('ทั้งหมด');

  // Get promotions count for the badge
  const promotions = useMemo(() => {
    const items = getPromotions();
    if (activeCategory === 'all') return items;
    return items.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  // Get category groups for current route
  const categoryGroups = useMemo(() => {
    if (activeCategory === 'all') {
      return Object.values(ALL_CATEGORY_GROUPS).flat();
    }
    return ALL_CATEGORY_GROUPS[activeCategory] || [];
  }, [activeCategory]);

  // Filter brands for current category
  const relevantBrandCategories = CATEGORY_TO_BRAND[activeCategory] || [];

  const allRelevantBrands = useMemo(
    () => BRANDS.filter((b) => relevantBrandCategories.includes(b.category)),
    [activeCategory]
  );

  const filteredBrands = useMemo(() => {
    if (brandFilter === 'ทั้งหมด') return allRelevantBrands;
    return allRelevantBrands.filter((b) => b.category === brandFilter);
  }, [allRelevantBrands, brandFilter]);

  const hotBrands = useMemo(
    () => allRelevantBrands.filter((b) => b.isHot),
    [allRelevantBrands]
  );

  const relevantBrandCats = useMemo(
    () => BRAND_CATEGORIES.filter((c) => relevantBrandCategories.includes(c.id)),
    [activeCategory]
  );

  // Category switching
  const CATEGORY_KEYS = Object.keys(CATEGORY_META) as CategoryKey[];
  const handleCategorySwitch = (key: CategoryKey) => {
    router.push(`/category/${encodeURIComponent(key === 'all' ? 'all' : key)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Red Header */}
      <div className={`bg-gradient-to-r ${categoryMeta.color} text-white relative z-10`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:bg-white/20 p-2 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold flex-1">All Pro</h1>
            <span className="bg-white/20 text-sm px-3 py-1 rounded-full font-medium">
              {promotions.length} รายการ
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation — สินค้า / แบรนด์ */}
      <div className="bg-white border-b sticky top-[64px] z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {['สินค้า', 'แบรนด์'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-4 px-2 font-semibold transition-colors relative ${
                  selectedTab === tab ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {selectedTab === tab && (
                  <motion.div
                    layoutId="cat-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Switching Pills */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORY_KEYS.map((key) => {
            const meta = CATEGORY_META[key];
            const isActive = key === activeCategory;
            return (
              <button
                key={key}
                onClick={() => handleCategorySwitch(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {selectedTab === 'สินค้า' ? (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {categoryGroups.length > 0 ? (
                categoryGroups.map((group, groupIndex) => {
                  const GIcon = group.icon;
                  return (
                    <div key={group.id} className="mb-10">
                      {/* Group Header */}
                      <div className="flex items-center justify-between mb-5 px-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center shadow-md`}>
                            <GIcon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-800">{group.name}</h3>
                        </div>
                        <Link
                          href={`/categories/${encodeURIComponent(group.id)}?group=${encodeURIComponent(group.id)}`}
                          className="text-sm text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
                        >
                          ดูทั้งหมด →
                        </Link>
                      </div>

                      {/* Subcategories Grid */}
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 xl:grid-cols-12 gap-4">
                        {group.subcategories.map((subcat, index) => {
                          const SubIcon = subcat.icon;
                          return (
                            <motion.div
                              key={subcat.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: groupIndex * 0.05 + index * 0.02 }}
                            >
                              <Link
                                href={`/categories/${encodeURIComponent(subcat.id)}?group=${encodeURIComponent(group.id)}`}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-red-200 hover:shadow-md transition-all group"
                              >
                                <div className={`w-14 h-14 rounded-lg bg-gray-100 group-hover:bg-gradient-to-br group-hover:${group.color} flex items-center justify-center transition-all shadow-sm`}>
                                  <SubIcon className="w-7 h-7 text-gray-600 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-xs font-medium text-center leading-tight text-gray-700 group-hover:text-red-600 transition-colors">
                                  {subcat.name}
                                </span>
                              </Link>
                            </motion.div>
                          );
                        })}

                        {/* "อื่นๆ" button */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: groupIndex * 0.05 + group.subcategories.length * 0.02 }}
                        >
                          <Link
                            href={`/categories/${encodeURIComponent(group.id)}?group=${encodeURIComponent(group.id)}`}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-red-200 hover:shadow-md transition-all group"
                          >
                            <div className="w-14 h-14 rounded-lg bg-red-50 group-hover:bg-gradient-to-br group-hover:from-red-100 group-hover:to-pink-100 flex items-center justify-center transition-all">
                              <span className="text-lg font-bold text-red-600">+</span>
                            </div>
                            <span className="text-xs font-bold text-center leading-tight text-red-600">
                              อื่นๆ
                            </span>
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500">ไม่พบหมวดหมู่ย่อย</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="brands"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Hot Brands */}
              {hotBrands.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <FireIcon className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-bold text-gray-800">แบรนด์ยอดนิยม</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {hotBrands.map((brand, index) => (
                      <motion.div
                        key={brand.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <Link
                          href={`/search?brand=${brand.id}`}
                          className="relative flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all group overflow-hidden"
                        >
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <FireIcon className="w-3 h-3" /> HOT
                          </div>
                          <div className={`w-16 h-16 rounded-2xl ${brand.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform overflow-hidden`}>
                            <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain rounded-lg" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=EF4444&color=fff&size=128`; }} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors">{brand.name}</p>
                            {brand.discount && <p className="text-xs text-red-500 font-medium mt-0.5">{brand.discount}</p>}
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <StarIcon className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs text-gray-500">{brand.rating}</span>
                              <span className="text-xs text-gray-400">• {brand.promoCount} โปร</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Filter */}
              {relevantBrandCats.length > 1 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TagIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">กรองตามหมวดหมู่</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setBrandFilter('ทั้งหมด')}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                        brandFilter === 'ทั้งหมด' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200 hover:text-red-600'
                      }`}
                    >
                      ทั้งหมด ({allRelevantBrands.length})
                    </button>
                    {relevantBrandCats.map((cat) => {
                      const count = allRelevantBrands.filter((b) => b.category === cat.id).length;
                      const CIcon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setBrandFilter(cat.id)}
                          className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                            brandFilter === cat.id ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200 hover:text-red-600'
                          }`}
                        >
                          <CIcon className="w-3.5 h-3.5" />
                          {cat.label} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Brands Grid */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {brandFilter === 'ทั้งหมด' ? 'แบรนด์ทั้งหมด' : `แบรนด์ — ${brandFilter}`}
                  <span className="text-sm text-gray-400 font-normal ml-2">({filteredBrands.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredBrands.map((brand, index) => (
                    <motion.div
                      key={brand.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      layout
                    >
                      <Link
                        href={`/search?brand=${brand.id}`}
                        className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all group relative"
                      >
                        <div className={`w-14 h-14 rounded-xl ${brand.color} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all overflow-hidden`}>
                          <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain rounded-md" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=EF4444&color=fff&size=128`; }} />
                        </div>
                        <div className="text-center w-full">
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors truncate">{brand.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{brand.category}</p>
                          {brand.discount && (
                            <div className="mt-1.5 bg-red-50 text-red-600 text-[11px] font-semibold py-1 px-2 rounded-full inline-block">{brand.discount}</div>
                          )}
                          <div className="flex items-center justify-center gap-1.5 mt-1.5">
                            <StarIcon className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs text-gray-500">{brand.rating}</span>
                            <span className="text-xs text-gray-300">|</span>
                            <span className="text-xs text-gray-500">{brand.promoCount} โปร</span>
                          </div>
                        </div>
                        {brand.isHot && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
