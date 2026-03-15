'use client';

import { useState, useCallback, useRef } from 'react';
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
} from 'lucide-react';
import Image from 'next/image';
import { mockBrandPosts, mockUserPosts } from '@/data/communityPosts';
import type { BrandPost, UserPost } from '@/data/communityPosts';

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
  discount?: string;
  category?: string;
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
    likes: p.likes,
    comments: Math.floor(Math.random() * 30) + 5,
    reposts: Math.floor(p.shares * 0.6),
    shares: p.shares,
    isBrand: true,
  };
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
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(item.reposts);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  // Comments
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [commentCount, setCommentCount] = useState(item.comments);
  const commentRef = useRef<HTMLInputElement>(null);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleRepost = () => {
    setReposted(!reposted);
    setRepostCount((c) => (reposted ? c - 1 : c + 1));
  };

  const handleShare = async () => {
    const result = await sharePost(item);
    if (result === 'copied') {
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  };

  const handleComment = () => {
    setShowComments(!showComments);
    if (!showComments) {
      setTimeout(() => commentRef.current?.focus(), 100);
    }
  };

  const submitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    setCommentsList((prev) => [
      ...prev,
      {
        id: `cmt-${Date.now()}`,
        author: 'You',
        avatar: 'https://i.pravatar.cc/150?img=68',
        text,
        timeAgo: 'เมื่อกี้',
      },
    ]);
    setCommentCount((c) => c + 1);
    setCommentText('');
  };

  return (
    <article className="border-b border-gray-200 hover:bg-gray-50/60 transition-colors">
      <div className="flex gap-3 px-4 py-4">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          <Image
            src={item.avatar}
            alt={item.displayName}
            width={46}
            height={46}
            className="rounded-full ring-2 ring-white shadow-sm"
          />
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
          {(item.discount || item.location || item.category) && (
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
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
              <Image
                src={item.imageUrl}
                alt=""
                width={600}
                height={340}
                className="w-full object-cover"
              />
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
                  <Image src={cmt.avatar} alt={cmt.author} width={28} height={28} className="rounded-full flex-shrink-0" />
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
            <Image
              src="https://i.pravatar.cc/150?img=68"
              alt="You"
              width={28}
              height={28}
              className="rounded-full flex-shrink-0"
            />
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
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

type FeedTab = 'brands' | 'users';

export default function RealTimeFeed() {
  const [activeTab, setActiveTab] = useState<FeedTab>('brands');

  // — Create‑post state —
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // — Mutable feed arrays —
  const [extraBrandItems, setExtraBrandItems] = useState<FeedItem[]>([]);
  const [extraUserItems, setExtraUserItems] = useState<FeedItem[]>([]);

  const brandFeed: FeedItem[] = [
    ...extraBrandItems,
    ...mockBrandPosts.map(brandToFeed),
  ];
  const userFeed: FeedItem[] = [
    ...extraUserItems,
    ...mockUserPosts.map(userToFeed),
  ];
  const feed = activeTab === 'brands' ? brandFeed : userFeed;

  // — Submit new post —
  const handlePost = useCallback(async () => {
    const text = postText.trim();
    if (!text || isPosting) return;

    setIsPosting(true);
    await new Promise((r) => setTimeout(r, 1000));

    const newItem: FeedItem = {
      id: `new-${Date.now()}`,
      displayName: 'You',
      username: 'hunter_you',
      avatar: 'https://i.pravatar.cc/150?img=68',
      verified: false,
      timeAgo: 'เมื่อกี้',
      content: text,
      likes: 0,
      comments: 0,
      reposts: 0,
      shares: 0,
      isBrand: activeTab === 'brands',
    };

    if (activeTab === 'brands') {
      setExtraBrandItems((prev) => [newItem, ...prev]);
    } else {
      setExtraUserItems((prev) => [newItem, ...prev]);
    }

    setPostText('');
    setIsPosting(false);
  }, [postText, isPosting, activeTab]);

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
        </div>

        {/* ─── Create Post Box ──────────────────────────────────────── */}
        <div className="mx-4 mb-6 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 flex gap-3">
            <Image
              src="https://i.pravatar.cc/150?img=68"
              alt="You"
              width={44}
              height={44}
              className="rounded-full flex-shrink-0 ring-2 ring-orange-200"
            />
            <div className="flex-1 min-w-0">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="แชร์ดีลเด็ดๆ ที่เจอ..."
                rows={2}
                className="w-full bg-transparent text-[15px] text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none leading-relaxed"
              />
            </div>
          </div>
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-1">
              <button type="button" className="p-2 rounded-full text-orange-400 hover:bg-orange-100 transition-colors">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button type="button" className="p-2 rounded-full text-orange-400 hover:bg-orange-100 transition-colors">
                <MapPin className="w-5 h-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={handlePost}
              disabled={!postText.trim() || isPosting}
              className={`
                px-6 py-2.5 rounded-full text-sm font-bold transition-all
                ${postText.trim() && !isPosting
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isPosting ? (
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

        {/* ─── Feed ─────────────────────────────────────────────────── */}
        <div className="mx-4 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-200">
          {feed.length === 0 ? (
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
    </section>
  );
}
