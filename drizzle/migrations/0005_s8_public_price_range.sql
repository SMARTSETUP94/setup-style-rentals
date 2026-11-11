ALTER TABLE public.custom_pricing
  ADD COLUMN IF NOT EXISTS range_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS range_low_pct numeric NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS range_high_pct numeric NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS floor_ht numeric NOT NULL DEFAULT 0;

DROP FUNCTION IF EXISTS public.get_custom_public_pricing();
CREATE FUNCTION public.get_custom_public_pricing()
RETURNS TABLE(piece text, from_price_ht numeric, lead_time_days int, enabled boolean, range_enabled boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT piece,
         CASE WHEN enabled THEN from_price_ht ELSE NULL END,
         CASE WHEN enabled THEN lead_time_days ELSE NULL END,
         enabled, range_enabled
  FROM public.custom_pricing WHERE enabled = true OR range_enabled = true
$$;
REVOKE ALL ON FUNCTION public.get_custom_public_pricing() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_custom_public_pricing() TO anon, authenticated, service_role;

CREATE TABLE public.estimate_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX estimate_attempts_ip_created_idx ON public.estimate_attempts (ip_hash, created_at);
GRANT ALL ON public.estimate_attempts TO service_role;
REVOKE ALL ON public.estimate_attempts FROM anon, authenticated;
ALTER TABLE public.estimate_attempts ENABLE ROW LEVEL SECURITY;