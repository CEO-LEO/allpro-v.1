# 👨‍💻 Developer Guide - IAMROOT AI

Complete technical reference for developers building and maintaining the platform.

---

## 📋 Table of Contents

1. [Getting Started](#-getting-started)
2. [Project Architecture](#-project-architecture)
3. [State Management](#-state-management)
4. [API Reference](#-api-reference)
5. [Component Library](#-component-library)
6. [Routing](#-routing)
7. [Database Schema](#-database-schema)
8. [Authentication Flow](#-authentication-flow)
9. [Best Practices](#-best-practices)
10. [Troubleshooting](#-troubleshooting)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: Latest version
- **Supabase Account**: Free tier is enough
- **Google Cloud Account**: For Gemini API (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/all-promo-hunter.git
cd all-promo-hunter

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create `.env.local` file in root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini AI (optional)
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key

# Google Maps (optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
# Start dev server (with Turbopack)
npm run dev

# Start dev server (with webpack - if Turbopack has issues)
npx next dev --webpack

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## 🏗️ Project Architecture

### Next.js App Router Structure

```
app/
├── layout.tsx                 # Root layout (providers only, no UI)
├── globals.css                # Global styles
│
├── (user)/                    # Route group: User pages
│   ├── layout.tsx             # User layout (Header + BottomNav)
│   ├── page.tsx               # Home page /
│   ├── saved/                 # /saved
│   │   └── page.tsx
│   ├── rewards/               # /rewards
│   │   └── page.tsx
│   ├── profile/               # /profile
│   │   ├── page.tsx
│   │   └── edit/
│   │       └── page.tsx       # /profile/edit
│   ├── product/[id]/          # /product/[id]
│   │   └── page.tsx
│   └── wallet/                # Legacy - kept for backwards compatibility
│       └── use/[id]/
│           └── page.tsx
│
└── (merchant)/                # Route group: Merchant pages
    └── merchant/
        ├── layout.tsx         # Merchant layout (Sidebar only)
        ├── dashboard/         # /merchant/dashboard
        │   └── page.tsx
        ├── shop/              # /merchant/shop
        │   └── page.tsx
        └── ads/               # /merchant/ads
            └── page.tsx
```

### Component Architecture

```
components/
├── Auth/
│   ├── LoginModal.tsx         # Email magic link login
│   └── LoginPrompt.tsx        # Redirect to login if not authenticated
│
├── Common/
│   ├── Button.tsx             # Reusable button component
│   ├── Card.tsx               # Card wrapper
│   ├── LoadingSpinner.tsx     # Loading state
│   └── InstallPrompt.tsx      # PWA install banner (mobile)
│
├── Home/
│   ├── CategoryBar.tsx        # Horizontal category pills
│   ├── HeroSection.tsx        # Homepage hero banner
│   └── ProductGrid.tsx        # Grid of product cards
│
├── Layout/
│   ├── Header.tsx             # Desktop navigation (user pages)
│   ├── BottomNav.tsx          # Mobile navigation (user pages)
│   ├── MerchantSidebar.tsx    # Merchant dashboard sidebar
│   ├── SettingsMenu.tsx       # Settings modal (language, theme)
│   └── NotificationCenter.tsx # Bell icon dropdown
│
├── Merchant/
│   ├── CreateDealWidget.tsx   # Form to create new deals
│   ├── DealList.tsx           # List of merchant's deals
│   └── AnalyticsDashboard.tsx # Stats & charts
│
├── Product/
│   ├── ProductCard.tsx        # Product card with save button
│   ├── ProductDetail.tsx      # Full product page
│   └── SaveButton.tsx         # Heart icon bookmark button
│
└── Rewards/
    ├── PointsCounter.tsx      # XP display in header
    ├── LevelBadge.tsx         # Level indicator
    └── ProgressBar.tsx        # Level progress
```

---

## 🗄️ State Management

### Zustand Stores

#### 1. `useAuthStore` (Authentication)

**Location**: `store/useAuthStore.ts`

```typescript
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}
```

**Usage**:
```typescript
import { useAuthStore } from '@/store/useAuthStore';

function MyComponent() {
  const { user, isAuthenticated, loginWithEmail } = useAuthStore();

  const handleLogin = () => {
    loginWithEmail('user@example.com');
  };

  if (!isAuthenticated) return <LoginPrompt />;

  return <div>Welcome {user?.name}!</div>;
}
```

**Key Methods**:
- `initialize()`: Check session on app load
- `loginWithEmail(email)`: Send magic link
- `logout()`: Clear session & redirect
- `updateProfile(updates)`: Update user data in Supabase

---

#### 2. `useProductStore` (Products & Saved Deals)

**Location**: `store/useProductStore.ts`

```typescript
interface ProductStore {
  // State
  products: Product[];
  savedProductIds: string[];
  selectedCategory: string;

  // Actions
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  toggleSave: (id: string) => void;
  setSelectedCategory: (category: string) => void;
}
```

**Usage**:
```typescript
import { useProductStore } from '@/store/useProductStore';

function ProductCard({ product }: { product: Product }) {
  const { savedProductIds, toggleSave } = useProductStore();
  const isSaved = savedProductIds.includes(product.id);

  return (
    <button onClick={() => toggleSave(product.id)}>
      {isSaved ? '❤️' : '🤍'}
    </button>
  );
}
```

**Persistence**: All data auto-saves to `localStorage` via Zustand persist middleware.

---

#### 3. `useAppStore` (App Settings)

**Location**: `store/useAppStore.ts` (if exists, or merged into useAuthStore)

```typescript
interface AppStore {
  // State
  theme: 'light' | 'dark';
  language: 'th' | 'en';
  notifications: boolean;

  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'th' | 'en') => void;
  toggleNotifications: () => void;
}
```

---

## 🌐 API Reference

### Supabase Client

**Location**: `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Common Queries

#### Fetch User Profile
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

#### Update User Profile
```typescript
const { error } = await supabase
  .from('profiles')
  .update({ name: 'New Name', xp: 100 })
  .eq('id', user.id);
```

#### Fetch Products (future: from DB)
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('active', true)
  .order('created_at', { ascending: false });
```

---

### Gemini AI Chatbot

**Location**: `lib/chatbotAI.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function getChatbotResponse(message: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(message);
  return result.response.text();
}
```

**Usage**:
```typescript
import { getChatbotResponse } from '@/lib/chatbotAI';

const response = await getChatbotResponse('ฉันหาโปรกาแฟ');
console.log(response); // "แนะนำโปรกาแฟที่ Starbucks..."
```

---

## 🧩 Component Library

### Button Component

```typescript
// components/Common/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-all',
        variants[variant],
        sizes[size]
      )}
      {...props}
    />
  );
}
```

### Card Component

```typescript
// components/Common/Card.tsx
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6', className)}>
      {children}
    </div>
  );
}
```

---

## 🗺️ Routing

### Route Groups

Next.js App Router uses **route groups** (folders with parentheses) to organize layouts without affecting URLs.

#### Example: User Pages
```
app/(user)/
├── layout.tsx           # Applies Header + BottomNav
├── page.tsx             # URL: /
└── saved/
    └── page.tsx         # URL: /saved
```

#### Example: Merchant Pages
```
app/(merchant)/
└── merchant/
    ├── layout.tsx       # Applies Sidebar only
    └── dashboard/
        └── page.tsx     # URL: /merchant/dashboard
```

### Dynamic Routes

```
app/(user)/product/[id]/page.tsx  → /product/prod-1
app/(user)/wallet/use/[id]/page.tsx → /wallet/use/coupon-123
```

**Access params**:
```typescript
export default function ProductPage({ params }: { params: { id: string } }) {
  const productId = params.id; // "prod-1"
  return <div>Product ID: {productId}</div>;
}
```

---

## 🗃️ Database Schema

### Tables

#### `profiles` (User Data)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  email TEXT,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 50,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `products` (Deals - Future)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  discount_price DECIMAL(10, 2),
  category TEXT,
  shop_name TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────┐
│  User clicks "Login"                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Enter email in LoginModal          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Call loginWithEmail(email)         │
│  → supabase.auth.signInWithOtp()    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Supabase sends magic link email    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  User clicks link in email          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Redirected to app                  │
│  → onAuthStateChange fires          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  initialize() checks session        │
│  → Loads profile from DB            │
│  → Sets user state                  │
└─────────────────────────────────────┘
```

---

## 📐 Best Practices

### 1. Component Organization
- **Keep components small** (< 200 lines)
- **Extract logic to hooks** (e.g., `useProductData`)
- **Use TypeScript interfaces** for props

### 2. State Management
- **Use Zustand for global state** (auth, products)
- **Use React state for local state** (form inputs, modals)
- **Persist important data** (savedProductIds, theme)

### 3. Styling
- **Use Tailwind classes** (avoid inline styles)
- **Follow design system** (colors, spacing from DESIGN_SYSTEM.md)
- **Dark mode support**: Always add `dark:` classes

### 4. Performance
- **Use `next/image`** for all images (auto-optimization)
- **Lazy load components** with `React.lazy()` if > 100KB
- **Memoize expensive calculations** with `useMemo`

### 5. Code Quality
- **Run lint before commit**: `npm run lint`
- **Write meaningful commit messages**: `feat: add saved deals page`
- **Add comments for complex logic**

---

## 🐛 Troubleshooting

### Issue: TypeScript errors on build

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Issue: Supabase connection fails

Check `.env.local`:
```bash
# Verify these are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Issue: Page not found (404)

- Check route group structure (`(user)` vs `(merchant)`)
- Ensure `page.tsx` exists in folder
- Restart dev server: `npm run dev`

### Issue: localStorage not persisting

```typescript
// Check Zustand persist config
persist: {
  name: 'product-storage',
  storage: createJSONStorage(() => localStorage),
}
```

### Issue: Dark mode not working

```typescript
// Check if dark class applied to <html>
document.documentElement.classList.add('dark');

// Verify Tailwind config includes dark mode
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
};
```

---

## 🧪 Testing

### Manual Testing Checklist

```bash
# 1. Authentication
- [ ] Login with magic link
- [ ] Logout redirects to home
- [ ] Profile loads user data

# 2. Saved Deals
- [ ] Click heart icon saves deal
- [ ] Navigate to /saved shows all saved
- [ ] Delete button removes deal

# 3. Merchant Dashboard
- [ ] Create deal form works
- [ ] Image upload displays preview
- [ ] Deal appears in home feed

# 4. Gamification
- [ ] Points update on actions
- [ ] Level progress bar animates
- [ ] Profile shows correct rank

# 5. Responsive Design
- [ ] Mobile: Bottom nav visible
- [ ] Desktop: Header visible
- [ ] Tablet: Grid layout correct
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

## 🤝 Contributing

See main [README.md](./README.md) for contribution guidelines.

---

**Need help?** Create an issue on GitHub or contact the team!
