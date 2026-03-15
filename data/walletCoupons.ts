export interface WalletCoupon {
  id: string;
  title: string;
  brand: string;
  brandLogo: string;
  discount: string;
  description: string;
  imageUrl: string;
  expiryDate: string;
  code: string;
  barcode: string;
  qrData: string;
  terms: string[];
  status: 'active' | 'used' | 'expired';
  usedDate?: string;
  storeLocation?: string;
}

export const mockWalletCoupons: WalletCoupon[] = [
  {
    id: 'CPN001',
    title: 'Buy 1 Get 1 Free Coffee',
    brand: '7-Eleven',
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/7-eleven_logo.svg/200px-7-eleven_logo.svg.png',
    discount: '50% OFF',
    description: 'Valid for all coffee sizes (Hot & Iced)',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop',
    expiryDate: '2026-02-28',
    code: '7E-COFFEE-2024',
    barcode: '123456789012',
    qrData: 'https://allpro.com/redeem/CPN001',
    terms: [
      'Valid at all 7-Eleven stores nationwide',
      'Cannot be combined with other promotions',
      'One coupon per transaction',
      'Show this QR code to cashier'
    ],
    status: 'active'
  },
  {
    id: 'CPN002',
    title: 'Fresh Produce 30% Discount',
    brand: "Lotus's",
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Lotus%27s_logo.svg/200px-Lotus%27s_logo.svg.png',
    discount: '30% OFF',
    description: 'All vegetables, fruits, and fresh items',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&h=600&fit=crop',
    expiryDate: '2026-04-15',
    code: 'LOTUS-FRESH-30',
    barcode: '234567890123',
    qrData: 'https://allpro.com/redeem/CPN002',
    terms: [
      'Valid at Lotus stores with fresh sections',
      'Minimum purchase 200 THB',
      'Excludes processed and frozen items',
      'Valid until stock lasts'
    ],
    status: 'active'
  },
  {
    id: 'CPN003',
    title: 'Electronics Bundle Deal',
    brand: 'Big C',
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Big_C_Logo.svg/200px-Big_C_Logo.svg.png',
    discount: '40% OFF',
    description: 'Laptops, tablets, and accessories',
    imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=600&fit=crop',
    expiryDate: '2026-03-10',
    code: 'BIGC-TECH-40',
    barcode: '345678901234',
    qrData: 'https://allpro.com/redeem/CPN003',
    terms: [
      'Valid at Big C Supercenter only',
      'Selected models only',
      'Subject to availability',
      'Cannot be exchanged for cash'
    ],
    status: 'active'
  },
  {
    id: 'CPN004',
    title: 'Snack Bundle 2+1 Free',
    brand: '7-Eleven',
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/7-eleven_logo.svg/200px-7-eleven_logo.svg.png',
    discount: 'BUY 2 GET 1',
    description: 'All snack items included',
    imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&h=600&fit=crop',
    expiryDate: '2026-01-20',
    code: '7E-SNACK-321',
    barcode: '456789012345',
    qrData: 'https://allpro.com/redeem/CPN004',
    terms: [
      'Valid for snacks priced equally',
      'Lowest price item will be free',
      'One redemption per customer per day'
    ],
    status: 'used',
    usedDate: '2026-01-18',
    storeLocation: '7-Eleven Sukhumvit 23'
  },
  {
    id: 'CPN005',
    title: 'Bakery 50% After 7PM',
    brand: 'Makro',
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Makro_Logo.svg/200px-Makro_Logo.svg.png',
    discount: '50% OFF',
    description: 'Fresh bread and pastries',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop',
    expiryDate: '2025-12-31',
    code: 'MAKRO-BAKERY-50',
    barcode: '567890123456',
    qrData: 'https://allpro.com/redeem/CPN005',
    terms: [
      'Valid after 7:00 PM only',
      'While stocks last'
    ],
    status: 'expired'
  }
];
