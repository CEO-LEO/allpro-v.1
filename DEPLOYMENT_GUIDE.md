# 🚀 Deployment Guide - Vercel
## Pro Hunter x Fastwork

---

## 📋 Pre-Deployment Checklist

### ✅ ก่อน Deploy ต้องมีให้ครบ:

- [ ] **GitHub Account** - สมัครที่ https://github.com
- [ ] **Vercel Account** - สมัครที่ https://vercel.com
- [ ] **Environment Variables Ready:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_GEMINI_API_KEY`
- [ ] **Code ผ่านการทดสอบ** (ตาม MVP_TESTING_SCRIPT.md)

---

## 🎯 Method 1: Deploy ผ่าน GitHub (แนะนำ)

### Step 1: Install Git

**ถ้ายังไม่มี Git:**
1. ดาวน์โหลด: https://git-scm.com/download/win
2. ติดตั้ง (กด Next ไปเรื่อยๆ)
3. Restart Terminal/VS Code

**ตรวจสอบ:**
```bash
git --version
# ควรได้: git version 2.x.x
```

---

### Step 2: Config Git (ครั้งแรกเท่านั้น)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

### Step 3: Initialize Git Repository

```bash
# เข้าโฟลเดอร์โปรเจ็กต์
cd "c:\all pro\pro-hunter"

# สร้าง Git repo
git init

# เพิ่มไฟล์ทั้งหมด
git add .

# Commit
git commit -m "🎉 Initial commit: Pro Hunter MVP v1.0 - Complete with Community, Flash Sales, Referral & All Features"

# ตรวจสอบสถานะ
git status
# ควรได้: nothing to commit, working tree clean
```

---

### Step 4: Create GitHub Repository

1. **ไปที่:** https://github.com/new
2. **Repository name:** `pro-hunter`
3. **Description:** `Deal discovery platform with Fastwork integration - Community, Flash Sales, Branch Availability`
4. **Visibility:** 
   - ✅ Public (แนะนำ - Deploy ฟรีได้)
   - ⬜ Private (ต้องใช้ Vercel Pro)
5. **⚠️ อย่าเลือก:**
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. **Click:** "Create repository"

---

### Step 5: Push to GitHub

```bash
# เชื่อมต่อกับ GitHub
git remote add origin https://github.com/[YOUR_USERNAME]/pro-hunter.git

# เปลี่ยน branch เป็น main
git branch -M main

# Push ขึ้น GitHub
git push -u origin main
```

**ถ้าถาม Username & Password:**
- Username: [your-github-username]
- Password: **ใช้ Personal Access Token แทน** (ไม่ใช่รหัสผ่านปกติ)

**สร้าง Token:**
1. ไปที่: https://github.com/settings/tokens
2. Generate new token (classic)
3. เลือก scopes: `repo`
4. Copy token แล้วใช้แทน password

---

### Step 6: Deploy to Vercel

1. **ไปที่:** https://vercel.com
2. **Sign Up/Login** ด้วย GitHub account
3. **Click:** "Add New..." → "Project"
4. **Import Git Repository:**
   - เลือก `pro-hunter`
   - Click "Import"

5. **Configure Project:**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build (auto-detect)
   Output Directory: .next (auto-detect)
   Install Command: npm install (auto-detect)
   ```

6. **Environment Variables (สำคัญมาก!):**
   
   Click "Environment Variables" แล้วเพิ่ม:

   | Key | Value | Environment |
   |-----|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | [your-supabase-url] | Production |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | [your-supabase-key] | Production |
   | `NEXT_PUBLIC_GEMINI_API_KEY` | [your-gemini-key] | Production |

   **⚠️ หา Values เหล่านี้:**
   - เปิดไฟล์ `.env.local` ในโปรเจ็กต์
   - Copy ค่ามาวาง (ไม่รวม `NEXT_PUBLIC_` ซ้ำ)

7. **Click:** "Deploy"

8. **รอ 2-3 นาที** 🎬

9. **🎉 Success!** คุณจะได้:
   - Production URL: `https://pro-hunter.vercel.app`
   - หรือ: `https://pro-hunter-[random].vercel.app`

---

## 🎯 Method 2: Deploy ผ่าน Vercel CLI (สำหรับ Pro)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd "c:\all pro\pro-hunter"
vercel

# Follow prompts:
# Set up and deploy? Yes
# Which scope? [your-username]
# Link to existing project? No
# Project name? pro-hunter
# Directory? ./
# Override settings? No

# Deploy to production
vercel --prod
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Build failed"

**Possible causes:**
- Missing environment variables
- TypeScript errors
- Missing dependencies

**Solution:**
```bash
# ทดสอบ build local ก่อน
npm run build

# ถ้า error ให้แก้ก่อน deploy
npm run lint
```

---

### Issue 2: "Environment variables not working"

**Check:**
1. ตรวจว่า Key name ถูกต้อง (case-sensitive)
2. ต้องขึ้นต้นด้วย `NEXT_PUBLIC_` สำหรับ client-side
3. Deploy ใหม่หลังเพิ่ม env vars

**Fix:**
- ไปที่ Vercel Dashboard
- Project Settings → Environment Variables
- เพิ่ม/แก้ไข variables
- Redeploy

---

### Issue 3: "Module not found"

**Solution:**
```bash
# ลบ node_modules และ lock files
rm -rf node_modules
rm package-lock.json

# ติดตั้งใหม่
npm install

# Commit changes
git add .
git commit -m "Fix dependencies"
git push
```

---

### Issue 4: "404 on some pages"

**Check:**
- ตรวจว่าไฟล์อยู่ใน `app/(user)/[page-name]/page.tsx`
- ไม่ใช่ `page.ts` (ต้อง `.tsx`)
- File name ต้องเป็น `page.tsx` (lowercase)

---

## 🔄 Update Deployment (หลัง Deploy แล้ว)

**เมื่อแก้โค้ดและต้องการ update:**

```bash
# 1. Save changes
# 2. Commit
git add .
git commit -m "Update: Added new feature"

# 3. Push
git push

# 4. Vercel จะ auto-deploy ใหม่ทันที!
```

---

## 🎨 Custom Domain (Optional)

**ถ้าต้องการ Domain ของตัวเอง:**

1. ซื้อ Domain (เช่น `prohunter.io`)
2. ไปที่ Vercel Dashboard → Project → Settings → Domains
3. เพิ่ม Custom Domain
4. Update DNS Records ตามที่ Vercel บอก
5. รอ DNS propagate (5-30 นาที)

---

## 📊 Post-Deployment Checklist

### ✅ หลัง Deploy ให้ทดสอบ:

- [ ] เปิด Production URL ได้
- [ ] **หน้าแรก** → Product แสดงผล
- [ ] **Search** → ค้นหาได้
- [ ] **Map** → แผนที่โหลดได้
- [ ] **Flash Sales** → Timer ทำงาน
- [ ] **Community** → โพสต์ได้
- [ ] **Referral** → Copy code ได้
- [ ] **Product Detail** → Branch Availability แสดงผล
- [ ] **AI Chatbot** → ตอบคำถามได้ (ต้องมี API Key)
- [ ] **Mobile** → Responsive ทำงานดี
- [ ] **Performance** → โหลดเร็ว (< 3 วินาที)

### 🐛 ถ้าเจอ Error:

1. เช็ค Vercel Logs:
   - Dashboard → Project → Deployments → [Latest] → Function Logs
2. เช็ค Browser Console:
   - F12 → Console → ดู Error
3. เช็ค Environment Variables:
   - Settings → Environment Variables
4. Redeploy:
   - Deployments → [Latest] → ... → Redeploy

---

## 🎉 Success Indicators

**คุณ Deploy สำเร็จเมื่อ:**

✅ Build Status: "Ready"  
✅ Production URL เปิดได้  
✅ No Console Errors  
✅ All Features ทำงาน  
✅ Mobile Responsive  
✅ Fast Load Time  

---

## 📈 Next Steps After Deployment

### 1. Share & Collect Feedback
```
แชร์ลิงก์:
https://iamroot-ai.vercel.app

ให้เพื่อน/ครอบครัวทดสอบ 5-10 คน
รวบรวม feedback
```

### 2. Monitor Analytics
- Vercel Analytics (ฟรี)
- Google Analytics (ถ้าติดตั้ง)

### 3. SEO Optimization
- เพิ่ม meta tags
- Add sitemap
- Submit to Google Search Console

### 4. Marketing
- Social Media (Facebook, Twitter, LinkedIn)
- Product Hunt launch
- Thai Startup Community

### 5. Iterate
- แก้ bugs จาก feedback
- เพิ่ม features ใหม่
- Improve performance

---

## 🎯 Deployment Summary

```
Local Development  →  Git Commit  →  Push to GitHub  →  Vercel Deploy
     (PC)              (Git)          (GitHub)           (Production)
```

**Timeline:**
- Git Setup: 5 นาที
- GitHub Upload: 2 นาที
- Vercel Deploy: 3 นาที
- **Total: ~10 นาที**

---

## 🆘 Need Help?

**Vercel Documentation:**
https://vercel.com/docs

**Vercel Support:**
https://vercel.com/support

**Community:**
- GitHub Issues
- Stack Overflow
- Vercel Discord

---

## ✨ Final Note

**ยินดีด้วยครับ!** 🎉

เมื่อ Deploy สำเร็จ คุณจะมี:
- ✅ MVP ที่ใช้งานได้จริง
- ✅ URL สาธารณะแชร์ได้
- ✅ Auto-deployment ทุกครั้งที่ push
- ✅ HTTPS ฟรี
- ✅ CDN ระดับโลก

**คุณพร้อม GO TO MARKET แล้วครับ!** 🚀💰
