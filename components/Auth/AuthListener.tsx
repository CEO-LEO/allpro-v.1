'use client';

import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchProfile } from '@/lib/supabase/auth';
import { useAuthStore, UserRole } from '@/store/useAuthStore';

/**
 * AuthListener — ตรวจจับสถานะ Auth จาก Supabase
 * วางไว้ใน root layout เพื่อ auto-restore session เมื่อ refresh หน้า
 */
export default function AuthListener() {
  const { login, logout } = useAuthStore();

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id);
          const metadata = session.user.user_metadata || {};

          login({
            id: session.user.id,
            email: session.user.email || '',
            name: metadata.name || profile?.username || 'ผู้ใช้',
            role: (metadata.role as UserRole) || 'USER',
            avatar: metadata.avatar_url || profile?.avatar_url || undefined,
            xp: profile?.xp ?? 0,
            coins: profile?.coins ?? 100,
            level: profile?.level ?? 1,
          });
        }

        if (event === 'SIGNED_OUT') {
          logout();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [login, logout]);

  return null; // Invisible component
}
