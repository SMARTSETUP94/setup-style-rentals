
## S1-fin
- Créés : src/routes/contact.tsx, src/routes/api.contact.ts, drizzle/migrations/0001_s1_fin_hardening.sql.
- Modifiés : admin.devis.tsx (n° W-, état mails + pastille, source, recherche, filtre statut), admin-i18n.tsx, produit.$slug.tsx (liste blanche origin/source, postMessage ciblé), Navbar, Footer, i18n.tsx, devis.tsx (lien contact panier vide), sitemap[.]xml.ts (+/contact, −/devis, lastmod retiré des pages statiques).
- SQL : roadmap_items lecture publique → admins (has_role) ; CHECK quote_requests.status NOT VALID puis VALIDATE ; upsert_client_from_quote ne remplit que les champs vides, déclencheur AFTER INSERT remplacé par AFTER UPDATE OF status (hors pending/rejected), SECURITY DEFINER + search_path.
- Buckets : quote-uploads 10 Mo, product-images et category-images 15 Mo (via outil stockage).
- Non fait : types MIME autorisés des buckets — l'outil ne le permet pas et le SQL sur storage.buckets est refusé.
- Non vérifié : envoi réel du mail contact (Resend, expéditeur test), 429 contact, déclencheur client sur changement de statut (aucune demande en base), configurateurs 3D réels avec la liste blanche, affichage admin à l'écran.

## S2
- Créés : src/lib/sur-mesure.ts (24 pièces FR/EN, schéma zod des messages), src/routes/sur-mesure.index.tsx, src/routes/sur-mesure.$piece.tsx, public/configurators/sur-mesure.html (provisoire), drizzle/migrations/0002_s2_sur_mesure.sql.
- Modifiés : cart.tsx (lignes custom, jamais fusionnées, repli localStorage sans vignettes), devis.tsx (blocs Location / Sur mesure, champs livraison souhaitée / après l'événement / échantillons, PDF, confirmation), api.quotes.submit.ts (lignes custom, vignettes JPEG ≤ 120 Ko, custom_configs, mails, objet « [Sur mesure] »), admin.devis.tsx + admin-i18n (badge/filtre type, détail custom, URL signée 10 min, copie JSON), Navbar, Footer, index.tsx, produit.$slug.tsx, sitemap, i18n.tsx, contact.tsx (menu en double retiré).
- SQL : table custom_configs (RLS, politique admin unique, revoke anon, grant service_role) ; quote_requests + has_custom, custom_delivery_date, custom_after_event, wants_samples ; politique de lecture admin sur storage.objects pour custom-previews. Bucket privé custom-previews (200 Ko) créé avec l'outil stockage.
- get_available_stock(_bulk) : productId null → la comparaison est nulle et la ligne est ignorée ; aucune correction nécessaire.
- Écarts : le lien « Modifier » remplace la ligne à chaque sauvegarde ; le reste du site en mode sur mesure envoie restore-config uniquement si la ligne est encore dans le panier ; tel du configurateur = numéro du pied de page.
- Testé : 400 pour pièce inconnue, quantité 99 et vignette non JPEG ; /sur-mesure 200, /sur-mesure/nope 404, sitemap.
- Non vérifié : vrai configurateur (messages ready/config/save, bandeau, restore), soumission réussie avec ligne custom (téléversement, custom_configs, mails), affichage admin du détail custom, PDF.
