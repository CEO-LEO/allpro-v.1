"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Wallet,
  Package,
  ChevronDown,
  Coins,
  Map,
  Home,
  Gift,
  Zap,
  Users
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import LoginModal from "@/components/Auth/LoginModal";
import RegisterModal from "@/components/Auth/RegisterModal";

const CATEGORIES = ['All', 'Food', 'Fashion', 'Travel', 'Gadget', 'Beauty'];

const CATEGORY_ROUTE_MAP: Record<string, string> = {
  All: 'all',
  Food: 'Food',
  Fashion: 'Fashion',
  Travel: 'Travel',
  Gadget: 'Gadget',
  Beauty: 'Beauty',
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    user, 
    logout
  } = useAuthStore();
  
  const { 
    unreadCount,
    selectedCategory,
    setSelectedCategory,
    savedProductIds
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    const categoryPath = CATEGORY_ROUTE_MAP[category] ?? category;
    router.push(`/category/${encodeURIComponent(categoryPath)}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  // Don't show navbar on merchant pages
  if (pathname.startsWith('/merchant')) {
    return null;
  }

  return (
    <>
      <nav className="sticky top-0 z-[70] bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-h3 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                All Pro
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาโปรโมชั่น, ร้านค้า, หมวดหมู่..."
                  className="w-full px-4 py-2 pl-10 pr-4 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </form>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center gap-4 mr-4">
              <Link 
                href="/" 
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:bg-gray-100 ${
                  pathname === '/' ? 'text-orange-600 font-semibold' : 'text-gray-700'
                }`}
              >
                <Home size={18} />
                <span className="text-body-sm">หน้าแรก</span>
              </Link>
              
              <Link 
                href="/map" 
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:bg-gray-100 ${
                  pathname === '/map' ? 'text-blue-600 font-semibold' : 'text-gray-700'
                }`}
              >
                <Map size={18} />
                <span className="text-body-sm font-medium">แผนที่</span>
              </Link>

              <Link 
                href="/flash-sale" 
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:bg-gray-100 ${
                  pathname === '/flash-sale' ? 'text-orange-600 font-semibold' : 'text-gray-700'
                }`}
              >
                <Zap size={18} />
                <span className="text-body-sm">Flash Sale</span>
              </Link>

              <Link 
                href="/community" 
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:bg-gray-100 ${
                  pathname === '/community' ? 'text-purple-600 font-semibold' : 'text-gray-700'
                }`}
              >
                <Users size={18} />
                <span className="text-body-sm">Community</span>
              </Link>

              <Link 
                href="/rewards" 
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:bg-gray-100 ${
                  pathname === '/rewards' ? 'text-green-600 font-semibold' : 'text-gray-700'
                }`}
              >
                <Gift size={18} />
                <span className="text-body-sm">รางวัล</span>
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Bell className="w-6 h-6 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-caption rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Menu or Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {/* Coins */}
                    <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full">
                      <Coins className="w-4 h-4" />
                      <span className="font-bold">{user.coins}</span>
                    </div>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />

                        {/* Menu */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                        >
                          {/* User Info */}
                          <div className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white">
                            <p className="font-bold">{user.name}</p>
                            <p className="text-body-sm text-orange-100">{user.email}</p>
                            <div className="flex items-center gap-4 mt-2 text-body-sm">
                              <span>Level {user.level}</span>
                              <span>•</span>
                              <span>{user.xp} XP</span>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <Link
                              href="/profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                            >
                              <User className="w-5 h-5 text-gray-600" />
                              <span>โปรไฟล์</span>
                            </Link>

                            <Link
                              href="/wallet"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                            >
                              <Wallet className="w-5 h-5 text-gray-600" />
                              <span>กระเป๋าของฉัน</span>
                            </Link>

                            <Link
                              href="/profile/edit"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                            >
                              <Settings className="w-5 h-5 text-gray-600" />
                              <span>ตั้งค่า</span>
                            </Link>

                            <div className="border-t border-gray-200 my-2" />

                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors"
                            >
                              <LogOut className="w-5 h-5" />
                              <span>ออกจากระบบ</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  เข้าสู่ระบบ
                </button>
              )}
            </div>
          </div>

          {/* Category Pills - Desktop */}
          <div className="hidden md:flex items-center gap-2 pb-3 overflow-x-auto">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <form onSubmit={handleSearch} className="md:hidden px-4 pb-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาโปรโมชั่น..."
              className="w-full px-4 py-2 pl-10 pr-4 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </form>

        {/* Category Pills - Mobile */}
        <div className="md:hidden flex items-center gap-2 px-4 pb-3 overflow-x-auto">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-body-sm ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => setShowRegisterModal(true)}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => setShowLoginModal(true)}
      />
    </>
  );
}
