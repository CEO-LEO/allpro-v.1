'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Store, Star, Package, MapPin, CheckCircle, ArrowLeft,
  Bell, Heart, Share2, MessageCircle, Globe, ExternalLink, Tag
} from 'lucide-react';
import { useProductStore, type Product } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getSocialLinks } from '@/lib/socialLinks';
import { getPromotions } from '@/lib/getPromotions';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';
import { fetchShopPublicStats, trackShopView, type ShopPublicStats } from '@/lib/analytics';

interface ShopInfo {
  id: string;
  name: string;
  logo: string;
  description: string;
  verified: boolean;
  rating: number;
  totalProducts: number;
  location: string;
  memberSince: string;
  socialLine?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialWebsite?: string;
}

// ── Avatar helpers ──────────────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  'from-orange-500 to-rose-500',
  'from-violet-500 to-purple-700',
  'from-blue-500 to-cyan-600',
  'from-green-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-blue-700',
  'from-teal-500 to-green-600',
];
function getAvatarGradient(name: string) {
  const code = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
  return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length];
}
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

type Tab = 'all' | 'top' | 'sale';

export default function PublicShopPage() {
  const params = useParams();
  const shopId = params.shopId as string;
  const { products } = useProductStore();
  const { user: authUser, savedMerchantProfile } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [isFollowed, setIsFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [shopStats, setShopStats] = useState<ShopPublicStats | null>(null);

  // ── Follow: persist to localStorage ──────────────────────────────────
  useEffect(() => {
    if (!shopId) return;
    try {
      const raw = localStorage.getItem('allpro_followed_shops');
      const list: string[] = raw ? JSON.parse(raw) : [];
      setIsFollowed(list.includes(shopId));
    } catch { /* ignore */ }
  }, [shopId]);

  const toggleFollow = useCallback(() => {
    try {
      const raw = localStorage.getItem('allpro_followed_shops');
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = isFollowed
        ? list.filter(id => id !== shopId)
        : [...list, shopId];
      localStorage.setItem('allpro_followed_shops', JSON.stringify(next));
    } catch { /* ignore */ }
    setIsFollowed(v => !v);
  }, [isFollowed, shopId]);

  // ── Share ─────────────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const title = shopInfo?.name ?? 'ร้านค้า All Pro';
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
    }
  }, [shopInfo]);

  // ── Derived products ──────────────────────────────────────────────────
  const shopProducts = useMemo(() => {
    if (!shopInfo) return [];
    const localMatches = products.filter(p => p.shopName === shopInfo.name);
    const localIds = new Set(localMatches.map(p => p.id));
    const apiMatches = apiProducts.filter(p => !localIds.has(p.id));
    return [...localMatches, ...apiMatches];
  }, [products, shopInfo, apiProducts]);

  // ── Tab-filtered products ─────────────────────────────────────────────
  const displayProducts = useMemo(() => {
    if (activeTab === 'top')
      return [...shopProducts].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (activeTab === 'sale')
      return [...shopProducts]
        .filter(p => p.discount > 0)
        .sort((a, b) => b.discount - a.discount);
    return shopProducts;
  }, [shopProducts, activeTab]);

  // ── Track shop page view (1 user / 1 shop / 1 ครั้ง) ──────────────────────────
  useEffect(() => {
    if (shopId) trackShopView(decodeURIComponent(shopId as string));
  }, [shopId]);

  // ── Fetch real Views + Revenue from Supabase after products are loaded ──
  useEffect(() => {
    if (isLoading || shopProducts.length === 0) return;
    const ids = shopProducts.map(p => p.id);
    fetchShopPublicStats(ids).then(stats => {
      // Only apply if we actually got real data (totalViews > 0 means table exists)
      setShopStats(stats);
    });
  }, [isLoading, shopProducts]);

  // ── Fallback views from product likes (used while stats load or no DB) ────
  const fallbackViews = useMemo(
    () => shopProducts.reduce((s, p) => s + (p.likes || 0), 0),
    [shopProducts]
  );

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const decodedName = decodeURIComponent(shopId);
        console.log('[ShopPage] Looking for shop:', decodedName);

        // ─── Source 1: Supabase merchant_profiles + products ───
        if (isSupabaseConfigured) {
          try {
            // Try exact match first, then case-insensitive
            let { data: merchant, error: merchantErr } = await supabase
              .from('merchant_profiles')
              .select('*')
              .eq('shop_name', decodedName)
              .maybeSingle();

            if (merchantErr) {
              console.warn('[ShopPage] merchant_profiles query error:', merchantErr.message);
            }

            // Fallback: case-insensitive search
            if (!merchant && !merchantErr) {
              const { data: merchantIlike } = await supabase
                .from('merchant_profiles')
                .select('*')
                .ilike('shop_name', decodedName)
                .maybeSingle();
              if (merchantIlike) merchant = merchantIlike;
            }

            console.log('[ShopPage] DB result:', merchant ? `Found: ${merchant.shop_name}` : 'Not found in DB');

            if (merchant) {
              // Also fetch products for this shop from DB
              const { data: dbProducts } = await supabase
                .from('products')
                .select('*')
                .eq('shop_name', decodedName);

              if (dbProducts && dbProducts.length > 0) {
                const asProducts: Product[] = dbProducts.map((p: Record<string, unknown>) => {
                  const cat = ((p.category as string) || 'Other') as Product['category'];
                  return {
                    id: p.id as string,
                    title: p.title as string,
                    description: (p.description as string) || '',
                    originalPrice: Number(p.original_price) || Number(p.price) || 0,
                    promoPrice: Number(p.price) || 0,
                    discount: Number(p.discount) || 0,
                    image: resolveImageUrl(p.image as string, getCategoryFallbackImage(cat)),
                    shopName: (p.shop_name as string) || decodedName,
                    category: cat,
                    verified: true,
                    likes: Number(p.likes) || 0,
                    isLiked: false,
                    reviews: Number(p.reviews) || 0,
                    rating: Number(p.rating) || 0,
                    distance: (p.distance as string) || '',
                    validUntil: '',
                    createdAt: (p.created_at as string) || '',
                    tags: [],
                  };
                });
                setApiProducts(asProducts);
              }

              setShopInfo({
                id: merchant.id,
                name: merchant.shop_name || decodedName,
                logo: merchant.shop_logo ? resolveImageUrl(merchant.shop_logo) : '',
                description: `ยินดีต้อนรับสู่ ${merchant.shop_name || decodedName} — ร้านค้าคุณภาพพร้อมโปรโมชั่นสุดพิเศษ`,
                verified: true,
                rating: 0,
                totalProducts: (dbProducts?.length || 0),
                location: merchant.shop_address || 'กรุงเทพฯ',
                memberSince: merchant.created_at ? new Date(merchant.created_at).getFullYear().toString() : '2024',
                socialLine: merchant.line_id || undefined,
                socialFacebook: merchant.facebook || undefined,
                socialInstagram: merchant.instagram || undefined,
                socialWebsite: merchant.website || undefined,
              });
              return;
            }
          } catch (dbErr) {
            console.warn('[ShopPage] Supabase query failed, falling back to local:', dbErr);
          }
        }

        // ─── Source 2: Local product store ───
        const matching = products.filter(p => p.shopName === decodedName);

        if (matching.length > 0) {
          const firstProduct = matching[0];
          const avgRating = matching.reduce((sum, p) => sum + (p.rating || 0), 0) / matching.length;

          setShopInfo({
            id: shopId,
            name: firstProduct.shopName,
            logo: firstProduct.shopLogo || '',
            description: `ยินดีต้อนรับสู่ ${firstProduct.shopName} — ร้านค้าคุณภาพพร้อมโปรโมชั่นสุดพิเศษ`,
            verified: firstProduct.verified,
            rating: parseFloat(avgRating.toFixed(1)),
            totalProducts: matching.length,
            location: firstProduct.distance || 'กรุงเทพฯ',
            memberSince: '2024',
          });
          return;
        }

        // ─── Source 2: Static promotions data ───
        const staticPromos = getPromotions();
        const staticMatching = staticPromos.filter(p => p.shop_name === decodedName);

        if (staticMatching.length > 0) {
          const first = staticMatching[0];
          // Convert static promos to Product-like objects for shopProducts
          const asProducts: Product[] = staticMatching.map(p => {
            const cat = (p.category || 'Other') as Product['category'];
            return {
              id: p.id,
              title: p.title,
              description: p.description,
              originalPrice: p.price,
              promoPrice: Math.round(p.price * (1 - p.discount_rate / 100)),
              discount: p.discount_rate,
              image: resolveImageUrl(p.image, getCategoryFallbackImage(cat)),
              shopName: p.shop_name,
              category: cat,
              verified: p.is_verified,
              likes: p.views || 0,
            isLiked: false,
            reviews: 0,
            rating: 0,
            distance: p.location,
            validUntil: p.valid_until || '',
            createdAt: '',
            tags: p.tags || [],
            };
          });
          setApiProducts(asProducts);

          setShopInfo({
            id: shopId,
            name: first.shop_name,
            logo: '',
            description: `ยินดีต้อนรับสู่ ${first.shop_name} — ร้านค้าคุณภาพพร้อมโปรโมชั่นสุดพิเศษ`,
            verified: first.is_verified,
            rating: 0,
            totalProducts: staticMatching.length,
            location: first.location || 'กรุงเทพฯ',
            memberSince: '2024',
          });
          return;
        }

        // ─── Source 3: Logged-in merchant auth data ───
        if (authUser?.role === 'MERCHANT' && authUser.shopName === decodedName) {
          setShopInfo({
            id: authUser.id || shopId,
            name: authUser.shopName,
            logo: authUser.shopLogo || '',
            description: authUser.shopDescription || `ยินดีต้อนรับสู่ ${authUser.shopName} — ร้านค้าคุณภาพพร้อมโปรโมชั่นสุดพิเศษ`,
            verified: authUser.verified ?? false,
            rating: 0,
            totalProducts: 0,
            location: authUser.shopAddress || 'กรุงเทพฯ',
            memberSince: authUser.createdAt ? new Date(authUser.createdAt).getFullYear().toString() : '2024',
          });
          return;
        }

        // ─── Source 4: Saved merchant profile from account ───
        if (savedMerchantProfile && savedMerchantProfile.shopName === decodedName) {
          setShopInfo({
            id: savedMerchantProfile.id || shopId,
            name: savedMerchantProfile.shopName,
            logo: savedMerchantProfile.shopLogo || '',
            description: savedMerchantProfile.shopDescription || `ยินดีต้อนรับสู่ ${savedMerchantProfile.shopName} — ร้านค้าคุณภาพพร้อมโปรโมชั่นสุดพิเศษ`,
            verified: savedMerchantProfile.verified ?? false,
            rating: 0,
            totalProducts: 0,
            location: savedMerchantProfile.shopAddress || 'กรุงเทพฯ',
            memberSince: '2024',
          });
          return;
        }

        throw new Error('ไม่พบร้านค้านี้');
      } catch (err: unknown) {
        // AbortError during navigation/strict mode — ignore silently
        if (err instanceof Error && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (shopId) fetchShop();
  }, [shopId, products, authUser, savedMerchantProfile]);

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero shimmer */}
        <div className="h-52 bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 animate-pulse" />
        <div className="max-w-2xl mx-auto px-4">
          {/* Stats card shimmer */}
          <div className="bg-white rounded-2xl shadow-lg -mt-6 p-4 grid grid-cols-3 gap-4 animate-pulse mb-5 relative z-10">
            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
          </div>
          {/* Buttons shimmer */}
          <div className="grid grid-cols-3 gap-3 mb-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl" />)}
          </div>
          {/* Products shimmer */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────
  if (error || !shopInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-3">
          <Link href="/" className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
          </Link>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Store className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'ไม่พบร้านค้า'}</h2>
          <p className="text-gray-500 mb-6">ร้านค้านี้อาจถูกลบออกหรือยังไม่มีข้อมูล</p>
          <Link href="/"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  // ── Computed display values ────────────────────────────────────────────
  const isOwnShop = authUser?.shopName === shopInfo.name;
  const socialLinks = getSocialLinks({
    line: shopInfo.socialLine || (isOwnShop ? authUser?.shopSocialLine : undefined),
    facebook: shopInfo.socialFacebook || (isOwnShop ? authUser?.shopSocialFacebook : undefined),
    instagram: shopInfo.socialInstagram || (isOwnShop ? authUser?.shopSocialInstagram : undefined),
    website: shopInfo.socialWebsite || (isOwnShop ? authUser?.shopSocialWebsite : undefined),
  });
  const chatLink = shopInfo.socialLine
    ? (shopInfo.socialLine.startsWith('http')
        ? shopInfo.socialLine
        : `https://line.me/ti/p/~${shopInfo.socialLine}`)
    : null;
  const avatarGradient = getAvatarGradient(shopInfo.name);
  const initials = getInitials(shopInfo.name);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* ─────────────────── HERO BANNER ─────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 pb-16">
        {/* Top nav */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <Link href="/"
            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <button onClick={handleShare}
            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Shop identity */}
        <div className="flex flex-col items-center px-4 pt-3 pb-2">
          {/* Avatar */}
          <div className={`w-20 h-20 rounded-full border-4 border-white/40 shadow-xl overflow-hidden bg-gradient-to-br ${avatarGradient} flex items-center justify-center mb-3`}>
            {shopInfo.logo
              ? <img src={shopInfo.logo} alt={shopInfo.name} className="w-full h-full object-cover" />
              : <span className="text-white text-2xl font-bold">{initials}</span>}
          </div>

          {/* Name + verified badge */}
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-white text-xl font-bold">{shopInfo.name}</h1>
            {shopInfo.verified && <CheckCircle className="w-4 h-4 text-blue-200" />}
          </div>

          {/* Merchant badge */}
          <span className="bg-white/20 backdrop-blur-sm text-white/90 text-xs font-medium px-3 py-0.5 rounded-full flex items-center gap-1.5 mb-2">
            <Store className="w-3 h-3" /> Merchant
          </span>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-white/70 text-xs">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />{shopInfo.location}
            </span>
            <span>•</span>
            <span>สมาชิกตั้งแต่ {shopInfo.memberSince}</span>
          </div>
        </div>
      </div>

      {/* ─────────────────── CONTENT ─────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 space-y-4">

        {/* STATS CARD — overlaps hero */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 grid grid-cols-3 divide-x divide-gray-100 -mt-6 relative z-10">
          {/* PRODUCTS */}
          <div className="p-4 text-center">
            <p className="text-lg font-bold text-blue-600">
              {formatCount(shopInfo.totalProducts || shopProducts.length)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">PRODUCTS</p>
          </div>
          {/* VIEWS — real unique first-views from promotion_views table */}
          <div className="p-4 text-center">
            <p className="text-lg font-bold text-violet-600">
              {formatCount(
                shopStats !== null && (shopStats.totalViews > 0 || shopProducts.length > 0)
                  ? shopStats.totalViews
                  : fallbackViews
              )}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">VIEWS</p>
          </div>
          {/* REVENUE — real sum of promo_price from promotion_claims */}
          <div className="p-4 text-center">
            <p className="text-lg font-bold text-green-600">
              {shopStats !== null && shopStats.totalRevenue > 0
                ? `฿${formatCount(shopStats.totalRevenue)}`
                : '฿0'
              }
            </p>
            <p className="text-xs text-gray-500 mt-0.5">REVENUE</p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-3 gap-3">
          <motion.button whileTap={{ scale: 0.95 }} onClick={toggleFollow}
            className={`flex flex-col items-center gap-1 py-3 rounded-2xl font-semibold text-sm transition-all ${
              isFollowed
                ? 'bg-green-50 text-green-600 border-2 border-green-200'
                : 'bg-orange-500 text-white shadow-md shadow-orange-200'
            }`}>
            <Bell className="w-5 h-5" />
            {isFollowed ? 'ติดตามแล้ว' : 'ติดตาม'}
          </motion.button>

          {chatLink ? (
            <a href={chatLink} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 py-3 rounded-2xl font-semibold text-sm bg-white border-2 border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-600 transition-all">
              <MessageCircle className="w-5 h-5" />แชท
            </a>
          ) : (
            <button disabled
              className="flex flex-col items-center gap-1 py-3 rounded-2xl font-semibold text-sm bg-white border-2 border-gray-200 text-gray-400 cursor-not-allowed">
              <MessageCircle className="w-5 h-5" />แชท
            </button>
          )}

          <button onClick={handleShare}
            className="flex flex-col items-center gap-1 py-3 rounded-2xl font-semibold text-sm bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all">
            <Share2 className="w-5 h-5" />แชร์
          </button>
        </div>

        {/* DESCRIPTION */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm text-gray-600 leading-relaxed">{shopInfo.description}</p>
        </div>

        {/* SOCIAL LINKS */}
        {socialLinks.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">ช่องทางติดต่อ</h3>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map(link => (
                <a key={link.key} href={link.url} target="_blank" rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 ${link.hoverColor} hover:shadow-sm transition-all text-sm`}>
                  <div className={`w-6 h-6 rounded-lg ${link.bgColor} flex items-center justify-center flex-shrink-0`}>
                    {link.icon === 'line' && <MessageCircle className="w-3 h-3 text-white" />}
                    {link.icon === 'facebook' && <span className="text-white text-xs font-bold">f</span>}
                    {link.icon === 'instagram' && <span className="text-white text-xs font-bold">ig</span>}
                    {link.icon === 'website' && <Globe className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`font-medium ${link.color}`}>{link.label}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS: TABS + GRID */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100">
            {([
              { key: 'all' as Tab,  label: 'ทั้งหมด', Icon: Package },
              { key: 'top' as Tab,  label: 'แนะนำ',   Icon: Star    },
              { key: 'sale' as Tab, label: 'ลดราคา',  Icon: Tag     },
            ]).map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold transition-colors relative ${
                  activeTab === key ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'
                }`}>
                <Icon className="w-4 h-4" />{label}
                {activeTab === key && (
                  <motion.div layoutId="shop-tab-line"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                )}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="p-4">
            {displayProducts.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-1">ยังไม่มีโปรโมชั่น</p>
                <p className="text-xs text-gray-400">
                  {activeTab === 'sale' ? 'ไม่มีสินค้าลดราคาในขณะนี้' : 'ร้านค้านี้ยังไม่ได้ลงโปรโมชั่น'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {displayProducts.map((product, idx) => (
                  <motion.div key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}>
                    <Link href={`/promo/${product.id}`}>
                      <div className="rounded-xl border border-gray-100 shadow-sm overflow-hidden bg-white hover:shadow-md hover:-translate-y-0.5 transition-all group">
                        {/* Product image */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                          <img
                            src={resolveImageUrl(product.image, getCategoryFallbackImage(product.category))}
                            alt={product.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              const fb = getCategoryFallbackImage(product.category);
                              if (e.currentTarget.src !== fb) e.currentTarget.src = fb;
                            }}
                          />
                          {product.discount > 0 && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              -{product.discount}%
                            </span>
                          )}
                        </div>
                        {/* Product info */}
                        <div className="p-3">
                          <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1.5 group-hover:text-orange-600 transition-colors">
                            {product.title}
                          </p>
                          <div className="flex items-end gap-1.5 mb-1.5">
                            <span className="text-sm font-bold text-orange-600">
                              ฿{product.promoPrice.toLocaleString()}
                            </span>
                            {product.originalPrice > product.promoPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                ฿{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-0.5 text-xs text-amber-500">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {product.rating > 0 ? product.rating : '—'}
                            </span>
                            <span className="flex items-center gap-0.5 text-xs text-gray-400">
                              <Heart className="w-3 h-3" />{product.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
