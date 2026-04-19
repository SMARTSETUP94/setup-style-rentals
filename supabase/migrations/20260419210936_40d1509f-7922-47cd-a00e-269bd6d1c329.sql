-- Remplace la policy SELECT permissive par une qui n'autorise pas le listing
DROP POLICY IF EXISTS "Quote uploads are publicly viewable" ON storage.objects;

-- Lecture publique uniquement quand on a déjà le chemin exact (pas de listing)
-- L'objet doit appartenir au préfixe client-logos/
CREATE POLICY "Public can read individual client logos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'quote-uploads'
  AND (storage.foldername(name))[1] = 'client-logos'
);