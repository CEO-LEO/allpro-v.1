// ============================================================
// Merchant Deal Management — Domain Types
// Maps to the pro-hunter-schema.sql tables
// ============================================================

// ---------- Enums (mirror SQL enums) ----------

export type PromoType =
  | 'discount'
  | 'bogo'
  | 'bundle'
  | 'loyalty_stamp'
  | 'flash_sale'
  | 'coupon_code'
  | 'free_gift'
  | 'cashback'
  | 'free_shipping'
  | 'tier_pricing'
  | 'custom';

export type PromoStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'expired'
  | 'archived';

export type MerchantTier = 'micro' | 'sme' | 'enterprise';

export type MerchantStatus = 'pending' | 'active' | 'suspended' | 'archived';

// ---------- JSONB metadata shapes ----------

/** Flexible conditions stored in promo_rules JSONB */
export interface PromoRules {
  // Time-based conditions
  day_of_week?: string[];            // e.g. ['wednesday']
  time_range?: { from: string; to: string }; // e.g. { from: '11:00', to: '14:00' }

  // Loyalty conditions
  stamp_required?: number;           // e.g. 5 stamps to get reward
  stamp_reward?: string;             // e.g. 'free coffee'

  // Purchase conditions
  min_purchase?: number;             // e.g. 300 baht minimum
  max_discount?: number;             // e.g. cap at 100 baht

  // Targeting
  new_customer_only?: boolean;
  member_only?: boolean;
  tier_required?: string[];          // e.g. ['gold', 'platinum']

  // Bundle / BOGO specifics
  buy_quantity?: number;
  get_quantity?: number;
  bundle_items?: string[];

  // Coupon code
  coupon_code?: string;
  single_use?: boolean;

  // Custom SME conditions (catch-all)
  custom_conditions?: string[];      // e.g. ['เฉพาะวันพุธ', 'สะสมแต้มครบ 5 ครั้ง']

  // Anything else the SME wants to store
  [key: string]: unknown;
}

// ---------- Core domain models ----------

export interface Branch {
  id: string;
  merchant_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  lat: number;
  lng: number;
  operating_hours: Record<string, { open: string; close: string }> | null;
  is_active: boolean;
  created_at: string;
}

export interface Deal {
  id: string;
  merchant_id: string;
  title: string;
  description: string | null;
  promo_type: PromoType;
  original_price: number | null;
  promo_price: number | null;
  discount_pct: number | null;
  category: string;
  status: PromoStatus;
  valid_from: string;
  valid_until: string;
  promo_rules: PromoRules;
  image_url: string | null;
  tags: string[];
  quota_total: number | null;
  quota_used: number;
  view_count: number;
  save_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  branch_count?: number;
  branches?: BranchCoordinate[];
}

export interface BranchCoordinate {
  id?: string;
  branch_id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

// ---------- Input DTOs ----------

export interface CreateDealInput {
  merchant_id: string;
  title: string;
  description?: string;
  promo_type: PromoType;
  original_price?: number;
  promo_price?: number;
  discount_pct?: number;
  category: string;
  valid_from?: string;    // ISO 8601
  valid_until?: string;   // ISO 8601
  promo_rules?: PromoRules;
  metadata?: Record<string, unknown>;
  image_url?: string;
  tags?: string[];
  quota_total?: number;
  status?: PromoStatus;
  branch_ids?: string[];  // null = all branches
}

export interface UpdateDealInput {
  id: string;
  merchant_id: string;
  title?: string;
  description?: string;
  promo_type?: PromoType;
  original_price?: number;
  promo_price?: number;
  discount_pct?: number;
  category?: string;
  valid_from?: string;
  valid_until?: string;
  promo_rules?: PromoRules;
  image_url?: string;
  tags?: string[];
  quota_total?: number;
  status?: PromoStatus;
  branch_ids?: string[];
}

// ---------- API Response wrappers ----------

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface DealWithBranches extends Deal {
  branches: BranchCoordinate[];
  branch_count: number;
}

export interface PaginatedDeals {
  deals: Deal[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
