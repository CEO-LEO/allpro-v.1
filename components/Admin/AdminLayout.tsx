'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Flag, 
  Image, 
  Users, 
  Settings,
  LogOut,
  Activity,
  TrendingUp,
  Shield,
  Sparkles,
  Plus
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    label: 'Create Post',
    href: '/admin/create-post',
    icon: Plus
  },
  {
    label: 'AI Data Parser',
    href: '/admin/ai-parser',
    icon: Sparkles
  },
  {
    label: 'Moderation Queue',
    href: '/admin/moderation',
    icon: Flag,
    badge: 12
  },
  {
    label: 'Hero Banners',
    href: '/admin/banners',
    icon: Image
  },
  {
    label: 'User Management',
    href: '/admin/users',
    icon: Users
  },
  {
    label: 'System Health',
    href: '/admin/health',
    icon: Activity
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Dark Mode Sidebar */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        {/* Logo & Title */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-h4 text-white">Admin Panel</h1>
              <p className="text-caption text-gray-400">Platform Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mt-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-caption text-green-400">System Online</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all text-body-sm
                    ${isActive 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-caption px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Admin Info */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-body-sm">AD</span>
            </div>
            <div>
              <p className="text-body-sm text-white">Admin User</p>
              <p className="text-caption text-gray-400">Super Admin</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-body-sm transition-colors w-full">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
