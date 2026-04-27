# 🎨 Feature Guide - Complete Feature Documentation

Comprehensive guide covering all features in IAMROOT AI platform.

---

## 📋 Table of Contents

1. [Authentication System](#-authentication-system)
2. [Saved Deals (Wallet)](#-saved-deals-wallet)
3. [Gamification System](#-gamification-system)
4. [Progressive Web App (PWA)](#-progressive-web-app-pwa)
5. [Internationalization (i18n)](#-internationalization-i18n)
6. [Dark Mode](#-dark-mode)
7. [AI Chatbot](#-ai-chatbot)
8. [Search & Filtering](#-search--filtering)
9. [Merchant Dashboard](#-merchant-dashboard)

---

## 🔐 Authentication System

### Overview
Magic link authentication powered by Supabase - no passwords required!

### How It Works

```
1. User enters email
2. System sends magic link to email
3. User clicks link
4. Automatically logged in
5. Profile created in database
```

### Implementation

#### Setup (One-time)

**Run SQL in Supabase Dashboard**:
```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 50,
  level INTEGER DEFAULT 1,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create trigger to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, xp, coins, level)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    0,
    50,
    1
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### Usage in Components

```typescript
import { useAuthStore } from '@/store/useAuthStore';

function MyComponent() {
  const { user, isAuthenticated, loginWithEmail, logout } = useAuthStore();

  // Check if logged in
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  // Access user data
  return (
    <div>
      <p>Welcome {user?.name}!</p>
      <p>XP: {user?.xp}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes

```typescript
// Protect a page
'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <div>Protected Content</div>;
}
```

---

## ❤️ Saved Deals (Wallet)

### Overview
Users can bookmark favorite deals and view them in a dedicated page.

### Key Features
- ✅ Heart icon to save/unsave
- ✅ Badge counter in navigation
- ✅ Persistent storage (localStorage)
- ✅ Responsive grid layout
- ✅ Empty state with CTA

### Implementation

#### Save Button Component

```typescript
// components/Product/SaveButton.tsx
'use client';

import { useProductStore } from '@/store/useProductStore';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

export function SaveButton({ productId }: { productId: string }) {
  const { savedProductIds, toggleSave } = useProductStore();
  const isSaved = savedProductIds.includes(productId);

  const handleToggle = () => {
    toggleSave(productId);
    toast.success(isSaved ? '💔 Removed from saved' : '❤️ Added to saved');
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
    >
      <Heart
        className={`w-6 h-6 ${
          isSaved ? 'fill-orange-500 text-orange-500' : 'text-gray-400'
        }`}
      />
    </button>
  );
}
```

#### Saved Page

```typescript
// app/(user)/saved/page.tsx
'use client';

import { useProductStore } from '@/store/useProductStore';
import { ProductCard } from '@/components/Product/ProductCard';

export default function SavedPage() {
  const { products, savedProductIds } = useProductStore();
  
  const savedProducts = products.filter(p => savedProductIds.includes(p.id));

  if (savedProducts.length === 0) {
    return (
      <div className="text-center py-20">
        <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No saved deals yet</h2>
        <p className="text-gray-600">Start exploring and save your favorites!</p>
        <Link href="/" className="mt-4 inline-block btn-primary">
          Browse Deals
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Saved Deals ({savedProducts.length})</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### Store Setup

```typescript
// store/useProductStore.ts (relevant part)
interface ProductStore {
  savedProductIds: string[];
  toggleSave: (id: string) => void;
}

export const useProductStore = create(
  persist(
    (set) => ({
      savedProductIds: [],
      
      toggleSave: (id: string) =>
        set((state) => ({
          savedProductIds: state.savedProductIds.includes(id)
            ? state.savedProductIds.filter(pid => pid !== id)
            : [...state.savedProductIds, id],
        })),
    }),
    {
      name: 'product-storage',
    }
  )
);
```

---

## 🎮 Gamification System

### Overview
Reward users with points, levels, and badges for engaging with the platform.

### Point System

| Action | XP Earned | Coins Earned |
|--------|-----------|--------------|
| View Product | +5 XP | +2 coins |
| Save Deal | +10 XP | +5 coins |
| Use Coupon | +50 XP | +20 coins |
| Daily Login | +20 XP | +10 coins |
| Complete Profile | +100 XP | +50 coins |

### Level Progression

```typescript
// lib/gamification.ts
export function calculateLevel(xp: number): number {
  // Every 100 XP = 1 level
  return Math.floor(xp / 100) + 1;
}

export function xpToNextLevel(xp: number): number {
  const currentLevel = calculateLevel(xp);
  return (currentLevel * 100) - xp;
}

export function getRankTitle(level: number): string {
  if (level <= 5) return 'Novice Hunter 🐣';
  if (level <= 19) return 'Pro Hunter 🔥';
  return 'Legendary Slayer 👑';
}
```

### Implementation

#### Points Counter (Header)

```typescript
// components/Rewards/PointsCounter.tsx
'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { Coins, Zap } from 'lucide-react';

export function PointsCounter() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      {/* XP */}
      <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/20 px-3 py-1 rounded-full">
        <Zap className="w-4 h-4 text-orange-500" />
        <span className="font-semibold text-orange-600 dark:text-orange-400">
          {user.xp}
        </span>
      </div>

      {/* Coins */}
      <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
        <Coins className="w-4 h-4 text-yellow-500" />
        <span className="font-semibold text-yellow-600 dark:text-yellow-400">
          {user.coins}
        </span>
      </div>
    </div>
  );
}
```

#### Earning Points

```typescript
// hooks/useGamification.ts
import { useAuthStore } from '@/store/useAuthStore';

export function useGamification() {
  const { user, updateProfile } = useAuthStore();

  const earnPoints = async (xp: number, coins: number) => {
    if (!user) return;

    const newXP = (user.xp || 0) + xp;
    const newCoins = (user.coins || 0) + coins;
    const newLevel = calculateLevel(newXP);

    await updateProfile({
      xp: newXP,
      coins: newCoins,
      level: newLevel,
    });

    // Show toast
    toast.success(`+${xp} XP, +${coins} coins!`, {
      description: newLevel > user.level ? `Level Up! Now ${getRankTitle(newLevel)}` : undefined,
    });
  };

  return { earnPoints };
}
```

**Usage**:
```typescript
const { earnPoints } = useGamification();

// When user views a product
earnPoints(5, 2);

// When user saves a deal
earnPoints(10, 5);
```

---

## 📱 Progressive Web App (PWA)

### Overview
Allow users to install the app to their home screen for a native-like experience.

### Features
- ✅ Install to home screen
- ✅ Offline support (coming soon)
- ✅ Custom app icons
- ✅ Standalone mode (no browser UI)

### Configuration

#### Manifest File

**File**: `public/manifest.json`

```json
{
  "name": "IAMROOT AI",
  "short_name": "AllPromo",
  "description": "Thailand's #1 Deal Discovery Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#f59e0b",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

#### Next.js Metadata

**File**: `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: 'IAMROOT AI',
  description: 'Hunt deals, hire freelancers, earn rewards',
  manifest: '/manifest.json',
  themeColor: '#f59e0b',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IAMROOT AI',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};
```

### Install Prompt

```typescript
// components/Common/InstallPrompt.tsx
'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstiamrootaimpt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    });
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowPrompt(false);
      });
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-orange-500 to-amber-500 p-4 rounded-xl shadow-lg animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Install App</h3>
          <p className="text-sm text-white/90">Get quick access!</p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

---

## 🌍 Internationalization (i18n)

### Overview
Support for Thai and English languages with 80+ translation keys.

### Translation Hook

```typescript
// hooks/useTranslation.ts
const translations = {
  th: {
    'nav.home': 'หน้าแรก',
    'nav.saved': 'ที่บันทึก',
    'nav.rewards': 'รางวัล',
    'nav.profile': 'โปรไฟล์',
    'btn.save': 'บันทึก',
    'btn.cancel': 'ยกเลิก',
    // ... 80+ keys
  },
  en: {
    'nav.home': 'Home',
    'nav.saved': 'Saved',
    'nav.rewards': 'Rewards',
    'nav.profile': 'Profile',
    'btn.save': 'Save',
    'btn.cancel': 'Cancel',
    // ... 80+ keys
  },
};

export function useTranslation() {
  const { language } = useAppStore();

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return { t, language };
}
```

### Usage

```typescript
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <button>{t('btn.save')}</button>
    </div>
  );
}
```

### Language Switcher

```typescript
// In SettingsMenu component
const { language, setLanguage } = useAppStore();

<div className="flex gap-2">
  <button
    onClick={() => setLanguage('th')}
    className={language === 'th' ? 'active' : ''}
  >
    🇹🇭 ไทย
  </button>
  <button
    onClick={() => setLanguage('en')}
    className={language === 'en' ? 'active' : ''}
  >
    🇬🇧 EN
  </button>
</div>
```

---

## 🌓 Dark Mode

### Setup

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f172a',
        'dark-surface': '#1e293b',
      },
    },
  },
};
```

### Toggle Implementation

```typescript
// In SettingsMenu or Header
const { theme, setTheme } = useAppStore();

useEffect(() => {
  // Apply dark class to html element
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [theme]);

<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
</button>
```

### Component Styling

```typescript
// Always add dark: variants
<div className="bg-white dark:bg-dark-bg text-gray-900 dark:text-white">
  <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
    Title
  </h1>
  <p className="text-gray-600 dark:text-gray-400">
    Description
  </p>
</div>
```

---

## 🤖 AI Chatbot

### Setup

```bash
# Get API key from Google AI Studio
https://makersuite.google.com/app/apikey
```

```typescript
// lib/chatbotAI.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function getChatResponse(message: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `You are a helpful shopping assistant for IAMROOT AI app.
Help users find deals, recommend products, and answer questions.
User message: ${message}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

### Usage

```typescript
// components/Chatbot/ChatWindow.tsx
const [messages, setMessages] = useState([]);
const [input, setInput] = useState('');

const handleSend = async () => {
  const userMessage = { role: 'user', content: input };
  setMessages([...messages, userMessage]);

  const response = await getChatResponse(input);
  const botMessage = { role: 'bot', content: response };
  setMessages([...messages, userMessage, botMessage]);
};
```

---

## 🔍 Search & Filtering

### Implementation

```typescript
// app/(user)/page.tsx
const [searchQuery, setSearchQuery] = useState('');
const { products, selectedCategory } = useProductStore();

const filteredProducts = products.filter(product => {
  // Category filter
  if (selectedCategory !== 'All' && product.category !== selectedCategory) {
    return false;
  }

  // Search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    return (
      product.title.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.shop_name.toLowerCase().includes(query)
    );
  }

  return true;
});
```

---

## 🏪 Merchant Dashboard

### Create Deal Widget

```typescript
// components/Merchant/CreateDealWidget.tsx
const [formData, setFormData] = useState({
  title: '',
  price: '',
  discountPrice: '',
  category: 'Food',
  isFlashSale: false,
});

const handleSubmit = () => {
  addProduct({
    id: generateId(),
    ...formData,
    shop_name: user.shop_name,
    created_at: new Date(),
  });

  toast.success('🎉 Deal created!');
  confetti(); // Trigger confetti animation
};
```

---

**For full examples and code snippets, see respective files in the project.**

**Need help implementing a feature? Check [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) or create an issue on GitHub!**
