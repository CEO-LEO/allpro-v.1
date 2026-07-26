// Points, rewards & voucher system — backed by Supabase (points_transactions,
// reward_stock, voucher_redemptions tables + award_points/redeem_reward/
// redeem_voucher_by_pin RPCs — see add-voucher-system.sql).
// Coins live on profiles.coins and can only change through these RPCs;
// direct client writes are silently reverted by the DB trigger in
// lock-profile-columns.sql.

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface PointsTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  timestamp: Date;
  icon?: string;
}

export interface Voucher {
  id: string;
  rewardId: string;
  rewardName: string;
  rewardImage: string;
  brand: string;
  code: string;
  redeemPin: string;
  qrData: string;
  redeemedAt: Date;
  expiresAt: Date;
  status: 'active' | 'used' | 'expired';
  value: string;
}

interface VoucherRow {
  id: string;
  reward_id: string;
  reward_name: string;
  reward_image: string | null;
  brand: string | null;
  code: string;
  redeem_pin: string;
  qr_data: string;
  redeemed_at: string;
  expires_at: string;
  status: 'active' | 'used' | 'expired';
  value_label: string | null;
}

function mapVoucherRow(r: VoucherRow): Voucher {
  return {
    id: r.id,
    rewardId: r.reward_id,
    rewardName: r.reward_name,
    rewardImage: r.reward_image || '',
    brand: r.brand || '',
    code: r.code,
    redeemPin: r.redeem_pin,
    qrData: r.qr_data,
    redeemedAt: new Date(r.redeemed_at),
    expiresAt: new Date(r.expires_at),
    status: r.status,
    value: r.value_label || '',
  };
}

// Current points balance — reads profiles.coins directly (RLS-readable by owner)
export async function getPointsBalance(): Promise<number> {
  if (!isSupabaseConfigured) return 0;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return 0;

  const { data, error } = await supabase
    .from('profiles')
    .select('coins')
    .eq('id', session.user.id)
    .single();

  if (error || !data) return 0;
  return data.coins || 0;
}

// Award points — real, atomic, server-side (replaces the old localStorage addPoints)
export async function addPoints(amount: number, description: string, icon?: string): Promise<number | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc('award_points', {
    p_amount: amount,
    p_description: description,
    p_icon: icon || '⭐',
  });

  if (error) {
    console.error('[pointsUtils] addPoints error:', error);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return row?.new_balance ?? null;
}

// Points history — real transaction log from points_transactions
export async function getPointsHistory(): Promise<PointsTransaction[]> {
  if (!isSupabaseConfigured) return [];
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return [];

  const { data, error } = await supabase
    .from('points_transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return data.map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    description: t.description,
    timestamp: new Date(t.created_at),
    icon: t.icon || undefined,
  }));
}

// Wallet vouchers — real redemptions from voucher_redemptions, with
// client-side expiry check as a display safety net (server also flips
// status to 'expired' lazily when a redemption is looked up by code)
export async function getWalletVouchers(): Promise<Voucher[]> {
  if (!isSupabaseConfigured) return [];
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return [];

  const { data, error } = await supabase
    .from('voucher_redemptions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('redeemed_at', { ascending: false });

  if (error || !data) return [];
  return (data as VoucherRow[]).map((r) => {
    const voucher = mapVoucherRow(r);
    if (voucher.status === 'active' && new Date() > voucher.expiresAt) {
      voucher.status = 'expired';
    }
    return voucher;
  });
}

export interface RedeemRewardInput {
  rewardId: string;
  rewardName: string;
  rewardImage: string;
  brand: string;
  pointsCost: number;
  valueLabel: string;
  validityDays: number;
}

export type RedeemRewardResult =
  | { success: true; voucher: Voucher; newBalance: number }
  | { success: false; error: 'OUT_OF_STOCK' | 'INSUFFICIENT_POINTS' | 'ALREADY_REDEEMED' | 'NOT_AUTHENTICATED' | 'UNKNOWN' };

// Real reward redemption — atomic on the server (stock + balance checked
// and deducted together). Replaces the old Math.random() > 0.1 fake flow.
export async function redeemReward(input: RedeemRewardInput): Promise<RedeemRewardResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'UNKNOWN' };

  const { data, error } = await supabase.rpc('redeem_reward', {
    p_reward_id: input.rewardId,
    p_reward_name: input.rewardName,
    p_reward_image: input.rewardImage,
    p_brand: input.brand,
    p_points_cost: input.pointsCost,
    p_value_label: input.valueLabel,
    p_validity_days: input.validityDays,
  });

  if (error) {
    const msg = error.message || '';
    if (msg.includes('OUT_OF_STOCK')) return { success: false, error: 'OUT_OF_STOCK' };
    if (msg.includes('INSUFFICIENT_POINTS')) return { success: false, error: 'INSUFFICIENT_POINTS' };
    if (msg.includes('ALREADY_REDEEMED')) return { success: false, error: 'ALREADY_REDEEMED' };
    if (msg.includes('Not authenticated')) return { success: false, error: 'NOT_AUTHENTICATED' };
    console.error('[pointsUtils] redeemReward error:', error);
    return { success: false, error: 'UNKNOWN' };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { success: false, error: 'UNKNOWN' };

  return {
    success: true,
    newBalance: row.new_balance,
    voucher: {
      id: row.voucher_id,
      rewardId: input.rewardId,
      rewardName: input.rewardName,
      rewardImage: input.rewardImage,
      brand: input.brand,
      code: row.code,
      redeemPin: row.redeem_pin,
      qrData: row.qr_data,
      redeemedAt: new Date(),
      expiresAt: new Date(row.expires_at),
      status: 'active',
      value: input.valueLabel,
    },
  };
}

// Staff-side "mark as used" — validates the real per-voucher PIN server-side
export async function redeemVoucherByPin(code: string, pin: string): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured) return { success: false, message: 'ระบบยังไม่พร้อมใช้งาน' };

  const { data, error } = await supabase.rpc('redeem_voucher_by_pin', {
    p_code: code,
    p_pin: pin,
  });

  if (error) {
    console.error('[pointsUtils] redeemVoucherByPin error:', error);
    return { success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return { success: !!row?.success, message: row?.message || '' };
}
