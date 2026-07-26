'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  MapPin, 
  Wallet, 
  User, 
  QrCode,
  LayoutDashboard,
  Store,
  TrendingUp,
  Settings,
  Zap
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export default function DynamicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const [showFAB, setShowFAB] = useState(false);

  // Define navigation items based on role
  const userNavItems = [
    { href: '/', icon: Home, label: 'หน้าแรก', activePaths: ['/'] },
    { href: '/map', icon: MapPin, label: 'แผนที่', activePaths: ['/map'] },
    { href: '/wallet', icon: Wallet, label: 'กระเป๋า', activePaths: ['/wallet'] },
    { href: '/profile', icon: User, label: 'โปรไฟล์', activePaths: ['/profile'] }
  ];

  const merchantNavItems = [
    { href: '/merchant/dashboard', icon: LayoutDashboard, label: 'แดชบอร์ด', activePaths: ['/merchant/dashboard'] },
    { href: '/merchant/shop', icon: Store, label: 'ร้านของฉัน', activePaths: ['/merchant/shop'] },
    { href: '/merchant/ads', icon: TrendingUp, label: 'โฆษณา', activePaths: ['/merchant/ads'] },
    { href: '/merchant/settings', icon: Settings, label: 'ตั้งค่า', activePaths: ['/merchant/settings'] }
  ];

  const navItems = user?.role === 'MERCHANT' ? merchantNavItems : userNavItems;
  
  // Profile completeness check for merchants
  const isMerchantComplete = (() => {
    if (user?.role !== 'MERCHANT') return true;
    const hasShopName = !!user.shopName?.trim() && user.shopName.trim() !== 'My Shop';
    const hasLogo = !!user.shopLogo;
    const hasAddress = !!user.shopAddress?.trim();
    const hasPhone = !!user.phone?.trim() && user.phone.trim().length >= 9;
    return hasShopName && hasLogo && hasAddress && hasPhone;
  })();

  // Floating Action Button config
  const fabConfig = user?.role === 'MERCHANT' 
    ? {
        icon: Zap,
        label: 'Create Flash Sale',
        onClick: () => {
          if (!isMerchantComplete) {
            toast.error('กรุณากรอกข้อมูลร้านค้าให้ครบก่อนสร้างดีล');
            router.push('/merchant/shop?setup=true');
            return;
          }
          router.push('/merchant/dashboard');
          toast.info('💡 คลิกปุ่ม "Create Flash Sale" สีน้ำเงินด้านล่างเพื่อสร้างดีล');
        },
        color: isMerchantComplete ? 'from-blue-500 to-indigo-600' : 'from-slate-500 to-slate-600'
      }
    : {
        icon: QrCode,
        label: 'Scan QR',
        onClick: () => {
          router.push('/');
          setTimeout(() => {
            toast.info('📱 คลิกปุ่มส้มมุมล่างขวาเพื่อเปิดสแกน QR', { duration: 3000 });
          }, 300);
        },
        color: 'from-orange-500 to-red-600'
      };

  const isActive = (paths: string[]) => {
    return paths.some(path => {
      if (path === '/') return pathname === '/';
      return pathname.startsWith(path);
    });
  };

  return (
    <>
      {/* Bottom Navigation Bar - Mobile */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden ${
        user?.role === 'MERCHANT' 
          ? 'bg-gradient-to-t from-slate-900 via-slate-800 to-slate-900 border-t-2 border-blue-500/30' 
          : 'bg-gradient-to-t from-amber-50 via-white to-amber-50 border-t-2 border-orange-200'
      } shadow-[0_-4px_20px_rgba(0,0,0,0.1)] pb-safe`}>
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
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                    active
                      ? user?.role === 'MERCHANT'
                        ? 'text-blue-400'
                        : 'text-orange-600'
                      : user?.role === 'MERCHANT'
                        ? 'text-gray-400 hover:text-blue-300'
                        : 'text-gray-600 hover:text-orange-500'
                  } ${index === 1 ? 'mr-16' : ''} ${index === 2 ? 'ml-16' : ''}`}
                >
                  <div className="relative">
                    <Icon className={`w-6 h-6 ${active ? 'scale-110' : ''} transition-transform`} />
                    {active && (
                      <motion.div
                        layoutId={`nav-indicator-${user?.role}`}
                        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                          user?.role === 'MERCHANT' ? 'bg-blue-400' : 'bg-orange-500'
                        }`}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                  <span className={`text-caption ${active ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Center Floating Action Button */}
          <button
            onClick={fabConfig.onClick}
            className={`absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br ${fabConfig.color} text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform`}
          >
            <fabConfig.icon className="w-7 h-7" />
          </button>
        </div>
      </nav>

      {/* Desktop Sidebar - Left */}
      <aside className={`hidden lg:block fixed left-0 top-0 bottom-0 w-64 h-screen z-50 ${
        user?.role === 'MERCHANT'
          ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r-2 border-blue-500/30'
          : 'bg-gradient-to-b from-amber-50 via-white to-orange-50 border-r-2 border-orange-200'
      } shadow-xl overflow-y-auto`}>
        <div className="flex flex-col h-full">
          {/* Logo & Role Badge */}
          <div className={`p-6 border-b-2 ${
            user?.role === 'MERCHANT' ? 'border-blue-500/30' : 'border-orange-200'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                user?.role === 'MERCHANT' 
                  ? 'from-blue-500 to-indigo-600' 
                  : 'from-orange-500 to-red-600'
              } flex items-center justify-center text-white text-h3`}>
                {user?.role === 'MERCHANT' ? 'B' : 'H'}
              </div>
              <div>
                <h1 className={`text-h4 ${
                  user?.role === 'MERCHANT' ? 'text-white' : 'text-gray-900'
                }`}>
                  All Pro
                </h1>
                <span className={`text-caption px-2 py-0.5 rounded-full ${
                  user?.role === 'MERCHANT'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-orange-500/20 text-orange-600'
                }`}>
                  {user?.role === 'MERCHANT' ? 'Merchant' : 'Hunter'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.activePaths);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    active
                      ? user?.role === 'MERCHANT'
                        ? 'bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/20'
                        : 'bg-orange-500/20 text-orange-600 shadow-lg shadow-orange-500/20'
                      : user?.role === 'MERCHANT'
                        ? 'text-gray-400 hover:bg-slate-800 hover:text-blue-300'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId={`sidebar-indicator-${user?.role}`}
                      className={`ml-auto w-2 h-2 rounded-full ${
                        user?.role === 'MERCHANT' ? 'bg-blue-400' : 'bg-orange-500'
                      }`}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* FAB Button - Desktop */}
          <div className="p-4 border-t-2 border-inherit">
            <button
              onClick={fabConfig.onClick}
              className={`w-full py-4 rounded-xl bg-gradient-to-br ${fabConfig.color} text-white font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2`}
            >
              <fabConfig.icon className="w-5 h-5" />
              <span>{fabConfig.label}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
