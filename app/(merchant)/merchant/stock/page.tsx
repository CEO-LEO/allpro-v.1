'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { Store, ChevronRight, MapPin, Package, TrendingUp, Plus } from 'lucide-react';
import StockGrid from '@/components/Merchant/StockGrid';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductStore } from '@/store/useProductStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface Branch {
  id: string;
  branch_name: string;
  address: string | null;
  is_main: boolean;
}

export default function MerchantStockDashboard() {
  const { user } = useAuthStore();
  const { products, fetchMerchantProducts } = useProductStore();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  // productId -> is_available, for the currently selected branch
  const [branchStock, setBranchStock] = useState<Record<string, boolean>>({});

  const myProducts = useMemo(() => {
    return products.filter(p => p.shopName === user?.shopName);
  }, [products, user?.shopName]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      if (user?.id) {
        await fetchMerchantProducts(user.id, user.shopName || user.name || '');
      }

      if (isSupabaseConfigured && user?.id) {
        const { data, error } = await supabase
          .from('merchant_branches')
          .select('id, branch_name, address, is_main')
          .eq('user_id', user.id)
          .order('is_main', { ascending: false })
          .order('created_at', { ascending: true });

        if (error) {
          console.error('[MerchantStock] load branches error:', error);
        } else {
          setBranches(data || []);
        }
      }
      setIsLoading(false);
    };
    load();
  }, [user?.id, user?.shopName, user?.name, fetchMerchantProducts]);

  // When a branch is selected, load its per-product stock overrides
  useEffect(() => {
    const loadStock = async () => {
      if (!selectedBranch || !isSupabaseConfigured || myProducts.length === 0) {
        setBranchStock({});
        return;
      }
      const { data, error } = await supabase
        .from('product_branch_stock')
        .select('product_id, is_available')
        .eq('branch_id', selectedBranch.id)
        .in('product_id', myProducts.map(p => p.id));

      if (error) {
        console.error('[MerchantStock] load stock error:', error);
        setBranchStock({});
        return;
      }
      const map: Record<string, boolean> = {};
      (data || []).forEach((row) => { map[row.product_id] = row.is_available; });
      setBranchStock(map);
    };
    loadStock();
  }, [selectedBranch, myProducts]);

  const gridProducts = useMemo(() => {
    return myProducts.map(p => ({
      id: p.id,
      name: p.title,
      brand: p.shopName,
      category: p.category,
      thumbnail: p.image,
      stockStatus: (branchStock[p.id] ?? true) ? 'available' as const : 'out_of_stock' as const,
      lastUpdate: '',
      views: (p.likes || 0) * 10,
      salesThisWeek: p.likes || 0
    }));
  }, [myProducts, branchStock]);

  if (selectedBranch) {
    return (
      <div className="min-h-screen bg-gray-50">
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

        <main className="max-w-7xl mx-auto px-4 py-6">
          <StockGrid branchName={selectedBranch.branch_name} branchId={selectedBranch.id} products={gridProducts} />
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
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-xl border-2 border-gray-200 h-48"></div>
              ))}
            </div>
          </div>
        ) : branches.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">ยังไม่มีสาขา</h2>
            <p className="text-gray-500 mb-4">ตั้งค่าที่อยู่ร้านที่หน้า &quot;แก้ไขข้อมูลร้านค้า&quot; ก่อน จะสร้างสาขาหลักให้อัตโนมัติ</p>
            <Link
              href="/merchant/branches"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              จัดการสาขา
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Select Branch</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => setSelectedBranch(branch)}
                    className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Store className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{branch.branch_name}</h3>
                            {branch.is_main && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">สาขาหลัก</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                      </div>
                      {branch.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <MapPin className="w-4 h-4" />
                          <span>{branch.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50 group-hover:bg-blue-50 px-5 py-3 border-t border-gray-200 transition-colors">
                      <p className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                        Click to manage stock →
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <Link
                href="/merchant/branches"
                className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                จัดการสาขา / เพิ่มสาขาใหม่
              </Link>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">Real-Time Stock Management</h3>
                  <ul className="text-sm text-blue-800 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Toggle stock status per branch — changes are live for customers immediately</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Customers see 🔴 &quot;Out of Stock&quot; badges preventing wasted trips</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="w-3 h-3 text-blue-600 mt-0.5" />
                      <span>Each branch tracks its own availability independently</span>
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
