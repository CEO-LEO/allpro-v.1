'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MapPinIcon,
  BoltIcon,
  TicketIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';

const SERVICES = [
  { 
    id: 'nearby', 
    name: 'บ่าที่จอ', 
    icon: MapPinIcon, 
    color: 'from-blue-500 to-cyan-500',
    href: '#nearby'
  },
  { 
    id: 'flashsale', 
    name: 'โปรโมชั่น', 
    icon: BoltIcon, 
    color: 'from-orange-500 to-red-500',
    href: '/flash-sale'
  },
  { 
    id: 'coupons', 
    name: 'คูปอง', 
    icon: TicketIcon, 
    color: 'from-purple-500 to-pink-500',
    href: '/rewards'
  },
  { 
    id: 'articles', 
    name: 'บทความ', 
    icon: NewspaperIcon, 
    color: 'from-green-500 to-emerald-500',
    href: '/community'
  },
];

export default function ServiceGrid() {
  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-h3 text-gray-800">บริการทั้งหมด</h2>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {SERVICES.map((service, index) => {
          const Icon = service.icon;
          
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={service.href}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white hover:bg-gray-50 border-2 border-gray-100 hover:border-orange-200 hover:shadow-md transition-all"
              >
                {/* Icon Container */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${service.color} shadow-md transition-transform group-hover:scale-110`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Service Name */}
                <span className="text-caption font-medium text-center leading-tight text-gray-700 group-hover:text-orange-600 transition-colors">
                  {service.name}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
