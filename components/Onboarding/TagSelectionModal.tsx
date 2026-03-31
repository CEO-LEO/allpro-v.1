'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);
  const scrollYRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open — use position:fixed to prevent iOS background scroll
  useEffect(() => {
    if (isOpen) {
      scrollYRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollYRef.current);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  }, []);

  const handleSave = useCallback(() => {
    updateUser({
      preferred_tags: selectedTags,
      onboardingCompleted: true,
    });

    toast.success('🎉 บันทึกความสนใจเรียบร้อย! เราจะแนะนำดีลที่ตรงใจคุณ', {
      duration: 4000,
    });

    onClose();
  }, [selectedTags, updateUser, onClose]);

  const handleSkip = useCallback(() => {
    updateUser({ onboardingCompleted: true });
    onClose();
  }, [updateUser, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleSkip]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="เลือกสิ่งที่คุณสนใจ"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        touchAction: 'manipulation',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          touchAction: 'none',
        }}
        onClick={handleSkip}
      />

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '32rem',
          backgroundColor: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(to right, #f97316, #ef4444)', padding: '1.5rem', color: 'white', position: 'relative' }}>
          <button
            type="button"
            onClick={handleSkip}
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              width: '2.75rem',
              height: '2.75rem',
              minWidth: '44px',
              minHeight: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.25)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              zIndex: 2,
            }}
            aria-label="ปิด"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.625rem', borderRadius: '0.75rem' }}>
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>เลือกสิ่งที่คุณสนใจ</h2>
              <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: 0 }}>เพื่อให้เราแนะนำดีลที่ตรงใจคุณที่สุด</p>
            </div>
          </div>
        </div>

        {/* Tag Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', WebkitOverflowScrolling: 'touch' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Tag className="w-4 h-4" />
            เลือกหมวดหมู่ที่สนใจ (เลือกได้หลายรายการ)
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {ALL_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    border: isSelected ? '2px solid #f97316' : '2px solid #e5e7eb',
                    backgroundColor: isSelected ? '#f97316' : '#f9fafb',
                    color: isSelected ? 'white' : '#374151',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontSize: '1.125rem' }}>{tag.emoji}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tag.label}</span>
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '-0.375rem',
                      right: '-0.375rem',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      padding: '2px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      pointerEvents: 'none',
                    }}>
                      <Check className="w-3.5 h-3.5" style={{ color: '#f97316' }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}>
          <button
            type="button"
            onClick={handleSkip}
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.75rem 1rem',
              minHeight: '44px',
              fontFamily: 'inherit',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
          >
            ข้ามไปก่อน
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={selectedTags.length === 0}
            style={{
              padding: '0.75rem 1.5rem',
              minHeight: '44px',
              borderRadius: '0.75rem',
              fontWeight: 'bold',
              color: 'white',
              border: 'none',
              cursor: selectedTags.length > 0 ? 'pointer' : 'not-allowed',
              background: selectedTags.length > 0 ? 'linear-gradient(to right, #f97316, #ef4444)' : '#d1d5db',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
          >
            <Sparkles className="w-4 h-4" />
            บันทึก ({selectedTags.length})
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
