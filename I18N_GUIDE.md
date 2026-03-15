# 🌍 Internationalization (i18n) & Theme System

## Overview

This system implements **multi-language support** and **dark mode** to make the app accessible globally and save users' eyes at night.

**Features:**
- ✅ 2 languages: Thai (🇹🇭) & English (🇬🇧)
- ✅ Dark mode toggle (☀️ Light / 🌙 Dark)
- ✅ Auto-fallback to English
- ✅ Persistent settings (localStorage)
- ✅ Smooth CSS transitions
- ✅ Settings modal UI

---

## 📁 File Structure

```
store/
  └── useSettingsStore.ts      # Global settings (language, theme, notifications)
hooks/
  └── useTranslation.ts        # Translation hook with dictionaries
components/
  └── Layout/
      └── SettingsMenu.tsx     # Settings modal UI
app/
  └── i18n-demo/
      └── page.tsx             # Testing playground
```

---

## 🔧 Usage

### 1. Translation Hook

**Import & Use:**

```tsx
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { t, language } = useTranslation();

  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
      <button>{t('btn.confirm')}</button>
      
      {/* Current language: {language} */}
    </div>
  );
}
```

**Available Translation Keys:**

```typescript
// Navigation
t('nav.home')          // "หน้าแรก" / "Home"
t('nav.map')           // "แผนที่" / "Map"
t('nav.wallet')        // "กระเป๋า" / "Wallet"
t('nav.profile')       // "โปรไฟล์" / "Profile"

// Buttons
t('btn.confirm')       // "ยืนยัน" / "Confirm"
t('btn.cancel')        // "ยกเลิก" / "Cancel"
t('btn.share')         // "แชร์" / "Share"
t('btn.redeem')        // "ใช้สิทธิ์" / "Redeem"

// Hero Section
t('hero.title')        // "ล่าโปรเด็ดทั่วไทย" / "Hunt Best Deals in Thailand"
t('hero.subtitle')     // "เช็กสต็อกแบบเรียลไทม์..." / "Real-time stock check..."

// Product Card
t('product.discount')  // "ลด" / "OFF"
t('product.soldOut')   // "ขายหมดแล้ว" / "Sold Out"
t('product.reviews')   // "รีวิว" / "Reviews"

// Chatbot
t('chat.greeting')     // "สวัสดีครับ! หาอะไรกินดี?" / "Hello! What are you hungry for?"
t('chat.placeholder')  // "พิมพ์ข้อความ..." / "Type a message..."

// Gamification
t('game.levelUp')      // "เลเวลอัพ!" / "Level Up!"
t('game.points')       // "แต้ม" / "Points"
t('game.badges')       // "ตรา" / "Badges"

// Settings
t('settings.title')    // "ตั้งค่า" / "Settings"
t('settings.language') // "ภาษา" / "Language"
t('settings.theme')    // "ธีม" / "Theme"

// Empty States
t('empty.wallet')      // "กระเป๋าคุณยังว่างเปล่า..." / "Your wallet is light..."
t('empty.chat')        // "ฉันเหงา..." / "I'm lonely..."

// ... and 80+ more keys!
```

---

### 2. Settings Store

**Direct Access:**

```tsx
import { useSettingsStore } from '@/store/useSettingsStore';

function MyComponent() {
  const { language, setLanguage, theme, setTheme, toggleTheme } = useSettingsStore();

  const handleLanguageSwitch = () => {
    setLanguage(language === 'th' ? 'en' : 'th');
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <div>
      <button onClick={handleLanguageSwitch}>
        {language === 'th' ? '🇬🇧 Switch to English' : '🇹🇭 เปลี่ยนเป็นไทย'}
      </button>
      <button onClick={handleThemeToggle}>
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </div>
  );
}
```

---

### 3. Settings Modal

**Add to Your App:**

```tsx
import { useState } from 'react';
import SettingsMenu from '@/components/Layout/SettingsMenu';
import { Settings } from 'lucide-react';

function Header() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <button onClick={() => setShowSettings(true)}>
        <Settings className="w-5 h-5" />
        Settings
      </button>

      <SettingsMenu 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
}
```

**Modal Features:**
- Language toggle (🇹🇭 Thai / 🇬🇧 English)
- Theme toggle (☀️ Light / 🌙 Dark)
- Notifications toggle (🔔 On/Off)
- Sound toggle (🔊 On/Off)
- Auto-save to localStorage
- Smooth animations

---

## 🎨 Dark Mode Implementation

### Auto-Apply on Load

The theme is automatically applied when the app loads:

```tsx
// store/useSettingsStore.ts (already implemented)
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('golden-hunter-settings');
  if (savedTheme) {
    const settings = JSON.parse(savedTheme);
    if (settings.state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }
}
```

### Manual Theme Switch

```tsx
import { useSettingsStore } from '@/store/useSettingsStore';

const { theme, setTheme } = useSettingsStore();

// Switch to dark
setTheme('dark');

// Switch to light
setTheme('light');

// Toggle
toggleTheme();
```

### CSS Transitions (Already in globals.css)

```css
/* Smooth theme transitions */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

---

## 🌐 Adding New Translations

### Step 1: Add to Dictionary

**File:** `hooks/useTranslation.ts`

```typescript
const translations = {
  th: {
    // ... existing translations
    'myNewKey': 'ข้อความภาษาไทย',
  },
  en: {
    // ... existing translations
    'myNewKey': 'English text',
  },
};
```

### Step 2: Use in Components

```tsx
const { t } = useTranslation();

<h1>{t('myNewKey')}</h1>
```

---

## 🔄 Chatbot Adaptation

**Auto-Adapt Based on Language:**

```tsx
import { useTranslation } from '@/hooks/useTranslation';

function Chatbot() {
  const { t, language } = useTranslation();

  const greetingMessage = t('chat.greeting');
  // TH: "สวัสดีครับ! หาอะไรกินดี?"
  // EN: "Hello! What are you hungry for?"

  const placeholder = t('chat.placeholder');
  // TH: "พิมพ์ข้อความ..."
  // EN: "Type a message..."

  return (
    <div>
      <ChatMessage text={greetingMessage} isBot />
      <input placeholder={placeholder} />
    </div>
  );
}
```

**Advanced: Change Bot Personality**

```tsx
const getBotResponse = (query: string) => {
  if (language === 'th') {
    return `เจอแล้วครับ! ${query} ใกล้ๆ คุณมี 5 ร้าน`;
  } else {
    return `Found it! There are 5 ${query} shops near you`;
  }
};
```

---

## 🎯 Refactoring Existing Components

### Before (Hardcoded):

```tsx
function ProductCard({ product }) {
  return (
    <div>
      <h2>{product.name}</h2>
      <span>ลด {product.discount}%</span>
      <button>ดูรายละเอียด</button>
    </div>
  );
}
```

### After (i18n):

```tsx
import { useTranslation } from '@/hooks/useTranslation';

function ProductCard({ product }) {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{product.name}</h2>
      <span>{t('product.discount')} {product.discount}%</span>
      <button>{t('btn.viewDetails')}</button>
    </div>
  );
}
```

---

## 📋 Refactoring Checklist

**Priority Components to Update:**

- [ ] **Navigation Bar** (`components/Header.tsx`)
  - Home, Map, Wallet, Profile labels
  
- [ ] **Product Card** (`components/PromoCard.tsx`)
  - Discount, Reviews, Distance labels
  
- [ ] **Buttons** (All CTA buttons)
  - Confirm, Cancel, Share, Redeem
  
- [ ] **Chatbot** (`components/Chatbot.tsx`)
  - Greeting message, placeholder text
  
- [ ] **Empty States** (`components/Common/EmptyState.tsx`)
  - Already supports translations via props
  
- [ ] **Settings Menu**
  - Already fully translated
  
- [ ] **Welcome Tour** (`components/Onboarding/WelcomeTour.tsx`)
  - Slide titles and descriptions

---

## 🧪 Testing

### Demo Page

Visit: **`http://localhost:3000/i18n-demo`**

**Features:**
- View current language & theme
- See all translation examples
- Test UI component translations
- Copy integration code
- Open settings modal

### Manual Testing

**Language:**
- [ ] Open settings → Switch to English
- [ ] Verify all text changes
- [ ] Switch back to Thai
- [ ] Reload page → Language persists

**Theme:**
- [ ] Open settings → Switch to Dark
- [ ] Verify colors change smoothly
- [ ] Switch back to Light
- [ ] Reload page → Theme persists

**Fallback:**
- [ ] Add new component using `t('nonExistentKey')`
- [ ] Check console warning
- [ ] Verify key displays (fallback behavior)

---

## 🎨 Styling Guidelines

### Dark Mode Classes

**Use Tailwind's dark: variant:**

```tsx
<div className="bg-white dark:bg-dark-bg">
  <h1 className="text-gray-900 dark:text-white">Title</h1>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

**Common Dark Mode Patterns:**

```tsx
// Backgrounds
bg-white dark:bg-dark-bg
bg-gray-100 dark:bg-dark-surface
bg-gray-50 dark:bg-gray-800

// Text
text-gray-900 dark:text-white
text-gray-600 dark:text-gray-400
text-gray-500 dark:text-gray-500

// Borders
border-gray-200 dark:border-dark-border
border-gray-300 dark:border-gray-700

// Buttons
bg-brand-500 dark:bg-brand-600
hover:bg-brand-600 dark:hover:bg-brand-700
```

---

## 🌍 Language Detection

### Browser Language (Optional Future Feature)

```tsx
// Detect browser language on first visit
useEffect(() => {
  const savedLang = localStorage.getItem('golden-hunter-settings');
  if (!savedLang) {
    const browserLang = navigator.language;
    if (browserLang.startsWith('th')) {
      setLanguage('th');
    } else {
      setLanguage('en');
    }
  }
}, []);
```

---

## 📊 Analytics Integration (Optional)

**Track Language/Theme Preferences:**

```tsx
const handleLanguageChange = (lang: Language) => {
  setLanguage(lang);
  
  // Track analytics
  analytics.track('language_changed', { 
    from: language, 
    to: lang 
  });
};

const handleThemeChange = (theme: Theme) => {
  setTheme(theme);
  
  // Track analytics
  analytics.track('theme_changed', { 
    theme 
  });
};
```

---

## 🚀 Future Enhancements

### 1. Dynamic Language Loading

```tsx
// Load translations from API or JSON files
const loadTranslations = async (lang: Language) => {
  const translations = await fetch(`/locales/${lang}.json`);
  return translations.json();
};
```

### 2. Pluralization

```tsx
// Handle singular/plural forms
const t = (key: string, count?: number) => {
  if (count === 1) {
    return translations[language][`${key}_singular`];
  } else {
    return translations[language][`${key}_plural`];
  }
};

t('product.review', 1);  // "รีวิว" / "Review"
t('product.review', 5);  // "รีวิว" / "Reviews"
```

### 3. Interpolation

```tsx
// Replace placeholders
const t = (key: string, params?: Record<string, any>) => {
  let text = translations[language][key];
  if (params) {
    Object.keys(params).forEach(key => {
      text = text.replace(`{${key}}`, params[key]);
    });
  }
  return text;
};

t('welcome.user', { name: 'John' });  
// "สวัสดี John!" / "Hello John!"
```

### 4. RTL Support (Arabic, Hebrew)

```tsx
// Add RTL languages
const isRTL = (lang: Language) => ['ar', 'he'].includes(lang);

useEffect(() => {
  document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
}, [language]);
```

---

## 🐛 Troubleshooting

### Translations Not Updating?

**Solution:**
```tsx
// Clear localStorage and reload
localStorage.removeItem('golden-hunter-settings');
window.location.reload();
```

### Dark Mode Not Persisting?

**Check:**
1. Settings store is properly persisted
2. Theme initialization runs on app load
3. No CSS conflicts overriding `dark:` classes

### Missing Translation Keys?

**Check Console:**
- Warning: "Translation missing for key..."
- Fallback to English automatically
- Add missing key to both `th` and `en` dictionaries

---

## ✅ Integration Checklist

Before deploying:

- [ ] Add SettingsMenu to header/navigation
- [ ] Refactor all hardcoded text to use `t()`
- [ ] Test language switching
- [ ] Test theme switching
- [ ] Test localStorage persistence
- [ ] Verify all dark mode styles
- [ ] Check chatbot language adaptation
- [ ] Test on mobile devices
- [ ] Verify smooth transitions
- [ ] Add translations for new features

---

**The app is now ready for a global audience! 🌍✨**
