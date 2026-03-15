'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  QrCode, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Gift,
  Sparkles,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { getWalletVouchers, markVoucherAsUsed, getPointsBalance, getPointsHistory, type Voucher, type PointsTransaction } from '@/lib/pointsUtils';
import toast from 'react-hot-toast';
import Image from 'next/image';
import QRCode from 'react-qr-code';
import RedemptionSlider from '@/components/Wallet/RedemptionSlider';
import ActiveCoupon from '@/components/Wallet/ActiveCoupon';

type TabType = 'vouchers' | 'history';
type VoucherFilter = 'active' | 'used' | 'expired';

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<TabType>('vouchers');
  const [voucherFilter, setVoucherFilter] = useState<VoucherFilter>('active');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [history, setHistory] = useState<PointsTransaction[]>([]);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [activeRedemption, setActiveRedemption] = useState<Voucher | null>(null);

  useEffect(() => {
    loadData();

    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadData = () => {
    setVouchers(getWalletVouchers());
    setHistory(getPointsHistory());
    setPointsBalance(getPointsBalance());
  };

  const handleMarkAsUsed = (voucherId: string) => {
    const success = markVoucherAsUsed(voucherId);
    if (success) {
      toast.success('ทำเครื่องหมายใช้งานแล้ว ✓');
      loadData();
      setSelectedVoucher(null);
    }
  };

  const filteredVouchers = vouchers.filter(v => v.status === voucherFilter);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getDaysUntilExpiry = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/rewards" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">💼 My Wallet</h1>
            </div>
            <Link 
              href="/rewards"
              className="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-1"
            >
              แลกของรางวัล
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Points Balance Card */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium mb-2">ยอดคงเหลือ</p>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
              <span className="text-5xl font-black text-white drop-shadow-lg">
                {pointsBalance.toLocaleString()}
              </span>
              <span className="text-2xl font-bold text-white/90">Points</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-white text-2xl font-bold">{vouchers.filter(v => v.status === 'active').length}</p>
                <p className="text-white/80 text-xs">คูปองใช้ได้</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-white text-2xl font-bold">{vouchers.filter(v => v.status === 'used').length}</p>
                <p className="text-white/80 text-xs">ใช้แล้ว</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-white text-2xl font-bold">{history.filter(h => h.type === 'earn').length}</p>
                <p className="text-white/80 text-xs">ครั้งที่ได้แต้ม</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[73px] z-30 bg-white border-y border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('vouchers')}
              className={`flex-1 py-4 font-semibold transition-all relative ${
                activeTab === 'vouchers'
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Wallet className="w-5 h-5" />
                คูปองของฉัน
              </div>
              {activeTab === 'vouchers' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-t-full"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 font-semibold transition-all relative ${
                activeTab === 'history'
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5" />
                ประวัติแต้ม
              </div>
              {activeTab === 'history' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-t-full"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'vouchers' ? (
            <motion.div
              key="vouchers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Voucher Filters */}
              <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-2">
                <button
                  onClick={() => setVoucherFilter('active')}
                  className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                    voucherFilter === 'active'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✓ ใช้ได้ ({vouchers.filter(v => v.status === 'active').length})
                </button>
                <button
                  onClick={() => setVoucherFilter('used')}
                  className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                    voucherFilter === 'used'
                      ? 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✓ ใช้แล้ว ({vouchers.filter(v => v.status === 'used').length})
                </button>
                <button
                  onClick={() => setVoucherFilter('expired')}
                  className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                    voucherFilter === 'expired'
                      ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✗ หมดอายุ ({vouchers.filter(v => v.status === 'expired').length})
                </button>
              </div>

              {/* Vouchers List */}
              {filteredVouchers.length === 0 ? (
                <div className="text-center py-16">
                  <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">ยังไม่มีคูปอง</p>
                  <Link
                    href="/rewards"
                    className="text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    ไปแลกของรางวัล →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredVouchers.map((voucher) => {
                    const daysLeft = getDaysUntilExpiry(voucher.expiresAt);
                    const isExpiringSoon = daysLeft <= 7 && voucher.status === 'active';

                    return (
                      <motion.div
                        key={voucher.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => voucher.status === 'active' && setSelectedVoucher(voucher)}
                        className={`bg-white rounded-2xl p-4 shadow-md border-2 transition-all ${
                          voucher.status === 'active'
                            ? 'border-green-200 hover:border-green-400 cursor-pointer hover:shadow-lg'
                            : voucher.status === 'used'
                            ? 'border-gray-200 opacity-60'
                            : 'border-red-200 opacity-50'
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Image */}
                          <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                            <Image
                              src={voucher.rewardImage}
                              alt={voucher.rewardName}
                              fill
                              className="object-cover"
                            />
                            {voucher.status === 'used' && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-white" />
                              </div>
                            )}
                            {voucher.status === 'expired' && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <XCircle className="w-8 h-8 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                                  {voucher.rewardName}
                                </h3>
                                <p className="text-xs text-gray-600">{voucher.brand}</p>
                              </div>
                              {voucher.status === 'active' && (
                                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                                  ใช้ได้
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <QrCode className="w-3 h-3" />
                                <span className="font-mono">{voucher.code}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar className="w-3 h-3" />
                                <span>หมดอายุ: {formatDate(voucher.expiresAt)}</span>
                              </div>
                              {isExpiringSoon && (
                                <p className="text-xs text-orange-600 font-semibold">
                                  ⚠️ เหลืออีก {daysLeft} วัน!
                                </p>
                              )}
                            </div>
                          </div>

                          {voucher.status === 'active' && (
                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* History List */}
              {history.length === 0 ? (
                <div className="text-center py-16">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">ยังไม่มีประวัติการใช้แต้ม</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'earn'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          <span className="text-lg">{transaction.icon}</span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {transaction.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(transaction.timestamp)}
                          </div>
                        </div>

                        {/* Amount */}
                        <div className={`text-right font-bold ${
                          transaction.type === 'earn'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          <p className="text-lg">
                            {transaction.type === 'earn' ? '+' : '-'}
                            {transaction.amount}
                          </p>
                          <p className="text-xs">แต้ม</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Secure Redemption Flow */}
      <AnimatePresence>
        {selectedVoucher && !activeRedemption && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVoucher(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white text-center relative">
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                >
                  <span className="text-white text-xl">×</span>
                </button>
                <h2 className="text-2xl font-bold mb-2">{selectedVoucher.rewardName}</h2>
                <p className="text-purple-100">{selectedVoucher.brand}</p>
                <p className="text-lg font-bold text-white mt-2">{selectedVoucher.value}</p>
              </div>

              {/* Voucher Preview */}
              <div className="p-6 bg-gray-50">
                <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-purple-200 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src={selectedVoucher.rewardImage}
                      alt={selectedVoucher.rewardName}
                      width={60}
                      height={60}
                      className="rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{selectedVoucher.rewardName}</p>
                      <p className="text-xs text-gray-600">{selectedVoucher.brand}</p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-xl p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">รหัส:</span>
                      <span className="font-mono font-bold text-gray-900">{selectedVoucher.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">แลกเมื่อ:</span>
                      <span className="font-medium text-gray-900">{formatDate(selectedVoucher.redeemedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">หมดอายุ:</span>
                      <span className="font-medium text-orange-600">{formatDate(selectedVoucher.expiresAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Redemption Slider */}
                <RedemptionSlider
                  onUnlock={() => {
                    setActiveRedemption(selectedVoucher);
                    setSelectedVoucher(null);
                  }}
                  voucherName={selectedVoucher.rewardName}
                />
              </div>

              {/* Cancel Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  ยกเลิก
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Active Coupon Screen (After Unlock) */}
        {activeRedemption && (
          <ActiveCoupon
            voucherId={activeRedemption.id}
            voucherCode={activeRedemption.code}
            voucherName={activeRedemption.rewardName}
            voucherValue={activeRedemption.value}
            brand={activeRedemption.brand}
            qrData={activeRedemption.qrData}
            onClose={() => {
              setActiveRedemption(null);
              loadData();
            }}
            onExpire={() => {
              toast.error('คูปองหมดอายุแล้ว');
              loadData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
