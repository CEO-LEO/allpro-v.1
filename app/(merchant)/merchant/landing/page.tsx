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
import { useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      
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
              className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-6 py-2 mb-8"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 font-medium">Join 1,200+ PRO Merchants</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-yellow-200 bg-clip-text text-transparent leading-tight">
              Don't Just Wait for Customers.
              <br />
              <span className="text-yellow-400">Hunt Them.</span>
            </h1>

            {/* Thai Translation */}
            <p className="text-xl md:text-2xl text-blue-200 mb-4 font-light">
              อย่ารอให้ลูกค้าเดินผ่าน ล่าพวกเขาด้วย AI
            </p>

            {/* Sub-headline */}
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join <span className="text-yellow-400 font-semibold">All Pro</span> — The only platform that pushes YOUR shop to{' '}
              <span className="text-yellow-400 font-semibold">10,000+ hungry users</span> nearby, exactly when they're searching.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/merchant/dashboard'}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-lg shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all flex items-center gap-2"
              >
                Start for Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-slate-800 border-2 border-yellow-500/50 text-yellow-300 rounded-lg font-semibold text-lg hover:bg-slate-700 transition-all flex items-center gap-2"
              >
                <Crown className="w-5 h-5" />
                See PRO Benefits
              </motion.button>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex flex-wrap justify-center gap-8 text-slate-400 text-sm"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Verified Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>1,200+ Active Merchants</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>4.9/5 Rating</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl"></div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PROBLEM/SOLUTION SECTION
      ═══════════════════════════════════════════════════════════ */}

      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              The Old Way <span className="text-red-400">Doesn't Work Anymore</span>
            </h2>
            <p className="text-xl text-slate-300">
              การตลาดแบบเก่า ๆ ไม่ได้ผลอีกต่อไปแล้ว
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Problem Side */}
            <motion.div {...fadeInUp} className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <XCircle className="w-8 h-8 text-red-400" />
                <h3 className="text-2xl font-bold text-red-300">ปัญหา</h3>
              </div>

              <ul className="space-y-4">
                {[
                  'Posting on Facebook? Nobody sees it.',
                  'Handing out flyers? They throw it away.',
                  'Customers walk right past your shop.',
                  'Competitors steal your lunch crowd.',
                  "You're invisible when people search."
                ].map((problem, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{problem}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Solution Side */}
            <motion.div {...fadeInUp} className="bg-green-900/20 border border-green-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <h3 className="text-2xl font-bold text-green-300">วิธีแก้</h3>
              </div>

              <ul className="space-y-4">
                {[
                  'Our AI Chatbot recommends YOUR shop first.',
                  'Users see you exactly when they ask "What to eat?"',
                  '10,000+ active users search every day.',
                  'Golden PRO badge makes you stand out.',
                  'You appear in "Near Me" suggestions automatically.'
                ].map((solution, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Chat Interface Mockup */}
          <motion.div {...fadeInUp} className="mt-16 max-w-2xl mx-auto">
            <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">AI Promo Hunter</h4>
                  <p className="text-blue-200 text-sm">Online • Helping 234 users now</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4 bg-slate-800">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
                    หาร้านซูชิใกล้ ๆ หน่อย
                  </div>
                </div>

                {/* Bot response */}
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
                    <p className="mb-3">✨ เจอแล้ว 5 ดีล!</p>
                    <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-300 font-semibold">PRO Shop</span>
                      </div>
                      <h5 className="font-bold text-lg mb-1">🌟 Sushi Master PRO</h5>
                      <p className="text-sm text-slate-300">💰 -50% • ห่างแค่ 0.8 km</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-yellow-400 mt-6 font-semibold">
              ⬆️ Your shop appears FIRST when users search!
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
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              เลือกแผนที่เหมาะกับธุรกิจคุณ
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-slate-800 rounded-full p-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* FREE PLAN */}
            <motion.div
              {...fadeInUp}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 relative"
            >
              <h3 className="text-2xl font-bold text-white mb-2">Hunter Free</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold text-white">฿0</span>
                <span className="text-slate-400">/month</span>
              </div>

              <p className="text-slate-400 mb-8">
                เริ่มต้นใช้งานฟรี ไม่มีค่าใช้จ่าย
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Basic Listing</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-500">Manual Stock Update</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-500">No AI Boost</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-500">Ranked Last in Search</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-500">No Analytics</span>
                </li>
              </ul>

              <button
                onClick={() => window.location.href = '/merchant/dashboard'}
                className="w-full py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all"
              >
                Start Free
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
                MOST POPULAR
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-400" />
                Hunter PRO
              </h3>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                  ฿{billingCycle === 'monthly' ? '599' : '499'}
                </span>
                <span className="text-slate-400">/month</span>
              </div>

              {billingCycle === 'yearly' && (
                <p className="text-green-400 text-sm mb-4">
                  💰 Save ฿1,200/year (฿5,990 billed yearly)
                </p>
              )}

              <p className="text-slate-300 mb-8 font-semibold">
                🚀 Get 3.2x more views & 280% more sales
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-semibold">AI Priority Recommendation</span>
                    <p className="text-slate-400 text-sm">Rank #1 in search results</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-semibold">Auto-Reply Chatbot</span>
                    <p className="text-slate-400 text-sm">Answer 24/7 automatically</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-semibold">Advanced Analytics</span>
                    <p className="text-slate-400 text-sm">Track views, clicks, conversions</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-semibold">Golden PRO Badge</span>
                    <p className="text-slate-400 text-sm">Stand out with verified badge</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-semibold">Priority Support</span>
                    <p className="text-slate-400 text-sm">Get help within 1 hour</p>
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
                Upgrade to PRO Now
              </motion.button>

              <p className="text-center text-slate-400 text-sm mt-4">
                30-day money-back guarantee
              </p>
            </motion.div>
          </div>

          {/* ROI Calculation */}
          <motion.div {...fadeInUp} className="mt-16 max-w-3xl mx-auto bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              💰 ผลตอบแทนคุ้มค่าแค่ไหน?
            </h3>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-slate-400 text-sm mb-2">Cost</p>
                <p className="text-3xl font-bold text-white">฿599</p>
                <p className="text-slate-400 text-sm">per month</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">Extra Revenue</p>
                <p className="text-3xl font-bold text-green-400">฿31,000</p>
                <p className="text-slate-400 text-sm">per month</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">ROI</p>
                <p className="text-3xl font-bold text-yellow-400">5,075%</p>
                <p className="text-slate-400 text-sm">51x return!</p>
              </div>
            </div>

            <p className="text-center text-slate-300 mt-6">
              <TrendingUp className="w-5 h-5 inline text-green-400 mr-2" />
              Pays for itself in <span className="text-yellow-400 font-bold">0.6 days</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SOCIAL PROOF / TESTIMONIALS
      ═══════════════════════════════════════════════════════════ */}

      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What PRO Merchants Say
            </h2>
            <p className="text-xl text-slate-300">
              พวกเขาเปลี่ยนจากฟรีเป็น PRO แล้วไม่เสียใจเลย
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Somsak Wongkham',
                shop: 'Somsak Shabu Buffet',
                image: '👨‍🍳',
                quote: 'Since upgrading to Pro, my lunch queue is full every day! The AI chatbot brings me customers I never reached before.',
                metric: '+280% sales'
              },
              {
                name: 'Pranee Sukjai',
                shop: 'Cafe Latte PRO',
                image: '👩‍💼',
                quote: 'The golden badge makes us look professional. Customers trust us more now. Worth every baht!',
                metric: '+3.2x views'
              },
              {
                name: 'Somchai Tanaka',
                shop: 'Sushi Master',
                image: '👨‍🍳',
                quote: 'Auto-reply bot answers customer questions 24/7. I sleep better knowing my shop is always "open".',
                metric: '+180% engagement'
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                transition={{ delay: i * 0.2 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl p-6"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-300 mb-6 italic">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-slate-400 text-sm">{testimonial.shop}</p>
                  </div>
                </div>

                {/* Metric Badge */}
                <div className="mt-4 inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 text-sm font-semibold">{testimonial.metric}</span>
                </div>
              </motion.div>
            ))}
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
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to <span className="text-yellow-400">Hunt</span> Your Customers?
            </h2>

            <p className="text-xl text-slate-300 mb-10">
              Join 1,200+ merchants who upgraded to PRO and never looked back.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpgradeClick}
                className="px-10 py-5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 rounded-lg font-bold text-xl shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70 transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-6 h-6" />
                Start 7-Day FREE Trial
              </motion.button>
            </div>

            <p className="text-slate-400 mt-6 text-sm">
              No credit card required • Cancel anytime • 30-day money-back guarantee
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
