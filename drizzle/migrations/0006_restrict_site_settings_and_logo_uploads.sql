DROP POLICY IF EXISTS "Site settings viewable by everyone" ON public.site_settings;
CREATE POLICY "Public logistics settings viewable by everyone" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (key LIKE 'logistics\_%');
DROP POLICY IF EXISTS "Anyone can upload client logos" ON storage.objects;