'use client';

import { motion } from 'framer-motion';
import { 
  Zap, 
  Target, 
  TrendingUp, 
  MessageSquare, 
  Crown, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Star,
  Users,
  BarChart3,
  Shield,
  Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

/**
 * HIGH-CONVERTING MERCHANT LANDING PAGE
 * 
 * Psychology Triggers:
 * 1. Loss Aversion - "Your competitors are ranking first"
 * 2. Social Proof - Real testimonials
 * 3. Urgency - Limited-time visual elements
 * 4. Clear ROI - Show exact numbers
 * 5. Fear of Missing Out - "10,000+ users searching NOW"
 */

export default function MerchantLandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // ═══ API-Ready State Management ═══
  /**
   * Testimonials — GET /api/merchant/landing/testimonials
   * Response: { name: string, shop: string, image: string, quote: string, metric: string }[]
   */
  const [testimonials, setTestimonials] = useState<{
    name: string;
    shop: string;
    image: string;
    quote: string;
    metric: string;
  }[]>([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoadingTestimonials(true);

        // TODO: Replace with real API call
        // const res = await fetch('/api/merchant/landing/testimonials');
        // if (!res.ok) throw new Error('Failed to fetch testimonials');
        // setTestimonials(await res.json());

        await new Promise(r => setTimeout(r, 400));
        setTestimonials([]);
      } catch {
        setTestimonials([]);
      } finally {
        setIsLoadingTestimonials(false);
      }
    };

    fetchTestimonials();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const stagger = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.2 }
  };

  const handleUpgradeClick = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    // Redirect to actual upgrade page
    window.location.href = '/merchant/upgrade';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      
      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION - "The Hook"
      ═══════════════════════════════════════════════════════════ */}
      
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-amber-100 border border-yellow-500/30 rounded-full px-6 py-2 mb-8"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-amber-600 font-medium">เข้าร่วมกับร้านค้า PRO กว่า 1,200 ร้าน</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-yellow-200 bg-clip-text text-transparent leading-tight">
              อย่าแค่รอลูกค้ามาหา
              <br />
              <span className="text-yellow-400">ออกล่าหาพวกเขา</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              เข้าร่วม <span className="text-yellow-400 font-semibold">IAMROOT AI</span> — แพลตฟอร์มเดียวที่ดันร้านของคุณไปหา{' '}
              <span className="text-yellow-400 font-semibold">ผู้ใช้กว่า 10,000+ คน</span> ในบริเวณใกล้เคียง ในเวลาที่พวกเขากำลังค้นหาอยู่พอดี
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/merchant/dashboard'}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-lg shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all flex items-center gap-2"
              >
                เริ่มใช้งานฟรี
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white border-2 border-yellow-500/50 text-amber-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all flex items-center gap-2"
              >
                <Crown className="w-5 h-5" />
                ดูสิทธิประโยชน์ PRO
              </motion.button>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex flex-wrap justify-center gap-8 text-gray-500 text-sm"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>ระบบชำระเงินปลอดภัย</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>ร้านค้ากว่า 1,200+ ร้าน</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>คะแนน 4.9/5</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-100 rounded-full blur-3xl"></div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PROBLEM/SOLUTION SECTION
      ═══════════════════════════════════════════════════════════ */}

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              วิธีเดิมๆ <span className="text-red-400">ไม่ได้ผลอีกต่อไปแล้ว</span>
            </h2>
            <p className="text-xl text-gray-600">
              ถึงเวลาเปลี่ยนแนวทางการตลาดของร้านคุณ
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Problem Side */}
            <motion.div {...fadeInUp} className="bg-red-50 border border-red-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <XCircle className="w-8 h-8 text-red-400" />
                <h3 className="text-2xl font-bold text-red-600">ปัญหา</h3>
              </div>

              <ul className="space-y-4">
                {[
                  'โพสต์บน Facebook? ไม่มีใครเห็น',
                  'แจกใบปลิว? ลูกค้าทิ้งทันที',
                  'ลูกค้าเดินผ่านร้านไปเฉยๆ ไม่แวะ',
                  'คู่แข่งแย่งลูกค้าช่วงพีคไปหมด',
                  'ร้านคุณหายไปจากผลการค้นหา',
                ].map((problem, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{problem}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Solution Side */}
            <motion.div {...fadeInUp} className="bg-green-50 border border-green-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <h3 className="text-2xl font-bold text-green-700">วิธีแก้</h3>
              </div>

              <ul className="space-y-4">
                {[
                  'AI แชทบอทแนะนำร้านของคุณเป็นอันดับแรก',
                  'ลูกค้าเจอร้านคุณทันทีที่ถามว่า "จะกินอะไรดี?"',
                  'ผู้ใช้งานกว่า 10,000+ คนค้นหาโปรทุกวัน',
                  'ตราสัญลักษณ์ PRO สีทองทำให้ร้านโดดเด่น',
                  'ร้านคุณปรากฏใน "ใกล้ฉัน" โดยอัตโนมัติ',
                ].map((solution, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Chat Interface Mockup */}
          <motion.div {...fadeInUp} className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-gray-900 font-semibold">AI พรอโม ฮันเตอร์</h4>
                  <p className="text-blue-500 text-sm">ออนไลน์ • กำลังช่วย 234 คน</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4 bg-white">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
                    หาร้านซูชิใกล้ ๆ หน่อย
                  </div>
                </div>

                {/* Bot response */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
                    <p className="mb-3">✨ เจอแล้ว 5 ดีล!</p>
                    <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span className="text-amber-600 font-semibold">PRO Shop</span>
                      </div>
                      <h5 className="font-bold text-lg mb-1">🌟 Sushi Master PRO</h5>
                      <p className="text-sm text-gray-600">💰 -50% • ห่างแค่ 0.8 km</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-yellow-400 mt-6 font-semibold">
              ⬆️ ร้านของคุณปรากฏก่อนใคร ทุกครั้งที่มีการค้นหา!
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRICING TABLE (SaaS Style)
      ═══════════════════════════════════════════════════════════ */}

      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              ราคาชัดเจน ไม่มีซ่อนเร้น
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              เลือกแผนที่เหมาะกับธุรกิจของคุณ
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-white rounded-full p-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                รายเดือน
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                รายปี
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  ประหยัด 17%
                </span>
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* FREE PLAN */}
            <motion.div
              {...fadeInUp}
              className="bg-white border border-gray-200 rounded-2xl p-8 relative"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Hunter ฟรี</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold text-gray-900">฿0</span>
                <span className="text-gray-500">/เดือน</span>
              </div>

              <p className="text-gray-500 mb-8">
                เริ่มต้นใช้งานฟรี ไม่มีค่าใช้จ่าย
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">ลงทะเบียนร้านค้าพื้นฐาน</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">อัปเดตสต็อกด้วยตัวเอง</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">ไม่มีการบูสต์จาก AI</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">ติดอันดับท้ายในผลการค้นหา</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">ไม่มีข้อมูลสถิติ</span>
                </li>
              </ul>

              <button
                onClick={() => window.location.href = '/merchant/dashboard'}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                เริ่มใช้งานฟรี
              </button>
            </motion.div>

            {/* PRO PLAN - HIGHLIGHTED */}
            <motion.div
              {...fadeInUp}
              className="bg-gradient-to-br from-yellow-500/10 via-blue-500/10 to-purple-500/10 border-2 border-yellow-500 rounded-2xl p-8 relative transform md:scale-105 shadow-2xl shadow-yellow-500/20"
            >
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 px-6 py-1 rounded-full font-bold text-sm flex items-center gap-2">
                <Star className="w-4 h-4" />
                ยอดนิยม
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-400" />
                Hunter PRO
              </h3>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                  ฿{billingCycle === 'monthly' ? '599' : '499'}
                </span>
                <span className="text-gray-500">/เดือน</span>
              </div>

              {billingCycle === 'yearly' && (
                <p className="text-green-400 text-sm mb-4">
                  💰 ประหยัด ฿1,200/ปี (฿5,990 เรียกเก็บรายปี)
                </p>
              )}

              <p className="text-gray-600 mb-8 font-semibold">
                🚀 ยอดเข้าชมเพิ่ม 3.2 เท่า และยอดขายเพิ่มขึ้น 280%
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-800 font-semibold">AI บูสต์อันดับให้ก่อนใคร</span>
                    <p className="text-gray-500 text-sm">ติดอันดับ 1 ในผลการค้นหา</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-800 font-semibold">แชทบอทตอบอัตโนมัติ</span>
                    <p className="text-gray-500 text-sm">ตอบคำถามลูกค้า 24/7 โดยอัตโนมัติ</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-800 font-semibold">วิเคราะห์ข้อมูลเชิงลึก</span>
                    <p className="text-gray-500 text-sm">ติดตามยอดเข้าชม คลิก และ Conversion</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-800 font-semibold">ตราสัญลักษณ์ PRO สีทอง</span>
                    <p className="text-gray-500 text-sm">โดดเด่นด้วยตราร้านที่ผ่านการยืนยัน</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-800 font-semibold">บริการช่วยเหลือด่วน</span>
                    <p className="text-gray-500 text-sm">รับการช่วยเหลือภายใน 1 ชั่วโมง</p>
                  </div>
                </li>
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpgradeClick}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 rounded-lg font-bold text-lg shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70 transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                อัปเกรดเป็น PRO เลย
              </motion.button>

              <p className="text-center text-gray-500 text-sm mt-4">
                รับประกันคืนเงิน 30 วัน
              </p>
            </motion.div>
          </div>

          {/* ROI Calculation */}
          <motion.div {...fadeInUp} className="mt-16 max-w-3xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border border-green-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              💰 ผลตอบแทนคุ้มค่าแค่ไหน?
            </h3>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-gray-500 text-sm mb-2">ค่าใช้จ่าย</p>
                <p className="text-3xl font-bold text-gray-900">฿599</p>
                <p className="text-gray-500 text-sm">ต่อเดือน</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-2">รายได้เพิ่มเติม</p>
                <p className="text-3xl font-bold text-green-400">฿31,000</p>
                <p className="text-gray-500 text-sm">ต่อเดือน</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-2">ROI</p>
                <p className="text-3xl font-bold text-yellow-400">5,075%</p>
                <p className="text-gray-500 text-sm">คุ้มค่า 51 เท่า!</p>
              </div>
            </div>

            <p className="text-center text-gray-600 mt-6">
              <TrendingUp className="w-5 h-5 inline text-green-400 mr-2" />
              คุ้มทุนภายใน <span className="text-yellow-400 font-bold">0.6 วัน</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SOCIAL PROOF / TESTIMONIALS
      ═══════════════════════════════════════════════════════════ */}

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              เสียงจากร้านค้า PRO
            </h2>
            <p className="text-xl text-gray-600">
              พวกเขาเปลี่ยนจากฟรีเป็น PRO แล้วไม่เสียใจเลย
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {isLoadingTestimonials ? (
              [1,2,3].map(i => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="w-5 h-5 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : testimonials.length === 0 ? (
              <div className="col-span-3 py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💬</span>
                </div>
                <p className="text-gray-500 font-medium">ยังไม่มีรีวิวจากผู้ใช้</p>
                <p className="text-sm text-gray-400 mt-1">รีวิวจะแสดงเมื่อมีผู้ใช้งาน PRO</p>
              </div>
            ) : (
            testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                transition={{ delay: i * 0.2 }}
                className="bg-white border border-gray-200 rounded-2xl p-6"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.shop}</p>
                  </div>
                </div>

                {/* Metric Badge */}
                <div className="mt-4 inline-flex items-center gap-2 bg-green-100 border border-green-500/30 rounded-full px-4 py-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-700 text-sm font-semibold">{testimonial.metric}</span>
                </div>
              </motion.div>
            ))
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FINAL CTA SECTION
      ═══════════════════════════════════════════════════════════ */}

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-yellow-600/20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            {...fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              พร้อมที่จะ<span className="text-yellow-400">ล่า</span>หาลูกค้าแล้วหรือยัง?
            </h2>

            <p className="text-xl text-gray-600 mb-10">
              ร้านค้ากว่า 1,200+ แห่งที่อัปเกรดเป็น PRO แล้วไม่เคยเสียใจ
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpgradeClick}
                className="px-10 py-5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 rounded-lg font-bold text-xl shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70 transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-6 h-6" />
                เริ่มทดลองใช้ฟรี 7 วัน
              </motion.button>
            </div>

            <p className="text-gray-500 mt-6 text-sm">
              ไม่ต้องใช้บัตรเครดิต • ยกเลิกได้ทุกเมื่อ • รับประกันคืนเงิน 30 วัน
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
