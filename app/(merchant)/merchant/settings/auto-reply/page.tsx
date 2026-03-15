'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  BoltIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  LockClosedIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';

interface AutoReply {
  id: string;
  keyword: string;
  answer: string;
  enabled: boolean;
}

export default function MerchantAutoReplyPage() {
  const { user } = useAuthStore();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [autoReplies, setAutoReplies] = useState<AutoReply[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [stats, setStats] = useState({ total: 0, today: 0 });

  useEffect(() => {
    if (!user) return;

    // Check PRO status from store
    const proStatus = user.isPro || user.verified || false;
    setIsPro(proStatus);
    
    // Store key based on real user ID
    const storeKey = `merchant_${user.id}`;
    
    if (proStatus) {
      // Load AI settings
      const aiSetting = localStorage.getItem(`${storeKey}_ai_enabled`) === 'true';
      setAiEnabled(aiSetting);
      
      // Load auto replies
      const savedReplies = localStorage.getItem(`${storeKey}_auto_replies`);
      if (savedReplies) {
        try {
          const parsed = JSON.parse(savedReplies);
          const repliesArray = Object.entries(parsed).map(([keyword, answer], index) => ({
            id: `reply-${index}`,
            keyword,
            answer: answer as string,
            enabled: true
          }));
          setAutoReplies(repliesArray);
        } catch (e) {
          // Initialize with defaults
          setAutoReplies(getDefaultReplies());
        }
      } else {
        setAutoReplies(getDefaultReplies());
      }
      
      // Load stats
      const chatbotStats = JSON.parse(
        localStorage.getItem(`${storeKey}_chatbot_stats`) || '{"searches": 0, "auto_replies": 0}'
      );
      setStats({
        total: chatbotStats.auto_replies,
        today: Math.floor(chatbotStats.auto_replies / 7) // Mock daily average
      });
    }
    
    setIsLoading(false);
  }, [user]);

  const getDefaultReplies = (): AutoReply[] => [
    {
      id: 'reply-1',
      keyword: 'เปิด,เวลา,open',
      answer: 'เปิดทุกวันเวลา 10:00-22:00 น. ค่ะ 🕙',
      enabled: true
    },
    {
      id: 'reply-2',
      keyword: 'ที่จอด,parking',
      answer: 'มีที่จอดรถสะดวก ฟรีค่ะ 🅿️',
      enabled: true
    },
    {
      id: 'reply-3',
      keyword: 'จัดส่ง,delivery',
      answer: 'มีบริการจัดส่งผ่าน Grab/Lineman ค่ะ 🚗',
      enabled: true
    },
    {
      id: 'reply-4',
      keyword: 'จอง,reservation',
      answer: 'สามารถจองโต๊ะล่วงหน้าได้ค่ะ โทร 02-XXX-XXXX 📞',
      enabled: true
    }
  ];

  const handleToggleAI = () => {
    if (!user) return;
    const newState = !aiEnabled;
    setAiEnabled(newState);
    
    // Store with real user ID
    localStorage.setItem(`merchant_${user.id}_ai_enabled`, newState.toString());
    
    if (newState) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleAddReply = () => {
    if (!newKeyword.trim() || !newAnswer.trim()) return;
    
    const newReply: AutoReply = {
      id: `reply-${Date.now()}`,
      keyword: newKeyword.trim(),
      answer: newAnswer.trim(),
      enabled: true
    };
    
    const updated = [...autoReplies, newReply];
    setAutoReplies(updated);
    saveReplies(updated);
    
    setNewKeyword('');
    setNewAnswer('');
  };

  const handleDeleteReply = (id: string) => {
    const updated = autoReplies.filter(r => r.id !== id);
    setAutoReplies(updated);
    saveReplies(updated);
  };

  const handleToggleReply = (id: string) => {
    const updated = autoReplies.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setAutoReplies(updated);
    saveReplies(updated);
  };

  const saveReplies = (replies: AutoReply[]) => {
    if (!user) return;
    const repliesObj: Record<string, string> = {};
    
    replies.forEach(reply => {
      if (reply.enabled) {
        reply.keyword.split(',').forEach(kw => {
          repliesObj[kw.trim()] = reply.answer;
        });
      }
    });
    
    // Store with real user ID
    localStorage.setItem(`merchant_${user.id}_auto_replies`, JSON.stringify(repliesObj));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isPro) {
    // Locked for Free merchants
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <LockClosedIcon className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🤖 AI Auto-Reply (PRO Feature)
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Let AI answer customer questions 24/7 automatically. Save time and never miss a customer inquiry.
            </p>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">With AI Auto-Reply, you can:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Answer instantly 24/7</div>
                    <div className="text-sm text-gray-600">Never miss a customer question</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Save 5+ hours per week</div>
                    <div className="text-sm text-gray-600">Automate repetitive questions</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Custom quick answers</div>
                    <div className="text-sm text-gray-600">Hours, parking, delivery, etc.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Improve response rate</div>
                    <div className="text-sm text-gray-600">87% faster replies</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Link
              href="/merchant/upgrade"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all text-lg"
            >
              <SparklesIcon className="w-6 h-6" />
              Upgrade to PRO - ฿599/month
            </Link>
            
            <p className="mt-6 text-sm text-gray-500">
              Join 1,200+ PRO merchants growing their business with AI
            </p>
          </div>
        </div>
      </div>
    );
  }

  // PRO merchant view
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-indigo-600" />
                AI Auto-Reply Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Automate customer responses and save time
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">AI Status</div>
                <div className={`font-semibold ${aiEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {aiEnabled ? '✅ Active' : '⭕ Inactive'}
                </div>
              </div>
              
              <button
                onClick={handleToggleAI}
                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                  aiEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${
                    aiEnabled ? 'translate-x-11' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="text-sm text-gray-600">Total Auto-Replies</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.today}</div>
            </div>
            <div className="text-sm text-gray-600">Replies Today</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BoltIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{Math.round(stats.total * 5 / 60)}h</div>
            </div>
            <div className="text-sm text-gray-600">Time Saved</div>
          </div>
        </div>

        {/* Add New Reply */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Auto-Reply</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords (comma separated)
              </label>
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="e.g., menu, เมนู, อาหาร"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                AI will trigger when customer message contains these words
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Reply Answer
              </label>
              <input
                type="text"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Your automatic answer..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <button
            onClick={handleAddReply}
            disabled={!newKeyword.trim() || !newAnswer.trim()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            + Add Reply
          </button>
        </div>

        {/* Existing Replies */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Auto-Replies ({autoReplies.length})
          </h2>
          
          <div className="space-y-3">
            {autoReplies.map((reply) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-lg p-4 transition-all ${
                  reply.enabled 
                    ? 'border-green-200 bg-green-50/30' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Keywords:</span>
                      <div className="flex flex-wrap gap-1">
                        {reply.keyword.split(',').map((kw, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">
                            {kw.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-900 font-medium">
                      {reply.answer}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleReply(reply.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        reply.enabled 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={reply.enabled ? 'Disable' : 'Enable'}
                    >
                      {reply.enabled ? (
                        <CheckCircleIcon className="w-5 h-5" />
                      ) : (
                        <XMarkIcon className="w-5 h-5" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteReply(reply.id)}
                      className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {autoReplies.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No auto-replies yet. Add your first one above!
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-indigo-600" />
            Tips for Better Auto-Replies
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Use multiple keywords separated by commas (e.g., "open,เปิด,hours")</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Keep answers short and friendly (1-2 sentences)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Include emojis to make responses more engaging 😊</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Add phone numbers or links for complex questions</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
