'use client';

import { motion } from 'framer-motion';
import {
  ClockIcon,
  MapPinIcon,
  TrophyIcon,
  HandThumbUpIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useGamification } from '@/hooks/useGamification';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface UserPost {
  id: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  caption: string;
  imageUrl: string;
  location: string;
  timeAgo: string;
  points: number;
  helpful: number;
  comments: number;
}

interface UserPostCardProps {
  post: UserPost;
}

interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timeAgo: string;
}

function formatTimeAgo(dateStr: string): string {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return 'เมื่อกี้';
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return `${Math.floor(hours / 24)} วันที่แล้ว`;
}

export default function UserPostCard({ post }: UserPostCardProps) {
  const [marked, setMarked] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(post.helpful);
  const { earnPoints } = useGamification();
  const { user } = useAuthStore();

  // Comments
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [commentCount, setCommentCount] = useState(post.comments);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const currentUserName = user?.name || 'Anonymous';
  const currentUserAvatar = user?.avatar || '';
  const currentUsername = user?.email?.split('@')[0] || 'user';

  // Load real comments from Supabase (falls back to localStorage, same as RealTimeFeed)
  useEffect(() => {
    let cancelled = false;
    const storageKey = `comments_${post.id}`;

    const load = async () => {
      if (isSupabaseConfigured) {
        try {
          const res = await fetch(`/api/community-posts/comments?post_id=${post.id}`);
          const json = await res.json();
          if (!cancelled && Array.isArray(json.comments) && json.comments.length > 0) {
            const dbComments: CommentItem[] = json.comments.map((c: Record<string, unknown>) => ({
              id: c.id as string,
              author: (c.display_name as string) || 'Anonymous',
              avatar: (c.avatar_url as string) || '',
              text: c.content as string,
              timeAgo: formatTimeAgo(c.created_at as string),
            }));
            setCommentsList(dbComments);
            setCommentCount(dbComments.length);
            return;
          }
        } catch {
          // fall through to localStorage
        }
      }
      try {
        const stored = localStorage.getItem(storageKey);
        if (!cancelled && stored) {
          const parsed = JSON.parse(stored) as CommentItem[];
          setCommentsList(parsed);
          setCommentCount(Math.max(parsed.length, post.comments));
        }
      } catch {}
    };

    load();
    return () => { cancelled = true; };
  }, [post.id, post.comments]);

  const handleMarkHelpful = () => {
    if (!marked) {
      setMarked(true);
      setHelpfulCount(helpfulCount + 1);
      earnPoints('WRITE_REVIEW');
      toast.success('Marked as helpful! +10 points 👍');
    }
  };

  const handleShare = () => {
    earnPoints('SHARE_DEAL');
    toast.success('Link copied! +25 points 🎉');
  };

  const handleComment = () => {
    const opening = !showComments;
    setShowComments(opening);
    if (opening) {
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }
  };

  const submitComment = async () => {
    const text = commentText.trim();
    if (!text) return;

    const newComment: CommentItem = {
      id: `cmt-${Date.now()}`,
      author: currentUserName,
      avatar: currentUserAvatar,
      text,
      timeAgo: 'เมื่อกี้',
    };

    // Optimistic update — always guaranteed via localStorage
    const updatedList = [...commentsList, newComment];
    setCommentsList(updatedList);
    setCommentCount((c) => c + 1);
    setCommentText('');
    try {
      localStorage.setItem(`comments_${post.id}`, JSON.stringify(updatedList));
    } catch {}

    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const res = await fetch('/api/community-posts/comments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              post_id: post.id,
              content: text,
              display_name: currentUserName,
              username: currentUsername,
              avatar_url: currentUserAvatar || null,
            }),
          });
          const json = await res.json();
          if (json.comment) {
            setCommentsList((prev) =>
              prev.map((c) => (c.id === newComment.id ? { ...c, id: json.comment.id } : c))
            );
          } else if (json.error) {
            console.error('[UserPostCard] comment save error:', json.error);
          }
        } else {
          toast.error('กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น');
        }
      } catch (e) {
        console.error('[UserPostCard] DB comment save failed (localStorage OK):', e);
      }
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="w-80 bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-orange-200 hover:border-orange-400 hover:shadow-2xl transition-all"
    >
      {/* User Header */}
      <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b-2 border-orange-100">
        <div className="relative">
          <Image
            src={post.userAvatar}
            alt={post.userName}
            width={48}
            height={48}
            className="rounded-full border-2 border-orange-400"
          />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900">{post.userName}</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <ClockIcon className="w-3 h-3" />
              <span>{post.timeAgo}</span>
            </div>
            <div className="text-xs font-bold text-orange-600">
              Lv.{post.userLevel}
            </div>
          </div>
        </div>
        <div className="bg-yellow-100 text-yellow-800 px-2 py-1.5 rounded-full flex items-center gap-1">
          <TrophyIcon className="w-3 h-3" />
          <span className="text-xs font-bold">+{post.points}</span>
        </div>
      </div>

      {/* Post Image */}
      <div className="relative h-64 bg-gray-100">
        <Image
          src={post.imageUrl}
          alt={post.caption}
          fill
          className="object-cover"
        />
        {/* User Level Badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <TrophyIcon className="w-3 h-3" />
          <span className="text-xs font-bold">Level {post.userLevel}</span>
        </div>
      </div>

      {/* Caption & Location */}
      <div className="p-4 space-y-3">
        <p className="text-gray-900 font-medium line-clamp-3">
          {post.caption}
        </p>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPinIcon className="w-4 h-4 text-red-600" />
          <span className="truncate">{post.location}</span>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-200 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <HandThumbUpIcon className={`w-4 h-4 ${marked ? 'fill-orange-500 text-orange-500' : ''}`} />
            <span className="font-semibold">{helpfulCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span className="font-semibold">{commentCount}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={handleMarkHelpful}
          disabled={marked}
          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${
            marked
              ? 'bg-orange-100 text-orange-600 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600'
          }`}
        >
          <HandThumbUpIcon className={`w-4 h-4 inline-block mr-1 ${marked ? 'fill-current' : ''}`} />
          {marked ? 'Helpful!' : 'Helpful'}
        </button>
        <button
          onClick={handleComment}
          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-colors ${
            showComments ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4 inline-block mr-1" />
          Comment
        </button>
        <button
          onClick={handleShare}
          className="flex-1 py-2.5 px-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg text-sm font-bold transition-all hover:shadow-lg"
        >
          <ShareIcon className="w-4 h-4 inline-block mr-1" />
          Share
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          {commentsList.length > 0 && (
            <div className="space-y-3 mb-3 max-h-56 overflow-y-auto">
              {commentsList.map((cmt) => (
                <div key={cmt.id} className="flex gap-2.5">
                  {cmt.avatar ? (
                    <Image src={cmt.avatar} alt={cmt.author} width={28} height={28} className="rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(cmt.author || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="bg-gray-100 rounded-2xl px-3.5 py-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-800">{cmt.author}</span>
                      <span className="text-[10px] text-gray-400">{cmt.timeAgo}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{cmt.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2.5 items-center">
            {currentUserAvatar ? (
              <Image src={currentUserAvatar} alt={currentUserName} width={28} height={28} className="rounded-full flex-shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {currentUserName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                placeholder="เขียนความคิดเห็น..."
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={submitComment}
                disabled={!commentText.trim()}
                className={`p-1.5 rounded-full transition-colors ${
                  commentText.trim() ? 'text-orange-500 hover:bg-orange-100' : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
