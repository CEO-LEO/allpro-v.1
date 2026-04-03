'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard,
  Store,
  TrendingUp,
  Settings,
  Zap,
  Menu,
  LogOut,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';
import CreateDealModal from './merchant/dashboard/CreateDealModal';
import AuthGuard from '@/components/Common/AuthGuard';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Shared profile completeness check
function isMerchantProfileComplete(user: { shopName?: string; shopLogo?: string; shopAddress?: string; phone?: string; merchantProfileComplete?: boolean } | null): boolean {
  if (!user) return false;
  const hasShopName = !!user.shopName?.trim() && user.shopName.trim() !== 'My Shop';
  const hasLogo = !!user.shopLogo;
  const hasAddress = !!user.shopAddress?.trim();
  const hasPhone = !!user.phone?.trim() && user.phone.trim().length >= 9;
  return hasShopName && hasLogo && hasAddress && hasPhone;
}

// Merchant Sidebar Component
function MerchantSidebar({ onCreateDeal }: { onCreateDeal: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const profileComplete = isMerchantProfileComplete(user);

  const navItems = [
    { href: '/merchant/dashboard', icon: LayoutDashboard, label: 'แดชบอร์ด', activePaths: ['/merchant/dashboard'] },
    { href: '/merchant/shop', icon: Store, label: 'ร้านของฉัน', activePaths: ['/merchant/shop'] },
    { href: '/merchant/ads', icon: TrendingUp, label: 'โฆษณา', activePaths: ['/merchant/ads'] },
    { href: '/merchant/settings', icon: Settings, label: 'ตั้งค่า', activePaths: ['/merchant/settings'] }
  ];

  const isActive = (paths: string[]) => {
    return paths.some(path => pathname.startsWith(path));
  };

  const handleLogout = async () => {
    await logout();
    toast.success('ออกจากระบบสำเร็จ');
    router.push('/');
  };

  const handleCreateDeal = () => {
    if (!profileComplete) {
      toast.error('กรุณากรอกข้อมูลร้านค้าให้ครบก่อนสร้างดีล', { duration: 3000 });
      router.push('/merchant/shop?setup=true');
      return;
    }
    onCreateDeal();
  };

  return (
    <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 h-screen z-50 overflow-y-auto bg-slate-900" aria-label="Desktop sidebar">
      <div className="flex flex-col h-full p-5">
        {/* Logo & Brand */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">All Pro</h1>
              <p className="text-xs text-blue-400">Merchant</p>
            </div>
          </div>
          {user && (
            <div className="mt-3 px-3 py-2.5 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.activePaths);
            const showBadge = item.href === '/merchant/shop' && !profileComplete;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                  active
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 transition-transform" />
                <span className={`font-medium ${active ? 'font-semibold' : ''}`}>{item.label}</span>
                
                {showBadge && (
                  <span className="ml-auto w-2 h-2 bg-orange-500 rounded-full" title="กรอกข้อมูลร้านค้าไม่ครบ" />
                )}

                {active && (
                  <motion.div
                    layoutId="merchant-nav-indicator"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* FAB Button - Create Flash Sale */}
        <div className="mt-6 pt-6 border-t border-slate-700 space-y-3">
          <button
            onClick={handleCreateDeal}
            className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
              profileComplete
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30 hover:scale-105 active:scale-95'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {profileComplete ? (
              <Zap className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-400" />
            )}
            <span>สร้างแฟลชเซล</span>
          </button>
          {!profileComplete && (
            <p className="text-xs text-orange-400 text-center px-2">
              กรอกข้อมูลร้านค้าให้ครบที่ ร้านของฉัน ก่อน
            </p>
          )}

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-medium hover:bg-red-900/30 hover:text-red-400 transition-all flex items-center justify-center gap-2 border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

// Mobile Bottom Navigation Component - matches MerchantSidebar design
function MerchantBottomNav({ onCreateDeal }: { onCreateDeal: () => void }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const router = useRouter();
  const profileComplete = isMerchantProfileComplete(user);

  const navItems = [
    { href: '/merchant/dashboard', icon: LayoutDashboard, label: 'แดชบอร์ด', activePaths: ['/merchant/dashboard'] },
    { href: '/merchant/shop', icon: Store, label: 'ร้านของฉัน', activePaths: ['/merchant/shop'] },
    { href: '/merchant/ads', icon: TrendingUp, label: 'โฆษณา', activePaths: ['/merchant/ads'] },
    { href: '/merchant/settings', icon: Settings, label: 'ตั้งค่า', activePaths: ['/merchant/settings'] }
  ];

  const isActive = (paths: string[]) => {
    return paths.some(path => pathname.startsWith(path));
  };

  const handleFAB = () => {
    if (!profileComplete) {
      toast.error('กรุณากรอกข้อมูลร้านค้าให้ครบก่อนสร้างดีล');
      router.push('/merchant/shop?setup=true');
      return;
    }
    onCreateDeal();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-slate-900 border-t border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-safe" aria-label="Mobile navigation">
      <div className="max-w-lg mx-auto relative">
        {/* Navigation Items */}
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.activePaths);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  active
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                } ${index === 1 ? 'mr-10' : ''} ${index === 2 ? 'ml-10' : ''}`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${active ? 'scale-110' : ''} transition-transform`} />
                  {active && (
                    <motion.div
                      layoutId="merchant-bottom-nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span className={`text-[10px] leading-tight ${active ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Center FAB Button */}
        <button
          onClick={handleFAB}
          className={`absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform ${
            profileComplete
              ? 'bg-blue-500 text-white shadow-blue-500/40'
              : 'bg-slate-700 text-slate-400'
          }`}
        >
          <Zap className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const { user, updateUser, isHydrating } = useAuthStore();
  const syncDone = useRef(false);

  // ═══ Safety Net: ถ้า profile ว่างแต่ DB มีข้อมูล → ดึงมาเติม ═══
  // แก้ปัญหา: หลังล็อคอิน/รีเฟรช ข้อมูลจาก DB ยังไม่โหลดทัน
  useEffect(() => {
    if (syncDone.current) return;
    if (isHydrating) return; // ★ รอให้ hydration เสร็จก่อน
    if (!user || user.role !== 'MERCHANT') return;
    if (!isSupabaseConfigured) return;

    // ถ้ามีข้อมูลครบแล้ว → ไม่ต้อง sync
    const hasData = !!(
      user.shopName?.trim() &&
      user.shopLogo &&
      user.shopAddress?.trim() &&
      user.phone?.trim()
    );
    if (hasData) {
      syncDone.current = true;
      return;
    }

    // Profile ยังว่าง → ดึงจาก merchant_profiles table
    syncDone.current = true;
    (async () => {
      try {
        // หา user_id จาก Supabase session หรือใช้ user.id
        let userId = user.id;
        if (isSupabaseConfigured) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.id) userId = session.user.id;
          } catch { /* ใช้ user.id fallback */ }
        }

        const { data, error } = await supabase
          .from('merchant_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error || !data) {
          console.log('[MerchantLayout] No merchant_profiles in DB — first time setup needed');
          return;
        }

        console.log('[MerchantLayout] DB sync — found merchant data:', data.shop_name);
        updateUser({
          shopName: data.shop_name || undefined,
          shopLogo: data.shop_logo || undefined,
          shopAddress: data.shop_address || undefined,
          phone: data.phone || undefined,
          shopSocialLine: data.line_id || undefined,
          shopSocialFacebook: data.facebook || undefined,
          shopSocialInstagram: data.instagram || undefined,
          shopSocialWebsite: data.website || undefined,
          merchantProfileComplete: !!(
            data.shop_name?.trim() &&
            data.shop_logo &&
            data.shop_address?.trim() &&
            data.phone?.trim() && data.phone.trim().length >= 9
          ),
        });
      } catch (err) {
        console.warn('[MerchantLayout] DB sync error:', err);
      }
    })();
  }, [user, updateUser, isHydrating]);

  // ★ แสดง Loading ขณะกำลังดึงข้อมูลจาก DB (ป้องกัน "ตั้งค่าโปรไฟล์" เด้งมาก่อน)
  if (isHydrating) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-sm text-slate-500">กำลังโหลดข้อมูลร้านค้า...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard requiredRole="merchant">
      <div className="min-h-screen bg-white">
        {/* Merchant Sidebar - Desktop Only */}
        <MerchantSidebar onCreateDeal={() => setShowCreateDeal(true)} />
        
        {/* Merchant Bottom Nav - Mobile Only */}
        <MerchantBottomNav onCreateDeal={() => setShowCreateDeal(true)} />
        
        {/* Main Content - Pushed right by sidebar on desktop, padded bottom on mobile */}
        <main className="min-h-screen lg:ml-64 pb-24 lg:pb-0 transition-all duration-200">
          {children}
        </main>
        
        {/* Create Deal Modal */}
        <CreateDealModal 
          isOpen={showCreateDeal} 
          onClose={() => setShowCreateDeal(false)} 
        />
      </div>
    </AuthGuard>
  );
}
