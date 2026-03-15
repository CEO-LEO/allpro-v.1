export type StoreCategory = 'convenience' | 'supermarket' | 'coffee' | 'food' | 'fashion';

export interface Store {
  id: string;
  name: string;
  brand: '7-Eleven' | 'Lotus' | 'Big C' | 'Makro';
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

// Mock stores around Siam Paragon, Bangkok (13.7462, 100.5347)
export const mockStores: Store[] = [
  {
    id: '1',
    name: '7-Eleven Siam Square Branch',
    brand: '7-Eleven',
    category: 'convenience',
    lat: 13.7455,
    lng: 100.5335,
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/7-eleven_logo.svg/200px-7-eleven_logo.svg.png',
    activePromos: 12,
    address: 'Siam Square, Pathum Wan',
    distance: 0.2,
    bestDeal: {
      title: 'Buy 1 Get 1 Coffee',
      discount: 50,
    }
  },
  {
    id: '2',
    name: "Lotus's Ratchaprasong",
    brand: 'Lotus',
    category: 'supermarket',
    lat: 13.7438,
    lng: 100.5398,
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Lotus%27s_logo.svg/200px-Lotus%27s_logo.svg.png',
    activePromos: 25,
    address: 'Ratchaprasong Road',
    distance: 0.5,
    bestDeal: {
      title: 'Fresh Produce 30% Off',
      discount: 30,
    }
  },
  {
    id: '3',
    name: '7-Eleven Chit Lom',
    brand: '7-Eleven',
    category: 'convenience',
    lat: 13.7442,
    lng: 100.5442,
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/7-eleven_logo.svg/200px-7-eleven_logo.svg.png',
    activePromos: 8,
    address: 'Chit Lom Station',
    distance: 0.8,
    bestDeal: {
      title: 'Snack Bundle Deal',
      discount: 40,
    }
  },
  {
    id: '4',
    name: 'Big C Ratchadamri',
    brand: 'Big C',
    category: 'supermarket',
    lat: 13.7475,
    lng: 100.5385,
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Big_C_Logo.svg/200px-Big_C_Logo.svg.png',
    activePromos: 35,
    address: 'Ratchadamri Road',
    distance: 0.6,
    bestDeal: {
      title: 'Electronics Flash Sale',
      discount: 60,
    }
  },
  {
    id: '5',
    name: "Lotus's Express Pratunam",
    brand: 'Lotus',
    category: 'supermarket',
    lat: 13.7520,
    lng: 100.5390,
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Lotus%27s_logo.svg/200px-Lotus%27s_logo.svg.png',
    activePromos: 18,
    address: 'Pratunam Area',
    distance: 0.9,
    bestDeal: {
      title: 'Household Items 25% Off',
      discount: 25,
    }
  },
  {
    id: '6',
    name: '7-Eleven National Stadium',
    brand: '7-Eleven',
    category: 'convenience',
    lat: 13.7468,
    lng: 100.5290,
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/7-eleven_logo.svg/200px-7-eleven_logo.svg.png',
    activePromos: 10,
    address: 'National Stadium BTS',
    distance: 0.4,
    bestDeal: {
      title: 'Sandwich Combo',
      discount: 35,
    }
  },
  {
    id: '7',
    name: 'Makro Ratchathewi',
    brand: 'Makro',
    category: 'supermarket',
    lat: 13.7505,
    lng: 100.5310,
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Makro_Logo.svg/200px-Makro_Logo.svg.png',
    activePromos: 42,
    address: 'Ratchathewi District',
    distance: 1.2,
    bestDeal: {
      title: 'Bulk Food 50% Discount',
      discount: 50,
    }
  },
  {
    id: '8',
    name: '7-Eleven Platinum Fashion Mall',
    brand: '7-Eleven',
    category: 'fashion',
    lat: 13.7515,
    lng: 100.5415,
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/7-eleven_logo.svg/200px-7-eleven_logo.svg.png',
    activePromos: 9,
    address: 'Platinum Fashion Mall',
    distance: 0.7,
    bestDeal: {
      title: 'Energy Drink Buy 2 Get 1',
      discount: 33,
    }
  },
];
