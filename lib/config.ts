// Centralized configuration for external service URLs
export const FASTWORK_URLS = {
  // Main category for "General Admin" (Admin ทั่วไป)
  GENERAL_ADMIN: 'https://fastwork.co/general-admin',
  
  // Specific category for "Messenger/Runner" (แมสเซนเจอร์/วิ่งงาน)
  MESSENGER: 'https://fastwork.co/messenger',
  
  // Queue Service
  QUEUE_SERVICE: 'https://fastwork.co/queue-service',
  
  // Fastwork Favicon for UI
  FAVICON: 'https://fastwork.co/favicon.ico',

  // Additional Services
  SHOPPING_SERVICE: 'https://fastwork.co/shopping-service',
  FOOD_DELIVERY: 'https://fastwork.co/food-delivery',
  TOUR_BOOKING: 'https://fastwork.co/tour-booking',
  ONLINE_COURSES: 'https://fastwork.co/online-courses',
  SPA_BOOKING: 'https://fastwork.co/spa-booking',
  HOTEL_BOOKING: 'https://fastwork.co/hotel-booking',
  CLEANING_SERVICE: 'https://fastwork.co/cleaning-service',

  // Default fallback if service_url is missing
  DEFAULT: 'https://fastwork.co/general-admin',
} as const;

export const MERCHANT_DASHBOARD_CONFIG = {
  // Refresh interval for stats (ms)
  STATS_REFRESH_INTERVAL: 60000,
  
  // Pagination limit
  PROMOTIONS_PER_PAGE: 20,
};
