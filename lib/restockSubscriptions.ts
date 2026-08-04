// Real restock-notification subscriptions — replaces the localStorage-only
// version in lib/notificationContext.tsx, which could never notify a
// subscriber on a different device/browser (see add-restock-notifications.sql).
import { supabase, isSupabaseConfigured } from './supabase';

export async function isSubscribedToRestock(productId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('product_notify_subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  return !!data;
}

export async function subscribeToRestock(productId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'ระบบไม่พร้อมใช้งาน' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' };

  const { error } = await supabase
    .from('product_notify_subscriptions')
    .upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id,product_id' });

  if (error) return { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
  return { success: true };
}

export async function unsubscribeFromRestock(productId: string): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) return { success: false };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from('product_notify_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);

  return { success: !error };
}
