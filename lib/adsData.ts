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

export interface SponsoredProduct {
  campaignId: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  productDiscount: number;
  merchantName: string;
  isSponsored: true;
}

export interface AdStats {
  totalImpressions: number;
  totalClicks: number;
  totalSpent: number;
  ctr: number; // Click-through rate
  avgCPC: number; // Average cost per click
  activeCampaigns: number;
}

// Mock campaign data
export const mockCampaigns: AdCampaign[] = [
  {
    id: 'camp-001',
    merchantId: 'merchant-001',
    merchantName: 'Coca-Cola Thailand',
    productId: 'sponsored-001',
    productName: 'Coca-Cola 1.25L B1G1',
    productImage: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600',
    productPrice: 25,
    productDiscount: 50,
    goal: 'visibility',
    dailyBudget: 500,
    totalBudget: 5000,
    duration: 10,
    status: 'active',
    impressions: 12450,
    clicks: 623,
    spent: 2340,
    startDate: new Date('2026-01-28'),
    endDate: new Date('2026-02-07')
  },
  {
    id: 'camp-002',
    merchantId: 'merchant-002',
    merchantName: "Lay's Snacks",
    productId: 'sponsored-002',
    productName: "Lay's Chips Pack 3 for ฿99",
    productImage: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600',
    productPrice: 99,
    productDiscount: 40,
    goal: 'traffic',
    dailyBudget: 300,
    totalBudget: 3000,
    duration: 10,
    status: 'active',
    impressions: 8920,
    clicks: 401,
    spent: 1560,
    startDate: new Date('2026-01-30'),
    endDate: new Date('2026-02-09')
  },
  {
    id: 'camp-003',
    merchantId: 'merchant-003',
    merchantName: 'Starbucks Thailand',
    productId: 'sponsored-003',
    productName: 'Coffee & Cake Set ฿199',
    productImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
    productPrice: 199,
    productDiscount: 35,
    goal: 'visibility',
    dailyBudget: 400,
    totalBudget: 4000,
    duration: 10,
    status: 'paused',
    impressions: 5230,
    clicks: 215,
    spent: 980,
    startDate: new Date('2026-01-29'),
    endDate: new Date('2026-02-08')
  }
];

// Get active sponsored products for feed injection
export const getSponsoredProducts = (): SponsoredProduct[] => {
  const activeCampaigns = mockCampaigns.filter(c => c.status === 'active');
  
  return activeCampaigns.map(campaign => ({
    campaignId: campaign.id,
    productId: campaign.productId,
    productName: campaign.productName,
    productImage: campaign.productImage,
    productPrice: campaign.productPrice,
    productDiscount: campaign.productDiscount,
    merchantName: campaign.merchantName,
    isSponsored: true
  }));
};

// Track impression
export const trackImpression = (campaignId: string): void => {
  const campaign = mockCampaigns.find(c => c.id === campaignId);
  if (campaign) {
    campaign.impressions += 1;
    
    // Calculate cost (mock: ฿0.5 per impression)
    const costPerImpression = 0.5;
    campaign.spent += costPerImpression;
    
    // Save to localStorage for persistence
    localStorage.setItem('ad_campaigns', JSON.stringify(mockCampaigns));
  }
};

// Track click
export const trackClick = (campaignId: string): void => {
  const campaign = mockCampaigns.find(c => c.id === campaignId);
  if (campaign) {
    campaign.clicks += 1;
    
    // Calculate cost (mock: ฿5 per click)
    const costPerClick = 5;
    campaign.spent += costPerClick;
    
    // Save to localStorage
    localStorage.setItem('ad_campaigns', JSON.stringify(mockCampaigns));
  }
};

// Get campaign stats for merchant dashboard
export const getCampaignStats = (merchantId: string): AdStats => {
  const merchantCampaigns = mockCampaigns.filter(c => c.merchantId === merchantId);
  
  const totalImpressions = merchantCampaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = merchantCampaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalSpent = merchantCampaigns.reduce((sum, c) => sum + c.spent, 0);
  const activeCampaigns = merchantCampaigns.filter(c => c.status === 'active').length;
  
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;
  
  return {
    totalImpressions,
    totalClicks,
    totalSpent,
    ctr,
    avgCPC,
    activeCampaigns
  };
};

// Create new campaign (mock)
export const createCampaign = (campaign: Omit<AdCampaign, 'id' | 'impressions' | 'clicks' | 'spent'>): AdCampaign => {
  const newCampaign: AdCampaign = {
    ...campaign,
    id: `camp-${Date.now()}`,
    impressions: 0,
    clicks: 0,
    spent: 0
  };
  
  mockCampaigns.push(newCampaign);
  localStorage.setItem('ad_campaigns', JSON.stringify(mockCampaigns));
  
  return newCampaign;
};

// Pro Merchant Status
export interface MerchantSubscription {
  merchantId: string;
  isPro: boolean;
  subscribedAt?: Date;
  expiresAt?: Date;
}

const proMerchants = new Set(['merchant-001', 'merchant-002', 'merchant-003']);

export const isProMerchant = (merchantId: string): boolean => {
  return proMerchants.has(merchantId);
};

export const upgradeToProMerchant = (merchantId: string): boolean => {
  proMerchants.add(merchantId);
  localStorage.setItem('pro_merchants', JSON.stringify([...proMerchants]));
  return true;
};
