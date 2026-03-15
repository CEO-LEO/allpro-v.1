'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Package, Truck, DollarSign, CheckCircle, Clock, MapPin, User } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function ShoppingServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <ShoppingBag className="w-16 h-16 mx-auto" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                บริการฝากหิ้ว 🛍️
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                ให้คนอื่นช่วยซื้อสินค้าที่คุณต้องการ หรือรับงานฝากหิ้วเพื่อรายได้พิเศษ
              </p>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              วิธีการใช้งาน
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* For Requesters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6"
              >
                <div className="bg-purple-500 text-white rounded-xl p-4 inline-block mb-4">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  สำหรับผู้ต้องการฝากซื้อ
                </h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
                    <span>โพสต์รายการสินค้าที่ต้องการฝากซื้อ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
                    <span>รอผู้รับงานตอบรับและเสนอราคา</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
                    <span>ชำระเงินและรอรับสินค้า</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
                    <span>รีวิวและให้คะแนนผู้รับงาน</span>
                  </li>
                </ol>
              </motion.div>

              {/* For Shoppers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6"
              >
                <div className="bg-indigo-500 text-white rounded-xl p-4 inline-block mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  สำหรับผู้รับงานฝากหิ้ว
                </h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
                    <span>เลือกงานที่สนใจและอยู่ในเส้นทางของคุณ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
                    <span>เสนอราคาค่าบริการ (ไม่รวมราคาสินค้า)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
                    <span>ซื้อและส่งมอบสินค้า</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
                    <span>รับเงินค่าบริการหลังส่งมอบสำเร็จ</span>
                  </li>
                </ol>
              </motion.div>

              {/* Safety */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6"
              >
                <div className="bg-green-500 text-white rounded-xl p-4 inline-block mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  ความปลอดภัย
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>ระบบชำระเงินผ่านแพลตฟอร์ม</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>ตรวจสอบประวัติผู้รับงาน</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>ระบบรีวิวและให้คะแนน</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>ประกันความเสียหาย</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              ทำไมต้องใช้บริการฝากหิ้ว?
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="bg-blue-100 text-blue-600 rounded-lg p-3 w-fit mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">ประหยัดเวลา</h3>
                <p className="text-gray-600 text-sm">
                  ไม่ต้องเดินทางไปซื้อเอง มีคนช่วยซื้อให้
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="bg-green-100 text-green-600 rounded-lg p-3 w-fit mb-4">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">รายได้เสริม</h3>
                <p className="text-gray-600 text-sm">
                  รับงานฝากหิ้วระหว่างทางเพื่อรายได้พิเศษ
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="bg-purple-100 text-purple-600 rounded-lg p-3 w-fit mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">ครอบคลุมทุกพื้นที่</h3>
                <p className="text-gray-600 text-sm">
                  หาผู้รับงานในพื้นที่ของคุณได้ง่าย
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="bg-orange-100 text-orange-600 rounded-lg p-3 w-fit mb-4">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">สินค้าหลากหลาย</h3>
                <p className="text-gray-600 text-sm">
                  ฝากซื้อสินค้าทุกประเภท จากทุกร้านค้า
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">
                พร้อมเริ่มต้นใช้งานแล้วหรือยัง?
              </h2>
              <p className="text-xl text-purple-100 mb-8">
                เริ่มโพสต์งานฝากหิ้ว หรือรับงานเพื่อรายได้เสริมได้เลยวันนี้
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/services/shopping/post"
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl"
                >
                  โพสต์งานฝากซื้อ 🛍️
                </Link>
                <Link
                  href="/services/shopping/browse"
                  className="bg-purple-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-purple-800 transition-all shadow-lg hover:shadow-xl border-2 border-white/30"
                >
                  ดูงานที่มี 👀
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              คำถามที่พบบ่อย
            </h2>
            
            <div className="space-y-4">
              <details className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <summary className="font-bold text-gray-900 cursor-pointer">
                  ค่าบริการคิดอย่างไร?
                </summary>
                <p className="mt-3 text-gray-600">
                  ผู้รับงานจะเสนอราคาค่าบริการ (ไม่รวมราคาสินค้า) โดยปกติอยู่ที่ 30-100 บาท ขึ้นอยู่กับระยะทาง น้ำหนัก และความยุ่งยากของงาน
                </p>
              </details>

              <details className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <summary className="font-bold text-gray-900 cursor-pointer">
                  ปลอดภัยไหม?
                </summary>
                <p className="mt-3 text-gray-600">
                  ปลอดภัยครับ เรามีระบบชำระเงินผ่านแพลตฟอร์ม ตรวจสอบประวัติผู้รับงาน และมีประกันความเสียหาย คุณจะได้รับเงินคืนถ้าสินค้าเสียหายหรือไม่ได้รับ
                </p>
              </details>

              <details className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <summary className="font-bold text-gray-900 cursor-pointer">
                  ฝากซื้ออะไรได้บ้าง?
                </summary>
                <p className="mt-3 text-gray-600">
                  ฝากซื้อได้เกือบทุกอย่างครับ ยกเว้นของผิดกฎหมาย สินค้าอันตราย หรือของที่ต้องใช้บัตรเฉพาะ (เช่น แอลกอฮอล์)
                </p>
              </details>

              <details className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <summary className="font-bold text-gray-900 cursor-pointer">
                  ใช้เวลานานแค่ไหน?
                </summary>
                <p className="mt-3 text-gray-600">
                  ขึ้นอยู่กับความพร้อมของผู้รับงาน โดยปกติภายใน 1-3 ชั่วโมงสำหรับงานด่วน หรือ 1-2 วันสำหรับงานทั่วไป
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
