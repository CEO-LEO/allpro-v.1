"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gift, Wallet, User, Heart } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useProductStore } from "@/store/useProductStore";

export default function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAppStore();
  const savedProductIds = useProductStore((state) => state.savedProductIds);

  // Don't show on merchant pages
  if (pathname.startsWith('/merchant')) {
    return null;
  }

  const navItems = [
    {
      label: 'หน้าหลัก',
      icon: Home,
      href: '/',
      active: pathname === '/',
    },
    {
      label: 'ที่บันทึก',
      icon: Heart,
      href: '/saved',
      active: pathname.startsWith('/saved'),
      badge: savedProductIds.length,
    },
    {
      label: 'รางวัล',
      icon: Gift,
      href: '/rewards',
      active: pathname.startsWith('/rewards'),
    },
    {
      label: 'โปรไฟล์',
      icon: User,
      href: isAuthenticated ? '/profile' : '/',
      active: pathname.startsWith('/profile'),
      requireAuth: true,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive
                  ? 'text-orange-500'
                  : 'text-gray-600 hover:text-orange-500'
              }`}
            >
              <Icon 
                className={`w-6 h-6 ${isActive ? 'scale-110' : ''} ${item.label === 'ที่บันทึก' && isActive ? 'fill-orange-500' : ''}`} 
              />
              <span className="text-xs font-medium">{item.label}</span>
              
              {/* Badge for Saved items */}
              {item.badge && item.badge > 0 && (
                <span className="absolute top-2 right-[50%] translate-x-3 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
