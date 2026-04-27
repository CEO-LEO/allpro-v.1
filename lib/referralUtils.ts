// Referral System Utilities
import { addPoints } from './pointsUtils';

/**
 * Generate a unique referral code for a user
 * Format: HUNTER-XXX (where XXX is a 3-digit number)
 */
export function generateReferralCode(): string {
  const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit number
  return `HUNTER-${randomNum}`;
}

/**
 * Get or create referral code from localStorage
 */
export function getUserReferralCode(): string {
  if (typeof window === 'undefined') return 'HUNTER-000';
  
  const stored = localStorage.getItem('referralCode');
  if (stored) return stored;
  
  const newCode = generateReferralCode();
  localStorage.setItem('referralCode', newCode);
  return newCode;
}

/**
 * Generate referral link with code
 */
export function getReferralLink(code: string): string {
  if (typeof window === 'undefined') {
    return `https://iamrootai.app?ref=${code}`;
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
 * Save referral source (who invited this user)
 */
export function saveReferralSource(referrerCode: string): void {
  if (typeof window === 'undefined') return;
  
  // Only save if user hasn't been referred before
  const existing = localStorage.getItem('referredBy');
  if (!existing) {
    localStorage.setItem('referredBy', referrerCode);
    localStorage.setItem('referralBonusClaimed', 'false');
    
    // Award points to new user
    addPoints(50, 'ลงทะเบียนผ่าน Referral', '🎉');
  }
}

/**
 * Check if user was referred
 */
export function wasReferred(): { referred: boolean; referrerCode?: string } {
  if (typeof window === 'undefined') return { referred: false };
  
  const referrerCode = localStorage.getItem('referredBy');
  return {
    referred: !!referrerCode,
    referrerCode: referrerCode || undefined
  };
}

/**
 * Claim referral bonus
 */
export function claimReferralBonus(): boolean {
  if (typeof window === 'undefined') return false;
  
  const claimed = localStorage.getItem('referralBonusClaimed');
  if (claimed === 'true') return false;
  
  const referrerCode = localStorage.getItem('referredBy');
  if (referrerCode) {
    // Award points to referrer (simulated)
    addPoints(50, `ชวนเพื่อน: ${referrerCode}`, '👥');
  }
  
  localStorage.setItem('referralBonusClaimed', 'true');
  return true;
}

/**
 * Get referral stats (mock)
 */
export function getReferralStats(): {
  totalReferrals: number;
  pointsEarned: number;
  pendingReferrals: number;
} {
  if (typeof window === 'undefined') {
    return { totalReferrals: 0, pointsEarned: 0, pendingReferrals: 0 };
  }
  
  // Mock data - in production, fetch from API
  const referrals = parseInt(localStorage.getItem('totalReferrals') || '0');
  return {
    totalReferrals: referrals,
    pointsEarned: referrals * 50, // 50 points per referral
    pendingReferrals: Math.floor(referrals * 0.3) // 30% pending
  };
}
