'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UserCircleIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  href?: string;
  onClick?: () => void;
  badge?: string;
  proOnly?: boolean;
  color: string;
}

export default function MerchantSettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const proStatus = user.isPro || user.verified || false;
    setIsPro(proStatus);
    setIsLoading(false);
  }, [user, router]);

  const settingsCategories = [
    {
      title: 'บัญชีและโปรไฟล์',
      items: [
        {
          id: 'profile',
          title: 'ข้อมูลส่วนตัว',
          description: 'แก้ไขชื่อ อีเมล และรูปโปรไฟล์',
          icon: UserCircleIcon,
          href: '/merchant/profile',
          color: 'from-blue-500 to-cyan-500'
        },
        {
          id: 'shop',
          title: 'ข้อมูลร้านค้า',
          description: 'ชื่อร้าน ที่อยู่ เวลาทำการ',
          icon: BuildingStorefrontIcon,
          href: '/merchant/shop',
          color: 'from-purple-500 to-pink-500'
        },
      ]
    },
    {
      title: 'การตั้งค่าร้านค้า',
      items: [
        {
          id: 'auto-reply',
          title: 'Auto Reply ตอบอัตโนมัติ',
          description: 'ตั้งค่าระบบตอบกลับอัตโนมัติด้วย AI',
          icon: ChatBubbleLeftRightIcon,
          href: '/merchant/settings/auto-reply',
          badge: 'PRO',
          proOnly: true,
          color: 'from-green-500 to-emerald-500'
        },
        {
          id: 'analytics',
          title: 'รายงานและสถิติ',
          description: 'ดูสถิติการขาย ยอดผู้เข้าชม',
          icon: ChartBarIcon,
          href: '/merchant/analytics',
          color: 'from-orange-500 to-red-500'
        },
        {
          id: 'appearance',
          title: 'ธีมและรูปแบบ',
          description: 'ปรับแต่งหน้าร้านของคุณ',
          icon: PaintBrushIcon,
          onClick: () => toast.success('คุณสมบัตินี้กำลังพัฒนา'),
          color: 'from-pink-500 to-rose-500'
        },
      ]
    },
    {
      title: 'การชำระเงินและการเงิน',
      items: [
        {
          id: 'payment',
          title: 'วิธีการชำระเงิน',
          description: 'จัดการบัญชีธนาคารและช่องทางรับเงิน',
          icon: CreditCardIcon,
          onClick: () => toast.success('คุณสมบัตินี้กำลังพัฒนา'),
          color: 'from-yellow-500 to-amber-500'
        },
      ]
    },
    {
      title: 'การแจ้งเตือนและความปลอดภัย',
      items: [
        {
          id: 'notifications',
          title: 'การแจ้งเตือน',
          description: 'ตั้งค่าการแจ้งเตือนอีเมล และ SMS',
          icon: BellIcon,
          onClick: () => toast.success('คุณสมบัตินี้กำลังพัฒนา'),
          color: 'from-indigo-500 to-blue-500'
        },
        {
          id: 'security',
          title: 'ความปลอดภัย',
          description: 'เปลี่ยนรหัสผ่าน Two-Factor Authentication',
          icon: ShieldCheckIcon,
          onClick: () => toast.success('คุณสมบัตินี้กำลังพัฒนา'),
          color: 'from-red-500 to-pink-500'
        },
      ]
    },
    {
      title: 'อื่นๆ',
      items: [
        {
          id: 'language',
          title: 'ภาษาและภูมิภาค',
          description: 'เลือกภาษาและเขตเวลา',
          icon: GlobeAltIcon,
          onClick: () => toast.success('คุณสมบัตินี้กำลังพัฒนา'),
          color: 'from-teal-500 to-cyan-500'
        },
        {
          id: 'advanced',
          title: 'ตั้งค่าขั้นสูง',
          description: 'API Keys และการตั้งค่าสำหรับนักพัฒนา',
          icon: Cog6ToothIcon,
          onClick: () => toast.success('คุณสมบัตินี้กำลังพัฒนา'),
          badge: 'DEV',
          color: 'from-gray-500 to-slate-500'
        },
      ]
    }
  ];

  const handleItemClick = (item: SettingItem) => {
    if (item.proOnly && !isPro) {
      toast.error('คุณสมบัตินี้สำหรับสมาชิก PRO เท่านั้น');
      router.push('/merchant/upgrade');
      return;
    }

    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Cog6ToothIcon className="w-8 h-8 text-orange-500" />
                ตั้งค่าร้านค้า
              </h1>
              <p className="mt-2 text-gray-600">
                จัดการข้อมูลร้านค้าและการตั้งค่าต่างๆ
              </p>
            </div>
            
            {isPro && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full">
                <SparklesIcon className="w-5 h-5" />
                <span className="font-semibold">PRO Member</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isPro && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-6 text-white"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <SparklesIcon className="w-6 h-6" />
                  ปลดล็อกฟีเจอร์พิเศษกับ PRO
                </h3>
                <p className="text-white/90 mb-4">
                  Auto Reply อัตโนมัติ, วิเคราะห์ขั้นสูง, และอีกมากมาย
                </p>
                <Link
                  href="/merchant/upgrade"
                  className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                  อัพเกรดเป็น PRO
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Categories */}
        <div className="space-y-8">
          {settingsCategories.map((category, categoryIdx) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIdx * 0.1 }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {category.title}
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                {category.items.map((item, itemIdx) => {
                  const IconComponent = item.icon;
                  const isDisabled = ('proOnly' in item && item.proOnly) && !isPro;

                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: itemIdx * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        relative bg-white rounded-xl p-6 shadow-sm border-2 text-left
                        transition-all duration-200
                        ${isDisabled 
                          ? 'border-gray-200 opacity-60 cursor-not-allowed' 
                          : 'border-gray-200 hover:border-orange-300 hover:shadow-md cursor-pointer'
                        }
                      `}
                      type="button"
                    >
                      {/* Icon Badge */}
                      <div className={`
                        inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4
                        bg-gradient-to-r ${item.color}
                      `}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>

                      {/* Badge */}
                      {item.badge && (
                        <span className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}

                      {/* Content */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {item.description}
                      </p>

                      {/* Action */}
                      <div className="flex items-center justify-between">
                        {isDisabled ? (
                          <span className="text-orange-600 text-sm font-medium">
                            ต้องเป็น PRO
                          </span>
                        ) : (
                          <span className="text-orange-600 text-sm font-medium">
                            ตั้งค่า
                          </span>
                        )}
                        <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <Link
            href="/merchant/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            กลับไปแดชบอร์ด
          </Link>
        </div>
      </div>
    </div>
  );
}
