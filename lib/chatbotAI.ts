/**
 * AI Chatbot System with PRO Merchant Priority
 * 
 * This system ensures PRO merchants are recommended FIRST in search results,
 * creating strong incentive for merchants to upgrade.
 */

import { Promotion } from './types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendations?: SearchRecommendation[];
}

export interface SearchRecommendation {
  promo: Promotion;
  isPro: boolean;
  score: number;
  reason: string;
}

/**
 * Search and rank promotions with PRO priority
 * 
 * Algorithm:
 * 1. PRO merchants always rank higher (score boost: +1000)
 * 2. Within PRO tier: Sort by relevance + distance
 * 3. Within Free tier: Sort by relevance + distance
 * 4. Return PRO results first, then Free results
 */
export function searchWithPriorityRanking(
  query: string,
  allPromotions: Promotion[],
  userLocation?: { lat: number; lng: number }
): SearchRecommendation[] {
  const lowerQuery = query.toLowerCase();
  
  // Filter relevant promotions
  const relevantPromos = allPromotions.filter(promo => {
    const searchableText = `${promo.title} ${promo.description} ${promo.category} ${promo.shop_name}`.toLowerCase();
    return searchableText.includes(lowerQuery);
  });

  // Score each promotion
  const scoredResults = relevantPromos.map(promo => {
    let score = 0;
    
    // PRO BOOST: +1000 points (ensures PRO always ranks first)
    if (promo.isPro) {
      score += 1000;
    }
    
    // Title match (high weight)
    if (promo.title.toLowerCase().includes(lowerQuery)) {
      score += 100;
    }
    
    // Category match
    if (promo.category.toLowerCase().includes(lowerQuery)) {
      score += 50;
    }
    
    // Description match
    if (promo.description.toLowerCase().includes(lowerQuery)) {
      score += 30;
    }
    
    // Verified shops get slight boost
    if (promo.is_verified) {
      score += 10;
    }
    
    // Search volume (popularity)
    score += Math.log10(promo.search_volume || 1) * 5;
    
    // Distance scoring (if location provided)
    // TODO: Implement real distance calculation
    // For now, just add random variation
    score += Math.random() * 10;
    
    return {
      promo,
      isPro: promo.isPro || false,
      score,
      reason: promo.isPro ? '🌟 Premium Recommendation' : 'Recommended'
    };
  });

  // Sort by score (PRO will naturally be at top due to +1000 boost)
  scoredResults.sort((a, b) => b.score - a.score);
  
  return scoredResults;
}

/**
 * Generate AI chatbot response with PRO merchant emphasis
 */
export function generateChatbotResponse(
  userMessage: string,
  searchResults: SearchRecommendation[]
): string {
  const proResults = searchResults.filter(r => r.isPro);
  const freeResults = searchResults.filter(r => !r.isPro);
  
  if (searchResults.length === 0) {
    return "ขออภัยค่ะ ไม่พบโปรโมชั่นที่ตรงกับที่คุณค้นหา ลองค้นหาด้วยคำอื่นดูไหมคะ? 🔍";
  }
  
  let response = "";
  
  // Emphasize PRO results if available
  if (proResults.length > 0) {
    response += `🌟 **พบ ${proResults.length} โปรโมชั่นแนะนำพิเศษ**สำหรับคุณ!\n\n`;
    response += `ร้านคุณภาพ PRO ที่เราแนะนำ:\n`;
    
    proResults.slice(0, 3).forEach((result, index) => {
      response += `${index + 1}. ✨ **${result.promo.shop_name}** - ${result.promo.title}\n`;
      response += `   💰 ราคา ${result.promo.price} บาท (ลด ${result.promo.discount_rate}%)\n`;
      response += `   📍 ${result.promo.location}\n\n`;
    });
  }
  
  // Show free results (if any)
  if (freeResults.length > 0) {
    if (proResults.length > 0) {
      response += `\n📋 โปรโมชั่นอื่นๆ ที่น่าสนใจ:\n\n`;
    } else {
      response += `พบ ${freeResults.length} โปรโมชั่นสำหรับคุณ:\n\n`;
    }
    
    freeResults.slice(0, 3).forEach((result, index) => {
      response += `${index + 1}. ${result.promo.shop_name} - ${result.promo.title}\n`;
      response += `   ราคา ${result.promo.price} บาท (ลด ${result.promo.discount_rate}%)\n\n`;
    });
  }
  
  response += `\n💡 คลิกดูรายละเอียดเพิ่มเติมได้เลยค่ะ!`;
  
  return response;
}

/**
 * Get AI chatbot reply for common questions
 */
export function getAIReply(userMessage: string, merchantId: string): string | null {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check if merchant is PRO
  const isPro = localStorage.getItem(`merchant_${merchantId}_isPro`) === 'true';
  
  if (!isPro) {
    return null; // Auto-reply only for PRO merchants
  }
  
  // Get merchant's custom answers
  const customAnswers = JSON.parse(
    localStorage.getItem(`merchant_${merchantId}_auto_replies`) || '{}'
  );
  
  // Check custom answers first
  for (const [keyword, answer] of Object.entries(customAnswers)) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      return answer as string;
    }
  }
  
  // Default auto-replies
  if (lowerMessage.includes('เปิด') || lowerMessage.includes('เวลา') || lowerMessage.includes('open')) {
    return customAnswers.hours || "เปิดทุกวันเวลา 10:00-22:00 น. ค่ะ 🕙";
  }
  
  if (lowerMessage.includes('ที่จอด') || lowerMessage.includes('parking')) {
    return customAnswers.parking || "มีที่จอดรถสะดวกค่ะ 🅿️";
  }
  
  if (lowerMessage.includes('จัดส่ง') || lowerMessage.includes('delivery')) {
    return customAnswers.delivery || "มีบริการจัดส่งผ่าน Grab/Lineman ค่ะ 🚗";
  }
  
  if (lowerMessage.includes('จอง') || lowerMessage.includes('reservation') || lowerMessage.includes('book')) {
    return customAnswers.reservation || "สามารถจองโต๊ะล่วงหน้าได้ค่ะ โทร 02-XXX-XXXX 📞";
  }
  
  if (lowerMessage.includes('ราคา') || lowerMessage.includes('price') || lowerMessage.includes('เท่าไหร่')) {
    return "ราคาเริ่มต้นตามโปรโมชั่นที่แสดงค่ะ สามารถดูรายละเอียดเพิ่มเติมได้ในหน้าสินค้า 💰";
  }
  
  return null; // No matching auto-reply
}

/**
 * Track chatbot interaction for analytics
 */
export function trackChatbotUsage(merchantId: string, type: 'search' | 'auto_reply') {
  const key = `merchant_${merchantId}_chatbot_stats`;
  const stats = JSON.parse(localStorage.getItem(key) || '{"searches": 0, "auto_replies": 0}');
  
  if (type === 'search') {
    stats.searches++;
  } else {
    stats.auto_replies++;
  }
  
  localStorage.setItem(key, JSON.stringify(stats));
}

/**
 * Calculate ROI for PRO subscription based on chatbot usage
 */
export function calculateChatbotROI(merchantId: string): {
  totalInteractions: number;
  estimatedValue: number;
  timeSaved: number; // in hours
} {
  const key = `merchant_${merchantId}_chatbot_stats`;
  const stats = JSON.parse(localStorage.getItem(key) || '{"searches": 0, "auto_replies": 0}');
  
  const totalInteractions = stats.searches + stats.auto_replies;
  
  // Assumptions:
  // - Each search = ฿50 potential value (10% conversion × ฿500 avg order)
  // - Each auto-reply = ฿100 potential value (saves time + improves response rate)
  // - Each auto-reply saves 5 minutes of manual work
  
  const estimatedValue = (stats.searches * 50) + (stats.auto_replies * 100);
  const timeSaved = (stats.auto_replies * 5) / 60; // Convert minutes to hours
  
  return {
    totalInteractions,
    estimatedValue,
    timeSaved
  };
}

/**
 * Mock data: PRO vs Free merchant performance comparison
 */
export function getPerformanceComparison() {
  return {
    pro: {
      avgViews: 3200,
      avgSales: 45000,
      conversionRate: 8.7,
      customerSatisfaction: 4.8
    },
    free: {
      avgViews: 1000,
      avgSales: 14000,
      conversionRate: 3.2,
      customerSatisfaction: 4.1
    }
  };
}
