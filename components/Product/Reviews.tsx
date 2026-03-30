'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  Camera, 
  CheckCircle,
  Award,
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
}

export default function Reviews({ productId }: ReviewsProps) {
  const [reviewData, setReviewData] = useState<ProductReviews | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
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
          .select('*')
          .eq('promotion_id', productId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: Review[] = (data as SupabaseReview[]).map(r => ({
            id: r.id,
            userId: r.user_id,
            userName: user?.name || 'ผู้ใช้งาน',
            userAvatar: user?.avatar || 'https://i.pravatar.cc/150?img=68',
            rating: r.rating,
            isVerifiedBuyer: true,
            comment: r.comment || '',
            photos: r.images || [],
            helpful: r.helpful_count || 0,
            timestamp: new Date(r.created_at),
          }));
          setDbReviews(mapped);
        }
      } catch (e) {
        console.error('Failed to load reviews:', e);
      }
    })();
  }, [productId, user]);

  const allReviews = [...dbReviews, ...(reviewData?.reviews || [])];

  const handleMarkHelpful = (reviewId: string) => {
    const success = markReviewHelpful(reviewId, productId);
    if (success) {
      setHelpfulReviews(prev => new Set([...prev, reviewId]));
      toast.success('ขอบคุณสำหรับความคิดเห็น');
      setReviewData(getProductReviews(productId));
    } else {
      toast.error('คุณโหวตรีวิวนี้ไปแล้ว');
    }
  };

  const handleSubmitReview = async () => {
    if (newRating === 0) {
      toast.error('กรุณาให้คะแนน');
      return;
    }
    if (newComment.trim().length < 10) {
      toast.error('กรุณาเขียนรีวิวอย่างน้อย 10 ตัวอักษร');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured && user) {
        const { data: inserted, error } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            promotion_id: productId,
            rating: newRating,
            comment: newComment.trim(),
            images: [],
          })
          .select()
          .single();

        if (error) {
          console.error('Failed to save review:', error);
          toast.error('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
          setIsSubmitting(false);
          return;
        }

        // Add to local state immediately
        if (inserted) {
          const newReview: Review = {
            id: inserted.id,
            userId: user.id,
            userName: user.name || 'ผู้ใช้งาน',
            userAvatar: user.avatar || 'https://i.pravatar.cc/150?img=68',
            rating: newRating,
            isVerifiedBuyer: true,
            comment: newComment.trim(),
            photos: [],
            helpful: 0,
            timestamp: new Date(),
          };
          setDbReviews(prev => [newReview, ...prev]);
        }
      }

      addPoints(10, 'เขียนรีวิวครั้งแรก', '✍️');

      toast.success('ส่งรีวิวสำเร็จ! +10 Points', {
        icon: '✍️',
        duration: 4000
      });

      setShowWriteReview(false);
      setNewRating(0);
      setNewComment('');
    } catch (e) {
      console.error('Review submit error:', e);
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
    <>
      {allReviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">ยังไม่มีรีวิว</p>
          <button
            onClick={() => setShowWriteReview(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            ✍️ เขียนรีวิวแรกและรับ +10 Points!
          </button>
        </div>
      ) : (
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
        {/* Header with Stats */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              รีวิวจากผู้ใช้งานจริง
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-black text-gray-900">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-gray-500 text-sm">
                  ({allReviews.length} รีวิว)
                </span>
              </div>
            </div>
          </div>

          {canUserReview(productId) && (
            <button
              onClick={() => setShowWriteReview(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              เขียนรีวิว
            </button>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-xl p-4 border border-gray-200"
            >
              {/* User Info */}
              <div className="flex items-start gap-3 mb-3">
                <Image
                  src={review.userAvatar}
                  alt={review.userName}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-white shadow-md"
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

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.timestamp).toLocaleDateString('th-TH', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {review.dealValue && (
                    <p className="text-xs text-purple-600 mt-1">
                      ซื้อ: {review.dealValue}
                    </p>
                  )}
                </div>
              </div>

              {/* Review Content */}
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                {review.comment}
              </p>

              {/* Review Photos */}
              {review.photos.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
                  {review.photos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(photo)}
                      className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-200 hover:ring-2 hover:ring-purple-400 transition-all"
                    >
                      <Image
                        src={photo}
                        alt={`Review photo ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Helpful Button */}
              <button
                onClick={() => handleMarkHelpful(review.id)}
                disabled={helpfulReviews.has(review.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  helpfulReviews.has(review.id)
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${helpfulReviews.has(review.id) ? 'fill-current' : ''}`} />
                {helpfulReviews.has(review.id) ? 'โหวตแล้ว' : 'มีประโยชน์'} ({review.helpful})
              </button>
            </motion.div>
          ))}
        </div>

        {/* Show More Button */}
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

      {/* Write Review Modal */}
      {showWriteReview && (
        <div
          onClick={() => setShowWriteReview(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white relative">
              <button
                onClick={() => setShowWriteReview(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold mb-2">✍️ เขียนรีวิว</h2>
              <p className="text-purple-100 text-sm">แชร์ประสบการณ์ของคุณ และรับ +10 Points!</p>
            </div>

            <div className="p-6">
              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ให้คะแนน *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= newRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  เขียนรีวิว * (อย่างน้อย 10 ตัวอักษร)
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="บอกเล่าประสบการณ์ของคุณ... คุ้มไหม อร่อยไหม เหมือนรูปไหม"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                  rows={5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newComment.length} ตัวอักษร
                </p>
              </div>

              {/* Upload Photo */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  แนบรูปภาพ (ไม่บังคับ)
                </label>
                <button type="button" className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-400 hover:bg-purple-50 transition-all flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-600">
                    คลิกเพื่ออัพโหลดรูป
                  </span>
                  <span className="text-xs text-gray-500">
                    (จะเพิ่มฟีเจอร์เร็วๆ นี้)
                  </span>
                </button>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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

              <p className="text-xs text-gray-500 text-center mt-3">
                รีวิวของคุณจะช่วยให้ Hunter คนอื่นตัดสินใจได้ดีขึ้น
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="relative max-w-3xl w-full aspect-square">
            <Image
              src={selectedImage}
              alt="Review photo"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
