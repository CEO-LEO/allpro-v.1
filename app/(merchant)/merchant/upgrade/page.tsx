'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircleIcon, 
  XMarkIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

import { useAuthStore } from '@/store/useAuthStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';

type RequestStatus = 'none' | 'pending' | 'approved' | 'rejected';

export default function MerchantUpgradePage() {
  const { user } = useAuthStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('none');

  // ═══ API-Ready State Management ═══
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Social Proof Stats — GET /api/merchant/upgrade/stats
   * Response: { views: string, chooseRate: string, avgRevenue: string }
   */
  const [proStats, setProStats] = useState<{
    views: string;
    chooseRate: string;
    avgRevenue: string;
  } | null>(null);

  /**
   * Testimonials — GET /api/merchant/upgrade/testimonials
   * Response: { emoji: string, quote: string, author: string }[]
   */
  const [testimonials, setTestimonials] = useState<{
    emoji: string;
    quote: string;
    author: string;
    bgClass: string;
  }[]>([]);

  useEffect(() => {
    const fetchUpgradeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with real API calls
        // const [statsRes, testimonialsRes] = await Promise.all([
        //   fetch('/api/merchant/upgrade/stats'),
        //   fetch('/api/merchant/upgrade/testimonials'),
        // ]);
        // if (!statsRes.ok || !testimonialsRes.ok) throw new Error('Failed to fetch data');
        // setProStats(await statsRes.json());
        // setTestimonials(await testimonialsRes.json());

        setProStats(null);
        setTestimonials([]);

        if (isSupabaseConfigured && user?.id) {
          const { data } = await supabase
            .from('pro_upgrade_requests')
            .select('status')
            .eq('merchant_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (data?.status === 'pending') setRequestStatus('pending');
          else if (data?.status === 'rejected') setRequestStatus('rejected');
          else setRequestStatus('none');
        }
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาด');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpgradeData();
  }, [user?.id]);

  const handleUpgradeClick = () => {
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!user?.id || !isSupabaseConfigured) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    setIsProcessing(true);
    try {
      const price = billingCycle === 'monthly' ? monthlyPrice : yearlyPrice;
      const { error: insertError } = await supabase.from('pro_upgrade_requests').insert({
        merchant_id: user.id,
        billing_cycle: billingCycle,
        price,
      });

      if (insertError) {
        if (insertError.code === '23505') {
          toast.error('คุณมีคำขออัพเกรดที่รอตรวจสอบอยู่แล้ว');
          setRequestStatus('pending');
        } else {
          toast.error('ส่งคำขอไม่สำเร็จ กรุณาลองใหม่');
        }
        return;
      }

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      toast.success('ส่งคำขออัพเกรดแล้ว! รอแอดมินตรวจสอบภายใน 1-2 วันทำการ');
      setRequestStatus('pending');
      setShowPaymentModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const freeFeatures = [
    { name: 'Basic Product Listing', included: true },
    { name: 'Manual Stock Updates', included: true },
    { name: 'Standard Support', included: true },
    { name: 'AI Search Priority', included: false, highlight: true },
    { name: 'Auto-Reply Chatbot', included: false, highlight: true },
    { name: 'Verified Gold Badge', included: false, highlight: true },
    { name: 'Advanced Analytics', included: false },
    { name: 'Flash Sale Creator', included: false },
    { name: 'Priority Customer Support', included: false }
  ];

  const proFeatures = [
    { name: 'Everything in Free', included: true },
    { name: '🚀 AI Priority Ranking', included: true, highlight: true, description: 'Your shop appears FIRST in AI search results' },
    { name: '🤖 Auto-Reply Chatbot', included: true, highlight: true, description: 'AI answers customer questions 24/7' },
    { name: '✅ Verified Gold Badge', included: true, highlight: true, description: 'Stand out with premium branding' },
    { name: '📊 Advanced Analytics', included: true, description: 'Real-time sales insights & customer behavior' },
    { name: '⚡ Unlimited Flash Sales', included: true, description: 'Create urgency-driven promotions' },
    { name: '💬 Priority Support', included: true, description: '1-hour response time guarantee' },
    { name: '🎯 Featured Placement', included: true, description: 'Homepage banner spots available' },
    { name: '📈 SEO Boost', included: true, description: '3x better visibility in search' }
  ];

  const monthlyPrice = 599;
  const yearlyPrice = 5990; // ~499/month (17% savings)
  const yearlySavings = (monthlyPrice * 12) - yearlyPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {isLoading ? (
        /* ═══ Loading Skeleton ═══ */
        <div className="animate-pulse">
          <div className="bg-gradient-to-r from-indigo-200 to-purple-200 h-64"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6 grid grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded"></div>)}
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl h-96 border-2 border-gray-200"></div>
              <div className="bg-gray-100 rounded-2xl h-96"></div>
            </div>
          </div>
        </div>
      ) : error ? (
        /* ═══ Error State ═══ */
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            ลองใหม่อีกครั้ง
          </button>
        </div>
      ) : (
      <>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <SparklesIcon className="w-8 h-8 text-yellow-300" />
              <h1 className="text-4xl font-bold">Upgrade to PRO</h1>
              <SparklesIcon className="w-8 h-8 text-yellow-300" />
            </div>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Get 3x more customers with AI-powered recommendations and premium features
            </p>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BoltIcon className="w-5 h-5 text-yellow-300" />
                <span>ตรวจสอบโดยแอดมิน 1-2 วันทำการ</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-yellow-300" />
                <span>ยกเลิกคำขอได้ทุกเมื่อ</span>
              </div>
              <div className="flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-yellow-300" />
                <span>ไม่มีข้อผูกมัด</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Real request-status banner */}
      {user?.isPro ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5 text-center">
            <p className="font-bold text-emerald-800">🎉 คุณเป็นสมาชิก Pro อยู่แล้ว</p>
          </div>
        </div>
      ) : requestStatus === 'pending' ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 text-center">
            <p className="font-bold text-amber-800">⏳ คำขออัพเกรดของคุณกำลังรอแอดมินตรวจสอบ</p>
            <p className="text-sm text-amber-700 mt-1">ปกติใช้เวลา 1-2 วันทำการ</p>
          </div>
        </div>
      ) : requestStatus === 'rejected' ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 text-center">
            <p className="font-bold text-red-800">คำขอก่อนหน้าไม่ได้รับการอนุมัติ — ส่งคำขอใหม่ได้</p>
          </div>
        </div>
      ) : null}

      {/* Stats Banner */}
      {proStats && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{proStats.views}</div>
            <div className="text-sm text-gray-600">More Customer Views</div>
          </div>
          <div className="text-center border-x border-gray-200">
            <div className="text-3xl font-bold text-purple-600">{proStats.chooseRate}</div>
            <div className="text-sm text-gray-600">Choose PRO Shops First</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">{proStats.avgRevenue}</div>
            <div className="text-sm text-gray-600">Avg Monthly Revenue</div>
          </div>
        </div>
      </div>
      )}

      {/* Billing Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-7 w-14 items-center rounded-full bg-indigo-600 transition-colors"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <span className="ml-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
              Save ฿{yearlySavings.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Pricing Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* FREE TIER - Made to look basic */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8 relative"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Free Plan</h2>
              <div className="text-4xl font-bold text-gray-900 mb-1">฿0</div>
              <div className="text-sm text-gray-500">Forever</div>
            </div>

            <div className="space-y-4 mb-8">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  {feature.included ? (
                    <CheckCircleIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400 line-through'} ${feature.highlight ? 'font-semibold' : ''}`}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-lg font-medium">
                Current Plan
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Limited visibility • No AI priority • No automation
              </p>
            </div>
          </motion.div>

          {/* PRO TIER - Premium & Shiny */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-8 relative overflow-hidden transform hover:scale-105 transition-transform"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 animate-pulse"></div>
            
            {/* Popular badge */}
            <div className="absolute top-4 right-4 px-4 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-lg">
              🔥 MOST POPULAR
            </div>

            <div className="relative text-center mb-8 text-white">
              <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                <SparklesIcon className="w-7 h-7 text-yellow-300" />
                PRO Plan
                <SparklesIcon className="w-7 h-7 text-yellow-300" />
              </h2>
              <div className="text-5xl font-bold mb-1">
                ฿{billingCycle === 'monthly' ? monthlyPrice.toLocaleString() : Math.round(yearlyPrice / 12).toLocaleString()}
              </div>
              <div className="text-indigo-100">
                {billingCycle === 'monthly' ? 'per month' : 'per month (billed yearly)'}
              </div>
              {billingCycle === 'yearly' && (
                <div className="mt-2 text-yellow-300 font-semibold">
                  ฿{yearlyPrice.toLocaleString()} per year • Save 17%
                </div>
              )}
            </div>

            <div className="relative space-y-4 mb-8">
              {proFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircleIcon className={`w-6 h-6 flex-shrink-0 ${feature.highlight ? 'text-yellow-300' : 'text-indigo-200'}`} />
                  <div>
                    <div className={`text-sm font-medium ${feature.highlight ? 'text-yellow-300' : 'text-white'}`}>
                      {feature.name}
                    </div>
                    {feature.description && (
                      <div className="text-xs text-indigo-100 mt-1">{feature.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative text-center">
              <button
                onClick={handleUpgradeClick}
                disabled={user?.isPro || requestStatus === 'pending'}
                className="w-full px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {user?.isPro ? '✅ เป็น Pro อยู่แล้ว' : requestStatus === 'pending' ? '⏳ รอตรวจสอบ' : '🚀 ส่งคำขออัพเกรด'}
              </button>
              <p className="mt-3 text-xs text-indigo-100">
                📝 แอดมินตรวจสอบและติดต่อกลับเพื่อชำระเงิน • ยกเลิกได้ทุกเมื่อ
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Social Proof */}
      {testimonials.length > 0 && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-center mb-8">What PRO Merchants Say</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className={`text-center p-6 ${t.bgClass} rounded-xl`}>
                <div className="text-4xl mb-3">{t.emoji}</div>
                <div className="font-semibold text-gray-900 mb-2">
                  "{t.quote}"
                </div>
                <div className="text-sm text-gray-600">
                  - {t.author}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isProcessing && setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CurrencyDollarIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">ส่งคำขออัพเกรดเป็น Pro</h3>
                <p className="text-gray-600">แอดมินจะตรวจสอบและติดต่อกลับเพื่อนัดชำระเงิน</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700">แพ็กเกจ Pro</span>
                  <span className="font-bold text-gray-900">
                    ฿{billingCycle === 'monthly' ? monthlyPrice.toLocaleString() : yearlyPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>รอบบิล</span>
                  <span className="font-medium">{billingCycle === 'monthly' ? 'รายเดือน' : 'รายปี'}</span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="flex justify-between items-center text-sm text-emerald-600 font-semibold">
                    <span>ประหยัด</span>
                    <span>฿{yearlySavings.toLocaleString()}</span>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-indigo-200 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">ยอดที่ต้องชำระ (หลังอนุมัติ)</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ฿{billingCycle === 'monthly' ? monthlyPrice.toLocaleString() : yearlyPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    กำลังส่งคำขอ...
                  </span>
                ) : (
                  '📝 ยืนยันส่งคำขออัพเกรด'
                )}
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                ยังไม่มีการเรียกเก็บเงินใดๆ ในขั้นตอนนี้ — แอดมินจะติดต่อกลับเพื่อนัดชำระเงินหลังอนุมัติ
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  );
}
