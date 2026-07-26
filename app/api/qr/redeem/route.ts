import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

/**
 * POST /api/qr/redeem
 *
 * Validates a QR code and returns reward points.
 * The implementation now uses Supabase-backed persistence for redemption history
 * and user points updates instead of relying on in-memory demo state.
 */

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.code !== 'string' || !body.code.trim()) {
    return NextResponse.json(
      { success: false, error: 'กรุณาส่ง QR Code ที่ถูกต้อง' },
      { status: 400 },
    );
  }

  const code = body.code.trim();
  const userId = typeof body.userId === 'string' ? body.userId : null;

  const supabase = createServiceRoleClient();

  if (userId) {
    const { data: existingClaims, error: lookupError } = await supabase
      .from('promotion_claims')
      .select('id')
      .eq('user_id', userId)
      .eq('source', code)
      .limit(1);

    if (lookupError) {
      console.error('[qr-redeem] lookup error:', lookupError.message);
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถตรวจสอบสถานะการ redeem ได้ในตอนนี้' },
        { status: 500 },
      );
    }

    if ((existingClaims || []).length > 0) {
      return NextResponse.json(
        { success: false, error: 'คูปองนี้ถูกใช้ไปแล้ว' },
        { status: 409 },
      );
    }
  }

  let xp = 50;
  let coins = 20;
  let message = 'เช็คอินสำเร็จ! คุณได้รับรางวัล';

  if (code.toUpperCase().startsWith('ALLPRO')) {
    xp = 100;
    coins = 50;
    message = 'คูปองพิเศษ! คุณได้รับรางวัลพิเศษ';
  } else if (code.startsWith('http')) {
    xp = 30;
    coins = 10;
    message = 'สแกนลิงก์ร้านค้าสำเร็จ!';
  }

  const { data: products, error: productError } = await supabase
    .from('products')
    .select('id')
    .limit(1);

  if (productError) {
    console.error('[qr-redeem] product lookup error:', productError.message);
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถเชื่อมต่อฐานข้อมูลสินค้าได้' },
      { status: 500 },
    );
  }

  const productId = products?.[0]?.id ?? null;

  if (userId) {
    const { error: claimError } = await supabase.from('promotion_claims').insert({
      user_id: userId,
      product_id: productId,
      merchant_id: null,
      original_price: 0,
      promo_price: 0,
      amount_saved: 0,
      source: code,
    });

    if (claimError) {
      console.error('[qr-redeem] claim insert error:', claimError.message);
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถบันทึกการ redeem ได้' },
        { status: 500 },
      );
    }

    const { data: profile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('xp, coins')
      .eq('id', userId)
      .maybeSingle();

    if (profileFetchError) {
      console.error('[qr-redeem] profile fetch error:', profileFetchError.message);
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          xp: (profile?.xp ?? 0) + xp,
          coins: (profile?.coins ?? 0) + coins,
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.error('[qr-redeem] profile update error:', profileError.message);
    }
  }

  return NextResponse.json({
    success: true,
    xp,
    coins,
    message,
    code,
    redeemedAt: new Date().toISOString(),
  });
}
