"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gift, Wallet, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'หน้าแรก', icon: Home },
    { href: '/rewards', label: 'รางวัล', icon: Gift },
    { href: '/wallet', label: 'กระเป๋า', icon: Wallet },
    { href: '/profile', label: 'ฉัน', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center w-16">
              <item.icon
                className={`w-6 h-6 mb-1 transition-colors ${
                  isActive ? 'text-orange-500 fill-orange-500/10' : 'text-gray-400'
                }`}
              />
              <span className={`text-[10px] ${isActive ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
