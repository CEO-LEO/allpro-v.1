'use client';

import Link from 'next/link';
import { 
  ShoppingBagIcon,
  MapPinIcon,
  TicketIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';

const services = [
  { icon: MapPinIcon, label: 'แผนที่ร้านค้า', href: '/map', emoji: '🗺️' },
  { icon: TicketIcon, label: 'Flash Sale', href: '/flash-sale', emoji: '⚡' },
  { icon: ShoppingBagIcon, label: 'Community', href: '/community', emoji: '👥' },
  { icon: NewspaperIcon, label: 'ชวนเพื่อน', href: '/refer', emoji: '🎁' },
];

export default function QuickServices() {
  return (
    <div className="bg-white py-6">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">บริการทั้งหมด</h2>
        
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {services.map((service, idx) => (
            <Link
              key={idx}
              href={service.href}
              className="flex flex-col items-center p-3 sm:p-4 bg-gray-50 hover:bg-orange-50 rounded-xl transition-all hover:shadow-md group"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-shadow border-2 border-gray-100 group-hover:border-[#FF5722]">
                <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">
                  {service.emoji}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-[#FF5722] text-center">
                {service.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
