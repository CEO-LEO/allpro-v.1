-- ============================================================================
-- Real restock notifications (the "แจ้งเตือนเมื่อมีของ" bell on NotifyButton)
-- ============================================================================
-- Previously: subscribing was localStorage-only (lib/notificationContext.tsx),
-- and the "notify subscribers" trigger was a client-side window.dispatchEvent
-- custom browser event — it only worked if the merchant marking something
-- back in stock and the subscribed customer happened to be looking at the
-- exact same open browser tab. It never worked across different users or
-- devices, which is the entire point of a restock alert.
--
-- This makes it real: a subscription table, and a DB trigger on the already
---real product_branch_stock table (used by /merchant/stock) that inserts a
-- real row into the already-real `notifications` table (read by
-- /notifications) the moment a branch flips a product back to available.
-- One-shot: the subscription is consumed once the notification fires.

CREATE TABLE IF NOT EXISTS product_notify_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_notify_subs_product ON product_notify_subscriptions (product_id);

ALTER TABLE product_notify_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own restock subscriptions" ON product_notify_subscriptions;
CREATE POLICY "Users manage own restock subscriptions"
  ON product_notify_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Trigger: when a branch flips a product from unavailable -> available,
-- notify (and then clear) everyone subscribed to that product
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_restock_subscribers()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_title TEXT;
BEGIN
  SELECT title INTO v_title FROM products WHERE id::text = NEW.product_id;

  INSERT INTO notifications (user_id, type, title, message, promotion_id, is_read)
  SELECT
    s.user_id,
    'restock',
    'สินค้ากลับมามีแล้ว! 🟢',
    COALESCE(v_title, 'สินค้าที่คุณติดตาม') || ' กลับมามีสต็อกแล้ว รีบไปก่อนหมด!',
    NEW.product_id,
    FALSE
  FROM product_notify_subscriptions s
  WHERE s.product_id = NEW.product_id;

  DELETE FROM product_notify_subscriptions WHERE product_id = NEW.product_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_restock ON product_branch_stock;
CREATE TRIGGER trg_notify_restock
AFTER UPDATE ON product_branch_stock
FOR EACH ROW
WHEN (OLD.is_available IS DISTINCT FROM NEW.is_available AND NEW.is_available = TRUE)
EXECUTE FUNCTION public.notify_restock_subscribers();
