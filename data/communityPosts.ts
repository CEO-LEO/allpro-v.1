// Community Posts Data - Separated by post type

// Brand Post Interface
export interface BrandPost {
  id: string;
  brandName: string;
  brandLogo: string;
  brandVerified: boolean;
  title: string;
  description: string;
  discount: string;
  imageUrl: string;
  category: string;
  validUntil: string;
  location: string;
  timeAgo: string;
  likes: number;
  shares: number;
}

// User Post Interface
export interface UserPost {
  id: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  caption: string;
  imageUrl: string;
  location: string;
  timeAgo: string;
  points: number;
  helpful: number;
  comments: number;
}

// Legacy interface for backward compatibility
export interface CommunityPost {
  id: string;
  userName: string;
  userAvatar: string;
  caption: string;
  imageUrl: string;
  location: string;
  timeAgo: string;
  points: number;
}

// Brand Posts - Posts from verified brands/merchants
export const mockBrandPosts: BrandPost[] = [
  {
    id: 'brand-1',
    brandName: 'Starbucks Thailand',
    brandLogo: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&h=100&fit=crop',
    brandVerified: true,
    title: 'Buy 1 Get 1 Free on All Frappuccinos! ❄️',
    description: 'Cool down this summer with our BOGO Frappuccino deal! Valid for all sizes and flavors. Limited time only!',
    discount: '50% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
    category: 'Drinks',
    validUntil: '31 Dec 2026',
    location: 'All Starbucks branches in Bangkok',
    timeAgo: '2 hours ago',
    likes: 128,
    shares: 45
  },
  {
    id: 'brand-2',
    brandName: '7-Eleven Thailand',
    brandLogo: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&h=100&fit=crop',
    brandVerified: true,
    title: 'Combo Deal: Sandwich + Drink = 59฿ 🥪',
    description: 'Perfect lunch combo! Choose any sandwich and get a free drink. Available at all 7-Eleven stores nationwide.',
    discount: '20฿ OFF',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    category: 'Food',
    validUntil: '28 Feb 2026',
    location: 'All 7-Eleven stores nationwide',
    timeAgo: '5 hours ago',
    likes: 89,
    shares: 32
  },
  {
    id: 'brand-3',
    brandName: 'The Pizza Company',
    brandLogo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop',
    brandVerified: true,
    title: 'Large Pizza only 299฿ Today! 🍕',
    description: 'Flash sale! Get any large pizza for just 299฿. Dine-in, takeaway, or delivery. Valid today only!',
    discount: '40% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
    category: 'Food',
    validUntil: '4 Feb 2026',
    location: 'All branches',
    timeAgo: '1 day ago',
    likes: 156,
    shares: 67
  },
  {
    id: 'brand-4',
    brandName: 'Big C Supercenter',
    brandLogo: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100&h=100&fit=crop',
    brandVerified: true,
    title: 'Fresh Milk 25% OFF This Week! 🥛',
    description: 'Stock up on fresh milk! All brands 25% off. Limited stock available.',
    discount: '25% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
    category: 'Groceries',
    validUntil: '15 Mar 2026',
    location: 'Big C branches nationwide',
    timeAgo: '3 days ago',
    likes: 67,
    shares: 23
  },
  {
    id: 'brand-5',
    brandName: 'KFC Thailand',
    brandLogo: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=100&h=100&fit=crop',
    brandVerified: true,
    title: 'Family Bucket 399฿ - Feed the Family! 🍗',
    description: '12 pcs chicken + 3 large sides + 1.5L Pepsi. Perfect for family dinner!',
    discount: '30% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
    category: 'Food',
    validUntil: '28 Feb 2026',
    location: 'All KFC restaurants',
    timeAgo: '1 week ago',
    likes: 203,
    shares: 89
  }
];

// User Posts - Posts from community members
export const mockUserPosts: UserPost[] = [
  {
    id: 'user-1',
    userName: 'Sarah Chen',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    userLevel: 8,
    caption: 'OMG! Found this amazing coffee deal at Cafe Amazon ☕ Buy 2 get 3rd free! The barista said it\'s valid until end of month. Rushing back tomorrow!',
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop',
    location: 'Cafe Amazon, Terminal 21',
    timeAgo: '30 mins ago',
    points: 50,
    helpful: 34,
    comments: 8
  },
  {
    id: 'user-2',
    userName: 'Mike Johnson',
    userAvatar: 'https://i.pravatar.cc/150?img=12',
    userLevel: 12,
    caption: 'PSA: Lotus\'s has 50% off on Japanese snacks right now! 🍘 The Pocky section is almost empty so hurry! I grabbed 10 boxes lol',
    imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&h=300&fit=crop',
    location: 'Lotus\'s Rama 4',
    timeAgo: '1 hour ago',
    points: 50,
    helpful: 67,
    comments: 15
  },
  {
    id: 'user-3',
    userName: 'Lisa Wong',
    userAvatar: 'https://i.pravatar.cc/150?img=9',
    userLevel: 5,
    caption: 'Just had the best lunch deal ever! 🍜 Ramen + gyoza + drink for only 99฿ at Oishi Ramen. The queue was long but totally worth it!',
    imageUrl: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&h=300&fit=crop',
    location: 'Oishi Ramen, Central World',
    timeAgo: '2 hours ago',
    points: 50,
    helpful: 45,
    comments: 12
  },
  {
    id: 'user-4',
    userName: 'David Kim',
    userAvatar: 'https://i.pravatar.cc/150?img=15',
    userLevel: 15,
    caption: 'Students! Show your ID at McDonald\'s and get 30% off any meal! 🍔 I saved 50฿ today. Valid at all branches apparently.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    location: 'McDonald\'s Siam Square',
    timeAgo: '3 hours ago',
    points: 50,
    helpful: 89,
    comments: 23
  },
  {
    id: 'user-5',
    userName: 'Emma Rodriguez',
    userAvatar: 'https://i.pravatar.cc/150?img=20',
    userLevel: 10,
    caption: 'Beauty lovers! 🎀 Boots has 3 for 2 on all skincare. Just spent 2000฿ but saved 800฿! My skin will thank me later haha',
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop',
    location: 'Boots, EmQuartier',
    timeAgo: '5 hours ago',
    points: 50,
    helpful: 56,
    comments: 19
  },
  {
    id: 'user-6',
    userName: 'Tom Anderson',
    userAvatar: 'https://i.pravatar.cc/150?img=33',
    userLevel: 7,
    caption: 'Gym buddies! 💪 True Fitness has a crazy deal - 1 year membership for 9900฿ (normally 18000฿). Signed up today and feeling motivated!',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    location: 'True Fitness, Asok',
    timeAgo: '1 day ago',
    points: 50,
    helpful: 78,
    comments: 31
  }
];

// Legacy data - convert UserPost to CommunityPost format for backward compatibility
export const mockCommunityPosts: CommunityPost[] = mockUserPosts.map(post => ({
  id: post.id,
  userName: post.userName,
  userAvatar: post.userAvatar,
  caption: post.caption,
  imageUrl: post.imageUrl,
  location: post.location,
  timeAgo: post.timeAgo,
  points: post.points
}));
