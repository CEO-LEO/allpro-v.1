import { useSettingsStore, Language } from '@/store/useSettingsStore';

// ============================================================================
// TRANSLATION DICTIONARIES
// ============================================================================

type TranslationKey = string;
type TranslationDict = Record<TranslationKey, string>;

const translations: Record<Language, TranslationDict> = {
  // ============================================================================
  // THAI (TH)
  // ============================================================================
  th: {
    // Navigation
    'nav.home': 'หน้าแรก',
    'nav.map': 'แผนที่',
    'nav.wallet': 'กระเป๋า',
    'nav.profile': 'โปรไฟล์',
    'nav.chat': 'แชท',
    'nav.notifications': 'แจ้งเตือน',

    // Common Actions
    'btn.confirm': 'ยืนยัน',
    'btn.cancel': 'ยกเลิก',
    'btn.save': 'บันทึก',
    'btn.close': 'ปิด',
    'btn.loading': 'กำลังโหลด...',
    'btn.share': 'แชร์',
    'btn.redeem': 'ใช้สิทธิ์',
    'btn.viewDetails': 'ดูรายละเอียด',
    'btn.filter': 'กรอง',
    'btn.search': 'ค้นหา',
    'btn.startHunting': 'เริ่มล่า!',

    // Hero Section
    'hero.title': 'ล่าโปรเด็ดทั่วไทย',
    'hero.subtitle': 'เช็กสต็อกแบบเรียลไทม์ พร้อมคูปองส่วนลดเพียบ',
    'hero.cta': 'เริ่มต้นล่าเลย',

    // Product Card
    'product.discount': 'ลด',
    'product.soldOut': 'ขายหมดแล้ว',
    'product.inStock': 'มีของ',
    'product.review': 'รีวิว',
    'product.reviews': 'รีวิว',
    'product.distance': 'ระยะทาง',
    'product.expiresIn': 'หมดอายุใน',

    // Chatbot
    'chat.greeting': 'สวัสดีครับ! หาอะไรกินดี?',
    'chat.placeholder': 'พิมพ์ข้อความ...',
    'chat.thinking': 'กำลังคิด...',
    'chat.surpriseMe': 'แนะนำให้หน่อย',
    'chat.nearMe': 'ใกล้ๆ ฉัน',

    // Gamification
    'game.points': 'แต้ม',
    'game.level': 'เลเวล',
    'game.badge': 'ตรา',
    'game.badges': 'ตรา',
    'game.rank': 'อันดับ',
    'game.earnPoints': 'ได้รับแต้ม',
    'game.levelUp': 'เลเวลอัพ!',
    'game.achievementUnlocked': 'ปลดล็อคความสำเร็จ!',

    // Settings
    'settings.title': 'ตั้งค่า',
    'settings.language': 'ภาษา',
    'settings.theme': 'ธีม',
    'settings.notifications': 'การแจ้งเตือน',
    'settings.sound': 'เสียง',
    'settings.light': 'สว่าง',
    'settings.dark': 'มืด',

    // Empty States
    'empty.wallet': 'กระเป๋าคุณยังว่างเปล่า...',
    'empty.walletCta': 'มาหาคูปองดีๆ กันเถอะ!',
    'empty.chat': 'ฉันเหงา...',
    'empty.chatCta': 'ลองถามฉันเกี่ยวกับพิซซ่า ซูชิ หรืออะไรก็ได้!',
    'empty.notifications': 'ยังไม่มีการแจ้งเตือน',
    'empty.badges': 'ยังไม่มี Badge',

    // Welcome Tour
    'tour.welcome.title': 'Hunter, ยินดีต้อนรับสู่เวทีการต่อสู้!',
    'tour.welcome.desc': 'ยินดีต้อนรับสู่แพลตฟอร์มล่าโปรที่ดีที่สุด! เราจะช่วยคุณเจอดีลเทพๆ แบบเรียลไทม์',
    'tour.ai.title': 'อย่าค้นหา แค่ถาม',
    'tour.ai.desc': 'อย่าเสียเวลาค้นหา! ใช้ AI Chatbot ถามอะไรก็ได้ "หาซูชิใกล้ๆ" แล้วปล่อยให้เราจัดการ',
    'tour.game.title': 'เล่นและรับรางวัล ได้อาหารฟรี',
    'tour.game.desc': 'สะสมแต้ม ปลดล็อค Badge และขึ้นเลเวล! ยิ่งใช้บ่อย ยิ่งได้ของฟรี',
    'tour.next': 'ต่อไป',
    'tour.back': 'ย้อนกลับ',
    'tour.skip': 'ข้าม',

    // Wallet
    'wallet.myCoupons': 'คูปองของฉัน',
    'wallet.noCoupons': 'ยังไม่มีคูปอง',
    'wallet.findDeals': 'หาดีล',

    // Profile
    'profile.myProfile': 'โปรไฟล์ของฉัน',
    'profile.editProfile': 'แก้ไขโปรไฟล์',
    'profile.stats': 'สถิติ',
    'profile.achievements': 'ความสำเร็จ',

    // Filters
    'filter.all': 'ทั้งหมด',
    'filter.food': 'อาหาร',
    'filter.drinks': 'เครื่องดื่ม',
    'filter.shopping': 'ช้อปปิ้ง',
    'filter.entertainment': 'บันเทิง',
    'filter.nearby': 'ใกล้ฉัน',
    'filter.proBadge': 'PRO เท่านั้น',

    // Time
    'time.now': 'ตอนนี้',
    'time.today': 'วันนี้',
    'time.yesterday': 'เมื่อวาน',
    'time.daysAgo': 'วันที่แล้ว',
    'time.hoursAgo': 'ชั่วโมงที่แล้ว',
    'time.minutesAgo': 'นาทีที่แล้ว',

    // Status
    'status.loading': 'กำลังโหลด...',
    'status.error': 'เกิดข้อผิดพลาด',
    'status.success': 'สำเร็จ!',
    'status.noInternet': 'ไม่มีอินเทอร์เน็ต',
  },

  // ============================================================================
  // ENGLISH (EN)
  // ============================================================================
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.map': 'Map',
    'nav.wallet': 'Wallet',
    'nav.profile': 'Profile',
    'nav.chat': 'Chat',
    'nav.notifications': 'Notifications',

    // Common Actions
    'btn.confirm': 'Confirm',
    'btn.cancel': 'Cancel',
    'btn.save': 'Save',
    'btn.close': 'Close',
    'btn.loading': 'Loading...',
    'btn.share': 'Share',
    'btn.redeem': 'Redeem',
    'btn.viewDetails': 'View Details',
    'btn.filter': 'Filter',
    'btn.search': 'Search',
    'btn.startHunting': 'Start Hunting!',

    // Hero Section
    'hero.title': 'Hunt Best Deals in Thailand',
    'hero.subtitle': 'Real-time stock check with tons of coupons',
    'hero.cta': 'Start Hunting Now',

    // Product Card
    'product.discount': 'OFF',
    'product.soldOut': 'Sold Out',
    'product.inStock': 'In Stock',
    'product.review': 'Review',
    'product.reviews': 'Reviews',
    'product.distance': 'Distance',
    'product.expiresIn': 'Expires in',

    // Chatbot
    'chat.greeting': 'Hello! What are you hungry for?',
    'chat.placeholder': 'Type a message...',
    'chat.thinking': 'Thinking...',
    'chat.surpriseMe': 'Surprise Me',
    'chat.nearMe': 'Near Me',

    // Gamification
    'game.points': 'Points',
    'game.level': 'Level',
    'game.badge': 'Badge',
    'game.badges': 'Badges',
    'game.rank': 'Rank',
    'game.earnPoints': 'Earned Points',
    'game.levelUp': 'Level Up!',
    'game.achievementUnlocked': 'Achievement Unlocked!',

    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.notifications': 'Notifications',
    'settings.sound': 'Sound',
    'settings.light': 'Light',
    'settings.dark': 'Dark',

    // Empty States
    'empty.wallet': 'Your wallet is light...',
    'empty.walletCta': "Let's fill it up with amazing deals!",
    'empty.chat': "I'm lonely...",
    'empty.chatCta': 'Ask me about Pizza, Sushi, or anything!',
    'empty.notifications': 'No notifications yet',
    'empty.badges': 'No badges yet',

    // Welcome Tour
    'tour.welcome.title': 'Hunter, Welcome to the Arena!',
    'tour.welcome.desc': 'Welcome to the best promo hunting platform! We will help you find epic deals in real-time',
    'tour.ai.title': "Don't Search. Just Ask.",
    'tour.ai.desc': "Don't waste time searching! Use AI Chatbot to ask anything like 'Find sushi nearby' and let us handle it",
    'tour.game.title': 'Play & Earn. Get Free Food.',
    'tour.game.desc': 'Collect points, unlock badges, and level up! The more you use, the more free stuff you get',
    'tour.next': 'Next',
    'tour.back': 'Back',
    'tour.skip': 'Skip',

    // Wallet
    'wallet.myCoupons': 'My Coupons',
    'wallet.noCoupons': 'No coupons yet',
    'wallet.findDeals': 'Find Deals',

    // Profile
    'profile.myProfile': 'My Profile',
    'profile.editProfile': 'Edit Profile',
    'profile.stats': 'Stats',
    'profile.achievements': 'Achievements',

    // Filters
    'filter.all': 'All',
    'filter.food': 'Food',
    'filter.drinks': 'Drinks',
    'filter.shopping': 'Shopping',
    'filter.entertainment': 'Entertainment',
    'filter.nearby': 'Nearby',
    'filter.proBadge': 'PRO Only',

    // Time
    'time.now': 'Now',
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.daysAgo': 'days ago',
    'time.hoursAgo': 'hours ago',
    'time.minutesAgo': 'minutes ago',

    // Status
    'status.loading': 'Loading...',
    'status.error': 'Error occurred',
    'status.success': 'Success!',
    'status.noInternet': 'No internet connection',
  },
};

// ============================================================================
// HOOK
// ============================================================================

export function useTranslation() {
  const language = useSettingsStore((state) => state.language);

  const t = (key: TranslationKey): string => {
    const currentDict = translations[language];
    const fallbackDict = translations['en'];

    // Try current language first
    if (currentDict[key]) {
      return currentDict[key];
    }

    // Fallback to English
    if (fallbackDict[key]) {
      console.warn(`Translation missing for key "${key}" in language "${language}", using fallback`);
      return fallbackDict[key];
    }

    // Last resort: return the key itself
    console.error(`Translation missing for key "${key}" in all languages`);
    return key;
  };

  return { t, language };
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type { TranslationKey, Language };
