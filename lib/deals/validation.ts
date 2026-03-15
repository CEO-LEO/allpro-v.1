import { z } from 'zod';

// ============================================================
// Zod schemas for Merchant Deal Management
// Server-side validation before any DB operation
// ============================================================

// ---------- Enum validators ----------

export const promoTypeSchema = z.enum([
  'discount', 'bogo', 'bundle', 'loyalty_stamp', 'flash_sale',
  'coupon_code', 'free_gift', 'cashback', 'free_shipping',
  'tier_pricing', 'custom',
]);

export const promoStatusSchema = z.enum([
  'draft', 'scheduled', 'active', 'paused', 'expired', 'archived',
]);

const categorySchema = z.string().min(1, 'Category is required').max(50);

// ---------- PromoRules (JSONB metadata) ----------

export const promoRulesSchema = z.object({
  // Time-based
  day_of_week: z.array(z.enum([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  ])).optional(),
  time_range: z.object({
    from: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:MM'),
    to:   z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:MM'),
  }).optional(),

  // Loyalty
  stamp_required: z.number().int().min(1).max(100).optional(),
  stamp_reward:   z.string().max(200).optional(),

  // Purchase conditions
  min_purchase: z.number().min(0).optional(),
  max_discount: z.number().min(0).optional(),

  // Targeting
  new_customer_only: z.boolean().optional(),
  member_only:       z.boolean().optional(),
  tier_required:     z.array(z.string()).optional(),

  // Bundle / BOGO
  buy_quantity: z.number().int().min(1).optional(),
  get_quantity: z.number().int().min(1).optional(),
  bundle_items: z.array(z.string()).optional(),

  // Coupon code
  coupon_code: z.string().max(50).optional(),
  single_use:  z.boolean().optional(),

  // Custom SME conditions (Thai-friendly)
  custom_conditions: z.array(z.string().max(500)).max(20).optional(),
}).passthrough(); // Allow extra keys for SME flexibility

// ---------- CreateDeal ----------

export const createDealSchema = z.object({
  merchant_id:    z.string().uuid('Invalid merchant ID'),
  title:          z.string().min(3, 'Title must be at least 3 characters').max(200),
  description:    z.string().max(2000).optional(),
  promo_type:     promoTypeSchema,
  original_price: z.number().min(0).optional(),
  promo_price:    z.number().min(0).optional(),
  discount_pct:   z.number().min(0).max(100).optional(),
  category:       categorySchema,
  valid_from:     z.string().datetime().optional(),
  valid_until:    z.string().datetime().optional(),
  promo_rules:    promoRulesSchema.optional().default({}),
  metadata:       z.record(z.unknown()).optional().default({}),
  image_url:      z.string().url().optional().or(z.literal('')),
  tags:           z.array(z.string().max(50)).max(20).optional().default([]),
  quota_total:    z.number().int().min(1).optional(),
  status:         promoStatusSchema.optional().default('draft'),
  branch_ids:     z.array(z.string().uuid()).optional(),
}).refine(
  (data) => {
    // If both prices are provided, promo must be less than original
    if (data.original_price != null && data.promo_price != null) {
      return data.promo_price < data.original_price;
    }
    return true;
  },
  { message: 'Promo price must be lower than original price', path: ['promo_price'] }
).refine(
  (data) => {
    // If both dates provided, valid_until must be after valid_from
    if (data.valid_from && data.valid_until) {
      return new Date(data.valid_until) > new Date(data.valid_from);
    }
    return true;
  },
  { message: 'End date must be after start date', path: ['valid_until'] }
);

// ---------- UpdateDeal ----------

export const updateDealSchema = z.object({
  id:             z.string().uuid('Invalid deal ID'),
  merchant_id:    z.string().uuid('Invalid merchant ID'),
  title:          z.string().min(3).max(200).optional(),
  description:    z.string().max(2000).optional(),
  promo_type:     promoTypeSchema.optional(),
  original_price: z.number().min(0).optional(),
  promo_price:    z.number().min(0).optional(),
  discount_pct:   z.number().min(0).max(100).optional(),
  category:       categorySchema.optional(),
  valid_from:     z.string().datetime().optional(),
  valid_until:    z.string().datetime().optional(),
  promo_rules:    promoRulesSchema.optional(),
  image_url:      z.string().url().optional().or(z.literal('')),
  tags:           z.array(z.string().max(50)).max(20).optional(),
  quota_total:    z.number().int().min(1).optional(),
  status:         promoStatusSchema.optional(),
  branch_ids:     z.array(z.string().uuid()).optional(),
});

// ---------- Query filters ----------

export const dealQuerySchema = z.object({
  merchant_id: z.string().uuid(),
  status:      promoStatusSchema.optional(),
  category:    z.string().optional(),
  page:        z.number().int().min(1).default(1),
  pageSize:    z.number().int().min(1).max(100).default(20),
  search:      z.string().max(200).optional(),
});

// ---------- Type exports ----------

export type CreateDealPayload = z.infer<typeof createDealSchema>;
export type UpdateDealPayload = z.infer<typeof updateDealSchema>;
export type DealQueryPayload  = z.infer<typeof dealQuerySchema>;
