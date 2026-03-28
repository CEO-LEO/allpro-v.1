export type StoreCategory = 'convenience' | 'supermarket' | 'coffee' | 'food' | 'fashion';

export interface Store {
  id: string;
  name: string;
  brand: string;
  category: StoreCategory;
  lat: number;
  lng: number;
  brandLogo: string;
  activePromos: number;
  address: string;
  distance?: number;
  stockStatus?: 'available' | 'out_of_stock';
  stockQuantity?: number;
  lastStockUpdate?: string;
  bestDeal?: {
    title: string;
    discount: number;
    imageUrl?: string;
  };
}

// TODO: Replace with API call -> GET /api/stores
export const mockStores: Store[] = [
  {
    id: 's1',
    name: '7-Eleven สยามสแควร์ ซอย 3',
    brand: '7-Eleven',
    category: 'convenience',
    lat: 13.7455,
    lng: 100.5340,
    brandLogo: '/brand/7eleven.png',
    activePromos: 5,
    address: 'สยามสแควร์ ซอย 3, ปทุมวัน',
    distance: 0.3,
    bestDeal: { title: 'ลดทั้งร้าน 20%', discount: 20 },
  },
  {
    id: 's2',
    name: '7-Eleven MBK Center',
    brand: '7-Eleven',
    category: 'convenience',
    lat: 13.7440,
    lng: 100.5300,
    brandLogo: '/brand/7eleven.png',
    activePromos: 3,
    address: 'MBK Center ชั้น G, ปทุมวัน',
    distance: 0.5,
    bestDeal: { title: 'ซื้อ 1 แถม 1 กาแฟ', discount: 50 },
  },
  {
    id: 's3',
    name: "Lotus's สามย่าน",
    brand: "Lotus's",
    category: 'supermarket',
    lat: 13.7382,
    lng: 100.5282,
    brandLogo: '/brand/lotus.png',
    activePromos: 8,
    address: 'จามจุรี สแควร์, สามย่าน',
    distance: 1.0,
    bestDeal: { title: 'ผัก-ผลไม้ ลด 30%', discount: 30 },
  },
  {
    id: 's4',
    name: 'Big C ราชดำริ',
    brand: 'Big C',
    category: 'supermarket',
    lat: 13.7465,
    lng: 100.5390,
    brandLogo: '/brand/bigc.png',
    activePromos: 6,
    address: 'ราชดำริ, ปทุมวัน',
    distance: 0.8,
    bestDeal: { title: 'เครื่องดื่มลด 25%', discount: 25 },
  },
  {
    id: 's5',
    name: 'Makro สาทร',
    brand: 'Makro',
    category: 'supermarket',
    lat: 13.7215,
    lng: 100.5305,
    brandLogo: '/brand/makro.png',
    activePromos: 4,
    address: 'สาทรใต้, สาทร',
    distance: 2.5,
    bestDeal: { title: 'สินค้านำเข้า ลด 40%', discount: 40 },
  },
  {
    id: 's6',
    name: '7-Eleven อโศก BTS',
    brand: '7-Eleven',
    category: 'convenience',
    lat: 13.7375,
    lng: 100.5602,
    brandLogo: '/brand/7eleven.png',
    activePromos: 4,
    address: 'ใต้สถานี BTS อโศก',
    distance: 1.8,
    bestDeal: { title: 'ขนมปัง 2 แถม 1', discount: 33 },
  },
  {
    id: 's7',
    name: "Lotus's พระราม 4",
    brand: "Lotus's",
    category: 'supermarket',
    lat: 13.7230,
    lng: 100.5470,
    brandLogo: '/brand/lotus.png',
    activePromos: 7,
    address: 'พระราม 4, คลองเตย',
    distance: 2.2,
    bestDeal: { title: 'ของใช้ในบ้าน ลด 35%', discount: 35 },
  },
  {
    id: 's8',
    name: 'Café Amazon สยาม',
    brand: 'Café Amazon',
    category: 'coffee',
    lat: 13.7468,
    lng: 100.5320,
    brandLogo: '/brand/cafe-amazon.png',
    activePromos: 2,
    address: 'สยามสแควร์ ซอย 7',
    distance: 0.4,
    bestDeal: { title: 'เครื่องดื่มลด 15%', discount: 15 },
  },
  {
    id: 's9',
    name: 'After You สยามพารากอน',
    brand: 'After You',
    category: 'food',
    lat: 13.7460,
    lng: 100.5348,
    brandLogo: '/brand/afteryou.png',
    activePromos: 3,
    address: 'สยามพารากอน ชั้น G',
    distance: 0.2,
    bestDeal: { title: 'Shibuya Honey Toast ลด 20%', discount: 20 },
  },
  {
    id: 's10',
    name: 'Uniqlo CentralWorld',
    brand: 'Uniqlo',
    category: 'fashion',
    lat: 13.7470,
    lng: 100.5395,
    brandLogo: '/brand/uniqlo.png',
    activePromos: 5,
    address: 'CentralWorld ชั้น 2',
    distance: 0.6,
    bestDeal: { title: 'เสื้อยืด UT ลด 30%', discount: 30 },
  },
  {
    id: 's11',
    name: '7-Eleven ทองหล่อ',
    brand: '7-Eleven',
    category: 'convenience',
    lat: 13.7330,
    lng: 100.5680,
    brandLogo: '/brand/7eleven.png',
    activePromos: 3,
    address: 'สุขุมวิท 55 (ทองหล่อ)',
    distance: 3.0,
    bestDeal: { title: 'เบเกอรี่ลด 15%', discount: 15 },
  },
  {
    id: 's12',
    name: 'Big C เอกมัย',
    brand: 'Big C',
    category: 'supermarket',
    lat: 13.7295,
    lng: 100.5850,
    brandLogo: '/brand/bigc.png',
    activePromos: 5,
    address: 'สุขุมวิท 63 (เอกมัย)',
    distance: 3.8,
    bestDeal: { title: 'สินค้าแช่แข็ง ลด 20%', discount: 20 },
  },
];
