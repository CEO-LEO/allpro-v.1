"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

const CATEGORY_LABEL: Record<string, string> = {
  All: 'ทั้งหมด',
  Food: 'อาหาร',
  Fashion: 'แฟชั่น',
  Travel: 'ท่องเที่ยว',
  Gadget: 'อุปกรณ์',
  Beauty: 'ความงาม',
};

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('iamroot-recent-searches') || '[]'); } catch { return []; }
  });

  const TRENDING = ['ลดราคา', 'ส่วนลด 50%', 'บุฟเฟ่ต์', 'กาแฟ', 'เที่ยว', 'แฟชั่น'];

  const suggestions = searchQuery.trim()
    ? TRENDING.filter(t => t.includes(searchQuery.trim()))
    : recentSearches.slice(0, 4);

  const saveRecentSearch = (q: string) => {
    const updated = [q, ...recentSearches.filter(r => r !== q)].slice(0, 8);
    setRecentSearches(updated);
    try { localStorage.setItem('iamroot-recent-searches', JSON.stringify(updated)); } catch {}
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    const categoryPath = CATEGORY_ROUTE_MAP[category] ?? category;
    router.push(`/category/${encodeURIComponent(categoryPath)}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    saveRecentSearch(suggestion);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    setShowLoginModal(false);
    setShowRegisterModal(false);
    await logout();
    setSelectedCategory('All');
    router.push('/');
  };

  // Don't show navbar on merchant pages
  if (pathname.startsWith('/merchant')) {
    return null;
  }

  return (
    <>
      <nav className="sticky top-0 z-[70] bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <Link href="/" onClick={() => setSelectedCategory('All')} className="flex items-center gap-1.5 flex-shrink-0">
              <Image src="/logo-circle.png" alt="IAMROOT AI" width={36} height={36} className="w-9 h-9" priority />
              <span className="text-base font-bold text-gray-900 hidden sm:inline">
                IAMROOT AI
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4 relative">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="ค้นหาโปรโมชั่น, ร้านค้า, หมวดหมู่..."
                  className="w-full px-3 py-1.5 pl-9 pr-3 border border-gray-200 rounded-lg bg-gray-50/80 focus:bg-white focus:border-orange-400 focus:outline-none text-sm transition-colors placeholder:text-gray-400"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {/* Suggestions dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-[80]"
                  >
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-3 pt-2 pb-1">
                      {searchQuery.trim() ? 'แนะนำ' : 'ค้นหาล่าสุด'}
                    </p>
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseDown={() => handleSuggestionClick(s)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-orange-50 text-left text-sm text-gray-700 transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        {s}
                      </button>
                    ))}
                    {!searchQuery.trim() && TRENDING.length > 0 && (
                      <>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-3 pt-2 pb-1 border-t border-gray-100">กำลังฮิต</p>
                        <div className="flex flex-wrap gap-1.5 px-3 pb-3 pt-1">
                          {TRENDING.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onMouseDown={() => handleSuggestionClick(t)}
                              className="text-xs bg-orange-50 text-orange-600 hover:bg-orange-100 px-2.5 py-1 rounded-full transition-colors"
                            >
                              🔥 {t}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center gap-1 mr-2">
              <Link 
                href="/" 
                onClick={() => setSelectedCategory('All')}
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
                <span>แฟลชเซล</span>
              </Link>

              <Link 
                href="/community" 
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-all hover:bg-gray-100 text-sm ${
                  pathname === '/community' ? 'text-purple-600 font-semibold' : 'text-gray-600'
                }`}
              >
                <Users size={15} />
                <span>ชุมชน</span>
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
                    <div className="hidden sm:flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                      <Coins className="w-3 h-3" />
                      <span>{user.coins ?? 0}</span>
                    </div>

                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
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
                          <div className="px-3 py-2.5 bg-orange-500 text-white">
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
                  className="px-4 py-1.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-all"
                >
                  เข้าสู่ระบบ
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={mobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
              >
                {mobileMenuOpen ? <XIcon className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
              </button>
            </div>
          </div>

          {/* Category Pills - Desktop */}
          <div className="hidden md:flex items-center gap-1.5 pb-2 overflow-x-auto">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {CATEGORY_LABEL[category] || category}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Expandable Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/20 z-[60]"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden border-t border-gray-100 overflow-hidden relative z-[70] bg-white"
              >
                <div className="px-3 py-3 space-y-1">
                  {[
                    { href: '/', label: 'หน้าแรก', icon: Home, color: 'orange' },
                    { href: '/map', label: 'แผนที่ดีล', icon: Map, color: 'blue' },
                    { href: '/flash-sale', label: 'แฟลชเซล', icon: Zap, color: 'orange' },
                    { href: '/community', label: 'ชุมชน', icon: Users, color: 'purple' },
                    { href: '/rewards', label: 'รางวัล', icon: Gift, color: 'green' },
                  ].map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (href === '/') setSelectedCategory('All');
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                        pathname === href ? 'text-orange-600 bg-orange-50 font-semibold' : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                    </Link>
                  ))}

                  {/* User quick links */}
                  {user && (
                    <>
                      <div className="border-t border-gray-100 my-2" />
                      <Link
                        href="/wallet"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                      >
                        <Wallet size={18} />
                        <span>กระเป๋าของฉัน</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                      >
                        <User size={18} />
                        <span>โปรไฟล์</span>
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            </>
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
              className="w-full px-3 py-1.5 pl-8 pr-3 border border-gray-200 rounded-lg bg-gray-50/80 focus:bg-white focus:border-orange-400 focus:outline-none text-sm transition-colors placeholder:text-gray-400"
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
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-50 text-gray-500'
              }`}
            >
              {CATEGORY_LABEL[category] || category}
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
