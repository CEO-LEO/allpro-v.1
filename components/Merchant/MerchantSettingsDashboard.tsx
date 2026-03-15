'use client';

import { useState, useRef, useCallback } from 'react';
import {
  // Tab icons
  Store, Bell, ShieldCheck, CreditCard, Palette, Globe, Settings2,
  // UI icons
  Save, Loader2, CheckCircle, Upload, Camera, AlertTriangle, Trash2,
  X, ChevronRight, Lock, Eye, EyeOff, Smartphone, Mail,
  Zap, Clock, CreditCard as CardIcon, Building2, Languages,
  Sun, Moon, Monitor, Flame, RotateCcw
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface TabDef {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

interface SettingsState {
  // Profile & Store Info
  storeName: string;
  branchCode: string;
  managerEmail: string;
  storeLogo: string | null;

  // Notifications
  pushNotifications: boolean;
  emailNotifications: boolean;
  flashSaleAlerts: boolean;
  newOrderAlerts: boolean;

  // Security
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;

  // Payment
  bankName: string;
  accountNumber: string;
  codEnabled: boolean;

  // Theme
  theme: 'dark' | 'light' | 'system';

  // Language & Region
  language: 'th' | 'en';
  timezone: string;

  // Advanced
  autoCleanExpired: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

const TABS: TabDef[] = [
  { id: 'profile',       label: 'ข้อมูลร้านค้า',     icon: Store,       description: 'จัดการข้อมูลร้านค้าและโปรไฟล์' },
  { id: 'notifications', label: 'การแจ้งเตือน',      icon: Bell,        description: 'ตั้งค่าการแจ้งเตือนต่างๆ' },
  { id: 'security',      label: 'ความปลอดภัย',       icon: ShieldCheck, description: 'รหัสผ่านและการยืนยันตัวตน' },
  { id: 'payment',       label: 'การชำระเงิน',       icon: CreditCard,  description: 'วิธีการรับชำระเงิน' },
  { id: 'theme',         label: 'ธีมและรูปแบบ',      icon: Palette,     description: 'ปรับแต่งหน้าตาแอปพลิเคชัน' },
  { id: 'language',      label: 'ภาษาและภูมิภาค',    icon: Globe,       description: 'ภาษาและเขตเวลา' },
  { id: 'advanced',      label: 'ตั้งค่าขั้นสูง',     icon: Settings2,   description: 'การตั้งค่าขั้นสูงและโซนอันตราย' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// REUSABLE UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

/** Glassmorphism card with optional neon top-edge */
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-neutral-900/70 backdrop-blur-xl border border-neutral-800/60 ${className}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-500/25 to-transparent" />
      {children}
    </div>
  );
}

/** Styled toggle switch */
function Toggle({ enabled, onChange, label, description }: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-200">{label}</p>
        {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`
          relative flex-shrink-0 h-6 w-11 rounded-full
          transition-colors duration-200 ease-in-out cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-lime-500/40 focus:ring-offset-2 focus:ring-offset-neutral-950
          ${enabled ? 'bg-lime-500' : 'bg-neutral-700'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg
            transform transition-transform duration-200 ease-in-out
            translate-y-0.5
            ${enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
}

/** Styled text input */
function Input({ label, icon: Icon, ...props }: {
  label: string;
  icon?: React.ElementType;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
        {Icon && <Icon className="w-3.5 h-3.5" />} {label}
      </label>
      <input
        {...props}
        className={`
          w-full px-4 py-3 rounded-xl text-sm
          bg-neutral-800/80 border border-neutral-700
          text-neutral-100 placeholder:text-neutral-600
          focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50
          transition-all duration-200
          ${props.className || ''}
        `}
      />
    </div>
  );
}

/** Styled select dropdown */
function Select({ label, icon: Icon, options, value, onChange }: {
  label: string;
  icon?: React.ElementType;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
        {Icon && <Icon className="w-3.5 h-3.5" />} {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-4 py-3 rounded-xl text-sm appearance-none
          bg-neutral-800/80 border border-neutral-700
          text-neutral-100
          focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50
          transition-all duration-200 cursor-pointer
        "
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/** Section heading inside a tab */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-neutral-200 mb-4 flex items-center gap-2">
      {children}
    </h3>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function MerchantSettingsDashboard() {
  const { user } = useAuthStore();

  // ── Active tab ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('profile');

  // ── Saving state ──────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Confirm modal for danger zone ─────────────────────────────────────────
  const [dangerModal, setDangerModal] = useState<null | 'deactivate' | 'clearCache'>(null);

  // ── Password visibility ───────────────────────────────────────────────────
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // ── Logo upload ───────────────────────────────────────────────────────────
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // ── Settings state (single source of truth) ───────────────────────────────
  const [settings, setSettings] = useState<SettingsState>({
    storeName:          user?.shopName || 'Siam Store',
    branchCode:         'BRN-001',
    managerEmail:       user?.email || 'manager@store.com',
    storeLogo:          user?.shopLogo || null,

    pushNotifications:  true,
    emailNotifications: true,
    flashSaleAlerts:    true,
    newOrderAlerts:     true,

    currentPassword:    '',
    newPassword:        '',
    confirmPassword:    '',
    twoFactorEnabled:   false,

    bankName:           'ธนาคารกสิกรไทย',
    accountNumber:      '•••• •••• 4829',
    codEnabled:         false,

    theme:              'dark',

    language:           'th',
    timezone:           'Asia/Bangkok',

    autoCleanExpired:   true,
  });

  // ── Generic updater ───────────────────────────────────────────────────────
  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // ── Handle logo file selection ────────────────────────────────────────────
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    update('storeLogo', url);
  };

  // ── Save handler (simulated API call) ─────────────────────────────────────
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  }, []);

  // ── Danger zone actions ───────────────────────────────────────────────────
  const handleDangerAction = useCallback(() => {
    setDangerModal(null);
    handleSave();
  }, [handleSave]);

  // ── Active tab metadata ───────────────────────────────────────────────────
  const currentTab = TABS.find((t) => t.id === activeTab)!;

  // ═══════════════════════════════════════════════════════════════════════════
  //  TAB CONTENT RENDERERS
  // ═══════════════════════════════════════════════════════════════════════════

  const renderProfileTab = () => (
    <div className="space-y-6">
      <SectionTitle>
        <Store className="w-4 h-4 text-lime-400" /> ข้อมูลร้านค้า
      </SectionTitle>

      {/* Logo upload */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => logoInputRef.current?.click()}
          className="relative group flex-shrink-0"
        >
          <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-neutral-700 group-hover:ring-lime-500/50 transition-all duration-200 bg-neutral-800 flex items-center justify-center">
            {settings.storeLogo || logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview || settings.storeLogo || ''} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-8 h-8 text-neutral-600" />
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-lime-400" />
            </div>
          </div>
        </button>
        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        <div>
          <p className="text-sm font-medium text-neutral-200">โลโก้ร้านค้า</p>
          <p className="text-xs text-neutral-500 mt-0.5">คลิกเพื่ออัปโหลดรูปภาพใหม่ (PNG, JPG)</p>
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="mt-2 text-xs text-lime-400 hover:text-lime-300 font-medium flex items-center gap-1"
          >
            <Upload className="w-3 h-3" /> อัปโหลดโลโก้
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="ชื่อร้านค้า" icon={Store} value={settings.storeName} onChange={(e) => update('storeName', e.target.value)} placeholder="ชื่อร้านค้าของคุณ" />
        <Input label="รหัสสาขา" icon={Building2} value={settings.branchCode} onChange={(e) => update('branchCode', e.target.value)} placeholder="เช่น BRN-001" />
      </div>
      <Input label="อีเมลผู้จัดการ" icon={Mail} type="email" value={settings.managerEmail} onChange={(e) => update('managerEmail', e.target.value)} placeholder="manager@store.com" />
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <SectionTitle>
        <Bell className="w-4 h-4 text-lime-400" /> ตั้งค่าการแจ้งเตือน
      </SectionTitle>

      <GlassCard className="p-5 divide-y divide-neutral-800/60">
        <Toggle label="Push Notifications" description="รับการแจ้งเตือนบนอุปกรณ์ของคุณ" enabled={settings.pushNotifications} onChange={(v) => update('pushNotifications', v)} />
        <Toggle label="แจ้งเตือนผ่านอีเมล" description="รับข้อมูลอัปเดตผ่านอีเมล" enabled={settings.emailNotifications} onChange={(v) => update('emailNotifications', v)} />
        <Toggle label="แจ้งเตือน Flash Sale อัตโนมัติ" description="รับการแจ้งเตือนเมื่อ Flash Sale เริ่มต้น" enabled={settings.flashSaleAlerts} onChange={(v) => update('flashSaleAlerts', v)} />
        <Toggle label="แจ้งเตือนออเดอร์ใหม่" description="รับแจ้งเมื่อมีคำสั่งซื้อเข้ามาใหม่" enabled={settings.newOrderAlerts} onChange={(v) => update('newOrderAlerts', v)} />
      </GlassCard>

      {/* Summary */}
      <div className="flex items-center gap-2 text-xs text-neutral-500 px-1">
        <Bell className="w-3.5 h-3.5" />
        <span>
          เปิดอยู่ {[settings.pushNotifications, settings.emailNotifications, settings.flashSaleAlerts, settings.newOrderAlerts].filter(Boolean).length} จาก 4 ช่องทาง
        </span>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <SectionTitle>
        <Lock className="w-4 h-4 text-lime-400" /> เปลี่ยนรหัสผ่าน
      </SectionTitle>

      <div className="space-y-4">
        {/* Current password */}
        <div className="relative">
          <Input
            label="รหัสผ่านปัจจุบัน"
            icon={Lock}
            type={showCurrentPw ? 'text' : 'password'}
            value={settings.currentPassword}
            onChange={(e) => update('currentPassword', e.target.value)}
            placeholder="••••••••"
          />
          <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-9 text-neutral-500 hover:text-neutral-300">
            {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* New password */}
        <div className="relative">
          <Input
            label="รหัสผ่านใหม่"
            icon={ShieldCheck}
            type={showNewPw ? 'text' : 'password'}
            value={settings.newPassword}
            onChange={(e) => update('newPassword', e.target.value)}
            placeholder="••••••••"
          />
          <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-9 text-neutral-500 hover:text-neutral-300">
            {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Confirm password */}
        <Input
          label="ยืนยันรหัสผ่านใหม่"
          icon={ShieldCheck}
          type="password"
          value={settings.confirmPassword}
          onChange={(e) => update('confirmPassword', e.target.value)}
          placeholder="••••••••"
        />

        {/* Password mismatch warning */}
        {settings.newPassword && settings.confirmPassword && settings.newPassword !== settings.confirmPassword && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> รหัสผ่านไม่ตรงกัน
          </p>
        )}
      </div>

      <div className="border-t border-neutral-800 pt-6">
        <SectionTitle>
          <Smartphone className="w-4 h-4 text-lime-400" /> การยืนยันตัวตนแบบสองขั้นตอน (2FA)
        </SectionTitle>
        <GlassCard className="p-5">
          <Toggle
            label="เปิดใช้งาน 2FA"
            description="เพิ่มความปลอดภัยด้วยรหัส OTP ทุกครั้งที่เข้าสู่ระบบ"
            enabled={settings.twoFactorEnabled}
            onChange={(v) => update('twoFactorEnabled', v)}
          />
        </GlassCard>
      </div>
    </div>
  );

  const renderPaymentTab = () => (
    <div className="space-y-6">
      <SectionTitle>
        <Building2 className="w-4 h-4 text-lime-400" /> บัญชีธนาคารที่เชื่อมต่อ
      </SectionTitle>

      <GlassCard className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-lime-500/10 flex items-center justify-center ring-1 ring-lime-500/20">
            <CardIcon className="w-6 h-6 text-lime-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-200">{settings.bankName}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{settings.accountNumber}</p>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-lime-500/15 text-lime-400 ring-1 ring-lime-500/20">
            เชื่อมต่อแล้ว
          </span>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="ธนาคาร"
          icon={Building2}
          value={settings.bankName}
          onChange={(v) => update('bankName', v)}
          options={[
            { value: 'ธนาคารกสิกรไทย', label: '🟢 ธนาคารกสิกรไทย (KBank)' },
            { value: 'ธนาคารไทยพาณิชย์', label: '🟣 ธนาคารไทยพาณิชย์ (SCB)' },
            { value: 'ธนาคารกรุงเทพ', label: '🔵 ธนาคารกรุงเทพ (BBL)' },
            { value: 'ธนาคารกรุงไทย', label: '🟡 ธนาคารกรุงไทย (KTB)' },
          ]}
        />
        <Input label="เลขที่บัญชี" icon={CreditCard} value={settings.accountNumber} onChange={(e) => update('accountNumber', e.target.value)} placeholder="xxx-x-xxxxx-x" />
      </div>

      <div className="border-t border-neutral-800 pt-6">
        <SectionTitle>
          <Zap className="w-4 h-4 text-lime-400" /> ตัวเลือกการชำระเงิน
        </SectionTitle>
        <GlassCard className="p-5">
          <Toggle
            label="เก็บเงินปลายทาง (COD)"
            description="รับชำระเงินปลายทางผ่านพาร์ทเนอร์จัดส่ง"
            enabled={settings.codEnabled}
            onChange={(v) => update('codEnabled', v)}
          />
        </GlassCard>
      </div>
    </div>
  );

  const renderThemeTab = () => {
    const themeOptions: { id: SettingsState['theme']; label: string; desc: string; icon: React.ElementType }[] = [
      { id: 'dark',   label: 'โหมดมืด',    desc: 'ธีมสีเข้ม ถนอมสายตา',           icon: Moon },
      { id: 'light',  label: 'โหมดสว่าง',   desc: 'ธีมสีอ่อน สว่างชัดเจน',          icon: Sun },
      { id: 'system', label: 'ตามระบบ',     desc: 'ใช้ธีมตามการตั้งค่าอุปกรณ์',       icon: Monitor },
    ];

    return (
      <div className="space-y-6">
        <SectionTitle>
          <Palette className="w-4 h-4 text-lime-400" /> เลือกธีมแอปพลิเคชัน
        </SectionTitle>

        <div className="grid gap-3 sm:grid-cols-3">
          {themeOptions.map((opt) => {
            const isActive = settings.theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => update('theme', opt.id)}
                className={`
                  relative p-5 rounded-2xl text-left transition-all duration-200
                  border-2
                  ${isActive
                    ? 'border-lime-500 bg-lime-500/10 shadow-[0_0_20px_-6px_rgba(132,204,22,0.3)]'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-800/50'
                  }
                `}
              >
                {/* Radio dot */}
                <div className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-lime-500' : 'border-neutral-600'}`}>
                  {isActive && <div className="w-2 h-2 rounded-full bg-lime-500" />}
                </div>

                <opt.icon className={`w-7 h-7 mb-3 ${isActive ? 'text-lime-400' : 'text-neutral-500'}`} />
                <p className={`text-sm font-semibold ${isActive ? 'text-lime-400' : 'text-neutral-300'}`}>{opt.label}</p>
                <p className="text-xs text-neutral-500 mt-1">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLanguageTab = () => (
    <div className="space-y-6">
      <SectionTitle>
        <Languages className="w-4 h-4 text-lime-400" /> ภาษาของระบบ
      </SectionTitle>

      <Select
        label="ภาษา"
        icon={Globe}
        value={settings.language}
        onChange={(v) => update('language', v as 'th' | 'en')}
        options={[
          { value: 'th', label: '🇹🇭 ภาษาไทย' },
          { value: 'en', label: '🇬🇧 English' },
        ]}
      />

      <Select
        label="เขตเวลา"
        icon={Clock}
        value={settings.timezone}
        onChange={(v) => update('timezone', v)}
        options={[
          { value: 'Asia/Bangkok', label: '(UTC+07:00) กรุงเทพ, ฮานอย, จาการ์ตา' },
          { value: 'Asia/Tokyo',   label: '(UTC+09:00) โตเกียว, โซล' },
          { value: 'Asia/Singapore', label: '(UTC+08:00) สิงคโปร์, กัวลาลัมเปอร์' },
          { value: 'UTC',          label: '(UTC+00:00) เวลาสากล (UTC)' },
        ]}
      />
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <SectionTitle>
        <Settings2 className="w-4 h-4 text-lime-400" /> ตัวเลือกขั้นสูง
      </SectionTitle>

      <GlassCard className="p-5">
        <Toggle
          label="ล้าง Flash Sale ที่หมดอายุอัตโนมัติ"
          description="ลบรายการ Flash Sale ที่หมดอายุแล้วออกจากระบบโดยอัตโนมัติ"
          enabled={settings.autoCleanExpired}
          onChange={(v) => update('autoCleanExpired', v)}
        />
      </GlassCard>

      {/* Danger Zone */}
      <div className="border-t border-neutral-800 pt-6">
        <SectionTitle>
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-red-400">โซนอันตราย</span>
        </SectionTitle>

        <div className="space-y-3">
          {/* Clear Cache */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border-2 border-dashed border-yellow-500/30 bg-yellow-500/5">
            <div>
              <p className="text-sm font-medium text-yellow-300">ล้างแคชข้อมูล</p>
              <p className="text-xs text-neutral-500 mt-0.5">ล้างข้อมูลแคชในระบบเพื่อแก้ปัญหาข้อมูลค้าง</p>
            </div>
            <button
              type="button"
              onClick={() => setDangerModal('clearCache')}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/30 hover:bg-yellow-500/25 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> ล้างแคช
            </button>
          </div>

          {/* Deactivate store */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border-2 border-dashed border-red-500/30 bg-red-500/5">
            <div>
              <p className="text-sm font-medium text-red-400">ปิดการใช้งานร้านค้า</p>
              <p className="text-xs text-neutral-500 mt-0.5">ร้านค้าจะไม่แสดงต่อสาธารณะจนกว่าจะเปิดอีกครั้ง</p>
            </div>
            <button
              type="button"
              onClick={() => setDangerModal('deactivate')}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/15 text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/25 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 inline mr-1" /> ปิดร้านค้า
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Tab-to-renderer mapping ───────────────────────────────────────────────
  const tabContent: Record<string, () => React.ReactNode> = {
    profile:       renderProfileTab,
    notifications: renderNotificationsTab,
    security:      renderSecurityTab,
    payment:       renderPaymentTab,
    theme:         renderThemeTab,
    language:      renderLanguageTab,
    advanced:      renderAdvancedTab,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <section className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* ─── Top bar with save button ──────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-lime-400" />
              ตั้งค่าร้านค้า
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5 hidden sm:block">{currentTab.description}</p>
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
              transition-all duration-200
              ${saveSuccess
                ? 'bg-lime-500/20 text-lime-400 ring-1 ring-lime-500/30'
                : 'bg-lime-500 text-neutral-950 hover:bg-lime-400 shadow-[0_0_24px_-4px_rgba(132,204,22,0.4)] hover:shadow-[0_0_32px_-4px_rgba(132,204,22,0.6)]'
              }
              disabled:opacity-60
            `}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'กำลังบันทึก...' : saveSuccess ? 'บันทึกแล้ว!' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
        </div>
      </div>

      {/* ─── Mobile tabs (horizontal scroll) ──────────────────────────── */}
      <div className="lg:hidden border-b border-neutral-800/60 bg-neutral-950/50 backdrop-blur-sm sticky top-[65px] z-20">
        <div className="flex overflow-x-auto scrollbar-hide px-4 gap-1 py-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${isActive
                    ? 'bg-lime-500/15 text-lime-400 ring-1 ring-lime-500/30'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Main layout: sidebar + content ───────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="sticky top-28 space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                      transition-all duration-200 text-left
                      ${isActive
                        ? 'bg-lime-500/10 text-lime-400 ring-1 ring-lime-500/20 shadow-[0_0_16px_-6px_rgba(132,204,22,0.2)]'
                        : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/40'
                      }
                    `}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-lime-400' : ''}`} />
                    {tab.label}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-lime-500/50" />}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content area */}
          <main className="flex-1 min-w-0">
            <GlassCard className="p-6 sm:p-8">
              {tabContent[activeTab]?.()}
            </GlassCard>
          </main>
        </div>
      </div>

      {/* ═══ Danger Confirmation Modal ═══════════════════════════════════ */}
      {dangerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDangerModal(null)} />

          {/* Modal */}
          <div className="relative w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6">
            <button type="button" onClick={() => setDangerModal(null)} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-300">
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${dangerModal === 'deactivate' ? 'bg-red-500/15' : 'bg-yellow-500/15'}`}>
                <AlertTriangle className={`w-7 h-7 ${dangerModal === 'deactivate' ? 'text-red-400' : 'text-yellow-400'}`} />
              </div>

              <h3 className="text-lg font-bold text-neutral-100 mb-2">
                {dangerModal === 'deactivate' ? 'ปิดการใช้งานร้านค้า?' : 'ล้างแคชข้อมูล?'}
              </h3>
              <p className="text-sm text-neutral-500 mb-6">
                {dangerModal === 'deactivate'
                  ? 'ร้านค้าของคุณจะไม่แสดงต่อผู้ใช้จนกว่าจะเปิดใช้งานอีกครั้ง การดำเนินการนี้สามารถย้อนกลับได้'
                  : 'ข้อมูลแคชทั้งหมดจะถูกล้าง อาจทำให้ระบบโหลดช้าลงชั่วคราว'
                }
              </p>

              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setDangerModal(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleDangerAction}
                  className={`
                    flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors
                    ${dangerModal === 'deactivate'
                      ? 'bg-red-500 text-white hover:bg-red-400'
                      : 'bg-yellow-500 text-neutral-950 hover:bg-yellow-400'
                    }
                  `}
                >
                  {dangerModal === 'deactivate' ? 'ยืนยัน ปิดร้านค้า' : 'ยืนยัน ล้างแคช'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
