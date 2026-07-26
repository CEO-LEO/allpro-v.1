'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/Admin/AdminLayout';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Crown,
  TrendingUp,
  Image as ImageIcon,
  Edit,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  promotion_id: string | null;
  is_pinned: boolean;
  is_active: boolean;
  priority: number;
  impressions: number;
  clicks: number;
}

interface BannerFormState {
  title: string;
  subtitle: string;
  image_url: string;
  promotion_id: string;
}

const EMPTY_FORM: BannerFormState = { title: '', subtitle: '', image_url: '', promotion_id: '' };

export default function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerFormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase.from('banners').select('*').order('priority', { ascending: true });
    if (error) {
      console.error('[Banners] load error:', error.message);
    } else {
      setBanners(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const swapPriority = async (index: number, otherIndex: number) => {
    const a = banners[index];
    const b = banners[otherIndex];
    if (!a || !b) return;
    const next = [...banners];
    [next[index], next[otherIndex]] = [next[otherIndex], next[index]];
    setBanners(next);

    const { error: e1 } = await supabase.from('banners').update({ priority: b.priority }).eq('id', a.id);
    const { error: e2 } = await supabase.from('banners').update({ priority: a.priority }).eq('id', b.id);
    if (e1 || e2) {
      toast.error('เปลี่ยนลำดับไม่สำเร็จ');
      load();
      return;
    }
    toast.success('เปลี่ยนลำดับแล้ว', { duration: 1500, position: 'top-center' });
  };

  const moveUp = (index: number) => index > 0 && swapPriority(index, index - 1);
  const moveDown = (index: number) => index < banners.length - 1 && swapPriority(index, index + 1);

  const toggleActive = async (banner: Banner) => {
    const newStatus = !banner.is_active;
    setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, is_active: newStatus } : b)));
    const { error } = await supabase.from('banners').update({ is_active: newStatus }).eq('id', banner.id);
    if (error) {
      toast.error('อัปเดตไม่สำเร็จ: ' + error.message);
      load();
      return;
    }
    toast(newStatus ? 'Banner activated ✓' : 'Banner deactivated', { duration: 2000, position: 'top-center', icon: newStatus ? '✅' : '⏸️' });
  };

  const togglePin = async (banner: Banner) => {
    const newPinStatus = !banner.is_pinned;
    setBanners((prev) => prev.map((b) => ({ ...b, is_pinned: b.id === banner.id ? newPinStatus : false })));

    // Unpin everyone else first, then set this one
    await supabase.from('banners').update({ is_pinned: false }).neq('id', banner.id);
    const { error } = await supabase.from('banners').update({ is_pinned: newPinStatus }).eq('id', banner.id);
    if (error) {
      toast.error('อัปเดตไม่สำเร็จ: ' + error.message);
      load();
      return;
    }
    toast(newPinStatus ? '📌 Pinned to #1 Spot' : 'Unpinned from #1 spot', {
      duration: 2500, position: 'top-center', style: { background: newPinStatus ? '#F59E0B' : '#6B7280', color: '#fff' },
    });
  };

  const handleDelete = async (banner: Banner) => {
    if (!confirm(`ลบ banner "${banner.title}"?`)) return;
    const { error } = await supabase.from('banners').delete().eq('id', banner.id);
    if (error) {
      toast.error('ลบไม่สำเร็จ: ' + error.message);
      return;
    }
    setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    toast.success('ลบ banner แล้ว');
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({ title: banner.title, subtitle: banner.subtitle || '', image_url: banner.image_url, promotion_id: banner.promotion_id || '' });
    setModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!form.title.trim() || !form.image_url.trim()) {
      toast.error('กรุณากรอกชื่อ Banner และ URL รูปภาพ');
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('banners').update({
          title: form.title.trim(),
          subtitle: form.subtitle.trim() || null,
          image_url: form.image_url.trim(),
          promotion_id: form.promotion_id.trim() || null,
        }).eq('id', editingId);
        if (error) throw new Error(error.message);
        toast.success('แก้ไข banner แล้ว');
      } else {
        const nextPriority = banners.length > 0 ? Math.max(...banners.map((b) => b.priority)) + 1 : 0;
        const { error } = await supabase.from('banners').insert({
          title: form.title.trim(),
          subtitle: form.subtitle.trim() || null,
          image_url: form.image_url.trim(),
          promotion_id: form.promotion_id.trim() || null,
          priority: nextPriority,
        });
        if (error) throw new Error(error.message);
        toast.success('สร้าง banner แล้ว');
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const activeBanners = banners.filter((b) => b.is_active).length;
  const totalImpressions = banners.reduce((sum, b) => sum + b.impressions, 0);
  const totalClicks = banners.reduce((sum, b) => sum + b.clicks, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0';

  return (
    <AdminLayout>
      <Toaster />
      <div className="min-h-screen bg-gray-900">
        <header className="bg-gray-950 border-b border-gray-800 px-6 py-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Hero Banner Manager</h1>
              <p className="text-sm text-gray-400">
                จัดการจริงผ่านตาราง banners — ยังไม่มี hero slider แสดงบนหน้าแรกจริง (แค่ backend/admin พร้อมแล้ว)
              </p>
            </div>
            <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all">
              <Edit className="w-4 h-4" /> Add New Banner
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-gray-400">Total Banners</p>
              </div>
              <p className="text-2xl font-bold text-white">{banners.length}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-green-400" />
                <p className="text-xs text-gray-400">Active Banners</p>
              </div>
              <p className="text-2xl font-bold text-green-400">{activeBanners}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <p className="text-xs text-gray-400">Total Impressions</p>
              </div>
              <p className="text-2xl font-bold text-white">{totalImpressions.toLocaleString()}</p>
              <p className="text-[10px] text-gray-500 mt-1">ยังไม่มีระบบนับ impressions จริง (ต้องต่อตอนมี slider แสดงจริง)</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-yellow-400" />
                <p className="text-xs text-gray-400">Avg CTR</p>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{avgCTR}%</p>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <Crown className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-400 font-bold mb-2">💰 Monetization Slot</h3>
                <p className="text-sm text-gray-300 mb-3">
                  The #1 pinned banner is your premium slot. Current pinned:{' '}
                  <strong className="text-white">{banners.find((b) => b.is_pinned)?.title || 'None'}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-16 flex items-center justify-center text-gray-500">
                <Loader2 className="w-7 h-7 animate-spin mr-3" /> กำลังโหลด...
              </div>
            ) : banners.length === 0 ? (
              <div className="text-center py-16 bg-gray-950 rounded-xl border-2 border-dashed border-gray-700">
                <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-400 mb-2">ยังไม่มี Banner</h3>
                <p className="text-sm text-gray-500 mb-4">เพิ่ม Banner เพื่อแสดงบนหน้าแรก</p>
                <button onClick={openAddModal} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all">
                  + สร้าง Banner ใหม่
                </button>
              </div>
            ) : (
              banners.map((banner, index) => (
                <motion.div
                  key={banner.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-gray-950 rounded-xl border-2 overflow-hidden transition-all ${
                    banner.is_pinned ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20' : 'border-gray-800'
                  } ${!banner.is_active ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex flex-col items-center gap-1">
                      <button onClick={() => moveUp(index)} disabled={index === 0} className="p-1 hover:bg-gray-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      </button>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-yellow-900' : index === 1 ? 'bg-gray-400 text-gray-900' : index === 2 ? 'bg-orange-400 text-orange-900' : 'bg-gray-700 text-gray-300'
                      }`}>
                        #{index + 1}
                      </div>
                      <button onClick={() => moveDown(index)} disabled={index === banners.length - 1} className="p-1 hover:bg-gray-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>

                    <div className="w-32 h-20 rounded-lg overflow-hidden border-2 border-gray-800 flex-shrink-0 bg-gray-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 truncate">
                        {banner.title}
                        {banner.is_pinned && (
                          <span className="ml-2 text-xs bg-yellow-500 text-yellow-900 px-2 py-0.5 rounded-full font-bold">📌 PINNED</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">{banner.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => togglePin(banner)}
                        className={`p-3 rounded-lg font-semibold transition-all border-2 ${
                          banner.is_pinned ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900 border-yellow-600' : 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700'
                        }`}
                        title={banner.is_pinned ? 'Unpin from #1' : 'Pin to #1 Spot'}
                      >
                        <Crown className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleActive(banner)}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 border-2 ${
                          banner.is_active ? 'bg-green-600 hover:bg-green-700 text-white border-green-700' : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                        }`}
                      >
                        {banner.is_active ? (<><Eye className="w-4 h-4" /> Active</>) : (<><EyeOff className="w-4 h-4" /> Inactive</>)}
                      </button>
                      <button onClick={() => openEditModal(banner)} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(banner)} className="p-3 bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white rounded-lg transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">{editingId ? 'แก้ไข Banner' : 'สร้าง Banner ใหม่'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">ชื่อ Banner *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">คำโปรย</label>
                <input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">URL รูปภาพ *</label>
                <input value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://..." className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Promotion ID (ถ้ามี)</label>
                <input value={form.promotion_id} onChange={(e) => setForm((f) => ({ ...f, promotion_id: e.target.value }))} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
              </div>
              <button
                onClick={handleSaveModal}
                disabled={isSaving}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'บันทึกการแก้ไข' : 'สร้าง Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
