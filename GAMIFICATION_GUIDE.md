# 🎮 Gamification System Guide

## Overview

The Golden Hunter app features a complete gamification engine designed to make users **addicted to hunting deals**. This system includes:

- ✅ **Points System** (XP-based progression)
- ✅ **50 Levels** with automatic rank upgrades
- ✅ **8 Unlockable Badges** (Common → Legendary rarity)
- ✅ **Daily Login Streaks** with bonus rewards
- ✅ **Visual Feedback** (Toast notifications + Confetti celebrations)
- ✅ **Persistent Progress** (Saved to localStorage)
- ✅ **Real-time UI Updates** (Animated counters)

---

## 📁 File Structure

```
store/
  └── useUserStore.ts          // Zustand store for user state
hooks/
  └── useGamification.ts       // Main gamification logic
components/
  ├── PointsCounter.tsx        // Header bar points display
  └── ProfileProgress.tsx      // Profile page progress UI
app/
  └── gamification-demo/
      └── page.tsx             // Test playground
```

---

## 🎯 Point System

### Action Values

| Action | Points | Trigger |
|--------|--------|---------|
| Daily Login | +10 | Auto (once per day) |
| Scan QR Code | +50 | User scans promo QR |
| Write Review | +100 | User posts review |
| Refer Friend | +200 | Friend signs up |
| Share Deal | +25 | User shares promo |
| Complete Profile | +150 | Profile 100% complete |
| Upgrade to PRO | +500 | Purchase PRO subscription |

### Usage in Components

```tsx
import { useGamification } from '@/hooks/useGamification';

function MyComponent() {
  const { earnPoints, incrementStat } = useGamification();

  const handleQRScan = () => {
    // Award points + update stats
    earnPoints('SCAN_QR');
    incrementStat('scans');
    
    // This will:
    // ✅ Add 50 points
    // ✅ Show toast: "+50 แต้ม!"
    // ✅ Trigger confetti animation
    // ✅ Check for level up
    // ✅ Check for badge unlocks
  };

  return (
    <button onClick={handleQRScan}>
      Scan QR Code
    </button>
  );
}
```

---

## 📊 Level System

### Level Thresholds

| Level Range | Rank Title | Points Required |
|-------------|-----------|-----------------|
| 1-5 | **Novice Hunter** | 0 - 1,000 |
| 6-20 | **Pro Hunter** | 1,500 - 19,000 |
| 21-50 | **Legendary Slayer** | 21,000 - 200,000 |

### Progression Example

```
Level 1:  0 points      → Novice Hunter
Level 2:  100 points    → Novice Hunter
Level 5:  1,000 points  → Novice Hunter
Level 6:  1,500 points  → Pro Hunter (RANK UP! 🎉)
Level 20: 19,000 points → Pro Hunter
Level 21: 21,000 points → Legendary Slayer (RANK UP! 👑)
Level 50: 200,000 points → Max Level
```

### Auto Level-Up Behavior

When a user earns enough points:
1. ✅ Level increments automatically
2. ✅ Rank title updates
3. ✅ Toast notification: "🎉 เลื่อนระดับเป็น Level X!"
4. ✅ Epic confetti explosion (150 particles)
5. ✅ Sound effect hook ready (optional)

---

## 🏆 Badge System

### All Badges

| Badge ID | Icon | Name | Condition | Rarity |
|----------|------|------|-----------|--------|
| `7-eleven-slayer` | 🏪 | 7-11 Slayer | Scan 10 QR codes | Common |
| `scan-master` | 📱 | Scan Master | Scan 50 QR codes | Rare |
| `review-expert` | ⭐ | Review Expert | Write 10 reviews | Rare |
| `social-butterfly` | 🦋 | Social Butterfly | Refer 5 friends | Epic |
| `early-bird` | 🌅 | Early Bird | Login 7 days in a row | Rare |
| `deal-hunter-pro` | 👑 | Deal Hunter PRO | Upgrade to PRO | Legendary |
| `sharing-is-caring` | 💝 | Sharing is Caring | Share 20 deals | Epic |
| `completionist` | 🏆 | Completionist | Unlock 5 badges | Legendary |

### Badge Unlock Behavior

```tsx
// Automatically checked after earning points
// No manual trigger needed!

// When unlocked:
1. ✅ Badge added to user.badges[]
2. ✅ Toast: "🏆 Achievement Unlocked! - 7-11 Slayer"
3. ✅ Confetti (for Epic+ rarity)
4. ✅ Visual border color based on rarity
```

### Rarity System

- **Common** (Gray): Basic achievements
- **Rare** (Blue): Moderate effort required
- **Epic** (Purple): Significant commitment + Confetti
- **Legendary** (Gold): Ultimate goals + Confetti + Glow effect

---

## 🔥 Daily Login Streak

### Auto-Trigger on App Launch

```tsx
// Runs automatically in useGamification
useEffect(() => {
  const lastCheck = localStorage.getItem('last-daily-check');
  const today = new Date().toDateString();

  if (lastCheck !== today) {
    updateStreak();
    incrementStat('dailyLogins');
    earnPoints('DAILY_LOGIN'); // +10 points
    localStorage.setItem('last-daily-check', today);

    if (currentStreak > 1) {
      toast.success(`🔥 Login Streak: ${currentStreak} วันติดต่อกัน!`);
    }
  }
}, []);
```

### Streak Logic

- **Day 1**: Streak = 1
- **Day 2** (consecutive): Streak = 2
- **Day 3** (consecutive): Streak = 3
- **Skip a day**: Streak resets to 1
- **Record**: `longestStreak` tracks personal best

---

## 🎨 Visual Components

### 1. PointsCounter (Header Bar)

**File:** `components/PointsCounter.tsx`

**Features:**
- Animated points number (scales up when increased)
- Level badge (white circle)
- Rank title below points
- Progress ring (shows % to next level)
- Golden gradient background
- Glassmorphism effect

**Usage:**
```tsx
import PointsCounter from '@/components/PointsCounter';

<header className="glass-auto">
  <PointsCounter />
</header>
```

### 2. ProfileProgress (Profile Page)

**File:** `components/ProfileProgress.tsx`

**Features:**
- Level & Rank card with gradient text
- Animated progress bar with shimmer effect
- Badge grid (4 columns)
- Rarity-based badge styling
- Locked badge placeholders (🔒)
- Auto dark mode support

**Usage:**
```tsx
import ProfileProgress from '@/components/ProfileProgress';

<div className="profile-page">
  <ProfileProgress />
</div>
```

---

## 🧪 Testing

### Demo Page

Visit: **`http://localhost:3000/gamification-demo`**

**Features:**
- Click action buttons to test point earning
- See real-time updates to level/rank
- Watch badge unlocks happen
- Test all visual feedback
- View live stats

### Manual Testing Checklist

- [ ] Click "Scan QR Code" 10 times → Unlock "7-11 Slayer" badge
- [ ] Click "Write Review" 10 times → Unlock "Review Expert" badge
- [ ] Earn 100 points → Level up to Level 2
- [ ] Earn 1,500 points → Level up to Level 6 + Rank up to "Pro Hunter"
- [ ] Login on consecutive days → See streak counter increase
- [ ] Close/reopen browser → Verify progress persists
- [ ] Test dark mode → Verify all components adapt

---

## 🔌 Integration Guide

### Step 1: Add Toaster to Root Layout

**File:** `app/layout.tsx`

```tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Toaster position="top-center" richColors />
        {children}
      </body>
    </html>
  );
}
```

### Step 2: Add PointsCounter to Header

**File:** `components/Header.tsx`

```tsx
import PointsCounter from '@/components/PointsCounter';

export default function Header() {
  return (
    <header className="glass-auto">
      <div className="container-responsive">
        <div className="flex items-center justify-between">
          <Logo />
          <PointsCounter /> {/* Add this */}
        </div>
      </div>
    </header>
  );
}
```

### Step 3: Trigger Points in Features

**QR Scanner:**
```tsx
import { useGamification } from '@/hooks/useGamification';

function QRScanner() {
  const { earnPoints, incrementStat } = useGamification();

  const handleScan = (qrData: string) => {
    // Process QR...
    earnPoints('SCAN_QR');
    incrementStat('scans');
  };

  return <Scanner onScan={handleScan} />;
}
```

**Review Form:**
```tsx
const handleSubmitReview = async () => {
  await submitReview(reviewData);
  
  // Award points
  earnPoints('WRITE_REVIEW');
  incrementStat('reviews');
};
```

**Share Button:**
```tsx
const handleShare = async () => {
  await navigator.share({...});
  
  // Award points
  earnPoints('SHARE_DEAL');
  incrementStat('dealsShared');
};
```

**PRO Upgrade:**
```tsx
const handleUpgrade = async () => {
  await purchasePRO();
  
  // Big reward!
  earnPoints('UPGRADE_PRO');
  incrementStat('proPurchases');
};
```

---

## 🎵 Sound Effects (Optional)

### Setup (Future Enhancement)

```tsx
// utils/sounds.ts
const sounds = {
  'level-up': new Audio('/sounds/level-up.mp3'),
  'badge-unlock': new Audio('/sounds/badge.mp3'),
  'points-earn': new Audio('/sounds/points.mp3'),
};

export const playSound = (soundId: keyof typeof sounds) => {
  sounds[soundId]?.play();
};
```

### Integration Hooks

In `hooks/useGamification.ts`, uncomment:
```tsx
// import { playSound } from '@/utils/sounds';

// Level up:
// playSound('level-up');

// Badge unlock:
// playSound('badge-unlock');

// Points earned:
// playSound('points-earn');
```

---

## 📦 State Management

### Zustand Store (`store/useUserStore.ts`)

```tsx
export interface UserState {
  // Identity
  userId: string;
  displayName: string;
  avatar?: string;
  
  // Gamification
  points: number;
  level: number;
  rankTitle: string;
  badges: string[];
  stats: {
    scans: number;
    reviews: number;
    referrals: number;
    dailyLogins: number;
    dealsShared: number;
    proPurchases: number;
  };
  
  // Streaks
  lastLoginDate: string | null;
  currentStreak: number;
  longestStreak: number;
}
```

### Persistence

- **Engine**: Zustand Persist Middleware
- **Storage**: localStorage
- **Key**: `golden-hunter-user`
- **Behavior**: Auto-save on every state change
- **Hydration**: Auto-restore on app load

---

## 🎯 Gamification Psychology

### Engagement Hooks

1. **Variable Rewards**: Different actions = Different point values
2. **Progress Visibility**: Always show % to next level
3. **Instant Gratification**: Toast + Confetti on every action
4. **Collection Mechanic**: Badge grid with locked placeholders
5. **Social Proof**: Rank titles make users feel elite
6. **Loss Aversion**: Streak counter encourages daily returns
7. **Achievement Unlocks**: Surprise "Achievement Unlocked!" moments
8. **Scarcity**: Legendary badges are rare (only 2/8)

### Retention Strategy

- **Daily Login Bonus**: +10 points every day
- **Streak System**: Users don't want to "break" their streak
- **Badge Progress**: "Just 3 more scans to unlock 7-11 Slayer!"
- **Level Milestones**: "Only 50 points until Level 7!"

---

## 🚀 Future Enhancements

### Leaderboard
```tsx
// Global leaderboard
const topUsers = await getTopUsersByPoints(10);

// Friends leaderboard
const friends = await getFriendRankings(userId);
```

### Challenges
```tsx
// Weekly challenges
{
  id: 'week-12',
  title: 'Scan 50 QR Codes',
  reward: 1000,
  deadline: '2026-02-10',
}
```

### Seasonal Events
```tsx
// Double points during holidays
if (isValentinesDay) {
  earnPoints('SHARE_DEAL', 50); // 2x points
}
```

### NFT Badges (Web3)
```tsx
// Mint legendary badges as NFTs
const mintBadge = async (badgeId: string) => {
  const nft = await contract.mint(badgeId);
  return nft.tokenId;
};
```

---

## 🐛 Troubleshooting

### Points not updating?
- Check console for errors
- Verify Toaster is in layout
- Ensure localStorage is enabled

### Badges not unlocking?
- Check stats in demo page
- Verify condition in `BADGES` array
- Test in demo page first

### Level stuck at 1?
- Click "Scan QR Code" 2 times (100 points)
- Should auto-level to Level 2

### Progress bar not animating?
- Check Framer Motion is installed
- Verify no CSS conflicts
- Test in Chrome DevTools

---

## 📞 Support

For questions or issues:
1. Check demo page: `/gamification-demo`
2. Review console logs
3. Check localStorage: `golden-hunter-user`
4. Test in clean browser session

---

## ✅ Integration Checklist

Before deploying:

- [ ] Install dependencies (`sonner`, `zustand`)
- [ ] Add Toaster to root layout
- [ ] Add PointsCounter to header
- [ ] Add ProfileProgress to profile page
- [ ] Trigger `earnPoints()` in all features
- [ ] Test daily login on consecutive days
- [ ] Test badge unlocks
- [ ] Test level-up animations
- [ ] Test localStorage persistence
- [ ] Test dark mode compatibility

---

**The gamification system is now ready to make users addicted to hunting deals! 🎮🔥**
