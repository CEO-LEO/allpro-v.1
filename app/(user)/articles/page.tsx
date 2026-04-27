'use client';

import Link from 'next/link';
import { CalendarIcon, UserIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const articles = [
  {
    id: 1,
    title: '10 เทคนิคหาโปรโมชั่นให้เจอทุกวัน ประหยัดได้เดือนละหลักพัน!',
    excerpt: 'รู้หรือไม่ว่าการหาโปรโมชั่นให้เป็นสามารถประหยัดเงินได้มากถึง 3,000-5,000 บาทต่อเดือน...',
    image: '📰',
    category: 'Tips & Tricks',
    author: 'IAMROOT AI Team',
    date: '2026-01-20',
    readTime: '5 นาที'
  },
  {
    id: 2,
    title: 'IAMROOT AI เปิดตัวโปรโมชั่นใหม่! ช้อปครบ 300 รับคูปอง 50 บาท',
    excerpt: 'IAMROOT AI ประกาศแคมเปญใหม่สำหรับสมาชิกโดยมีโปรโมชั่นพิเศษตลอดเดือนกุมภาพันธ์...',
    image: '🎁',
    category: 'ข่าวโปรโมชั่น',
    author: 'Admin',
    date: '2026-01-18',
    readTime: '3 นาที'
  },
  {
    id: 3,
    title: 'วิธีใช้ IAMROOT AI เพิ่มยอดขาย 200% สำหรับเจ้าของร้าน',
    excerpt: 'Data-Driven Marketing ด้วย Market Insights และ SEO Ranking ที่จะช่วยให้ร้านของคุณมียอดขายเพิ่มขึ้น...',
    image: '📈',
    category: 'สำหรับร้านค้า',
    author: 'Business Team',
    date: '2026-01-15',
    readTime: '7 นาที'
  },
  {
    id: 4,
    title: 'AI ทำนายเทรนด์โปรโมชั่น: สินค้าอะไรจะฮิตในปี 2026',
    excerpt: 'จากการวิเคราะห์ Big Data ของเรา พบว่าสินค้ากลุ่ม Health & Wellness จะเติบโต 85% ในปีนี้...',
    image: '🤖',
    category: 'Data Insights',
    author: 'AI Team',
    date: '2026-01-10',
    readTime: '6 นาที'
  }
];

export default function ArticlesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-base sm:text-xl font-bold text-[#FF5722] hover:text-[#E64A19] transition-colors">
              ← IAMROOT AI
            </Link>
            <h1 className="text-sm sm:text-lg font-semibold">บทความ</h1>
            <div className="w-8 sm:w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-[#FF5722] to-[#FF7043] rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">บทความและข่าวสาร</h1>
          <p className="text-sm sm:text-base text-white/90">
            เรื่องราว Tips & Tricks และข่าวสารโปรโมชั่นล่าสุด
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div key={article.id} className="card overflow-hidden hover:shadow-2xl transition-all cursor-pointer group">
              {/* Image */}
              <div className="h-48 bg-gradient-to-br from-orange-100 to-red-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-7xl">{article.image}</span>
              </div>

              {/* Content */}
              <div className="p-5">
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full mb-3">
                  {article.category}
                </span>

                <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#FF5722] transition-colors">
                  {article.title}
                </h2>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3" />
                      {article.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(article.date).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </div>
                  <span>{article.readTime}</span>
                </div>

                {/* Read More */}
                <button className="mt-4 w-full bg-[#FF5722] hover:bg-[#E64A19] text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  อ่านเพิ่มเติม
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/" className="inline-block btn-primary">
            กลับหน้าแรก
          </Link>
        </div>
      </main>
    </div>
  );
}
