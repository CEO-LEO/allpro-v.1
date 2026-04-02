'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  Camera, 
  CheckCircle,
  X,
  Send,
  Loader2
} from 'lucide-react';
import { 
  type Review, 
  type ProductReviews, 
  getProductReviews, 
  canUserReview,
  markReviewHelpful 
} from '@/lib/reviewData';
import toast from 'react-hot-toast';
import { addPoints } from '@/lib/pointsUtils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface ReviewsProps {
  productId: string;
}

interface SupabaseReview {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  images: string[];
  helpful_count: number;
  created_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  }[] | {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

// Avatar fallback: show first letter of name in a colored circle
const AVATAR_COLORS = [
  'bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500',
  'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function UserAvatar({ name, avatarUrl, size = 48 }: { name: string; avatarUrl?: string | null; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const initial = (name || '?').charAt(0).toUpperCase();
  const colorClass = getAvatarColor(name);

  if (avatarUrl && !imgError) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full border-2 border-white shadow-md object-cover"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${colorClass} rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}

// ─── Write Review Modal (rendered via Portal) ─────────────────────────────
function WriteReviewModal({
  onClose,
  onSubmit,
  isSubmitting,
}: {
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  isSubmitting: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [mounted, setMounted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = () => {
    setValidationError(null);
    if (rating === 0) {
      setValidationError('กรุณาให้คะแนนดาว');
      return;
    }
    if (comment.trim().length < 10) {
      setValidationError(`กรุณาเขียนรีวิวอย่างน้อย 10 ตัวอักษร (ตอนนี้ ${comment.trim().length} ตัวอักษร)`);
      return;
    }
    onSubmit(rating, comment);
  };

  const modalContent = (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: 'white', borderRadius: '1.5rem', maxWidth: '32rem', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)', padding: '1.5rem', color: 'white', position: 'relative' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ position: 'absolute', top: '1rem', right: '1rem', width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
          >
            <X className="w-5 h-5" />
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>✍️ เขียนรีวิว</h2>
          <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>แชร์ประสบการณ์ของคุณ และรับ +10 Points!</p>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Rating Stars */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem' }}>
              ให้คะแนน *
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'transform 0.1s' }}
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem' }}>
              เขียนรีวิว * (อย่างน้อย 10 ตัวอักษร)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="บอกเล่าประสบการณ์ของคุณ... คุ้มไหม อร่อยไหม เหมือนรูปไหม"
              rows={5}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #e5e7eb', borderRadius: '0.75rem', fontSize: '0.875rem', resize: 'none', outline: 'none', fontFamily: 'inherit' }}
            />
            <p style={{ fontSize: '0.75rem', color: comment.trim().length >= 10 ? '#22c55e' : '#9ca3af', marginTop: '0.25rem' }}>
              {comment.trim().length}/10 ตัวอักษร {comment.trim().length >= 10 ? '✓' : ''}
            </p>
          </div>

          {/* Inline Validation Error */}
          {validationError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem', fontWeight: 500 }}>
              ⚠️ {validationError}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '0.75rem',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              color: 'white',
              background: 'linear-gradient(to right, #a855f7, #ec4899)',
              opacity: isSubmitting ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontFamily: 'inherit',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังส่ง...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                ส่งรีวิวและรับ +10 Points
              </>
            )}
          </button>

          <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginTop: '0.75rem' }}>
            รีวิวของคุณจะช่วยให้ Hunter คนอื่นตัดสินใจได้ดีขึ้น
          </p>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}

// ─── Main Reviews Component ───────────────────────────────────────────────
export default function Reviews({ productId }: ReviewsProps) {
  const [reviewData, setReviewData] = useState<ProductReviews | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());
  const [dbReviews, setDbReviews] = useState<Review[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  // Load reviews from mock data
  useEffect(() => {
    const data = getProductReviews(productId);
    setReviewData(data);

    const marked = new Set<string>();
    data?.reviews.forEach(review => {
      if (localStorage.getItem(`helpful_${review.id}`)) {
        marked.add(review.id);
      }
    });
    setHelpfulReviews(marked);
  }, [productId]);

  // Load reviews from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            user_id,
            rating,
            comment,
            images,
            helpful_count,
            created_at,
            profiles:user_id ( username, avatar_url )
          `)
          .eq('promotion_id', productId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: Review[] = (data as SupabaseReview[]).map(r => {
            // profiles can be object or array depending on Supabase join type
            const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
            const profileName = profile?.username || null;
            const profileAvatar = profile?.avatar_url || null;
            return {
              id: r.id,
              userId: r.user_id,
              userName: profileName || 'ผู้ใช้งาน',
              userAvatar: profileAvatar || '',
              rating: r.rating,
              isVerifiedBuyer: true,
              comment: r.comment || '',
              photos: r.images || [],
              helpful: r.helpful_count || 0,
              timestamp: new Date(r.created_at),
            };
          });
          setDbReviews(mapped);
        }
      } catch (e) {
        console.error('Failed to load reviews:', e);
      }
    })();
  }, [productId, user]);

  const allReviews = [...dbReviews, ...(reviewData?.reviews || [])];

  const handleMarkHelpful = async (reviewId: string) => {
    const alreadyVoted = helpfulReviews.has(reviewId);

    // Check if this is a Supabase DB review
    const isDbReview = dbReviews.some(r => r.id === reviewId);

    if (isDbReview && isSupabaseConfigured) {
      try {
        const currentReview = dbReviews.find(r => r.id === reviewId)!;
        const newCount = alreadyVoted
          ? Math.max(0, currentReview.helpful - 1)
          : currentReview.helpful + 1;

        const { error } = await supabase
          .from('reviews')
          .update({ helpful_count: newCount })
          .eq('id', reviewId);

        if (error) {
          console.error('[Reviews] helpful update error:', error);
        }
        // Update local state
        setDbReviews(prev => prev.map(r =>
          r.id === reviewId ? { ...r, helpful: newCount } : r
        ));
      } catch (e) {
        console.error('[Reviews] handleMarkHelpful error:', e);
      }
    } else {
      // Mock data review — use existing local function
      markReviewHelpful(reviewId, productId);
      setReviewData(getProductReviews(productId));
    }

    if (alreadyVoted) {
      setHelpfulReviews(prev => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
      localStorage.removeItem(`helpful_${reviewId}`);
    } else {
      setHelpfulReviews(prev => new Set([...prev, reviewId]));
      localStorage.setItem(`helpful_${reviewId}`, 'true');
      toast.success('ขอบคุณสำหรับความคิดเห็น');
    }
  };

  // Check if current user already has a review for this product
  const userAlreadyReviewed = user
    ? allReviews.some(r => r.userId === user.id)
    : false;

  const handleSubmitReview = async (rating: number, comment: string) => {
    console.log('[Reviews] Submitting review — user:', user?.id ?? 'anonymous', 'product:', productId, 'rating:', rating);
    setIsSubmitting(true);

    try {
      let savedToDb = false;

      // ── 1. ลอง save ลง Supabase (ถ้ามี session จริง) ──
      if (isSupabaseConfigured) {
        let sessionUserId: string | null = null;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          sessionUserId = session?.user?.id || null;
          console.log('[Reviews] Supabase session userId:', sessionUserId);
        } catch (sessionErr) {
          console.warn('[Reviews] getSession failed (AbortError?):', sessionErr);
        }

        if (sessionUserId) {
          // มี Supabase session จริง → insert ด้วย session user id
          const { data: inserted, error } = await supabase
            .from('reviews')
            .insert({
              user_id: sessionUserId,
              promotion_id: productId,  // Now TEXT column — works with any ID format
              rating,
              comment: comment.trim(),
              images: [],
            })
            .select()
            .single();

          if (error) {
            // Check for duplicate review (unique constraint violation)
            if (error.code === '23505') {
              toast.error('คุณเขียนรีวิวสินค้านี้ไปแล้ว');
              setShowWriteReview(false);
              return;
            }
            console.error('[Reviews] Supabase insert error:', error.message, error.details, error.hint);
            // ไม่ return — จะ fallback เป็น local save
          } else if (inserted) {
            console.log('[Reviews] Saved to Supabase:', inserted.id);
            savedToDb = true;
            const newReview: Review = {
              id: inserted.id,
              userId: sessionUserId,
              userName: user?.name || 'ผู้ใช้งาน',
              userAvatar: user?.avatar || '',
              rating,
              isVerifiedBuyer: true,
              comment: comment.trim(),
              photos: [],
              helpful: 0,
              timestamp: new Date(),
            };
            setDbReviews(prev => [newReview, ...prev]);
          }
        } else {
          console.log('[Reviews] No active Supabase session — saving locally only');
        }
      }

      // ── 2. ถ้ายังไม่ได้ save ลง DB → เพิ่มใน local state ──
      if (!savedToDb) {
        const localReview: Review = {
          id: `local-${Date.now()}`,
          userId: user?.id || 'anonymous',
          userName: user?.name || 'ผู้ใช้งาน',
          userAvatar: user?.avatar || '',
          rating,
          isVerifiedBuyer: false,
          comment: comment.trim(),
          photos: [],
          helpful: 0,
          timestamp: new Date(),
        };
        setDbReviews(prev => [localReview, ...prev]);
        console.log('[Reviews] Saved locally:', localReview.id);
      }

      // ── 3. สำเร็จ → ให้ points + ปิด modal ──
      addPoints(10, 'เขียนรีวิวครั้งแรก', '✍️');
      toast.success('ส่งรีวิวสำเร็จ! +10 Points', { icon: '✍️', duration: 4000 });
      setShowWriteReview(false);
    } catch (e) {
      console.error('[Reviews] handleSubmitReview error:', e);
      toast.error('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedReviews = showAllReviews ? allReviews : allReviews.slice(0, 3);
  const avgRating = allReviews.length > 0
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    : 0;

  return (
    <div>
      {/* Reviews content */}
      {allReviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">ยังไม่มีรีวิว</p>
          <button
            type="button"
            onClick={() => { console.log('[Reviews] Opening write review modal'); setShowWriteReview(true); }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            ✍️ เขียนรีวิวแรกและรับ +10 Points!
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                รีวิวจากผู้ใช้งานจริง
              </h3>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-black text-gray-900">{avgRating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">({allReviews.length} รีวิว)</span>
              </div>
            </div>
            {userAlreadyReviewed ? (
              <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                รีวิวแล้ว
              </span>
            ) : canUserReview(productId) && (
              <button
                type="button"
                onClick={() => setShowWriteReview(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                เขียนรีวิว
              </button>
            )}
          </div>

          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start gap-3 mb-3">
                  <UserAvatar
                    name={review.userName}
                    avatarUrl={review.userAvatar}
                    size={48}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{review.userName}</span>
                      {review.isVerifiedBuyer && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.timestamp).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {review.dealValue && <p className="text-xs text-purple-600 mt-1">ซื้อ: {review.dealValue}</p>}
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-3">{review.comment}</p>
                {review.photos.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto">
                    {review.photos.map((photo, idx) => (
                      <button key={idx} onClick={() => setSelectedImage(photo)} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
                        <Image src={photo} alt={`Review photo ${idx + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => handleMarkHelpful(review.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    helpfulReviews.has(review.id)
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${helpfulReviews.has(review.id) ? 'fill-current' : ''}`} />
                  {helpfulReviews.has(review.id) ? 'โหวตแล้ว' : 'มีประโยชน์'} ({review.helpful})
                </button>
              </div>
            ))}
          </div>

          {allReviews.length > 3 && (
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all"
            >
              {showAllReviews ? 'แสดงน้อยลง' : `ดูรีวิวทั้งหมด (${allReviews.length})`}
            </button>
          )}
        </div>
      )}

      {/* Write Review Modal — rendered via React Portal to document.body */}
      {showWriteReview && (
        <WriteReviewModal
          onClose={() => setShowWriteReview(false)}
          onSubmit={handleSubmitReview}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="relative max-w-3xl w-full aspect-square">
            <Image src={selectedImage} alt="Review photo" fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
