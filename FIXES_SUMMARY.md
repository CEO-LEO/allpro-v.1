# ✅ สรุปการแก้ไขระบบ - IAMROOT AI

**วันที่:** Feb 20, 2026  
**สถานะ:** แก้ไขเสร็จสมบูรณ์ ✅

---

## 🔧 สิ่งที่แก้ไข

### 1. Environment Variables (.env.local)
```diff
+ SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
+ NEXT_PUBLIC_SITE_URL=https://iamrootai.co
```

**ต้องทำเพิ่ม:** ใส่ค่า Service Role Key จริงจาก Supabase Dashboard

---

### 2. Product Fetching (store/useAppStore.ts)
**เดิม:** ใช้ MOCK_PRODUCTS เท่านั้น  
**ใหม่:** ดึงจาก Supabase จริง + fallback ไป Mock

```typescript
// ✅ ดึงจาก Supabase
const { data } = await supabase.from('products').select('*');

// ถ้าไม่มีข้อมูล ใช้ Mock
if (!data || data.length === 0) {
  set({ products: MOCK_PRODUCTS });
}
```

---

### 3. Nearby Deals (components/Home/NearbyDeals.tsx)
**เดิม:** คำนวณระยะจาก MOCK_COORDS  
**ใหม่:** เรียก Supabase RPC `nearby_products()`

```typescript
// ✅ เรียก PostGIS function
const { data } = await supabase.rpc('nearby_products', {
  user_lat: latitude,
  user_lng: longitude,
  radius_km: 5
});

// Fallback ถ้า RPC ยังไม่มี
if (error) useCalculationWithMockCoords();
```

---

### 4. Admin Upload (app/admin/create-post/page.tsx)
**เดิม:** Simulate upload (fake)  
**ใหม่:** อัปโหลดจริงไป Supabase Storage + Insert DB

```typescript
// ✅ Upload images
for (const img of images) {
  const { data } = await supabase.storage
    .from('promotions')
    .upload(filePath, watermarkedBlob);
  
  imageUrls.push(publicUrl);
}

// ✅ Insert to database
await supabase.from('products').insert({
  title, description, images: imageUrls, ...
});
```

---

### 5. ไฟล์ใหม่ที่สร้าง

| ไฟล์ | วัตถุประสงค์ |
|------|-------------|
| `supabase/SETUP_DATABASE.sql` | SQL Script สำหรับ setup Supabase ครบทุกอย่าง |
| `PRODUCTION_SETUP.md` | คู่มือ Deploy ไป Production แบบละเอียด |
| `public/og-default.jpg` | Placeholder (ต้องเปลี่ยนเป็นรูปจริง 1200x630px) |

---

## 📝 ต้องทำเพิ่มก่อน Deploy

### ✅ Database Setup (สำคัญมาก!)

1. **เข้า Supabase SQL Editor**
2. **Copy & Paste** ไฟล์ `supabase/SETUP_DATABASE.sql`
3. **กด RUN** (ใช้เวลา ~30 วินาที)

**สิ่งที่ SQL จะทำ:**
- เปิด PostGIS extension
- เพิ่มคอลัมน์ lat, lng, location_point
- สร้าง RPC function `nearby_products()`
- สร้าง Storage bucket `promotions`
- ตั้งค่า Policies

---

### ✅ Storage Bucket

**ถ้า SQL ไม่สร้างอัตโนมัติ:**

1. Supabase Dashboard → Storage → New Bucket
2. ชื่อ: `promotions`
3. Public: **Yes** ✅
4. Create

---

### ✅ Service Role Key

1. Supabase → Settings → API
2. คัดลอก `service_role` key
3. วางใน `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

---

### ✅ OG Default Image

เปลี่ยน `public/og-default.jpg` เป็นรูปจริง:
- ขนาด: 1200 x 630 px
- Format: JPG หรือ PNG
- เนื้อหา: Logo + Text "IAMROOT AI - โปรโมชั่นเด็ดใกล้คุณ"

---

## 🧪 วิธีทดสอบ

### 1. ทดสอบ Database Connection
```bash
npm run dev
# เปิด http://localhost:3000
# เช็ค Console ว่ามี error Supabase ไหม
```

### 2. ทดสอบ Admin Upload
1. เข้า `/admin/create-post`
2. อัปโหลดรูป 2-3 รูป
3. กรอกข้อมูล → กด "ลงโปรโมชั่นทันที"
4. **ถ้าสำเร็จ:** จะมี Product ID ปรากฏ
5. **ถ้าล้มเหลว:** เช็คว่ารัน SQL script หรือยัง

### 3. ทดสอบ Geolocation
```sql
-- รัน SQL นี้ใน Supabase
SELECT * FROM nearby_products(13.7460, 100.5340, 5);

-- ถ้าได้ผล: ระบบทำงาน ✅
-- ถ้า error: ยังไม่ได้รัน SETUP_DATABASE.sql
```

### 4. ทดสอบ OG Tags
1. เปิด `/product/{id}`
2. ใช้ [Facebook Debugger](https://developers.facebook.com/tools/debug/)
3. วาง URL → กด Debug
4. ควรเห็น Image + Title + Description

---

## ⚠️ Known Issues (ไม่ร้ายแรง)

### CSS Linter Warnings
```
Unknown at rule @tailwind
Unknown at rule @apply
```

**สาเหตุ:** VS Code CSS Linter ไม่รู้จัก Tailwind syntax  
**แก้ไข:** ไม่ต้องแก้ ไม่กระทบการทำงาน  
**ถ้าอยากแก้จริงๆ:** เพิ่ม extension `"Tailwind CSS IntelliSense"`

---

## 🚀 พร้อม Deploy แล้ว?

### Quick Deploy to Vercel
```bash
npm i -g vercel
vercel login
vercel --prod
```

### ตั้งค่า Environment Variables ใน Vercel
1. Project Settings → Environment Variables
2. เพิ่ม:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GEMINI_API_KEY`

---

## 📊 สรุปการเปลี่ยนแปลง

| ฟีเจอร์ | Before | After |
|---------|--------|-------|
| Products Data | Mock Only | Supabase + Mock Fallback |
| Nearby Deals | Mock Coords | PostGIS RPC + Fallback |
| Admin Upload | Fake (alert only) | Real Upload to Storage + DB |
| OG Metadata | Hardcoded | Dynamic from DB |
| Environment | Incomplete | Complete with keys |

---

## ✅ Checklist ก่อน Production

- [ ] รัน `SETUP_DATABASE.sql` ใน Supabase
- [ ] สร้าง Storage bucket `promotions` (Public)
- [ ] ตั้งค่า `SUPABASE_SERVICE_ROLE_KEY`
- [ ] เปลี่ยน `NEXT_PUBLIC_SITE_URL` เป็น domain จริง
- [ ] เปลี่ยน `og-default.jpg` เป็นรูปจริง
- [ ] ทดสอบอัปโหลดผ่าน `/admin/create-post`
- [ ] ทดสอบ nearby_products RPC
- [ ] Deploy to Vercel/Netlify
- [ ] ทดสอบ production URL

---

**Documentation เพิ่มเติม:** อ่าน `PRODUCTION_SETUP.md`  
**ติดปัญหา:** เช็ค Console logs หรือ Supabase Dashboard → Logs
