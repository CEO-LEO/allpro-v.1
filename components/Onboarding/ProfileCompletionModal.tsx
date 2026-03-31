'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Gift, Users } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const GENDER_OPTIONS = [
  { id: 'male' as const, label: 'ชาย', icon: '👨' },
  { id: 'female' as const, label: 'หญิง', icon: '👩' },
  { id: 'other' as const, label: 'อื่นๆ', icon: '🧑' },
  { id: 'prefer_not_to_say' as const, label: 'ไม่ระบุ', icon: '🤐' },
];

const AGE_OPTIONS = [
  { id: '18-24' as const, label: '18-24 ปี' },
  { id: '25-34' as const, label: '25-34 ปี' },
  { id: '35-44' as const, label: '35-44 ปี' },
  { id: '45-54' as const, label: '45-54 ปี' },
  { id: '55+' as const, label: '55+ ปี' },
];

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileCompletionModal({ isOpen, onClose }: ProfileCompletionModalProps) {
  const { updateUser, addCoins } = useAuthStore();
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say' | null>(null);
  const [ageRange, setAgeRange] = useState<'18-24' | '25-34' | '35-44' | '45-54' | '55+' | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const canSave = gender !== null && ageRange !== null;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);

    try {
      // 1. Save to Supabase if configured
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { error } = await supabase
            .from('profiles')
            .update({
              gender,
              age_range: ageRange,
              profile_completed: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', session.user.id);

          if (error) {
            console.error('[ProfileModal] Supabase update error:', error);
            // Still continue to update local state
          } else {
            console.log('[ProfileModal] Saved to Supabase');
          }
        }
      }

      // 2. Update local store
      updateUser({
        gender,
        ageRange,
        profileCompleted: true,
      });

      // Reward 10 coins for completing profile
      addCoins(10);

      toast.success('บันทึกข้อมูลสำเร็จ! รับ 10 Points', {
        duration: 3000,
      });

      onClose();
    } catch (e) {
      console.error('[ProfileModal] handleSave error:', e);
      toast.error('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    updateUser({ profileCompleted: true });
    onClose();
  };

  if (typeof window === 'undefined') return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] backdrop-blur-sm bg-black/20 flex items-center justify-center p-4"
            onClick={handleSkip}
          >

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-orange-500 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-bold text-white">ข้อมูลเพิ่มเติม</h2>
                </div>
                <button
                  onClick={handleSkip}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/80" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Privacy notice */}
                <p className="text-sm text-gray-400 leading-relaxed">
                  ข้อมูลนี้จะช่วยให้เราแนะนำโปรโมชันที่เหมาะกับคุณ
                </p>

                {/* Gender selection */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2.5 block">เพศ</label>
                  <div className="grid grid-cols-4 gap-2">
                    {GENDER_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setGender(option.id)}
                        className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border-2 transition-all text-center touch-manipulation ${
                          gender === option.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                        }`}
                      >
                        <span className="text-2xl">{option.icon}</span>
                        <span className={`text-xs font-medium ${
                          gender === option.id ? 'text-orange-600' : 'text-gray-500'
                        }`}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age range selection */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2.5 block">ช่วงอายุ</label>
                  <div className="grid grid-cols-3 gap-2">
                    {AGE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setAgeRange(option.id)}
                        className={`py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all touch-manipulation ${
                          ageRange === option.id
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reward notice */}
                <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
                  <Gift className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-xs text-amber-700 font-medium">กรอกข้อมูลครบ รับทันที 10 Points!</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors touch-manipulation"
                  >
                    ข้ามไปก่อน
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!canSave}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all touch-manipulation ${
                      canSave
                        ? 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
