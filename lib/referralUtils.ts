// Real referral system — stable per-account code + a real referrals ledger
// via Supabase RPCs (get_or_create_referral_code / apply_referral_code).
// Previously this whole file was localStorage-only: codes were random per
// browser, stats were fabricated, and the referrer's bonus was never really
// awarded (it ran in the referred user's own session, which can't credit a
// different account). See add-real-referral-system.sql.
import { supabase, isSupabaseConfigured } from './supabase';

const PENDING_CODE_KEY = 'pendingReferralCode';

/**
 * Get (or create) the current user's real, stable referral code.
 */
export async function getUserReferralCode(): Promise<string> {
  if (!isSupabaseConfigured) return '';
  try {
    const { data, error } = await supabase.rpc('get_or_create_referral_code');
    if (error) {
      console.error('[referralUtils] getUserReferralCode error:', error.message);
      return '';
    }
    return (data as string) || '';
  } catch (err) {
    console.error('[referralUtils] getUserReferralCode failed:', err);
    return '';
  }
}

/**
 * Generate referral link with code
 */
export function getReferralLink(code: string): string {
  if (typeof window === 'undefined') {
    return `https://allpro.app?ref=${code}`;
  }
  const baseUrl = window.location.origin;
  return `${baseUrl}?ref=${code}`;
}

/**
 * Extract referral code from URL params
 */
export function getReferralCodeFromURL(): string | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  return params.get('ref');
}

/**
 * Remember a referral code seen in the URL so it can be applied for real
 * once the visitor actually authenticates (the RPC requires a real session —
 * it can't be applied here, since whoever's browsing may not even have an
 * account yet).
 */
export function rememberPendingReferralCode(code: string): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(PENDING_CODE_KEY)) {
    localStorage.setItem(PENDING_CODE_KEY, code);
  }
}

/**
 * Called once after a successful login/signup — applies any referral code
 * captured from the URL for real (credits both the referrer and the
 * referred user). Safe to call on every auth event: no-ops if there's no
 * pending code, and the RPC itself rejects a second use.
 */
export async function applyPendingReferralCodeIfAny(): Promise<void> {
  if (typeof window === 'undefined' || !isSupabaseConfigured) return;

  const code = localStorage.getItem(PENDING_CODE_KEY);
  if (!code) return;

  // Clear immediately so a failed/duplicate attempt doesn't retry forever
  localStorage.removeItem(PENDING_CODE_KEY);

  try {
    const { data, error } = await supabase.rpc('apply_referral_code', { p_code: code });
    if (error) {
      console.warn('[referralUtils] apply_referral_code error:', error.message);
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.success) {
      console.log('[referralUtils] Referral bonus applied:', row.bonus_awarded);
    }
  } catch (err) {
    console.warn('[referralUtils] applyPendingReferralCodeIfAny failed:', err);
  }
}

/**
 * Real referral stats for the current user (as referrer) — from the real
 * `referrals` table, not a fabricated heuristic.
 */
export async function getReferralStats(): Promise<{
  totalReferrals: number;
  pointsEarned: number;
}> {
  if (!isSupabaseConfigured) return { totalReferrals: 0, pointsEarned: 0 };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { totalReferrals: 0, pointsEarned: 0 };

    const { data, error } = await supabase
      .from('referrals')
      .select('referrer_bonus')
      .eq('referrer_id', user.id);

    if (error || !data) return { totalReferrals: 0, pointsEarned: 0 };

    return {
      totalReferrals: data.length,
      pointsEarned: data.reduce((sum, r) => sum + (r.referrer_bonus || 0), 0),
    };
  } catch (err) {
    console.error('[referralUtils] getReferralStats failed:', err);
    return { totalReferrals: 0, pointsEarned: 0 };
  }
}
