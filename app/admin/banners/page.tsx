'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/Admin/AdminLayout';
import { 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Crown,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  Edit
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  promotionId: string;
  isPinned: boolean;
  isActive: boolean;
  priority: number;
  impressions: number;
  clicks: number;
}

const initialBanners: Banner[] = [
  {
    id: 'banner-001',
    title: 'NIVEA Cream 50% Off',
    subtitle: 'Buy 2 Get 1 Free - Limited Time!',
    imageUrl: 'https://images.unsplash.com/photo-1556229010-aa5835fe0e13?w=800',
    promotionId: 'promo-001',
    isPinned: true,
    isActive: true,
    priority: 1,
    impressions: 45200,
    clicks: 3850
  },
  {
    id: 'banner-002',
    title: '7-Eleven Energy Drink Deal',
    subtitle: 'Buy 3 Get 20% Off',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800',
    promotionId: 'promo-002',
    isPinned: false,
    isActive: true,
    priority: 2,
    impressions: 32100,
    clicks: 2450
  },
  {
    id: 'banner-003',
    title: 'Fresh Snacks at Makro',
    subtitle: 'Special Weekend Promo',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800',
    promotionId: 'promo-003',
    isPinned: false,
    isActive: true,
    priority: 3,
    impressions: 28500,
    clicks: 1890
  },
  {
    id: 'banner-004',
    title: 'CP Fresh Mart Sale',
    subtitle: 'Up to 40% Off on Groceries',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    promotionId: 'promo-004',
    isPinned: false,
    isActive: false,
    priority: 4,
    impressions: 15200,
    clicks: 890
  },
  {
    id: 'banner-005',
    title: 'Coffee Lovers Special',
    subtitle: '2 for 1 on All Coffee Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    promotionId: 'promo-005',
    isPinned: false,
    isActive: false,
    priority: 5,
    impressions: 8900,
    clicks: 450
  }
];

export default function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);

  const moveUp = (index: number) => {
    if (index === 0) return;
    
    const newBanners = [...banners];
    [newBanners[index], newBanners[index - 1]] = [newBanners[index - 1], newBanners[index]];
    
    // Update priorities
    newBanners.forEach((banner, idx) => {
      banner.priority = idx + 1;
    });
    
    setBanners(newBanners);
    
    toast.success('Banner order updated', {
      duration: 2000,
      position: 'top-center'
    });
  };

  const moveDown = (index: number) => {
    if (index === banners.length - 1) return;
    
    const newBanners = [...banners];
    [newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]];
    
    // Update priorities
    newBanners.forEach((banner, idx) => {
      banner.priority = idx + 1;
    });
    
    setBanners(newBanners);
    
    toast.success('Banner order updated', {
      duration: 2000,
      position: 'top-center'
    });
  };

  const toggleActive = (id: string) => {
    setBanners(banners.map(banner => {
      if (banner.id === id) {
        const newStatus = !banner.isActive;
        
        toast(
          newStatus ? 'Banner activated ✓' : 'Banner deactivated',
          {
            duration: 2000,
            position: 'top-center',
            icon: newStatus ? '✅' : '⏸️',
          }
        );
        
        return { ...banner, isActive: newStatus };
      }
      return banner;
    }));
  };

  const togglePin = (id: string) => {
    setBanners(banners.map(banner => {
      if (banner.id === id) {
        const newPinStatus = !banner.isPinned;
        
        toast(
          newPinStatus 
            ? '📌 Pinned to #1 Spot (Monetization Slot)' 
            : 'Unpinned from #1 spot',
          {
            duration: 3000,
            position: 'top-center',
            style: {
              background: newPinStatus ? '#F59E0B' : '#6B7280',
              color: '#fff',
            }
          }
        );
        
        return { ...banner, isPinned: newPinStatus };
      }
      // Unpin all others if pinning this one
      if (banner.isPinned && banner.id !== id) {
        return { ...banner, isPinned: false };
      }
      return banner;
    }));
  };

  const activeBanners = banners.filter(b => b.isActive).length;
  const totalImpressions = banners.reduce((sum, b) => sum + b.impressions, 0);
  const totalClicks = banners.reduce((sum, b) => sum + b.clicks, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0';

  return (
    <AdminLayout>
      <Toaster />
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-950 border-b border-gray-800 px-6 py-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Hero Banner Manager</h1>
              <p className="text-sm text-gray-400">Control homepage slider and monetization slots</p>
            </div>
            
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all">
              <Edit className="w-4 h-4" />
              Add New Banner
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-gray-400">Total Banners</p>
              </div>
              <p className="text-2xl font-bold text-white">{banners.length}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-green-400" />
                <p className="text-xs text-gray-400">Active Banners</p>
              </div>
              <p className="text-2xl font-bold text-green-400">{activeBanners}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <p className="text-xs text-gray-400">Total Impressions</p>
              </div>
              <p className="text-2xl font-bold text-white">{totalImpressions.toLocaleString()}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <p className="text-xs text-gray-400">Avg CTR</p>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{avgCTR}%</p>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Monetization Alert */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <Crown className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-400 font-bold mb-2">💰 Monetization Slot</h3>
                <p className="text-sm text-gray-300 mb-3">
                  The #1 pinned banner is your premium slot. Charge brands extra to feature here.
                  Current pinned: <strong className="text-white">{banners.find(b => b.isPinned)?.title || 'None'}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Banner List */}
          <div className="space-y-3">
            {banners.map((banner, index) => (
              <motion.div
                key={banner.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`
                  bg-gray-950 rounded-xl border-2 overflow-hidden transition-all
                  ${banner.isPinned 
                    ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
                    : 'border-gray-800'
                  }
                  ${!banner.isActive ? 'opacity-60' : ''}
                `}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Priority & Controls */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center font-bold
                      ${index === 0 
                        ? 'bg-yellow-500 text-yellow-900' 
                        : index === 1 
                        ? 'bg-gray-400 text-gray-900' 
                        : index === 2
                        ? 'bg-orange-400 text-orange-900'
                        : 'bg-gray-700 text-gray-300'
                      }
                    `}>
                      #{banner.priority}
                    </div>
                    
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === banners.length - 1}
                      className="p-1 hover:bg-gray-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Live Preview Thumbnail */}
                  <div className="w-32 h-20 rounded-lg overflow-hidden border-2 border-gray-800 flex-shrink-0">
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Banner Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          {banner.title}
                          {banner.isPinned && (
                            <span className="ml-2 text-xs bg-yellow-500 text-yellow-900 px-2 py-0.5 rounded-full font-bold">
                              📌 PINNED
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-400">{banner.subtitle}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Eye className="w-4 h-4" />
                        <span>{banner.impressions.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>{banner.clicks.toLocaleString()} clicks</span>
                      </div>
                      <div className="text-blue-400 font-semibold">
                        CTR: {((banner.clicks / banner.impressions) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Pin Button */}
                    <button
                      onClick={() => togglePin(banner.id)}
                      className={`
                        p-3 rounded-lg font-semibold transition-all border-2
                        ${banner.isPinned
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900 border-yellow-600'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700'
                        }
                      `}
                      title={banner.isPinned ? 'Unpin from #1' : 'Pin to #1 Spot (Monetization)'}
                    >
                      <Crown className="w-5 h-5" />
                    </button>

                    {/* Active/Inactive Toggle */}
                    <button
                      onClick={() => toggleActive(banner.id)}
                      className={`
                        px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 border-2
                        ${banner.isActive
                          ? 'bg-green-600 hover:bg-green-700 text-white border-green-700'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                        }
                      `}
                    >
                      {banner.isActive ? (
                        <>
                          <Eye className="w-4 h-4" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Inactive
                        </>
                      )}
                    </button>

                    {/* Edit Button */}
                    <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-gray-950 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3">🎯 How Banner Management Works</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span><strong className="text-white">Pin to #1:</strong> Reserve the top spot for premium advertisers. Charge brands 2-3x more for this position.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span><strong className="text-white">Active/Inactive:</strong> Toggle banners on/off without deleting them. Useful for seasonal campaigns.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span><strong className="text-white">Reorder:</strong> Use up/down arrows to change priority. Top banners get more impressions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span><strong className="text-white">Live Preview:</strong> See exactly how each banner appears on the homepage before publishing.</span>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
