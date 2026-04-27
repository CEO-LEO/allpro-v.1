# 🔐 Authentication System - Implementation Guide

## Overview
The Authentication System uses **Zustand** for state management with localStorage persistence. Users can login as either a **Customer** (Hunter) or **Merchant** (Shop Owner) with different UI experiences.

---

## 📂 Architecture

```
┌─────────────────────────────────────────────┐
│         Authentication Flow                 │
└─────────────────────────────────────────────┘

1. User clicks "เข้าสู่ระบบ" in Header
2. LoginModal opens with role selection
3. User chooses role (Customer or Merchant)
4. Auth Store updates + localStorage persists
5. UI updates (Header shows profile + logout)
6. Merchant users auto-redirect to dashboard
```

---

## 🗂️ Files Created/Modified

### ✅ Created Files

#### `components/Auth/LoginModal.tsx`
- **Purpose:** Modal dialog for role-based login
- **Features:**
  - Beautiful gradient design with animations
  - Two login options: Customer vs Merchant
  - Confetti celebration on login
  - Toast notifications
  - Auto-redirect for merchants
  - Demo mode notice

#### `store/useAuthStore.ts` (Modified)
- **Purpose:** Global auth state management
- **State:**
  - `user`: User object with profile data
  - `isAuthenticated`: Boolean flag
- **Actions:**
  - `login(user)`: Set user and authenticate
  - `logout()`: Clear user and auth state
  - `updateUser(updates)`: Partial user updates
  - `switchRole(role)`: Switch between USER/MERCHANT
- **Persistence:** localStorage via Zustand persist middleware

### ✅ Modified Files

#### `components/Header.tsx`
- **Changes:**
  - Import LoginModal component
  - Add `showLoginModal` state
  - Replace static login links with dynamic UI:
    - **Not Logged In:** Show "เข้าสู่ระบบ / สมัครสมาชิก" buttons → Opens LoginModal
    - **Logged In:** Show User Avatar + Name + Logout button
  - Add LoginModal component to render tree

---

## 🎯 User Roles

### 1️⃣ Customer (USER)
```typescript
{
  id: 'user-{timestamp}',
  name: 'Hunter 007',
  email: 'hunter007@iamrootai.com',
  role: 'USER',
  avatar: 'https://i.pravatar.cc/150?img=12',
  phone: '081-234-5678',
  level: 1,
  points: 0
}
```

**Features:**
- Hunt for deals
- Earn points
- Level progression
- Access to wallet, rewards, map

### 2️⃣ Merchant (MERCHANT)
```typescript
{
  id: 'merchant-{timestamp}',
  name: 'Siam Store',
  email: 'siam@store.com',
  role: 'MERCHANT',
  avatar: 'https://images.unsplash.com/.../150x150',
  phone: '02-123-4567',
  shopName: 'Siam Store',
  shopLogo: 'https://images.unsplash.com/.../100x100',
  verified: true
}
```

**Features:**
- Create deals
- Manage shop
- View analytics
- Auto-redirects to `/merchant/dashboard`

---

## 🧪 Testing Instructions

### Test 1: Login as Customer
1. **Start server:** `npm run dev`
2. **Open:** http://localhost:3000
3. **Header:** You should see "เข้าสู่ระบบ / สมัครสมาชิก"
4. **Click:** "เข้าสู่ระบบ"
5. **Modal opens** with two role options
6. **Click:** "Login as Customer" (Green button)
7. **Result:**
   - ✅ Confetti animation plays
   - ✅ Toast: "Welcome back, Hunter 007!"
   - ✅ Modal closes
   - ✅ Header shows avatar + "Hunter 007" + Logout button
   - ✅ Points counter appears

### Test 2: Login as Merchant
1. **Click:** "เข้าสู่ระบบ" (if logged out, else logout first)
2. **Click:** "Login as Merchant" (Blue button)
3. **Result:**
   - ✅ Toast: "Welcome, Siam Store! Redirecting..."
   - ✅ Auto-redirect to `/merchant/dashboard`
   - ✅ Header shows "Siam Store" profile
   - ✅ Merchant sidebar appears

### Test 3: Persistence
1. **Login** as either role
2. **Refresh page** (F5)
3. **Result:**
   - ✅ User stays logged in
   - ✅ Profile still visible in header
   - ✅ localStorage contains auth data

### Test 4: Logout
1. **While logged in**, click "Logout" in header
2. **Result:**
   - ✅ Toast: "Logged out successfully!"
   - ✅ Header returns to "เข้าสู่ระบบ / สมัครสมาชิก"
   - ✅ User state cleared
   - ✅ localStorage cleared

### Test 5: Role Switcher (Existing Feature)
1. **Click** "Switch" button in top bar
2. **Change role** between USER ↔ MERCHANT
3. **Result:**
   - ✅ Header theme updates
   - ✅ Profile reflects new role
   - ✅ Persists on refresh

---

## 🎨 UI Components

### LoginModal Features
- **Header:**
  - Gradient background (orange → red → pink)
  - Animated sparkles icon
  - Close button (X)

- **Customer Button (Green):**
  - Icon: UserCircle
  - Emoji: 🎯
  - Text: "Hunt for deals & earn points"

- **Merchant Button (Blue):**
  - Icon: Store
  - Emoji: 🏪
  - Text: "Manage your shop & deals"

- **Footer:**
  - Register link (placeholder)
  - Demo mode notice (amber badge)

### Header Auth UI
- **Logged Out:**
  - Two text buttons with hover underline
  - Opens LoginModal on click

- **Logged In:**
  - Avatar image (rounded)
  - User name badge
  - Logout button
  - All in top bar (white background with opacity)

---

## 🔧 Technical Details

### State Management (Zustand)
```typescript
// Access auth state
const { user, isAuthenticated, login, logout } = useAuthStore();

// Check if logged in
if (isAuthenticated) {
  // Show protected content
}

// Login
login({
  id: 'user-123',
  name: 'John Doe',
  role: 'USER',
  // ... other fields
});

// Logout
logout();
```

### Persistence (localStorage)
- **Key:** `auth-storage`
- **Data:** `{ user, isAuthenticated }`
- **Auto-save:** On every state change
- **Auto-restore:** On page load

### Routing
- **Customer login:** Stays on current page
- **Merchant login:** Redirects to `/merchant/dashboard`
- **Logout:** Stays on current page

---

## 🚀 Next Steps (Future Enhancements)

### Phase 2: Real Authentication
- [ ] Connect to backend API
- [ ] JWT token management
- [ ] Secure password handling
- [ ] Email verification
- [ ] OAuth (Google, Facebook)

### Phase 3: Profile Management
- [ ] Edit profile page
- [ ] Upload avatar
- [ ] Change password
- [ ] Notification preferences

### Phase 4: Security
- [ ] Protected routes
- [ ] Role-based access control (RBAC)
- [ ] Session timeout
- [ ] Remember me functionality

---

## 📝 Notes

1. **Demo Mode:** This is a client-side simulation. No real authentication server is used.

2. **Security:** Do NOT use this for production without implementing proper backend authentication.

3. **Persistence:** Uses localStorage, which is NOT secure for sensitive data. Use httpOnly cookies in production.

4. **User Data:** Mock data is generated with unique IDs based on timestamp.

5. **Confetti:** Requires `canvas-confetti` package (already installed).

6. **Toast:** Uses `sonner` library (already installed).

---

## ✅ Success Criteria

- [x] Users can click login button
- [x] Modal opens with role selection
- [x] Login as Customer works
- [x] Login as Merchant works + redirects
- [x] Header shows user profile when logged in
- [x] Logout clears state and UI
- [x] State persists on page refresh
- [x] Smooth animations and feedback
- [x] No TypeScript errors
- [x] No runtime errors

---

## 🎉 Result

**The Authentication System is LIVE!**

Users can now:
- ✅ Login with role selection
- ✅ See their profile in header
- ✅ Stay logged in after refresh
- ✅ Logout when needed
- ✅ Experience beautiful UI transitions

**Test it now at:** http://localhost:3000
