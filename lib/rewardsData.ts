// Rewards Catalog Data

export interface Reward {
  id: string;
  name: string;
  brand: string;
  category: 'hot-deals' | 'vouchers' | 'gadgets' | 'lifestyle';
  pointsCost: number;
  value: string;
  description: string;
  image: string;
  stock: number;
  discount?: string;
  validityDays: number; // How many days until voucher expires after redemption
  featured?: boolean;
}

export const REWARDS_CATALOG: Reward[] = [
  // Hot Deals
  {
    id: 'reward-001',
    name: 'ส่วนลด 7-Eleven ฿100',
    brand: '7-Eleven',
    category: 'hot-deals',
    pointsCost: 250,
    value: '฿100',
    description: 'ส่วนลดมูลค่า 100 บาท ใช้ได้ทุกสาขา',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop',
    stock: 45,
    discount: 'ประหยัด 60%',
    validityDays: 30,
    featured: true
  },
  {
    id: 'reward-002',
    name: 'Starbucks Tall Latte',
    brand: 'Starbucks',
    category: 'hot-deals',
    pointsCost: 300,
    value: 'Free Drink',
    description: 'คูปองเครื่องดื่มฟรี 1 แก้ว (Tall Size)',
    image: 'https://images.unsplash.com/photo-1611162458324-aae1eb4129a6?w=400&h=300&fit=crop',
    stock: 28,
    discount: 'มูลค่า ฿145',
    validityDays: 60,
    featured: true
  },
  {
    id: 'reward-003',
    name: 'KFC Chicken Bucket',
    brand: 'KFC',
    category: 'hot-deals',
    pointsCost: 450,
    value: '฿200',
    description: 'ส่วนลด 200 บาท สำหรับ Bucket ไก่ทอด',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
    stock: 67,
    discount: 'ประหยัด 55%',
    validityDays: 45,
    featured: true
  },

  // Cash Vouchers
  {
    id: 'reward-004',
    name: 'Shopee Voucher ฿50',
    brand: 'Shopee',
    category: 'vouchers',
    pointsCost: 150,
    value: '฿50',
    description: 'ส่วนลดช้อปปิ้งออนไลน์ ยอดขั้นต่ำ 200 บาท',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop',
    stock: 120,
    validityDays: 90,
    featured: false
  },
  {
    id: 'reward-005',
    name: 'Grab Food ฿100',
    brand: 'Grab',
    category: 'vouchers',
    pointsCost: 280,
    value: '฿100',
    description: 'ส่วนลดสั่งอาหาร ไม่มียอดขั้นต่ำ',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    stock: 89,
    discount: 'ไม่มีขั้นต่ำ!',
    validityDays: 30,
    featured: false
  },
  {
    id: 'reward-006',
    name: 'Lazada Voucher ฿200',
    brand: 'Lazada',
    category: 'vouchers',
    pointsCost: 500,
    value: '฿200',
    description: 'ส่วนลด 200 บาท ยอดขั้นต่ำ 500 บาท',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=300&fit=crop',
    stock: 156,
    validityDays: 60,
    featured: false
  },

  // Lifestyle
  {
    id: 'reward-007',
    name: 'Netflix 1 Month',
    brand: 'Netflix',
    category: 'lifestyle',
    pointsCost: 800,
    value: '1 Month',
    description: 'สมาชิก Netflix Basic 1 เดือน',
    image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=300&fit=crop',
    stock: 42,
    discount: 'มูลค่า ฿349',
    validityDays: 90,
    featured: false
  },
  {
    id: 'reward-008',
    name: 'Spotify Premium 1 Month',
    brand: 'Spotify',
    category: 'lifestyle',
    pointsCost: 600,
    value: '1 Month',
    description: 'Spotify Premium 1 เดือน ฟังเพลงไม่จำกัด',
    image: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400&h=300&fit=crop',
    stock: 73,
    discount: 'มูลค่า ฿129',
    validityDays: 60,
    featured: false
  },
  {
    id: 'reward-009',
    name: 'SF Cinema Ticket',
    brand: 'SF Cinema',
    category: 'lifestyle',
    pointsCost: 400,
    value: '1 Ticket',
    description: 'บัตรชมภาพยนตร์ฟรี 1 ที่นั่ง (2D)',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop',
    stock: 95,
    discount: 'มูลค่า ฿200',
    validityDays: 90,
    featured: false
  },

  // Gadgets
  {
    id: 'reward-010',
    name: 'True Money ฿500',
    brand: 'TrueMoney',
    category: 'gadgets',
    pointsCost: 1200,
    value: '฿500',
    description: 'เติมเงิน TrueMoney Wallet 500 บาท',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
    stock: 234,
    discount: 'ประหยัด 58%',
    validityDays: 180,
    featured: false
  },
  {
    id: 'reward-011',
    name: 'AIS Top-up ฿100',
    brand: 'AIS',
    category: 'gadgets',
    pointsCost: 250,
    value: '฿100',
    description: 'เติมเงินมือถือ AIS 100 บาท',
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=300&fit=crop',
    stock: 189,
    validityDays: 365,
    featured: false
  },
  {
    id: 'reward-012',
    name: 'Power Bank 10000mAh',
    brand: 'Anker',
    category: 'gadgets',
    pointsCost: 2500,
    value: 'Physical',
    description: 'Anker Power Bank 10000mAh จัดส่งฟรี',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop',
    stock: 12,
    discount: 'มูลค่า ฿1,290',
    validityDays: 30,
    featured: false
  }
];

export function getRewardById(id: string): Reward | undefined {
  return REWARDS_CATALOG.find(r => r.id === id);
}

export function getRewardsByCategory(category: string): Reward[] {
  if (category === 'all') return REWARDS_CATALOG;
  return REWARDS_CATALOG.filter(r => r.category === category);
}

export function getFeaturedRewards(): Reward[] {
  return REWARDS_CATALOG.filter(r => r.featured);
}
