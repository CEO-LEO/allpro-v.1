export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  isVerifiedBuyer: boolean;
  comment: string;
  photos: string[];
  helpful: number;
  timestamp: Date;
  dealValue?: string;
}

export interface ProductReviews {
  productId: string;
  averageRating: number;
  totalReviews: number;
  worthItCount: number;
  totalVotes: number;
  reviews: Review[];
  userPhotos: string[];
}

// Mock Review Data
export const reviewsDatabase: Record<string, ProductReviews> = {
  'lotus-003': {
    productId: 'lotus-003',
    averageRating: 4.3,
    totalReviews: 24,
    worthItCount: 87,
    totalVotes: 102,
    userPhotos: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
      'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400',
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400',
    ],
    reviews: [
      {
        id: 'rev-001',
        userId: 'user-101',
        userName: 'สมชาย ใจดี',
        userAvatar: 'https://i.pravatar.cc/150?img=12',
        rating: 5,
        isVerifiedBuyer: true,
        comment: 'ได้มาเยอะมากกกก! คุ้มสุดๆ ข้าวแน่น เนื้อเยอะ น้ำจิ้มอร่อย แนะนำเลย ภาพจริงตรงตามโฆษณา 100%',
        photos: [
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
          'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600'
        ],
        helpful: 23,
        timestamp: new Date('2026-02-02T14:30:00'),
        dealValue: 'ข้าวกระเพราหมู B1G1'
      },
      {
        id: 'rev-002',
        userId: 'user-102',
        userName: 'กานต์ สวยงาม',
        userAvatar: 'https://i.pravatar.cc/150?img=45',
        rating: 4,
        isVerifiedBuyer: true,
        comment: 'โอเคเลย รสชาติดี แต่ต้องไปแต่เช้าถึงจะได้แบบสดๆ ถ้าไปบ่ายอาจจะเหลือแต่ของเย็น',
        photos: ['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600'],
        helpful: 15,
        timestamp: new Date('2026-02-01T11:20:00'),
        dealValue: 'ข้าวกระเพราหมู B1G1'
      },
      {
        id: 'rev-003',
        userId: 'user-103',
        userName: 'วิชัย รักเที่ยว',
        userAvatar: 'https://i.pravatar.cc/150?img=33',
        rating: 2,
        isVerifiedBuyer: true,
        comment: 'เล็กกว่าในรูปเยอะเลย... หวังว่าจะได้จานใหญ่แต่ได้จานเล็กมา เนื้อก็น้อยกว่าที่คิด อาจจะไม่คุ้มสำหรับผม',
        photos: [
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600'
        ],
        helpful: 8,
        timestamp: new Date('2026-01-31T16:45:00'),
        dealValue: 'ข้าวกระเพราหมู B1G1'
      },
      {
        id: 'rev-004',
        userId: 'user-104',
        userName: 'มาลี ช้อปรัก',
        userAvatar: 'https://i.pravatar.cc/150?img=26',
        rating: 5,
        isVerifiedBuyer: false,
        comment: 'เพื่อนชวนมาลอง อร่อยดีค่ะ ราคาถูกด้วย พนักงานบริการดีมาก จะกลับมาอีกแน่นอน',
        photos: [],
        helpful: 6,
        timestamp: new Date('2026-01-30T12:10:00'),
        dealValue: 'ข้าวกระเพราหมู B1G1'
      },
      {
        id: 'rev-005',
        userId: 'user-105',
        userName: 'ธนา กินเก่ง',
        userAvatar: 'https://i.pravatar.cc/150?img=51',
        rating: 4,
        isVerifiedBuyer: true,
        comment: 'สั่ง 2 ที่ พี่แกหนึ่งผมหนึ่ง อิ่มมากครับ เผ็ดจี๊ดดด แต่อร่อย ใครชอบเผ็ดแนะนำ',
        photos: ['https://images.unsplash.com/photo-1547592180-85f173990554?w=600'],
        helpful: 12,
        timestamp: new Date('2026-01-29T13:25:00'),
        dealValue: 'ข้าวกระเพราหมู B1G1'
      }
    ]
  },
  'big-c-007': {
    productId: 'big-c-007',
    averageRating: 3.8,
    totalReviews: 15,
    worthItCount: 58,
    totalVotes: 78,
    userPhotos: [
      'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400',
      'https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=400',
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400',
    ],
    reviews: [
      {
        id: 'rev-101',
        userId: 'user-201',
        userName: 'ปิยะ ช้อปเก่ง',
        userAvatar: 'https://i.pravatar.cc/150?img=14',
        rating: 4,
        isVerifiedBuyer: true,
        comment: 'ของสดดี ราคาถูก เดินทางสะดวก มีจอดรถเยอะ',
        photos: ['https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600'],
        helpful: 5,
        timestamp: new Date('2026-02-02T10:15:00')
      }
    ]
  }
};

// Helper function to get reviews for a product
export const getProductReviews = (productId: string): ProductReviews | null => {
  return reviewsDatabase[productId] || null;
};

// Helper to check if user can review (mock - check if they've used voucher)
export const canUserReview = (productId: string): boolean => {
  // In real app, check if user has redeemed/scanned voucher
  return true; // Mock: allow all users for demo
};

// Mock vote handler
export const voteWorthIt = (productId: string, isWorthIt: boolean): boolean => {
  const reviews = reviewsDatabase[productId];
  if (!reviews) return false;

  // Check if user already voted
  const hasVoted = localStorage.getItem(`voted_${productId}`);
  if (hasVoted) return false;

  // Update counts
  reviews.totalVotes += 1;
  if (isWorthIt) {
    reviews.worthItCount += 1;
  }

  // Save vote
  localStorage.setItem(`voted_${productId}`, isWorthIt ? 'yes' : 'no');
  
  return true;
};

// Check if user has voted
export const getUserVote = (productId: string): 'yes' | 'no' | null => {
  const vote = localStorage.getItem(`voted_${productId}`);
  return vote as 'yes' | 'no' | null;
};

// Mark review as helpful
export const markReviewHelpful = (reviewId: string, productId: string): boolean => {
  const reviews = reviewsDatabase[productId];
  if (!reviews) return false;

  const review = reviews.reviews.find(r => r.id === reviewId);
  if (!review) return false;

  // Check if already marked
  const hasMarked = localStorage.getItem(`helpful_${reviewId}`);
  if (hasMarked) return false;

  review.helpful += 1;
  localStorage.setItem(`helpful_${reviewId}`, 'true');
  
  return true;
};
