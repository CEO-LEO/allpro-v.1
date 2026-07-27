'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { Store } from '@/data/stores';
import { MapPin, TrendingUp, Loader2 } from 'lucide-react';
import FilterBar, { FilterCategory } from '@/components/Map/FilterBar';
import StoreSheet from '@/components/Map/StoreSheet';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { resolveImageUrl } from '@/lib/imageUrl';

// Dynamic import – Google Maps uses browser APIs
const PromoMap = dynamic(
  () => import('@/components/Map/PromoMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-900 dark:text-white font-bold text-lg">กำลังโหลดแผนที่…</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">กำลังค้นหาร้านค้าใกล้เคียง</p>
        </div>
      </div>
    )
  }
);

interface BranchRow {
  id: string;
  user_id: string;
  branch_name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
}

interface MerchantProfileRow {
  user_id: string;
  shop_name: string | null;
  shop_logo: string | null;
  shop_category: string | null;
}

export default function MapPage() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterCategory[]>(['all']);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      try {
        const { data: branchData, error: branchErr } = await supabase
          .from('merchant_branches')
          .select('id, user_id, branch_name, address, lat, lng')
          .not('lat', 'is', null)
          .not('lng', 'is', null);

        if (branchErr) {
          console.error('[MapPage] Failed to load branches:', branchErr);
          return;
        }

        const branches = (branchData || []) as BranchRow[];
        if (branches.length === 0) {
          if (!cancelled) setStores([]);
          return;
        }

        const userIds = Array.from(new Set(branches.map(b => b.user_id)));
        const { data: profileData, error: profileErr } = await supabase
          .from('merchant_profiles')
          .select('user_id, shop_name, shop_logo, shop_category')
          .in('user_id', userIds);

        if (profileErr) {
          console.error('[MapPage] Failed to load merchant profiles:', profileErr);
        }

        const profileByUser = new Map<string, MerchantProfileRow>(
          ((profileData || []) as MerchantProfileRow[]).map(p => [p.user_id, p])
        );

        if (!cancelled) {
          const mapped: Store[] = branches.map((b) => {
            const profile = profileByUser.get(b.user_id);
            return {
              id: b.id,
              name: b.branch_name,
              brand: profile?.shop_name || b.branch_name,
              category: profile?.shop_category || 'อื่นๆ',
              lat: b.lat as number,
              lng: b.lng as number,
              brandLogo: resolveImageUrl(profile?.shop_logo || null, '/icons/icon-192x192.png'),
              activePromos: 0,
              address: b.address || '',
            };
          });
          setStores(mapped);
        }
      } catch (e) {
        console.error('[MapPage] load error:', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const categories = Array.from(new Set(stores.map(s => s.category))).sort();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-orange-500 rounded-full" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-orange-500" />
                  Promo Map
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  ค้นหาร้านค้าใกล้เคียงที่มีโปรโมชั่น
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-bold text-gray-900 dark:text-white">{stores.length}</span> ร้านค้า
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative" style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : stores.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
            <div className="text-center max-w-sm">
              <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-700 dark:text-gray-300 font-bold mb-1">ยังไม่มีร้านค้าปักหมุดบนแผนที่</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ร้านค้าจะปรากฏที่นี่หลังจากตั้งค่าที่อยู่ร้านในหน้า "แก้ไขข้อมูลร้านค้า"
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <FilterBar
              categories={categories}
              activeFilters={activeFilters}
              onFilterChange={setActiveFilters}
            />

            <div className="absolute inset-0">
              <PromoMap
                stores={stores}
                activeFilters={activeFilters}
                onStoreClick={(store) => {
                  setSelectedStore(store);
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Store Bottom Sheet */}
      <StoreSheet
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
      />
    </div>
  );
}
