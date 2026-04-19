-- Bucket public pour logos clients
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-uploads', 'quote-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique
CREATE POLICY "Quote uploads are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'quote-uploads');

-- Upload anonyme limité au préfixe client-logos/
CREATE POLICY "Anyone can upload client logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'quote-uploads'
  AND (storage.foldername(name))[1] = 'client-logos'
);

-- Admins peuvent supprimer
CREATE POLICY "Admins can delete quote uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'quote-uploads'
  AND has_role(auth.uid(), 'admin'::app_role)
);