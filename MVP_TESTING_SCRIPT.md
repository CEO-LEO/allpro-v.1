# 🎭 MVP Testing Script - 3 บทบาท
## IAMROOT AI - Final Validation

**วันที่ทดสอบ:** ___________  
**ผู้ทดสอบ:** ___________

---

## 👤 บทที่ 1: "นักล่าโปร" (The Hunter)

**เป้าหมาย:** หาของถูก → เช็คของ → เก็บเข้ากระเป๋า

### ✅ Checklist

#### 1.1 หน้าแรก (Home Page)
- [ ] เปิด `http://localhost:3000`
- [ ] เห็น Product Cards แสดงผล
- [ ] เลื่อนดูสินค้าได้ไม่กระตุก
- [ ] **กดเข้าสินค้า 1 ชิ้น** → ไปยังหน้า Product Detail

#### 1.2 เช็คสาขา (Branch Availability)
- [ ] ในหน้า Product Detail เลื่อนลงมา
- [ ] เห็นส่วน **"Branch Availability"** หรือ **"เช็คสต็อกสาขา"**
- [ ] แสดงรายการสาขา (3-5 สาขา)
- [ ] มี badge แสดงสถานะ: ✅ "มีสินค้า" หรือ ❌ "สินค้าหมด"
- [ ] **กดปุ่ม "นำทาง"** → เปิด Google Maps (Tab ใหม่)

**✅ ผ่าน:** Google Maps เปิดและแสดงตำแหน่งสาขา

#### 1.3 เก็บของ (Save Product)
- [ ] ในหน้า Product Detail กดปุ่ม **❤️ หัวใจ**
- [ ] หัวใจเปลี่ยนเป็นสีแดง (filled)
- [ ] มี Toast notification: "บันทึกแล้ว!"
- [ ] ไปยังหน้า `/saved`
- [ ] **เห็นสินค้าที่เพิ่งบันทึก**

**✅ ผ่าน:** สินค้าแสดงในหน้า Saved

#### 1.4 ถาม AI Chatbot
- [ ] กดปุ่ม **🤖 AI Chatbot** (มุมขวาล่าง)
- [ ] Chat modal เปิดขึ้นมา
- [ ] พิมพ์: **"มีโปรมือถือไหม"**
- [ ] กด Enter หรือส่ง
- [ ] AI ตอบกลับภายใน 3-5 วินาที

**✅ ผ่าน:** AI ตอบได้เกี่ยวกับโปรโมชั่นมือถือ

---

## 🗣️ บทที่ 2: "ขาเม้าท์" (The Socializer)

**เป้าหมาย:** อวดของ → ชวนเพื่อน → รับรางวัล

### ✅ Checklist

#### 2.1 โพสต์อวด (Community Post)
- [ ] ไปยัง `/community`
- [ ] กดปุ่ม **"แชร์ดีลดีๆ ที่เจอ..."**
- [ ] Modal เปิดขึ้นมา
- [ ] พิมพ์ข้อความ: **"แอปนี้เจ๋งมาก! หาดีลได้ง่ายสุดๆ 🔥"**
- [ ] กดปุ่ม **"โพสต์"**
- [ ] โพสต์ขึ้นใน feed ทันที

**✅ ผ่าน:** เห็นโพสต์ที่เพิ่งสร้างใน Community Feed

#### 2.2 ชวนเพื่อน (Referral)
- [ ] ไปยัง `/referral`
- [ ] เห็นรหัสชัดเจน (เช่น `HUNTABC1234`)
- [ ] กดปุ่ม **"คัดลอก"**
- [ ] ปุ่มเปลี่ยนเป็น **"คัดลอกแล้ว!"** พร้อม ✓
- [ ] Paste ใน Notepad → **รหัสมาครบถ้วน**

**Link ที่ได้:** `https://iamrootai.com/join?ref=________`

**✅ ผ่าน:** คัดลอกรหัสได้และ link ถูกต้อง

#### 2.3 ดูแรงค์ (Profile & Rank)
- [ ] ไปยัง `/profile`
- [ ] เห็น Avatar/รูปโปรไฟล์
- [ ] แสดงข้อมูล:
  - **Level:** _____
  - **XP:** _____
  - **Coins:** _____
  - **Rank:** Bronze/Silver/Gold
- [ ] Progress bar แสดง % ไปยัง level ถัดไป

**✅ ผ่าน:** ข้อมูลแสดงครบ ไม่มี `NaN` หรือ `undefined`

---

## ⚡ บทที่ 3: "เจ้าของร้าน" (The Merchant)

**เป้าหมาย:** ปล่อยของด่วน (Flash Sale)

### ✅ Checklist

#### 3.1 เข้าโหมด Merchant
- [ ] ไปยัง `/merchant` (หรือใช้ Role Switcher)
- [ ] Dashboard โหลดได้
- [ ] เห็น Stats: Sales, Promotions, Customers
- [ ] มีเมนู: Dashboard, Promotions, Settings

**✅ ผ่าน:** Merchant Dashboard แสดงผลครบ

#### 3.2 ดู Flash Sale (User View)
- [ ] Switch กลับเป็น User mode (หรือเปิด tab ใหม่)
- [ ] ไปยัง `/flash-sales`
- [ ] เห็น Flash Sale cards (อย่างน้อย 2-3 ชิ้น)
- [ ] **นาฬิกาถอยหลัง (Countdown Timer):**
  - มีรูปแบบ `HH:MM:SS`
  - ตัวเลข **เปลี่ยนทุกวินาที**
  - เช่น: `01:23:45` → `01:23:44` → `01:23:43`

**✅ ผ่าน:** Timer นับถอยหลังแบบ real-time

#### 3.3 Progress Bar
- [ ] แต่ละ Flash Sale มี **Stock Progress Bar**
- [ ] สีถูกต้อง:
  - เขียว (< 70%)
  - ส้ม (70-90%)
  - แดง (> 90%)
- [ ] แสดงข้อความ: **"เหลือ X ชิ้น"**

**✅ ผ่าน:** Progress bar แสดงสีและ % ถูกต้อง

---

## 🎯 สรุปผลการทดสอบ

### ผลคะแนน

| บทบาท | ผ่าน/ไม่ผ่าน | หมายเหตุ |
|--------|--------------|----------|
| 👤 นักล่าโปร | ⬜ ผ่าน ⬜ ไม่ผ่าน | __________ |
| 🗣️ ขาเม้าท์ | ⬜ ผ่าน ⬜ ไม่ผ่าน | __________ |
| ⚡ เจ้าของร้าน | ⬜ ผ่าน ⬜ ไม่ผ่าน | __________ |

### 🏆 เกณฑ์ตัดสิน

**✅ PASS:** ผ่านทั้ง 3 บทบาท → **พร้อม Deploy!**  
**⚠️ REVIEW:** มี 1-2 จุดไม่ผ่าน → แก้ไขแล้ว Deploy  
**❌ FAIL:** ผ่านน้อยกว่า 2 → ตรวจสอบและแก้ไขก่อน

---

## 🐛 Bug Report (ถ้ามี)

### Bug #1
- **Location:** _______________
- **Description:** _______________
- **Steps to reproduce:** _______________
- **Expected:** _______________
- **Actual:** _______________

### Bug #2
- **Location:** _______________
- **Description:** _______________

---

## 🚀 Next Step: Deploy to Production

**ถ้าผ่านทั้ง 3 บท → ไปขั้นตอนนี้:**

### Step 1: Push to GitHub

```bash
cd "c:\all pro\iamroot-ai"

# ติดตั้ง Git (ถ้ายังไม่มี)
# Download: https://git-scm.com/download/win

# Initialize Git (ถ้ายังไม่เคย)
git init
git add .
git commit -m "🎉 Final MVP Release: All Features Complete"

# Create GitHub repo:
# 1. ไปที่ https://github.com/new
# 2. ชื่อ: iamroot-ai
# 3. Public/Private
# 4. อย่าเลือก "Initialize with README"
# 5. Create repository

# Connect & Push
git remote add origin https://github.com/[your-username]/iamroot-ai.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **ไปที่:** https://vercel.com
2. **Login** ด้วย GitHub account
3. **Click:** "Add New..." → "Project"
4. **Import** repository: `iamroot-ai`
5. **Environment Variables:** (สำคัญมาก!)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

6. **Click:** "Deploy"
7. **รอ 2-3 นาที**
8. **🎉 Done!** คุณจะได้ URL: `https://iamroot-ai.vercel.app`

---

## 🎊 Deployment Success Checklist

- [ ] Build สำเร็จ (No errors)
- [ ] เปิดลิงก์ Production ได้
- [ ] ทดสอบหน้าหลักทำงาน
- [ ] AI Chatbot ทำงาน (มี API Key)
- [ ] Branch Availability แสดง Map
- [ ] Flash Sales timer นับถอยหลัง
- [ ] Community โพสต์ได้
- [ ] Referral คัดลอกรหัสได้

---

## 🎯 Final Verdict

**ถ้าผ่านทุกข้อ:**

# ✨ CONGRATULATIONS! ✨
## 🎉 YOU ARE PRODUCTION READY! 🎉

**คุณมี MVP ที่สมบูรณ์และพร้อมใช้งานจริง!**

### พร้อมสำหรับ:
- ✅ แชร์ให้เพื่อนทดสอบ
- ✅ Demo นักลงทุน
- ✅ เปิดให้ Beta Users
- ✅ เริ่ม Marketing Campaign
- ✅ หาพาร์ทเนอร์ (Fastwork, ร้านค้า)

---

**Tested By:** _______________  
**Date:** _______________  
**Result:** ⬜ PASS ⬜ REVIEW ⬜ FAIL

**Signature:** _______________
