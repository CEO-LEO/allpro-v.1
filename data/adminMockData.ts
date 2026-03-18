// Mock data for pending moderation posts
export interface PendingPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  imageUrl: string;
  caption: string;
  location: string;
  timestamp: string;
  points: number;
  category: 'good' | 'spam' | 'inappropriate';
  reportCount: number;
}

// TODO: Replace with API call -> GET /api/admin/posts/pending
export const pendingPosts: PendingPost[] = [];

export const getUserStats = (userId: string) => ({
  totalPosts: 0,
  approvedPosts: 0,
  rejectedPosts: 0,
  totalPoints: 0,
  accountAge: 'N/A',
  isBanned: false
});
