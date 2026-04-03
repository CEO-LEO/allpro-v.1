import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

/**
 * DELETE /api/admin/clear-products
 * ลบข้อมูลสินค้า/โปรโมชั่นทั้งหมดจาก Supabase
 * ใช้ service role key (bypass RLS)
 * 
 * Related tables with ON DELETE CASCADE will be cleaned automatically:
 *  - saved_deals, promotion_views, promotion_claims, ad_click_logs
 */
export async function DELETE() {
  try {
    const supabase = createServiceRoleClient();

    // 1. ลบ products ทั้งหมด (cascade จะลบ saved_deals, views, claims, ad_clicks ด้วย)
    const { error: productsError, count: productsCount } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // match all rows
      .select('*', { count: 'exact', head: true });

    if (productsError) {
      console.error('Error deleting products:', productsError);
    }

    // 2. ลบ saved_promotions (ตาราง separate)
    const { error: savedError } = await supabase
      .from('saved_promotions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (savedError) {
      console.error('Error deleting saved_promotions:', savedError);
    }

    // 3. ลบ reviews
    const { error: reviewsError } = await supabase
      .from('reviews')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (reviewsError) {
      console.error('Error deleting reviews:', reviewsError);
    }

    // 4. ลบ promotions (cascade จะลบ promotion_branches, redemptions, loyalty_cards ด้วย)
    const { error: promosError } = await supabase
      .from('promotions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (promosError) {
      console.error('Error deleting promotions:', promosError);
    }

    // 5. ลบไฟล์รูปใน storage bucket 'promotions/products/'
    const { data: files } = await supabase.storage
      .from('promotions')
      .list('products', { limit: 1000 });

    if (files && files.length > 0) {
      const filePaths = files.map(f => `products/${f.name}`);
      const { error: storageError } = await supabase.storage
        .from('promotions')
        .remove(filePaths);

      if (storageError) {
        console.error('Error deleting storage files:', storageError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลโปรโมชั่นทั้งหมดเรียบร้อยแล้ว',
      deleted: {
        products: productsError ? `error: ${productsError.message}` : 'done',
        saved_promotions: savedError ? `error: ${savedError.message}` : 'done',
        reviews: reviewsError ? `error: ${reviewsError.message}` : 'done',
        promotions: promosError ? `error: ${promosError.message}` : 'done',
        storage_files: files?.length ?? 0,
      }
    });

  } catch (error) {
    console.error('Clear products error:', error);
    return NextResponse.json(
      { error: 'Failed to clear products', detail: String(error) },
      { status: 500 }
    );
  }
}
