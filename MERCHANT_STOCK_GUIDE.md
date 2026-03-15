# 🏪 Merchant Command Center - Stock Management System

## Overview
A professional B2B interface for Brand Owners and Store Managers to manage real-time stock status across multiple branches. Built with enterprise-grade UX principles: fast, clean, and mobile-responsive.

---

## 🎯 Features

### 1. **Branch Selection Dashboard** (`/merchant/stock`)
- **Multi-branch Management**: Select from multiple store locations
- **Live Status Indicators**: Real-time online/offline status with animated pulse
- **Performance Metrics**: 
  - Active promotions per branch
  - Today's view counts
  - Last sync timestamps
- **Clean B2B Design**: White background, blue accents, data-dense layout

### 2. **Stock Grid Interface** (StockGrid.tsx)
The core workspace for rapid stock updates:

#### Layout
- **Mobile-First Design**: Touch-optimized for tablets and smartphones
- **List View**: Vertical scrolling with large hit targets
- **Product Cards**: 
  - 64px thumbnail with brand icon
  - Product name (line-clamp 2 lines)
  - Status badge (Green "In Stock" / Red "Sold Out")
  - Last update timestamp
  - View count & sales metrics

#### Toggle Switch
- **Large & Accessible**: 64px wide, easy to hit on mobile
- **Visual States**:
  - **ON (Green)**: Product available → Customers see "In Stock"
  - **OFF (Red)**: Product sold out → Customers see "🔴 Out of Stock"
- **Smooth Animation**: Spring physics (Framer Motion)
- **Icon Feedback**: ✓ for available, ✗ for sold out

#### Optimistic UI Updates
1. **Instant Feedback**: Status changes immediately before server confirmation
2. **Flash Animation**: Row background flashes green/red for 600ms
3. **Toast Notifications**: 
   - Success (Green): "Stock updated for [Product Name] is now available"
   - Error (Red): "Stock updated for [Product Name] is now sold out"
4. **Auto-timestamp**: Records exact time of status change

#### Smart Warnings
- **High Demand Alert**: Yellow banner when weekly sales > 50 units
- **Low Stock Prediction**: Suggests restocking for trending items

---

## 🗂️ File Structure

```
app/
├── merchant/
│   ├── dashboard/page.tsx    # Main dashboard with quick access button
│   └── stock/page.tsx         # Branch selector + StockGrid wrapper

components/
└── Merchant/
    ├── StockGrid.tsx          # Main stock management interface
    └── StockControl.tsx       # Alternative dashboard widget
```

---

## 📊 Mock Data (Nivea Brand Example)

### Branches
1. **7-Eleven Asoke**
   - Address: Sukhumvit 21, Asoke BTS
   - Active Promos: 3
   - Today's Views: 1,250

2. **7-Eleven Siam Square**
   - Address: Siam Square One, 2nd Floor
   - Active Promos: 3
   - Today's Views: 2,100

### Products (Per Branch)
1. **NIVEA Creme Soft 50ml** - Buy 2 Get 1
   - Category: Personal Care
   - Weekly Sales: 45 units
   - Views: 1,250

2. **NIVEA MEN Deep Clean 100ml** - 20% Off
   - Category: Personal Care
   - Weekly Sales: 32 units
   - Views: 890

3. **NIVEA Sun Protect SPF50** - Free After Sun
   - Category: Sun Care
   - Weekly Sales: 67 units (High demand warning)
   - Views: 2,100

---

## 🔧 Technical Implementation

### State Management
```typescript
const [productList, setProductList] = useState<Product[]>(products);
const [flashingId, setFlashingId] = useState<string | null>(null);

const handleToggle = (productId: string) => {
  // 1. Update local state immediately (Optimistic UI)
  // 2. Flash animation for 600ms
  // 3. Show toast notification
  // 4. Record timestamp
  // 5. (In production: Send to API)
};
```

### Auto-Off Logic Simulation
When toggled to "Sold Out":
- System records timestamp: `"Updated at 2:30 PM"`
- Consumer app updates instantly
- Branch availability component shows: "🔴 Sold Out (Updated 15 mins ago)"

### Design System (B2B vs B2C)
| Aspect | Consumer App | Merchant App |
|--------|--------------|--------------|
| Background | Gradients, Colors | Clean White |
| Accent | Red (#DC2626) | Blue (#2563EB) |
| Density | Spacious, Visual | Data-Dense, Compact |
| Typography | Friendly, Large | Professional, Efficient |
| Actions | Exploratory | Task-Focused |

---

## 🚀 User Flow

### Scenario: Store Manager Marks Product as Sold Out

1. **Login** → Navigate to `/merchant/stock`
2. **Select Branch** → Click "7-Eleven Asoke" card
3. **View Stock Grid** → See 3 active promotions
4. **Toggle Status** → Tap red toggle on "NIVEA Sun Protect SPF50"
   - Row flashes red background
   - Toast shows: "Stock updated for NIVEA Sun Protect SPF50 is now sold out"
   - Timestamp updates: "Updated at 2:45 PM"
5. **Customer Impact** → Consumers immediately see:
   - Product card has "SOLD OUT" overlay (grayscale image)
   - Branch availability shows: "7-Eleven Asoke: 🔴 Sold Out"
   - Nearby branches still show green if available

---

## 🎨 Design Principles

### 1. **Speed Over Features**
- Single tap toggles (no confirmations for common actions)
- Optimistic UI updates (feels instant)
- Minimal navigation depth (2 clicks to action)

### 2. **Error Prevention**
- Large touch targets (44px minimum iOS guideline)
- Clear visual states (green/red impossible to confuse)
- Undo capability via toast actions (future enhancement)

### 3. **Mobile-First**
- Vertical scrolling (thumb-friendly)
- No horizontal scroll required
- Works on 320px screens

### 4. **Trust Signals**
- Live status indicators (animated pulse)
- Exact timestamps on every change
- View count validation (shows impact)

---

## 📱 Responsive Breakpoints

- **Mobile** (320px - 767px): Single column, full-width cards
- **Tablet** (768px - 1023px): 2-column grid for branches
- **Desktop** (1024px+): Max-width container (1280px), spacious layout

---

## 🔌 Integration Points

### Future API Endpoints (Planned)
```typescript
// POST /api/merchant/stock/update
{
  branchId: "br-001",
  productId: "nv-003",
  stockStatus: "out_of_stock",
  timestamp: "2026-02-03T14:45:00Z"
}

// WebSocket: Real-time sync across devices
socket.on('stock:updated', (data) => {
  updateProductStatus(data.productId, data.status);
});
```

---

## 🧪 Testing Checklist

- [ ] Toggle switches update state immediately
- [ ] Toast notifications appear on status change
- [ ] Flash animation plays on toggle
- [ ] Timestamps update automatically
- [ ] Branch selection persists in session
- [ ] Mobile: Touch targets are ≥44px
- [ ] Tablet: Grid layout displays correctly
- [ ] High demand warnings show for products >50 sales/week
- [ ] Empty state shows when no products
- [ ] Back button returns to branch selector

---

## 🎯 Success Metrics

### For Store Managers
- **Time to Update**: <3 seconds per product
- **Error Rate**: <1% incorrect toggles
- **Satisfaction**: Reduces customer complaints about out-of-stock items

### For Customers
- **Accuracy**: Real-time stock status (0 second delay)
- **Transparency**: Timestamp shows last verification
- **Alternatives**: Branch availability shows nearby options

---

## 🛠️ Commands

```bash
# Run development server
npm run dev

# Access merchant interface
http://localhost:3000/merchant/stock

# Access main dashboard
http://localhost:3000/merchant/dashboard
```

---

## 📖 Related Documentation
- [QUICK_START.md](./QUICK_START.md) - Project setup
- [RESPONSIVE_GUIDE.md](./RESPONSIVE_GUIDE.md) - Mobile optimization
- [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md) - Full feature list

---

## 💡 Design Philosophy

> **"Make the right thing easy, and the easy thing obvious."**

This interface follows the principle that store managers are under time pressure. Every second counts when there's a line of customers. The toggle switch is:
- **Immediate**: No loading states for common actions
- **Obvious**: Green = Good, Red = Stop (universal traffic light metaphor)
- **Forgiving**: Changes are reversible by toggling again

The B2B design eschews consumer-facing flourishes (gradients, emojis, large spacing) in favor of information density and task efficiency. This is a **tool**, not an experience.

---

**Built with:**
- Next.js 16 (App Router)
- TypeScript 5
- Framer Motion (animations)
- Tailwind CSS (utility-first styling)
- React Hot Toast (notifications)

**Last Updated:** February 3, 2026
