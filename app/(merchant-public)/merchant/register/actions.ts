'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export type MerchantRegisterState = {
  success: boolean;
  message: string;
};

function createSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

export async function registerMerchantAction(
  _prevState: MerchantRegisterState,
  formData: FormData
): Promise<MerchantRegisterState> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: 'กรุณาเข้าสู่ระบบก่อนสมัครพาร์ทเนอร์',
    };
  }

  const shopName = String(formData.get('shopName') ?? '').trim();
  const branchName = String(formData.get('branchName') ?? '').trim();
  const taxId = String(formData.get('taxId') ?? '').trim();
  const logoUrl = String(formData.get('logoUrl') ?? '').trim();

  if (!shopName || !branchName || !taxId) {
    return {
      success: false,
      message: 'กรุณากรอกข้อมูลร้านให้ครบถ้วน',
    };
  }

  if (!/^\d{13}$/.test(taxId)) {
    return {
      success: false,
      message: 'Tax ID ต้องเป็นตัวเลข 13 หลัก',
    };
  }

  const slugBase = createSlug(shopName) || `merchant-${user.id.slice(0, 8)}`;
  const slug = `${slugBase}-${user.id.slice(0, 6)}`;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'merchant', updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (profileError) {
    return {
      success: false,
      message: 'ไม่สามารถอัปเดตสิทธิ์เป็น merchant ได้',
    };
  }

  const { data: existingMerchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  let merchantId = existingMerchant?.id ?? null;

  if (!merchantId) {
    const { data: createdMerchant, error: merchantCreateError } = await supabase
      .from('merchants')
      .insert({
        owner_id: user.id,
        name: shopName,
        slug,
        tax_id: taxId,
        status: 'pending',
        tier: 'sme',
      })
      .select('id')
      .single();

    if (merchantCreateError || !createdMerchant) {
      return {
        success: false,
        message: 'อัปเดต role สำเร็จ แต่สร้างข้อมูลร้านค้าไม่สำเร็จ กรุณาติดต่อแอดมิน',
      };
    }

    merchantId = createdMerchant.id;
  } else {
    await supabase
      .from('merchants')
      .update({
        name: shopName,
        tax_id: taxId,
        status: 'pending',
      })
      .eq('id', merchantId);
  }

  if (merchantId) {
    await supabase
      .from('branches')
      .insert({
        merchant_id: merchantId,
        name: branchName,
      })
      .select('id')
      .single();
  }

  const metaPatch: Record<string, string> = {
    shop_name: shopName,
    branch_name: branchName,
  };

  if (logoUrl) {
    metaPatch.logo_url = logoUrl;
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: metaPatch,
  });
  if (updateError) {
    console.error('updateUser error:', updateError);
  }

  return {
    success: true,
    message: 'ส่งคำขอสมัคร Partner สำเร็จแล้ว ระบบกำลังตรวจสอบข้อมูลร้านค้า',
  };
}
