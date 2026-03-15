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

export const pendingPosts: PendingPost[] = [
  {
    id: 'post-001',
    userId: 'user-123',
    userName: 'Sarah Wilson',
    userAvatar: 'SW',
    imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
    caption: 'Amazing deal at 7-Eleven! Got this energy drink 2 for 1. Totally recommend! 🔥',
    location: 'Siam Square, Bangkok',
    timestamp: '2 mins ago',
    points: 50,
    category: 'good',
    reportCount: 0
  },
  {
    id: 'post-002',
    userId: 'user-456',
    userName: 'Mike Thompson',
    userAvatar: 'MT',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    caption: 'NIVEA cream is back in stock! Found at Central Ladprao. Great price! 💆‍♀️',
    location: 'Central Ladprao, Bangkok',
    timestamp: '15 mins ago',
    points: 50,
    category: 'good',
    reportCount: 0
  },
  {
    id: 'post-003',
    userId: 'user-789',
    userName: 'Spam Bot 2000',
    userAvatar: 'SB',
    imageUrl: 'https://via.placeholder.com/800x800?text=BUY+CHEAP+WATCHES',
    caption: '🚨 CLICK HERE FOR FREE iPHONE 15!!! 🚨 www.scamsite.fake LIMITED TIME!!! 💰💰💰',
    location: 'Unknown',
    timestamp: '1 hour ago',
    points: 50,
    category: 'spam',
    reportCount: 8
  },
  {
    id: 'post-004',
    userId: 'user-321',
    userName: 'Lisa Chang',
    userAvatar: 'LC',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    caption: 'Grabbed this snack combo at Makro. Perfect for movie night! 🍿🎬',
    location: 'Mega Bangna, Bangkok',
    timestamp: '2 hours ago',
    points: 50,
    category: 'good',
    reportCount: 0
  },
  {
    id: 'post-005',
    userId: 'user-999',
    userName: 'Troll Account',
    userAvatar: 'TA',
    imageUrl: 'https://via.placeholder.com/800x800?text=OFFENSIVE+CONTENT',
    caption: '[INAPPROPRIATE CONTENT DETECTED] Offensive language and harassment',
    location: 'Unknown',
    timestamp: '3 hours ago',
    points: 50,
    category: 'inappropriate',
    reportCount: 15
  }
];

export const getUserStats = (userId: string) => ({
  totalPosts: Math.floor(Math.random() * 50) + 5,
  approvedPosts: Math.floor(Math.random() * 40) + 3,
  rejectedPosts: Math.floor(Math.random() * 5),
  totalPoints: Math.floor(Math.random() * 2000) + 100,
  accountAge: `${Math.floor(Math.random() * 12) + 1} months`,
  isBanned: false
});
