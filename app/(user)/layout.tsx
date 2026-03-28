'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Layout/Navbar';
import BottomNav from '@/components/Layout/BottomNav';
import Footer from '@/components/Footer';
import AIChatbot from '@/components/AIChatbot';
import QRScanner from '@/components/QRScanner';
import ProfileCompletionModal from '@/components/Onboarding/ProfileCompletionModal';
import { useAuthStore } from '@/store/useAuthStore';
import { Toaster } from 'sonner';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Show profile completion modal for authenticated users who haven't filled demographics
  useEffect(() => {
    if (isAuthenticated && user?.role === 'USER' && !user?.profileCompleted) {
      const timer = setTimeout(() => setShowProfileModal(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user?.role, user?.profileCompleted]);

  return (
    <div className="min-h-screen bg-white">
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

      {/* Footer */}
      <Footer />
      
      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />

      {/* Floating Action Buttons */}
      <QRScanner />
      <AIChatbot />

      {/* Toast Notifications */}
      <Toaster position="top-center" richColors />

      {/* Profile Completion Onboarding */}
      {showProfileModal && (
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}
