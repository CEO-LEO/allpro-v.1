'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { Settings, Globe, Palette } from 'lucide-react';
import SettingsMenu from '@/components/Layout/SettingsMenu';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function I18nDemoPage() {
  const [showSettings, setShowSettings] = useState(false);
  const { t, language } = useTranslation();
  const { theme } = useSettingsStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-bg dark:to-dark-surface transition-colors duration-300">
      <Toaster position="top-center" richColors />

      {/* Settings Modal */}
      <SettingsMenu isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Header */}
      <header className="glass-auto border-b border-gray-200 dark:border-dark-border sticky top-0 z-40 transition-colors duration-300">
        <div className="container-responsive py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 text-gray-900 dark:text-white">
                🌍 i18n & Theme Demo
              </h1>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">
                {language === 'th' ? 'รองรับหลายภาษาและธีม' : 'Multi-language & Theme Support'}
              </p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-full font-semibold shadow-lg transition-all press-effect"
            >
              <Settings className="w-5 h-5" />
              {t('settings.title')}
            </button>
          </div>
        </div>
      </header>

      <main className="container-responsive py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Current Settings Display */}
          <div className="space-y-6">
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'th' ? 'การตั้งค่าปัจจุบัน' : 'Current Settings'}
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-50 to-orange-50 dark:from-brand-900/10 dark:to-orange-900/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('settings.language')}
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {language === 'th' ? '🇹🇭 ไทย' : '🇬🇧 English'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('settings.theme')}
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {theme === 'light' ? `☀️ ${t('settings.light')}` : `🌙 ${t('settings.dark')}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Translation Examples */}
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'th' ? 'ตัวอย่างการแปล' : 'Translation Examples'}
              </h2>

              <div className="space-y-3">
                <TranslationItem label="Navigation - Home" value={t('nav.home')} />
                <TranslationItem label="Navigation - Map" value={t('nav.map')} />
                <TranslationItem label="Navigation - Wallet" value={t('nav.wallet')} />
                <TranslationItem label="Button - Confirm" value={t('btn.confirm')} />
                <TranslationItem label="Button - Cancel" value={t('btn.cancel')} />
                <TranslationItem label="Button - Share" value={t('btn.share')} />
                <TranslationItem label="Hero - Title" value={t('hero.title')} />
                <TranslationItem label="Chat - Greeting" value={t('chat.greeting')} />
                <TranslationItem label="Game - Level Up" value={t('game.levelUp')} />
              </div>
            </motion.div>
          </div>

          {/* Right: UI Component Examples */}
          <div className="space-y-6">
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'th' ? 'ตัวอย่าง UI Components' : 'UI Component Examples'}
              </h2>

              <div className="space-y-4">
                {/* Navigation Bar Example */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                    {language === 'th' ? 'แถบนำทาง' : 'Navigation Bar'}
                  </h3>
                  <div className="flex items-center justify-around">
                    <NavItem icon="🏠" label={t('nav.home')} />
                    <NavItem icon="🗺️" label={t('nav.map')} />
                    <NavItem icon="💳" label={t('nav.wallet')} />
                    <NavItem icon="👤" label={t('nav.profile')} />
                  </div>
                </div>

                {/* Buttons Example */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                    {language === 'th' ? 'ปุ่ม' : 'Buttons'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-brand-500 text-white rounded-full text-button press-effect">
                      {t('btn.confirm')}
                    </button>
                    <button className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-full text-button press-effect">
                      {t('btn.cancel')}
                    </button>
                    <button className="px-4 py-2 bg-green-500 text-white rounded-full text-button press-effect">
                      {t('btn.share')}
                    </button>
                    <button className="px-4 py-2 bg-purple-500 text-white rounded-full text-button press-effect">
                      {t('btn.redeem')}
                    </button>
                  </div>
                </div>

                {/* Product Card Example */}
                <div className="p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-soft">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                    {language === 'th' ? 'การ์ดสินค้า' : 'Product Card'}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-h4 text-gray-900 dark:text-white">
                        Sushi Buffet
                      </span>
                      <span className="px-3 py-1 bg-red-500 text-white text-body-sm rounded-full">
                        -50% {t('product.discount')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-body-sm text-gray-600 dark:text-gray-400">
                      <span>⭐ 4.8 (120 {t('product.reviews')})</span>
                      <span>•</span>
                      <span>📍 500m {t('product.distance')}</span>
                    </div>
                    <button className="w-full py-2 bg-brand-500 text-white rounded-xl font-semibold press-effect">
                      {t('btn.viewDetails')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Integration Code */}
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'th' ? 'วิธีใช้งาน' : 'How to Use'}
              </h2>

              <div className="p-4 bg-gray-900 rounded-xl overflow-x-auto">
                <code className="text-body-sm text-green-400">
                  {`import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <button>{t('btn.confirm')}</button>
    </div>
  );
}`}
                </code>
              </div>

              <div className="mt-4 p-4 bg-brand-50 dark:bg-brand-900/10 rounded-xl border border-brand-200 dark:border-brand-800">
                <h3 className="font-semibold text-sm text-brand-900 dark:text-brand-100 mb-2">
                  💡 {language === 'th' ? 'คุณสมบัติ' : 'Features'}
                </h3>
                <ul className="text-xs text-brand-700 dark:text-brand-300 space-y-1">
                  <li>• {language === 'th' ? 'รองรับ 2 ภาษา: ไทย และ อังกฤษ' : 'Supports 2 languages: Thai & English'}</li>
                  <li>• {language === 'th' ? 'Fallback เป็นภาษาอังกฤษอัตโนมัติ' : 'Auto-fallback to English'}</li>
                  <li>• {language === 'th' ? 'บันทึกการตั้งค่าใน localStorage' : 'Settings saved in localStorage'}</li>
                  <li>• {language === 'th' ? 'เปลี่ยนธีมได้ทันที (Light/Dark)' : 'Instant theme switching (Light/Dark)'}</li>
                  <li>• {language === 'th' ? 'Transition แบบ Smooth' : 'Smooth CSS transitions'}</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TranslationItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

function NavItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
      <div className="text-2xl">{icon}</div>
      <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</div>
    </div>
  );
}
