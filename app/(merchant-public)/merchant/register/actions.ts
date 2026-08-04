'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export type MerchantRegisterState = {
  success: boolean;
  message: string;
};

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
  const documentFile = formData.get('documents');

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

  // Upload the verification document for real, if one was attached
  let documentUrl: string | undefined;
  if (documentFile instanceof File && documentFile.size > 0) {
    const ext = documentFile.name.split('.').pop() || 'pdf';
    const filePath = `merchant-documents/${user.id}_${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('promotions')
      .upload(filePath, documentFile, {
        contentType: documentFile.type || 'application/octet-stream',
        upsert: false,
      });

    if (!uploadError) {
      const { data: pub } = supabase.storage.from('promotions').getPublicUrl(filePath);
      documentUrl = pub.publicUrl;
    } else {
      console.error('[registerMerchantAction] document upload error:', uploadError.message);
    }
  }

  // Activate the account as a real merchant, atomically, via the RPC — a
  // plain client-side profiles.update({role:'MERCHANT'}) gets silently
  // reset by the lock_protected_profile_columns trigger (see
  // add-merchant-register-fields.sql), so this has to go through a
  // SECURITY DEFINER function like every other role/points mutation in
  // this app.
  const { data: activateData, error: activateError } = await supabase.rpc('activate_merchant', {
    p_shop_name: shopName,
    p_tax_id: taxId,
    p_branch_name: branchName,
    p_logo_url: logoUrl || null,
    p_document_url: documentUrl || null,
  });

  const activateRow = Array.isArray(activateData) ? activateData[0] : activateData;

  if (activateError || !activateRow?.success) {
    console.error('[registerMerchantAction] activate_merchant error:', activateError?.message);
    return {
      success: false,
      message: 'ไม่สามารถเปิดใช้งานร้านค้าได้ กรุณาลองใหม่หรือติดต่อแอดมิน',
    };
  }

  return {
    success: true,
    message: 'สมัคร Partner สำเร็จแล้ว! กำลังพาไปหน้าจัดการร้านค้า...',
  };
}
