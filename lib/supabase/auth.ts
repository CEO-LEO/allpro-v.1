import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { UserRole } from '@/store/useAuthStore';

// ============================================
// AUTH HELPER FUNCTIONS — Supabase Auth
// ============================================

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    xp?: number;
    coins?: number;
    level?: number;
  };
}

/**
 * Sign up with email & password
 * Supabase จะ: สร้าง auth.users → trigger handle_new_user() → สร้าง profiles row อัตโนมัติ
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
    if (error.message.includes('already registered')) {
      return { success: false, error: 'อีเมลนี้ถูกใช้งานแล้ว' };
    }
    if (error.message.includes('Password')) {
      return { success: false, error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' };
    }
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'ไม่สามารถสร้างบัญชีได้' };
  }

  return {
    success: true,
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
    if (error.message.includes('Invalid login')) {
      return { success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    }
    if (error.message.includes('Email not confirmed')) {
      return { success: false, error: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ' };
    }
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'ไม่พบบัญชีผู้ใช้' };
  }

  // Fetch profile data
  const profile = await fetchProfile(data.user.id);
  const metadata = data.user.user_metadata || {};

  return {
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email || email,
      name: metadata.name || profile?.username || 'ผู้ใช้',
      role: (metadata.role as UserRole) || 'USER',
      avatar: metadata.avatar_url || profile?.avatar_url || undefined,
      xp: profile?.xp ?? 0,
      coins: profile?.coins ?? 100,
      level: profile?.level ?? 1,
    },
  };
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
}

/**
 * Fetch user profile from profiles table
 */
export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get current session (for AuthListener)
 */
export async function getCurrentSession() {
  if (!isSupabaseConfigured) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const profile = await fetchProfile(session.user.id);
  const metadata = session.user.user_metadata || {};

  return {
    id: session.user.id,
    email: session.user.email || '',
    name: metadata.name || profile?.username || 'ผู้ใช้',
    role: (metadata.role as UserRole) || 'USER',
    avatar: metadata.avatar_url || profile?.avatar_url || undefined,
    xp: profile?.xp ?? 0,
    coins: profile?.coins ?? 100,
    level: profile?.level ?? 1,
  };
}
