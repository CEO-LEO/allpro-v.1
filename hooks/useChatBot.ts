'use client';

import { useState, useCallback } from 'react';

/**
 * AI Chatbot Hook - The "Brain" with PRO Merchant Priority
 * 
 * This is a Search Engine with Business Logic:
 * - PRO merchants ALWAYS rank first
 * - Distance-based sorting within each tier
 * - Smart keyword matching
 * - Special commands for engagement
 */

export interface Product {
  id: string;
  name: string;
  shopName: string;
  category: string;
  distance: number; // in km
  isPro: boolean;
  discount: string;
  image?: string;
  originalPrice?: number;
  salePrice?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  products?: Product[];
  isTyping?: boolean;
}

// Mock Database - Simulating real product data
const MOCK_PRODUCTS: Product[] = [
  // PRO MERCHANTS (Priority Tier)
  {
    id: 'p1',
    name: 'Premium Sushi Set',
    shopName: '🌟 Sushi Master PRO',
    category: 'Japanese',
    distance: 0.8,
    isPro: true,
    discount: '-50%',
    originalPrice: 599,
    salePrice: 299,
  },
  {
    id: 'p2',
    name: 'Artisan Coffee Bundle',
    shopName: '🌟 Cafe Latte PRO',
    category: 'Beverage',
    distance: 1.2,
    isPro: true,
    discount: '-40%',
    originalPrice: 250,
    salePrice: 150,
  },
  {
    id: 'p3',
    name: 'Wagyu Burger Combo',
    shopName: '🌟 Burger Kingdom PRO',
    category: 'Fast Food',
    distance: 0.5,
    isPro: true,
    discount: '-35%',
    originalPrice: 450,
    salePrice: 293,
  },
  {
    id: 'p4',
    name: 'Thai Milk Tea Special',
    shopName: '🌟 Tea Time PRO',
    category: 'Beverage',
    distance: 0.3,
    isPro: true,
    discount: '-25%',
    originalPrice: 80,
    salePrice: 60,
  },
  {
    id: 'p5',
    name: 'Premium Pizza Margherita',
    shopName: '🌟 Pizza Palace PRO',
    category: 'Italian',
    distance: 2.1,
    isPro: true,
    discount: '-45%',
    originalPrice: 399,
    salePrice: 219,
  },

  // FREE MERCHANTS (Standard Tier)
  {
    id: 'f1',
    name: 'Regular Sushi Platter',
    shopName: 'Sushi Express',
    category: 'Japanese',
    distance: 0.4,
    isPro: false,
    discount: '-30%',
    originalPrice: 399,
    salePrice: 279,
  },
  {
    id: 'f2',
    name: 'Classic Coffee',
    shopName: 'Coffee Corner',
    category: 'Beverage',
    distance: 0.6,
    isPro: false,
    discount: '-20%',
    originalPrice: 120,
    salePrice: 96,
  },
  {
    id: 'f3',
    name: 'Cheese Burger',
    shopName: 'Quick Bites',
    category: 'Fast Food',
    distance: 1.5,
    isPro: false,
    discount: '-15%',
    originalPrice: 159,
    salePrice: 135,
  },
  {
    id: 'f4',
    name: 'Thai Iced Tea',
    shopName: 'Tea House',
    category: 'Beverage',
    distance: 2.0,
    isPro: false,
    discount: '-10%',
    originalPrice: 50,
    salePrice: 45,
  },
  {
    id: 'f5',
    name: 'Pepperoni Pizza',
    shopName: 'Pizza Hut Express',
    category: 'Italian',
    distance: 3.2,
    isPro: false,
    discount: '-25%',
    originalPrice: 299,
    salePrice: 224,
  },
  {
    id: 'f6',
    name: 'Pad Thai',
    shopName: 'Thai Street Food',
    category: 'Thai',
    distance: 1.1,
    isPro: false,
    discount: '-20%',
    originalPrice: 89,
    salePrice: 71,
  },
  {
    id: 'f7',
    name: 'Green Curry',
    shopName: 'Bangkok Kitchen',
    category: 'Thai',
    distance: 1.8,
    isPro: false,
    discount: '-15%',
    originalPrice: 120,
    salePrice: 102,
  },
];

export function useChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: '👋 สวัสดีค่ะ! ฉันคือ AI ช่วยค้นหาโปรโมชั่น ✨\n\nลองถามฉันสิ:\n• "หาซูชิให้หน่อย"\n• "Surprise Me"\n• "Near Me"\n• "Coffee"',
      timestamp: new Date(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  /**
   * Core AI Logic: Process user message and return relevant products
   */
  const processMessage = useCallback(async (query: string): Promise<void> => {
    const lowerQuery = query.toLowerCase().trim();

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    // Simulate "Thinking..." delay (1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let botResponse: ChatMessage;

    // ═══════════════════════════════════════════════════════════
    // SPECIAL COMMANDS
    // ═══════════════════════════════════════════════════════════

    if (lowerQuery === 'surprise me' || lowerQuery === 'แปลก') {
      botResponse = handleSurpriseMe();
    } else if (lowerQuery === 'near me' || lowerQuery.includes('ใกล้')) {
      botResponse = handleNearMe();
    } else {
      // ═══════════════════════════════════════════════════════════
      // STANDARD SEARCH FLOW
      // ═══════════════════════════════════════════════════════════
      botResponse = handleSearch(lowerQuery);
    }

    setMessages((prev) => [...prev, botResponse]);
    setIsThinking(false);
  }, []);

  /**
   * STEP 1: Keyword Matching - Filter products
   */
  const filterProducts = (query: string): Product[] => {
    return MOCK_PRODUCTS.filter((product) => {
      const searchableText =
        `${product.name} ${product.shopName} ${product.category}`.toLowerCase();
      return searchableText.includes(query);
    });
  };

  /**
   * STEP 2: The "Business Sort" - THE MONEY MAKER 💰
   * 
   * Primary Sort: isPro === true comes FIRST
   * Secondary Sort: distance (lowest first)
   */
  const businessSort = (products: Product[]): Product[] => {
    return [...products].sort((a, b) => {
      // PRIMARY: PRO merchants first
      if (a.isPro && !b.isPro) return -1;
      if (!a.isPro && b.isPro) return 1;

      // SECONDARY: Distance (within same tier)
      return a.distance - b.distance;
    });
  };

  /**
   * STEP 3: Standard Search Handler
   */
  const handleSearch = (query: string): ChatMessage => {
    // Filter matching products
    const matchedProducts = filterProducts(query);

    if (matchedProducts.length === 0) {
      // No results found
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `😅 ขอโทษค่ะ ไม่เจอโปรโมชั่น "${query}"\n\nลองคำอื่นนะคะ:\n• "Sushi"\n• "Coffee"\n• "Burger"\n• "Pizza"`,
        timestamp: new Date(),
      };
    }

    // Apply business sorting
    const sortedProducts = businessSort(matchedProducts);

    // Get top 5 results
    const topResults = sortedProducts.slice(0, 5);

    // Get top PRO shop (for personalized message)
    const topProShop = topResults.find((p) => p.isPro);

    let responseText = '';
    if (topProShop) {
      responseText = `✨ เจอแล้ว ${matchedProducts.length} ดีล!\n\n🌟 แนะนำ PRO: ${topProShop.shopName}\n💰 ${topProShop.discount} จาก ฿${topProShop.originalPrice}\n📍 ห่างแค่ ${topProShop.distance} km`;
    } else {
      responseText = `พบ ${matchedProducts.length} ดีลสำหรับคุณ! ✨\n\n📍 ร้านที่ใกล้ที่สุด: ${topResults[0].shopName} (${topResults[0].distance} km)`;
    }

    return {
      id: Date.now().toString(),
      sender: 'bot',
      text: responseText,
      timestamp: new Date(),
      products: topResults,
    };
  };

  /**
   * Special Command: "Surprise Me" 🎉
   * Pick 1 random PRO deal
   */
  const handleSurpriseMe = (): ChatMessage => {
    const proDeals = MOCK_PRODUCTS.filter((p) => p.isPro);
    const randomDeal = proDeals[Math.floor(Math.random() * proDeals.length)];

    return {
      id: Date.now().toString(),
      sender: 'bot',
      text: `🎉 แปลกใจไปเลย!\n\n✨ Special Pick: ${randomDeal.shopName}\n💎 ${randomDeal.name}\n🔥 ${randomDeal.discount} - ประหยัด ฿${(randomDeal.originalPrice || 0) - (randomDeal.salePrice || 0)}!\n📍 ห่างแค่ ${randomDeal.distance} km`,
      timestamp: new Date(),
      products: [randomDeal],
    };
  };

  /**
   * Special Command: "Near Me" 📍
   * Sort by distance, but boost PRO shops within 1km
   */
  const handleNearMe = (): ChatMessage => {
    // Sort with PRO boost for nearby shops
    const sortedByDistance = [...MOCK_PRODUCTS].sort((a, b) => {
      // Boost: PRO shops within 1km get priority
      const aScore = a.isPro && a.distance <= 1.0 ? a.distance - 0.5 : a.distance;
      const bScore = b.isPro && b.distance <= 1.0 ? b.distance - 0.5 : b.distance;
      return aScore - bScore;
    });

    const nearbyDeals = sortedByDistance.slice(0, 5);
    const closestDeal = nearbyDeals[0];

    return {
      id: Date.now().toString(),
      sender: 'bot',
      text: `📍 ร้านใกล้คุณที่สุด!\n\n${closestDeal.isPro ? '🌟 PRO Shop: ' : ''}${closestDeal.shopName}\n💰 ${closestDeal.discount} - ${closestDeal.name}\n📏 ห่าง ${closestDeal.distance} km`,
      timestamp: new Date(),
      products: nearbyDeals,
    };
  };

  /**
   * Clear chat history
   */
  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        sender: 'bot',
        text: '👋 เริ่มใหม่! พร้อมช่วยค้นหาดีลให้คุณแล้ว ✨',
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    messages,
    isThinking,
    processMessage,
    clearChat,
  };
}

/**
 * ALGORITHM SUMMARY:
 * 
 * 1. KEYWORD MATCHING
 *    - Search in: name, shopName, category
 *    - Case-insensitive matching
 * 
 * 2. BUSINESS SORT (The Money Maker 💰)
 *    - Primary: isPro = true → FIRST
 *    - Secondary: distance (lowest → highest)
 *    - Result: PRO merchants always win!
 * 
 * 3. RESPONSE GENERATION
 *    - Found: Show top 5, highlight PRO shop
 *    - Not Found: Suggest alternatives
 *    - Special: "Surprise Me" → Random PRO deal
 *    - Special: "Near Me" → Distance sort with PRO boost
 * 
 * 4. BUSINESS IMPACT
 *    - PRO merchants get maximum visibility
 *    - Users see best deals first (PRO + nearby)
 *    - Clear incentive for merchants to upgrade
 *    - ROI: 5,075% (from PRO_TIER_SUBSCRIPTION.md)
 */
