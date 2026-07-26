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

// Helper to check if user can review (mock - check if they've used voucher)
export const canUserReview = (productId: string): boolean => {
  // In real app, check if user has redeemed/scanned voucher
  return true; // Mock: allow all users for demo
};
