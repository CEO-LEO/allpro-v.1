'use client';

import Navbar from '@/components/Layout/Navbar';
import BottomNav from '@/components/Layout/BottomNav';
import AIChatbot from '@/components/AIChatbot';
import QRScanner from '@/components/QRScanner';
import { Toaster } from 'sonner';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Skip to content link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        ข้ามไปยังเนื้อหาหลัก
      </a>
      
      {/* Top Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main id="main-content" className="min-h-screen pb-20 md:pb-0">
        {children}
      </main>
      
      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />

      {/* Floating Action Buttons */}
      <QRScanner />
      <AIChatbot />

      {/* Toast Notifications */}
      <Toaster position="top-center" richColors />
    </div>
  );
}
