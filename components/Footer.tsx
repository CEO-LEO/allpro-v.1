'use client';

import Link from 'next/link';

const PROMO_LINKS = [
  { label: 'โปร 1 แถม 1', href: '/category/Food' },
  { label: 'ลด 50%', href: '/category/all' },
  { label: 'โปรอาหาร', href: '/category/Food' },
  { label: 'โปรแฟชั่น', href: '/category/Fashion' },
  { label: 'ตั๋วถูก', href: '/category/Travel' },
  { label: 'โค้ดส่วนลด', href: '/rewards' },
];

const ARTICLE_LINKS = [
  { label: 'สายคาเฟ่', href: '/community' },
  { label: 'ท่องเที่ยว', href: '/community' },
  { label: 'อัปเดตไอที', href: '/community' },
  { label: 'Tips & Tricks', href: '/community' },
  { label: 'ข่าวโปรโมชั่น', href: '/community' },
  { label: 'สำหรับร้านค้า', href: '/merchant-landing' },
];

const SOCIALS = [
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
    ),
  },
  {
    label: 'Twitter',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Grid — 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Column 1: Company Info & Contact */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">All Pro</span>
            </div>

            <div className="space-y-2.5 text-sm text-gray-400 mb-6">
              <p>บริษัท: รอระบุชื่อบริษัท</p>
              <p>ที่อยู่: รอระบุที่อยู่ชั่วคราว กรุงเทพมหานคร 10000</p>
              <p>โทร: <a href="tel:0658694038" className="text-white hover:text-orange-400 transition-colors">065 869 4038</a></p>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-white/10 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Promotions */}
          <div>
            <h3 className="text-base font-bold text-orange-500 mb-5">โปรโมชัน</h3>
            <ul className="space-y-3">
              {PROMO_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white hover:pl-1 transition-all duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Articles */}
          <div>
            <h3 className="text-base font-bold text-orange-500 mb-5">บทความ</h3>
            <ul className="space-y-3">
              {ARTICLE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white hover:pl-1 transition-all duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Download App */}
          <div>
            <h3 className="text-base font-bold text-orange-500 mb-5">ดาวน์โหลดแอปของเราได้ฟรี!</h3>
            <p className="text-sm text-gray-400 mb-5">
              ไม่พลาดทุกโปรโมชัน ดาวน์โหลดเลยวันนี้
            </p>
            <div className="flex flex-col gap-3">
              {/* App Store */}
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 group"
              >
                <svg className="w-8 h-8 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div>
                  <div className="text-[10px] text-gray-400 leading-none group-hover:text-gray-300">Download on the</div>
                  <div className="text-sm font-semibold text-white leading-tight">App Store</div>
                </div>
              </a>

              {/* Google Play */}
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 group"
              >
                <svg className="w-8 h-8 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.144 1.24a1 1 0 010 1.732l-2.144 1.24-2.53-2.53 2.53-2.53v.848zm-4.106-4.106L4.864 11.735l10.937 6.333-2.302 2.302z" />
                </svg>
                <div>
                  <div className="text-[10px] text-gray-400 leading-none group-hover:text-gray-300">GET IT ON</div>
                  <div className="text-sm font-semibold text-white leading-tight">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              © 2026 All Pro Co., Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
              <span className="text-gray-700">|</span>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
