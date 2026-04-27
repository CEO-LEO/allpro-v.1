# 🔥 IAMROOT AI - โปรโมชั่นเด็ดใกล้คุณ

**แพลตฟอร์มรวมโปรโมชั่นครบที่สุดในไทย** พร้อม Geolocation, AI, และ Admin Dashboard

> 🚀 **Production-Ready** | 📱 **Mobile-First** | 🗺️ **PostGIS** | 🎨 **Pinterest UI**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

---

## ⚡ Quick Start

```bash
# Install + Verify + Run
npm install && npm run verify && npm run dev
```

**เปิด:** [http://localhost:3000](http://localhost:3000) ✨

**ใหม่ 🎯:** รัน `npm run setup` (Windows) หรือ `bash setup.sh` (Mac/Linux)

📚 **คู่มือละเอียด:**
- [QUICKSTART.md](QUICKSTART.md) - เริ่มต้นใช้งาน 5 นาที
- [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) - Deploy ไป Production
- [FIXES_SUMMARY.md](FIXES_SUMMARY.md) - สรุปการแก้ไขล่าสุด

---

## ✨ Features

### 🎯 สำหรับ Users
- **🗺️ Nearby Deals** - โปรใกล้คุณภายใน 5 กม. (PostGIS)
- **📱 Pinterest Feed** - Masonry Grid + Infinite Scroll
- **🔍 Smart Search** - ค้นหาแบบเรียลไทม์
- **💾 Save Deals** - บันทึกโปรโปรด
- **🤖 AI Chatbot** - แนะนำโปรด้วย Gemini AI

### 🛠️ สำหรับ Admin
- **📤 Multi Upload** - อัปโหลดหลายรูป + Auto Watermark
- **📍 Location Picker** - เลือกพิกัดบนแผนที่
- **📊 Analytics** - สถิติแบบเรียลไทม์
- **✏️ Bulk Edit** - จัดการหลายรายการพร้อมกัน

---

## 🏗️ Tech Stack

**Frontend:** Next.js 16 · React 19 · TypeScript · Tailwind · Framer Motion  
**Backend:** Supabase (PostgreSQL + PostGIS + Auth + Storage)  
**State:** Zustand · React Query  
**Deploy:** Vercel

<details>
<summary>📦 Dependencies</summary>

```json
{
  "next": "16.1.4",
  "react": "19.2.3",
  "@supabase/supabase-js": "^2.x",
  "framer-motion": "12.30.0",
  "zustand": "^5.x",
  "react-dropzone": "^15.x",
  "react-masonry-css": "^1.x",
  "react-intersection-observer": "^9.x"
}
```
</details>

---

## 📁 Structure

```
iamroot-ai/
├── app/
│   ├── (user)/          # Feed, Product Detail
│   ├── admin/           # Upload, Dashboard
│   └── api/             # API Routes
├── components/
│   ├── Home/            # MasonryCard, NearbyDeals
│   └── Admin/           # Upload Form
├── hooks/
│   └── useGeolocation.ts  # Browser Geo API
├── store/
│   └── useAppStore.ts     # Zustand State
├── supabase/
│   ├── SETUP_DATABASE.sql  # Schema + RPC
│   └── MOCK_PRODUCTS.sql   # Test Data (20 items)
└── lib/
    └── supabase/           # Client + Server
```

---

## 🗄️ Database Setup

### 1️⃣ Run SQL Scripts
```sql
-- Supabase Dashboard → SQL Editor
-- 1. Copy from: supabase/SETUP_DATABASE.sql → RUN
-- 2. Copy from: supabase/MOCK_PRODUCTS.sql → RUN (optional)
```

### 2️⃣ Create Storage Bucket
```
Storage → New Bucket → Name: "promotions" → Public: Yes
```

### 3️⃣ Verify
```sql
SELECT * FROM nearby_products(13.7460, 100.5340, 5);
-- ควรเห็น products ใกล้สยาม
```

---

## 🧪 Testing

```bash
npm run verify    # ตรวจสอบระบบ
npm run dev       # รัน Development
npm run build     # ทดสอบ Production Build
```

**Manual Tests:**
- ✅ Home Feed โหลดได้
- ✅ Search + Filter ทำงาน
- ✅ Nearby Deals แสดงผล (อนุญาต Location)
- ✅ Admin Upload รูปได้ ([/admin/create-post](http://localhost:3000/admin/create-post))
- ✅ OG Tags ถูกต้อง (ทดสอบด้วย [Facebook Debugger](https://developers.facebook.com/tools/debug/))

---

## 🚀 Deploy to Production

### Vercel (แนะนำ)
```bash
vercel --prod
```

**Environment Variables ที่ต้องตั้งค่า:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Admin features
NEXT_PUBLIC_SITE_URL=https://iamrootai.co
NEXT_PUBLIC_GEMINI_API_KEY=AIza...
```

📖 **คู่มือละเอียด:** [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)

---

## 🎯 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run verify` | ตรวจสอบระบบ |
| `npm run setup` | Quick setup (Windows) |
| `bash setup.sh` | Quick setup (Mac/Linux) |

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| [QUICKSTART.md](QUICKSTART.md) | เริ่มต้นใช้งาน 5 นาที |
| [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) | Deploy Production |
| [FIXES_SUMMARY.md](FIXES_SUMMARY.md) | สรุปการแก้ไข |
| [supabase/SETUP_DATABASE.sql](supabase/SETUP_DATABASE.sql) | Database Schema |
| [supabase/MOCK_PRODUCTS.sql](supabase/MOCK_PRODUCTS.sql) | Test Data |

---

## 🐛 Troubleshooting

<details>
<summary>❌ "nearby_products is not a function"</summary>

รัน `supabase/SETUP_DATABASE.sql` ในSupabase SQL Editor
</details>

<details>
<summary>❌ "Storage bucket not found"</summary>

สร้าง bucket: `promotions` (Public) ใน Storage
</details>

<details>
<summary>❌ "No products showing"</summary>

1. เช็ค Console logs
2. รัน `MOCK_PRODUCTS.sql`
3. ตรวจสอบ Supabase connection
</details>

<details>
<summary>⚠️ CSS Linter Warnings</summary>

ไม่ต้องกังวล - VS Code ไม่รู้จัก Tailwind, ไม่กระทบการทำงาน
</details>

---

## 🎉 What's New (Feb 2026)

### 🔥 Recent Updates
- ✅ Pinterest-style Masonry Grid
- ✅ Infinite Scroll (Intersection Observer)
- ✅ PostGIS Geolocation (nearby_products RPC)
- ✅ Admin Multi-Upload + Auto Watermark
- ✅ Dynamic OG Metadata for Social Sharing
- ✅ Complete Supabase Integration
- ✅ Automated Setup Scripts

---

## 📄 License

MIT License - free to use for personal/commercial projects

---

## 🙏 Acknowledgments

- **Supabase** - Backend Platform
- **Vercel** - Hosting
- **Next.js** - Framework
- **Tailwind** - Styling
- **Google Gemini** - AI Chatbot

---

## 🔗 Links

- 🏠 [Home](http://localhost:3000)
- 📍 [Nearby Deals](http://localhost:3000#nearby)
- 🛠️ [Admin](http://localhost:3000/admin/create-post)
- 📊 [Verify Setup](verify-setup.js)

---

**⭐ Star this repo if it helps you!**

Made with ❤️ in Thailand 🇹🇭
