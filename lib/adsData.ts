export interface AdCampaign {
  id: string;
  merchantId: string;
  merchantName: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  productDiscount: number;
  goal: 'visibility' | 'traffic';
  dailyBudget: number;
  totalBudget: number;
  duration: number; // days
  status: 'active' | 'paused' | 'completed';
  impressions: number;
  clicks: number;
  spent: number;
  startDate: Date;
  endDate: Date;
}
