import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const revalidate = 60; // cache 60 วินาที

export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    const [productsRes, profilesRes, merchantsRes, discountRes] = await Promise.all([
      // 1) จำนวนโปรโมชั่น (products)
      supabase.from('products').select('*', { count: 'exact', head: true }),
      // 2) จำนวนผู้ใช้ (profiles)
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      // 3) จำนวนร้านค้า (merchant_profiles)
      supabase.from('merchant_profiles').select('*', { count: 'exact', head: true }),
      // 4) ส่วนลดสูงสุด — MAX(discount) จาก products
      supabase
        .from('products')
        .select('discount')
        .not('discount', 'is', null)
        .gt('discount', 0)
        .order('discount', { ascending: false })
        .limit(1),
    ]);

    const totalPromos = productsRes.count ?? 0;
    const totalUsers = profilesRes.count ?? 0;
    const totalMerchants = merchantsRes.count ?? 0;

    let maxDiscount = 0;
    if (discountRes.data && discountRes.data.length > 0) {
      maxDiscount = discountRes.data[0].discount ?? 0;
    }

    return NextResponse.json(
      { values: [totalPromos, totalUsers, totalMerchants, maxDiscount] },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (err) {
    console.error('[API /stats] Error:', err);
    return NextResponse.json(
      { values: [0, 0, 0, 0], error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
