'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, AlertCircle, Store, ArrowRight, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface StockSummaryCardProps {
  merchantId: string;
}

// Real per-branch stock summary — replaces the old "Real-Time Stock Status"
// widget that was actually a fake, localStorage-only inventory tool
// (useStockStore) completely disconnected from the real /merchant/stock page
// (product_branch_stock). This reads the same real table that page uses, so
// the two never disagree again.
export default function StockSummaryCard({ merchantId }: StockSummaryCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [branchCount, setBranchCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isSupabaseConfigured || !merchantId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      const [{ data: branches }, { count: products }] = await Promise.all([
        supabase.from('merchant_branches').select('id').eq('user_id', merchantId),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('shop_id', merchantId),
      ]);

      const branchIds = (branches || []).map((b) => b.id);
      let outOfStock = 0;
      if (branchIds.length > 0) {
        const { count } = await supabase
          .from('product_branch_stock')
          .select('product_id', { count: 'exact', head: true })
          .in('branch_id', branchIds)
          .eq('is_available', false);
        outOfStock = count || 0;
      }

      if (!cancelled) {
        setBranchCount(branchIds.length);
        setProductCount(products || 0);
        setOutOfStockCount(outOfStock);
        setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [merchantId]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Package className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">สถานะสต็อกสินค้า</h2>
          <p className="text-sm text-gray-500">ข้อมูลจริงจากทุกสาขาของคุณ</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : branchCount === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 mb-3">ยังไม่มีสาขา — ตั้งค่าที่อยู่ร้านเพื่อสร้างสาขาหลักอัตโนมัติ</p>
          <Link
            href="/merchant/branches"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Store className="w-4 h-4" />
            จัดการสาขา
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{branchCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">สาขา</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{productCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">สินค้าทั้งหมด</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${outOfStockCount > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className={`text-2xl font-bold ${outOfStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {outOfStockCount}
              </p>
              <p className={`text-xs mt-0.5 ${outOfStockCount > 0 ? 'text-red-500' : 'text-green-600'}`}>
                หมดสต็อกที่บางสาขา
              </p>
            </div>
          </div>

          {outOfStockCount > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                มีสินค้าที่ถูกปิดการขายอยู่ในบางสาขา ลูกค้าจะเห็นป้าย &quot;หมด&quot; สำหรับสาขานั้นๆ
              </p>
            </div>
          )}

          <Link
            href="/merchant/stock"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            จัดการสต็อกรายสาขา
            <ArrowRight className="w-4 h-4" />
          </Link>
        </>
      )}
    </div>
  );
}
