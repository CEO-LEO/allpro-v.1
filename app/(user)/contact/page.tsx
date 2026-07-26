'use client';

import Link from 'next/link';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-base sm:text-xl font-bold text-[#FF5722] hover:text-[#E64A19] transition-colors">
              ← All Pro
            </Link>
            <h1 className="text-sm sm:text-lg font-semibold">ติดต่อเรา</h1>
            <div className="w-8 sm:w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-[#FF5722] to-[#FF7043] rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">ติดต่อเรา</h1>
          <p className="text-sm sm:text-base text-white/90">
            พร้อมให้บริการและตอบคำถามของคุณ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">ข้อมูลติดต่อ</h2>

            {/* Cards */}
            <div className="card p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">อีเมล</h3>
                  <a href="mailto:contact@allpromotion.com" className="text-[#FF5722] hover:underline">
                    contact@allpromotion.com
                  </a>
                  <p className="text-sm text-gray-600 mt-1">ตอบภายใน 24 ชั่วโมง</p>
                </div>
              </div>
            </div>

            <div className="card p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <PhoneIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">โทรศัพท์</h3>
                  <a href="tel:020000000" className="text-[#FF5722] hover:underline text-lg font-semibold">
                    02-000-0000
                  </a>
                  <p className="text-sm text-gray-600 mt-1">จันทร์-ศุกร์ 09:00-18:00 น.</p>
                </div>
              </div>
            </div>

            <div className="card p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Line Official</h3>
                  <a href="https://line.me/ti/p/@allpromotion" className="text-[#FF5722] hover:underline">
                    @allpromotion
                  </a>
                  <p className="text-sm text-gray-600 mt-1">ตอบทันที 24/7</p>
                </div>
              </div>
            </div>

            <div className="card p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <MapPinIcon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">ที่อยู่</h3>
                  <p className="text-gray-700">
                    PIM Innovation Center<br/>
                    มหาวิทยาลัยแม่ฟ้าหลวง<br/>
                    เชียงราย 57100
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">ส่งข้อความถึงเรา</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่อ-นามสกุล *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent"
                  placeholder="กรอกชื่อของคุณ"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  อีเมล *
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  หมวดหมู่
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent">
                  <option>ติดต่อทั่วไป</option>
                  <option>สอบถามเกี่ยวกับบริการ</option>
                  <option>รายงานปัญหา</option>
                  <option>ข้อเสนอแนะ</option>
                  <option>สนใจเป็นพาร์ทเนอร์</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ข้อความ *
                </label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent resize-none"
                  placeholder="พิมพ์ข้อความของคุณที่นี่..."
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-4 text-lg"
                onClick={(e) => {
                  e.preventDefault();
                  alert('ขอบคุณสำหรับข้อความ! เราจะติดต่อกลับภายใน 24 ชั่วโมง');
                }}
              >
                ส่งข้อความ
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 card p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">คำถามที่พบบ่อย (FAQ)</h2>
          
          <div className="space-y-4">
            {[
              {
                q: 'All Pro คืออะไร?',
                a: 'All Pro คือแพลตฟอร์มค้นหาโปรโมชั่นที่ใช้ Big Data และ AI เพื่อช่วยให้คุณหาโปรโมชั่นที่ดีที่สุดได้ง่ายขึ้น พร้อมข้อมูลจาก CP ALL Ecosystem'
              },
              {
                q: 'ใช้บริการฟรีหรือเสียค่าใช้จ่าย?',
                a: 'สำหรับผู้บริโภคใช้ฟรี 100%! สำหรับเจ้าของร้านค้า สามารถลงโปรโมชั่นฟรี แต่ถ้าต้องการ SEO Ranking หรือ Data Insights Premium จะมีค่าบริการเริ่มต้น 299 บาท/สัปดาห์'
              },
              {
                q: 'ข้อมูลโปรโมชั่นมาจากไหน?',
                a: 'เรามีข้อมูลจาก 2 แหล่ง: 1) ข้อมูลตรง (Verified) จากเครือ CP ALL (7-11, Lotus, Makro) และ 2) ร้านค้าที่ลงโปรโมชั่นเอง ทุกข้อมูลผ่านการตรวจสอบโดยทีมงาน'
              },
              {
                q: 'ต่างจากปันโปรอย่างไร?',
                a: 'เรามี Market Insights, AI Prediction และ SEO Bidding System ที่ช่วยให้ร้านค้ารู้ว่าลูกค้าต้องการอะไร - นี่คือสิ่งที่ปันโปรไม่มี!'
              }
            ].map((faq, idx) => (
              <div key={idx} className="pb-4 border-b border-gray-200 last:border-0">
                <h3 className="font-bold text-gray-900 mb-2">Q: {faq.q}</h3>
                <p className="text-sm text-gray-700">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
