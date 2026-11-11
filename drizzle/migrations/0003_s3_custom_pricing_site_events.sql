CREATE TABLE public.custom_pricing (
  piece text PRIMARY KEY,
  from_price_ht numeric NOT NULL DEFAULT 0,
  lead_time_days int,
  enabled boolean NOT NULL DEFAULT false,
  validated_by text,
  validated_at timestamptz,
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_pricing TO authenticated;
GRANT ALL ON public.custom_pricing TO service_role;
REVOKE ALL ON public.custom_pricing FROM anon;
ALTER TABLE public.custom_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage custom_pricing" ON public.custom_pricing FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.custom_pricing (piece, from_price_ht) VALUES
('comptoir',1540),('comptoirL',2530),('bar',2790),('pupitre',1060),('table',1410),('mangeDebout',1120),
('stele',900),('podium',1450),('socleRond',1020),('cubes',1210),('gradin',1390),('etagere',2480),
('urne',1000),('portant',1090),('totem',1700),('mur',2070),('cacheRegie',1500),('arche',2310),
('lettres',1830),('cadre',690),('claustra',750),('banc',1080),('pouf',840),('jardiniere',840)
ON CONFLICT (piece) DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_custom_public_pricing()
RETURNS TABLE(piece text, from_price_ht numeric, lead_time_days int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT piece, from_price_ht, lead_time_days FROM public.custom_pricing WHERE enabled = true
$$;
REVOKE ALL ON FUNCTION public.get_custom_public_pricing() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_custom_public_pricing() TO anon, authenticated, service_role;

CREATE TABLE public.site_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  path text,
  ref text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX site_events_created_at_idx ON public.site_events (created_at);
GRANT SELECT ON public.site_events TO authenticated;
GRANT ALL ON public.site_events TO service_role;
REVOKE ALL ON public.site_events FROM anon;
ALTER TABLE public.site_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read site_events" ON public.site_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));