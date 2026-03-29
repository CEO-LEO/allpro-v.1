'use client';

import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchProfile, fetchMerchantProfile, getCurrentSession } from '@/lib/supabase/auth';
import { useAuthStore, UserRole } from '@/store/useAuthStore';

// ★ Global flag — LoginModal sets this BEFORE calling signIn()
// so the SIGNED_IN event handler knows to skip
// This is safer than time-based debounce
let loginInProgress = false;
let loginInProgressTimeout: ReturnType<typeof setTimeout> | null = null;

export function setLoginInProgress(value: boolean) {
  loginInProgress = value;
  // Auto-reset after 15 seconds in case something goes wrong
  if (loginInProgressTimeout) clearTimeout(loginInProgressTimeout);
  if (value) {
    loginInProgressTimeout = setTimeout(() => {
      loginInProgress = false;
    }, 15000);
  }
}

/**
 * AuthListener — ตรวจจับสถานะ Auth จาก Supabase
 * วางไว้ใน root layout เพื่อ auto-restore session เมื่อ refresh หน้า
 *
 * Flow หลัก:
 *  1. restoreSession  → ดึง Supabase session + merchant_profiles จาก DB
 *                      → เรียก login() ซึ่ง merge กับ savedMerchantProfile ที่เก็บใน localStorage
 *  2. onAuthStateChange('SIGNED_IN')
 *     - ถ้า LoginModal เพิ่ง set user ไปแล้ว (< 3 วินาที) → ข้าม เพื่อไม่ให้ทับ
 *     - ถ้าเป็น event จาก token refresh หรือ tab focus → ดึง merchant data จาก DB แล้ว merge
 *  3. onAuthStateChange('SIGNED_OUT')
 *     - ถ้า store ยัง authenticated → เรียก logout()
 */
export default function AuthListener() {
  const { login } = useAuthStore();
  const initialCheckDone = useRef(false);
  // Track เวลาที่ login ล่าสุดถูกเรียกจาก LoginModal
  // ใช้ป้องกัน onAuthStateChange ไม่ให้ทับข้อมูลที่เพิ่ง set ไป
  const lastLoginTime = useRef(0);

  // ═══ 1) Restore session on mount — รีเฟรชหน้าแล้วได้ข้อมูลกลับ ═══
  useEffect(() => {
    if (!isSupabaseConfigured || initialCheckDone.current) return;
    initialCheckDone.current = true;

    const restoreSession = async () => {
      try {
        // getCurrentSession() ดึง profiles + merchant_profiles จาก DB ให้เรียบร้อย
        const sessionUser = await getCurrentSession();
        if (!sessionUser) return;

        console.log('[AuthListener] restoreSession — role:', sessionUser.role, 'shopName:', sessionUser.shopName);

        // Mark ว่าเพิ่ง login → ป้องกัน onAuthStateChange('SIGNED_IN') ทับ
        lastLoginTime.current = Date.now();

        login({
          id: sessionUser.id,
          email: sessionUser.email,
          name: sessionUser.name,
          role: sessionUser.role,
          avatar: sessionUser.avatar,
          xp: sessionUser.xp,
          coins: sessionUser.coins,
          level: sessionUser.level,
          // Merchant fields ดึงมาจาก merchant_profiles table
          // login() จะ merge กับ savedMerchantProfile อัตโนมัติ
          shopName: sessionUser.shopName,
          shopLogo: sessionUser.shopLogo,
          shopAddress: sessionUser.shopAddress,
          phone: sessionUser.phone,
          shopSocialLine: sessionUser.shopSocialLine,
          shopSocialFacebook: sessionUser.shopSocialFacebook,
          shopSocialInstagram: sessionUser.shopSocialInstagram,
          shopSocialWebsite: sessionUser.shopSocialWebsite,
        });
      } catch (err) {
        console.error('[AuthListener] restoreSession failed:', err);
      }
    };

    restoreSession();
  }, [login]);

  // ═══ 2) Listen for auth state changes (login / logout / token refresh) ═══
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          // ── SIGNED_IN ──
          if (event === 'SIGNED_IN' && session?.user) {
            // ถ้า LoginModal กำลังทำงานอยู่ → ข้ามเลย (LoginModal จะ call login() เอง)
            if (loginInProgress) {
              console.log('[AuthListener] SIGNED_IN — skipped (loginInProgress flag is set)');
              return;
            }

            // ถ้า login ถูกเรียกไปไม่เกิน 5 วินาทีที่แล้ว (จาก restoreSession)
            const timeSinceLastLogin = Date.now() - lastLoginTime.current;
            if (timeSinceLastLogin < 5000) {
              console.log('[AuthListener] SIGNED_IN — skipped (login was called', timeSinceLastLogin, 'ms ago)');
              return;
            }

            // ถ้า store มี user แล้วและ id ตรงกัน → ข้าม (ไม่ต้องทำซ้ำ)
            const currentState = useAuthStore.getState();
            if (currentState.isAuthenticated && currentState.user?.id === session.user.id) {
              console.log('[AuthListener] SIGNED_IN — skipped (same user already in store)');
              return;
            }

            // กรณีนี้เป็น token refresh / tab focus → ดึงข้อมูลจาก DB ใหม่
            let profile: Record<string, any> | null = null;
            try {
              profile = await fetchProfile(session.user.id);
            } catch (err) {
              console.warn('[AuthListener] fetchProfile failed:', err);
            }
            const metadata = session.user.user_metadata || {};

            const resolvedRole: UserRole =
              (profile?.role === 'MERCHANT' || (metadata.role as string) === 'MERCHANT')
                ? 'MERCHANT'
                : 'USER';

            // ดึง merchant_profiles จาก DB ถ้าเป็น Merchant
            let merchantData: Record<string, any> | null = null;
            if (resolvedRole === 'MERCHANT') {
              try {
                merchantData = await fetchMerchantProfile(session.user.id);
              } catch (err) {
                console.warn('[AuthListener] fetchMerchantProfile failed:', err);
              }
            }

            console.log('[AuthListener] SIGNED_IN (refresh) — role:', resolvedRole, 'shopName:', merchantData?.shop_name);
            lastLoginTime.current = Date.now();

            login({
              id: session.user.id,
              email: session.user.email || '',
              name: metadata.name || profile?.username || 'ผู้ใช้',
              role: resolvedRole,
              avatar: metadata.avatar_url || profile?.avatar_url || undefined,
              xp: profile?.xp ?? 0,
              coins: profile?.coins ?? 100,
              level: profile?.level ?? 1,
              // Merchant fields จาก DB
              shopName: merchantData?.shop_name || undefined,
              shopLogo: merchantData?.shop_logo || undefined,
              shopAddress: merchantData?.shop_address || undefined,
              phone: merchantData?.phone || undefined,
              shopSocialLine: merchantData?.line_id || undefined,
              shopSocialFacebook: merchantData?.facebook || undefined,
              shopSocialInstagram: merchantData?.instagram || undefined,
              shopSocialWebsite: merchantData?.website || undefined,
            });
          }

          // ── SIGNED_OUT ──
          if (event === 'SIGNED_OUT') {
            const currentState = useAuthStore.getState();
            if (currentState.isAuthenticated || currentState.user) {
              console.log('[AuthListener] SIGNED_OUT — clearing store (without calling signOut again)');
              // ★ Direct state clear — do NOT call logout() which would call signOut()
              //    and trigger SIGNED_OUT again → infinite loop
              useAuthStore.setState({ user: null, isAuthenticated: false });
            }
          }
        } catch (err) {
          console.error('[AuthListener] onAuthStateChange error:', err);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [login]);

  return null;
}
