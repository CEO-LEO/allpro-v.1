'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Store, Bell, ShieldCheck, CreditCard, Palette, Globe, Settings2,
  Save, Loader2, CheckCircle, Upload, Camera, AlertTriangle, Trash2,
  X, ChevronRight, Lock, Eye, EyeOff, Smartphone, Mail,
  Zap, Clock, CreditCard as CardIcon, Building2, Languages,
  Sun, Moon, Monitor, RotateCcw,
  ChevronDown, ChevronUp, Network, Truck, Award, Wallet, PackageCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

// ═════════════════════════════════════════════════════════════════════════════
//  TYPES
// ═════════════════════════════════════════════════════════════════════════════

interface TabDef {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

interface SettingsState {
  storeName: string;
  branchCode: string;
  managerEmail: string;
  storeLogo: string | null;
  pushNotifications: boolean;
  emailNotifications: boolean;
  flashSaleAlerts: boolean;
  newOrderAlerts: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  bankName: string;
  accountNumber: string;
  codEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
  language: 'th' | 'en';
  timezone: string;
  autoCleanExpired: boolean;
  // CP ALL Ecosystem
  sevenDelivery: boolean;
  allMember: boolean;
  trueMoneyWallet: boolean;
  smeShelfSync: boolean;
}

// ═════════════════════════════════════════════════════════════════════════════
//  TAB DEFINITIONS
// ═════════════════════════════════════════════════════════════════════════════

const TABS: TabDef[] = [
  { id: 'profile',       label: 'ข้อมูลร้านค้า',   icon: Store,       description: 'จัดการข้อมูลร้านค้าและโปรไฟล์' },
  { id: 'notifications', label: 'การแจ้งเตือน',    icon: Bell,        description: 'ตั้งค่าการแจ้งเตือนต่างๆ' },
  { id: 'security',      label: 'ความปลอดภัย',     icon: ShieldCheck, description: 'รหัสผ่านและการยืนยันตัวตน' },
  { id: 'payment',       label: 'การชำระเงิน',     icon: CreditCard,  description: 'วิธีการรับชำระเงิน' },
  { id: 'theme',         label: 'ธีมและรูปแบบ',    icon: Palette,     description: 'ปรับแต่งหน้าตาแอปพลิเคชัน' },
  { id: 'language',      label: 'ภาษาและภูมิภาค',  icon: Globe,       description: 'ภาษาและเขตเวลา' },
  { id: 'ecosystem',     label: 'CP ALL Ecosystem', icon: Network,     description: 'เชื่อมต่อบริการจาก CP ALL Ecosystem' },
  { id: 'advanced',      label: 'ตั้งค่าขั้นสูง',   icon: Settings2,   description: 'การตั้งค่าขั้นสูงและโซนอันตราย' },
];

// ═════════════════════════════════════════════════════════════════════════════
//  REUSABLE UI PRIMITIVES
// ═════════════════════════════════════════════════════════════════════════════

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/50 ${className}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-500/20 to-transparent" />
      {children}
    </div>
  );
}

function Toggle({ enabled, onChange, label, description }: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className="w-full flex items-center justify-between gap-4 py-4 px-1 text-left cursor-pointer group"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm sm:text-base font-medium text-neutral-200 group-hover:text-neutral-100 transition-colors">
          {label}
        </p>
        {description && (
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      <div
        className={`
          relative flex-shrink-0 h-7 w-12 rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none
          ${enabled ? 'bg-lime-500 shadow-[0_0_12px_-2px_rgba(132,204,22,0.5)]' : 'bg-neutral-700'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5.5 w-5.5 rounded-full bg-white shadow-lg
            absolute top-[3px]
            transform transition-transform duration-200 ease-in-out
            ${enabled ? 'translate-x-[22px]' : 'translate-x-[3px]'}
          `}
          style={{ width: 22, height: 22 }}
        />
      </div>
    </button>
  );
}

function Input({ label, icon: Icon, ...props }: {
  label: string;
  icon?: React.ElementType;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-400 tracking-wide">
        {Icon && <Icon className="w-3.5 h-3.5 text-neutral-500" />} {label}
      </label>
      <input
        {...props}
        className={`
          w-full px-4 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base
          bg-neutral-800/70 border border-neutral-700/80
          text-neutral-100 placeholder:text-neutral-600
          focus:outline-none focus:ring-2 focus:ring-lime-500/40 focus:border-lime-500/40
          transition-all duration-200
          ${props.className || ''}
        `}
      />
    </div>
  );
}

function Select({ label, icon: Icon, options, value, onChange }: {
  label: string;
  icon?: React.ElementType;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-400 tracking-wide">
        {Icon && <Icon className="w-3.5 h-3.5 text-neutral-500" />} {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-4 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base appearance-none
          bg-neutral-800/70 border border-neutral-700/80
          text-neutral-100
          focus:outline-none focus:ring-2 focus:ring-lime-500/40 focus:border-lime-500/40
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base sm:text-lg font-semibold text-neutral-100 mb-5 flex items-center gap-2.5">
      {children}
    </h3>
  );
}

function Divider() {
  return <div className="border-t border-neutral-800/50 my-8" />;
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function MerchantSettingsDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dangerModal, setDangerModal] = useState<null | 'deactivate' | 'clearCache'>(null);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [settings, setSettings] = useState<SettingsState>({
    storeName: user?.shopName || 'Siam Store',
    branchCode: 'BRN-001',
    managerEmail: user?.email || 'manager@store.com',
    storeLogo: user?.shopLogo || null,
    pushNotifications: true,
    emailNotifications: true,
    flashSaleAlerts: true,
    newOrderAlerts: true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    bankName: 'ธนาคารกสิกรไทย',
    accountNumber: '•••• •••• 4829',
    codEnabled: false,
    theme: 'dark',
    language: 'th',
    timezone: 'Asia/Bangkok',
    autoCleanExpired: true,
    // CP ALL Ecosystem
    sevenDelivery: false,
    allMember: true,
    trueMoneyWallet: false,
    smeShelfSync: false,
  });

  const [isEcosystemExpanded, setIsEcosystemExpanded] = useState(true);

  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    update('storeLogo', url);
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  }, []);

  const handleDangerAction = useCallback(() => {
    setDangerModal(null);
    handleSave();
  }, [handleSave]);

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  // ═══════════════════════════════════════════════════════════════════════
  //  TAB CONTENT RENDERERS
  // ═══════════════════════════════════════════════════════════════════════

  const renderProfileTab = () => (
    <div className="space-y-8">
      <SectionTitle>
        <Store className="w-5 h-5 text-lime-400" /> ข้อมูลร้านค้า
      </SectionTitle>

      {/* Logo upload */}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="relative group flex-shrink-0"
          >
            <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-neutral-700 group-hover:ring-lime-500/50 transition-all duration-200 bg-neutral-800 flex items-center justify-center">
              {settings.storeLogo || logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview || settings.storeLogo || ''} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-neutral-600" />
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-lime-400" />
              </div>
            </div>
          </button>
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          <div className="text-center sm:text-left">
            <p className="text-sm sm:text-base font-medium text-neutral-200">โลโก้ร้านค้า</p>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">คลิกเพื่ออัปโหลดรูปภาพใหม่ (PNG, JPG)</p>
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="mt-3 text-sm text-lime-400 hover:text-lime-300 font-medium inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-lime-500/10 hover:bg-lime-500/20 transition-colors"
            >
              <Upload className="w-4 h-4" /> อัปโหลดโลโก้
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Form fields */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="ชื่อร้านค้า" icon={Store} value={settings.storeName} onChange={(e) => update('storeName', e.target.value)} placeholder="ชื่อร้านค้าของคุณ" />
        <Input label="รหัสสาขา" icon={Building2} value={settings.branchCode} onChange={(e) => update('branchCode', e.target.value)} placeholder="เช่น BRN-001" />
      </div>
      <Input label="อีเมลผู้จัดการ" icon={Mail} type="email" value={settings.managerEmail} onChange={(e) => update('managerEmail', e.target.value)} placeholder="manager@store.com" />
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-8">
      <SectionTitle>
        <Bell className="w-5 h-5 text-lime-400" /> ตั้งค่าการแจ้งเตือน
      </SectionTitle>

      <GlassCard className="p-5 sm:p-6 divide-y divide-neutral-800/50">
        <Toggle label="Push Notifications" description="รับการแจ้งเตือนบนอุปกรณ์ของคุณ" enabled={settings.pushNotifications} onChange={(v) => update('pushNotifications', v)} />
        <Toggle label="แจ้งเตือนผ่านอีเมล" description="รับข้อมูลอัปเดตผ่านอีเมล" enabled={settings.emailNotifications} onChange={(v) => update('emailNotifications', v)} />
        <Toggle label="แจ้งเตือน Flash Sale อัตโนมัติ" description="รับการแจ้งเตือนเมื่อ Flash Sale เริ่มต้น" enabled={settings.flashSaleAlerts} onChange={(v) => update('flashSaleAlerts', v)} />
        <Toggle label="แจ้งเตือนออเดอร์ใหม่" description="รับแจ้งเมื่อมีคำสั่งซื้อเข้ามาใหม่" enabled={settings.newOrderAlerts} onChange={(v) => update('newOrderAlerts', v)} />
      </GlassCard>

      <div className="flex items-center gap-2.5 text-sm text-neutral-500 px-1">
        <Bell className="w-4 h-4" />
        <span>
          เปิดอยู่ {[settings.pushNotifications, settings.emailNotifications, settings.flashSaleAlerts, settings.newOrderAlerts].filter(Boolean).length} จาก 4 ช่องทาง
        </span>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-8">
      <SectionTitle>
        <Lock className="w-5 h-5 text-lime-400" /> เปลี่ยนรหัสผ่าน
      </SectionTitle>

      <div className="space-y-5">
        <div className="relative">
          <Input label="รหัสผ่านปัจจุบัน" icon={Lock} type={showCurrentPw ? 'text' : 'password'} value={settings.currentPassword} onChange={(e) => update('currentPassword', e.target.value)} placeholder="••••••••" />
          <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 bottom-3 sm:bottom-3.5 p-1 text-neutral-500 hover:text-neutral-300 transition-colors">
            {showCurrentPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="relative">
            <Input label="รหัสผ่านใหม่" icon={ShieldCheck} type={showNewPw ? 'text' : 'password'} value={settings.newPassword} onChange={(e) => update('newPassword', e.target.value)} placeholder="••••••••" />
            <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 bottom-3 sm:bottom-3.5 p-1 text-neutral-500 hover:text-neutral-300 transition-colors">
              {showNewPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <Input label="ยืนยันรหัสผ่านใหม่" icon={ShieldCheck} type="password" value={settings.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="••••••••" />
        </div>

        {settings.newPassword && settings.confirmPassword && settings.newPassword !== settings.confirmPassword && (
          <p className="text-sm text-red-400 flex items-center gap-1.5 px-1">
            <AlertTriangle className="w-4 h-4" /> รหัสผ่านไม่ตรงกัน
          </p>
        )}
      </div>

      <Divider />

      <SectionTitle>
        <Smartphone className="w-5 h-5 text-lime-400" /> การยืนยันตัวตนแบบสองขั้นตอน (2FA)
      </SectionTitle>
      <GlassCard className="p-5 sm:p-6">
        <Toggle label="เปิดใช้งาน 2FA" description="เพิ่มความปลอดภัยด้วยรหัส OTP ทุกครั้งที่เข้าสู่ระบบ" enabled={settings.twoFactorEnabled} onChange={(v) => update('twoFactorEnabled', v)} />
      </GlassCard>
    </div>
  );

  const renderPaymentTab = () => (
    <div className="space-y-8">
      <SectionTitle>
        <Building2 className="w-5 h-5 text-lime-400" /> บัญชีธนาคารที่เชื่อมต่อ
      </SectionTitle>

      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-lime-500/10 flex items-center justify-center ring-1 ring-lime-500/20 flex-shrink-0">
            <CardIcon className="w-7 h-7 text-lime-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-medium text-neutral-200">{settings.bankName}</p>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">{settings.accountNumber}</p>
          </div>
          <span className="text-[10px] sm:text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-lime-500/15 text-lime-400 ring-1 ring-lime-500/20 flex-shrink-0">
            เชื่อมต่อแล้ว
          </span>
        </div>
      </GlassCard>

      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="ธนาคาร" icon={Building2} value={settings.bankName} onChange={(v) => update('bankName', v)} options={[
          { value: 'ธนาคารกสิกรไทย', label: '🟢 ธนาคารกสิกรไทย (KBank)' },
          { value: 'ธนาคารไทยพาณิชย์', label: '🟣 ธนาคารไทยพาณิชย์ (SCB)' },
          { value: 'ธนาคารกรุงเทพ', label: '🔵 ธนาคารกรุงเทพ (BBL)' },
          { value: 'ธนาคารกรุงไทย', label: '🟡 ธนาคารกรุงไทย (KTB)' },
        ]} />
        <Input label="เลขที่บัญชี" icon={CreditCard} value={settings.accountNumber} onChange={(e) => update('accountNumber', e.target.value)} placeholder="xxx-x-xxxxx-x" />
      </div>

      <Divider />

      <SectionTitle>
        <Zap className="w-5 h-5 text-lime-400" /> ตัวเลือกการชำระเงิน
      </SectionTitle>
      <GlassCard className="p-5 sm:p-6">
        <Toggle label="เก็บเงินปลายทาง (COD)" description="รับชำระเงินปลายทางผ่านพาร์ทเนอร์จัดส่ง" enabled={settings.codEnabled} onChange={(v) => update('codEnabled', v)} />
      </GlassCard>
    </div>
  );

  const renderThemeTab = () => {
    const themeOptions: { id: SettingsState['theme']; label: string; desc: string; icon: React.ElementType }[] = [
      { id: 'dark',   label: 'โหมดมืด',   desc: 'ธีมสีเข้ม ถนอมสายตา',      icon: Moon },
      { id: 'light',  label: 'โหมดสว่าง',  desc: 'ธีมสีอ่อน สว่างชัดเจน',     icon: Sun },
      { id: 'system', label: 'ตามระบบ',    desc: 'ใช้ธีมตามการตั้งค่าอุปกรณ์', icon: Monitor },
    ];

    return (
      <div className="space-y-8">
        <SectionTitle>
          <Palette className="w-5 h-5 text-lime-400" /> เลือกธีมแอปพลิเคชัน
        </SectionTitle>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {themeOptions.map((opt) => {
            const isActive = settings.theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => update('theme', opt.id)}
                className={`
                  relative p-5 sm:p-6 rounded-2xl text-left transition-all duration-200 border-2
                  ${isActive
                    ? 'border-lime-500 bg-lime-500/10 shadow-[0_0_24px_-6px_rgba(132,204,22,0.3)]'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-800/50'
                  }
                `}
              >
                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-lime-500' : 'border-neutral-600'}`}>
                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-lime-500" />}
                </div>
                <opt.icon className={`w-8 h-8 mb-3 ${isActive ? 'text-lime-400' : 'text-neutral-500'}`} />
                <p className={`text-sm sm:text-base font-semibold ${isActive ? 'text-lime-400' : 'text-neutral-300'}`}>{opt.label}</p>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 leading-relaxed">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLanguageTab = () => (
    <div className="space-y-8">
      <SectionTitle>
        <Languages className="w-5 h-5 text-lime-400" /> ภาษาของระบบ
      </SectionTitle>

      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="ภาษา" icon={Globe} value={settings.language} onChange={(v) => update('language', v as 'th' | 'en')} options={[
          { value: 'th', label: '🇹🇭 ภาษาไทย' },
          { value: 'en', label: '🇬🇧 English' },
        ]} />
        <Select label="เขตเวลา" icon={Clock} value={settings.timezone} onChange={(v) => update('timezone', v)} options={[
          { value: 'Asia/Bangkok',   label: '(UTC+07:00) กรุงเทพ, ฮานอย, จาการ์ตา' },
          { value: 'Asia/Tokyo',     label: '(UTC+09:00) โตเกียว, โซล' },
          { value: 'Asia/Singapore', label: '(UTC+08:00) สิงคโปร์, กัวลาลัมเปอร์' },
          { value: 'UTC',            label: '(UTC+00:00) เวลาสากล (UTC)' },
        ]} />
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-8">
      <SectionTitle>
        <Settings2 className="w-5 h-5 text-lime-400" /> ตัวเลือกขั้นสูง
      </SectionTitle>

      <GlassCard className="p-5 sm:p-6">
        <Toggle label="ล้าง Flash Sale ที่หมดอายุอัตโนมัติ" description="ลบรายการ Flash Sale ที่หมดอายุแล้วออกจากระบบโดยอัตโนมัติ" enabled={settings.autoCleanExpired} onChange={(v) => update('autoCleanExpired', v)} />
      </GlassCard>

      <Divider />

      <SectionTitle>
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <span className="text-red-400">โซนอันตราย</span>
      </SectionTitle>

      <div className="space-y-4">
        {/* Clear Cache */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border-2 border-dashed border-yellow-500/30 bg-yellow-500/5">
          <div>
            <p className="text-sm sm:text-base font-medium text-yellow-300">ล้างแคชข้อมูล</p>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed">ล้างข้อมูลแคชในระบบเพื่อแก้ปัญหาข้อมูลค้าง</p>
          </div>
          <button
            type="button"
            onClick={() => setDangerModal('clearCache')}
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/30 hover:bg-yellow-500/25 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> ล้างแคช
          </button>
        </div>

        {/* Deactivate store */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border-2 border-dashed border-red-500/30 bg-red-500/5">
          <div>
            <p className="text-sm sm:text-base font-medium text-red-400">ปิดการใช้งานร้านค้า</p>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed">ร้านค้าจะไม่แสดงต่อสาธารณะจนกว่าจะเปิดอีกครั้ง</p>
          </div>
          <button
            type="button"
            onClick={() => setDangerModal('deactivate')}
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-red-500/15 text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/25 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> ปิดร้านค้า
          </button>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  //  CP ALL ECOSYSTEM — Collapsible Accordion
  // ═══════════════════════════════════════════════════════════════════════

  const ECOSYSTEM_SERVICES: {
    key: keyof Pick<SettingsState, 'sevenDelivery' | 'allMember' | 'trueMoneyWallet' | 'smeShelfSync'>;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    glowColor: string;
  }[] = [
    {
      key: 'sevenDelivery',
      label: '7-Delivery',
      description: 'เปิดรับออเดอร์ผ่านระบบจัดส่งของ 7-Eleven ส่งตรงถึงหน้าบ้านลูกค้า',
      icon: Truck,
      color: 'text-orange-400',
      glowColor: 'bg-orange-500/15 ring-orange-500/20',
    },
    {
      key: 'allMember',
      label: 'All Member',
      description: 'อนุญาตให้ลูกค้าสะสมและใช้แต้ม All Member ที่ร้านนี้ได้',
      icon: Award,
      color: 'text-yellow-400',
      glowColor: 'bg-yellow-500/15 ring-yellow-500/20',
    },
    {
      key: 'trueMoneyWallet',
      label: 'TrueMoney Wallet',
      description: 'เปิดรับการชำระเงินอัตโนมัติผ่านแอป TrueMoney Wallet',
      icon: Wallet,
      color: 'text-orange-500',
      glowColor: 'bg-orange-500/15 ring-orange-500/20',
    },
    {
      key: 'smeShelfSync',
      label: 'SME Shelf Sync',
      description: 'ซิงค์ข้อมูลสต็อกสินค้ากับเชลฟ์ของเซเว่นสาขาใกล้เคียงแบบเรียลไทม์',
      icon: PackageCheck,
      color: 'text-lime-400',
      glowColor: 'bg-lime-500/15 ring-lime-500/20',
    },
  ];

  const renderEcosystemTab = () => {
    const enabledCount = [settings.sevenDelivery, settings.allMember, settings.trueMoneyWallet, settings.smeShelfSync].filter(Boolean).length;

    return (
      <div className="space-y-8">
        <SectionTitle>
          <Network className="w-5 h-5 text-lime-400" /> การเชื่อมต่อ CP ALL Ecosystem
        </SectionTitle>

        {/* Collapsible Accordion Card */}
        <div
          className={`
            rounded-2xl border-2 transition-all duration-300 overflow-hidden
            ${isEcosystemExpanded
              ? 'border-lime-500/50 bg-neutral-900/80 shadow-[0_0_32px_-8px_rgba(132,204,22,0.15)]'
              : 'border-neutral-800/50 bg-neutral-900/60 hover:border-neutral-700'
            }
          `}
        >
          {/* Accordion Header */}
          <button
            type="button"
            onClick={() => setIsEcosystemExpanded(!isEcosystemExpanded)}
            className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                transition-all duration-300
                ${isEcosystemExpanded
                  ? 'bg-lime-500/15 ring-1 ring-lime-500/30 shadow-[0_0_16px_-4px_rgba(132,204,22,0.3)]'
                  : 'bg-neutral-800 ring-1 ring-neutral-700'
                }
              `}>
                <Network className={`w-6 h-6 transition-colors duration-300 ${isEcosystemExpanded ? 'text-lime-400' : 'text-neutral-500'}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm sm:text-base font-semibold transition-colors duration-300 ${isEcosystemExpanded ? 'text-lime-400' : 'text-neutral-200'}`}>
                  CP ALL Ecosystem Services
                </p>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  เปิดใช้งาน {enabledCount} จาก {ECOSYSTEM_SERVICES.length} บริการ
                </p>
              </div>
            </div>

            <div className={`
              flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
              transition-all duration-300
              ${isEcosystemExpanded
                ? 'bg-lime-500/10 text-lime-400'
                : 'bg-neutral-800 text-neutral-500 group-hover:text-neutral-300'
              }
            `}>
              {isEcosystemExpanded
                ? <ChevronUp className="w-5 h-5" />
                : <ChevronDown className="w-5 h-5" />
              }
            </div>
          </button>

          {/* Accordion Body — CSS transition */}
          <div
            className={`
              transition-all duration-300 ease-in-out overflow-hidden
              ${isEcosystemExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-3">
              {/* Subtle separator */}
              <div className="border-t border-neutral-800/60 mb-4" />

              {ECOSYSTEM_SERVICES.map((svc) => (
                <div
                  key={svc.key}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl transition-all duration-200
                    ${settings[svc.key]
                      ? 'bg-neutral-800/50 ring-1 ring-neutral-700/50'
                      : 'bg-neutral-800/20 hover:bg-neutral-800/30'
                    }
                  `}
                >
                  {/* Service Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ${svc.glowColor}`}>
                    <svc.icon className={`w-5 h-5 ${svc.color}`} />
                  </div>

                  {/* Label & Description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-neutral-200">{svc.label}</p>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 leading-relaxed">{svc.description}</p>
                  </div>

                  {/* Toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings[svc.key]}
                    onClick={() => update(svc.key, !settings[svc.key])}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    <div
                      className={`
                        relative h-7 w-12 rounded-full transition-colors duration-200 ease-in-out
                        ${settings[svc.key] ? 'bg-lime-500 shadow-[0_0_12px_-2px_rgba(132,204,22,0.5)]' : 'bg-neutral-700'}
                      `}
                    >
                      <span
                        className={`
                          pointer-events-none inline-block rounded-full bg-white shadow-lg
                          absolute top-[3px] transition-transform duration-200 ease-in-out
                          ${settings[svc.key] ? 'translate-x-[22px]' : 'translate-x-[3px]'}
                        `}
                        style={{ width: 22, height: 22 }}
                      />
                    </div>
                  </button>
                </div>
              ))}

              {/* Status summary */}
              <div className="mt-4 flex items-center gap-2.5 text-sm text-neutral-500 px-1 pt-2">
                <Network className="w-4 h-4" />
                <span>
                  {enabledCount === 0
                    ? 'ยังไม่ได้เปิดใช้งานบริการใดๆ'
                    : enabledCount === ECOSYSTEM_SERVICES.length
                      ? 'เปิดใช้งานครบทุกบริการแล้ว!'
                      : `กำลังใช้งาน ${enabledCount} บริการจาก CP ALL Ecosystem`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabContent: Record<string, () => React.ReactNode> = {
    profile: renderProfileTab, notifications: renderNotificationsTab,
    security: renderSecurityTab, payment: renderPaymentTab,
    theme: renderThemeTab, language: renderLanguageTab,
    ecosystem: renderEcosystemTab, advanced: renderAdvancedTab,
  };

  // ═══════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <section className="min-h-screen bg-neutral-950 text-neutral-100 pb-24 lg:pb-8">
      {/* ─── Sticky Header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight flex items-center gap-2.5 truncate">
                <Settings2 className="w-5 h-5 sm:w-6 sm:h-6 text-lime-400 flex-shrink-0" />
                ตั้งค่าร้านค้า
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 hidden sm:block">{currentTab.description}</p>
            </div>

            {/* Desktop save button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`
                hidden lg:flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold
                transition-all duration-200
                ${saveSuccess
                  ? 'bg-lime-500/20 text-lime-400 ring-1 ring-lime-500/30'
                  : 'bg-lime-500 text-neutral-950 hover:bg-lime-400 shadow-[0_0_24px_-4px_rgba(132,204,22,0.4)] hover:shadow-[0_0_32px_-4px_rgba(132,204,22,0.6)]'
                }
                disabled:opacity-60
              `}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'กำลังบันทึก...' : saveSuccess ? 'บันทึกแล้ว!' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile / Tablet: Swipeable horizontal tabs ─────────────── */}
      <div className="lg:hidden sticky top-[57px] sm:top-[65px] z-20 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/40">
        <div className="flex overflow-x-auto scrollbar-hide px-3 sm:px-4 gap-1.5 py-2.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isAct = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 whitespace-nowrap min-h-[44px]
                  ${isAct
                    ? 'bg-lime-500/15 text-lime-400 ring-1 ring-lime-500/30 shadow-[0_0_12px_-4px_rgba(132,204,22,0.25)]'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50 active:bg-neutral-800/70'
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

      {/* ─── Main layout ────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-60 xl:w-64 flex-shrink-0">
            <nav className="sticky top-[100px] space-y-1.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isAct = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium
                      transition-all duration-200 text-left
                      ${isAct
                        ? 'bg-lime-500/10 text-lime-400 ring-1 ring-lime-500/20 shadow-[0_0_16px_-6px_rgba(132,204,22,0.2)]'
                        : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/40'
                      }
                    `}
                  >
                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isAct ? 'text-lime-400' : ''}`} />
                    <span className="truncate">{tab.label}</span>
                    {isAct && <ChevronRight className="w-4 h-4 ml-auto text-lime-500/50 flex-shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content area */}
          <main className="flex-1 min-w-0">
            {/* Tab title on mobile */}
            <div className="mb-6 lg:hidden">
              <p className="text-xs text-neutral-500">{currentTab.description}</p>
            </div>

            <GlassCard className="p-5 sm:p-7 lg:p-8">
              {tabContent[activeTab]?.()}
            </GlassCard>
          </main>
        </div>
      </div>

      {/* ─── Mobile / Tablet: Sticky Bottom Save Bar ────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-neutral-900/80 backdrop-blur-md border-t border-neutral-800/50">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`
              w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-base font-bold
              transition-all duration-200 min-h-[48px]
              ${saveSuccess
                ? 'bg-lime-500/20 text-lime-400 ring-1 ring-lime-500/30'
                : 'bg-lime-500 text-neutral-950 hover:bg-lime-400 active:bg-lime-600 shadow-[0_0_32px_-4px_rgba(132,204,22,0.5)]'
              }
              disabled:opacity-60
            `}
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : saveSuccess ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {isSaving ? 'กำลังบันทึก...' : saveSuccess ? 'บันทึกสำเร็จ!' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
        </div>
      </div>

      {/* ─── Danger Confirmation Modal ───────────────────────────────── */}
      {dangerModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDangerModal(null)} />

          <div className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 sm:p-7">
            <button type="button" onClick={() => setDangerModal(null)} className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-300 transition-colors">
              <X className="w-5 h-5" />
            </button>

            {/* Drag handle on mobile */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-neutral-700 mx-auto mb-5" />

            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${dangerModal === 'deactivate' ? 'bg-red-500/15' : 'bg-yellow-500/15'}`}>
                <AlertTriangle className={`w-8 h-8 ${dangerModal === 'deactivate' ? 'text-red-400' : 'text-yellow-400'}`} />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-neutral-100 mb-3">
                {dangerModal === 'deactivate' ? 'ปิดการใช้งานร้านค้า?' : 'ล้างแคชข้อมูล?'}
              </h3>
              <p className="text-sm sm:text-base text-neutral-500 mb-7 leading-relaxed max-w-xs">
                {dangerModal === 'deactivate'
                  ? 'ร้านค้าของคุณจะไม่แสดงต่อผู้ใช้จนกว่าจะเปิดใช้งานอีกครั้ง การดำเนินการนี้สามารถย้อนกลับได้'
                  : 'ข้อมูลแคชทั้งหมดจะถูกล้าง อาจทำให้ระบบโหลดช้าลงชั่วคราว'
                }
              </p>

              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setDangerModal(null)}
                  className="flex-1 px-4 py-3 rounded-xl text-sm sm:text-base font-medium bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors min-h-[48px]"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleDangerAction}
                  className={`
                    flex-1 px-4 py-3 rounded-xl text-sm sm:text-base font-bold transition-colors min-h-[48px]
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
