'use client';

import { Store, Package, TrendingUp, DollarSign, Star, MapPin, Phone, Mail, Clock, CreditCard, Globe, MessageCircle, Edit3, ExternalLink, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductStore } from '@/store/useProductStore';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import EditShopModal from '@/components/Merchant/EditShopModal';
import { getSocialLinks } from '@/lib/socialLinks';
import { resolveImageUrl } from '@/lib/imageUrl';

interface ShopStats {
  activePromos: number;
  totalViews: number;
  estimatedRevenue: number;
  avgRating: string;
}

function InfoRow({ icon: Icon, label, value, onEdit }: { icon: React.ElementType; label: string; value?: string | null; onEdit: () => void }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        {value ? (
          <p className="text-sm text-gray-900 mt-0.5">{value}</p>
        ) : (
          <button onClick={onEdit} className="text-sm text-blue-500 hover:text-blue-600 mt-0.5 font-medium">
            + เพิ่มข้อมูล
          </button>
        )}
      </div>
    </div>
  );
}

export default function MerchantShopPage() {
  const { user } = useAuthStore();
  const { products } = useProductStore();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shopStats, setShopStats] = useState<ShopStats | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Profile completeness checks
  const hasShopName = !!user?.shopName?.trim() && user.shopName.trim() !== 'ร้านของฉัน' && user.shopName.trim() !== 'My Shop';
  const hasLogo = !!user?.shopLogo;
  const hasAddress = !!user?.shopAddress?.trim();
  const hasPhone = !!user?.phone?.trim() && (user.phone.trim().length >= 9);
  const profileComplete = hasShopName && hasLogo && hasAddress && hasPhone;
  const completedCount = [hasShopName, hasLogo, hasAddress, hasPhone].filter(Boolean).length;
  const totalChecks = 4;

  // Auto-open edit modal when redirected from Create Flash Sale with ?setup=true
  useEffect(() => {
    if (searchParams.get('setup') === 'true' && !profileComplete) {
      setShowEditModal(true);
    }
  }, [searchParams, profileComplete]);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await new Promise(r => setTimeout(r, 500));

        const myProducts = products.filter(p => p.shopName === user?.shopName);
        const activePromos = myProducts.length;
        const totalViews = myProducts.reduce((sum, p) => sum + ((p.likes || 0) * 10), 0);
        const estimatedRevenue = myProducts.reduce((sum, p) => {
          const price = p.promoPrice || p.originalPrice || 0;
          const sales = (p.reviews || 0);
          return sum + (price * sales);
        }, 0);
        const avgRating = myProducts.length > 0
          ? (myProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / myProducts.length).toFixed(1)
          : 'New';

        setShopStats({ activePromos, totalViews, estimatedRevenue, avgRating });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchShopData();
  }, [user, products]);

  const openEdit = () => setShowEditModal(true);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/merchant/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              ← แดชบอร์ด
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">ร้านของฉัน</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ═══ Profile Completion Banner ═══ */}
        {!isLoading && !error && !profileComplete && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1">กรอกข้อมูลร้านค้าให้ครบ</h3>
                <p className="text-sm text-gray-600 mb-4">กรอกข้อมูลให้ครบเพื่อเปิดใช้งานแฟลชเซลและเพิ่มความน่าเชื่อถือ</p>
                
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>ความคืบหน้า</span>
                    <span className="font-semibold text-orange-600">{completedCount}/{totalChecks}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${(completedCount / totalChecks) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {[
                    { done: hasShopName, label: 'ตั้งชื่อร้านค้า' },
                    { done: hasLogo, label: 'อัปโหลดโลโก้ร้าน' },
                    { done: hasAddress, label: 'เพิ่มที่อยู่ร้านค้า' },
                    { done: hasPhone, label: 'เพิ่มเบอร์โทรศัพท์' },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm ${item.done ? 'text-green-600' : 'text-gray-500'}`}>
                      {item.done ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                      <span className={item.done ? 'line-through' : 'font-medium'}>{item.label}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={openEdit}
                  className="px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-medium text-sm flex items-center gap-2 shadow-sm"
                >
                  <Edit3 className="w-4 h-4" /> แก้ไขข้อมูลร้านค้า
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Profile Complete Success ═══ */}
        {!isLoading && !error && profileComplete && !user?.merchantProfileComplete && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800 font-medium flex-1">ข้อมูลร้านค้าครบแล้ว! คุณสามารถสร้าง Flash Sale ได้เลย</p>
            <Zap className="w-5 h-5 text-green-600 flex-shrink-0" />
          </div>
        )}
        {isLoading ? (
          <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 md:p-8 animate-pulse space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-2xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="p-4 bg-gray-100 rounded-xl h-24"></div>)}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              ลองใหม่อีกครั้ง
            </button>
          </div>
        ) : (
        <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 md:p-8 space-y-6">

          {/* ═══ Shop Profile Header ═══ */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 ${user?.shopLogo ? '' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                {user?.shopLogo ? (
                  <img src={resolveImageUrl(user.shopLogo)} alt={user.shopName} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-12 h-12 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.shopName || 'ร้านของฉัน'}</h2>
                {user?.shopCategory && (
                  <span className="inline-block text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full mb-2">{user.shopCategory}</span>
                )}
                <p className="text-gray-500 text-sm mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
                  {user?.verified ? (
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      Verified <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓</span>
                    </span>
                  ) : (
                    <span className="text-gray-400">ยังไม่ยืนยัน</span>
                  )}
                  <span className="text-gray-300">·</span>
                  <span>สมาชิกตั้งแต่ปี {new Date(user?.createdAt || Date.now()).getFullYear()}</span>
                  {user?.isPro && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full font-bold">PRO</span>
                    </>
                  )}
                </p>
                {user?.shopDescription && (
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{user.shopDescription}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={openEdit}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-sm text-sm flex items-center gap-1.5"
                  >
                    <Edit3 className="w-4 h-4" /> แก้ไขข้อมูลร้าน
                  </button>
                  <Link
                    href={`/shop/${encodeURIComponent(user?.shopName || '')}`}
                    className="px-5 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium border border-gray-200 inline-flex items-center text-sm"
                  >
                    ดูหน้าร้านค้า
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            {shopStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Package, label: 'Active Deals', value: shopStats.activePromos.toString(), bg: 'bg-blue-50', border: 'border-blue-200', ic: 'text-blue-500', tx: 'text-blue-900' },
                  { icon: TrendingUp, label: 'Engagement', value: shopStats.totalViews.toLocaleString(), bg: 'bg-green-50', border: 'border-green-200', ic: 'text-green-500', tx: 'text-green-900' },
                  { icon: DollarSign, label: 'Est. Revenue', value: `฿${shopStats.estimatedRevenue.toLocaleString()}`, bg: 'bg-amber-50', border: 'border-amber-200', ic: 'text-amber-500', tx: 'text-amber-900' },
                  { icon: Star, label: 'Avg Rating', value: shopStats.avgRating, bg: 'bg-purple-50', border: 'border-purple-200', ic: 'text-purple-500', tx: 'text-purple-900' },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className={`p-4 ${s.bg} rounded-xl border ${s.border}`}>
                      <Icon className={`w-5 h-5 ${s.ic} mb-2`} />
                      <div className={`text-2xl font-bold ${s.tx} mb-0.5`}>{s.value}</div>
                      <div className="text-xs text-gray-500">{s.label}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ═══ Detail Sections Grid ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Contact Information */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" /> ข้อมูลการติดต่อ
              </h3>
              <div className="divide-y divide-gray-100">
                <InfoRow icon={Mail} label="อีเมล" value={user?.email} onEdit={openEdit} />
                <InfoRow icon={Phone} label="เบอร์โทรศัพท์" value={user?.phone} onEdit={openEdit} />
                <InfoRow icon={MapPin} label="ที่อยู่ร้านค้า" value={user?.shopAddress} onEdit={openEdit} />
              </div>
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600" /> ข้อมูลธุรกิจ
              </h3>
              <div className="divide-y divide-gray-100">
                <InfoRow icon={Store} label="ประเภทร้านค้า" value={user?.shopCategory} onEdit={openEdit} />
                <InfoRow icon={Clock} label="เวลาทำการ" value={user?.shopOpeningHours} onEdit={openEdit} />
                <InfoRow icon={CreditCard} label="ช่องทางชำระเงิน" value={user?.shopPaymentMethods} onEdit={openEdit} />
              </div>
            </div>

            {/* About Shop */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" /> เกี่ยวกับร้านค้า
              </h3>
              {user?.shopDescription ? (
                <p className="text-sm text-gray-700 leading-relaxed">{user.shopDescription}</p>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400 mb-2">ยังไม่มีรายละเอียด</p>
                  <button onClick={openEdit} className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                    + เพิ่มคำอธิบายร้านค้า
                  </button>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" /> ช่องทางโซเชียล
              </h3>
              {(() => {
                const socialLinks = getSocialLinks({
                  line: user?.shopSocialLine,
                  facebook: user?.shopSocialFacebook,
                  instagram: user?.shopSocialInstagram,
                  website: user?.shopSocialWebsite,
                });
                if (socialLinks.length === 0) {
                  return (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-400 mb-2">ยังไม่มีข้อมูล</p>
                      <button onClick={openEdit} className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                        + เพิ่มช่องทางโซเชียล
                      </button>
                    </div>
                  );
                }
                return (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {socialLinks.map((link) => (
                      <a
                        key={link.key}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 ${link.hoverColor} transition-all duration-200 group hover:shadow-sm`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${link.bgColor} flex items-center justify-center flex-shrink-0`}>
                          {link.icon === 'line' && <MessageCircle className="w-4 h-4 text-white" />}
                          {link.icon === 'facebook' && <span className="text-white text-sm font-bold">f</span>}
                          {link.icon === 'instagram' && <span className="text-white text-sm font-bold">ig</span>}
                          {link.icon === 'website' && <Globe className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">{link.label}</p>
                          <p className={`text-sm font-medium ${link.color} truncate`}>{link.value}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
        )}
      </div>

      {/* Edit Shop Modal */}
      <EditShopModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} />
    </div>
  );
}
