"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ChartBarIcon,
  TrophyIcon,
  EyeIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  SparklesIcon,
  PresentationChartLineIcon,
  TrashIcon,
  RocketLaunchIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { getSearchInsights } from "@/lib/getPromotions";
import { Package as PackageIcon } from "lucide-react";
import { useFlashSale } from "@/lib/flashSaleContext";
import UpgradeBanner from "@/components/Merchant/UpgradeBanner";
import { useProductStore } from "@/store/useProductStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";
import CreateDealWidget from "@/components/Merchant/CreateDealWidget";
import BoostPromotionModal from "@/components/Merchant/BoostPromotionModal";
import EditPromotionModal from "@/components/Merchant/EditPromotionModal";
import { Product } from "@/store/useProductStore";
import { fetchMerchantAnalytics, type MerchantDashboardStats, type ActivityItem as AnalyticsActivityItem } from "@/lib/analytics";
import { resolveImageUrl, getCategoryFallbackImage } from '@/lib/imageUrl';

// Dynamic Imports for Heavy Components (Charts/Analytics)
const PredictiveInsights = dynamic(() => import("@/components/PredictiveInsights"), { ssr: false });
const MarketInsights = dynamic(() => import("@/components/MarketInsights"), { ssr: false });
const SEOBidManager = dynamic(() => import("@/components/SEOBidManager"), { ssr: false });
const StockControl = dynamic(() => import("@/components/Merchant/StockControl"), { ssr: false });
const CustomerInsights = dynamic(() => import("@/components/Merchant/Analytics/CustomerInsights"), { ssr: false });

// Static SEO packages — extracted to module level to avoid re-creation each render
const seoPackages = [
  {
    id: "basic",
    name: "Basic Ranking",
    price: 299,
    duration: "30 วัน",
    features: [
      "อันดับ 4-10 ในหมวดหมู่",
      "เพิ่มการมองเห็น 2x",
      "รายงานสถิติรายวัน",
    ],
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "pro",
    name: "Pro Ranking",
    price: 899,
    duration: "30 วัน",
    features: [
      "อันดับ 1-3 ในหมวดหมู่",
      "เพิ่มการมองเห็น 5x",
      "รายงานสถิติเรียลไทม์",
      "Data Insights ขั้นสูง",
    ],
    color: "from-blue-700 to-blue-900",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium Featured",
    price: 2499,
    duration: "30 วัน",
    features: [
      "อันดับ 1 การันตี",
      "เพิ่มการมองเห็น 10x",
      "แสดงในหน้าแรก",
      'Badge "แนะนำ"',
      "รายงาน AI ขั้นสูง",
    ],
    color: "from-purple-500 to-pink-500",
  },
];

// Static activity data — extracted to module level (will be replaced by API)
type ActivityType = "view" | "save" | "location" | "search";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  count: number;
  timestamp: string;
}

// แปลง ISO timestamp เป็นข้อความเวลาสัมพัทธ์ (เช่น "2 ชม. ที่แล้ว")
function formatRelativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'เมื่อสักครู่';
  if (diffMin < 60) return `${diffMin} นาที ที่แล้ว`;
  if (diffHr < 24) return `${diffHr} ชม. ที่แล้ว`;
  if (diffDay < 30) return `${diffDay} วัน ที่แล้ว`;
  return `${Math.floor(diffDay / 30)} เดือน ที่แล้ว`;
}

const ACTIVITY_ICON_MAP: Record<ActivityType, React.ReactNode> = {
  view: <EyeIcon className="w-7 h-7 text-blue-500" />,
  save: <CheckCircleIcon className="w-7 h-7 text-red-500" />,
  location: <MapPinIcon className="w-7 h-7 text-green-500" />,
  search: <SparklesIcon className="w-7 h-7 text-purple-500" />,
};

export default function MerchantDashboard() {
  const { user } = useAuthStore();
  
  // Product Store
  const products = useProductStore((s) => s.products);
  const deleteProduct = useProductStore((s) => s.deleteProduct);
  const fetchMerchantProducts = useProductStore((s) => s.fetchMerchantProducts);
  
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "discount">("newest");
  const [selectedLocation, setSelectedLocation] = useState("อารีย์");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const { startFlashSale, endFlashSale, isFlashSale } = useFlashSale();
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // ═══════════════════════════════════════════════════════
  // API-Ready State Management
  // ═══════════════════════════════════════════════════════
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Activity Log — ดึงจาก promotion_claims + promotion_views
   */
  const [activityData, setActivityData] = useState<ActivityItem[]>([]);

  /**
   * Dashboard Stats — ดึงจาก Supabase Real Data
   */
  const [dashboardStats, setDashboardStats] = useState<{
    totalViews: number;
    totalClaims: number;
    totalUsed: number;
    conversionRate: number;
    totalAmountSaved: number;
  } | null>(null);

  const [analyticsData, setAnalyticsData] = useState<MerchantDashboardStats | null>(null);

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const merchantId = user?.id || '';
        const merchantShopName = user?.shopName || user?.name || '';

        // Fetch merchant's products from Supabase
        await fetchMerchantProducts(merchantId, merchantShopName);

        // Fetch real analytics data from Supabase
        const analytics = await fetchMerchantAnalytics(merchantId, merchantShopName, 30);

        if (analytics) {
          setAnalyticsData(analytics);
          setDashboardStats({
            totalViews: analytics.totalViews,
            totalClaims: analytics.totalClaims,
            totalUsed: analytics.totalUsed,
            conversionRate: analytics.conversionRate,
            totalAmountSaved: analytics.totalAmountSaved,
          });

          // Convert analytics activity to dashboard format
          const mappedActivity: ActivityItem[] = analytics.recentActivity.map((a) => ({
            id: a.id,
            type: a.type === 'claim' ? 'save' as ActivityType : a.type === 'used' ? 'view' as ActivityType : 'view' as ActivityType,
            title: a.title,
            subtitle: a.subtitle,
            count: a.count,
            timestamp: a.timestamp,
          }));
          setActivityData(mappedActivity);
        } else {
          setActivityData([]);
          setDashboardStats(null);
        }
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user, fetchMerchantProducts]);

  // Filter products for this merchant
  // Match by shopName, user name, or user id (for Supabase UUID-based products)
  const shopName = user?.shopName || '';
  const possibleNames = [shopName, user?.name, 'My Shop'].filter(Boolean);
  const myProducts = products.filter(
    (p) => possibleNames.includes(p.shopName)
  );

  // Sort products
  const sortedProducts = [...myProducts].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.likes || 0) - (a.likes || 0);
      case "discount": {
        const discountA = ((a.originalPrice - (a.promoPrice || 0)) / a.originalPrice) * 100;
        const discountB = ((b.originalPrice - (b.promoPrice || 0)) / b.originalPrice) * 100;
        return discountB - discountA;
      }
      case "newest":
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  // Calculate stats (use real analytics data only — no mock fallback)
  const totalViews = dashboardStats?.totalViews ?? 0;
  const totalClaims = dashboardStats?.totalClaims ?? 0;
  const totalUsed = dashboardStats?.totalUsed ?? 0;
  const conversionRate = dashboardStats?.conversionRate ?? 0;
  const totalAmountSaved = dashboardStats?.totalAmountSaved ?? 0;
  const avgDiscount = myProducts.length > 0
    ? Math.round(
        myProducts.reduce((sum, p) => {
          const price = p.promoPrice || 0;
          const discount = ((p.originalPrice - price) / p.originalPrice) * 100;
          return sum + discount;
        }, 0) / myProducts.length
      )
    : 0;

  const insights = useMemo(() => getSearchInsights(selectedLocation), [selectedLocation]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบ "${name}" ใช่หรือไม่?`)) {
      await deleteProduct(id);
      toast.success(`ลบ "${name}" แล้ว`);
    }
  };

  return (
    <div>
      {/* Show access denied if not merchant */}
      {(!user || user.role !== "MERCHANT") ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-900 text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-500">This page is for merchants only.</p>
          </div>
        </div>
      ) : isLoading ? (
        /* ═══ Loading Skeleton ═══ */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 md:p-8 space-y-6 animate-pulse">
            {/* Create Deal Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 h-40"></div>
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 h-24 border border-gray-200"></div>
              ))}
            </div>
            {/* Table Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
            {/* Activity Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              {[1,2,3,4].map(i => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        /* ═══ Error State ═══ */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            ลองใหม่อีกครั้ง
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1">
                  ← <span className="hidden sm:inline">หน้าแรก</span>
                </Link>
                <h1 className="text-sm sm:text-lg font-semibold text-gray-900">
                  <span className="hidden sm:inline">แดชบอร์ดร้านค้า</span>
                  <span className="sm:hidden">แดชบอร์ด</span>
                </h1>
                <div className="w-8 sm:w-20"></div>
              </div>
            </div>
          </header>

          {/* Upgrade Banner for Free Merchants */}
          <UpgradeBanner />

          {/* Profile Incomplete Alert */}
          {user && !(user.shopName?.trim() && user.shopLogo && user.shopAddress?.trim() && user.phone?.trim() && user.phone.trim().length >= 9) && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
              <Link
                href="/merchant/shop?setup=true"
                className="flex items-center gap-3 bg-orange-50 border-2 border-orange-200 rounded-xl p-4 hover:bg-orange-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <PackageIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-orange-800">ตั้งค่าโปรไฟล์ร้านค้าให้ครบ</p>
                  <p className="text-xs text-orange-600">กรอกข้อมูลร้านค้าเพื่อเริ่มโพสต์โปรโมชัน →</p>
                </div>
                <ArrowTrendingUpIcon className="w-5 h-5 text-orange-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </Link>
            </div>
          )}

          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24">
          {/* Main Content Card Container */}
          <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 md:p-8">
        {/* Create Deal Widget - TOP PRIORITY */}
        <div className="mb-8">
          <CreateDealWidget />
        </div>

        {/* Boost Your Sales Card */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-5 sm:p-6 mb-8 shadow-lg relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <RocketLaunchIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Boost Your Sales</h3>
                  <p className="text-white/80 text-sm">ดันโพสต์โปรโมชั่นให้ลูกค้าเห็นก่อนใคร</p>
                </div>
              </div>
              {myProducts.filter(p => p.isBoosted).length > 0 && (
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {myProducts.filter(p => p.isBoosted).length} Active
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                onClick={() => setShowBoostModal(true)}
                className="inline-flex items-center gap-2 bg-white text-orange-600 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl text-sm"
              >
                <RocketLaunchIcon className="w-5 h-5" />
                เลือกโปรโมชั่นที่จะ Boost
              </button>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <CheckCircleIcon className="w-5 h-5" />
                <span>แสดงอันดับ 1 ในหน้า Feed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Boost Modal */}
        <BoostPromotionModal isOpen={showBoostModal} onClose={() => setShowBoostModal(false)} />

        {/* Edit Modal */}
        <EditPromotionModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setEditingProduct(null); }}
          product={editingProduct}
        />

        {/* My Active Deals Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <PresentationChartLineIcon className="w-6 h-6" />
                โปรโมชั่นที่ใช้งานอยู่
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {myProducts.length} รายการ
              </p>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "popular" | "discount")}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">ใหม่ล่าสุด</option>
              <option value="popular">ยอดนิยม</option>
              <option value="discount">ลดราคามากที่สุด</option>
            </select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-gray-200">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">ยอดเข้าชม</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">
                    {totalViews.toLocaleString()}
                  </p>
                </div>
                <EyeIcon className="w-10 h-10 text-blue-300" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">กดรับโปร</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">
                    {totalClaims.toLocaleString()}
                  </p>
                  {conversionRate > 0 && (
                    <p className="text-xs text-purple-500 mt-0.5">{conversionRate}% conversion</p>
                  )}
                </div>
                <TrophyIcon className="w-10 h-10 text-purple-300" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">ใช้จริง</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {totalUsed.toLocaleString()}
                  </p>
                  {totalAmountSaved > 0 && (
                    <p className="text-xs text-green-500 mt-0.5">ประหยัด ฿{totalAmountSaved.toLocaleString()}</p>
                  )}
                </div>
                <CheckCircleIcon className="w-10 h-10 text-green-300" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">ลดเฉลี่ย</p>
                  <p className="text-3xl font-bold text-orange-900 mt-1">
                    {avgDiscount}%
                  </p>
                </div>
                <ArrowTrendingUpIcon className="w-10 h-10 text-orange-300" />
              </div>
            </div>
          </div>

          {/* Empty State */}
          {myProducts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📦</span>
              </div>
              <p className="text-gray-500 font-medium mb-2">
                ยังไม่มีโปรโมชั่นที่ใช้งานอยู่
              </p>
              <p className="text-gray-400 text-sm">
                ลงประกาศโปรโมชั่นของคุณด้านบนเพื่อเริ่มต้น
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Table Header - Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 font-bold text-sm text-gray-600">
                <div className="col-span-3">สินค้า</div>
                <div className="col-span-2 text-center">ราคา</div>
                <div className="col-span-1 text-center">ลด</div>
                <div className="col-span-2 text-center">เข้าชม / กดรับ</div>
                <div className="col-span-2 text-center">Conversion</div>
                <div className="col-span-2 text-right">การดำเนินการ</div>
              </div>

              {/* Rows */}
              {sortedProducts.map((product) => {
                const discountPercent = product.discount || Math.round(
                  ((product.originalPrice - product.promoPrice) / product.originalPrice) * 100
                );

                // ดึงสถิติจริงจาก analytics data
                const pStat = analyticsData?.productStats?.find((s) => s.productId === product.id);
                const pViews = pStat?.views ?? 0;
                const pClaims = pStat?.claims ?? 0;
                const pConversion = pStat?.conversionRate ?? 0;

                return (
                  <div
                    key={product.id}
                    className="grid md:grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
                  >
                    {/* Product Info */}
                    <div className="md:col-span-3 flex gap-3">
                      <img
                        src={resolveImageUrl(product.image, getCategoryFallbackImage(product.category))}
                        alt={product.title}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {product.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.category}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 md:text-center">
                      <p className="text-sm text-gray-500 md:hidden">ราคา:</p>
                      <p className="font-bold text-gray-800">
                        ฿{product.promoPrice}
                      </p>
                      <p className="text-xs text-gray-400 line-through">
                        ฿{product.originalPrice}
                      </p>
                    </div>

                    {/* Discount */}
                    <div className="md:col-span-1 md:text-center">
                      <p className="text-sm text-gray-500 md:hidden">ลดราคา:</p>
                      <p className="font-bold text-red-600 text-lg">
                        -{discountPercent}%
                      </p>
                    </div>

                    {/* Views & Claims */}
                    <div className="md:col-span-2 md:text-center">
                      <p className="text-sm text-gray-500 md:hidden">เข้าชม / กดรับ:</p>
                      <p className="font-medium text-gray-800">
                        {pViews.toLocaleString()} / {pClaims.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">ดู / รับ</p>
                    </div>

                    {/* Conversion */}
                    <div className="md:col-span-2 md:text-center">
                      <p className="text-sm text-gray-500 md:hidden">Conversion:</p>
                      <p className={`font-bold ${pConversion > 5 ? 'text-green-600' : pConversion > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                        {pConversion}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div className={`h-1.5 rounded-full ${pConversion > 5 ? 'bg-green-500' : pConversion > 0 ? 'bg-orange-500' : 'bg-gray-300'}`} style={{ width: `${Math.min(pConversion, 100)}%` }} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-2 flex md:justify-end gap-2">
                      <button
                        onClick={() => { setEditingProduct(product); setShowEditModal(true); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium text-sm flex-1 md:flex-none justify-center"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">แก้ไข</span>
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.title)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium text-sm flex-1 md:flex-none justify-center"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">ลบ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#FF5722] to-[#FF7043] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold mb-2">สวัสดี คุณเจ้าของร้าน!</h2>
          <p className="text-sm sm:text-base text-white/90 mb-4">
            ยินดีต้อนรับสู่แดชบอร์ดที่จะช่วยให้คุณเข้าใจลูกค้าและเพิ่มยอดขายได้ดีขึ้น
          </p>
          
          {/* Quick Access Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/merchant/analytics"
              className="inline-flex items-center gap-2 bg-white text-[#FF5722] px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Analytics Dashboard</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-2 py-1 rounded-full">ROI</span>
            </Link>
            
            <Link 
              href="/merchant/stock"
              className="inline-flex items-center gap-2 bg-white text-[#FF5722] px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              <PackageIcon className="w-5 h-5" />
              <span>Manage Stock</span>
              <span className="bg-[#FF5722] text-white text-xs px-2 py-1 rounded-full">Quick Access</span>
            </Link>
          </div>
        </div>

        {/* Market Insights Section (Big Data) */}
        <div className="mb-8">
          <MarketInsights />
        </div>

        {/* Customer Insights — Demographics Analytics */}
        <div className="mb-8">
          <CustomerInsights />
        </div>

        {/* Data Insights Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-[#FF5722]" />
              Data Insights - ความต้องการของตลาด (Legacy)
            </h3>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
            >
              <option value="อารีย์">อารีย์</option>
              <option value="สยาม">สยาม</option>
              <option value="สุขุมวิท">สุขุมวิท</option>
              <option value="ทองหล่อ">ทองหล่อ</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {/* Total Searches */}
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <EyeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">
                  <span className="hidden sm:inline">+50% จากเดือนที่แล้ว</span>
                  <span className="sm:hidden">+50%</span>
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {insights.total_searches.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="hidden sm:inline">การค้นหาทั้งหมดในเดือนนี้</span>
                <span className="sm:hidden">ค้นหา/เดือน</span>
              </p>
            </div>

            {/* Top Category */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <TrophyIcon className="w-8 h-8 text-yellow-500" />
                <span className="text-xs text-orange-600 font-semibold bg-orange-100 px-2 py-1 rounded-full">
                  Trending
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">อาหาร</p>
              <p className="text-sm text-gray-600">หมวดหมู่ยอดนิยม</p>
            </div>

            {/* Location */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <MapPinIcon className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{insights.location}</p>
              <p className="text-sm text-gray-600">พื้นที่ที่เลือก</p>
            </div>
          </div>

          {/* Top Keywords */}
          <div className="card p-6">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-[#FF5722]" />
              คำค้นหายอดนิยมในย่านนี้
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {insights.top_keywords.slice(0, 10).map((keyword, idx) => (
                <div 
                  key={idx}
                  className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <p className="text-sm font-semibold text-gray-900 mb-1">{keyword.keyword}</p>
                  <p className="text-xs text-gray-600">
                    {keyword.volume.toLocaleString()} searches
                  </p>
                  {idx < 3 && (
                    <span className="inline-block mt-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                      HOT
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Insight:</strong> คนในย่าน{selectedLocation}กำลังค้นหา "นมโปรตีน" เพิ่มขึ้น 50% 
                - ลองสร้างโปรโมชั่นที่เกี่ยวข้องเพื่อดึงดูดลูกค้า!
              </p>
            </div>
          </div>
        </div>

        {/* Predictive Analytics Section */}
        <div className="mb-8">
          <PredictiveInsights location={selectedLocation} />
        </div>

        {/* Real-Time Stock Status Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PackageIcon className="w-6 h-6 text-[#FF5722]" />
            Real-Time Stock Status - จัดการสต็อกสินค้า
          </h3>
          <StockControl merchantId={user?.id || ""} merchantName={user?.name || ""} />
        </div>

        {/* SEO Bid Manager Section */}
        <div className="mb-8">
          <SEOBidManager />
        </div>

        {/* SEO Manager Section (Original Packages) */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-[#FF5722]" />
            SEO Ranking Packages - เลือกแพ็กเกจที่เหมาะกับคุณ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {seoPackages.map((pkg) => (
              <div 
                key={pkg.id}
                className={`card overflow-hidden ${selectedPackage === pkg.id ? 'ring-4 ring-[#FF5722]' : ''}`}
              >
                {pkg.popular && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 text-sm font-semibold">
                    ยอดนิยม
                  </div>
                )}
                <div className={`bg-gradient-to-r ${pkg.color} p-6 text-white`}>
                  <h4 className="text-2xl font-bold mb-2">{pkg.name}</h4>
                  <p className="text-white/90 text-sm mb-4">{pkg.duration}</p>
                  <p className="text-4xl font-bold">฿{pkg.price}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      selectedPackage === pkg.id
                        ? 'bg-[#FF5722] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedPackage === pkg.id ? '✓ เลือกแล้ว' : 'เลือกแพ็กเกจนี้'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedPackage && (
            <div className="mt-6 card p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
              <p className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600" /> คุณได้เลือกแพ็กเกจ {seoPackages.find(p => p.id === selectedPackage)?.name}
              </p>
              <p className="text-sm text-green-700 mb-4">
                กดปุ่มด้านล่างเพื่อชำระเงินและเปิดใช้งาน SEO Ranking ทันที
              </p>
              <button className="btn-primary">
                ชำระเงิน ฿{seoPackages.find(p => p.id === selectedPackage)?.price}
              </button>
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6 text-[#FF5722]" />
            Activity Log - กิจกรรมล่าสุด
          </h3>

          {activityData.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
              <p className="text-2xl font-semibold text-gray-900 mb-2">ยังไม่มีกิจกรรมล่าสุด</p>
              <p className="text-sm text-gray-500">กิจกรรมและการเคลื่อนไหวของร้านค้าจะแสดงที่นี่</p>
            </div>
          ) : (
            <div className="card divide-y divide-gray-200">
              {activityData.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0">{ACTIVITY_ICON_MAP[activity.type]}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.subtitle}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm font-medium text-[#FF5722]">{activity.count.toLocaleString()} ครั้ง</span>
                        <span className="text-xs text-gray-400">{formatRelativeTime(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h4 className="text-lg font-bold text-blue-700 mb-2">
            Unfair Advantage: ทำไมต้อง Pro Hunter?
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2"><CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> Data Insights แบบเรียลไทม์ - รู้ว่าลูกค้าต้องการอะไร</li>
            <li className="flex items-start gap-2"><CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> Predictive Analytics ด้วย AI - ทำนายเทรนด์ล่วงหน้า</li>
            <li className="flex items-start gap-2"><CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> SEO Ranking ที่โปร่งใส - จ่ายเท่าไหร่ ได้อันดับชัดเจน</li>
            <li className="flex items-start gap-2"><CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> ระบบตรวจสอบ Verified - สร้างความน่าเชื่อถือ</li>
          </ul>
        </div>
      </div>{/* End Content Card Container */}
      </main>

      </>
      )}
    </div>
  );
}
