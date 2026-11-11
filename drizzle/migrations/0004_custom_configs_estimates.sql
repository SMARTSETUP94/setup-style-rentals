ALTER TABLE public.custom_configs
  ADD COLUMN IF NOT EXISTS estimate_unit_ht numeric,
  ADD COLUMN IF NOT EXISTS estimate_total_ht numeric,
  ADD COLUMN IF NOT EXISTS estimate_breakdown jsonb,
  ADD COLUMN IF NOT EXISTS estimate_options jsonb,
  ADD COLUMN IF NOT EXISTS estimate_at timestamptz,
  ADD COLUMN IF NOT EXISTS estimate_by text,
  ADD COLUMN IF NOT EXISTS estimate_note text;