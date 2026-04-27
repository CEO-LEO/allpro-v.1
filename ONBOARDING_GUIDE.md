# 🎯 Onboarding & Viral Growth System

## Overview

This system implements **First-Time User Experience (FTUE)** and **Viral Sharing Mechanics** to ensure:
- ✅ New users understand the app immediately
- ✅ Users share achievements naturally
- ✅ Empty states guide users instead of confusing them
- ✅ Viral loops drive organic growth

---

## 📁 File Structure

```
components/
  ├── Onboarding/
  │   └── WelcomeTour.tsx          # 3-slide onboarding carousel
  └── Common/
      ├── ShareModal.tsx           # Instagram Story-style share cards
      └── EmptyState.tsx           # Beautiful empty states
app/
  └── onboarding-demo/
      └── page.tsx                 # Testing playground
```

---

## 👋 Welcome Tour (FTUE)

### Features

**File:** `components/Onboarding/WelcomeTour.tsx`

- Full-screen overlay with swipeable carousel
- 3 slides: Welcome → AI → Gamification
- Animated emojis and visuals (Framer Motion)
- Auto-triggers ONLY on first visit (localStorage check)
- Skip button (respects user time)
- Confetti celebration on completion
- Mobile-optimized (touch-friendly)

### Slides Breakdown

#### Slide 1: Welcome
- **Emoji:** 👋
- **Title:** "Hunter, Welcome to the Arena!"
- **Visual:** Animated store/gift/money icons
- **Message:** Welcome to the best promo hunting platform

#### Slide 2: AI Chatbot
- **Emoji:** 🤖
- **Title:** "Don't Search. Just Ask."
- **Visual:** Chat bubbles showing AI interaction
- **Message:** Don't waste time searching, use AI

#### Slide 3: Gamification
- **Emoji:** 🏆
- **Title:** "Play & Earn. Get Free Food."
- **Visual:** Badge grid + points counter
- **Message:** Collect badges, level up, get rewards

### Usage

**Auto-trigger on first visit:**

```tsx
// app/layout.tsx or app/page.tsx
import WelcomeTour from '@/components/Onboarding/WelcomeTour';

export default function Layout({ children }) {
  return (
    <>
      <WelcomeTour />
      {children}
    </>
  );
}
```

**Manual trigger (e.g., "Show Tutorial" button):**

```tsx
const handleShowTutorial = () => {
  localStorage.removeItem('hasSeenTutorial');
  // Component will auto-detect and show on next render
  window.location.reload();
};
```

### Customization

**Change slides:**

```tsx
const SLIDES: Slide[] = [
  {
    id: 1,
    emoji: '🎉',
    title: 'Your Custom Title',
    description: 'Your custom description',
    visual: 'hero', // 'hero' | 'ai' | 'badges'
  },
  // Add more slides...
];
```

**Change localStorage key:**

```tsx
const TUTORIAL_KEY = 'my-app-tutorial-seen'; // Default: 'hasSeenTutorial'
```

---

## 📱 Smart Share Cards

### Features

**File:** `components/Common/ShareModal.tsx`

- Instagram Story-style cards (9:16 aspect ratio)
- Auto-generates shareable images (html2canvas)
- 3 card types: Deal, Badge, Level
- Native share (Web Share API)
- Download as PNG fallback
- Copy link option
- Optimized for social media

### Card Types

#### 1. Deal Card
**Use Case:** Share amazing deals

```tsx
<ShareModal
  isOpen={true}
  onClose={() => {}}
  type="deal"
  data={{
    title: 'Sushi Buffet Premium',
    description: 'All-you-can-eat sushi',
    price: '฿299',
    originalPrice: '฿599',
  }}
/>
```

**Visual:**
- 🎁 Gift emoji
- Deal title
- Price comparison (original vs sale)
- "Found on IAMROOT AI" footer

#### 2. Badge Card
**Use Case:** Share achievement unlocks

```tsx
<ShareModal
  isOpen={true}
  onClose={() => {}}
  type="badge"
  data={{
    badgeName: 'Legendary Slayer',
    badgeEmoji: '👑',
  }}
/>
```

**Visual:**
- Badge emoji (large)
- "Achievement Unlocked!" text
- Badge name
- Rarity indicator (Epic/Legendary)

#### 3. Level Card
**Use Case:** Share level-ups

```tsx
<ShareModal
  isOpen={true}
  onClose={() => {}}
  type="level"
  data={{
    level: 25,
    rankTitle: 'Legendary Slayer',
    points: 34000,
  }}
/>
```

**Visual:**
- ⚡ Lightning emoji
- "Level Up!" text
- Level number (large)
- Rank title
- Points counter

### Integration Examples

**Product Detail Page (Share Deal):**

```tsx
import { useState } from 'react';
import ShareModal from '@/components/Common/ShareModal';
import { Share2 } from 'lucide-react';

export default function ProductPage({ product }) {
  const [shareModal, setShareModal] = useState({ isOpen: false });

  const handleShare = () => {
    setShareModal({
      isOpen: true,
      type: 'deal',
      data: {
        title: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
      },
    });
  };

  return (
    <>
      <button onClick={handleShare} className="btn-secondary">
        <Share2 className="w-5 h-5" />
        แชร์
      </button>

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false })}
        type="deal"
        data={shareModal.data}
      />
    </>
  );
}
```

**Profile Page (Share Badge):**

```tsx
import { useGamification } from '@/hooks/useGamification';

export default function ProfilePage() {
  const { getUnlockedBadges } = useGamification();
  const [shareModal, setShareModal] = useState({ isOpen: false });

  const handleShareBadge = (badge) => {
    setShareModal({
      isOpen: true,
      type: 'badge',
      data: {
        badgeName: badge.name,
        badgeEmoji: badge.icon,
      },
    });
  };

  return (
    <div>
      {getUnlockedBadges().map((badge) => (
        <div key={badge.id} onClick={() => handleShareBadge(badge)}>
          {badge.icon} {badge.name}
        </div>
      ))}

      <ShareModal {...shareModal} />
    </div>
  );
}
```

**Level Up Event (Auto-share prompt):**

```tsx
// In useGamification.ts - checkLevelUp function
const checkLevelUp = (newPoints) => {
  if (levelData.level > level) {
    // Show level-up notification
    toast.success('Level Up!', {
      action: {
        label: 'แชร์',
        onClick: () => {
          // Open share modal
          window.dispatchEvent(
            new CustomEvent('openShareModal', {
              detail: {
                type: 'level',
                data: {
                  level: levelData.level,
                  rankTitle: levelData.rankTitle,
                  points: newPoints,
                },
              },
            })
          );
        },
      },
    });
  }
};
```

### Share Rewards (Viral Loop)

**Reward users for sharing:**

```tsx
import { useGamification } from '@/hooks/useGamification';

const { earnPoints, incrementStat } = useGamification();

const handleShareSuccess = () => {
  // Award points for sharing
  earnPoints('SHARE_DEAL'); // +25 points
  incrementStat('dealsShared');
  
  toast.success('+25 แต้ม! ขอบคุณที่แชร์!');
};
```

---

## 📭 Empty States

### Features

**File:** `components/Common/EmptyState.tsx`

- 4 types: Wallet, Chat, Notifications, Badges
- Animated illustrations
- Clear call-to-action buttons
- Guides users to take action
- Beautiful design (no blank pages)

### Types

#### 1. Wallet Empty
**Use Case:** No coupons saved yet

```tsx
import EmptyState from '@/components/Common/EmptyState';

{coupons.length === 0 ? (
  <EmptyState type="wallet" />
) : (
  <CouponList coupons={coupons} />
)}
```

**Visual:**
- 💸 Wallet emoji
- "กระเป๋าคุณยังว่างเปล่า..." (Your wallet is empty)
- "มาหาคูปองดีๆ กันเถอะ!" (Let's find some deals)
- Button: "หาดีล" → Links to homepage

#### 2. Chat Empty
**Use Case:** No chat history

```tsx
{messages.length === 0 ? (
  <EmptyState type="chat" />
) : (
  <ChatMessages messages={messages} />
)}
```

**Visual:**
- 🤖 Robot emoji
- "ฉันเหงา..." (I'm lonely)
- "ลองถามฉันเกี่ยวกับพิซซ่า ซูชิ หรืออะไรก็ได้!" (Ask me about pizza, sushi...)
- Button: "ทักทาย" → Trigger first message

#### 3. Notifications Empty
**Use Case:** No notifications yet

```tsx
{notifications.length === 0 ? (
  <EmptyState type="notifications" />
) : (
  <NotificationList />
)}
```

**Visual:**
- 🔔 Bell emoji
- "ยังไม่มีการแจ้งเตือน" (No notifications yet)
- Button: "สำรวจดีล" → Links to homepage

#### 4. Badges Empty
**Use Case:** No badges unlocked

```tsx
{badges.length === 0 ? (
  <EmptyState type="badges" />
) : (
  <BadgeGrid badges={badges} />
)}
```

**Visual:**
- 🏆 Trophy emoji
- "ยังไม่มี Badge" (No badges yet)
- Button: "เริ่มสะสม" → Links to gamification demo

### Customization

**Add new empty state type:**

```tsx
// In EmptyState.tsx
const config = {
  // ... existing types
  favorites: {
    icon: Heart,
    emoji: '❤️',
    title: 'No favorites yet',
    titleTH: 'ยังไม่มีรายการโปรด',
    subtitleTH: 'กดหัวใจเพื่อบันทึกดีลที่ชอบ',
    buttonTextTH: 'ค้นหาดีล',
    buttonHref: '/',
    buttonColor: 'from-red-500 to-pink-600',
  },
};
```

---

## 🧪 Testing

### Demo Page

Visit: **`http://localhost:3000/onboarding-demo`**

**Features:**
- Reset tutorial button
- Test all 3 share card types
- View all empty state variations
- Copy-paste integration code

### Manual Testing Checklist

**Welcome Tour:**
- [ ] Open app in incognito (first visit simulation)
- [ ] Tour auto-appears after 500ms
- [ ] Swipe between slides (or click next/prev)
- [ ] Skip button works
- [ ] "เริ่มล่า!" button closes tour + confetti
- [ ] Reopen app → Tour doesn't show again
- [ ] Click "Reset Tutorial" → Tour shows again

**Share Cards:**
- [ ] Click each share button (Deal, Badge, Level)
- [ ] Modal opens with preview
- [ ] Download image → PNG downloads
- [ ] Copy link → Success toast
- [ ] Share to Story → Native share or download fallback
- [ ] Test on mobile (Web Share API)
- [ ] Cards look good (9:16 aspect ratio)

**Empty States:**
- [ ] All 4 types render correctly
- [ ] Animations play smoothly
- [ ] Buttons link to correct pages
- [ ] Dark mode works
- [ ] Mobile responsive

---

## 🔌 Integration Checklist

Before deploying:

- [ ] Add `<WelcomeTour />` to root layout or homepage
- [ ] Add share buttons to product pages
- [ ] Add share buttons to profile/badges page
- [ ] Replace "No items" text with `<EmptyState />`
- [ ] Reward users for sharing (+25 points)
- [ ] Test native share on iOS/Android
- [ ] Test in incognito mode (first visit)
- [ ] Add share tracking (analytics)

---

## 📊 Viral Mechanics Strategy

### Growth Loops

**1. Achievement Sharing**
```
User unlocks badge → Share prompt → Friend sees card → Friend installs app
```

**2. Deal Discovery**
```
User finds amazing deal → Shares with friends → Friends save money → Friends join
```

**3. Level-Up Bragging**
```
User levels up → Shares achievement → Friends see rank → Friends compete
```

### Incentivization

**Reward Sharing:**
- +25 points per share (SHARE_DEAL action)
- Unlock "Social Butterfly" badge (5 referrals)
- Track referral links (add `?ref=userId` to URLs)

**Make Sharing Easy:**
- One-tap share buttons
- Pre-generated beautiful cards
- Native share (iOS/Android support)
- Download fallback (for Instagram Stories)

### Share Card Quality

**Why Users Actually Share:**
- ✅ Cards look professional (gradients, shadows)
- ✅ 9:16 aspect ratio (perfect for Stories)
- ✅ Personal achievement showcase
- ✅ Bragging rights (level/badges)
- ✅ Helping friends save money (deals)

---

## 🎨 Design Guidelines

### Welcome Tour

**Do:**
- Keep slides concise (max 3-4 slides)
- Use large emojis (attention-grabbing)
- Show actual features (not just marketing)
- Allow skipping (don't force completion)
- Celebrate completion (confetti)

**Don't:**
- Show on every visit (annoying)
- Use more than 5 slides (too long)
- Block critical actions (skip button essential)
- Use generic stock photos (emojis > photos)

### Share Cards

**Do:**
- Use high contrast (readable on all screens)
- Add branding (logo/app name)
- Use gradients (Instagram-style)
- Make text large (mobile-friendly)
- Include CTA (download app)

**Don't:**
- Overcrowd with text (keep simple)
- Use low-quality images
- Forget dark mode testing
- Make cards square (use 9:16)

### Empty States

**Do:**
- Add animation (makes it alive)
- Provide clear action (button)
- Use friendly language (no errors)
- Show what to do next (guidance)

**Don't:**
- Just say "Empty" (unhelpful)
- Use sad emojis (negative feeling)
- Leave users stuck (no CTA)
- Make it look broken (beautiful design)

---

## 🚀 Future Enhancements

### Referral System
```tsx
// Track who referred who
const referralCode = user.id.substring(0, 8);
const shareLink = `https://app.com?ref=${referralCode}`;

// Reward both users
if (newUser.referredBy) {
  earnPoints('REFER_FRIEND'); // +200 pts to referrer
  earnPoints('DAILY_LOGIN');  // +10 pts to new user
}
```

### A/B Testing
```tsx
// Test different onboarding flows
const variant = Math.random() > 0.5 ? 'short' : 'long';
const slides = variant === 'short' ? SHORT_SLIDES : LONG_SLIDES;

// Track which converts better
analytics.track('onboarding_completed', { variant });
```

### Share Analytics
```tsx
// Track share events
const handleShare = async (type: string) => {
  analytics.track('share_initiated', { type });
  
  // Show modal...
  
  analytics.track('share_completed', { 
    type, 
    method: 'native' | 'download' | 'copy' 
  });
};
```

### Personalized Tour
```tsx
// Show different tours based on user type
const userType = detectUserType(); // 'consumer' | 'merchant'
const slides = userType === 'merchant' ? MERCHANT_SLIDES : CONSUMER_SLIDES;
```

---

## 📞 Support

**Common Issues:**

**Tour not showing?**
- Check localStorage: `localStorage.getItem('hasSeenTutorial')`
- Clear and reload: `localStorage.removeItem('hasSeenTutorial')`

**Share not working on mobile?**
- Web Share API requires HTTPS
- Test on real device (not emulator)
- Fallback to download works on all browsers

**Images not generating?**
- Check html2canvas installation
- Ensure CORS enabled for images
- Test in production (not localhost)

---

**The onboarding and viral systems are now ready to convert and grow your user base! 🚀**
