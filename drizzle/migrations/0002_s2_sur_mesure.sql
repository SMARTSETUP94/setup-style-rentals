CREATE TABLE IF NOT EXISTS public.custom_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  line_id text,
  ref text NOT NULL,
  piece text NOT NULL,
  config jsonb NOT NULL,
  quantity int NOT NULL,
  weight_kg numeric,
  alerts jsonb NOT NULL DEFAULT '[]'::jsonb,
  recap text,
  preview_path text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS custom_configs_quote_idx ON public.custom_configs (quote_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_configs TO authenticated;
GRANT ALL ON public.custom_configs TO service_role;
REVOKE ALL ON public.custom_configs FROM anon;
ALTER TABLE public.custom_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage custom configs" ON public.custom_configs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS has_custom boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS custom_delivery_date date,
  ADD COLUMN IF NOT EXISTS custom_after_event text,
  ADD COLUMN IF NOT EXISTS wants_samples boolean NOT NULL DEFAULT false;

CREATE POLICY "Admins can read custom previews" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'custom-previews' AND public.has_role(auth.uid(), 'admin'::public.app_role));