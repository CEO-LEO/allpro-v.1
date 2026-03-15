'use client';

import { useState, useCallback } from 'react';
import {
  MessageCircle,
  Repeat2,
  Heart,
  Share,
  Loader2,
  ImageIcon,
  MapPin,
  Store,
  Users,
  Sparkles,
  BadgeCheck,
  TrendingUp,
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

// ─── Shorten time ────────────────────────────────────────────────────────────
function shortTime(t: string) {
  if (t.includes('min')) return t.replace(/\s*mins?\s*ago/, 'm');
  if (t.includes('hour')) return t.replace(/\s*hours?\s*ago/, 'h');
  if (t.includes('day')) return t.replace(/\s*days?\s*ago/, 'd');
  if (t.includes('week')) return t.replace(/\s*weeks?\s*ago/, 'w');
  return t;
}

// ─── Action Button (X-style) ────────────────────────────────────────────────
function ActionBtn({
  icon: Icon,
  count,
  hoverColor,
  activeColor,
  active,
  onClick,
}: {
  icon: React.ElementType;
  count: number;
  hoverColor: string;
  activeColor: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-1.5 text-neutral-500 transition-colors ${active ? activeColor : ''}`}
    >
      <span
        className={`p-2 rounded-full transition-colors ${
          active ? '' : `group-hover:${hoverColor}`
        } group-hover:bg-opacity-100`}
        style={{ lineHeight: 0 }}
      >
        <Icon className={`w-[18px] h-[18px] ${active ? 'fill-current' : ''}`} />
      </span>
      {count > 0 && (
        <span className="text-xs tabular-nums">{count}</span>
      )}
    </button>
  );
}

// ─── Single Post Row (X/Twitter style) ──────────────────────────────────────
function PostRow({ item }: { item: FeedItem }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(item.reposts);

  return (
    <article className="flex gap-3 px-4 py-3 border-b border-neutral-800 hover:bg-neutral-900/40 transition-colors cursor-pointer">
      {/* Avatar */}
      <div className="flex-shrink-0 pt-0.5">
        <Image
          src={item.avatar}
          alt={item.displayName}
          width={44}
          height={44}
          className="rounded-full"
        />
      </div>

      {/* Right side */}
      <div className="flex-1 min-w-0">
        {/* Header line */}
        <div className="flex items-center gap-1 text-sm leading-5 flex-wrap">
          <span className="font-bold text-neutral-100 truncate max-w-[160px]">
            {item.displayName}
          </span>
          {item.verified && (
            <BadgeCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
          )}
          {item.isBrand && (
            <Store className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          )}
          <span className="text-neutral-500 truncate">@{item.username}</span>
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-500 flex-shrink-0">{shortTime(item.timeAgo)}</span>
        </div>

        {/* Content */}
        <div className="mt-1 text-[15px] leading-relaxed text-neutral-200 whitespace-pre-line break-words">
          {item.content}
        </div>

        {/* Badges row */}
        {(item.discount || item.location || item.category) && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {item.discount && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 ring-1 ring-red-500/20">
                <TrendingUp className="w-3 h-3" />
                {item.discount}
              </span>
            )}
            {item.category && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400 ring-1 ring-neutral-700">
                {item.category}
              </span>
            )}
            {item.location && (
              <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                <MapPin className="w-3 h-3" />
                {item.location}
              </span>
            )}
          </div>
        )}

        {/* Image */}
        {item.imageUrl && (
          <div className="mt-3 relative rounded-2xl overflow-hidden border border-neutral-800 max-h-80">
            <Image
              src={item.imageUrl}
              alt=""
              width={600}
              height={340}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between mt-3 max-w-md -ml-2">
          <ActionBtn
            icon={MessageCircle}
            count={item.comments}
            hoverColor="bg-blue-500/10 text-blue-400"
            activeColor="text-blue-400"
          />
          <ActionBtn
            icon={Repeat2}
            count={repostCount}
            hoverColor="bg-green-500/10 text-green-400"
            activeColor="text-green-400"
            active={reposted}
            onClick={() => {
              setReposted(!reposted);
              setRepostCount((c) => (reposted ? c - 1 : c + 1));
            }}
          />
          <ActionBtn
            icon={Heart}
            count={likeCount}
            hoverColor="bg-pink-500/10 text-pink-400"
            activeColor="text-pink-400"
            active={liked}
            onClick={() => {
              setLiked(!liked);
              setLikeCount((c) => (liked ? c - 1 : c + 1));
            }}
          />
          <ActionBtn
            icon={Share}
            count={item.shares}
            hoverColor="bg-blue-500/10 text-blue-400"
            activeColor="text-blue-400"
          />
        </div>
      </div>
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
    // simulate network
    await new Promise((r) => setTimeout(r, 1000));

    const newItem: FeedItem = {
      id: `new-${Date.now()}`,
      displayName: 'You',
      username: 'hunter_you',
      avatar: 'https://i.pravatar.cc/150?img=68',
      verified: false,
      timeAgo: 'Just now',
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
    <section className="bg-neutral-950 min-h-screen">
      <div className="max-w-2xl mx-auto border-x border-neutral-800 min-h-screen">

        {/* ─── Header ───────────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-800">
          <div className="px-4 pt-4 pb-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-7 rounded-full bg-lime-500" />
              <h2 className="text-xl font-bold text-neutral-100">Community Feed</h2>
              <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                LIVE
              </span>
            </div>

            {/* Tabs */}
            <div className="flex">
              <button
                type="button"
                onClick={() => setActiveTab('brands')}
                className={`flex-1 py-3 text-sm font-bold text-center transition-colors relative ${
                  activeTab === 'brands' ? 'text-neutral-100' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Brand Posts
                  <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">
                    {brandFeed.length}
                  </span>
                </span>
                {activeTab === 'brands' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-lime-500" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 text-sm font-bold text-center transition-colors relative ${
                  activeTab === 'users' ? 'text-neutral-100' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  User Posts
                  <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">
                    {userFeed.length}
                  </span>
                </span>
                {activeTab === 'users' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-lime-500" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ─── Create Post Box ──────────────────────────────────────── */}
        <div className="px-4 py-4 border-b border-neutral-800 flex gap-3">
          <Image
            src="https://i.pravatar.cc/150?img=68"
            alt="You"
            width={44}
            height={44}
            className="rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="แชร์ดีลเด็ดให้คอมมูนิตี้..."
              rows={2}
              className="w-full bg-transparent text-[15px] text-neutral-100 placeholder:text-neutral-600 resize-none focus:outline-none leading-relaxed"
            />
            {/* Toolbar + Post btn */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/60">
              <div className="flex items-center gap-1 -ml-2">
                <button type="button" className="p-2 rounded-full text-lime-400 hover:bg-lime-500/10 transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 rounded-full text-lime-400 hover:bg-lime-500/10 transition-colors">
                  <MapPin className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 rounded-full text-lime-400 hover:bg-lime-500/10 transition-colors">
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
              <button
                type="button"
                onClick={handlePost}
                disabled={!postText.trim() || isPosting}
                className={`
                  px-5 py-2 rounded-full text-sm font-bold transition-all
                  ${postText.trim() && !isPosting
                    ? 'bg-lime-500 text-neutral-950 hover:bg-lime-400 shadow-[0_0_16px_-4px_rgba(132,204,22,0.4)]'
                    : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
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
        </div>

        {/* ─── Feed ─────────────────────────────────────────────────── */}
        <div>
          {feed.map((item) => (
            <PostRow key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
