'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MapPin, Clock, CheckCircle } from 'lucide-react';
import { type PartyRoom } from '@/lib/partyUtils';

interface PartyChatProps {
  room: PartyRoom;
}

interface Message {
  id: string;
  sender: 'me' | 'partner';
  text: string;
  timestamp: Date;
  isQuickAction?: boolean;
}

const QUICK_ACTIONS = [
  { icon: '📍', text: "I'm at the cashier", action: 'cashier' },
  { icon: '🕒', text: "I'll be there in 5 mins", action: '5mins' },
  { icon: '👕', text: "I'm wearing a blue shirt", action: 'clothes' },
  { icon: '✅', text: "Ready to complete deal", action: 'ready' }
];

const BOT_RESPONSES: Record<string, string[]> = {
  cashier: [
    "Great! I'm walking to the cashier now.",
    "Perfect! I'll be there in 1 minute.",
    "Okay! I see you. Are you near the drink section?"
  ],
  '5mins': [
    "No problem! I'll wait for you.",
    "Sounds good! Take your time.",
    "Okay, I'll be at the entrance."
  ],
  clothes: [
    "Got it! I'm wearing a red jacket.",
    "I'm in a white t-shirt and jeans.",
    "Thanks! I'm wearing glasses."
  ],
  ready: [
    "Me too! Let's do this 🎉",
    "Yes! Ready when you are.",
    "Great! Let's complete the deal."
  ],
  default: [
    "Sounds good!",
    "Okay!",
    "I'm on my way!",
    "See you there!"
  ]
};

export default function PartyChat({ room }: PartyChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'partner',
      text: `Hi! I'm ${room.partnerName}. Where should we meet?`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string, quickAction?: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text,
      timestamp: new Date(),
      isQuickAction: !!quickAction
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate partner response after 2-4 seconds
    const responseDelay = Math.random() * 2000 + 2000;
    
    setTimeout(() => {
      const responses = quickAction 
        ? (BOT_RESPONSES[quickAction] || BOT_RESPONSES.default)
        : BOT_RESPONSES.default;
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const partnerMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'partner',
        text: randomResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, partnerMessage]);
    }, responseDelay);
  };

  const handleQuickAction = (action: { icon: string; text: string; action: string }) => {
    sendMessage(`${action.icon} ${action.text}`, action.action);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
      {/* Messages Area */}
      <div className="h-80 overflow-y-auto p-4 bg-gray-50">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex mb-3 ${
                message.sender === 'me' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.sender === 'me'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'me' ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-3 bg-gray-100 border-t border-gray-200">
        <p className="text-xs text-gray-600 font-semibold mb-2">Quick Actions:</p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.action}
              onClick={() => handleQuickAction(action)}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-green-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-sm"
            >
              <span className="text-lg">{action.icon}</span>
              <span className="text-left text-xs">{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!inputText.trim()}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}
