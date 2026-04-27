# 🚀 IAMROOT AI - Production Setup Guide

## ขั้นตอนที่ 1: Environment Variables

เปิดไฟล์ `.env.local` และตรวจสอบว่ามีค่าครบถ้วน:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hzq3h5ib.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  # ⚠️ ต้องเพิ่ม

# Site URL (สำคัญสำหรับ OG Tags)
NEXT_PUBLIC_SITE_URL=https://iamrootai.co  # เปลี่ยนเป็น domain จริง

# AI
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyC...
```

**วิธีหา Service Role Key:**
1. เข้า [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือก Project → Settings → API
3. คัดลอก `service_role` key (secret!)

---

## ขั้นตอนที่ 2: Setup Supabase Database

1. เข้า Supabase Dashboard → SQL Editor
2. เปิดไฟล์ `supabase/SETUP_DATABASE.sql`
3. Copy ทั้งหมดแล้ววางใน SQL Editor
4. กด **RUN** (ใช้เวลา ~30 วินาที)

**สิ่งที่ SQL script จะทำ:**
- ✅ เปิด PostGIS extension
- ✅ สร้าง Storage bucket `promotions`
- ✅ เพิ่มคอลัมน์ `lat`, `lng`, `location_point` ใน products table
- ✅ สร้าง RPC function `nearby_products()`
- ✅ ตั้งค่า Row Level Security policies

---

## ขั้นตอนที่ 3: สร้าง Storage Bucket

**ถ้า SQL ไม่ได้สร้าง bucket อัตโนมัติ:**

1. ไป Storage → New Bucket
2. ชื่อ: `promotions`
3. Public: **Yes** ✅
4. Allowed MIME types: `image/*`
5. Max file size: `10 MB`
6. Create

---

## ขั้นตอนที่ 4: ทดสอบระบบ

### 4.1 ทดสอบ Geolocation
```sql
-- รัน SQL นี้เพื่อทดสอบ
SELECT * FROM nearby_products(13.7460, 100.5340, 5);
```

### 4.2 ทดสอบ Admin Upload
1. เข้า `/admin/create-post`
2. อัปโหลดรูป 2-3 รูป
3. กรอกข้อมูล:
   - ชื่อ: "ทดสอบระบบ"
   - หมวดหมู่: เลือกอะไรก็ได้
   - วันเริ่ม-สิ้นสุด
4. กด **ลงโปรโมชั่นทันที**

**ถ้าสำเร็จ:** จะมี Product ID ใหม่ปรากฏ  
**ถ้าล้มเหลว:** เช็ค Console หรืออ่าน error message

### 4.3 ทดสอบ OG Metadata
1. เปิด product page: `/product/{id}`
2. ใช้ [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
3. วาง URL แล้วกด **Debug**
4. ควรเห็น OG image + title + description

---

## ขั้นตอนที่ 5: เพิ่ม Mock Data (Optional)

ถ้าต้องการ products ทดสอบพร้อมพิกัด:

```sql
-- เพิ่มพิกัดให้ products ที่มีอยู่
UPDATE products SET 
  lat = 13.7460, 
  lng = 100.5340,
  verified = true
WHERE id IN (SELECT id FROM products LIMIT 10);

-- หรือ Insert ข้อมูลใหม่
INSERT INTO products (title, description, price, "originalPrice", image, category, "shopName", lat, lng, verified)
VALUES 
('iPhone 15 Pro ลดพิเศษ', 'ของแท้ประกันศูนย์', 39900, 49900, 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c', 'มือถือ', 'iStudio', 13.7462, 100.5347, true),
('กาแฟ Americano ซื้อ 1 แถม 1', 'ทุกวัน 14:00-16:00', 50, 100, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', 'เครื่องดื่ม', 'Coffee Shop', 13.7450, 100.5280, true);
```

---

## ขั้นตอนที่ 6: Deploy to Production

### Option A: Vercel (แนะนำ)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

**ตั้งค่า Environment Variables ใน Vercel:**
- ไป Project Settings → Environment Variables
- เพิ่ม `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

### Option B: Docker

```bash
# Build
docker build -t iamrootaimo .

# Run
docker run -p 3000:3000 --env-file .env.local iamrootaimo
```

---

## 🔧 Troubleshooting

### ❌ "nearby_products is not a function"
**แก้:** รัน `supabase/SETUP_DATABASE.sql` อีกครั้ง ส่วนที่ 6

### ❌ "Storage bucket not found"
**แก้:** สร้าง bucket ชื่อ `promotions` ใน Supabase Storage (Public = Yes)

### ❌ "Insert into products failed"
**แก้:** เช็คว่า products table มีคอลัมน์ครบ:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products';
```

### ❌ OG Image ไม่แสดง
**แก้:** 
1. เปลี่ยน `public/og-default.jpg` เป็นรูปจริง (1200x630px)
2. ตั้งค่า `NEXT_PUBLIC_SITE_URL` ให้ถูกต้อง

---

## ✅ Checklist ก่อน Production

- [ ] มี `SUPABASE_SERVICE_ROLE_KEY` ใน `.env.local`
- [ ] มี `NEXT_PUBLIC_SITE_URL` ตรงกับ domain จริง
- [ ] รัน `SETUP_DATABASE.sql` ครบทุกส่วน
- [ ] สร้าง Storage bucket `promotions` (Public)
- [ ] ทดสอบ create-post อัปโหลดได้
- [ ] ทดสอบ nearby_products RPC ทำงาน
- [ ] เปลี่ยน `og-default.jpg` เป็นรูปจริง
- [ ] Products ใน DB มีพิกัด lat/lng

---

## 📊 Performance Tips

1. **Enable Edge Functions:**
   ```typescript
   export const runtime = 'edge';
   ```

2. **Image Optimization:**
   - Supabase Storage รองรับ resize: `?width=800&height=600`
   - ใช้ CDN เช่น Cloudflare

3. **Database Index:**
   - Index ถูกสร้างอัตโนมัติใน SQL script แล้ว

---

## 🎯 Next Steps

1. **Analytics:** เพิ่ม Google Analytics / Plausible
2. **Monitoring:** ตั้งค่า Sentry error tracking
3. **SEO:** Generate `sitemap.xml` จาก products
4. **Performance:** เพิ่ม Redis cache สำหรับ nearby_products

---

**Documentation:** ดูเพิ่มเติมที่ `README.md` โครงการ  
**Support:** เปิด Issue ใน GitHub repo
