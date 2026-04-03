import { supabase, isSupabaseConfigured } from './supabase';

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

export interface SEMProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price: number;
  image: string;
  category: string;
  shop_name: string;
  shop_id: string;
  discount: number;
  location: string;
  distance: string;
  likes: number;
  reviews: number;
  rating: number;
  sem_keywords: string[];
  cpc_bid: number;
  sem_active: boolean;
  is_sem_result: boolean;
  sem_rank: number;
  created_at: string;
}

export interface WalletInfo {
  balance: number;
  total_spent: number;
}

export interface AdClickResult {
  success: boolean;
  click_id?: string;
  amount_charged?: number;
  balance_remaining?: number;
  error?: string;
  message?: string;
}

export interface SEMBid {
  id: string;
  title: string;
  sem_keywords: string[];
  cpc_bid: number;
  sem_active: boolean;
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

// ═══════════════════════════════════════════════════════
// Search with SEM ranking
// ═══════════════════════════════════════════════════════

/**
 * ค้นหาโปรโมชันพร้อมจัดอันดับ SEM
 * เรียก RPC: search_promotions_with_sem
 */
export async function searchWithSEM(query: string, limit = 50): Promise<SEMProduct[]> {
  if (!isSupabaseConfigured || !query.trim()) return [];

  try {
    const { data, error } = await supabase.rpc('search_promotions_with_sem', {
      search_query: query.trim(),
      result_limit: limit,
    });

    if (error) {
      console.error('SEM search error:', error);
      return [];
    }

    return (data || []) as SEMProduct[];
  } catch (err) {
    console.error('SEM search failed:', err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// Ad Click Processing (PPC)
// ═══════════════════════════════════════════════════════

/**
 * บันทึกคลิกโฆษณา + หักเงินจาก wallet ของร้านค้า
 * กัน click spam: user เดียวกัน + product เดียวกัน ซ้ำภายใน 30 นาที
 */
export async function handleAdClick(params: {
  productId: string;
  shopId: string;
  keyword: string;
  cpcAmount: number;
}): Promise<AdClickResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'not_configured', message: 'ระบบไม่พร้อมใช้งาน' };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase.rpc('process_ad_click', {
      p_product_id: params.productId,
      p_shop_id: params.shopId,
      p_user_id: user?.id || null,
      p_keyword: params.keyword,
      p_cpc_amount: params.cpcAmount,
      p_ip_hash: null, // IP hash ควรส่งจาก server-side สำหรับ production
    });

    if (error) {
      console.error('Ad click error:', error);
      return { success: false, error: 'rpc_error', message: error.message };
    }

    return data as AdClickResult;
  } catch (err) {
    console.error('Ad click failed:', err);
    return { success: false, error: 'unknown', message: 'เกิดข้อผิดพลาด' };
  }
}

// ═══════════════════════════════════════════════════════
// Merchant SEM Management
// ═══════════════════════════════════════════════════════

/**
 * อัปเดต SEM keywords + CPC bid สำหรับสินค้า
 */
export async function updateSEMBid(
  productId: string,
  keywords: string[],
  cpcBid: number,
  active: boolean
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const cleanKeywords = keywords
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);

    const { error } = await supabase
      .from('products')
      .update({
        sem_keywords: cleanKeywords,
        cpc_bid: cpcBid,
        sem_active: active && cleanKeywords.length > 0 && cpcBid > 0,
      })
      .eq('id', productId);

    if (error) {
      console.error('Update SEM bid error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Update SEM bid failed:', err);
    return false;
  }
}

/**
 * ดึง SEM bids ทั้งหมดของร้านค้า
 */
export async function fetchMerchantSEMBids(shopId: string, shopName: string): Promise<SEMBid[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, sem_keywords, cpc_bid, sem_active')
      .or(`shop_id.eq.${shopId},shop_name.eq.${shopName}`)
      .order('cpc_bid', { ascending: false });

    if (error) {
      console.error('Fetch SEM bids error:', error);
      return [];
    }

    return (data || []) as SEMBid[];
  } catch (err) {
    console.error('Fetch SEM bids failed:', err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// Wallet Management
// ═══════════════════════════════════════════════════════

/**
 * ดึงยอดเงินกระเป๋าร้านค้า (สร้างอัตโนมัติถ้ายังไม่มี)
 */
export async function getShopWallet(shopId: string): Promise<WalletInfo> {
  if (!isSupabaseConfigured) return { balance: 0, total_spent: 0 };

  try {
    const { data, error } = await supabase
      .from('shop_wallets')
      .select('balance, total_spent')
      .eq('shop_id', shopId)
      .single();

    if (error && error.code === 'PGRST116') {
      // ไม่มี wallet → สร้างใหม่
      const { data: newWallet } = await supabase
        .from('shop_wallets')
        .insert({ shop_id: shopId, balance: 0, total_spent: 0 })
        .select('balance, total_spent')
        .single();

      return newWallet || { balance: 0, total_spent: 0 };
    }

    return data || { balance: 0, total_spent: 0 };
  } catch {
    return { balance: 0, total_spent: 0 };
  }
}

/**
 * เติมเงินกระเป๋าร้านค้า
 */
export async function topUpWallet(shopId: string, amount: number): Promise<{ success: boolean; newBalance: number }> {
  if (!isSupabaseConfigured || amount <= 0) {
    return { success: false, newBalance: 0 };
  }

  try {
    // ดึงยอดปัจจุบัน
    const wallet = await getShopWallet(shopId);
    const newBalance = wallet.balance + amount;

    // อัปเดตยอด
    const { error } = await supabase
      .from('shop_wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('shop_id', shopId);

    if (error) return { success: false, newBalance: wallet.balance };

    // บันทึกธุรกรรม
    await supabase.from('wallet_transactions').insert({
      shop_id: shopId,
      type: 'topup',
      amount: amount,
      balance_after: newBalance,
      description: `เติมเงิน ฿${amount}`,
    });

    return { success: true, newBalance };
  } catch {
    return { success: false, newBalance: 0 };
  }
}

/**
 * ดึงประวัติธุรกรรมของร้านค้า
 */
export async function getWalletTransactions(shopId: string, limit = 20): Promise<WalletTransaction[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('id, type, amount, balance_after, description, created_at')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []) as WalletTransaction[];
  } catch {
    return [];
  }
}

/**
 * ดึงสถิติคลิก SEM ของร้านค้า
 */
export async function getSEMClickStats(shopId: string, days = 30): Promise<{
  totalClicks: number;
  totalSpent: number;
  clicksByKeyword: { keyword: string; clicks: number; spent: number }[];
}> {
  if (!isSupabaseConfigured) return { totalClicks: 0, totalSpent: 0, clicksByKeyword: [] };

  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('ad_click_logs')
      .select('keyword, cpc_amount')
      .eq('shop_id', shopId)
      .gte('clicked_at', since);

    if (error || !data) return { totalClicks: 0, totalSpent: 0, clicksByKeyword: [] };

    const totalClicks = data.length;
    const totalSpent = data.reduce((sum, d) => sum + (d.cpc_amount || 0), 0);

    // Group by keyword
    const kwMap: Record<string, { clicks: number; spent: number }> = {};
    data.forEach(d => {
      const kw = d.keyword || 'unknown';
      if (!kwMap[kw]) kwMap[kw] = { clicks: 0, spent: 0 };
      kwMap[kw].clicks++;
      kwMap[kw].spent += d.cpc_amount || 0;
    });

    const clicksByKeyword = Object.entries(kwMap)
      .map(([keyword, stats]) => ({ keyword, ...stats }))
      .sort((a, b) => b.clicks - a.clicks);

    return { totalClicks, totalSpent, clicksByKeyword };
  } catch {
    return { totalClicks: 0, totalSpent: 0, clicksByKeyword: [] };
  }
}
