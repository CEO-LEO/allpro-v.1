import { NextRequest, NextResponse } from 'next/server';

// GET /api/merchant/profile — Check if merchant profile is complete
export async function GET(req: NextRequest) {
  // In a real app, extract merchant ID from session/token
  // For demo, we accept merchantId as a query param
  const { searchParams } = new URL(req.url);
  const merchantId = searchParams.get('merchantId');

  if (!merchantId) {
    return NextResponse.json(
      { error: 'merchantId is required' },
      { status: 400 }
    );
  }

  // TODO: Replace with real database query
  // const merchant = await db.merchant.findUnique({ where: { id: merchantId } });
  // For now, return a mock response
  return NextResponse.json({
    merchantId,
    isProfileComplete: false,
    checklist: {
      shopName: false,
      shopLogo: false,
      shopAddress: false,
      phone: false,
    },
    message: 'Use local store for demo mode',
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

    // Validate required fields
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

    // TODO: Replace with real database write
    // await db.merchant.update({
    //   where: { id: merchantId },
    //   data: {
    //     shopName, shopLogo, shopAddress, phone,
    //     shopCategory, shopDescription,
    //     profileStatus: 'verified',
    //     merchantProfileComplete: true,
    //   },
    // });

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
