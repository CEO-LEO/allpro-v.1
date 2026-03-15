# 👤 User Guide - How to Use All Pro

Complete guide for end users - browse deals, save favorites, and hire freelancers via Fastwork.

---

## 🚀 Quick Start

### 1. Open the App
Visit: **http://localhost:3000** (or your deployed URL)

### 2. Browse Deals
- Scroll through the home feed
- Click on products to view details
- Use search bar to find specific items

### 3. Save Favorites
- Click ❤️ icon on any product
- View saved deals at `/saved` page

### 4. Hire Freelancer (External)
- Click "Hire on Fastwork" button
- Get redirected to Fastwork.co
- Freelancer purchases & delivers

---

## 📱 Main Features

### 🏠 **Home Page** (`/`)

**What You See:**
- Deal feed with product cards
- Search bar (top)
- Category filter pills
- Product images, prices, discounts

**What You Can Do:**
1. **Search**: Type keywords (e.g., "coffee", "pizza")
   - Searches in: Product name, shop name, description
   
2. **Filter by Category**: Click pills
   - All | Food | Fashion | Travel | Gadgets | Beauty
   
3. **Save Deals**: Click ❤️ heart icon
   - Icon fills orange when saved
   - Toast notification appears
   - Earn +10 XP, +5 coins
   
4. **View Details**: Click product card
   - Navigate to `/product/[id]`
   - See full description
   - Earn +5 XP

---

### ❤️ **Saved Deals Page** (`/saved`)

**What You See:**
- All your bookmarked deals
- Grid layout (1-3 columns, responsive)
- Badge counter in navigation

**What You Can Do:**
1. **View All Saved**: See everything you've bookmarked
2. **Remove Items**: Click trash icon to unsave
3. **Click to View**: Navigate to product detail
4. **Empty State**: When no saved deals
   - Friendly message
   - Button to browse deals

**Navigation Access:**
- Desktop: Heart icon in header (top right)
- Mobile: Heart icon in bottom navigation

---

### 📦 **Product Detail Page** (`/product/[id]`)

**What You See:**
- Large product image
- Price comparison (original vs discounted)
- Discount badge (e.g., "50% OFF")
- Shop name & address
- Description
- Category tag
- Action buttons at bottom (mobile-fixed)

**What You Can Do:**
1. **Save Deal**: Click "บันทึก" (Save) button
2. **Navigate to Store**: Click "นำทาง" (Navigate)
   - Opens Google Maps with directions
3. **Hire Freelancer**: Click "จ้างคนช้อป" (Hire Shopper)
   - Redirects to Fastwork.co
   - Freelancer handles purchase & delivery

**Gamification Rewards:**
- First visit to product: +5 XP, +2 coins
- Save product: +10 XP, +5 coins

---

### 🎁 **Rewards Page** (`/rewards`)

**What You See:**
- Your XP & Coins balance
- Level progress bar
- Available rewards to redeem
- Redemption history

**What You Can Do:**
1. **View Points**: See current XP & coins
2. **Track Progress**: Visual progress bar to next level
3. **Redeem Rewards**: Exchange coins for perks (future)
4. **View History**: See past redemptions

---

### 👤 **Profile Page** (`/profile`)

**What You See:**
- Avatar circle (top center)
- User name
- Rank badge (Novice → Pro → Legendary)
- Stats row:
  - XP points
  - Coins balance
  - Saved deals count
- Level progress bar
- Menu options

**Menu Options:**
1. 📝 **Edit Profile** (`/profile/edit`)
   - Change name
   - Update phone number
   - Change avatar (future)

2. 🔔 **Notification Settings**
   - Enable/disable push notifications
   - Email preferences

3. ℹ️ **Help & Support**
   - FAQs
   - Contact support

4. 🚪 **Logout**
   - Sign out of account
   - Redirect to home page

**How to Access:**
- Desktop: Profile link in header
- Mobile: Profile icon in bottom nav (far right)

---

## 🎮 Gamification System

### How to Earn Points

| Action | XP Earned | Coins Earned |
|--------|-----------|--------------|
| View product details | +5 XP | +2 coins |
| Save a deal | +10 XP | +5 coins |
| Use coupon (future) | +50 XP | +20 coins |
| Daily login (future) | +20 XP | +10 coins |
| Complete profile | +100 XP | +50 coins |

### Level System

**Progression:**
- Every 100 XP = 1 level up
- Levels unlock perks & titles

**Rank Titles:**
- **Level 1-5**: Novice Hunter 🐣
- **Level 6-19**: Pro Hunter 🔥
- **Level 20+**: Legendary Slayer 👑

### Points Display

**Where to See Your Points:**
- Header (desktop): Orange XP badge, Yellow coins badge
- Profile page: Full stats breakdown
- Rewards page: Balance & history

---

## 🔐 Authentication

### How to Login

1. **Click Login Button**
   - Desktop: "เข้าสู่ระบบ" in header (top right)
   - Mobile: Profile icon → Login prompt

2. **Enter Email**
   - Type your email address
   - No password needed!

3. **Check Your Email**
   - Magic link sent to inbox
   - Click link in email

4. **Automatically Logged In**
   - Redirected to app
   - Profile created (if first time)
   - Welcome bonus: 50 coins, 0 XP, Level 1

### Features Requiring Login

- ❤️ Saving deals (bookmark)
- 🎁 Viewing rewards
- 👤 Accessing profile
- 📊 Tracking XP & coins

**Anonymous Features** (no login needed):
- ✅ Browse deals on home page
- ✅ Search & filter products
- ✅ View product details
- ✅ Click external Fastwork links

---

## 📱 Navigation

### Desktop Layout

**Header (Top Bar):**
```
[Logo] [Search Bar] [XP Badge] [Coins Badge] [❤️ Saved] [🔔 Notifications] [👤 Profile]
```

**No Bottom Navigation** on desktop.

### Mobile Layout

**Header (Top Bar):**
```
[Logo] [Search Icon] [🔔 Notifications]
```

**Bottom Navigation (Fixed):**
```
[🏠 Home] [❤️ Saved] [🎁 Rewards] [👤 Profile]
```

**Active State:**
- Icon turns orange
- Label underlined

---

## 🌓 Settings

### Access Settings
1. Click profile icon
2. Look for ⚙️ settings icon (or in profile menu)

### Available Settings

1. **Language** 🌍
   - Thai (ไทย) 🇹🇭
   - English (EN) 🇬🇧
   - Switches all UI text

2. **Theme** 🎨
   - ☀️ Light mode
   - 🌙 Dark mode
   - Auto-sync with OS preference

3. **Notifications** 🔔
   - Enable/disable push notifications
   - Sound on/off

**Persistence:**
- All settings saved to localStorage
- Survive page refresh & browser restart

---

## 🔍 Search & Filter Tips

### Search Tips

**What You Can Search:**
- Product names (e.g., "salmon sushi")
- Shop names (e.g., "Starbucks")
- Descriptions (e.g., "buy 1 get 1")

**Search is:**
- ✅ Real-time (updates as you type)
- ✅ Case-insensitive
- ✅ Works in Thai & English

### Category Filter

**Available Categories:**
- 🍔 **Food**: Restaurants, cafes, snacks
- 👗 **Fashion**: Clothing, accessories
- ✈️ **Travel**: Tours, hotels, flights
- 📱 **Gadgets**: Electronics, tech
- 💄 **Beauty**: Cosmetics, spa

**How It Works:**
- Click category pill to filter
- Click "All" to reset
- Combines with search (both active)

**Example:**
1. Type "coffee" in search
2. Click "Food" category
3. See only food deals matching "coffee"

---

## 🎯 Common Tasks

### Task 1: Find Coffee Deals

```
1. Open home page (/)
2. Type "coffee" in search bar
3. Click "Food" category pill
4. Browse results
5. Click ❤️ to save favorites
```

### Task 2: View Saved Deals

```
1. Click ❤️ icon in navigation
   - Desktop: Top right in header
   - Mobile: Bottom nav (2nd icon)
2. See all saved deals
3. Click trash icon to remove
4. Click card to view details
```

### Task 3: Hire Freelancer to Buy Product

```
1. Find product you want
2. Click product card → detail page
3. Click "จ้างคนช้อป" (Hire Shopper) button
4. Get redirected to Fastwork.co
5. Post job: "Buy [product] from [shop] and deliver to [address]"
6. Freelancer accepts job
7. Freelancer purchases & delivers
8. You pay freelancer via Fastwork
```

### Task 4: Check Your Level & Rewards

```
1. Click profile icon (👤)
2. See your stats:
   - XP points
   - Coins balance
   - Current level & rank
   - Progress to next level
3. Click "รางวัล" (Rewards) to see available perks
```

---

## 💡 Pro Tips

### Maximize Your Points

1. **Daily Actions:**
   - Browse deals daily (+XP)
   - Save interesting deals (+10 XP each)
   - View product details (+5 XP each)

2. **Complete Your Profile:**
   - Add profile photo (future)
   - Fill all fields
   - Earn +100 XP bonus

3. **Engage Consistently:**
   - Login daily for streak bonus (future)
   - Complete challenges (future)
   - Refer friends (future)

### Save Smart

- 📌 **Create Collections**: Organize saved deals by category
- 🔔 **Enable Notifications**: Get alerts when deals expire
- 💾 **Export List**: Share saved deals with friends (future)

### Search Efficiently

- Use **specific keywords** for better results
- Combine **search + category filter** for precision
- Save **frequent searches** as shortcuts (future)

---

## ❓ Frequently Asked Questions

### Q: Do I need to create an account?
**A:** No! You can browse and search without logging in. But login is required to save deals, earn points, and view profile.

### Q: How do I contact the shop?
**A:** Click product card → View shop address → Use "นำทาง" (Navigate) button to get directions. Call shop directly or hire Fastwork freelancer to buy for you.

### Q: Can I use deals offline?
**A:** Yes (future)! Saved deals will be available offline via PWA. Install app to home screen for best experience.

### Q: What happens when a deal expires?
**A:** Expired deals are automatically marked (future). You'll see "Expired" badge. Remove from saved or keep for reference.

### Q: How do I report fake deals?
**A:** Click product → Report button (future) → Select reason → Submit. Our team reviews within 24 hours.

### Q: Can I share deals with friends?
**A:** Yes! Click product → Share button → Choose platform (LINE, Facebook, Copy link).

---

## 🐛 Troubleshooting

### Problem: Can't save deals (heart icon doesn't work)

**Solution:**
1. Make sure you're logged in
2. Check internet connection
3. Try refresh page (F5)
4. Clear browser cache

### Problem: Search not working

**Solution:**
1. Check spelling (Thai/English)
2. Try simpler keywords
3. Reset category filter to "All"
4. Refresh page

### Problem: Profile not showing correct XP

**Solution:**
1. Logout and login again
2. Check internet connection
3. Wait a few seconds for sync
4. Contact support if issue persists

### Problem: Magic link email not received

**Solution:**
1. Check spam/junk folder
2. Wait 1-2 minutes
3. Check email address spelling
4. Try different email provider
5. Contact support

---

## 📞 Get Help

### Need Support?

**Option 1: In-App Help**
- Profile → Help & Support
- Browse FAQs
- Submit ticket

**Option 2: Contact Us**
- Email: support@allpro.com (example)
- LINE: @allpromo (example)
- Facebook: /allpromotion (example)

**Option 3: Community**
- Join Discord (example)
- Ask in Facebook group (example)
- Follow on Twitter for updates (example)

---

## 🎉 Enjoy Hunting Deals!

**All Pro** - Your personal deal assistant. Browse, save, and hire freelancers to get the best deals in Thailand! 🇹🇭

---

**App Features:**
- ✅ Real-time search
- ✅ Category filtering
- ✅ Saved deals system
- ✅ Gamification (XP & coins)
- ✅ Dark mode
- ✅ Thai & English
- ✅ Fastwork integration
- ✅ PWA (installable)

**Coming Soon:**
- 📅 Calendar view (expiry dates)
- 🔔 Push notifications (price drops)
- 👥 Social features (reviews, ratings)
- 🎁 Reward redemption store
- 📊 Personal analytics
- 🤝 Referral program

---

**Happy hunting! 🎯**
