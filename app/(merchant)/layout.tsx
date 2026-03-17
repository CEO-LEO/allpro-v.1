'use client';

import { useState } from 'react';
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
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import CreateDealModal from './merchant/dashboard/CreateDealModal';
import AuthGuard from '@/components/Common/AuthGuard';
import { useRouter } from 'next/navigation';

// Merchant Sidebar Component
function MerchantSidebar({ onCreateDeal }: { onCreateDeal: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const navItems = [
    { href: '/merchant/dashboard', icon: LayoutDashboard, label: 'Dashboard', activePaths: ['/merchant/dashboard'] },
    { href: '/merchant/shop', icon: Store, label: 'My Shop', activePaths: ['/merchant/shop'] },
    { href: '/merchant/ads', icon: TrendingUp, label: 'Ads', activePaths: ['/merchant/ads'] },
    { href: '/merchant/settings', icon: Settings, label: 'Settings', activePaths: ['/merchant/settings'] }
  ];

  const isActive = (paths: string[]) => {
    return paths.some(path => pathname.startsWith(path));
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 h-screen z-50 overflow-y-auto bg-white border-r border-gray-200 shadow-sm">
      <div className="flex flex-col h-full p-6">
        {/* Logo & Brand */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">All Pro</h1>
              <p className="text-xs text-blue-600">Business Portal</p>
            </div>
          </div>
          {user && (
            <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.activePaths);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                  active
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
                <span className={`font-medium ${active ? 'font-bold' : ''}`}>{item.label}</span>
                
                {active && (
                  <motion.div
                    layoutId="merchant-nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* FAB Button - Create Flash Sale */}
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
          <button
            onClick={onCreateDeal}
            className="w-full py-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            <span>Create Flash Sale</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-gray-50 text-gray-500 font-medium hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showCreateDeal, setShowCreateDeal] = useState(false);

  return (
    <AuthGuard requiredRole="merchant">
      <div className="min-h-screen bg-slate-50">
        {/* Merchant Sidebar - Desktop Only */}
        <MerchantSidebar onCreateDeal={() => setShowCreateDeal(true)} />
        
        {/* Main Content - Pushed right by sidebar */}
        <main className="min-h-screen lg:ml-64 transition-all duration-200">
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
