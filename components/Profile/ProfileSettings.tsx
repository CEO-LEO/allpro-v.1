'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  User, Mail, Camera, Save, X, Edit3, Shield, Star,
  Loader2, CheckCircle, Trophy, Sparkles, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProfileData {
  name: string;
  email: string;
  avatarUrl: string;
}

// ─── Utility: Level calculation from XP ──────────────────────────────────────
function getLevelFromXp(xp: number): { level: number; progress: number; nextLevelXp: number } {
  const level = Math.floor(xp / 500) + 1;
  const currentLevelXp = (level - 1) * 500;
  const nextLevelXp = level * 500;
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return { level, progress, nextLevelXp };
}

// ─── Glassmorphism Card Wrapper ──────────────────────────────────────────────
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-neutral-900/70 backdrop-blur-xl
        border border-neutral-800/60
        shadow-[0_0_40px_-12px_rgba(132,204,22,0.12)]
        transition-all duration-300
        ${className}
      `}
    >
      {/* Subtle top-edge glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-500/30 to-transparent" />
      {children}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ██  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function ProfileSettings() {
  const { user, updateUser } = useAuthStore();

  // ── Core state ────────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Form state (editable copy) ────────────────────────────────────────────
  const [form, setForm] = useState<ProfileData>({
    name: '',
    email: '',
    avatarUrl: '',
  });

  // ── Preview-only blob URL for selected file ───────────────────────────────
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form state whenever user data or edit mode changes
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        avatarUrl: user.avatar || '',
      });
    }
  }, [user, isEditing]);

  // ── Derived gamification data ─────────────────────────────────────────────
  const xp = user?.xp ?? 0;
  const coins = user?.coins ?? 0;
  const { level, progress, nextLevelXp } = getLevelFromXp(xp);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (field: keyof ProfileData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate basic image type
    if (!file.type.startsWith('image/')) return;

    // Revoke previous blob URL to prevent memory leaks
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setForm((prev) => ({ ...prev, avatarUrl: url }));
  };

  const handleCancel = useCallback(() => {
    // Revert to the original data from store
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        avatarUrl: user.avatar || '',
      });
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setIsEditing(false);
  }, [user, previewUrl]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Persist to zustand store
    updateUser({
      name: form.name,
      email: form.email,
      avatar: form.avatarUrl,
    });

    setIsSaving(false);
    setSaveSuccess(true);
    setIsEditing(false);

    // Clear preview blob
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    // Reset success badge after 2 s
    setTimeout(() => setSaveSuccess(false), 2000);
  }, [form, previewUrl, updateUser]);

  // ── Guard: no user loaded yet ─────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <section className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg space-y-6">
        {/* ─── Page Title ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-lime-500/10 ring-1 ring-lime-500/20">
            <User className="w-5 h-5 text-lime-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-sm text-neutral-500">จัดการข้อมูลส่วนตัวและโปรไฟล์ของคุณ</p>
          </div>
        </div>

        {/* ═══ Avatar + Gamification Card ═══════════════════════════════ */}
        <GlassCard className="p-6">
          <div className="flex flex-col items-center gap-4">
            {/* Avatar */}
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={!isEditing}
              className="relative group"
              aria-label="เปลี่ยนรูปโปรไฟล์"
            >
              <div className="relative w-28 h-28 rounded-full ring-2 ring-lime-500/40 ring-offset-4 ring-offset-neutral-950 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.avatarUrl || '/icons/icon-192x192.png'}
                  alt={form.name}
                  className="w-full h-full object-cover"
                />

                {/* Hover overlay (edit mode only) */}
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Camera className="w-7 h-7 text-lime-400" />
                  </div>
                )}
              </div>

              {/* Online indicator */}
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-lime-500 ring-2 ring-neutral-950" />
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Name + Role */}
            <div className="text-center">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                {user.role === 'MERCHANT' ? 'ร้านค้า' : 'ผู้ใช้งาน'}
                {user.verified && (
                  <Shield className="inline w-4 h-4 ml-1 text-lime-400" />
                )}
              </p>
            </div>

            {/* ─── Gamification Badge ──────────────────────────────────── */}
            <div className="w-full mt-2 px-2">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-lime-400" />
                  <span className="text-lime-400 font-semibold">Hunter Level {level}</span>
                </span>
                <span>{xp} / {nextLevelXp} XP</span>
              </div>

              {/* XP progress bar */}
              <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-lime-500 to-lime-400 transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-center gap-6 mt-3 text-xs font-medium">
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-3.5 h-3.5" /> {coins} Coins
                </span>
                <span className="flex items-center gap-1 text-lime-400">
                  <Sparkles className="w-3.5 h-3.5" /> Level {level}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* ═══ Profile Form Card ═══════════════════════════════════════ */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-lime-400" />
              ข้อมูลส่วนตัว
            </h3>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="
                  flex items-center gap-1.5 text-sm font-medium
                  text-lime-400 hover:text-lime-300
                  px-3 py-1.5 rounded-lg
                  bg-lime-500/10 hover:bg-lime-500/20
                  ring-1 ring-lime-500/20
                  transition-all duration-200
                "
              >
                <Edit3 className="w-3.5 h-3.5" />
                แก้ไข
              </button>
            )}

            {/* Save-success feedback */}
            {saveSuccess && (
              <span className="flex items-center gap-1 text-sm text-lime-400 animate-pulse">
                <CheckCircle className="w-4 h-4" /> บันทึกแล้ว
              </span>
            )}
          </div>

          {/* ── Fields ─────────────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                <User className="w-3.5 h-3.5" /> ชื่อ
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="
                    w-full px-4 py-3 rounded-xl text-sm
                    bg-neutral-800/80 border border-neutral-700
                    text-neutral-100 placeholder:text-neutral-600
                    focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50
                    transition-all duration-200
                  "
                  placeholder="ชื่อของคุณ"
                />
              ) : (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-800/40 border border-neutral-800">
                  <span className="text-sm">{user.name || '—'}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                <Mail className="w-3.5 h-3.5" /> อีเมล
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="
                    w-full px-4 py-3 rounded-xl text-sm
                    bg-neutral-800/80 border border-neutral-700
                    text-neutral-100 placeholder:text-neutral-600
                    focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50
                    transition-all duration-200
                  "
                  placeholder="email@example.com"
                />
              ) : (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-800/40 border border-neutral-800">
                  <span className="text-sm">{user.email || '—'}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                </div>
              )}
            </div>

            {/* Role (read-only) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                <Shield className="w-3.5 h-3.5" /> บทบาท
              </label>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-800/40 border border-neutral-800">
                <span className="text-sm">
                  {user.role === 'MERCHANT' ? '🏪 ร้านค้า (Merchant)' : '🎯 Hunter (User)'}
                </span>
                {user.isPro && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-400 ring-1 ring-lime-500/30">
                    PRO
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Action Buttons (visible in edit mode) ──────────────────── */}
          {isEditing && (
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="
                  flex-1 flex items-center justify-center gap-2
                  px-4 py-3 rounded-xl text-sm font-medium
                  bg-neutral-800 text-neutral-400
                  hover:bg-neutral-700 hover:text-neutral-200
                  border border-neutral-700
                  transition-all duration-200
                  disabled:opacity-40
                "
              >
                <X className="w-4 h-4" />
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="
                  flex-1 flex items-center justify-center gap-2
                  px-4 py-3 rounded-xl text-sm font-bold
                  bg-lime-500 text-neutral-950
                  hover:bg-lime-400
                  shadow-[0_0_24px_-4px_rgba(132,204,22,0.4)]
                  hover:shadow-[0_0_32px_-4px_rgba(132,204,22,0.6)]
                  transition-all duration-200
                  disabled:opacity-60
                "
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          )}
        </GlassCard>

        {/* ═══ Quick Links ═════════════════════════════════════════════ */}
        <GlassCard className="divide-y divide-neutral-800/60">
          {[
            { label: 'ความปลอดภัย', desc: 'รหัสผ่าน, 2FA', icon: Shield },
            { label: 'การแจ้งเตือน', desc: 'อีเมล, Push, SMS', icon: Sparkles },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-neutral-800/40 transition-colors duration-200"
            >
              <div className="p-2 rounded-xl bg-lime-500/10">
                <item.icon className="w-4 h-4 text-lime-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-neutral-500 truncate">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-600" />
            </button>
          ))}
        </GlassCard>
      </div>
    </section>
  );
}
