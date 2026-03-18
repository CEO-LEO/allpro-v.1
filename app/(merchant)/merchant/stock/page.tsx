'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, ChevronRight, MapPin, Package, TrendingUp, Clock } from 'lucide-react';
import StockGrid from '@/components/Merchant/StockGrid';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductStore } from '@/store/useProductStore';


/**
 * Branch Data — คาดหวัง data structure จาก API:
 * GET /api/merchant/branches
 * Response: Branch[]
 */
interface Branch {
  id: string;
  name: string;
  address: string;
  status: 'online' | 'offline';
  activePromos: number;
  todayViews: number;
  lastSync: string;
}

export default function MerchantStockDashboard() {
  const { user } = useAuthStore();
  const { products } = useProductStore();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  // ═══ API-Ready State Management ═══
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);

  const myProducts = useMemo(() => {
     return products.filter(p => p.shopName === user?.shopName);
  }, [products, user?.shopName]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with real API call
        // const res = await fetch('/api/merchant/branches');
        // if (!res.ok) throw new Error('Failed to fetch branches');
        // const data = await res.json();
        // setBranches(data);

        await new Promise(r => setTimeout(r, 500));
        setBranches([]);
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchBranches();
  }, [user]);

  // Transform products for StockGrid
  const gridProducts = useMemo(() => {
    return myProducts.map(p => ({
      id: p.id,
      name: p.title,
      brand: p.shopName,
      category: p.category,
      thumbnail: p.image,
      stockStatus: 'available' as const,
      lastUpdate: 'Just now',
      views: (p.likes || 0) * 10,
      salesThisWeek: p.likes || 0
    }));
  }, [myProducts]);

  if (selectedBranch) {
    const branch = branches.find(b => b.id === selectedBranch);
    if (!branch) return null;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedBranch(null)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                ← Back to Branches
              </button>
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold">System Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Stock Grid */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <StockGrid branchName={branch.name} products={gridProducts} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Merchant Command Center</h1>
              <p className="text-sm text-gray-500">Select a branch to manage stock</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200">
              <Store className="w-4 h-4" />
              <span className="text-xs font-semibold">{branches.length} Branches</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          /* ═══ Loading Skeleton ═══ */
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-5 h-24"></div>
              ))}
            </div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2].map(i => (
                <div key={i} className="bg-white rounded-xl border-2 border-gray-200 h-48"></div>
              ))}
            </div>
          </div>
        ) : error ? (
          /* ═══ Error State ═══ */
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              ลองใหม่อีกครั้ง
            </button>
          </div>
        ) : branches.length === 0 ? (
          /* ═══ Empty State ═══ */
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">ยังไม่มีสาขา</h2>
            <p className="text-gray-500">เพิ่มสาขาเพื่อเริ่มจัดการสต็อกสินค้า</p>
          </div>
        ) : (
        <>
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Active Branches</p>
                <p className="text-2xl font-bold text-gray-900">{branches.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Promos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {branches.reduce((acc, b) => acc + b.activePromos, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Today's Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {branches.reduce((acc, b) => acc + b.todayViews, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Branch Selection Cards */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Select Branch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((branch, index) => (
              <motion.button
                key={branch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedBranch(branch.id)}
                className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all text-left group"
              >
                <div className="p-5">
                  {/* Branch Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Store className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {branch.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`
                              inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                              ${branch.status === 'online' 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-gray-100 text-gray-600'
                              }
                            `}>
                              <div className={`w-1.5 h-1.5 rounded-full ${branch.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                              {branch.status === 'online' ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 ml-15">
                        <MapPin className="w-4 h-4" />
                        <span>{branch.address}</span>
                      </div>
                    </div>

                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </div>

                  {/* Branch Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Active Promos</p>
                      <p className="text-lg font-bold text-gray-900">{branch.activePromos}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Today's Views</p>
                      <p className="text-lg font-bold text-gray-900">{branch.todayViews.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last Sync
                      </p>
                      <p className="text-xs font-semibold text-blue-600">{branch.lastSync}</p>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="bg-gray-50 group-hover:bg-blue-50 px-5 py-3 border-t border-gray-200 transition-colors">
                  <p className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                    Click to manage stock →
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">💡</span>
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Real-Time Stock Management</h3>
              <ul className="text-sm text-blue-800 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Toggle stock status instantly - changes are live for customers immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Automatic timestamps record every status change for audit trail</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Customers see 🔴 "Out of Stock" badges preventing wasted trips</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span><strong>B2B Design:</strong> Clean, data-dense interface optimized for quick decisions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  );
}
