import type { Metadata } from 'next'
import { Kanit } from 'next/font/google'
import './globals.css'
import { NotificationProvider } from '@/lib/notificationContext'
import { FlashSaleProvider } from '@/lib/flashSaleContext'
import GameificationEventListener from '@/components/Common/GameificationEventListener'
import AuthListener from '@/components/Auth/AuthListener'
import { Toaster } from 'sonner'

const kanit = Kanit({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-kanit',
})

export const metadata: Metadata = {
  title: 'All Pro - ค้นหาโปรโมชั่นที่ดีที่สุด',
  description: 'แพลตฟอร์มค้นหาโปรโมชั่นจาก 7-Eleven, Lotus, Makro และร้านค้าทั่วประเทศ พร้อม AI Insights และการวิเคราะห์ตลาดแบบเรียลไทม์',
  keywords: ['โปรโมชั่น', 'ส่วนลด', '7-11', 'Lotus', 'Makro', 'ของแถม', 'ลดราคา', 'คูปอง', 'ดีล'],
  authors: [{ name: 'All Pro Team' }],
  creator: 'All Pro',
  publisher: 'All Pro',
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://allpro.app',
    siteName: 'All Pro',
    title: 'All Pro - ค้นหาโปรโมชั่นที่ดีที่สุด',
    description: 'แพลตฟอร์มค้นหาโปรโมชั่นจาก 7-Eleven, Lotus, Makro และร้านค้าทั่วประเทศ พร้อม AI Insights',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'All Pro - ค้นหาโปรโมชั่นที่ดีที่สุด',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Pro - ค้นหาโปรโมชั่นที่ดีที่สุด',
    description: 'แพลตฟอร์มค้นหาโปรโมชั่นจาก 7-Eleven, Lotus, Makro และร้านค้าทั่วประเทศ',
    images: ['/og-image.jpg'],
    creator: '@allpro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${kanit.variable} scroll-smooth`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF5722" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </head>
      <body className="font-kanit antialiased bg-slate-50 text-slate-900">
        <NotificationProvider>
          <FlashSaleProvider>
            <AuthListener />
            <GameificationEventListener />
            {/* NO UI components here - layouts are in route groups */}
            {children}
            <Toaster position="top-center" richColors />
          </FlashSaleProvider>
        </NotificationProvider>
      </body>
    </html>
  )
}
