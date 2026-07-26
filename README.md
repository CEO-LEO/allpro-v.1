# 🔥 All Pro - โปรโมชั่นเด็ดใกล้คุณ

**แพลตฟอร์มรวมโปรโมชั่นครบที่สุดในไทย** พร้อม Geolocation, AI Chatbot, และ Admin Dashboard

> 🚀 **Production-Ready** | 📱 **Mobile-First** | 🗺️ **PostGIS Powered** | 🎨 **Pinterest-style UI**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## ⚡ Quick Start (5 นาที!)

```bash
# 1. Install dependencies
npm install

# 2. ตรวจสอบระบบ
npm run verify

# 3. รัน Development Server
npm run dev
```

**เปิด:** [http://localhost:3000](http://localhost:3000)

📚 **คู่มือละเอียด:** อ่าน [QUICKSTART.md](QUICKSTART.md)

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

---

## ✨ Core Features

### 🔍 **Smart Deal Discovery**
- **Search**: Real-time search across products, shops, categories
- **Category Filter**: Food, Fashion, Travel, Gadgets, Beauty
- **Location-Based**: Find deals near you (Google Maps integration)
- **AI Chatbot**: Ask questions, get recommendations (powered by Gemini)

### ❤️ **Saved Deals System**
- **Bookmark Deals**: Heart icon to save favorites
- **Saved Page**: View all saved deals at `/saved`
- **Persistent Storage**: Auto-saves to localStorage
- **Quick Access**: Badge counter in navigation

### 🎮 **Gamification**
- **Points System**: Earn XP for actions (view products, save deals, daily login)
- **Levels & Ranks**: Novice → Pro → Legendary Hunter
- **Progress Tracking**: Visual level progress bar
- **Coin Rewards**: Collect coins for future redemptions

### 🏪 **Merchant Features**
- **Dashboard**: Analytics, deal management, stock tracking
- **Create Deals**: Upload images, set prices, flash sale toggles
- **Performance Stats**: Views, saves, conversions
- **PRO Subscription**: Premium features (฿599/month)

### 🔐 **Authentication**
- **Magic Link Login**: Email-based, no passwords
- **Supabase Auth**: Secure, scalable backend
- **Profile System**: User data with XP, coins, level
- **Row-Level Security**: Protected data access

### 📱 **Progressive Web App**
- **Install to Home Screen**: Native-like experience
- **Offline Support**: Works without internet
- **Push Notifications**: Deal alerts (coming soon)
- **Fast Loading**: Optimized performance

### 🌍 **Multi-language**
- **Thai & English**: Switch seamlessly
- **80+ Translation Keys**: Full UI coverage
- **Persistent Settings**: Saved to localStorage

### 🌓 **Dark Mode**
- **System Sync**: Follows OS preference
- **Manual Toggle**: Settings panel
- **All Components**: Fully themed

---

## 🎯 How It Works

```
┌─────────────────┐
│   USER FLOW     │
└─────────────────┘
         │
         ▼
1. Browse Deals (Home Page)
   - Search products
   - Filter by category
   - View product details
         │
         ▼
2. Save Favorites (Heart Icon)
   - Click ❤️ to bookmark
   - View in /saved page
         │
         ▼
3. Hire on Fastwork (External)
   - Click "Hire Freelancer"
   - Redirect to Fastwork.co
   - Freelancer purchases & delivers
         │
         ▼
4. Earn Rewards
   - Get XP points
   - Level up
   - Unlock badges
```

---

## 🏗️ Tech Stack

### **Frontend**
- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Notifications**: Sonner (Toast)

### **State Management**
- **Global State**: Zustand
- **Persistence**: localStorage (via Zustand persist)
- **Stores**: 
  - `useAuthStore` - Authentication & user profile
  - `useProductStore` - Products & saved deals
  - `useAppStore` - App settings, theme, language

### **Backend & Database**
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Magic Link)
- **Storage**: Supabase Storage (future: images)
- **API**: Supabase JS Client

### **AI & External Services**
- **AI Chatbot**: Google Gemini API
- **Maps**: Google Maps API
- **Shopping Service**: Fastwork.co (external redirect)

### **Development**
- **Package Manager**: npm
- **Linting**: ESLint 9
- **Formatting**: Prettier (via Tailwind)
- **Git Hooks**: (optional) Husky + lint-staged

---

## 📂 Project Structure

```
pro-hunter/
├── app/                        # Next.js App Router
│   ├── (user)/                # User-facing pages (with Header + BottomNav)
│   │   ├── page.tsx           # Home page (deal feed)
│   │   ├── saved/             # Saved deals page
│   │   ├── rewards/           # Rewards & gamification
│   │   ├── profile/           # User profile
│   │   ├── product/[id]/      # Product detail page
│   │   └── wallet/            # Wallet (unused - legacy)
│   ├── (merchant)/            # Merchant dashboard (with Sidebar)
│   │   └── merchant/
│   │       ├── dashboard/     # Merchant home
│   │       ├── shop/          # Shop management
│   │       └── ads/           # Ad campaigns
│   ├── admin/                 # Admin panel (future)
│   ├── globals.css            # Global styles
│   └── layout.tsx             # Root layout (providers only)
│
├── components/                # React components
│   ├── Auth/                  # Login, signup components
│   ├── Common/                # Reusable UI (buttons, cards)
│   ├── Home/                  # Home page components (CategoryBar, etc.)
│   ├── Layout/                # Navigation (Header, BottomNav, Sidebar)
│   ├── Merchant/              # Merchant components
│   ├── Product/               # Product cards, details
│   └── Rewards/               # Gamification UI
│
├── store/                     # Zustand stores
│   ├── useAuthStore.ts        # Auth state
│   ├── useProductStore.ts     # Products & saved deals
│   └── useAppStore.ts         # App settings
│
├── lib/                       # Utilities & helpers
│   ├── supabase.ts            # Supabase client
│   ├── chatbotAI.ts           # Gemini AI integration
│   └── types.ts               # TypeScript types
│
├── hooks/                     # Custom React hooks
│   ├── useTranslation.ts      # i18n hook
│   └── useGamification.ts     # Points & level logic
│
├── data/                      # Mock data (for development)
│   ├── promotions.json        # Sample products
│   └── stores.ts              # Sample stores
│
├── public/                    # Static assets
│   ├── icons/                 # PWA icons
│   └── manifest.json          # PWA manifest
│
└── docs/                      # Documentation (guides below)
```

---

## 🎓 Documentation Guides

### **For Users**
- [**USER_GUIDE.md**](./USER_GUIDE.md) - How to use the app (browse, save, hire)

### **For Developers**
- [**DEVELOPER_GUIDE.md**](./DEVELOPER_GUIDE.md) - Project setup, API reference, state management
- [**FEATURE_GUIDE.md**](./FEATURE_GUIDE.md) - Feature documentation (Auth, Wallet, Gamification, PWA)
- [**DEPLOYMENT.md**](./DEPLOYMENT.md) - How to deploy to Vercel/production

### **For Merchants**
- [**MERCHANT_GUIDE.md**](./MERCHANT_GUIDE.md) - Dashboard usage, creating deals, analytics

### **For Business/Pitch**
- [**PITCH_POINTS.md**](./PITCH_POINTS.md) - Key selling points for investors
- [**MONETIZATION.md**](./MONETIZATION.md) - Revenue model (PRO subscriptions, ads)
- [**DEMO_GUIDE.md**](./DEMO_GUIDE.md) - How to demo the app (5-7 min script)

---

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production (checks for errors)
npm run build

# Start production build
npm start
```

### **Manual Testing Checklist**
- ✅ Home page loads with products
- ✅ Search works (type "coffee")
- ✅ Category filter works (click "Food")
- ✅ Save button works (heart icon fills)
- ✅ Navigate to `/saved` shows saved deals
- ✅ Login works (magic link to email)
- ✅ Profile shows XP, coins, level
- ✅ Merchant dashboard loads
- ✅ Create deal works (with image upload)
- ✅ Dark mode toggles
- ✅ Language switches (TH ↔ EN)

---

## 🚀 Deployment

### **Vercel (Recommended)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/all-pro)

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```
4. Deploy! (auto-deploys on every push)

See [**DEPLOYMENT.md**](./DEPLOYMENT.md) for detailed instructions.

---

## 🎯 Roadmap

### **Phase 1: MVP** ✅ (Current)
- ✅ Deal browsing & search
- ✅ Saved deals system
- ✅ Basic authentication
- ✅ Merchant dashboard
- ✅ Gamification system

### **Phase 2: Enhanced Features** 🚧 (In Progress)
- 🚧 Fastwork API integration (direct hire)
- 🚧 Push notifications
- 🚧 Social sharing
- 🚧 Review system

### **Phase 3: Growth** 📅 (Planned)
- 📅 Referral program
- 📅 Merchant PRO tier (payment gateway)
- 📅 Advanced analytics
- 📅 Mobile app (React Native)

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/all-pro/issues)
- **Email**: support@allpro.com (example)
- **Discord**: [Join our community](#) (example)

---

## 🙏 Acknowledgments

- **Fastwork.co** - Freelance shopping service integration
- **Supabase** - Backend as a service
- **Vercel** - Hosting platform
- **Next.js Team** - Amazing framework
- **Thai Startup Community** - Support & feedback

---

## 🎉 Made with ❤️ in Thailand

**Pro Hunter** - Hunt Deals, Hire Freelancers, Earn Rewards!

---

## 🔗 Quick Links

- 🏠 [Home Page](http://localhost:3000)
- ❤️ [Saved Deals](http://localhost:3000/saved)
- 🎁 [Rewards](http://localhost:3000/rewards)
- 👤 [Profile](http://localhost:3000/profile)
- 🏪 [Merchant Dashboard](http://localhost:3000/merchant/dashboard)

---

**Star ⭐ this repo if you find it helpful!**
