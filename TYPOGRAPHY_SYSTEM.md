# Typography System - IAMROOT AI

## Overview
This document defines the typography system used across the IAMROOT AI application. The system ensures consistency, readability, and professional appearance across all pages and components.

## Typography Scale

### Display Text (Hero Sections)
Use for large, attention-grabbing text on landing pages and hero sections.

```tsx
// Large Display
<h1 className="text-display-lg">  // 2.5rem - 4rem, weight: 800
  Welcome to IAMROOT AI
</h1>

// Medium Display
<h1 className="text-display">     // 2rem - 3rem, weight: 700
  Find Amazing Deals
</h1>
```

**Use Cases:**
- Landing page headlines
- Hero section titles
- Major page headers

---

### Headings

#### H1 - Main Page Titles
```tsx
<h1 className="text-h1">           // 1.75rem - 2.25rem, weight: 700
  โปรโมชั่นทั้งหมด
</h1>
```

**Use Cases:**
- Page titles
- Main section headers
- Dashboard titles

#### H2 - Section Headers
```tsx
<h2 className="text-h2">           // 1.5rem - 1.875rem, weight: 700
  Nearby Gems
</h2>
```

**Use Cases:**
- Section titles
- Card group headers
- Content area titles

#### H3 - Subsection Titles
```tsx
<h3 className="text-h3">           // 1.25rem - 1.5rem, weight: 600
  หมวดหมู่
</h3>
```

**Use Cases:**
- Subsection titles
- Component headers
- Navigation titles

#### H4 - Small Headers
```tsx
<h4 className="text-h4">           // 1.125rem - 1.25rem, weight: 600
  โปรโมชั่นแนะนำ
</h4>
```

**Use Cases:**
- Card titles
- Small section headers
- List item titles

---

### Body Text

#### Large Body Text
```tsx
<p className="text-body-lg">       // 1rem - 1.125rem, weight: 400
  ค้นหาโปรโมชั่นที่ดีที่สุดในพื้นที่ของคุณ
</p>
```

**Use Cases:**
- Important descriptions
- Hero section subtitles
- Lead paragraphs

#### Regular Body Text
```tsx
<p className="text-body">          // 0.875rem - 1rem, weight: 400
  พบ 123 โปรโมชั่น
</p>
```

**Use Cases:**
- Standard descriptions
- Paragraph text
- General content

#### Small Body Text
```tsx
<p className="text-body-sm">       // 0.8125rem - 0.875rem, weight: 400
  อัพเดทล่าสุด: 5 นาทีที่แล้ว
</p>
```

**Use Cases:**
- Secondary information
- Metadata
- Helper text

---

### Special Use

#### Caption Text
```tsx
<span className="text-caption">    // 0.75rem, weight: 400
  2.5 km
</span>
```

**Use Cases:**
- Image captions
- Badges
- Small labels
- Distance indicators

#### Label Text
```tsx
<label className="text-label">     // 0.875rem, weight: 500
  ตัวกรอง
</label>
```

**Use Cases:**
- Form labels
- Input labels
- Filter labels

#### Button Text
```tsx
<button className="text-button">   // 0.9375rem, weight: 600
  ดูทั้งหมด
</button>
```

**Use Cases:**
- Button text
- Call-to-action text
- Action labels

---

## Font Weight Scale

```tsx
font-normal    // 400 - Regular body text
font-medium    // 500 - Labels, emphasis
font-semibold  // 600 - Subheadings, important text
font-bold      // 700 - Headings, titles
font-black     // 800-900 - Display text, special emphasis
```

---

## Usage Guidelines

### ✅ DO
- Use semantic heading hierarchy (h1 → h2 → h3 → h4)
- Pair headings with appropriate font weights
- Use `text-body` for most content
- Use `text-caption` for small, secondary information
- Maintain consistent spacing between text elements

### ❌ DON'T
- Skip heading levels (e.g., h1 → h3)
- Mix multiple heading sizes in the same context
- Use display text for regular content
- Override the system without good reason
- Use fixed pixel values instead of responsive classes

---

## Component Examples

### Card Component
```tsx
<div className="card">
  <h3 className="text-h4 mb-2">        {/* Card title */}
    ลดสูงสุด 50% ที่ 7-Eleven
  </h3>
  <p className="text-body mb-3">       {/* Card description */}
    โปรโมชั่นพิเศษสำหรับสมาชิก
  </p>
  <div className="flex items-center gap-2">
    <span className="text-h2 font-bold">  {/* Price */}
      ฿299
    </span>
    <span className="text-caption text-gray-400 line-through">
      ฿599
    </span>
  </div>
  <p className="text-caption text-gray-500">  {/* Metadata */}
    เหลือ 15 ชิ้น
  </p>
</div>
```

### Section Header
```tsx
<section>
  <div className="mb-6">
    <h2 className="text-h2 mb-2">       {/* Section title */}
      โปรเด็ดใกล้คุณ
    </h2>
    <p className="text-body text-gray-600">  {/* Section description */}
      จุดเด่นใกล้คุณ ที่เคยไม่เห็น
    </p>
  </div>
  {/* Section content */}
</section>
```

### Navigation
```tsx
<nav>
  <Link href="/">
    <span className="text-h3">        {/* Logo/Brand */}
      IAMROOT AI
    </span>
  </Link>
  <Link href="/categories">
    <span className="text-body-sm">  {/* Nav items */}
      หมวดหมู่
    </span>
  </Link>
</nav>
```

---

## Responsive Behavior

All typography classes use `clamp()` for fluid, responsive sizing:

```css
text-h1: clamp(1.75rem, 4vw, 2.25rem)
text-h2: clamp(1.5rem, 3.5vw, 1.875rem)
text-h3: clamp(1.25rem, 3vw, 1.5rem)
text-body: clamp(0.875rem, 2vw, 1rem)
```

This ensures:
- Smooth scaling across all screen sizes
- Optimal readability on mobile and desktop
- No abrupt text size changes at breakpoints

---

## Accessibility Considerations

### Line Height
- Display: 1.1-1.2 (tight for large text)
- Headings: 1.3-1.4 (balanced)
- Body: 1.5-1.6 (comfortable reading)

### Contrast
- Ensure sufficient contrast ratios:
  - Normal text (< 18px): 4.5:1 minimum
  - Large text (≥ 18px): 3:1 minimum
  - Headings: 3:1 minimum

### Best Practices
- Don't use color alone to convey information
- Ensure touch targets are at least 44x44px
- Allow text to scale up to 200% without breaking layout

---

## Migration Guide

### Converting Old Classes to New System

```tsx
// Old → New
text-xs      → text-caption
text-sm      → text-body-sm
text-base    → text-body
text-lg      → text-h4
text-xl      → text-h3
text-2xl     → text-h2
text-3xl+    → text-h1 or text-display
```

### Examples

```tsx
// Before
<h1 className="text-3xl font-bold">Title</h1>

// After
<h1 className="text-h1">Title</h1>

// Before
<p className="text-sm text-gray-600">Description</p>

// After
<p className="text-body-sm text-gray-600">Description</p>

// Before
<span className="text-xs">2.5 km</span>

// After
<span className="text-caption">2.5 km</span>
```

---

## Updated Files

The following files have been updated to use the new typography system:

### Core Pages
- ✅ `app/(user)/page.tsx` - Homepage
- ✅ `app/(user)/categories/page.tsx` - Categories page
- ✅ `app/(user)/category/[id]/page.tsx` - Category detail
- ✅ `app/(user)/flash-sale/page.tsx` - Flash Sale
- ✅ `app/(user)/search/page.tsx` - Search results

### Components
- ✅ `components/Layout/Navbar.tsx` - Navigation
- ✅ `components/Home/CategoryGrid.tsx` - Category grid
- ✅ `components/Home/ServiceGrid.tsx` - Service shortcuts
- ✅ `components/Home/Infographic.tsx` - Statistics
- ✅ `components/Home/NearbyGems.tsx` - Nearby gems
- ✅ `components/Home/NearbyDeals.tsx` - Nearby deals
- ✅ `components/Home/EnhancedPromoCard.tsx` - Promo cards
- ✅ `components/TrendingTags.tsx` - Trending searches

### Configuration
- ✅ `tailwind.config.js` - Typography scale definition

---

## Need Help?

If you're unsure which typography class to use:

1. **Ask yourself:**
   - Is this a page title? → `text-h1`
   - Is this a section header? → `text-h2` or `text-h3`
   - Is this a card title? → `text-h4`
   - Is this regular content? → `text-body`
   - Is this small/secondary info? → `text-body-sm` or `text-caption`

2. **Check similar components:**
   - Look at existing pages for similar use cases
   - Maintain consistency with established patterns

3. **Test responsiveness:**
   - Check on mobile (375px)
   - Check on tablet (768px)
   - Check on desktop (1440px+)

---

## Changelog

### Version 1.0.0 (Current)
- Initial typography system implementation
- Responsive fluid sizing with clamp()
- Semantic naming for better DX
- Comprehensive documentation

---

**Last Updated:** February 23, 2026
**Maintained by:** Development Team
