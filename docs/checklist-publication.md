# Checklist de publication
1. Variables d'environnement (Paramètres du projet → Secrets) :
   - RESEND_FROM (facultative) — expéditeur. Absente : « Setup Paris <devis@setup.paris> » (domaine vérifié dans Resend).
   - QUOTE_NOTIFY_TO (facultative, liste séparée par des virgules) — destinataires internes. Absente : devis@setup.paris et smart@setup.paris.
   - TURNSTILE_SECRET_KEY + VITE_TURNSTILE_SITE_KEY (facultatives, toujours ensemble) — anti-robot. Absentes : seuls honeypot + limite de débit protègent les formulaires.
2. Migrations déjà appliquées (base commune preview/production) : 0000_quote_submit_server, 0001_s1_fin_hardening, 0002_s2_sur_mesure, 0003_s3_custom_pricing_site_events, 0004_custom_configs_estimates, 0005_s8_public_price_range.
3. Juste après publication (https://catalogue.setup.paris) :
   - Pages : /, /catalogue, une fiche produit, /sur-mesure, /sur-mesure/comptoir (3D chargée), /devis, /contact, /sitemap.xml, une URL inconnue (404).
   - Envoyer une demande « TEST — à supprimer » (location + sur mesure) : écran de confirmation avec n° W-xxxxx.
   - Mails : client reçu sans estimation interne ; interne reçu avec « Estimation interne automatique ».
   - Admin : la demande apparaît, panneau Chiffrage interne calculé, exports CSV ; /admin/sur-mesure tout désactivé.
4. APRÈS vérification du site publié, fermer l'insertion directe (les demandes passent par /api/quotes/submit) :
```sql
DROP POLICY IF EXISTS "Public can submit valid quote requests" ON public.quote_requests;
REVOKE INSERT ON public.quote_requests FROM anon;
```
5. Retour arrière de ce SQL :
```sql
GRANT INSERT ON public.quote_requests TO anon;
CREATE POLICY "Public can submit valid quote requests" ON public.quote_requests FOR INSERT TO public WITH CHECK (
  char_length(customer_name) BETWEEN 1 AND 200 AND char_length(email) BETWEEN 3 AND 320
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND jsonb_array_length(items) > 0 AND jsonb_array_length(items) <= 100
  AND status = 'pending' AND (company IS NULL OR char_length(company) <= 200) AND (phone IS NULL OR char_length(phone) <= 50)
  AND (message IS NULL OR char_length(message) <= 5000) AND (event_location IS NULL OR char_length(event_location) <= 500));
```
6. Retour arrière du code : commit de référence avant travaux c321ea72 (restaurer via l'historique des versions).
