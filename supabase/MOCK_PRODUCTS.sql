-- =====================================================
-- Mock Products with Coordinates - Bangkok Area
-- =====================================================
-- รัน SQL นี้หลังจาก SETUP_DATABASE.sql เสร็จแล้ว
-- จะเพิ่ม 20 products ตัวอย่างพร้อมพิกัดในกรุงเทพ
-- =====================================================

-- ลบข้อมูลเก่า (ถ้ามี)
-- DELETE FROM products WHERE "shopName" = 'Demo Store';

-- Insert Mock Products with Real Bangkok Coordinates
INSERT INTO products (
  title, 
  description, 
  price, 
  "originalPrice", 
  "promoPrice",
  discount,
  image, 
  category, 
  "shopName",
  lat, 
  lng,
  verified,
  rating,
  tags,
  "validUntil"
) VALUES 
-- สยาม-ราชประสงค์ (13.746, 100.532-535)
(
  'iPhone 15 Pro Max ลดพิเศษ 20%',
  'ของแท้ประกันศูนย์ไทย 1 ปีเต็ม จัดส่งฟรี รับได้ทันที',
  39900, 49900, 39900, 20,
  'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800',
  'มือถือ', 'iStudio Central World',
  13.7462, 100.5347,
  true, 4.8,
  ARRAY['สมาร์ทโฟน', 'iPhone', 'ของแท้'],
  CURRENT_DATE + INTERVAL '30 days'
),
(
  'กาแฟ Americano ซื้อ 1 แถม 1',
  'ทุกวัน 14:00-16:00 เครื่องดื่มทุกแก้วเท่านั้น',
  50, 100, 50, 50,
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
  'เครื่องดื่ม', 'Café Amazon Siam',
  13.7450, 100.5280,
  true, 4.5,
  ARRAY['กาแฟ', 'ซื้อ1แถม1'],
  CURRENT_DATE + INTERVAL '7 days'
),
(
  'บุฟเฟ่ต์ชาบู 299 บาท ไม่จำกัดเวลา',
  'เนื้อหมู-ไก่-ทะเล พร้อมผักสดกว่า 30 รายการ',
  299, 450, 299, 33,
  'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800',
  'อาหาร', 'MK Restaurant Siam Paragon',
  13.7460, 100.5320,
  true, 4.7,
  ARRAY['บุฟเฟ่ต์', 'ชาบู', 'ไม่จำกัดเวลา'],
  CURRENT_DATE + INTERVAL '60 days'
),

-- เอกมัย-ทองหล่อ (13.730-740, 100.560-577)
(
  'ทำเล็บ Gel ลด 50% เหลือ 399',
  'ทำเล็บมือ+เท้า รวมถอดเก่า พร้อมดูแลผิว',
  399, 799, 399, 50,
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800',
  'ความงาม', 'Nail Bar Thonglor',
  13.7310, 100.5677,
  true, 4.6,
  ARRAY['ทำเล็บ', 'Gel', 'ลด50%'],
  CURRENT_DATE + INTERVAL '14 days'
),
(
  'ฟิตเนส 3 เดือน 2,999 บาท',
  'ห้องออกกำลังกาย + สระว่ายน้ำ + ซาวน่า ไม่จำกัด',
  2999, 5999, 2999, 50,
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
  'ฟิตเนส', 'Fitness First Ekkamai',
  13.7380, 100.5600,
  true, 4.9,
  ARRAY['ฟิตเนส', 'สระว่ายน้ำ', '3เดือน'],
  CURRENT_DATE + INTERVAL '90 days'
),

-- สุขุมวิท-พร้อมพงษ์-อโศก (13.737-743, 100.552-561)
(
  'Nike Air Max ลดสูงสุด 40%',
  'รองเท้าวิ่ง Nike ของแท้ มี QR Code ตรวจสอบ',
  3990, 6650, 3990, 40,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  'แฟชั่น', 'Nike Store EmQuartier',
  13.7400, 100.5520,
  true, 4.8,
  ARRAY['Nike', 'รองเท้า', 'ของแท้'],
  CURRENT_DATE + INTERVAL '30 days'
),
(
  'Massage นวดไทย 60 นาที 299',
  'นวดแผนไทยโดยนักบำบัดมืออาชีพ',
  299, 600, 299, 50,
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
  'สุขภาพ', 'Let''s Relax Terminal 21',
  13.7380, 100.5600,
  true, 4.7,
  ARRAY['นวด', 'นวดไทย', 'ผ่อนคลาย'],
  CURRENT_DATE + INTERVAL '60 days'
),

-- อนุสาวรีย์-อารีย์ (13.752-768, 100.493-515)
(
  'MacBook Air M3 ผ่อน 0% 10 เดือน',
  'MacBook Air 13" M3 8GB 256GB ของใหม่ประกันศูนย์',
  38900, 42900, 38900, 9,
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
  'คอมพิวเตอร์', 'Mac Studio Ari',
  13.7680, 100.5150,
  true, 4.9,
  ARRAY['MacBook', 'Apple', 'ผ่อน0%'],
  CURRENT_DATE + INTERVAL '30 days'
),
(
  'พิซซ่า 2 ถาดในราคา 1 ถาด',
  'ซื้อ 1 แถม 1 ฟรี ทุกหน้าเมนู ทุกไซส์',
  299, 598, 299, 50,
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
  'อาหาร', 'The Pizza Company Victory Monument',
  13.7520, 100.4930,
  true, 4.4,
  ARRAY['พิซซ่า', 'ซื้อ1แถม1'],
  CURRENT_DATE + INTERVAL '7 days'
),

-- บางนา-อุดมสุข (13.715-725, 100.590-605)
(
  'ตัดผมชาย 99 บาท ไม่จำกัด',
  'ตัดผมชาย + สระ + นวดศีรษะ โดยช่างมืออาชีพ',
  99, 250, 99, 60,
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
  'ความงาม', 'Barber House Bangna',
  13.7150, 100.6050,
  true, 4.5,
  ARRAY['ตัดผม', 'ชาย', 'ราคาถูก'],
  CURRENT_DATE + INTERVAL '90 days'
),

-- สะพานควาย-ลาดพร้าว (13.760-780, 100.502-562)
(
  'Switch OLED + 3 เกม ลดเหลือ 11,990',
  'Nintendo Switch OLED พร้อม 3 เกมดัง ของแท้ประกัน',
  11990, 15900, 11990, 25,
  'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800',
  'เกม', 'GameStop Saphan Kwai',
  13.7600, 100.5020,
  true, 4.8,
  ARRAY['Nintendo', 'Switch', 'เกม'],
  CURRENT_DATE + INTERVAL '15 days'
),

-- เพิ่มอีก 9 รายการกระจายทั่ว BKK
(
  'ขนมปังสด 3 ถุง 99 บาท',
  'ขนมปังโฮลวีท นมสด ไส้กรอก สดใหม่ทุกเช้า',
  99, 180, 99, 45,
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
  'อาหาร', '7-Eleven Sukhumvit',
  13.7350, 100.5700,
  true, 4.3,
  ARRAY['ขนมปัง', 'เบเกอรี่'],
  CURRENT_DATE + INTERVAL '3 days'
),
(
  'หูฟัง AirPods Pro 2 ลด 2,000',
  'AirPods Pro Gen 2 ของแท้ศูนย์ไทย ครบกล่อง',
  7990, 9990, 7990, 20,
  'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800',
  'อุปกรณ์เสริม', 'Studio7 Central Rama 9',
  13.7280, 100.5850,
  true, 4.8,
  ARRAY['AirPods', 'Apple', 'หูฟัง'],
  CURRENT_DATE + INTERVAL '20 days'
),
(
  'โยเกิร์ต Greek Style 6 กล่อง 259',
  'โปรตีนสูง ไขมันต่ำ รสชาติหลากหลาย',
  259, 360, 259, 28,
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
  'อาหารเสริม', 'Tops Supermarket Asoke',
  13.7450, 100.5350,
  true, 4.6,
  ARRAY['โยเกิร์ต', 'โปรตีน', 'ลดน้ำหนัก'],
  CURRENT_DATE + INTERVAL '10 days'
),
(
  'คอร์สภาษาอังกฤษ 3 เดือน ลด 50%',
  'เรียนแบบ 1:4 พร้อมเจ้าของภาษา 36 ชั่วโมง',
  4999, 9999, 4999, 50,
  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
  'การศึกษา', 'EF English First',
  13.7400, 100.5450,
  true, 4.7,
  ARRAY['ภาษาอังกฤษ', 'คอร์สเรียน'],
  CURRENT_DATE + INTERVAL '30 days'
),
(
  'เสื้อโปโล Lacoste ลดสูงสุด 40%',
  'เสื้อโปโลของแท้ หลากสี ทุกไซส์',
  2990, 4990, 2990, 40,
  'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800',
  'แฟชั่น', 'Central Department Store',
  13.7462, 100.5390,
  true, 4.5,
  ARRAY['Lacoste', 'เสื้อผ้า', 'ของแท้'],
  CURRENT_DATE + INTERVAL '15 days'
),
(
  'ล้างแอร์ 2 เครื่อง 990 บาท',
  'ล้างแอร์แบบละเอียด พร้อมเช็ค Gas ฟรี',
  990, 1800, 990, 45,
  'https://images.unsplash.com/photo-1631545806609-a2a3c8c5ef18?w=800',
  'บริการ', 'Air Care Service',
  13.7250, 100.5900,
  true, 4.8,
  ARRAY['ล้างแอร์', 'บริการ'],
  CURRENT_DATE + INTERVAL '60 days'
),
(
  'ซูชิพรีเมี่ยม 50 คำ 499',
  'ซูชิปลาแซลมอน ทูน่า หน้าท็อปปิ้งพรีเมี่ยม',
  499, 890, 499, 44,
  'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
  'อาหาร', 'Sushi Hiro Mega Bangna',
  13.7450, 100.5340,
  true, 4.6,
  ARRAY['ซูชิ', 'อาหารญี่ปุ่น'],
  CURRENT_DATE + INTERVAL '7 days'
),
(
  'ยางรถยนต์ 4 เส้น ฟรีตั้งศูนย์',
  'Michelin Primacy 4 ขนาด 195/65R15',
  9900, 13200, 9900, 25,
  'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800',
  'รถยนต์', 'Tire & Wheel Rama 9',
  13.7350, 100.5650,
  true, 4.7,
  ARRAY['ยางรถยนต์', 'Michelin'],
  CURRENT_DATE + INTERVAL '30 days'
),
(
  'สมาชิกสระว่ายน้ำ 1 ปี 3,999',
  'เข้าได้ทุกวัน ไม่จำกัดเวลา พร้อมล็อกเกอร์',
  3999, 8999, 3999, 56,
  'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800',
  'กีฬา', 'Aqua Pool & Fitness',
  13.7550, 100.5420,
  true, 4.5,
  ARRAY['สระว่ายน้ำ', 'ฟิตเนส', '1ปี'],
  CURRENT_DATE + INTERVAL '365 days'
);

-- ตรวจสอบผลลัพธ์
SELECT id, title, lat, lng, category, "shopName", verified
FROM products
WHERE created_at > NOW() - INTERVAL '1 minute'
ORDER BY created_at DESC
LIMIT 20;

-- ทดสอบ RPC nearby_products
SELECT id, title, distance_km, "shopName"
FROM nearby_products(13.7460, 100.5340, 5)
LIMIT 10;
