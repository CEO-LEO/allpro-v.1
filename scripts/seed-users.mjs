/**
 * Seed 230 Mock Users into Supabase
 * 
 * วิธีใช้:
 *   1. npm install @faker-js/faker  (ถ้ายังไม่มี)
 *   2. ตั้ง Environment Variables:
 *        NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
 *        SUPABASE_SERVICE_ROLE_KEY=eyJ...
 *   3. node scripts/seed-users.mjs
 *   
 *   หรือรันแบบ inline:
 *        $env:NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."; node scripts/seed-users.mjs
 * 
 * สคริปต์จะ:
 *   - สร้าง auth.users 230 คน (ผ่าน Supabase Admin API)
 *   - Trigger จะสร้าง profiles row อัตโนมัติ
 *   - อัพเดท profiles ด้วยข้อมูลเพิ่มเติม (xp, coins, level, avatar, tags, etc.)
 *   - สร้าง merchant_profiles สำหรับ 20 ร้านค้า
 *   - Export ข้อมูลเป็น seed-users-output.json
 */

import { createClient } from '@supabase/supabase-js';

// ─── Config ──────────────────────────────────────────────
const isPreview = process.argv.includes('--preview');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;
if (!isPreview) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ ต้องตั้ง NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY');
    console.error('   ตัวอย่าง: $env:NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"');
    process.exit(1);
  }
  supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// ─── Thai Name Data ──────────────────────────────────────
const THAI_FIRST_NAMES_MALE = [
  'สมชาย', 'สมศักดิ์', 'สุรเชษฐ์', 'ธนกร', 'ภาคิน', 'กิตติพงษ์', 'ณัฐวุฒิ', 'พีรพัฒน์',
  'อภิชัย', 'วรพล', 'ชัยวัฒน์', 'ปฏิภาณ', 'ศุภกร', 'จิรายุ', 'ธีรเดช', 'พิชญุตม์',
  'อนุวัฒน์', 'เกรียงไกร', 'นพดล', 'ประเสริฐ', 'วิทยา', 'สุทธิพจน์', 'ภูมิพัฒน์',
  'กฤษฎา', 'อดิศักดิ์', 'ปรมินทร์', 'ธนวัฒน์', 'ชินวัตร', 'ณรงค์', 'บุญเลิศ',
  'พงศกร', 'สิรวิชญ์', 'ศิวกร', 'อัครพล', 'ธราธร', 'กันตพงศ์', 'พชร', 'นราธิป',
  'รัฐศาสตร์', 'เอกพล', 'พิเชษฐ์', 'คมกฤช', 'จักรพันธ์', 'อำนาจ', 'ปิยะ',
];

const THAI_FIRST_NAMES_FEMALE = [
  'สมใจ', 'สุภาพร', 'วิภาวดี', 'นภัสสร', 'ปิยะดา', 'กัลยารัตน์', 'ณัฐธิดา', 'พิมพ์ชนก',
  'อรุณี', 'ศิริพร', 'จันทร์เพ็ญ', 'สุชาดา', 'ธนิดา', 'ปรีญา', 'กมลชนก', 'ณัฐกานต์',
  'รัชดาภรณ์', 'พัชราภา', 'สุวรรณี', 'ลลิตา', 'มาลิณี', 'วรรณภา', 'ชุติกาญจน์',
  'อัญชลี', 'ดารณี', 'เพ็ญนภา', 'ภาวิดา', 'จุฑามาศ', 'กนกวรรณ', 'ประภัสสร',
  'พลอยไพลิน', 'ศศิธร', 'สิริกัญญา', 'อินทิรา', 'ธิดารัตน์', 'กาญจนา', 'นิตยา',
  'รุ่งทิวา', 'พนิดา', 'เบญจวรรณ', 'ดวงใจ', 'เมธินี', 'จารุณี', 'ขวัญจิรา', 'ปภาวี',
];

const THAI_LAST_NAMES = [
  'สุขสวัสดิ์', 'รุ่งเรือง', 'ทองดี', 'แก้วมณี', 'ศรีสุข', 'พงศ์พิพัฒน์', 'วงศ์สว่าง',
  'เจริญสุข', 'มั่นคง', 'ลิ้มสกุล', 'ตันติเวชกุล', 'ชัยนิรันดร์', 'สมบูรณ์', 'พิทักษ์ธรรม',
  'ศิลปชัย', 'ประเสริฐศรี', 'พานิชกุล', 'อุดมศักดิ์', 'วัฒนาพร', 'เกียรติธนา',
  'จิตรประเสริฐ', 'ธนะสิทธิ์', 'คำแก้ว', 'แสงทอง', 'เพชรรัตน์', 'บุญมี', 'สิทธิโชค',
  'มงคลชัย', 'อนันตศักดิ์', 'ภูริพัฒน์', 'กิตติศักดิ์', 'ชาญชัย', 'ดำรงค์เดช',
  'พรหมมินทร์', 'สุวรรณรัตน์', 'นาคะประเวศ', 'ใจกว้าง', 'ศักดิ์ศรี', 'ทิวาพร', 'โชติกานต์',
  'ลีลาศิลป์', 'ภัทรพงศ์', 'โสภณ', 'ประจักษ์ศิลป์', 'เลิศนิมิตร', 'ศรัณย์พร', 'จันทร์สุข',
  'ธีรวัฒน์', 'สุขประเสริฐ', 'อดุลยเดช',
];

const THAI_PROVINCES = [
  'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'เชียงใหม่',
  'ขอนแก่น', 'นครราชสีมา', 'ชลบุรี', 'ภูเก็ต', 'สงขลา',
  'เชียงราย', 'อุดรธานี', 'นครปฐม', 'ระยอง', 'สุราษฎร์ธานี',
];

const SHOP_NAMES = [
  'ร้านลุงหมู BBQ', 'ครัวคุณแม่', 'The Coffee Box', 'ส้มตำนัว', 'ร้านป้าแดง สาขา 2',
  'Gadget Hub TH', 'Beauty Lab BKK', 'ร้านเสื้อผ้าชิค', 'Fit & Fresh Cafe', 'ร้านขนมหวานใจ',
  'สมาร์ทโฟนวิลล์', 'ร้านกาแฟบ้านสวน', 'Speed Sneakers', 'ร้านอาหารครัวบ้าน', 'Digital Market TH',
  'ร้านเบเกอรี่ยิ้มหวาน', 'Pet Lovers Shop', 'Healthy Bowl BKK', 'ร้านผลไม้สดสวน', 'Home Decor Plus',
];

const SHOP_CATEGORIES = ['Food', 'Fashion', 'Beauty', 'Gadget', 'Service', 'Other'];

const TAG_OPTIONS = [
  'อาหาร', 'แฟชั่น', 'ท่องเที่ยว', 'อิเล็กทรอนิกส์', 'ความงาม',
  'สุขภาพ', 'กีฬา', 'เครื่องดื่ม', 'ของใช้ในบ้าน', 'สัตว์เลี้ยง',
];

const GENDERS = ['male', 'female', 'other'];
const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'];

// ─── Utility Functions ───────────────────────────────────
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomDate(daysBack) {
  const now = new Date();
  const past = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

/** สร้างชื่อไทยสมจริง */
function generateThaiName() {
  const isMale = Math.random() > 0.5;
  const firstName = isMale
    ? randomItem(THAI_FIRST_NAMES_MALE)
    : randomItem(THAI_FIRST_NAMES_FEMALE);
  const lastName = randomItem(THAI_LAST_NAMES);
  const gender = isMale ? 'male' : 'female';
  return { firstName, lastName, fullName: `${firstName} ${lastName}`, gender };
}

/** สร้าง email จากชื่อไทย (transliterate เป็น eng-like) */
function generateEmail(firstName, lastName, index) {
  // ใช้ index + random เพื่อให้ unique
  const prefix = `user${String(index).padStart(3, '0')}`;
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
  const domain = index % 3 === 0 ? randomItem(domains) : 'gmail.com';
  return `${prefix}.allpro@${domain}`;
}

/** สร้างเบอร์โทรไทย */
function generateThaiPhone() {
  const prefixes = ['08', '09', '06'];
  return `${randomItem(prefixes)}${randomInt(1, 9)}${String(randomInt(1000000, 9999999)).padStart(7, '0')}`;
}

function generateAvatar(name, index) {
  const colors = ['FF5722', '2196F3', '4CAF50', '9C27B0', 'FF9800', 'E91E63', '00BCD4', '795548'];
  const bg = randomItem(colors);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=${bg}&color=fff&bold=true`;
}

// ─── Generate All Users ──────────────────────────────────
function generateUsers(count = 230) {
  const users = [];
  const merchantCount = 20; // 20 ร้านค้า + 210 ผู้ใช้ปกติ

  for (let i = 1; i <= count; i++) {
    const { firstName, lastName, fullName, gender } = generateThaiName();
    const isMerchant = i <= merchantCount;
    const role = isMerchant ? 'MERCHANT' : 'USER';
    const email = generateEmail(firstName, lastName, i);
    const createdAt = randomDate(180); // 6 เดือนย้อนหลัง
    const level = isMerchant ? randomInt(3, 15) : randomInt(1, 12);

    const user = {
      index: i,
      email,
      password: `AllPro@2026!`,
      fullName,
      role,
      gender,
      ageRange: randomItem(AGE_RANGES),
      phone: generateThaiPhone(),
      avatar: generateAvatar(fullName, i),
      province: randomItem(THAI_PROVINCES),
      xp: level * randomInt(80, 200),
      coins: randomInt(10, 500),
      level,
      preferredTags: randomItems(TAG_OPTIONS, randomInt(2, 5)),
      onboardingCompleted: Math.random() > 0.15, // 85% สำเร็จ
      profileCompleted: Math.random() > 0.2,
      createdAt: createdAt.toISOString(),
    };

    // ข้อมูลร้านค้าสำหรับ Merchant
    if (isMerchant) {
      user.shop = {
        name: SHOP_NAMES[i - 1] || `ร้าน${fullName}`,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.shop?.name || SHOP_NAMES[i - 1] || fullName)}&size=128&background=FF5722&color=fff&rounded=true`,
        address: `${randomInt(1, 999)} ถ.${randomItem(['สุขุมวิท', 'พหลโยธิน', 'รัชดาภิเษก', 'ลาดพร้าว', 'เพชรบุรี', 'สีลม', 'วิภาวดี', 'รามอินทรา', 'บางนา-ตราด'])} ${randomItem(THAI_PROVINCES)}`,
        phone: generateThaiPhone(),
        lineId: `@${SHOP_NAMES[i - 1]?.replace(/\s/g, '').toLowerCase().slice(0, 10) || 'shop' + i}`,
        category: randomItem(SHOP_CATEGORIES),
      };
      // Fix shop logo to use shop name
      user.shop.logo = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.shop.name)}&size=128&background=FF5722&color=fff&rounded=true`;
    }

    users.push(user);
  }

  return users;
}

// ─── Insert into Supabase ────────────────────────────────
async function seedUsers() {
  const users = generateUsers(230);

  console.log(`\n🚀 เริ่มสร้างผู้ใช้ ${users.length} บัญชี...\n`);
  console.log(`   📊 USER: ${users.filter(u => u.role === 'USER').length} คน`);
  console.log(`   🏪 MERCHANT: ${users.filter(u => u.role === 'MERCHANT').length} ร้าน\n`);

  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (const user of users) {
    try {
      // 1. สร้าง auth.users ผ่าน Admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // ข้าม email verification
        user_metadata: {
          name: user.fullName,
          role: user.role,
        },
      });

      if (authError) {
        // ถ้า email ซ้ำ ข้ามไป
        if (authError.message.includes('already been registered')) {
          console.log(`⏭️  [${user.index}] ${user.email} — มีอยู่แล้ว, ข้าม`);
          continue;
        }
        throw authError;
      }

      const userId = authData.user.id;

      // 2. อัพเดท profiles (trigger สร้าง row แล้ว แต่เราเพิ่มข้อมูล)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: user.email,
          username: user.fullName,
          avatar_url: user.avatar,
          phone: user.phone,
          xp: user.xp,
          coins: user.coins,
          level: user.level,
          role: user.role,
          preferred_tags: user.preferredTags,
          onboarding_completed: user.onboardingCompleted,
          gender: user.gender,
          age_range: user.ageRange,
          profile_completed: user.profileCompleted,
          created_at: user.createdAt,
        }, { onConflict: 'id' });

      if (profileError) {
        console.warn(`⚠️  [${user.index}] Profile error: ${profileError.message}`);
      }

      // 3. สร้าง merchant_profiles ถ้าเป็นร้านค้า
      if (user.role === 'MERCHANT' && user.shop) {
        const { error: merchantError } = await supabase
          .from('merchant_profiles')
          .upsert({
            user_id: userId,
            shop_name: user.shop.name,
            shop_logo: user.shop.logo,
            shop_address: user.shop.address,
            phone: user.shop.phone,
            line_id: user.shop.lineId,
          }, { onConflict: 'user_id' });

        if (merchantError) {
          console.warn(`⚠️  [${user.index}] Merchant profile error: ${merchantError.message}`);
        }
      }

      successCount++;
      const icon = user.role === 'MERCHANT' ? '🏪' : '👤';
      console.log(`${icon} [${user.index}/${users.length}] ✅ ${user.fullName} (${user.email})`);

      results.push({
        id: userId,
        email: user.email,
        name: user.fullName,
        role: user.role,
        shop: user.shop?.name || null,
      });

    } catch (err) {
      errorCount++;
      console.error(`❌ [${user.index}] ${user.email}: ${err.message}`);
    }

    // เว้นจังหวะเล็กน้อยป้องกัน rate limit
    if (user.index % 10 === 0) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // ─── Summary ─────────────────────────────
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✅ สำเร็จ: ${successCount} บัญชี`);
  console.log(`❌ ล้มเหลว: ${errorCount} บัญชี`);
  console.log(`${'═'.repeat(50)}\n`);

  // Export JSON
  const { writeFileSync } = await import('fs');
  const { fileURLToPath } = await import('url');
  const { dirname, join } = await import('path');
  const outputPath = join(dirname(fileURLToPath(import.meta.url)), 'seed-users-output.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`📄 ข้อมูลถูกบันทึกที่: ${outputPath}\n`);

  // Print sample
  console.log('📋 ตัวอย่าง 5 บัญชีแรก:');
  console.table(results.slice(0, 5).map(r => ({
    email: r.email,
    name: r.name,
    role: r.role,
    shop: r.shop || '-',
  })));
}

// ─── Preview Mode (ดูตัวอย่างก่อน insert) ────────────────
function previewSample() {
  const users = generateUsers(10);
  console.log('\n📋 ตัวอย่าง Mock Data 10 บัญชี:\n');
  console.log(JSON.stringify(users, null, 2));
  return users;
}

// ─── Run ─────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.includes('--preview')) {
  previewSample();
} else {
  seedUsers().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
