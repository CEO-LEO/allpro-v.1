import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/qr/redeem
 *
 * Validates a QR code and returns reward points.
 * When a real database is connected, this will:
 *   1. Verify the QR token against the merchants table
 *   2. Check if the user already redeemed this code (prevent duplicates)
 *   3. Insert a redemption record
 *   4. Credit XP and coins to the user's wallet
 *
 * For now it validates the code format and returns demo rewards.
 */

// Simple set to track redeemed codes in-memory (per server instance)
const redeemedCodes = new Set<string>();

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.code !== 'string' || !body.code.trim()) {
    return NextResponse.json(
      { success: false, error: 'กรุณาส่ง QR Code ที่ถูกต้อง' },
      { status: 400 },
    );
  }

  const code = body.code.trim();

  // Prevent double-redemption (in-memory for demo; use DB in production)
  if (redeemedCodes.has(code)) {
    return NextResponse.json(
      { success: false, error: 'คูปองนี้ถูกใช้ไปแล้ว' },
      { status: 409 },
    );
  }

  // --- Future: validate against Supabase ---
  // const { data: coupon } = await supabase
  //   .from('qr_coupons')
  //   .select('*')
  //   .eq('token', code)
  //   .single();
  // if (!coupon || coupon.expired_at < new Date()) ...

  // Demo: any QR code starting with "ALLPRO" is a valid promo code
  // Others are treated as shop check-in codes
  let xp = 50;
  let coins = 20;
  let message = 'เช็คอินสำเร็จ! คุณได้รับรางวัล';

  if (code.toUpperCase().startsWith('ALLPRO')) {
    xp = 100;
    coins = 50;
    message = 'คูปองพิเศษ! คุณได้รับรางวัลพิเศษ';
  } else if (code.startsWith('http')) {
    // URL-based QR codes (shop links etc.)
    xp = 30;
    coins = 10;
    message = 'สแกนลิงก์ร้านค้าสำเร็จ!';
  }

  // Mark as redeemed
  redeemedCodes.add(code);

  return NextResponse.json({
    success: true,
    xp,
    coins,
    message,
    code,
    redeemedAt: new Date().toISOString(),
  });
}
