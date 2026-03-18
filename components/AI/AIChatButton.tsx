'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, TrendingUp, MapPin, ShoppingBag, Gift } from 'lucide-react';
import { useChatBot } from '@/hooks/useChatBot';
import { useGamification } from '@/hooks/useGamification';
import toast from 'react-hot-toast';

// Mock deal type for AI chat search results
interface MockDeal {
  title: string;
  discount_rate: number;
  final_price: number;
  shop_name: string;
  distance: number;
  description: string;
}

const MOCK_DEALS: MockDeal[] = [
  { title: 'Premium Sushi Set', discount_rate: 50, final_price: 299, shop_name: 'Sushi Master', distance: 0.8, description: 'เซ็ตซูชิพรีเมียม 10 ชิ้น' },
  { title: 'Artisan Coffee Bundle', discount_rate: 40, final_price: 150, shop_name: 'Cafe Latte', distance: 1.2, description: 'เซ็ตกาแฟคราฟท์ 3 แก้ว' },
  { title: 'Wagyu Burger Combo', discount_rate: 35, final_price: 293, shop_name: 'Burger Kingdom', distance: 0.5, description: 'เบอร์เกอร์วากิวพร้อมเฟรนช์ฟรายส์' },
  { title: 'Thai Milk Tea Special', discount_rate: 25, final_price: 45, shop_name: 'Tea Time', distance: 0.3, description: 'ชานมไทยสูตรพิเศษ' },
  { title: 'Pizza Party Set', discount_rate: 30, final_price: 399, shop_name: 'Pizza Place', distance: 1.5, description: 'พิซซ่า 2 ถาด + เครื่องดื่ม 4 แก้ว' },
];

function getSurpriseMe(): MockDeal {
  return MOCK_DEALS[Math.floor(Math.random() * MOCK_DEALS.length)];
}

function searchDeals(query: string, _options: Record<string, string>): MockDeal[] {
  if (!query) return MOCK_DEALS;
  const q = query.toLowerCase();
  const filtered = MOCK_DEALS.filter(d =>
    d.title.toLowerCase().includes(q) ||
    d.shop_name.toLowerCase().includes(q) ||
    d.description.toLowerCase().includes(q)
  );
  return filtered.length > 0 ? filtered : MOCK_DEALS.slice(0, 2);
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  suggestions?: string[];
  products?: any[];
}

export default function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { earnPoints } = useGamification();

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage(
          'สวัสดีครับ! 👋 ผมคือ AI ช่วยหาโปรโมชั่น\n\nพิมพ์สิ่งที่คุณต้องการ หรือเลือกจากคำแนะนำด้านล่างเลย!',
          [
            '🍕 หาอาหารใกล้ๆ',
            '🎁 โปรเซอร์ไพรส์',
            '💰 ส่วนลดสูงสุด',
            '🏪 7-11 ใกล้ฉัน'
          ]
        );
      }, 500);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (text: string, suggestions?: string[], products?: any[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      text,
      timestamp: new Date(),
      suggestions,
      products,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const processMessage = async (userInput: string) => {
    const input = userInput.toLowerCase();
    
    setIsTyping(true);
    
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Award points for using chat
    earnPoints('USE_CHAT');

    // Handle different intents
    if (input.includes('ใกล้') || input.includes('near') || input.includes('7-11') || input.includes('เซเว่น')) {
      const nearbyResults: any[] = []; // Mock data
      if (nearbyResults.length > 0) {
        addBotMessage(
          `🎯 เจอแล้วครับ! มี ${nearbyResults.length} โปรโมชั่นใกล้คุณ:\n\n` +
          nearbyResults.slice(0, 3).map((p: any, i: number) => 
            `${i + 1}. ${p.title}\n   💰 ลด ${p.discount_rate}% | 📍 ${p.distance} km`
          ).join('\n\n'),
          ['ดูทั้งหมด', 'หาโปรอื่น', 'เซอร์ไพรส์ฉัน']
        );
      } else {
        addBotMessage(
          'ขออภัยครับ ไม่พบโปรโมชั่นใกล้ๆ คุณในขณะนี้ 😢\n\nลองค้นหาประเภทอื่นไหมครับ?',
          ['อาหาร', 'เครื่องดื่ม', 'ช้อปปิ้ง']
        );
      }
    }
    else if (input.includes('เซอร์ไพรส์') || input.includes('surprise') || input.includes('สุ่ม')) {
      const surprise = getSurpriseMe();
      if (surprise) {
        addBotMessage(
          `🎲 เซอร์ไพรส์! คุณโชคดีวันนี้:\n\n${surprise.title}\n\n💰 ส่วนลด ${surprise.discount_rate}%\n🏪 ${surprise.shop_name}\n📍 ${surprise.distance} km\n\n${surprise.description}`,
          ['เซอร์ไพรส์อีก!', 'ดูรายละเอียด', 'หาแบบนี้อีก']
        );
      }
    }
    else if (input.includes('ส่วนลด') || input.includes('ลด') || input.includes('discount')) {
      const deals = searchDeals('', { sortBy: 'discount' });
      const topDeals = deals.slice(0, 3);
      addBotMessage(
        `🔥 ส่วนลดสูงสุดตอนนี้:\n\n` +
        topDeals.map((p, i) => 
          `${i + 1}. ${p.title}\n   💥 ลด ${p.discount_rate}%! (เหลือ ${p.final_price}฿)\n   🏪 ${p.shop_name}`
        ).join('\n\n'),
        ['ดูทั้งหมด', 'หาโปรอื่น']
      );
    }
    else if (input.includes('อาหาร') || input.includes('food') || input.includes('กิน')) {
      const foodDeals = searchDeals('food', { category: 'food' });
      if (foodDeals.length > 0) {
        addBotMessage(
          `🍔 พบโปรอาหาร ${foodDeals.length} รายการ:\n\n` +
          foodDeals.slice(0, 3).map((p, i) => 
            `${i + 1}. ${p.title}\n   💰 ${p.discount_rate}% | 📍 ${p.distance} km`
          ).join('\n\n'),
          ['ดูทั้งหมด', 'ใกล้ฉัน', 'อาหารญี่ปุ่น']
        );
      }
    }
    else if (input.includes('เครื่องดื่ม') || input.includes('drink') || input.includes('กาแฟ') || input.includes('coffee')) {
      const drinkDeals = searchDeals('drink', { category: 'drinks' });
      addBotMessage(
        `☕ โปรเครื่องดื่มสุดคุ้ม:\n\n` +
        drinkDeals.slice(0, 3).map((p, i) => 
          `${i + 1}. ${p.title}\n   💰 ลด ${p.discount_rate}%`
        ).join('\n\n'),
        ['ดูเพิ่ม', 'สตาร์บัคส์', 'คาเฟ่อเมซอน']
      );
    }
    else {
      // General search
      const results = searchDeals(input, {});
      if (results.length > 0) {
        addBotMessage(
          `🔍 พบ ${results.length} รายการที่เกี่ยวข้องกับ "${userInput}":\n\n` +
          results.slice(0, 3).map((p, i) => 
            `${i + 1}. ${p.title}\n   💰 ลด ${p.discount_rate}% | 📍 ${p.distance} km`
          ).join('\n\n'),
          ['ดูทั้งหมด', 'หาโปรอื่น', 'โปรใกล้ฉัน']
        );
      } else {
        addBotMessage(
          `ไม่พบโปรที่ตรงกับ "${userInput}" 😢\n\nลองคำค้นหาอื่นไหมครับ?`,
          ['อาหาร', 'เครื่องดื่ม', 'ช้อปปิ้ง', 'ใกล้ฉัน']
        );
      }
    }

    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    addUserMessage(input);
    const userInput = input;
    setInput('');
    
    await processMessage(userInput);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    addUserMessage(suggestion);
    await processMessage(suggestion);
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => {
              setIsOpen(true);
              toast.success('AI ตัวช่วยพร้อมแล้ว! 🤖');
            }}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full p-4 shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 group"
          >
            <MessageCircle className="w-6 h-6" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
            />
            <div className="absolute -top-12 right-0 bg-black text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              หาโปรด้วย AI! ✨
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">AI ช่วยหาโปร</h3>
                  <p className="text-xs text-purple-100">ออนไลน์</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`p-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-white text-gray-900 rounded-bl-none shadow-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                    
                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-200 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="พิมพ์ข้อความ..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
