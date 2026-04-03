'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Target, Crown, Wallet, Plus, Trash2, ToggleLeft, ToggleRight, BarChart3, RefreshCw, MousePointerClick } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  fetchMerchantSEMBids,
  updateSEMBid,
  getShopWallet,
  topUpWallet,
  getSEMClickStats,
  getWalletTransactions,
  type SEMBid,
  type WalletInfo,
  type WalletTransaction,
} from '@/lib/sem';

export default function SEOBidManager() {
  const { user } = useAuthStore();
  const shopId = user?.id || '';
  const shopName = user?.shopName || user?.name || '';

  const [bids, setBids] = useState<SEMBid[]>([]);
  const [wallet, setWallet] = useState<WalletInfo>({ balance: 0, total_spent: 0 });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [clickStats, setClickStats] = useState<{ totalClicks: number; totalSpent: number; clicksByKeyword: { keyword: string; clicks: number; spent: number }[] }>({ totalClicks: 0, totalSpent: 0, clicksByKeyword: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [editingBid, setEditingBid] = useState<string | null>(null);
  const [editKeywords, setEditKeywords] = useState('');
  const [editCPC, setEditCPC] = useState('');
  const [tab, setTab] = useState<'bids' | 'stats'>('bids');

  const loadData = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    const [bidsData, walletData, statsData, txData] = await Promise.all([
      fetchMerchantSEMBids(shopId, shopName),
      getShopWallet(shopId),
      getSEMClickStats(shopId),
      getWalletTransactions(shopId),
    ]);
    setBids(bidsData);
    setWallet(walletData);
    setClickStats(statsData);
    setTransactions(txData);
    setLoading(false);
  }, [shopId, shopName]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggleActive = async (bid: SEMBid) => {
    setSaving(bid.id);
    const ok = await updateSEMBid(bid.id, bid.sem_keywords || [], bid.cpc_bid || 0, !bid.sem_active);
    if (ok) {
      setBids(prev => prev.map(b => b.id === bid.id ? { ...b, sem_active: !b.sem_active } : b));
    }
    setSaving(null);
  };

  const handleSaveEdit = async (bid: SEMBid) => {
    const keywords = editKeywords.split(',').map(k => k.trim()).filter(Boolean);
    const cpc = parseFloat(editCPC);
    if (keywords.length === 0 || isNaN(cpc) || cpc <= 0) return;

    setSaving(bid.id);
    const ok = await updateSEMBid(bid.id, keywords, cpc, bid.sem_active);
    if (ok) {
      setBids(prev => prev.map(b => b.id === bid.id ? { ...b, sem_keywords: keywords, cpc_bid: cpc } : b));
    }
    setEditingBid(null);
    setSaving(null);
  };

  const handleClearBid = async (bid: SEMBid) => {
    setSaving(bid.id);
    const ok = await updateSEMBid(bid.id, [], 0, false);
    if (ok) {
      setBids(prev => prev.map(b => b.id === bid.id ? { ...b, sem_keywords: [], cpc_bid: 0, sem_active: false } : b));
    }
    setSaving(null);
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) return;
    const result = await topUpWallet(shopId, amount);
    if (result.success) {
      setWallet(prev => ({ ...prev, balance: result.newBalance }));
      setTopUpAmount('');
      setShowTopUp(false);
      loadData();
    }
  };

  const startEdit = (bid: SEMBid) => {
    setEditingBid(bid.id);
    setEditKeywords((bid.sem_keywords || []).join(', '));
    setEditCPC(String(bid.cpc_bid || 1));
  };

  const activeBids = bids.filter(b => b.sem_active && (b.sem_keywords || []).length > 0);
  const availableProducts = bids.filter(b => !(b.sem_active && (b.sem_keywords || []).length > 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-[#FF5722]" />
            SEM Keyword Bidding
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            ประมูล Keyword เพื่อให้สินค้าแสดงเป็นอันดับแรกในผลค้นหา (Pay-Per-Click)
          </p>
        </div>
        <button onClick={loadData} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="รีเฟรช">
          <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Wallet Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8" />
            <div>
              <p className="text-sm text-orange-100">กระเป๋าเงิน SEM</p>
              <p className="text-2xl font-bold">฿{wallet.balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-orange-200">ใช้ไปแล้ว</p>
            <p className="text-sm font-semibold">฿{wallet.total_spent.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setShowTopUp(!showTopUp)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> เติมเงิน
          </button>
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            <BarChart3 className="w-4 h-4" /> ประวัติ
          </button>
        </div>

        {/* Top-up */}
        {showTopUp && (
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              min="1"
              value={topUpAmount}
              onChange={e => setTopUpAmount(e.target.value)}
              placeholder="จำนวนเงิน (บาท)"
              className="flex-1 px-3 py-2 rounded-lg bg-white/20 text-white placeholder:text-orange-200 outline-none"
            />
            <button
              onClick={handleTopUp}
              className="px-4 py-2 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-colors"
            >
              เติม
            </button>
          </div>
        )}
      </div>

      {/* Transactions */}
      {showTransactions && transactions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 max-h-60 overflow-y-auto">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">ประวัติธุรกรรม</h4>
          <div className="space-y-2">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className={`font-medium ${tx.type === 'topup' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'topup' ? '+' : '-'}฿{Math.abs(tx.amount).toFixed(2)}
                  </span>
                  <span className="text-gray-500 ml-2">{tx.description}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('th-TH')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setTab('bids')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'bids' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
        >
          จัดการ Bids ({activeBids.length})
        </button>
        <button
          onClick={() => setTab('stats')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'stats' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
        >
          สถิติคลิก
        </button>
      </div>

      {tab === 'bids' ? (
        <div className="space-y-4">
          {/* Active Bids */}
          {activeBids.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                กำลังประมูลอยู่ ({activeBids.length})
              </h4>
              <div className="space-y-3">
                {activeBids.map(bid => (
                  <div key={bid.id} className="bg-white rounded-xl border-2 border-orange-200 p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{bid.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">CPC: ฿{(bid.cpc_bid || 0).toFixed(2)} / คลิก</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(bid)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleToggleActive(bid)}
                          disabled={saving === bid.id}
                          className="text-orange-500 hover:text-orange-600"
                        >
                          <ToggleRight className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    {editingBid === bid.id ? (
                      <div className="mt-3 space-y-2">
                        <input
                          value={editKeywords}
                          onChange={e => setEditKeywords(e.target.value)}
                          placeholder="Keywords คั่นด้วยเครื่องหมาย ,"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={editCPC}
                            onChange={e => setEditCPC(e.target.value)}
                            placeholder="CPC (บาท)"
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <button onClick={() => handleSaveEdit(bid)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium">บันทึก</button>
                          <button onClick={() => setEditingBid(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">ยกเลิก</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(bid.sem_keywords || []).map(kw => (
                          <span key={kw} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">{kw}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Products to Bid */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">สินค้าที่สามารถตั้งค่า SEM</h4>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : availableProducts.length === 0 && activeBids.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">ยังไม่มีสินค้าในระบบ</p>
                <p className="text-xs text-gray-500 mt-1">สร้างสินค้าในหน้า Dashboard ก่อน แล้วกลับมาตั้งค่า SEM ที่นี่</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableProducts.map(bid => (
                  <div key={bid.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{bid.title}</p>
                      {(bid.sem_keywords || []).length > 0 ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggleActive(bid)} disabled={saving === bid.id} className="text-gray-400 hover:text-green-500">
                            <ToggleLeft className="w-6 h-6" />
                          </button>
                          <button onClick={() => handleClearBid(bid)} disabled={saving === bid.id} className="text-gray-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : editingBid === bid.id ? null : (
                        <button onClick={() => startEdit(bid)} className="text-xs text-orange-600 hover:underline font-medium">
                          + ตั้งค่า SEM
                        </button>
                      )}
                    </div>

                    {editingBid === bid.id ? (
                      <div className="mt-3 space-y-2">
                        <input
                          value={editKeywords}
                          onChange={e => setEditKeywords(e.target.value)}
                          placeholder="Keywords คั่นด้วยเครื่องหมาย , เช่น กาแฟ, coffee, ลาเต้"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={editCPC}
                            onChange={e => setEditCPC(e.target.value)}
                            placeholder="CPC (บาท/คลิก)"
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <button onClick={() => handleSaveEdit(bid)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">บันทึก</button>
                          <button onClick={() => setEditingBid(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">ยกเลิก</button>
                        </div>
                      </div>
                    ) : (bid.sem_keywords || []).length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {bid.sem_keywords.map(kw => (
                          <span key={kw} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{kw}</span>
                        ))}
                        <span className="text-xs text-gray-400 self-center ml-1">฿{(bid.cpc_bid || 0).toFixed(2)}/คลิก · หยุดอยู่</span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Stats Tab */
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <MousePointerClick className="w-6 h-6 text-orange-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{clickStats.totalClicks}</p>
              <p className="text-xs text-gray-500">คลิกทั้งหมด (30 วัน)</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <Wallet className="w-6 h-6 text-red-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">฿{clickStats.totalSpent.toFixed(2)}</p>
              <p className="text-xs text-gray-500">ค่าโฆษณา (30 วัน)</p>
            </div>
          </div>

          {/* Click by Keyword */}
          {clickStats.clicksByKeyword.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">คลิกแยกตาม Keyword</h4>
              <div className="space-y-2">
                {clickStats.clicksByKeyword.map(kw => (
                  <div key={kw.keyword} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{kw.keyword}</span>
                    <div className="text-right">
                      <span className="text-gray-600">{kw.clicks} คลิก</span>
                      <span className="text-gray-400 ml-2">฿{kw.spent.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600">ยังไม่มีข้อมูลคลิก</p>
              <p className="text-xs text-gray-500 mt-1">เมื่อผู้ใช้คลิกโฆษณา จะแสดงสถิติที่นี่</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
