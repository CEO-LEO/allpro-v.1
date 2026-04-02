'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  Repeat2,
  Heart,
  Share2,
  Loader2,
  ImageIcon,
  MapPin,
  Store,
  Users,
  BadgeCheck,
  TrendingUp,
  Send,
  X,
  ExternalLink,
  Copy,
  Check,
  PenLine,
} from 'lucide-react';
import Image from 'next/image';
import { useLoadScript } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { mockBrandPosts, mockUserPosts } from '@/data/communityPosts';
import type { BrandPost, UserPost } from '@/data/communityPosts';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── Google Maps libraries ──────────────────────────────────────────────────
const GOOGLE_MAPS_LIBS: ('places')[] = ['places'];

// ─── Category tags for filtering ────────────────────────────────────────────
const CATEGORY_TAGS = ['ของกิน', 'เสื้อผ้า', 'การท่องเที่ยว', 'โปรพิเศษ'] as const;
type CategoryTag = (typeof CATEGORY_TAGS)[number];

// Map existing category names from mock data → Thai tag
function mapCategoryToTag(category?: string): CategoryTag {
  if (!category) return 'โปรพิเศษ';
  const lower = category.toLowerCase();
  if (['food', 'drinks', 'groceries', 'dining', 'café', 'cafe', 'restaurant', 'ของกิน'].includes(lower)) return 'ของกิน';
  if (['fashion', 'clothing', 'apparel', 'เสื้อผ้า'].includes(lower)) return 'เสื้อผ้า';
  if (['travel', 'hotel', 'tourism', 'การท่องเที่ยว'].includes(lower)) return 'การท่องเที่ยว';
  return 'โปรพิเศษ';
}

// ─── Unified feed item ──────────────────────────────────────────────────────
interface FeedItem {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  verified: boolean;
  timeAgo: string;
  content: string;
  imageUrl?: string;
  location?: string;
  placeId?: string;
  lat?: number;
  lng?: number;
  discount?: string;
  category?: string;
  tag: CategoryTag;
  likes: number;
  comments: number;
  reposts: number;
  shares: number;
  isBrand: boolean;
}

interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timeAgo: string;
}

function brandToFeed(p: BrandPost): FeedItem {
  return {
    id: p.id,
    displayName: p.brandName,
    username: p.brandName.toLowerCase().replace(/[^a-z0-9]/g, ''),
    avatar: p.brandLogo,
    verified: p.brandVerified,
    timeAgo: p.timeAgo,
    content: `${p.title}\n\n${p.description}`,
    imageUrl: p.imageUrl,
    location: p.location,
    discount: p.discount,
    category: p.category,
    tag: mapCategoryToTag(p.category),
    likes: p.likes,
    comments: Math.floor(Math.random() * 30) + 5,
    reposts: Math.floor(p.shares * 0.6),
    shares: p.shares,
    isBrand: true,
  };
}

// Map user post content to a tag based on keywords
function guessUserTag(caption: string): CategoryTag {
  const lower = caption.toLowerCase();
  if (/coffee|café|food|lunch|ramen|pizza|snack|milk|chicken|meal|drink|อาหาร|กาแฟ/.test(lower)) return 'ของกิน';
  if (/fashion|clothes|shirt|เสื้อ|skincare|beauty|boots/.test(lower)) return 'เสื้อผ้า';
  if (/travel|hotel|flight|ท่องเที่ยว|gym|fitness/.test(lower)) return 'การท่องเที่ยว';
  return 'โปรพิเศษ';
}

function userToFeed(p: UserPost): FeedItem {
  return {
    id: p.id,
    displayName: p.userName,
    username: p.userName.toLowerCase().replace(/\s/g, ''),
    avatar: p.userAvatar,
    verified: p.userLevel >= 10,
    timeAgo: p.timeAgo,
    content: p.caption,
    imageUrl: p.imageUrl,
    location: p.location,
    tag: guessUserTag(p.caption),
    likes: p.helpful,
    comments: p.comments,
    reposts: Math.floor(p.helpful * 0.3),
    shares: Math.floor(p.helpful * 0.2),
    isBrand: false,
  };
}

function shortTime(t: string) {
  if (t.includes('min')) return t.replace(/\s*mins?\s*ago/, 'm');
  if (t.includes('hour')) return t.replace(/\s*hours?\s*ago/, 'h');
  if (t.includes('day')) return t.replace(/\s*days?\s*ago/, 'd');
  if (t.includes('week')) return t.replace(/\s*weeks?\s*ago/, 'w');
  return t;
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'เมื่อกี้';
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} weeks ago`;
}

// ─── Share helper ────────────────────────────────────────────────────────────
async function sharePost(item: FeedItem) {
  const text = `${item.displayName}: ${item.content.slice(0, 100)}...`;
  const url = typeof window !== 'undefined' ? window.location.href : '';

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: `โพสต์จาก ${item.displayName}`, text, url });
      return 'shared';
    } catch {
      return 'cancelled';
    }
  }
  // fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return 'copied';
  } catch {
    return 'error';
  }
}

// ─── Single Post Row ────────────────────────────────────────────────────────
function PostRow({ item }: { item: FeedItem }) {
  const user = useAuthStore((s) => s.user);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(item.reposts);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Comments
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [commentCount, setCommentCount] = useState(item.comments);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [latestComment, setLatestComment] = useState<CommentItem | null>(null);
  const commentRef = useRef<HTMLInputElement>(null);

  // Current user info
  const currentUserName = user?.name || 'Anonymous';
  const currentUserAvatar = user?.avatar || '';
  const currentUsername = user?.email?.split('@')[0] || 'user';

  // ── Preload comment count + latest comment on mount ──
  useEffect(() => {
    let cancelled = false;
    const loadPreview = async () => {
      // Try DB first
      if (isSupabaseConfigured) {
        try {
          const res = await fetch(`/api/community-posts/comments?post_id=${item.id}`);
          const json = await res.json();
          if (!cancelled && json.comments && Array.isArray(json.comments)) {
            const dbComments: CommentItem[] = json.comments.map((c: Record<string, unknown>) => ({
              id: c.id as string,
              author: c.display_name as string || 'Anonymous',
              avatar: c.avatar_url as string || '',
              text: c.content as string,
              timeAgo: formatTimeAgo(c.created_at as string),
            }));
            if (dbComments.length > 0) {
              setCommentCount(dbComments.length);
              setLatestComment(dbComments[dbComments.length - 1]);
              setCommentsList(dbComments);
              setCommentsLoaded(true);
              return;
            }
          }
        } catch {}
      }
      // Fallback: localStorage
      try {
        const stored = localStorage.getItem(`comments_${item.id}`);
        if (!cancelled && stored) {
          const parsed = JSON.parse(stored) as CommentItem[];
          if (parsed.length > 0) {
            setCommentCount(Math.max(parsed.length, item.comments));
            setLatestComment(parsed[parsed.length - 1]);
            setCommentsList(parsed);
            setCommentsLoaded(true);
          }
        }
      } catch {}
    };
    loadPreview();
    return () => { cancelled = true; };
  }, [item.id, item.comments]);

  // ── Preload like status on mount ──
  useEffect(() => {
    let cancelled = false;
    const loadLikeStatus = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const headers: Record<string, string> = {};
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        const res = await fetch(`/api/community-posts/likes?post_id=${item.id}`, { headers });
        const json = await res.json();
        if (!cancelled) {
          if (typeof json.count === 'number') setLikeCount(json.count);
          if (json.liked) setLiked(true);
        }
      } catch {}
    };
    loadLikeStatus();
    return () => { cancelled = true; };
  }, [item.id]);

  const handleLike = async () => {
    // Optimistic UI
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));

    // Persist to Supabase
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          // Not logged in — revert
          setLiked(wasLiked);
          setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
          setToastMsg('กรุณาล็อกอินก่อนกดไลก์');
          setTimeout(() => setToastMsg(null), 2500);
          return;
        }
        const res = await fetch('/api/community-posts/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ post_id: item.id }),
        });
        const json = await res.json();
        if (json.error) {
          // Revert on error
          setLiked(wasLiked);
          setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
        }
      } catch {
        // Revert on network error
        setLiked(wasLiked);
        setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
      }
    }
  };

  const handleRepost = () => {
    setReposted(!reposted);
    setRepostCount((c) => (reposted ? c - 1 : c + 1));
  };

  const handleShare = async () => {
    const result = await sharePost(item);
    if (result === 'copied') {
      setShareStatus('copied');
      setToastMsg('📋 คัดลอกลิงก์แล้ว!');
      setTimeout(() => { setShareStatus('idle'); setToastMsg(null); }, 2500);
    } else if (result === 'shared') {
      setToastMsg('✅ แชร์สำเร็จ!');
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  // localStorage key for this post's comments
  const storageKey = `comments_${item.id}`;

  // Toggle comment section open/close (data already preloaded)
  const handleComment = () => {
    const opening = !showComments;
    setShowComments(opening);
    if (opening) {
      setTimeout(() => commentRef.current?.focus(), 100);
    }
  };

  // Save comments to localStorage
  const saveToLocalStorage = (comments: CommentItem[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(comments));
    } catch {}
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

    // Update UI immediately
    const updatedList = [...commentsList, newComment];
    setCommentsList(updatedList);
    setCommentCount((c) => c + 1);
    setCommentText('');
    setLatestComment(newComment);

    // Always save to localStorage (guaranteed persistence)
    saveToLocalStorage(updatedList);

    // Also try to save to DB (bonus — not required for persistence)
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
              post_id: item.id,
              content: text,
              display_name: currentUserName,
              username: currentUsername,
              avatar_url: currentUserAvatar || null,
            }),
          });
          const json = await res.json();
          if (json.comment) {
            setCommentsList((prev) =>
              prev.map((c) =>
                c.id === newComment.id ? { ...c, id: json.comment.id } : c
              )
            );
          }
        }
      } catch (e) {
        console.error('DB comment save failed (localStorage OK):', e);
      }
    }
  };

  return (
    <article className="border-b border-gray-200 hover:bg-gray-50/60 transition-colors">
      <div className="flex gap-3 px-4 py-4">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          {item.avatar ? (
            <Image
              src={item.avatar}
              alt={item.displayName}
              width={46}
              height={46}
              className="rounded-full ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="w-[46px] h-[46px] rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white shadow-sm">
              {(item.displayName || '?').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1.5 text-sm leading-5 flex-wrap">
            <span className="font-bold text-gray-900 truncate max-w-[180px]">
              {item.displayName}
            </span>
            {item.verified && (
              <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
            {item.isBrand && (
              <Store className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            )}
            <span className="text-gray-400 truncate">@{item.username}</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400 flex-shrink-0">{shortTime(item.timeAgo)}</span>
          </div>

          {/* Content */}
          <div className="mt-1.5 text-[15px] leading-relaxed text-gray-800 whitespace-pre-line break-words">
            {item.content}
          </div>

          {/* Badges */}
          {(item.discount || item.location || item.category || item.tag) && (
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {item.tag && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 ring-1 ring-purple-200">
                  {item.tag}
                </span>
              )}
              {item.discount && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 ring-1 ring-red-200">
                  <TrendingUp className="w-3 h-3" />
                  {item.discount}
                </span>
              )}
              {item.category && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 ring-1 ring-orange-200">
                  {item.category}
                </span>
              )}
              {item.location && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3 text-red-400" />
                  {item.location}
                </span>
              )}
            </div>
          )}

          {/* Image */}
          {item.imageUrl && (
            <div className="mt-3 relative rounded-2xl overflow-hidden border border-gray-200 max-h-80">
              {item.imageUrl.startsWith('blob:') ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={item.imageUrl} alt="" className="w-full object-cover max-h-80" />
              ) : (
                <Image src={item.imageUrl} alt="" width={600} height={340} className="w-full object-cover" />
              )}
            </div>
          )}

          {/* ── Action bar ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between mt-3 max-w-md -ml-2">
            {/* Comment */}
            <button
              type="button"
              onClick={handleComment}
              className={`group flex items-center gap-1.5 transition-colors ${showComments ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
            >
              <span className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                <MessageCircle className={`w-[18px] h-[18px] ${showComments ? 'fill-blue-100' : ''}`} />
              </span>
              <span className="text-xs tabular-nums">{commentCount}</span>
            </button>

            {/* Repost */}
            <button
              type="button"
              onClick={handleRepost}
              className={`group flex items-center gap-1.5 transition-colors ${reposted ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
            >
              <span className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                <Repeat2 className="w-[18px] h-[18px]" />
              </span>
              <span className="text-xs tabular-nums">{repostCount}</span>
            </button>

            {/* Like */}
            <button
              type="button"
              onClick={handleLike}
              className={`group flex items-center gap-1.5 transition-colors ${liked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
            >
              <span className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
                <Heart className={`w-[18px] h-[18px] ${liked ? 'fill-current' : ''}`} />
              </span>
              <span className="text-xs tabular-nums">{likeCount}</span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className={`group flex items-center gap-1.5 transition-colors ${shareStatus === 'copied' ? 'text-green-500' : 'text-gray-400 hover:text-blue-500'}`}
            >
              <span className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                {shareStatus === 'copied' ? (
                  <Check className="w-[18px] h-[18px]" />
                ) : (
                  <Share2 className="w-[18px] h-[18px]" />
                )}
              </span>
              {shareStatus === 'copied' && (
                <span className="text-xs">คัดลอกแล้ว!</span>
              )}
            </button>
          </div>

          {/* Toast notification */}
          {toastMsg && (
            <div className="mt-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-full w-fit animate-in fade-in slide-in-from-bottom-2 duration-200">
              {toastMsg}
            </div>
          )}

          {/* Latest comment preview (always visible when not expanded) */}
          {!showComments && latestComment && (
            <button
              type="button"
              onClick={handleComment}
              className="mt-2 flex gap-2 items-start text-left w-full group"
            >
              {latestComment.avatar ? (
                <Image src={latestComment.avatar} alt={latestComment.author} width={22} height={22} className="rounded-full flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-[22px] h-[22px] rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5">
                  {(latestComment.author || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-gray-700">{latestComment.author}</span>{' '}
                <span className="text-xs text-gray-500 line-clamp-1">{latestComment.text}</span>
              </div>
              <span className="text-[10px] text-blue-400 group-hover:text-blue-500 flex-shrink-0 mt-0.5">ดูทั้งหมด</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Comment section ──────────────────────────────────────── */}
      {showComments && (
        <div className="px-4 pb-4 ml-[62px]">
          {/* Existing comments */}
          {commentsList.length > 0 && (
            <div className="space-y-3 mb-3">
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

          {/* Comment input */}
          <div className="flex gap-2.5 items-center">
            {currentUserAvatar ? (
              <Image
                src={currentUserAvatar}
                alt={currentUserName}
                width={28}
                height={28}
                className="rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {currentUserName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <input
                ref={commentRef}
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
                  commentText.trim()
                    ? 'text-orange-500 hover:bg-orange-100'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  Google Places Autocomplete Input (Location Tagging)
// ═════════════════════════════════════════════════════════════════════════════

interface PlacesAutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (description: string, placeId: string, coords: { lat: number; lng: number }) => void;
  onClear: () => void;
  isTagged: boolean;
}

function PlacesAutocompleteInput({ value, onChange, onSelect, onClear, isTagged }: PlacesAutocompleteInputProps) {
  const {
    ready,
    suggestions: { status, data },
    setValue: setAutocompleteValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: 'th' } },
    debounce: 300,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setAutocompleteValue(val);
    setShowDropdown(true);
  };

  const handleSelect = async (description: string, placeId: string) => {
    setAutocompleteValue(description, false);
    clearSuggestions();
    setShowDropdown(false);

    try {
      const results = await getGeocode({ placeId });
      const { lat, lng } = getLatLng(results[0]);
      onSelect(description, placeId, { lat, lng });
    } catch {
      // If geocode fails, still tag with just the name
      onSelect(description, placeId, { lat: 0, lng: 0 });
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400 z-10 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={handleInput}
        disabled={!ready}
        placeholder="ระบุสถานที่ร้านค้า เช่น Starbucks Siam Paragon"
        className={`w-full bg-gray-50 border rounded-xl pl-10 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-colors ${
          isTagged ? 'border-green-300 bg-green-50/50 pr-10' : 'border-gray-200 pr-4'
        }`}
      />
      {/* Clear tag button */}
      {isTagged && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          title="ลบแท็กสถานที่"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Suggestions dropdown */}
      {showDropdown && status === 'OK' && data.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {data.map(({ place_id, structured_formatting }) => (
            <li key={place_id}>
              <button
                type="button"
                onClick={() => handleSelect(structured_formatting.main_text + (structured_formatting.secondary_text ? ', ' + structured_formatting.secondary_text : ''), place_id)}
                className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors flex items-start gap-3 border-b border-gray-50 last:border-0"
              >
                <MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {structured_formatting.main_text}
                  </p>
                  {structured_formatting.secondary_text && (
                    <p className="text-xs text-gray-400 truncate">
                      {structured_formatting.secondary_text}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

type FeedTab = 'brands' | 'users';

interface RealTimeFeedProps {
  showCreateModal?: boolean;
  setShowCreateModal?: (show: boolean) => void;
}

export default function RealTimeFeed({ showCreateModal = false, setShowCreateModal }: RealTimeFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>('brands');
  const [selectedTag, setSelectedTag] = useState<CategoryTag | 'ทั้งหมด'>('ทั้งหมด');
  const { user } = useAuthStore();

  // — Create-post modal state —
  const [modalText, setModalText] = useState('');
  const [modalTag, setModalTag] = useState<CategoryTag | null>(null);
  const [modalImagePreview, setModalImagePreview] = useState<string | null>(null);
  const [modalImageFile, setModalImageFile] = useState<File | null>(null);
  const [modalLocation, setModalLocation] = useState('');
  // ── Google Places Autocomplete state ──
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // ── Google Maps loader (skip if no API key to avoid NoApiKeys warning) ──
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded: _isMapsLoaded } = useLoadScript({
    googleMapsApiKey,
    libraries: GOOGLE_MAPS_LIBS,
  });
  // Only consider maps loaded if we actually have an API key
  const isMapsLoaded = googleMapsApiKey ? _isMapsLoaded : false;

  // — Mutable feed arrays —
  const [extraBrandItems, setExtraBrandItems] = useState<FeedItem[]>([]);
  const [extraUserItems, setExtraUserItems] = useState<FeedItem[]>([]);
  // — DB-loaded posts —
  const [dbPosts, setDbPosts] = useState<FeedItem[]>([]);

  // ── Load posts from Supabase on mount ──
  const loadPosts = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setIsLoadingPosts(true);
    try {
      const res = await fetch('/api/community-posts');
      const json = await res.json();
      if (json.posts && Array.isArray(json.posts)) {
        const items: FeedItem[] = json.posts.map((p: Record<string, unknown>) => ({
          id: p.id as string,
          displayName: p.display_name as string || 'Anonymous',
          username: p.username as string || 'user',
          avatar: p.avatar_url as string || '',
          verified: false,
          timeAgo: formatTimeAgo(p.created_at as string),
          content: p.content as string,
          imageUrl: p.image_url as string | undefined,
          location: p.location as string | undefined,
          placeId: p.place_id as string | undefined,
          lat: p.lat as number | undefined,
          lng: p.lng as number | undefined,
          tag: (p.tag as CategoryTag) || 'โปรพิเศษ',
          likes: (p.likes as number) || 0,
          comments: (p.comments as number) || 0,
          reposts: (p.reposts as number) || 0,
          shares: (p.shares as number) || 0,
          isBrand: (p.is_brand as boolean) || false,
        }));
        setDbPosts(items);
      }
    } catch (e) {
      console.error('Failed to load community posts:', e);
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const brandFeed: FeedItem[] = [
    ...extraBrandItems,
    ...dbPosts.filter(p => p.isBrand),
    ...mockBrandPosts.map(brandToFeed),
  ];
  const userFeed: FeedItem[] = [
    ...extraUserItems,
    ...dbPosts.filter(p => !p.isBrand),
    ...mockUserPosts.map(userToFeed),
  ];
  const rawFeed = activeTab === 'brands' ? brandFeed : userFeed;
  const feed = selectedTag === 'ทั้งหมด' ? rawFeed : rawFeed.filter((item) => item.tag === selectedTag);

  // — Modal handlers —
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (modalImagePreview) URL.revokeObjectURL(modalImagePreview);
      setModalImagePreview(URL.createObjectURL(file));
      setModalImageFile(file);
    }
  };

  const removeImage = () => {
    if (modalImagePreview) URL.revokeObjectURL(modalImagePreview);
    setModalImagePreview(null);
    setModalImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openModal = () => setShowCreateModal?.(true);

  const closeModal = () => {
    setShowCreateModal?.(false);
    setModalText('');
    setModalTag(null);
    removeImage();
    setModalLocation('');
    setSelectedPlaceId(null);
    setSelectedCoords(null);
  };

  const handleModalSubmit = async () => {
    if (!modalText.trim() || !modalTag || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (token && isSupabaseConfigured) {
        // Save to Supabase via API
        const formData = new FormData();
        formData.append('content', modalText.trim());
        formData.append('tag', modalTag);
        if (modalLocation.trim()) formData.append('location', modalLocation.trim());
        if (selectedPlaceId) formData.append('place_id', selectedPlaceId);
        if (selectedCoords) {
          formData.append('lat', String(selectedCoords.lat));
          formData.append('lng', String(selectedCoords.lng));
        }
        formData.append('display_name', user?.name || 'Anonymous');
        formData.append('username', user?.email?.split('@')[0] || 'user');
        if (user?.avatar) formData.append('avatar_url', user.avatar);
        if (modalImageFile) formData.append('image', modalImageFile);

        const res = await fetch('/api/community-posts', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const json = await res.json();
        if (json.post) {
          // Reload feed from DB
          await loadPosts();
          setActiveTab('users');
          setIsSubmitting(false);
          closeModal();
          return;
        }
      }

      // Fallback: add to local state only (no auth or Supabase not configured)
      const newItem: FeedItem = {
        id: `new-${Date.now()}`,
        displayName: user?.name || 'You',
        username: user?.email?.split('@')[0] || 'hunter_you',
        avatar: user?.avatar || '',
        verified: false,
        timeAgo: 'เมื่อกี้',
        content: modalText.trim(),
        imageUrl: modalImagePreview || undefined,
        location: modalLocation.trim() || undefined,
        placeId: selectedPlaceId ?? undefined,
        lat: selectedCoords?.lat,
        lng: selectedCoords?.lng,
        tag: modalTag,
        likes: 0,
        comments: 0,
        reposts: 0,
        shares: 0,
        isBrand: false,
      };

      setExtraUserItems((prev) => [newItem, ...prev]);
      setActiveTab('users');
    } catch (e) {
      console.error('Failed to submit post:', e);
    } finally {
      setIsSubmitting(false);
      closeModal();
    }
  };

  return (
    <section className="bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 py-8 min-h-screen">
      <div className="max-w-2xl mx-auto">

        {/* ─── Header ───────────────────────────────────────────────── */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 rounded-full bg-orange-500" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                COMMUNITY FEED
              </h2>
              <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse">
                LIVE
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-3 mt-5">
            <button
              type="button"
              onClick={() => setActiveTab('brands')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeTab === 'brands'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/25 scale-105'
                  : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'
              }`}
            >
              <Store className="w-4 h-4" />
              Brand Posts
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'brands' ? 'bg-white/20' : 'bg-gray-200'
              }`}>{brandFeed.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25 scale-105'
                  : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'
              }`}
            >
              <Users className="w-4 h-4" />
              User Posts
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'users' ? 'bg-white/20' : 'bg-gray-200'
              }`}>{userFeed.length}</span>
            </button>
          </div>

          {/* Category Tag Filters */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            {(['ทั้งหมด', ...CATEGORY_TAGS] as const).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedTag === tag
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 scale-105'
                    : 'bg-white text-gray-500 hover:bg-purple-50 hover:text-purple-600 shadow-sm border border-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Create Post Trigger ─────────────────────────────────── */}
        <button
          type="button"
          onClick={openModal}
          className="mx-4 mb-6 w-[calc(100%-2rem)] bg-white border-2 border-dashed border-gray-300 rounded-2xl p-4 hover:border-orange-400 hover:bg-orange-50/30 transition-all flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 ring-2 ring-orange-200">
            <PenLine className="w-5 h-5 text-orange-500" />
          </div>
          <span className="text-gray-400 text-[15px]">แชร์ดีลดีๆ ที่เจอ...</span>
        </button>

        {/* ─── Feed ─────────────────────────────────────────────────── */}
        <div className="mx-4 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-200">
          {isLoadingPosts ? (
            <div className="py-16 text-center text-gray-400">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-40" />
              <p className="text-sm">กำลังโหลดโพสต์...</p>
            </div>
          ) : feed.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">ยังไม่มีโพสต์ เริ่มแชร์เลย!</p>
            </div>
          ) : (
            feed.map((item) => (
              <PostRow key={item.id} item={item} />
            ))
          )}
        </div>

      </div>

      {/* ═══ Create Post Modal ═══════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">สร้างโพสต์ใหม่</h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Author row */}
              <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user?.name || 'You'}
                    width={40}
                    height={40}
                    className="rounded-full ring-2 ring-orange-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold ring-2 ring-orange-200">
                    {(user?.name || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-900 text-sm">You</p>
                  <p className="text-xs text-gray-400">@hunter_you</p>
                </div>
              </div>

              {/* Text area */}
              <textarea
                value={modalText}
                onChange={(e) => setModalText(e.target.value)}
                placeholder="เล่ารายละเอียดดีลที่เจอ..."
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent leading-relaxed"
                autoFocus
              />

              {/* Tag selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  เลือกหมวดหมู่ <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setModalTag(tag)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        modalTag === tag
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600 border border-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {!modalTag && modalText.trim() && (
                  <p className="text-xs text-red-400 mt-1.5">กรุณาเลือกหมวดหมู่ก่อนโพสต์</p>
                )}
              </div>

              {/* Image upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {modalImagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={modalImagePreview}
                      alt="Preview"
                      className="w-full max-h-64 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-36 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50/30 transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-orange-400 transition-colors" />
                    <span className="text-sm text-gray-400 group-hover:text-orange-500 font-medium">คลิกเพื่อเลือกรูปภาพ</span>
                  </button>
                )}
              </div>

              {/* ── Google Places Autocomplete Location Tagging ── */}
              {isMapsLoaded ? (
                <PlacesAutocompleteInput
                  value={modalLocation}
                  onChange={setModalLocation}
                  onSelect={(description, placeId, coords) => {
                    setModalLocation(description);
                    setSelectedPlaceId(placeId);
                    setSelectedCoords(coords);
                  }}
                  onClear={() => {
                    setModalLocation('');
                    setSelectedPlaceId(null);
                    setSelectedCoords(null);
                  }}
                  isTagged={!!selectedPlaceId}
                />
              ) : (
                /* Fallback while Google Maps loads */
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                  <input
                    type="text"
                    value={modalLocation}
                    onChange={(e) => setModalLocation(e.target.value)}
                    placeholder="ระบุสถานที่ร้านค้า เช่น Starbucks Siam Paragon"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Footer — image icon removed per design requirement */}
            <div className="flex items-center justify-end px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                type="button"
                onClick={handleModalSubmit}
                disabled={!modalText.trim() || !modalTag || isSubmitting}
                className={`px-7 py-2.5 rounded-full text-sm font-bold transition-all ${
                  modalText.trim() && modalTag && !isSubmitting
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    กำลังโพสต์...
                  </span>
                ) : (
                  'โพสต์'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
