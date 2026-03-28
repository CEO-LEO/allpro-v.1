import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { UserRole } from '@/store/useAuthStore';

// ============================================
// AUTH HELPER FUNCTIONS — Supabase Auth
// ============================================

export interface AuthResult {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    xp?: number;
    coins?: number;
    level?: number;
    // Merchant-specific (from merchant_profiles table)
    shopName?: string;
    shopLogo?: string;
    shopAddress?: string;
    phone?: string;
    shopSocialLine?: string;
    shopSocialFacebook?: string;
    shopSocialInstagram?: string;
    shopSocialWebsite?: string;
  };
}

/**
 * Sign up with email & password
 * 1) สร้าง auth.users ผ่าน Supabase Auth
 * 2) Upsert ข้อมูลลง profiles table ด้วย (ไม่พึ่ง trigger เพียงอย่างเดียว)
 */
export async function signUp(
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase ยังไม่ได้ตั้งค่า กรุณาเพิ่ม .env.local' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=EF4444&color=fff&size=128`,
      },
    },
  });

  if (error) {
    // Map common Supabase errors to Thai messages
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      return { success: false, error: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบแทน' };
    }
    if (error.message.includes('Password') || error.message.includes('password')) {
      return { success: false, error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' };
    }
    if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
      return { success: false, error: 'ส่งคำขอบ่อยเกินไป กรุณารอ 1 นาทีแล้วลองใหม่' };
    }
    if (error.message.includes('invalid') && error.message.includes('email')) {
      return { success: false, error: 'รูปแบบอีเมลไม่ถูกต้อง กรุณาใช้อีเมลจริง เช่น name@gmail.com' };
    }
    if (error.message.includes('signup_disabled')) {
      return { success: false, error: 'ระบบสมัครสมาชิกปิดอยู่ชั่วคราว' };
    }
    // ★ Database trigger error — ยังคง return success เพราะ user ถูกสร้างแล้ว
    if (error.message.includes('Database error saving new user') || error.message.includes('database')) {
      console.warn('[signUp] DB trigger error — user may have been created, attempting login...');
      // ลอง signIn เพราะ user อาจถูกสร้างแล้วแม้ trigger จะ fail
      try {
        const loginResult = await signIn(email, password);
        if (loginResult.success) {
          return loginResult;
        }
      } catch {
        // ignore
      }
      return { success: false, error: 'เกิดข้อผิดพลาดจากฐานข้อมูล กรุณาลองสมัครใหม่อีกครั้ง' };
    }
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'ไม่สามารถสร้างบัญชีได้' };
  }

  // ── Upsert ลง profiles table ด้วยตัวเอง (ไม่พึ่ง DB trigger เพียงอย่างเดียว) ──
  try {
    await supabase.from('profiles').upsert(
      {
        id: data.user.id,
        email: email,
        username: name,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=EF4444&color=fff&size=128`,
        role: role === 'MERCHANT' ? 'MERCHANT' : 'USER',
        coins: 50,
        xp: 0,
        level: 1,
      },
      { onConflict: 'id' }
    );
  } catch (profileErr) {
    // ไม่ block signup ถ้า profiles table ยังไม่มี
    console.warn('Could not upsert profile (table may not exist):', profileErr);
  }

  // เช็กว่า Supabase ต้องการ email confirmation หรือไม่
  const needsConfirmation = !data.session;

  return {
    success: true,
    needsEmailConfirmation: needsConfirmation,
    user: {
      id: data.user.id,
      email: data.user.email || email,
      name,
      role,
    },
  };
}

/**
 * Sign in with email & password
 * หลัง login สำเร็จ → ดึง profile จาก profiles table
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase ยังไม่ได้ตั้งค่า กรุณาเพิ่ม .env.local' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // ── Email not confirmed (Supabase versions return different messages) ──
    if (
      error.message.includes('Email not confirmed') ||
      error.message.includes('email_not_confirmed') ||
      (error as any)?.code === 'email_not_confirmed'
    ) {
      return {
        success: false,
        error: '📧 กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ (ตรวจสอบกล่องจดหมายหรือ Spam)',
      };
    }
    if (error.message.includes('Invalid login') || error.message.includes('invalid_credentials')) {
      return { success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    }
    if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
      return { success: false, error: 'ล็อคอินบ่อยเกินไป กรุณารอ 1 นาทีแล้วลองใหม่' };
    }
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'ไม่พบบัญชีผู้ใช้' };
  }

  // Fetch profile data — wrapped in try/catch so DB errors don't crash login
  let profile: Record<string, any> | null = null;
  try {
    profile = await fetchProfile(data.user.id);
  } catch (err) {
    console.warn('fetchProfile failed (table may not exist):', err);
    // Continue with null profile — use metadata fallback
  }

  const metadata = data.user.user_metadata || {};

  // ── ถ้าไม่มี profile row (เช่น หลัง schema reset) → สร้างให้ ──
  if (!profile) {
    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email || email,
        username: metadata.name || email.split('@')[0],
        avatar_url: metadata.avatar_url || '',
        role: metadata.role || 'user',
        coins: 50,
        xp: 0,
        level: 1,
      }, { onConflict: 'id' });
      console.log('[signIn] Created missing profile for', data.user.id);
    } catch (profileErr) {
      console.warn('[signIn] Could not create profile:', profileErr);
    }
  }

  // Role priority: profiles table > user_metadata > default
  const profileRole = profile?.role;
  const metaRole = metadata.role as string | undefined;
  let resolvedRole: UserRole = 'USER';
  if (profileRole === 'MERCHANT' || metaRole === 'MERCHANT') {
    resolvedRole = 'MERCHANT';
  } else if (profileRole === 'USER' || metaRole === 'USER') {
    resolvedRole = 'USER';
  }

  // Fetch merchant profile if role is MERCHANT
  let merchantData: Record<string, any> | null = null;
  if (resolvedRole === 'MERCHANT') {
    try {
      merchantData = await fetchMerchantProfile(data.user.id);
    } catch (err) {
      console.warn('signIn: fetchMerchantProfile failed:', err);
    }
  }

  return {
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email || email,
      name: metadata.name || profile?.username || 'ผู้ใช้',
      role: resolvedRole,
      avatar: metadata.avatar_url || profile?.avatar_url || undefined,
      xp: profile?.xp ?? 0,
      coins: profile?.coins ?? 100,
      level: profile?.level ?? 1,
      // Merchant-specific fields from merchant_profiles table
      shopName: merchantData?.shop_name || undefined,
      shopLogo: merchantData?.shop_logo || undefined,
      shopAddress: merchantData?.shop_address || undefined,
      phone: merchantData?.phone || undefined,
      shopSocialLine: merchantData?.line_id || undefined,
      shopSocialFacebook: merchantData?.facebook || undefined,
      shopSocialInstagram: merchantData?.instagram || undefined,
      shopSocialWebsite: merchantData?.website || undefined,
    },
  };
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('signOut error:', err);
  }
}

/**
 * Fetch user profile from profiles table
 */
export async function fetchProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data;
  } catch (err) {
    console.warn('fetchProfile exception:', err);
    return null;
  }
}

/**
 * Fetch merchant profile from merchant_profiles table
 * Returns shop-specific fields (shopName, shopLogo, etc.)
 */
export async function fetchMerchantProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('merchant_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  } catch (err) {
    console.warn('fetchMerchantProfile exception:', err);
    return null;
  }
}

/**
 * Get current session (for AuthListener)
 */
export async function getCurrentSession() {
  if (!isSupabaseConfigured) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    let profile: Record<string, any> | null = null;
    try {
      profile = await fetchProfile(session.user.id);
    } catch {
      // ignore
    }
    const metadata = session.user.user_metadata || {};

    // Role priority: profiles > metadata > default
    const profileRole = profile?.role;
    const metaRole = metadata.role as string | undefined;
    let resolvedRole: UserRole = 'USER';
    if (profileRole === 'MERCHANT' || metaRole === 'MERCHANT') {
      resolvedRole = 'MERCHANT';
    }

    // Fetch merchant profile if role is MERCHANT
    let merchantData: Record<string, any> | null = null;
    if (resolvedRole === 'MERCHANT') {
      try {
        merchantData = await fetchMerchantProfile(session.user.id);
      } catch (err) {
        console.warn('getCurrentSession: fetchMerchantProfile failed:', err);
      }
    }

    return {
      id: session.user.id,
      email: session.user.email || '',
      name: metadata.name || profile?.username || 'ผู้ใช้',
      role: resolvedRole,
      avatar: metadata.avatar_url || profile?.avatar_url || undefined,
      xp: profile?.xp ?? 0,
      coins: profile?.coins ?? 100,
      level: profile?.level ?? 1,
      // Merchant-specific fields
      shopName: merchantData?.shop_name || undefined,
      shopLogo: merchantData?.shop_logo || undefined,
      shopAddress: merchantData?.shop_address || undefined,
      phone: merchantData?.phone || undefined,
      shopSocialLine: merchantData?.line_id || undefined,
      shopSocialFacebook: merchantData?.facebook || undefined,
      shopSocialInstagram: merchantData?.instagram || undefined,
      shopSocialWebsite: merchantData?.website || undefined,
    };
  } catch (err) {
    console.error('getCurrentSession error:', err);
    return null;
  }
}
