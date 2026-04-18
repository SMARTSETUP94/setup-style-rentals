-- Create public bucket for HTML configurator files
INSERT INTO storage.buckets (id, name, public)
VALUES ('configurators', 'configurators', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Configurators are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'configurators');

-- Admins can upload
CREATE POLICY "Admins can upload configurators"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'configurators' AND public.has_role(auth.uid(), 'admin'));

-- Admins can update
CREATE POLICY "Admins can update configurators"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'configurators' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete
CREATE POLICY "Admins can delete configurators"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'configurators' AND public.has_role(auth.uid(), 'admin'));