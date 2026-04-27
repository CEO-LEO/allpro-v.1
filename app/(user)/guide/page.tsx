'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Search, MapPin, Users, Heart, Gift, Wallet, QrCode,
  MessageCircle, Store, Bell, User, ChevronDown, ChevronRight,
  Zap, Star, Trophy, ShoppingBag, ArrowLeft, BookOpen,
  Smartphone, Shield, Sparkles, TrendingUp, Tag, Megaphone
} from 'lucide-react';

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  steps: { title: string; desc: string; tip?: string }[];
}

const sections: Section[] = [
  {
    id: 'home',
    icon: <Home className="w-5 h-5" />,
    title: 'หน้าหลัก',
    subtitle: 'จุดเริ่มต้นของการค้นหาดีล',
    color: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-200',
    steps: [
      { title: 'Banner โปรโมชั่น', desc: 'แถบ Banner ด้านบนแสดงดีลเด่นประจำวัน — แตะเพื่อดูรายละเอียดและรับคูปอง' },
      { title: 'หมวดหมู่สินค้า', desc: 'แตะหมวดหมู่ เช่น Food, Fashion, Travel เพื่อกรองโปรโมชั่นที่ต้องการ', tip: 'แตะ "All" เพื่อดูทุกหมวดหมู่พร้อมกัน' },
      { title: 'Flash Sale', desc: 'แถบ Flash Sale แสดงดีลที่มีเวลาจำกัด — มีนับถอยหลัง กดรับก่อนหมดเวลา' },
      { title: 'ดีลใกล้เคียง', desc: 'ส่วน "Nearby Gems" แสดงโปรโมชั่นจากร้านค้ารอบ ๆ ตัวคุณแบบเรียลไทม์', tip: 'อนุญาตการใช้ตำแหน่งที่ตั้งเพื่อให้ระบบแสดงดีลที่ใกล้ที่สุด' },
    ]
  },
  {
    id: 'search',
    icon: <Search className="w-5 h-5" />,
    title: 'ค้นหาโปรโมชั่น',
    subtitle: 'ค้นหาดีลที่ต้องการได้ทันที',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    steps: [
      { title: 'พิมพ์ค้นหา', desc: 'แตะแว่นขยายหรือกด /search แล้วพิมพ์ชื่อสินค้า ร้านค้า หรือหมวดหมู่' },
      { title: 'กรองผลลัพธ์', desc: 'ใช้ฟิลเตอร์ตามราคา, หมวดหมู่, ระยะทาง หรือเรียงตามใหม่ล่าสุด/ส่วนลดสูงสุด' },
      { title: 'Trending Tags', desc: 'แตะ Tag ยอดนิยมด้านบน เช่น "#7-Eleven" "#Makro" เพื่อค้นหาด่วน', tip: 'Tag เปลี่ยนตามเทรนด์รายวัน' },
    ]
  },
  {
    id: 'flashsale',
    icon: <Zap className="w-5 h-5" />,
    title: 'Flash Sale',
    subtitle: 'ดีลสุดร้อนแบบจำกัดเวลา',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    steps: [
      { title: 'ดูดีล Flash Sale', desc: 'ไปที่เมนู Flash Sale เพื่อดูรายการสินค้าลดราคาที่มีนับถอยหลัง' },
      { title: 'กดรับก่อนหมดเวลา', desc: 'แตะ "รับดีล" เพื่อบันทึกคูปองลง Wallet ก่อนที่เวลาจะหมด' },
      { title: 'การแจ้งเตือน Flash Sale', desc: 'เปิดการแจ้งเตือน (Bell) เพื่อรับ Push Notification ก่อนที่ Flash Sale จะเริ่ม', tip: 'Flash Sale ส่วนใหญ่เริ่มเวลา 10:00, 14:00 และ 20:00 น.' },
    ]
  },
  {
    id: 'map',
    icon: <MapPin className="w-5 h-5" />,
    title: 'แผนที่ดีล',
    subtitle: 'ค้นหาโปรโมชั่นใกล้ตัวคุณ',
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    steps: [
      { title: 'เปิดแผนที่', desc: 'ไปที่ /map — แผนที่จะแสดง Pin ตำแหน่งร้านค้าที่มีโปรโมชั่นอยู่รอบตัวคุณ' },
      { title: 'แตะ Pin ร้านค้า', desc: 'กด Pin บนแผนที่เพื่อดูโปรโมชั่นของร้านนั้นพร้อมรายละเอียดและระยะทาง' },
      { title: 'กรองตามหมวดหมู่', desc: 'ใช้ฟิลเตอร์บนแผนที่เพื่อแสดงเฉพาะร้านอาหาร แฟชั่น หรือประเภทที่สนใจ', tip: 'ต้องอนุญาต Location เพื่อใช้งานแผนที่' },
    ]
  },
  {
    id: 'community',
    icon: <Users className="w-5 h-5" />,
    title: 'คอมมูนิตี้',
    subtitle: 'แชร์ดีล แลกเปลี่ยนข้อมูล',
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
    steps: [
      { title: 'ดูโพสต์ชุมชน', desc: 'เข้า /community เพื่อดูดีลที่คนอื่นแชร์ — กด Like เพื่อบอกว่าดีลนี้ดี' },
      { title: 'โพสต์ดีลของคุณ', desc: 'กดปุ่ม "+" เพื่อสร้างโพสต์ — ใส่รูป, ชื่อดีล, ราคา แล้วกดเผยแพร่', tip: 'โพสต์ที่ได้รับ Like มาก จะขึ้น Trending และคุณได้รับ XP เพิ่ม' },
      { title: 'คอมเมนต์', desc: 'แตะโพสต์แล้วเลื่อนลงเพื่อแสดงความคิดเห็น ถามหรือยืนยันข้อมูลดีล' },
    ]
  },
  {
    id: 'saved',
    icon: <Heart className="w-5 h-5" />,
    title: 'โปรโมชั่นที่บันทึก',
    subtitle: 'เก็บดีลไว้ดูทีหลัง',
    color: 'text-pink-600',
    bg: 'bg-pink-50 border-pink-200',
    steps: [
      { title: 'บันทึกโปรโมชั่น', desc: 'กดไอคอน ♥ บนการ์ดสินค้าใดก็ได้ — สินค้าจะถูกบันทึกใน /saved' },
      { title: 'ดูรายการที่บันทึก', desc: 'ไปที่ /saved เพื่อดูทุกโปรโมชั่นที่คุณเก็บไว้ สามารถกด Redeem หรือลบออกได้' },
      { title: 'แชร์ต่อ', desc: 'กดปุ่มแชร์บนหน้ารายละเอียดสินค้าเพื่อส่งลิงก์ให้เพื่อนผ่าน Line หรือ Copy Link', tip: 'ดีลที่บันทึกไว้จะแสดง Badge จำนวนบนแถบนำทาง' },
    ]
  },
  {
    id: 'wallet',
    icon: <Wallet className="w-5 h-5" />,
    title: 'กระเป๋าคูปอง',
    subtitle: 'คูปองและสิทธิประโยชน์ทั้งหมด',
    color: 'text-teal-600',
    bg: 'bg-teal-50 border-teal-200',
    steps: [
      { title: 'ดูคูปองของคุณ', desc: 'ไปที่ /wallet หรือ Profile → Wallet เพื่อดูคูปองที่ได้รับและยังไม่ได้ใช้' },
      { title: 'ใช้คูปอง', desc: 'แตะคูปองที่ต้องการ แล้วกด "ใช้คูปอง" — บาร์โค้ด/QR Code จะแสดงให้พนักงานสแกน', tip: 'คูปองแต่ละใบมีวันหมดอายุ ตรวจสอบก่อนไปร้านเสมอ' },
      { title: 'ประวัติการใช้งาน', desc: 'เลื่อนลงในหน้า Wallet เพื่อดูประวัติคูปองที่ใช้ไปแล้วทั้งหมด' },
    ]
  },
  {
    id: 'qr',
    icon: <QrCode className="w-5 h-5" />,
    title: 'QR Scanner',
    subtitle: 'สแกน QR รับ XP และรางวัล',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-200',
    steps: [
      { title: 'เปิด QR Scanner', desc: 'กดปุ่มกล้องบน Navbar หรือไปที่ /profile → สแกน QR เพื่อเปิดกล้อง' },
      { title: 'สแกน QR Code ร้านค้า', desc: 'สแกน QR ที่หน้าร้านค้าหรือโปรโมชั่น — ระบบจะให้ XP และ Coins ทันที' },
      { title: 'รับรางวัล', desc: 'หลังสแกนสำเร็จ จะมีป๊อปอัพแสดง XP ที่ได้รับ — ตรวจสอบใน Rewards ได้เลย', tip: 'QR Code ที่ขึ้นต้นด้วย IAMROOT ให้รางวัลพิเศษสูงสุด' },
    ]
  },
  {
    id: 'ai',
    icon: <MessageCircle className="w-5 h-5" />,
    title: 'AI Chatbot',
    subtitle: 'ถาม AI เรื่องโปรโมชั่นได้เลย',
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200',
    steps: [
      { title: 'เปิด AI Chat', desc: 'กดปุ่มฟองคำพูด (💬) ที่มุมล่างขวาของหน้าจอ เพื่อเปิดกล่องสนทนา AI' },
      { title: 'ถามได้เลย', desc: 'พิมพ์คำถามเช่น "7-Eleven วันนี้มีโปรอะไรบ้าง?" หรือ "อยากกินลาบต้องไปไหน?" — AI ตอบเป็นภาษาไทย' },
      { title: 'แนะนำโปรโมชั่น', desc: 'AI จะแนะนำดีลที่เหมาะกับคุณจากข้อมูลในระบบพร้อมลิงก์ไปยังหน้าสินค้าโดยตรง', tip: 'AI รู้จักโปรโมชั่นทุกอย่างในระบบ — ถามได้ไม่จำกัด' },
    ]
  },
  {
    id: 'rewards',
    icon: <Gift className="w-5 h-5" />,
    title: 'รางวัลและ Gamification',
    subtitle: 'สะสม XP เลื่อนระดับ รับรางวัล',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    steps: [
      { title: 'วิธีได้รับ XP', desc: 'ทำกิจกรรมต่าง ๆ เพื่อรับ XP: สแกน QR (+50), โพสต์ชุมชน (+30), ล็อกอินรายวัน (+10), แชร์ดีล (+20)' },
      { title: 'ระดับ (Level)', desc: 'XP สะสมจะเพิ่มระดับของคุณ: Novice Hunter → IAMROOT Hunter → IAMROOT Legend', tip: 'ระดับที่สูงขึ้น = สิทธิ์เข้าถึงดีลพิเศษที่ผู้ใช้ทั่วไปมองไม่เห็น' },
      { title: 'แลก Rewards', desc: 'ไปที่ /rewards เพื่อแลก XP และ Coins เป็นคูปองส่วนลด, ของรางวัล หรือสิทธิพิเศษ' },
      { title: 'Daily Check-in', desc: 'ล็อกอินทุกวันติดต่อกันเพื่อรับ Streak Bonus — ยิ่งต่อเนื่องยิ่งได้มาก' },
    ]
  },
  {
    id: 'notifications',
    icon: <Bell className="w-5 h-5" />,
    title: 'การแจ้งเตือน',
    subtitle: 'ไม่พลาดดีลเด็ดอีกต่อไป',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-200',
    steps: [
      { title: 'เปิดการแจ้งเตือน', desc: 'กดกระดิ่ง (🔔) บน Navbar แล้วอนุญาต Push Notification เพื่อรับแจ้งเตือน' },
      { title: 'ประเภทการแจ้งเตือน', desc: 'ระบบแจ้งเตือน: Flash Sale กำลังจะเริ่ม, ดีลใหม่ในหมวดที่คุณชอบ, คูปองใกล้หมดอายุ' },
      { title: 'ตั้งค่าการแจ้งเตือน', desc: 'ไปที่ Profile → Settings เพื่อเลือกประเภทการแจ้งเตือนที่ต้องการรับ', tip: 'แนะนำเปิดแจ้งเตือน Flash Sale เพราะดีลหมดเร็วมาก' },
    ]
  },
  {
    id: 'merchant',
    icon: <Store className="w-5 h-5" />,
    title: 'สำหรับร้านค้า (Merchant)',
    subtitle: 'ลงทะเบียนร้านและโพสต์โปรโมชั่น',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50 border-cyan-200',
    steps: [
      { title: 'สมัคร Merchant', desc: 'ไปที่ /merchant/register หรือกด "เปิดร้านค้า" บน Navbar แล้วกรอกข้อมูลธุรกิจ' },
      { title: 'สร้างโปรโมชั่น', desc: 'เข้า Dashboard → กด "สร้างดีลใหม่" ใส่รูปสินค้า, ราคา, วันหมดอายุ แล้วกดเผยแพร่' },
      { title: 'ดู Analytics', desc: 'Dashboard แสดงจำนวนการดู, คลิก, และ Redemption ของแต่ละโปรโมชั่นแบบเรียลไทม์' },
      { title: 'จัดการสาขา', desc: 'เพิ่มสาขาหลายแห่งได้ใน Settings → Branches — แต่ละสาขาแสดงบนแผนที่ของลูกค้าได้', tip: 'โปรโมชั่นที่มีรูปภาพสวยและส่วนลดชัดเจนจะได้ยอดดูสูงกว่า 3 เท่า' },
    ]
  },
  {
    id: 'profile',
    icon: <User className="w-5 h-5" />,
    title: 'โปรไฟล์และการตั้งค่า',
    subtitle: 'จัดการบัญชีของคุณ',
    color: 'text-gray-600',
    bg: 'bg-gray-50 border-gray-200',
    steps: [
      { title: 'แก้ไขโปรไฟล์', desc: 'ไปที่ /profile → Edit Profile เพื่อเปลี่ยนชื่อ, รูปโปรไฟล์ และข้อมูลส่วนตัว' },
      { title: 'ล็อกอิน / สมัครสมาชิก', desc: 'กดปุ่ม "เข้าสู่ระบบ" บน Navbar — รองรับการล็อกอินด้วย Email หรือ Social Login' },
      { title: 'ความปลอดภัย', desc: 'ข้อมูลทั้งหมดเข้ารหัสด้วย Supabase Auth — รหัสผ่านไม่ถูกเก็บในรูปแบบ plain text', tip: 'แนะนำตั้ง Username ที่จำง่ายเพราะจะแสดงในโพสต์คอมมูนิตี้' },
    ]
  },
];

export default function GuidePage() {
  const [openId, setOpenId] = useState<string | null>('home');

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-rose-500 text-white">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-orange-100 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-orange-100 text-sm font-medium">IAMROOT AI</p>
              <h1 className="text-3xl font-bold">คู่มือการใช้งาน</h1>
            </div>
          </div>
          <p className="text-orange-100 text-base leading-relaxed max-w-xl">
            เรียนรู้วิธีใช้งาน IAMROOT AI ให้ครบทุกฟีเจอร์ — ตั้งแต่ค้นหาโปรโมชั่น สแกน QR สะสม XP ไปจนถึงเปิดร้านค้า Merchant
          </p>
          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { icon: <Sparkles className="w-4 h-4" />, label: `${sections.length} ฟีเจอร์หลัก` },
              { icon: <Smartphone className="w-4 h-4" />, label: 'รองรับมือถือและ PWA' },
              { icon: <Shield className="w-4 h-4" />, label: 'ปลอดภัย 100%' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 text-sm">
                {s.icon}
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 no-scrollbar">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setOpenId(s.id);
                  document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  openId === s.id
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                }`}
              >
                {s.icon}
                <span>{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
        {sections.map((section, idx) => {
          const isOpen = openId === section.id;
          return (
            <div
              key={section.id}
              id={`section-${section.id}`}
              className={`rounded-2xl border overflow-hidden transition-all ${section.bg}`}
            >
              {/* Header */}
              <button
                onClick={() => setOpenId(isOpen ? null : section.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center ${section.color}`}>
                    {section.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className={`font-semibold text-gray-900`}>{section.title}</h2>
                      <span className="text-xs bg-white/60 text-gray-500 rounded-full px-2 py-0.5 border border-gray-200">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{section.subtitle}</p>
                  </div>
                </div>
                <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-gray-400`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              {/* Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {section.steps.map((step, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-white/80">
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5 ${
                              section.color.replace('text-', 'bg-').replace('-600', '-500')
                            }`}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800 text-sm">{step.title}</h3>
                              <p className="text-gray-600 text-sm mt-1 leading-relaxed">{step.desc}</p>
                              {step.tip && (
                                <div className="mt-2 flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-amber-700 text-xs leading-relaxed">{step.tip}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Quick Links */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 mt-6">
          <h2 className="font-bold text-lg mb-1">ลิงก์ด่วน</h2>
          <p className="text-gray-400 text-sm mb-4">เข้าถึงฟีเจอร์ได้โดยตรง</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { href: '/', icon: <Home className="w-4 h-4" />, label: 'หน้าหลัก' },
              { href: '/flash-sale', icon: <Zap className="w-4 h-4" />, label: 'Flash Sale' },
              { href: '/search', icon: <Search className="w-4 h-4" />, label: 'ค้นหา' },
              { href: '/map', icon: <MapPin className="w-4 h-4" />, label: 'แผนที่' },
              { href: '/community', icon: <Users className="w-4 h-4" />, label: 'คอมมูนิตี้' },
              { href: '/rewards', icon: <Gift className="w-4 h-4" />, label: 'รางวัล' },
              { href: '/wallet', icon: <Wallet className="w-4 h-4" />, label: 'Wallet' },
              { href: '/saved', icon: <Heart className="w-4 h-4" />, label: 'ที่บันทึก' },
              { href: '/merchant/register', icon: <Store className="w-4 h-4" />, label: 'เปิดร้านค้า' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2.5 text-sm transition-colors"
              >
                <span className="text-orange-400">{link.icon}</span>
                <span>{link.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500 ml-auto" />
              </Link>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center py-6 text-gray-400 text-sm">
          <p>IAMROOT AI — Platform เวอร์ชัน {new Date().getFullYear()}</p>
          <p className="mt-1">มีปัญหา? ติดต่อเราที่ <Link href="/contact" className="text-orange-500 hover:underline">หน้าติดต่อ</Link></p>
        </div>
      </div>
    </div>
  );
}
