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
  Users,
  Menu,
  X as XIcon
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent hidden sm:inline">
                All Pro
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาโปรโมชั่น, ร้านค้า, หมวดหมู่..."
                  className="w-full px-3 py-1.5 pl-9 pr-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </form>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center gap-1 mr-2">
              <Link 
                href="/" 
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-all hover:bg-gray-100 text-sm ${
                  pathname === '/' ? 'text-orange-600 font-semibold' : 'text-gray-600'
                }`}
              >
                <Home size={15} />
                <span>หน้าแรก</span>
              </Link>
              
              <Link 
                href="/map" 
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-all hover:bg-gray-100 text-sm ${
                  pathname === '/map' ? 'text-blue-600 font-semibold' : 'text-gray-600'
                }`}
              >
                <Map size={15} />
                <span>แผนที่</span>
              </Link>

              <Link 
                href="/flash-sale" 
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-all hover:bg-gray-100 text-sm ${
                  pathname === '/flash-sale' ? 'text-orange-600 font-semibold' : 'text-gray-600'
                }`}
              >
                <Zap size={15} />
                <span>Flash Sale</span>
              </Link>

              <Link 
                href="/community" 
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-all hover:bg-gray-100 text-sm ${
                  pathname === '/community' ? 'text-purple-600 font-semibold' : 'text-gray-600'
                }`}
              >
                <Users size={15} />
                <span>Community</span>
              </Link>

              <Link 
                href="/rewards" 
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-all hover:bg-gray-100 text-sm ${
                  pathname === '/rewards' ? 'text-green-600 font-semibold' : 'text-gray-600'
                }`}
              >
                <Gift size={15} />
                <span>รางวัล</span>
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Menu or Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {/* Coins */}
                    <div className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                      <Coins className="w-3 h-3" />
                      <span>{user.coins ?? 0}</span>
                    </div>

                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
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
                          className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                        >
                          {/* User Info */}
                          <div className="px-3 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white">
                            <p className="font-bold text-sm">{user.name || 'ผู้ใช้งาน'}</p>
                            <p className="text-xs text-orange-100">{user.email || 'กำลังโหลดข้อมูล...'}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs">
                              <span>Level {user.level ?? 1}</span>
                              <span>•</span>
                              <span>{user.xp ?? 0} XP</span>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-1">
                            <Link
                              href="/profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-100 transition-colors text-sm"
                            >
                              <User className="w-4 h-4 text-gray-500" />
                              <span>โปรไฟล์</span>
                            </Link>

                            <Link
                              href="/wallet"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-100 transition-colors text-sm"
                            >
                              <Wallet className="w-4 h-4 text-gray-500" />
                              <span>กระเป๋าของฉัน</span>
                            </Link>

                            <Link
                              href="/profile/edit"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-100 transition-colors text-sm"
                            >
                              <Settings className="w-4 h-4 text-gray-500" />
                              <span>ตั้งค่า</span>
                            </Link>

                            <div className="border-t border-gray-200 my-1" />

                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 text-red-600 transition-colors text-sm"
                            >
                              <LogOut className="w-4 h-4" />
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
                  className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  เข้าสู่ระบบ
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                {mobileMenuOpen ? <XIcon className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
              </button>
            </div>
          </div>

          {/* Category Pills - Desktop */}
          <div className="hidden md:flex items-center gap-1.5 pb-2 overflow-x-auto">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Expandable Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-gray-100 overflow-hidden"
            >
              <div className="px-3 py-2 space-y-1">
                {[
                  { href: '/', label: 'หน้าแรก', icon: Home, color: 'orange' },
                  { href: '/map', label: 'แผนที่', icon: Map, color: 'blue' },
                  { href: '/flash-sale', label: 'Flash Sale', icon: Zap, color: 'orange' },
                  { href: '/community', label: 'Community', icon: Users, color: 'purple' },
                  { href: '/rewards', label: 'รางวัล', icon: Gift, color: 'green' },
                ].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      pathname === href ? 'text-orange-600 bg-orange-50 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar - Mobile */}
        <form onSubmit={handleSearch} className="md:hidden px-3 pb-2">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาโปรโมชั่น..."
              className="w-full px-3 py-1.5 pl-8 pr-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </form>

        {/* Category Pills - Mobile */}
        <div className="md:hidden flex items-center gap-1.5 px-3 pb-2 overflow-x-auto">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all text-xs font-medium ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600'
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
