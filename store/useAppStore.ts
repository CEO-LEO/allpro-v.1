import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { FASTWORK_URLS } from '@/lib/config';
import toast from 'react-hot-toast';

// ============================================
// TYPES - Simplified for Supabase Integration
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  username?: string; // Optional
  coins: number;
  xp: number;
  level: number;
  avatar_url?: string;
  role?: string;
  name?: string; // For compatibility
  avatar?: string; // For compatibility
  phone?: string;
  createdAt?: string;
}

// Type alias for backward compatibility
export type User = UserProfile;

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  promoPrice?: number;
  discount?: number;
  image: string;
  category: string;
  shopName: string;
  shopId?: string;
  shopLogo?: string;
  brand?: string;
  rating?: number;
  likes?: number;
  isLiked?: boolean;
  reviews?: number;
  distance?: string;
  validUntil?: string;
  tags?: string[];
  verified?: boolean;
  description: string;
  createdAt?: string;
  service_url?: string;
}

export interface Notification {
  id: string;
  type: 'price_drop' | 'welcome' | 'reward' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  productId?: string;
}

export interface CouponUsageHistory {
  id: string;
  productId: string;
  productName: string;
  usedAt: string;
  savings: number;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'iPhone 15 Pro Max 256GB',
    description: 'ไอโฟนรุ่นล่าสุด สเปกจัดเต็ม กล้องสุดปัง ชิป A17 Pro แรงสุดๆ! จอ 6.7 นิ้ว ProMotion 120Hz แบตเตอรี่อึด ใช้งานได้ทั้งวัน รองรับ 5G ทุกค่าย พร้อม Action Button ใหม่ล่าสุด! ของแท้ ประกันศูนย์ไทย 1 ปีเต็ม',
    price: 39900,
    promoPrice: 39900,
    originalPrice: 49900,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800',
    category: 'มือถือ',
    shopName: 'iStudio Thailand',
    shopId: 'shop-1',
    shopLogo: '📱',
    brand: 'Apple',
    rating: 4.9,
    likes: 1284,
    reviews: 456,
    distance: '0.8 km',
    validUntil: '2026-03-31',
    tags: ['สมาร์ทโฟน', 'iPhone', 'ของแท้', 'ประกันศูนย์'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-2',
    title: 'Buffet Shabu Premium ไม่อั้น 90 นาที',
    description: 'บุฟเฟ่ต์ชาบูพรีเมี่ยม! เนื้อวัวออสเตรเลีย เนื้อหมูคุโรบุตะ กุ้งแม่น้ำตัวใหญ่ ปลาหมึก เนื้อปลาสดๆ ผักสดสะอาด น้ำจิ้มหลากหลาย ไอศกรีมฮาเก้น-ดาส พร้อมเครื่องดื่มไม่อั้น! บรรยากาศหรูหรา สะอาด น่านั่ง',
    price: 599,
    promoPrice: 599,
    originalPrice: 899,
    discount: 33,
    image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800',
    category: 'อาหาร',
    shopName: 'Shabu King Central World',
    shopId: 'shop-2',
    shopLogo: '🍲',
    brand: 'Shabu King',
    rating: 4.7,
    likes: 892,
    reviews: 324,
    distance: '1.2 km',
    validUntil: '2026-02-28',
    tags: ['ชาบู', 'บุฟเฟ่ต์', 'ไม่อั้น', 'เนื้อพรีเมี่ยม'],
    verified: true,
    service_url: FASTWORK_URLS.FOOD_DELIVERY
  },
  {
    id: 'prod-3',
    title: 'Nike Air Max 270 React รองเท้าวิ่งแท้',
    description: 'รองเท้าวิ่ง Nike Air Max 270 React ของแท้ 100% พื้นนุ่มสบายเท้า น้ำหนักเบา ระบายอากาศได้ดี เหมาะกับการวิ่ง ออกกำลังกาย และใส่เที่ยวทั่วไป! มีให้เลือกหลายสี ไซส์ครบ ส่งฟรีทั่วไทย พร้อมกล่องและป้ายแท้',
    price: 3990,
    promoPrice: 3990,
    originalPrice: 5900,
    discount: 32,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    category: 'รองเท้า',
    shopName: 'Nike Official Store',
    shopId: 'shop-3',
    shopLogo: '👟',
    brand: 'Nike',
    rating: 4.8,
    likes: 2156,
    reviews: 789,
    distance: '2.5 km',
    validUntil: '2026-03-15',
    tags: ['รองเท้า', 'วิ่ง', 'Nike', 'ของแท้'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-4',
    title: 'Package ทัวร์ภูเก็ต 3 วัน 2 คืน พักรีสอร์ท 5 ดาว',
    description: 'แพ็คเกจทัวร์ภูเก็ตสุดคุ้ม! พักรีสอร์ท 5 ดาวริมหาด วิวทะเลสวยงาม รวมอาหารเช้า-เที่ยง-เย็น พาชมเกาะพีพี ดำน้ำดูปะการัง ล่องเรือใบ นวดแผนไทย ช้อปปิ้งที่ Patong รถรับ-ส่งสนามบิน ไกด์พาเที่ยวตลอดทริป!',
    price: 8990,
    promoPrice: 8990,
    originalPrice: 14900,
    discount: 40,
    image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800',
    category: 'ท่องเที่ยว',
    shopName: 'Amazing Thailand Tours',
    shopId: 'shop-4',
    shopLogo: '✈️',
    brand: 'AmazingTH',
    rating: 4.9,
    likes: 1543,
    reviews: 567,
    distance: '5.0 km',
    validUntil: '2026-06-30',
    tags: ['ทัวร์', 'ภูเก็ต', 'ทะเล', 'รีสอร์ท 5 ดาว'],
    verified: true,
    service_url: FASTWORK_URLS.TOUR_BOOKING
  },
  {
    id: 'prod-5',
    title: 'Dyson V15 Detect เครื่องดูดฝุ่นไร้สาย',
    description: 'เครื่องดูดฝุ่นไร้สาย Dyson V15 Detect รุ่นล่าสุด! เทคโนโลยี Laser Detect เห็นฝุ่นด้วยตาเปล่า แรงดูดสุดทรงพลัง 230 AW ทำความสะอาดได้ทุกพื้นผิว พร้อมหัวดูดครบชุด แบตอึด ใช้งานได้ 60 นาที ของแท้ ประกัน 2 ปี',
    price: 24900,
    promoPrice: 24900,
    originalPrice: 29900,
    discount: 17,
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800',
    category: 'เครื่องใช้ไฟฟ้า',
    shopName: 'Dyson Official Thailand',
    shopId: 'shop-5',
    shopLogo: '🔌',
    brand: 'Dyson',
    rating: 4.9,
    likes: 987,
    reviews: 432,
    distance: '3.2 km',
    validUntil: '2026-04-30',
    tags: ['เครื่องดูดฝุ่น', 'Dyson', 'ไร้สาย', 'ของแท้'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-6',
    title: 'Course เรียน Photoshop + Illustrator ออนไลน์',
    description: 'คอร์สเรียนออนไลน์ Photoshop & Illustrator แบบครบวงจร! เหมาะสำหรับมือใหม่ สอนตั้งแต่พื้นฐานจนถึงขั้นสูง มีงานให้ฝึกทำ ใบประกาศรับรอง เข้าเรียนได้ตลอดชีพ อัพเดตเนื้อหาใหม่ตลอด พร้อมคลิปสอนกว่า 50 ชั่วโมง!',
    price: 1990,
    promoPrice: 1990,
    originalPrice: 4900,
    discount: 59,
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800',
    category: 'ความงาม',
    shopName: 'Skill Lane Academy',
    shopId: 'shop-6',
    shopLogo: '🎨',
    brand: 'SkillLane',
    rating: 4.8,
    likes: 756,
    reviews: 289,
    distance: 'ออนไลน์',
    validUntil: '2026-12-31',
    tags: ['คอร์สเรียน', 'Photoshop', 'Illustrator', 'ออนไลน์'],
    verified: true,
    service_url: FASTWORK_URLS.ONLINE_COURSES
  },
  {
    id: 'prod-7',
    title: 'เสื้อโปโล Ralph Lauren แท้ 100%',
    description: 'เสื้อโปโล Ralph Lauren ผ้าคอตตอน 100% นุ่มสบาย ระบายอากาศได้ดี ดีไซน์คลาสสิก ใส่ได้ทุกโอกาส มีให้เลือกหลายสี ไซส์ S-XXL ของแท้นำเข้า มีป้ายแท้ พร้อมกล่อง',
    price: 1290,
    promoPrice: 1290,
    originalPrice: 2500,
    discount: 48,
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800',
    category: 'แฟชั่นผู้ชาย',
    shopName: 'Premium Fashion Store',
    shopLogo: '👔',
    rating: 4.7,
    likes: 542,
    reviews: 189,
    distance: '1.8 km',
    validUntil: '2026-03-20',
    tags: ['เสื้อผ้า', 'ผู้ชาย', 'โปโล', 'Ralph Lauren'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-8',
    title: 'ชุดเดรสผ้าไหมไทย ลายดอกไม้',
    description: 'ชุดเดรสผ้าไหมไทยแท้ ย้อมสีธรรมชาติ ลายดอกไม้สวยงาม ใส่สบาย ระบายอากาศดี เหมาะกับงานสำคัญ งานแต่ง หรือใส่เที่ยว มีไซส์ S-XL สินค้าคุณภาพพรีเมียม',
    price: 2490,
    promoPrice: 2490,
    originalPrice: 3990,
    discount: 38,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    category: 'แฟชั่นผู้หญิง',
    shopName: 'Thai Silk Boutique',
    shopLogo: '👗',
    rating: 4.9,
    likes: 876,
    reviews: 321,
    distance: '2.1 km',
    validUntil: '2026-04-15',
    tags: ['เดรส', 'ผู้หญิง', 'ผ้าไหม', 'ไทย'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-9',
    title: 'Adidas Ultraboost 22 รองเท้าวิ่งผู้หญิง',
    description: 'รองเท้าวิ่ง Adidas Ultraboost 22 เทคโนโลยี Boost ให้การคืนพลังงานดีเยี่ยม พื้นนุ่ม สบายเท้า น้ำหนักเบา เหมาะกับการวิ่งระยะไกล ของแท้ 100% พร้อมกล่อง',
    price: 4290,
    promoPrice: 4290,
    originalPrice: 6500,
    discount: 34,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
    category: 'รองเท้า',
    shopName: 'Adidas Official Store',
    shopLogo: '👟',
    rating: 4.8,
    likes: 1243,
    reviews: 567,
    distance: '1.5 km',
    validUntil: '2026-03-25',
    tags: ['รองเท้า', 'วิ่ง', 'Adidas', 'ผู้หญิง'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-10',
    title: 'กระเป๋าสะพาย Louis Vuitton Neverfull',
    description: 'กระเป๋าสะพาย Louis Vuitton Neverfull ของแท้ 100% หนังแท้คุณภาพสูง ดีไซน์คลาสสิก ใช้งานได้หลากหลาย ใส่ของได้เยอะ พร้อมถุงผ้า การ์ด ใบเสร็จห้าง',
    price: 45900,
    promoPrice: 45900,
    originalPrice: 52000,
    discount: 12,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    category: 'กระเป๋า',
    shopName: 'Luxury Bags Thailand',
    shopLogo: '👜',
    rating: 4.9,
    likes: 2341,
    reviews: 876,
    distance: '3.2 km',
    validUntil: '2026-05-30',
    tags: ['กระเป๋า', 'Louis Vuitton', 'ของแท้', 'หรู'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-11',
    title: 'Estée Lauder Advanced Night Repair Serum',
    description: 'เซรั่มบำรุงผิว Estée Lauder Advanced Night Repair ช่วยฟื้นฟูผิว ลดริ้วรอย เพิ่มความชุ่มชื้น ผิวกระจ่างใส ของแท้ 100% ขนาด 50ml',
    price: 3290,
    promoPrice: 3290,
    originalPrice: 4200,
    discount: 22,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
    category: 'เครื่องสำอาง',
    shopName: 'Beauty Hall Thailand',
    shopLogo: '💄',
    rating: 4.8,
    likes: 1567,
    reviews: 643,
    distance: '1.9 km',
    validUntil: '2026-04-30',
    tags: ['เซรั่ม', 'บำรุงผิว', 'Estée Lauder', 'ของแท้'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-12',
    title: 'คอร์สออกกำลังกาย 6 เดือน Fitness First',
    description: 'สมาชิกฟิตเนส Fitness First 6 เดือน ใช้ได้ทุกสาขาทั่วประเทศ เครื่องออกกำลังกายครบครัน มีเทรนเนอร์คอยช่วย ห้องอบซาวน่า สระว่ายน้ำ รวมคลาสโยคะและซุมบ้า',
    price: 8900,
    promoPrice: 8900,
    originalPrice: 14900,
    discount: 40,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    category: 'ฟิตเนส',
    shopName: 'Fitness First Thailand',
    shopLogo: '💪',
    rating: 4.7,
    likes: 987,
    reviews: 432,
    distance: '0.5 km',
    validUntil: '2026-03-31',
    tags: ['ฟิตเนส', 'ออกกำลังกาย', 'สมาชิก', 'โยคะ'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-13',
    title: 'MacBook Pro M3 14" 16GB 512GB',
    description: 'MacBook Pro M3 ชิปเร็วที่สุดในตอนนี้! จอ Liquid Retina XDR 14 นิ้ว แรม 16GB SSD 512GB แบตใช้งาน 17 ชม. เหมาะกับงานกราฟิก วิดีโอ โปรแกรมหนัก ของแท้ศูนย์ไทย ประกัน 1 ปี',
    price: 59900,
    promoPrice: 59900,
    originalPrice: 69900,
    discount: 14,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    category: 'คอมพิวเตอร์',
    shopName: 'Apple Authorized Reseller',
    shopLogo: '💻',
    rating: 4.9,
    likes: 1876,
    reviews: 721,
    distance: '2.8 km',
    validUntil: '2026-04-30',
    tags: ['MacBook', 'Apple', 'M3', 'Laptop'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-14',
    title: 'Samsung Galaxy S24 Ultra 512GB',
    description: 'Samsung Galaxy S24 Ultra เรือธงตัวท็อป! ชิป Snapdragon 8 Gen 3 แรม 12GB กล้อง 200MP ซูมได้ 100x จอ 6.8 นิ้ว 120Hz S Pen ในตัว ของแท้ประกันศูนย์ไทย 1 ปี',
    price: 42900,
    promoPrice: 42900,
    originalPrice: 49900,
    discount: 14,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
    category: 'มือถือ',
    shopName: 'Samsung Official Store',
    shopLogo: '📱',
    rating: 4.8,
    likes: 2134,
    reviews: 891,
    distance: '1.7 km',
    validUntil: '2026-03-31',
    tags: ['มือถือ', 'Samsung', 'Galaxy', 'ของแท้'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-15',
    title: 'iPad Pro 12.9" M2 256GB WiFi',
    description: 'iPad Pro 12.9 นิ้ว ชิป M2 แรงสุดๆ! จอ Liquid Retina XDR รองรับ Apple Pencil 2 เหมาะกับงานกราฟิก วาดรูป จดโน้ต ของแท้ประกันศูนย์ไทย',
    price: 39900,
    promoPrice: 39900,
    originalPrice: 45900,
    discount: 13,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
    category: 'แท็บเล็ต',
    shopName: 'iStudio Thailand',
    shopLogo: '📱',
    rating: 4.9,
    likes: 1432,
    reviews: 567,
    distance: '0.8 km',
    validUntil: '2026-04-15',
    tags: ['iPad', 'Apple', 'แท็บเล็ต', 'M2'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-16',
    title: 'Sony A7 IV Full Frame Camera + Lens Kit',
    description: 'กล้อง Sony A7 IV Full Frame Mirrorless เซ็นเซอร์ 33MP วิดีโอ 4K 60p AF แม่นยำ พร้อมเลนส์ 28-70mm ของแท้ประกันศูนย์ไทย 1 ปี',
    price: 89900,
    promoPrice: 89900,
    originalPrice: 99900,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
    category: 'กล้อง',
    shopName: 'Camera House',
    shopLogo: '📷',
    rating: 4.9,
    likes: 876,
    reviews: 321,
    distance: '3.5 km',
    validUntil: '2026-05-31',
    tags: ['กล้อง', 'Sony', 'Full Frame', 'Mirrorless'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-17',
    title: 'PlayStation 5 + 2 Controllers + 3 Games',
    description: 'PS5 เครื่องใหม่ล่าสุด! พร้อมจอย 2 ตัว เกม 3 แผ่น (GOW Ragnarok, Spider-Man 2, GT7) ของแท้ประกันศูนย์ไทย',
    price: 19900,
    promoPrice: 19900,
    originalPrice: 24900,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800',
    category: 'เกมและของเล่น',
    shopName: 'GameZone Thailand',
    shopLogo: '🎮',
    rating: 4.8,
    likes: 3421,
    reviews: 1234,
    distance: '2.3 km',
    validUntil: '2026-03-31',
    tags: ['PS5', 'เกม', 'PlayStation', 'Console'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-18',
    title: 'โซฟานอนผ้ากำมะหยี่ 3 ที่นั่ง',
    description: 'โซฟา 3 ที่นั่ง หุ้มผ้ากำมะหยี่นุ่มสบาย โครงไม้แข็งแรง นั่งสบาย ดีไซน์สวยทันสมัย มีหลายสีให้เลือก ส่งฟรีและติดตั้งให้ถึงบ้าน',
    price: 12900,
    promoPrice: 12900,
    originalPrice: 18900,
    discount: 32,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    category: 'เฟอร์นิเจอร์',
    shopName: 'Index Living Mall',
    shopLogo: '🛋️',
    rating: 4.7,
    likes: 654,
    reviews: 287,
    distance: '4.2 km',
    validUntil: '2026-04-30',
    tags: ['โซฟา', 'เฟอร์นิเจอร์', 'บ้าน', 'ห้องนั่งเล่น'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-19',
    title: 'หนังสือ Atomic Habits (ฉบับภาษาไทย)',
    description: 'หนังสือขายดี! Atomic Habits แปลไทย สอนวิธีสร้างนิสัยดี เลิกนิสัยเสีย เปลี่ยนชีวิตให้ดีขึ้น เข้าใจง่าย ปฏิบัติได้จริง ปกอ่อน 400 หน้า',
    price: 290,
    promoPrice: 290,
    originalPrice: 395,
    discount: 27,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
    category: 'หนังสือ',
    shopName: 'SE-ED Book Center',
    shopLogo: '📚',
    rating: 4.9,
    likes: 1876,
    reviews: 943,
    distance: '1.2 km',
    validUntil: '2026-06-30',
    tags: ['หนังสือ', 'แนะนำตัวเอง', 'ขายดี', 'ภาษาไทย'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-20',
    title: 'Package Spa นวดไทย + สครับ 3 ชั่วโมง',
    description: 'แพ็คเกจสปาผ่อนคลาย! นวดไทย 2 ชั่วโมง + สครับผิว + อบไอน้ำ บรรยากาศดี ราคาประหยัด ใช้น้ำมันหอมธรรมชาติ นักนวดมืออาชีพ',
    price: 990,
    promoPrice: 990,
    originalPrice: 1500,
    discount: 34,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    category: 'สปา',
    shopName: 'Health Land Spa',
    shopLogo: '💆',
    rating: 4.8,
    likes: 1234,
    reviews: 567,
    distance: '1.8 km',
    validUntil: '2026-04-30',
    tags: ['สปา', 'นวด', 'ผ่อนคลาย', 'นวดไทย'],
    verified: true,
    service_url: FASTWORK_URLS.SPA_BOOKING
  },
  {
    id: 'prod-21',
    title: 'กาแฟ Specialty Drip Bag Set 30 ซอง',
    description: 'กาแฟดริปแบบซอง คั่วสดใหม่ทุกวัน เมล็ดกาแฟ Arabica 100% จากเชียงราย หอม กลมกล่อม ไม่ขม ไม่ใส่น้ำตาล สะดวก ฉีกซองชงง่าย ได้กาแฟสดทุกที่',
    price: 590,
    promoPrice: 590,
    originalPrice: 890,
    discount: 34,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    category: 'เครื่องดื่ม',
    shopName: 'Hillkoff Coffee',
    shopLogo: '☕',
    rating: 4.8,
    likes: 1432,
    reviews: 654,
    distance: '2.0 km',
    validUntil: '2026-05-31',
    tags: ['กาแฟ', 'ดริป', 'Arabica', 'สดใหม่'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-22',
    title: 'วิตามิน C + Zinc เสริมภูมิคุ้มกัน 60 เม็ด',
    description: 'วิตามิน C 1000mg + Zinc เสริมภูมิคุ้มกัน บำรุงผิว ลดสิว ผิวกระจ่างใส อย.รับรอง จากเยอรมนี 60 เม็ด ทานได้ 2 เดือน',
    price: 290,
    promoPrice: 290,
    originalPrice: 490,
    discount: 41,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800',
    category: 'สุขภาพ',
    shopName: 'Pharma Plus',
    shopLogo: '💊',
    rating: 4.7,
    likes: 2341,
    reviews: 1123,
    distance: '0.9 km',
    validUntil: '2026-06-30',
    tags: ['วิตามิน', 'สุขภาพ', 'ภูมิคุ้มกัน', 'อย.'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-23',
    title: 'สร้อยคอทองคำแท้ ลาย Heart 1 สลึง',
    description: 'สร้อยคอทองคำแท้ 96.5% ลาย Heart น้ำหนัก 1 สลึง ทองเนื้อดี สีสวย มีใบรับประกัน รับซื้อคืนเต็มราคา',
    price: 8900,
    promoPrice: 8900,
    originalPrice: 9500,
    discount: 6,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
    category: 'เครื่องประดับ',
    shopName: 'ห้างทองจินฮั้ว',
    shopLogo: '💍',
    rating: 4.9,
    likes: 876,
    reviews: 432,
    distance: '1.5 km',
    validUntil: '2026-03-31',
    tags: ['ทอง', 'เครื่องประดับ', 'สร้อยคอ', 'ของแท้'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-24',
    title: 'ไม้แบดมินตัน Yonex Astrox 99 Pro',
    description: 'ไม้แบดมินตัน Yonex Astrox 99 Pro รุ่นท็อป! น้ำหนักเบา ตีได้แม่นยำ ทรงพลัง พร้อมเอ็น BG80 อันดับ 1 ของนักกีฬาอาชีพ ของแท้ พร้อมกระเป๋า',
    price: 6990,
    promoPrice: 6990,
    originalPrice: 8900,
    discount: 21,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
    category: 'กีฬา',
    shopName: 'Sport World',
    shopLogo: '🏸',
    rating: 4.8,
    likes: 765,
    reviews: 312,
    distance: '2.8 km',
    validUntil: '2026-04-30',
    tags: ['แบดมินตัน', 'Yonex', 'กีฬา', 'ไม้แบด'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-25',
    title: 'JBL Charge 5 ลำโพงบลูทูธกันน้ำ',
    description: 'ลำโพงบลูทูธ JBL Charge 5 กันน้ำ กันฝุ่น IP67 เสียงดัง ทุ้มหนัก แบต 20 ชม. ใช้เป็น Powerbank ชาร์จมือถือได้ ของแท้ประกันศูนย์ 1 ปี',
    price: 4990,
    promoPrice: 4990,
    originalPrice: 6490,
    discount: 23,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
    category: 'อิเล็กทรอนิกส์',
    shopName: 'JBL Official Store',
    shopLogo: '🔊',
    rating: 4.8,
    likes: 1987,
    reviews: 876,
    distance: '1.3 km',
    validUntil: '2026-04-30',
    tags: ['ลำโพง', 'JBL', 'บลูทูธ', 'กันน้ำ'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-26',
    title: 'ชุดสวน Vertical Garden ปลูกผักในคอนโด',
    description: 'ชุดสวนแนวตั้ง พร้อมดิน เมล็ดผัก 10 ชนิด กระถาง ระบบน้ำหยดอัตโนมัติ ปลูกได้ในระเบียงคอนโด ประหยัดพื้นที่ เก็บผักสดทานเองที่บ้าน',
    price: 1490,
    promoPrice: 1490,
    originalPrice: 2490,
    discount: 40,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    category: 'บ้านและสวน',
    shopName: 'Green Garden Shop',
    shopLogo: '🌱',
    rating: 4.7,
    likes: 654,
    reviews: 287,
    distance: '3.5 km',
    validUntil: '2026-05-31',
    tags: ['สวน', 'ปลูกผัก', 'คอนโด', 'ออร์แกนิค'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-27',
    title: 'Marriott Hua Hin 3 วัน 2 คืน รวมอาหารเช้า',
    description: 'แพ็คเกจที่พัก Marriott Resort & Spa หัวหิน 5 ดาว! ห้อง Deluxe วิวทะเล รวมอาหารเช้า 2 มื้อ สระว่ายน้ำส่วนตัว ฟิตเนส สปา เช็คอิน 14:00 เช็คเอาท์ 12:00',
    price: 5990,
    promoPrice: 5990,
    originalPrice: 9900,
    discount: 39,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    category: 'โรงแรม',
    shopName: 'Marriott Thailand',
    shopLogo: '🏨',
    rating: 4.9,
    likes: 1876,
    reviews: 765,
    distance: '5.0 km',
    validUntil: '2026-06-30',
    tags: ['โรงแรม', 'หัวหิน', '5 ดาว', 'ทะเล'],
    verified: true,
    service_url: FASTWORK_URLS.HOTEL_BOOKING
  },
  {
    id: 'prod-28',
    title: 'บุฟเฟ่ต์ปิ้งย่างเกาหลี พรีเมียม ไม่อั้น',
    description: 'บุฟเฟ่ต์ปิ้งย่างเกาหลีสไตล์ KBBQ! เนื้อวัว เนื้อหมูหมักซอสเกาหลี ไก่ทอด กิมจิ บิบิมบับ น้ำจิ้มเกาหลีแท้ พร้อมไอศกรีม ไม่อั้น 120 นาที',
    price: 399,
    promoPrice: 399,
    originalPrice: 699,
    discount: 43,
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
    category: 'ร้านอาหาร',
    shopName: 'KBBQ House สยาม',
    shopLogo: '🍖',
    rating: 4.6,
    likes: 3214,
    reviews: 1432,
    distance: '0.7 km',
    validUntil: '2026-03-28',
    tags: ['ปิ้งย่าง', 'เกาหลี', 'บุฟเฟ่ต์', 'ไม่อั้น'],
    verified: true,
    service_url: FASTWORK_URLS.FOOD_DELIVERY
  },
  {
    id: 'prod-29',
    title: 'บริการทำความสะอาดบ้าน Deep Clean',
    description: 'บริการทำความสะอาดบ้าน Deep Clean! ทีมงานมืออาชีพ ทำความสะอาดทุกซอกมุม แอร์ พัดลม ห้องน้ำ ห้องครัว ดูดฝุ่น ถูพื้น พร้อมน้ำยาทำความสะอาดคุณภาพ ใช้เวลา 4-6 ชม.',
    price: 1990,
    promoPrice: 1990,
    originalPrice: 3500,
    discount: 43,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
    category: 'บริการ',
    shopName: 'CleanPro Thailand',
    shopLogo: '🧹',
    rating: 4.7,
    likes: 987,
    reviews: 432,
    distance: '2.5 km',
    validUntil: '2026-05-31',
    tags: ['ทำความสะอาด', 'บริการ', 'บ้าน', 'Deep Clean'],
    verified: true,
    service_url: FASTWORK_URLS.CLEANING_SERVICE
  },
  {
    id: 'prod-30',
    title: 'อาหารสุนัข Royal Canin 10kg + ของเล่น',
    description: 'อาหารสุนัขโต Royal Canin สูตรครบโภชนาการ 10kg พร้อมของเล่น 2 ชิ้น อาหารเม็ดเนื้อนุ่ม บำรุงขน ผิวหนัง ระบบย่อย',
    price: 1690,
    promoPrice: 1690,
    originalPrice: 2490,
    discount: 32,
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
    category: 'สัตว์เลี้ยง',
    shopName: 'Pet Lover Center',
    shopLogo: '🐾',
    rating: 4.8,
    likes: 1234,
    reviews: 567,
    distance: '1.6 km',
    validUntil: '2026-04-30',
    tags: ['อาหารสุนัข', 'Royal Canin', 'สัตว์เลี้ยง', 'สุนัข'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-31',
    title: 'ยางรถยนต์ Michelin Primacy 4 ชุด 4 เส้น',
    description: 'ยางรถยนต์ Michelin Primacy 4 ขนาด 215/55 R17 ชุด 4 เส้น! ยึดเกาะถนนดี เงียบ สบาย ประหยัดน้ำมัน ฟรีเปลี่ยน ถ่วงล้อ ตั้งศูนย์ ประกัน 5 ปี',
    price: 16900,
    promoPrice: 16900,
    originalPrice: 22000,
    discount: 23,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
    category: 'ยานยนต์',
    shopName: 'B-Quik Tire Center',
    shopLogo: '🚗',
    rating: 4.7,
    likes: 765,
    reviews: 321,
    distance: '3.8 km',
    validUntil: '2026-04-30',
    tags: ['ยาง', 'รถยนต์', 'Michelin', 'เปลี่ยนยาง'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-32',
    title: 'เครื่องฟอกอากาศ Xiaomi Air Purifier 4 Pro',
    description: 'เครื่องฟอกอากาศ Xiaomi Air Purifier 4 Pro กรอง PM2.5 ฝุ่น ไวรัส แบคทีเรีย ได้ 99.97% หน้าจอ OLED แสดงค่าอากาศ สั่งงานผ่านแอป ห้องขนาดใหญ่ 60 ตร.ม.',
    price: 5990,
    promoPrice: 5990,
    originalPrice: 7990,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
    category: 'เครื่องใช้ไฟฟ้า',
    shopName: 'Xiaomi Official Store',
    shopLogo: '🔌',
    rating: 4.8,
    likes: 1654,
    reviews: 765,
    distance: '2.1 km',
    validUntil: '2026-05-31',
    tags: ['เครื่องฟอกอากาศ', 'Xiaomi', 'PM2.5', 'สมาร์ทโฮม'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-33',
    title: 'Tom Ford Ombré Leather น้ำหอม EDP 100ml',
    description: 'น้ำหอม Tom Ford Ombré Leather EDP 100ml กลิ่นหนังผสมดอกไม้ เซ็กซี่ หรูหรา มั่นใจ ทนนาน 8-10 ชม. ของแท้ 100% พร้อมกล่อง',
    price: 8990,
    promoPrice: 8990,
    originalPrice: 12500,
    discount: 28,
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800',
    category: 'ความงาม',
    shopName: 'Perfume Gallery',
    shopLogo: '🌸',
    rating: 4.9,
    likes: 1123,
    reviews: 432,
    distance: '1.4 km',
    validUntil: '2026-04-30',
    tags: ['น้ำหอม', 'Tom Ford', 'ของแท้', 'หรู'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  },
  {
    id: 'prod-34',
    title: 'นาฬิกา Casio G-Shock GA-2100 CasiOak',
    description: 'นาฬิกา Casio G-Shock GA-2100 CasiOak ดีไซน์สวย บาง เบา กันน้ำ 200m กันกระแทก LED ไฟส่อง ของแท้ ประกัน 1 ปี พร้อมกล่อง',
    price: 3290,
    promoPrice: 3290,
    originalPrice: 4200,
    discount: 22,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
    category: 'เครื่องประดับ',
    shopName: 'Watch Hub Thailand',
    shopLogo: '⌚',
    rating: 4.8,
    likes: 1543,
    reviews: 654,
    distance: '2.3 km',
    validUntil: '2026-05-31',
    tags: ['นาฬิกา', 'G-Shock', 'Casio', 'ของแท้'],
    verified: true,
    service_url: FASTWORK_URLS.SHOPPING_SERVICE
  }
];

// ============================================
// STATE INTERFACE
// ============================================

interface AppState {
  // User State
  user: User | null;
  isAuthenticated: boolean;

  // Product State
  products: Product[];
  savedProductIds: string[];
  selectedCategory: string;
  loading: boolean;
  error: string | null;

  // Notifications
  notifications: Notification[];
  unreadCount: number;

  // Coupon Usage History
  couponHistory: CouponUsageHistory[];

  // Actions - Auth
  loginAsUser: () => void;
  loginAsMerchant: () => void;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; phone?: string }) => void;
  checkAuth: () => Promise<void>;

  // Actions - Products
  fetchProducts: () => Promise<void>;
  fetchSavedDeals: () => Promise<void>;
  toggleSave: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
  getProductById: (id: string) => Product | undefined;
  setSelectedCategory: (category: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  toggleLike: (id: string) => void;

  // Actions - Gamification
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  viewProduct: (id: string) => void;
  useCoupon: (productId: string, productName: string, savings: number) => void;

  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Utility Actions
  resetStore: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      products: MOCK_PRODUCTS,
      savedProductIds: [],
      selectedCategory: 'All',
      loading: false,
      error: null,
      notifications: [
        {
          id: 'notif-1',
          type: 'welcome',
          title: 'ยินดีต้อนรับสู่ All Pro!',
          message: 'เริ่มต้นล่าโปรเด็ดทั่วไทยได้เลย',
          time: 'Just now',
          isRead: false
        }
      ],
      unreadCount: 1,
      couponHistory: [],

      // ============================================
      // AUTH ACTIONS
      // ============================================

      checkAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error) throw error;
            
            if (profile) {
              set({
                user: {
                  id: profile.id,
                  name: profile.username,
                  username: profile.username,
                  email: session.user.email || '',
                  role: 'user',
                  avatar: profile.avatar_url,
                  xp: profile.xp,
                  level: profile.level,
                  coins: profile.coins,
                  createdAt: session.user.created_at
                },
                isAuthenticated: true
              });
              
              // Fetch saved deals after auth
              await get().fetchSavedDeals();
            }
          }
        } catch (error) {
          console.error('Auth check error:', error);
        }
      },

      loginAsUser: () => {
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: 'Hunter 007',
          username: 'Hunter 007',
          email: 'hunter007@allpromo.com',
          role: 'user',
          avatar: 'https://i.pravatar.cc/150?img=12',
          phone: '081-234-5678',
          createdAt: new Date().toISOString(),
          xp: 0,
          level: 1,
          coins: 100
        };

        set({ user: newUser, isAuthenticated: true });
        toast.success('เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ Hunter 007');
      },

      loginAsMerchant: () => {
        const newUser: User = {
          id: `merchant-${Date.now()}`,
          name: 'Siam Store',
          username: 'Siam Store',
          email: 'siam@store.com',
          role: 'merchant',
          avatar: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=150',
          phone: '02-123-4567',
          createdAt: new Date().toISOString(),
          xp: 0,
          level: 1,
          coins: 0
        };

        set({ user: newUser, isAuthenticated: true });
        toast.success('เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ Merchant');
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ 
          user: null, 
          isAuthenticated: false,
          savedProductIds: []
        });
        toast.success('ออกจากระบบแล้ว');
      },

      updateProfile: (updates) => {
        const state = get();
        if (!state.user) return;

        set({
          user: {
            ...state.user,
            ...updates
          }
        });
        toast.success('อัพเดทโปรไฟล์สำเร็จ');
      },

      // ============================================
      // PRODUCT ACTIONS
      // ============================================

      fetchProducts: async () => {
        try {
          set({ loading: true, error: null });
          
          // ดึงจาก Supabase จริง
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
          
          // ถ้า error หรือไม่มีข้อมูล ใช้ Mock ทันที
          if (error || !data || data.length === 0) {
            set({ products: MOCK_PRODUCTS, loading: false });
            return;
          }
          
          // แปลง Supabase data ให้ตรงกับ Product interface
          const products: Product[] = data.map((item: any) => ({
            id: item.id,
            title: item.title || '',
            description: item.description || '',
            price: item.price || 0,
            originalPrice: item.originalPrice || item.price || 0,
            promoPrice: item.promoPrice || item.price,
            discount: item.discount,
            image: item.image || '/placeholder.jpg',
            category: item.category || 'ทั่วไป',
            shopName: item.shopName || item.shop_name || 'ร้านค้า',
            shopId: item.shopId || item.shop_id,
            shopLogo: item.shopLogo,
            brand: item.brand,
            rating: item.rating,
            likes: item.likes || 0,
            reviews: item.reviews || 0,
            distance: item.distance,
            validUntil: item.validUntil || item.valid_until,
            tags: item.tags || [],
            verified: item.verified || false,
            createdAt: item.created_at,
            service_url: item.service_url,
          }));
          
          set({ products, loading: false });
        } catch (error: any) {
          set({ products: MOCK_PRODUCTS, loading: false });
        }
      },

      fetchSavedDeals: async () => {
        const state = get();
        if (!state.user?.id) return;
        
        try {
          const { data, error } = await supabase
            .from('saved_deals')
            .select('product_id')
            .eq('user_id', state.user.id);
          
          if (error) throw error;
          
          if (data) {
            set({
              savedProductIds: data.map((d: any) => d.product_id)
            });
          }
        } catch (error: any) {
          console.error('Fetch saved deals error:', error);
        }
      },

      toggleSave: async (id) => {
        const state = get();
        const isSaved = state.savedProductIds.includes(id);

        // Mock behavior if not authenticated
        if (!state.isAuthenticated || !state.user?.id) {
          if (isSaved) {
            set({
              savedProductIds: state.savedProductIds.filter((pid) => pid !== id)
            });
            toast.success('นำออกจากกระเป๋าแล้ว');
          } else {
            set({
              savedProductIds: [...state.savedProductIds, id]
            });
            toast.success('💾 บันทึกแล้ว!');
          }
          return;
        }

        // Real Supabase save/unsave
        try {
          if (isSaved) {
            const { error } = await supabase
              .from('saved_deals')
              .delete()
              .match({ user_id: state.user.id, product_id: id });
            
            if (error) throw error;
            
            set({
              savedProductIds: state.savedProductIds.filter((pid) => pid !== id)
            });
            toast.success('นำออกจากกระเป๋าแล้ว');
          } else {
            const { error } = await supabase
              .from('saved_deals')
              .insert({ user_id: state.user.id, product_id: id });
            
            if (error) throw error;
            
            set({
              savedProductIds: [...state.savedProductIds, id]
            });

            // Award coins on first save
            if (state.user?.role === 'user') {
              get().addCoins(10);
              toast.success('💾 บันทึกแล้ว! +10 เหรียญ');
            } else {
              toast.success('💾 บันทึกแล้ว!');
            }
          }
        } catch (error: any) {
          console.error('Toggle save error:', error);
          toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
        }
      },

      isSaved: (id) => {
        return get().savedProductIds.includes(id);
      },

      getProductById: (id) => {
        return get().products.find((p) => p.id === id);
      },

      setSelectedCategory: (category) => {
        set({ selectedCategory: category });
      },

      addProduct: (productData) => {
        const state = get();
        const newProduct: Product = {
          ...productData,
          id: `prod-${Date.now()}`,
          likes: 0,
          reviews: 0,
          rating: 4.5,
          verified: false
        };

        set({
          products: [newProduct, ...state.products]
        });

        toast.success('✨ เพิ่มโปรโมชั่นใหม่แล้ว!');
      },

      deleteProduct: (id) => {
        const state = get();
        set({
          products: state.products.filter((p) => p.id !== id),
          savedProductIds: state.savedProductIds.filter((pid) => pid !== id)
        });
        toast.success('ลบโปรโมชั่นแล้ว');
      },

      toggleLike: (id) => {
        const state = get();
        set({
          products: state.products.map((p) =>
            p.id === id
              ? {
                  ...p,
                  isLiked: !p.isLiked,
                  likes: p.isLiked
                    ? Math.max((p.likes || 1) - 1, 0)
                    : (p.likes || 0) + 1,
                }
              : p
          )
        });
      },

      // ============================================
      // GAMIFICATION ACTIONS
      // ============================================

      addXp: (amount) => {
        const state = get();
        if (!state.user || state.user.role !== 'user') return;

        const newXp = state.user.xp + amount;
        const newLevel = Math.floor(newXp / 100) + 1;
        const oldLevel = state.user.level;

        set({
          user: {
            ...state.user,
            xp: newXp,
            level: newLevel
          }
        });

        // Level up notification
        if (newLevel > oldLevel) {
          toast.success(`🎉 เลเวลอัพ! ตอนนี้คุณคือ Level ${newLevel}`, {
            duration: 4000
          });
          
          get().addNotification({
            type: 'reward',
            title: `Level Up! 🎉`,
            message: `ยินดีด้วย! คุณเลเวลอัพเป็น Level ${newLevel} แล้ว`
          });
        }
      },

      addCoins: (amount) => {
        const state = get();
        if (!state.user || state.user.role !== 'user') return;

        set({
          user: {
            ...state.user,
            coins: state.user.coins + amount
          }
        });
      },

      viewProduct: (id) => {
        const state = get();
        if (!state.isAuthenticated || state.user?.role !== 'user') return;

        // Award XP for viewing product
        get().addXp(5);
      },

      useCoupon: (productId, productName, savings) => {
        const state = get();
        if (!state.isAuthenticated) return;

        // Add to history
        const historyItem: CouponUsageHistory = {
          id: `history-${Date.now()}`,
          productId,
          productName,
          usedAt: new Date().toISOString(),
          savings
        };

        set({
          couponHistory: [historyItem, ...state.couponHistory]
        });

        // Award XP and Coins
        if (state.user?.role === 'user') {
          get().addXp(20);
          get().addCoins(5);
        }

        // Notification
        get().addNotification({
          type: 'reward',
          title: 'ใช้คูปองสำเร็จ! 🎉',
          message: `คุณประหยัดไปแล้ว ฿${savings} จาก ${productName}`
        });

        toast.success(`ใช้คูปองสำเร็จ! ประหยัด ฿${savings}`);
      },

      // ============================================
      // NOTIFICATION ACTIONS
      // ============================================

      addNotification: (notificationData) => {
        const state = get();
        const newNotification: Notification = {
          ...notificationData,
          id: `notif-${Date.now()}`,
          time: 'Just now',
          isRead: false
        };

        set({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        });
      },

      markNotificationAsRead: (id) => {
        const state = get();
        const notification = state.notifications.find((n) => n.id === id);
        
        if (notification && !notification.isRead) {
          set({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          });
        }
      },

      markAllNotificationsAsRead: () => {
        const state = get();
        set({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0
        });
      },

      // ============================================
      // UTILITY ACTIONS
      // ============================================

      resetStore: () => {
        set({
          products: MOCK_PRODUCTS,
          savedProductIds: [],
          selectedCategory: 'All',
          couponHistory: []
        });
        toast.success('รีเซ็ตข้อมูลสำเร็จ');
      }
    }),
    {
      name: 'all-promo-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        products: state.products,
        savedProductIds: state.savedProductIds,
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        couponHistory: state.couponHistory
      })
    }
  )
);
