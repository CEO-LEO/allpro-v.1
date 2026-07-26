import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

// GET /api/merchant/profile — Check if merchant profile is complete
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const merchantId = searchParams.get('merchantId');

  if (!merchantId) {
    return NextResponse.json(
      { error: 'merchantId is required' },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('merchant_profiles')
    .select('*')
    .or(`id.eq.${merchantId},user_id.eq.${merchantId}`)
    .maybeSingle();

  if (error) {
    console.error('[merchant-profile] fetch error:', error.message);
    return NextResponse.json(
      { error: 'ไม่สามารถโหลดโปรไฟล์ร้านค้าได้' },
      { status: 500 }
    );
  }

  const checklist = {
    shopName: Boolean(data?.shop_name),
    shopLogo: Boolean(data?.shop_logo),
    shopAddress: Boolean(data?.shop_address),
    phone: Boolean(data?.phone),
  };

  return NextResponse.json({
    merchantId,
    isProfileComplete: Object.values(checklist).every(Boolean),
    checklist,
    message: data ? 'Loaded from Supabase' : 'No merchant profile found yet',
  });
}

// POST /api/merchant/profile — Save merchant profile and mark as complete
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchantId, shopName, shopLogo, shopAddress, phone, shopCategory, shopDescription } = body;

    if (!merchantId) {
      return NextResponse.json(
        { error: 'merchantId is required' },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    if (!shopName?.trim()) errors.push('ชื่อร้านค้า');
    if (!shopLogo) errors.push('โลโก้ร้านค้า');
    if (!shopAddress?.trim()) errors.push('ที่ตั้งร้านค้า');
    if (!phone?.trim() || phone.trim().length < 9) errors.push('เบอร์โทรศัพท์');

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: 'ข้อมูลไม่ครบถ้วน',
          missingFields: errors,
          isProfileComplete: false,
        },
        { status: 422 }
      );
    }

    const supabase = createServiceRoleClient();
    const { error } = await supabase.from('merchant_profiles').upsert({
      id: merchantId,
      user_id: merchantId,
      shop_name: shopName,
      shop_logo: shopLogo,
      shop_address: shopAddress,
      phone,
      line_id: body.shopSocialLine || '',
      instagram: body.shopSocialInstagram || '',
      facebook: body.shopSocialFacebook || '',
      website: body.shopSocialWebsite || '',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (error) {
      console.error('[merchant-profile] upsert error:', error.message);
      return NextResponse.json(
        { error: 'ไม่สามารถบันทึกโปรไฟล์ร้านค้าได้' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      merchantId,
      isProfileComplete: true,
      profileStatus: 'verified',
      message: 'โปรไฟล์ร้านค้าบันทึกสำเร็จ',
    });
  } catch {
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}
