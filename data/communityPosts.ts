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
// TODO: Replace with API call -> GET /api/posts/brand
export const mockBrandPosts: BrandPost[] = [];

// User Posts - Posts from community members
// TODO: Replace with API call -> GET /api/posts/user
export const mockUserPosts: UserPost[] = [];

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
