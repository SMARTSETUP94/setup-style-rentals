ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS price_event numeric NULL,
  ADD COLUMN IF NOT EXISTS event_days_included integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS price_extra_day numeric NULL,
  ADD COLUMN IF NOT EXISTS custom_label_fr text NULL,
  ADD COLUMN IF NOT EXISTS custom_label_en text NULL,
  ADD COLUMN IF NOT EXISTS custom_price numeric NULL;

CREATE TABLE public.image_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  url text NOT NULL,
  alt_fr text,
  alt_en text,
  is_main boolean DEFAULT true,
  status text DEFAULT 'pending',
  error text,
  created_at timestamptz DEFAULT now()
);
REVOKE ALL ON public.image_imports FROM anon, authenticated;
GRANT ALL ON public.image_imports TO service_role;
ALTER TABLE public.image_imports ENABLE ROW LEVEL SECURITY;