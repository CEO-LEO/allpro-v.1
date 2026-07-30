import { supabase, isSupabaseConfigured } from './supabase';

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

export type ShoppingRequestStatus = 'open' | 'accepted' | 'completed' | 'cancelled';
export type ShoppingUrgency = 'normal' | 'urgent' | 'asap';

export interface ShoppingRequest {
  id: string;
  requesterId: string;
  title: string;
  description: string;
  category: string;
  storeName: string;
  storeLocation: string;
  pickupLocation: string;
  pickupLat: number | null;
  pickupLng: number | null;
  budget: number;
  serviceFee: number;
  deadline: string;
  urgency: ShoppingUrgency;
  images: string[];
  status: ShoppingRequestStatus;
  runnerId: string | null;
  createdAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
  requester: { name: string; avatar: string | null; phone: string | null } | null;
  runner: { name: string; avatar: string | null; phone: string | null } | null;
}

interface ProfileRow {
  id: string;
  username: string | null;
  avatar_url: string | null;
  phone: string | null;
}

interface RequestRow {
  id: string;
  requester_id: string;
  title: string;
  description: string;
  category: string;
  store_name: string;
  store_location: string;
  pickup_location: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  budget: number;
  service_fee: number;
  deadline: string;
  urgency: ShoppingUrgency;
  images: string[] | null;
  status: ShoppingRequestStatus;
  runner_id: string | null;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
}

// Fetch rows, then batch-fetch profiles for every requester/runner id
// involved and merge in JS — avoids relying on PostgREST auto-detecting an
// embed relationship through two ambiguous FKs (requester_id/runner_id)
// that both point at auth.users rather than directly at profiles (same
// safe two-step pattern already used by app/(user)/map/page.tsx).
async function attachProfiles(rows: RequestRow[]): Promise<ShoppingRequest[]> {
  if (rows.length === 0) return [];

  const userIds = Array.from(
    new Set(rows.flatMap((r) => [r.requester_id, r.runner_id]).filter(Boolean) as string[])
  );

  const profileById = new Map<string, ProfileRow>();
  if (userIds.length > 0) {
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, phone')
      .in('id', userIds);
    (profileRows || []).forEach((p) => profileById.set(p.id, p as ProfileRow));
  }

  const toContact = (id: string | null) => {
    if (!id) return null;
    const p = profileById.get(id);
    return { name: p?.username || 'Hunter', avatar: p?.avatar_url || null, phone: p?.phone || null };
  };

  return rows.map((r) => ({
    id: r.id,
    requesterId: r.requester_id,
    title: r.title,
    description: r.description,
    category: r.category,
    storeName: r.store_name,
    storeLocation: r.store_location,
    pickupLocation: r.pickup_location,
    pickupLat: r.pickup_lat,
    pickupLng: r.pickup_lng,
    budget: Number(r.budget),
    serviceFee: Number(r.service_fee),
    deadline: r.deadline,
    urgency: r.urgency,
    images: r.images || [],
    status: r.status,
    runnerId: r.runner_id,
    createdAt: r.created_at,
    acceptedAt: r.accepted_at,
    completedAt: r.completed_at,
    requester: toContact(r.requester_id),
    runner: toContact(r.runner_id),
  }));
}

// ═══════════════════════════════════════════════════════
// Post a new request
// ═══════════════════════════════════════════════════════

export async function postShoppingRequest(params: {
  title: string;
  description: string;
  category: string;
  storeName: string;
  storeLocation: string;
  pickupLocation: string;
  pickupCoords?: { lat: number; lng: number } | null;
  budget: number;
  serviceFee: number;
  deadline: string; // ISO
  urgency: ShoppingUrgency;
  images?: string[];
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'ระบบไม่พร้อมใช้งาน' };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'กรุณาเข้าสู่ระบบก่อนโพสต์งาน' };

    const { data, error } = await supabase
      .from('shopping_requests')
      .insert({
        requester_id: user.id,
        title: params.title.trim(),
        description: params.description.trim(),
        category: params.category,
        store_name: params.storeName.trim(),
        store_location: params.storeLocation.trim(),
        pickup_location: params.pickupLocation.trim(),
        pickup_lat: params.pickupCoords?.lat ?? null,
        pickup_lng: params.pickupCoords?.lng ?? null,
        budget: params.budget,
        service_fee: params.serviceFee,
        deadline: params.deadline,
        urgency: params.urgency,
        images: params.images || [],
      })
      .select('id')
      .single();

    if (error) {
      console.error('[shoppingService] post error:', error);
      return { success: false, error: 'โพสต์งานไม่สำเร็จ กรุณาลองใหม่' };
    }

    return { success: true, id: data.id };
  } catch (err) {
    console.error('[shoppingService] post failed:', err);
    return { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
  }
}

// ═══════════════════════════════════════════════════════
// Browse open requests (excludes the current user's own posts)
// ═══════════════════════════════════════════════════════

export async function fetchOpenShoppingRequests(): Promise<ShoppingRequest[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('shopping_requests')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (user) {
      query = query.neq('requester_id', user.id);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[shoppingService] fetchOpen error:', error);
      return [];
    }
    return attachProfiles((data || []) as RequestRow[]);
  } catch (err) {
    console.error('[shoppingService] fetchOpen failed:', err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// "My Requests" (as poster) — all statuses
// ═══════════════════════════════════════════════════════

export async function fetchMyPostedRequests(): Promise<ShoppingRequest[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('shopping_requests')
      .select('*')
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[shoppingService] fetchMyPosted error:', error);
      return [];
    }
    return attachProfiles((data || []) as RequestRow[]);
  } catch (err) {
    console.error('[shoppingService] fetchMyPosted failed:', err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// "My Jobs" (as runner) — jobs I've accepted
// ═══════════════════════════════════════════════════════

export async function fetchMyAcceptedJobs(): Promise<ShoppingRequest[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('shopping_requests')
      .select('*')
      .eq('runner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[shoppingService] fetchMyJobs error:', error);
      return [];
    }
    return attachProfiles((data || []) as RequestRow[]);
  } catch (err) {
    console.error('[shoppingService] fetchMyJobs failed:', err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// Real count of completed jobs for a user (as runner) — used instead of a
// fabricated star rating, since no review system exists yet
// ═══════════════════════════════════════════════════════

export async function getCompletedJobCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured) return 0;
  try {
    const { count, error } = await supabase
      .from('shopping_requests')
      .select('*', { count: 'exact', head: true })
      .eq('runner_id', userId)
      .eq('status', 'completed');
    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

// ═══════════════════════════════════════════════════════
// State transitions — all via SECURITY DEFINER RPC (atomic, race-safe)
// ═══════════════════════════════════════════════════════

async function callTransitionRpc(
  rpcName: 'accept_shopping_request' | 'cancel_shopping_request' | 'complete_shopping_request',
  requestId: string
): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured) return { success: false, message: 'ระบบไม่พร้อมใช้งาน' };

  try {
    const { data, error } = await supabase.rpc(rpcName, { p_request_id: requestId });
    if (error) {
      console.error(`[shoppingService] ${rpcName} error:`, error.message);
      return { success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
    }
    const row = Array.isArray(data) ? data[0] : data;
    return { success: !!row?.success, message: row?.message || 'เกิดข้อผิดพลาด' };
  } catch {
    return { success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
  }
}

export const acceptShoppingRequest = (requestId: string) => callTransitionRpc('accept_shopping_request', requestId);
export const cancelShoppingRequest = (requestId: string) => callTransitionRpc('cancel_shopping_request', requestId);
export const completeShoppingRequest = (requestId: string) => callTransitionRpc('complete_shopping_request', requestId);
