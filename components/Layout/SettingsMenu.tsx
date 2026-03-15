'use client';

import { motion } from 'framer-motion';
import { X, Globe, Sun, Moon, Bell, Volume2, VolumeX } from 'lucide-react';
import { useSettingsStore, Language, Theme } from '@/store/useSettingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsMenu({ isOpen, onClose }: SettingsMenuProps) {
  const { t } = useTranslation();
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    notificationsEnabled,
    setNotificationsEnabled,
    soundEnabled,
    setSoundEnabled,
  } = useSettingsStore();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    toast.success(lang === 'th' ? 'เปลี่ยนภาษาเป็นไทยแล้ว' : 'Language changed to English');
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    toast.success(t('status.success'));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-md bg-white dark:bg-dark-surface rounded-3xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-brand-50 to-orange-50 dark:from-brand-900/10 dark:to-orange-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('settings.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Language Setting */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('settings.language')}
              </h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleLanguageChange('th')}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all press-effect
                  ${
                    language === 'th'
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="text-2xl">🇹🇭</span>
                <span>ไทย</span>
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all press-effect
                  ${
                    language === 'en'
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="text-2xl">🇬🇧</span>
                <span>EN</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-dark-border" />

          {/* Theme Setting */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              ) : (
                <Sun className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              )}
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('settings.theme')}
              </h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all press-effect
                  ${
                    theme === 'light'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Sun className="w-5 h-5" />
                <span>{t('settings.light')}</span>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all press-effect
                  ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Moon className="w-5 h-5" />
                <span>{t('settings.dark')}</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-dark-border" />

          {/* Toggle Settings */}
          <div className="space-y-4">
            {/* Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t('settings.notifications')}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {language === 'th' ? 'รับการแจ้งเตือนโปรโมชั่น' : 'Receive deal notifications'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`
                  relative w-14 h-8 rounded-full transition-colors press-effect
                  ${notificationsEnabled ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <motion.div
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ left: notificationsEnabled ? '28px' : '4px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t('settings.sound')}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {language === 'th' ? 'เสียงเอฟเฟกต์และแจ้งเตือน' : 'Sound effects and alerts'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`
                  relative w-14 h-8 rounded-full transition-colors press-effect
                  ${soundEnabled ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <motion.div
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ left: soundEnabled ? '28px' : '4px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-dark-border">
          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
            {language === 'th' 
              ? 'การตั้งค่าจะถูกบันทึกอัตโนมัติ'
              : 'Settings are saved automatically'
            }
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
