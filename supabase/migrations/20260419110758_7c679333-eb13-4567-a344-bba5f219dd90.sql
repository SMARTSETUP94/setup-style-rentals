
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS quantity_discounts jsonb NOT NULL DEFAULT '[{"min_qty":2,"rate":0.10},{"min_qty":6,"rate":0.15},{"min_qty":10,"rate":0.20}]'::jsonb,
  ADD COLUMN IF NOT EXISTS duration_discounts jsonb NOT NULL DEFAULT '[]'::jsonb;
