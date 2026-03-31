'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Store, Star, Package, MapPin, CheckCircle, ArrowLeft,
  TrendingUp, Clock, Heart, Share2, MessageCircle, Globe, ExternalLink
} from 'lucide-react';
import { useProductStore, type Product } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getSocialLinks } from '@/lib/socialLinks';
import { getPromotions } from '@/lib/getPromotions';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';

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

export default function PublicShopPage() {
  const params = useParams();
  const shopId = params.shopId as string;
  const { products } = useProductStore();
  const { user: authUser, savedMerchantProfile } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);

  // Derive shop products from local store + API results
  const shopProducts = useMemo(() => {
    if (!shopInfo) return [];
    const localMatches = products.filter(p => p.shopName === shopInfo.name);
    // Merge with API products, deduplicate by id
    const localIds = new Set(localMatches.map(p => p.id));
    const apiMatches = apiProducts.filter(p => !localIds.has(p.id));
    return [...localMatches, ...apiMatches];
  }, [products, shopInfo, apiProducts]);

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
                const asProducts: Product[] = dbProducts.map((p: Record<string, unknown>) => ({
                  id: p.id as string,
                  title: p.title as string,
                  description: (p.description as string) || '',
                  originalPrice: Number(p.original_price) || Number(p.price) || 0,
                  promoPrice: Number(p.price) || 0,
                  discount: Number(p.discount) || 0,
                  image: (p.image as string) || '',
                  shopName: (p.shop_name as string) || decodedName,
                  category: ((p.category as string) || 'Other') as Product['category'],
                  verified: true,
                  likes: Number(p.likes) || 0,
                  isLiked: false,
                  reviews: Number(p.reviews) || 0,
                  rating: Number(p.rating) || 0,
                  distance: (p.distance as string) || '',
                  validUntil: '',
                  createdAt: (p.created_at as string) || '',
                  tags: [],
                }));
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
          const asProducts: Product[] = staticMatching.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            originalPrice: p.price,
            promoPrice: Math.round(p.price * (1 - p.discount_rate / 100)),
            discount: p.discount_rate,
            image: p.image || '',
            shopName: p.shop_name,
            category: (p.category || 'Other') as Product['category'],
            verified: p.is_verified,
            likes: p.views || 0,
            isLiked: false,
            reviews: 0,
            rating: 0,
            distance: p.location,
            validUntil: p.valid_until || '',
            createdAt: '',
            tags: p.tags || [],
          }));
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        </header>
        <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <div className="h-7 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-64" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !shopInfo) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
            </Link>
          </div>
        </header>
        <div className="py-20 text-center px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'ไม่พบร้านค้า'}</h2>
          <p className="text-gray-500 mb-6">ร้านค้านี้อาจถูกลบออกหรือยังไม่มีข้อมูล</p>
          <Link href="/" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-block">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> กลับ
          </Link>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Share2 className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* ═══ Shop Profile Card ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 sm:p-8 border border-blue-100 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Logo */}
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md ${shopInfo.logo ? '' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
              {shopInfo.logo ? (
                <img src={shopInfo.logo} alt={shopInfo.name} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-12 h-12 text-white" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{shopInfo.name}</h1>
                {shopInfo.verified && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <p className="text-gray-500 text-sm mb-3">{shopInfo.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 justify-center sm:justify-start flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {shopInfo.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> สมาชิกตั้งแต่ {shopInfo.memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-lg font-bold text-gray-900">{shopInfo.rating}</span>
              </div>
              <p className="text-xs text-gray-500">เรตติ้ง</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Package className="w-4 h-4 text-blue-500" />
                <span className="text-lg font-bold text-gray-900">{shopInfo.totalProducts}</span>
              </div>
              <p className="text-xs text-gray-500">โปรโมชั่น</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-lg font-bold text-gray-900">
                  {shopProducts.reduce((sum, p) => sum + (p.likes || 0), 0)}
                </span>
              </div>
              <p className="text-xs text-gray-500">ถูกใจ</p>
            </div>
          </div>

          {/* Social Links */}
          {(() => {
            // ดึงข้อมูล social จาก shopInfo (DB) หรือจาก auth store ถ้าเป็นร้านของตัวเอง
            const isOwnShop = authUser?.shopName === shopInfo.name;
            const socialLinks = getSocialLinks({
              line: shopInfo.socialLine || (isOwnShop ? authUser?.shopSocialLine : undefined),
              facebook: shopInfo.socialFacebook || (isOwnShop ? authUser?.shopSocialFacebook : undefined),
              instagram: shopInfo.socialInstagram || (isOwnShop ? authUser?.shopSocialInstagram : undefined),
              website: shopInfo.socialWebsite || (isOwnShop ? authUser?.shopSocialWebsite : undefined),
            });
            if (socialLinks.length === 0) return null;
            return (
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {socialLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white ${link.hoverColor} hover:shadow-md transition-all duration-200 group`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${link.bgColor} flex items-center justify-center flex-shrink-0`}>
                      {link.icon === 'line' && <MessageCircle className="w-3.5 h-3.5 text-white" />}
                      {link.icon === 'facebook' && <span className="text-white text-xs font-bold">f</span>}
                      {link.icon === 'instagram' && <span className="text-white text-xs font-bold">ig</span>}
                      {link.icon === 'website' && <Globe className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${link.color}`}>{link.label}</span>
                    <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </a>
                ))}
              </div>
            );
          })()}
        </motion.div>

        {/* ═══ Shop Products ═══ */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            โปรโมชั่นจากร้านนี้
            <span className="text-sm font-normal text-gray-500">({shopProducts.length} รายการ)</span>
          </h2>

          {shopProducts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">ยังไม่มีโปรโมชั่น</h3>
              <p className="text-sm text-gray-500">ร้านค้านี้ยังไม่ได้ลงโปรโมชั่น</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shopProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/promo/${product.id}`}>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <img
                          src={resolveImageUrl(product.image, getCategoryFallbackImage(product.category))}
                          alt={product.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            const fallback = getCategoryFallbackImage(product.category);
                            if (e.currentTarget.src !== fallback) {
                              e.currentTarget.src = fallback;
                            }
                          }}
                        />
                        {product.discount > 0 && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
                            -{product.discount}%
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-orange-600">
                            ฿{product.promoPrice.toLocaleString()}
                          </span>
                          {product.originalPrice > product.promoPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ฿{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {product.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" /> {product.likes}
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
  );
}
