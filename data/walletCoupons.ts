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

// TODO: Replace with API call -> GET /api/wallet/coupons
export const mockWalletCoupons: WalletCoupon[] = [];
