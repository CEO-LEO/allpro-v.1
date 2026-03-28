'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Tag } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

// แท็ก/หมวดหมู่ทั้งหมดที่มีในระบบ
const ALL_TAGS = [
  { id: 'Food', label: 'อาหาร', emoji: '🍔', color: 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200' },
  { id: 'Fashion', label: 'แฟชั่น', emoji: '👗', color: 'bg-pink-100 border-pink-300 text-pink-700 hover:bg-pink-200' },
  { id: 'Travel', label: 'ท่องเที่ยว', emoji: '✈️', color: 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200' },
  { id: 'Gadget', label: 'แกดเจ็ต', emoji: '📱', color: 'bg-indigo-100 border-indigo-300 text-indigo-700 hover:bg-indigo-200' },
  { id: 'Beauty', label: 'ความงาม', emoji: '💄', color: 'bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200' },
  { id: 'Service', label: 'บริการ', emoji: '🛎️', color: 'bg-teal-100 border-teal-300 text-teal-700 hover:bg-teal-200' },
  { id: 'Electronics', label: 'อิเล็กทรอนิกส์', emoji: '💻', color: 'bg-cyan-100 border-cyan-300 text-cyan-700 hover:bg-cyan-200' },
  { id: 'Fitness', label: 'ฟิตเนส', emoji: '💪', color: 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200' },
  { id: 'Japanese', label: 'อาหารญี่ปุ่น', emoji: '🍣', color: 'bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200' },
  { id: 'Korean', label: 'เกาหลี', emoji: '🥘', color: 'bg-rose-100 border-rose-300 text-rose-700 hover:bg-rose-200' },
  { id: 'Drinks', label: 'เครื่องดื่ม', emoji: '🧋', color: 'bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200' },
  { id: 'Spa', label: 'สปา / นวด', emoji: '🧖', color: 'bg-violet-100 border-violet-300 text-violet-700 hover:bg-violet-200' },
  { id: 'BBQ', label: 'บาร์บีคิว / บุฟเฟ่ต์', emoji: '🥩', color: 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200' },
  { id: 'Hair', label: 'ทำผม', emoji: '💇', color: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-700 hover:bg-fuchsia-200' },
  { id: 'Flash Sale', label: 'Flash Sale', emoji: '⚡', color: 'bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200' },
];

interface TagSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TagSelectionModal({ isOpen, onClose }: TagSelectionModalProps) {
  const { user, updateUser } = useAuthStore();
  const [selectedTags, setSelectedTags] = useState<string[]>(user?.preferred_tags || []);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSave = () => {
    // บันทึก preferred_tags ลง store (และ Supabase ถ้าเชื่อมต่อแล้ว)
    updateUser({
      preferred_tags: selectedTags,
      onboardingCompleted: true,
    });

    toast.success('🎉 บันทึกความสนใจเรียบร้อย! เราจะแนะนำดีลที่ตรงใจคุณ', {
      duration: 4000,
    });

    onClose();
  };

  const handleSkip = () => {
    updateUser({ onboardingCompleted: true });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-6 text-white">
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2.5 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">เลือกสิ่งที่คุณสนใจ</h2>
                  <p className="text-orange-100 text-sm">เพื่อให้เราแนะนำดีลที่ตรงใจคุณที่สุด</p>
                </div>
              </div>
            </div>

            {/* Tag Grid */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                <Tag className="w-4 h-4" />
                เลือกหมวดหมู่ที่สนใจ (เลือกได้หลายรายการ)
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ALL_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <motion.button
                      key={tag.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleTag(tag.id)}
                      className={`
                        relative flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all
                        ${isSelected
                          ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                          : tag.color + ' border'
                        }
                      `}
                    >
                      <span className="text-lg">{tag.emoji}</span>
                      <span className="truncate">{tag.label}</span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow"
                        >
                          <Check className="w-3.5 h-3.5 text-orange-500" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between gap-3">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-4 py-2"
              >
                ข้ามไปก่อน
              </button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={selectedTags.length === 0}
                className={`
                  px-6 py-2.5 rounded-xl font-bold text-white transition-all flex items-center gap-2
                  ${selectedTags.length > 0
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 cursor-not-allowed'
                  }
                `}
              >
                <Sparkles className="w-4 h-4" />
                บันทึก ({selectedTags.length})
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
