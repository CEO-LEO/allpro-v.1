# 📸 User Review System - Social Proof & Photo Evidence

## Overview
A comprehensive User-Generated Content (UGC) system that builds **social trust** through real customer photos and honest reviews, helping users make informed decisions before traveling to stores.

## ✨ Core Components

### 1. **Photo Gallery** (`PhotoGallery.tsx`)
Real customer photos with "Ad vs Reality" comparison.

#### Features:
- **Horizontal Scroll**: 6-12 user-submitted photos
- **Comparison Lightbox**: Split-screen view (Ad | Reality)
- **Navigation**: Arrow buttons for browsing multiple photos
- **Hover Effects**: Ring animation + scale on hover
- **Empty State**: Encourages first photo upload

#### UI Layout:
```
┌─────────────────────────────────────┐
│ 📷 ภาพจากทางบ้าน (12) Real Photos  │
├─────────────────────────────────────┤
│ [img] [img] [img] [img] [img] →     │ ← Horizontal scroll
└─────────────────────────────────────┘
         👆 Tap to compare
```

#### Lightbox View:
```
┌──────────────┬──────────────┐
│ 📸 ภาพโฆษณา │ ✨ ภาพจริง   │
│   Official   │  Customer    │
│     Ad       │    Photo     │
└──────────────┴──────────────┘
    Expectation vs Reality
```

### 2. **Reviews Section** (`Reviews.tsx`)
Complete review system with ratings, photos, and verification.

#### Features:
- **Star Rating**: 1-5 stars (yellow)
- **Verified Buyer Badge**: Green checkmark for voucher redeemers
- **Review Photos**: Attachable images (up to 3)
- **Helpful Voting**: "มีประโยชน์" button with counter
- **Write Review Modal**: Star picker + text + photo upload
- **Points Reward**: +10 points for first review

#### Review Card Layout:
```
┌─────────────────────────────────────┐
│ 👤 สมชาย ใจดี  ✓ Verified Buyer    │
│ ⭐⭐⭐⭐⭐ (5.0) • 2 Feb              │
│ ซื้อ: ข้าวกระเพราหมู B1G1           │
├─────────────────────────────────────┤
│ ได้มาเยอะมากกกก! คุ้มสุดๆ...       │
│ [photo] [photo]                     │
│ 👍 มีประโยชน์ (23)                  │
└─────────────────────────────────────┘
```

#### Write Review Modal:
```
┌─────────────────────────────────────┐
│ ✍️ เขียนรีวิว                       │
│ +10 Points reward                   │
├─────────────────────────────────────┤
│ ให้คะแนน: ☆ ☆ ☆ ☆ ☆               │
│                                     │
│ [Text area for comment]             │
│ (min 10 characters)                 │
│                                     │
│ 📷 [Upload Photo] (optional)        │
│                                     │
│ [ส่งรีวิวและรับ +10 Points]          │
└─────────────────────────────────────┘
```

### 3. **Worth It Meter** (`WorthItMeter.tsx`)
Quick binary voting system for fast decision-making.

#### Features:
- **Binary Vote**: 👍 คุ้ม | 👎 ผ่านก่อน
- **Percentage Bar**: Visual representation of votes
- **Color Coding**:
  - Green (≥80%): "คนส่วนใหญ่บอกว่าคุ้ม!"
  - Orange (60-79%): "ส่วนใหญ่ให้คะแนนดี"
  - Red (<60%): "ควรพิจารณาให้ดี"
- **Vote Tracking**: localStorage prevents duplicate votes
- **Confetti Animation**: Celebration for "Worth It" votes

#### Display:
```
┌─────────────────────────────────────┐
│ 📊 คุ้มไหม?          102 คน โหวต   │
├─────────────────────────────────────┤
│ Worth It Score            85%       │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░              │
│ 👍 87 คุ้ม            👎 15 ผ่าน   │
├─────────────────────────────────────┤
│ 🔥 คนส่วนใหญ่บอกว่าคุ้ม!            │
│ 85% ของผู้ใช้งานบอกว่า "คุ้ม"       │
├─────────────────────────────────────┤
│  [👍 คุ้ม!]    [👎 ผ่านก่อน]       │
└─────────────────────────────────────┘
```

## 📊 Mock Data Structure

### Review Interface:
```typescript
interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;              // 1-5
  isVerifiedBuyer: boolean;    // Has redeemed voucher
  comment: string;
  photos: string[];            // Up to 3 images
  helpful: number;             // Helpful votes count
  timestamp: Date;
  dealValue?: string;          // What they bought
}
```

### Product Reviews:
```typescript
interface ProductReviews {
  productId: string;
  averageRating: number;       // 4.3
  totalReviews: number;        // 24
  worthItCount: number;        // 87
  totalVotes: number;          // 102
  reviews: Review[];
  userPhotos: string[];        // Gallery photos
}
```

## 🎭 Mock Review Examples

### Positive Review (5 stars):
```typescript
{
  userName: 'สมชาย ใจดี',
  rating: 5,
  isVerifiedBuyer: true,
  comment: 'ได้มาเยอะมากกกก! คุ้มสุดๆ ข้าวแน่น เนื้อเยอะ...',
  photos: ['...', '...'],
  helpful: 23
}
```

### Negative Review (2 stars):
```typescript
{
  userName: 'วิชัย รักเที่ยว',
  rating: 2,
  isVerifiedBuyer: true,
  comment: 'เล็กกว่าในรูปเยอะเลย... อาจจะไม่คุ้มสำหรับผม',
  photos: ['small_portion.jpg'],
  helpful: 8
}
```

## 🔧 Integration Points

### Product Detail Page:
```tsx
import PhotoGallery from '@/components/Product/PhotoGallery';
import WorthItMeter from '@/components/Product/WorthItMeter';
import Reviews from '@/components/Product/Reviews';

// 1. Below Product Image
<PhotoGallery
  photos={userPhotos}
  officialImage={productImage}
  productName={title}
/>

// 2. After Party Finder
<WorthItMeter productId={id} />

// 3. Reviews Section
<Reviews productId={id} />
```

## 🎯 User Flows

### Flow 1: Browse Reviews
```
User lands on product page
    ↓
Sees "Worth It Meter" (85% say yes)
    ↓
Scrolls through photo gallery
    ↓
Clicks photo → Comparison lightbox
    ↓
Reads top 3 reviews
    ↓
Clicks "Show All Reviews"
    ↓
Finds helpful review → Votes "มีประโยชน์"
    ↓
Makes informed purchase decision
```

### Flow 2: Write Review
```
User redeems voucher
    ↓
Returns to product page
    ↓
Sees "เขียนรีวิว" button (active)
    ↓
Clicks → Review modal opens
    ↓
Selects star rating (1-5)
    ↓
Types comment (min 10 chars)
    ↓
(Optional) Upload photo
    ↓
Submits → Gets +10 points
    ↓
Confetti + Toast notification
```

### Flow 3: Quick Vote
```
User scrolling product page
    ↓
Sees "Worth It Meter"
    ↓
Reads: "85% say Worth It"
    ↓
Clicks [👍 คุ้ม!]
    ↓
Confetti animation
    ↓
Vote saved to localStorage
    ↓
Button changes to "โหวตแล้ว"
```

## 🛡️ Anti-Fake Review Features

### 1. Verified Buyer Badge
- **Requirement**: User must have redeemed voucher
- **Visual**: Green checkmark + "Verified Buyer" label
- **Trust Signal**: Highlights legitimate reviews

### 2. Review Gating
- **Write Review Button**: Only active if `isVerifiedBuyer = true`
- **Mock Check**: `canUserReview(productId)` function
- **Production**: Check against redemption database

### 3. Photo Evidence
- **Requirement**: At least 1 photo for credibility
- **Comparison**: Side-by-side with official ad
- **Reality Check**: Users can spot mismatches

### 4. Helpful Voting
- **Community Moderation**: Users upvote useful reviews
- **Sort by Helpful**: Most voted appear first
- **Spam Prevention**: One vote per review per user

## 📱 Responsive Design

### Mobile (< 640px):
- Single column layout
- Horizontal scroll photo gallery
- Stacked review cards
- Touch-optimized buttons

### Tablet (640-1024px):
- 2-column comparison in lightbox
- Grid layout for photos
- Expanded review cards

### Desktop (> 1024px):
- Full split-screen lightbox
- Masonry photo layout
- Side-by-side voting buttons

## 🎨 Visual Design

### Color Coding:
```
Ratings:
- 5 stars: Green (#10b981)
- 4 stars: Light green
- 3 stars: Yellow (#fbbf24)
- 2 stars: Orange (#f59e0b)
- 1 star: Red (#ef4444)

Verified Badge: Green (#10b981)
Worth It ≥80%: Green gradient
Worth It 60-79%: Orange gradient
Worth It <60%: Red gradient
```

### Typography:
```
Review Author: font-bold 16px
Review Text: font-normal 14px line-height-relaxed
Rating Stars: 20px (mobile), 24px (desktop)
Worth It Score: font-black 48px
```

## 🔄 State Management

### LocalStorage Keys:
```typescript
'voted_{productId}'           // User's vote (yes/no)
'helpful_{reviewId}'          // Marked helpful
'review_draft_{productId}'    // Draft review text
```

### React State:
```typescript
const [reviewData, setReviewData] = useState<ProductReviews | null>(null);
const [showAllReviews, setShowAllReviews] = useState(false);
const [selectedImage, setSelectedImage] = useState<string | null>(null);
const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null);
```

## 📈 Analytics Tracking (Future)

Track these events:
```typescript
// Photo Gallery
'photo_viewed'           // User clicks photo
'comparison_opened'      // Lightbox opened
'photo_browsed'          // Navigated photos

// Reviews
'review_read'            // User read full review
'review_helpful_voted'   // Voted helpful
'review_written'         // Submitted review
'review_photo_uploaded'  // Attached photo

// Worth It
'worth_it_voted'         // User voted
'worth_it_percentage'    // Final percentage
```

## 🚀 Future Enhancements

- [ ] **Photo Upload**: Real image upload to cloud storage
- [ ] **Review Moderation**: Admin approval system
- [ ] **Review Replies**: Merchant can respond
- [ ] **Sort/Filter**: By rating, date, helpful, verified
- [ ] **Report Review**: Flag inappropriate content
- [ ] **Review Templates**: Quick review prompts
- [ ] **Photo Tags**: Tag specific aspects (portion size, quality)
- [ ] **Review Summary**: AI-generated key points
- [ ] **Sentiment Analysis**: Auto-detect tone
- [ ] **Review Rewards**: Tiered points for quality reviews

## 🎯 Key Metrics

### Success Indicators:
- **Review Submission Rate**: >5% of buyers write reviews
- **Photo Upload Rate**: >30% of reviews include photos
- **Worth It Participation**: >20% of viewers vote
- **Helpful Vote Rate**: >10% of reviews get votes
- **Verified Buyer %**: >80% of reviews are verified

### Quality Indicators:
- **Average Review Length**: >50 characters
- **Photo Quality**: Clear, well-lit images
- **Review Diversity**: Mix of positive/negative
- **Helpfulness Score**: >3 votes average

## 🧪 Testing Instructions

### Test Flow 1: Photo Gallery
1. Go to product page: [http://localhost:3000/promo/lotus-003](http://localhost:3000/promo/lotus-003)
2. Scroll to "ภาพจากทางบ้าน" section
3. Click any photo
4. See split-screen comparison (Ad | Reality)
5. Use arrow buttons to browse photos
6. Close lightbox

### Test Flow 2: Write Review
1. On product page, click "เขียนรีวิว" button
2. Rate 5 stars
3. Type comment: "ทดสอบรีวิว อร่อยมาก คุ้มสุดๆ ได้มาเยอะมาก"
4. (Optional) Click photo upload
5. Submit → See +10 points toast
6. Confetti animation

### Test Flow 3: Worth It Vote
1. Scroll to "คุ้มไหม?" meter
2. See current percentage (e.g., 85%)
3. Click [👍 คุ้ม!]
4. See confetti + success toast
5. Button changes to "โหวตแล้ว"
6. Refresh page → Vote persists

### Test Flow 4: Helpful Vote
1. Read any review
2. Click "มีประโยชน์" button
3. Counter increases +1
4. Button changes to "โหวตแล้ว"
5. Try clicking again → Error toast

## 📊 Mock Data Coverage

### Products with Reviews:
```typescript
'lotus-003': {
  averageRating: 4.3,
  totalReviews: 24,
  worthItCount: 87,
  totalVotes: 102,
  userPhotos: 12 photos,
  reviews: 5 detailed reviews
}

'big-c-007': {
  averageRating: 3.8,
  totalReviews: 15,
  worthItCount: 58,
  totalVotes: 78,
  reviews: 1 review
}
```

### Review Personas:
1. **สมชาย ใจดี**: Super positive (5⭐), verified, 2 photos, 23 helpful
2. **กานต์ สวยงาม**: Positive with caveat (4⭐), verified, 1 photo
3. **วิชัย รักเที่ยว**: Critical (2⭐), verified, 2 comparison photos
4. **มาลี ช้อปรัก**: Friend recommendation (5⭐), unverified, no photos
5. **ธนา กินเก่ง**: Good experience (4⭐), verified, 1 photo

## 🎉 Result

**Social Trust Built Through:**
- ✅ Real customer photos (not stock images)
- ✅ Ad vs Reality comparison (transparency)
- ✅ Verified buyer badges (authenticity)
- ✅ Binary voting (quick feedback)
- ✅ Community moderation (helpful votes)
- ✅ Points incentive (+10 for reviews)
- ✅ Visual proof (photo evidence)

**Users can now confidently decide** if a deal is worth traveling to the store! 🛡️
