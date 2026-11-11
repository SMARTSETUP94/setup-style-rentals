
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

## S3
- Créés : src/routes/admin.sur-mesure.tsx, src/routes/api.track.ts, src/lib/custom-pricing.ts, src/lib/track.ts, drizzle/migrations/0003_s3_custom_pricing_site_events.sql.
- Modifiés : sur-mesure.$piece.tsx (bandeau prix au-dessus de l'iframe, ?c → restore-config, « Copier le lien »), sur-mesure.index.tsx, sur-mesure.ts (encodage base64url ≤ 6000), devis.tsx, contact.tsx, produit.$slug.tsx (suivi, dimensions « a voir » masquées), api.quotes.submit.ts (resume_url dans les lignes et les mails), admin.tsx, admin.index.tsx, admin.devis.tsx, ProductImage.tsx, index.tsx.
- SQL : custom_pricing (RLS, politique admin unique, anon révoqué) pré-remplie 24 pièces enabled=false ; fonction SECURITY DEFINER get_custom_public_pricing() (lignes activées seulement) ; site_events (RLS, lecture admin, index created_at).
- Écarts : limite /api/track en mémoire par instance (60/10 min, IP hachée non stockée), pas via submit_attempts pour ne pas consommer le quota des devis ; le lien ?c encode {piece, configuration} ; au-delà de 6000 caractères, pas de bouton de copie.
- Configurateur public/configurators/sur-mesure.html : 642 octets, md5 ba97debc5a512fe5fa90b350bdf56ce8 → toujours le placeholder, le définitif (~130 Ko) n'est pas déposé.
- Hors ticket, relevé : le tableau de bord admin additionne encore les frais à total_ttc (double comptage) dans ses KPI.
- Testé : compilation OK ; /api/track 204 (valide et invalide) avec insertion ; RPC publique renvoie [] ; lecture anonyme de custom_pricing refusée.
- Non vérifié : restore-config et copie du lien avec le vrai configurateur, lien dans le mail réel, affichage admin à l'écran, sendBeacon en production.

## S3-bis
- admin.index.tsx : KPI sur total_ttc seul ; nouvelle carte « Panier moyen TTC » (demandes avec total_ttc > 0 uniquement) + nombre de demandes avec sur-mesure (has_custom) du mois.
- Recherche globale : même double comptage trouvé et corrigé dans admin.clients.tsx (CA par client et historique) ; seul reste feesOf() d'admin.devis.tsx, qui soustrait les frais de total_ht (correct).
- sur-mesure.$piece.tsx : sans `sur-mesure-ready` sous 6 s, message discret sous l'iframe avec lien vers /contact (FR/EN).
- Compilation OK ; affichage admin et message configurateur non vérifiés à l'écran. Aucune migration, pas de publication.

## S4
- `public/configurators/sur-mesure.html` reconstitué par script (tmp_transfer → base64 → brotli), md5 vérifiés avant écriture : dd5be69883e6d3eb511365310ee45fcb, 112 102 octets. Ajouté à `.prettierignore`.
- Navigateur (local, /sur-mesure/comptoir) : iframe chargée, `sur-mesure-ready` reçu, aucun message « n'a pas répondu », pas de CSP bloquante (aucune CSP définie).
- « Ajouter à ma demande » → `sur-mesure-save` → ligne custom dans le panier ; /devis l'affiche avec vignette JPEG et récap.
- Message 6 s : logique déjà correcte, non modifiée.
- Non vérifié : site publié, envoi réel du devis, une 404 isolée en console (ressource non identifiée), mobile.

## S5
- Test unique (dev, 1280 px) : Samias ×1 du 11 au 12/12/2026 (2 j) + stèle sur mesure (H 1500 mm, corps placage chêne). POST /api/quotes/submit → 200, n° W-00001, email_admin_status=sent, email_client_status=sent (à smart@setup.paris).
- quote_requests id 166fd130… : has_custom=true, discount_total=0, subtotal_ht 60, livraison 110, installation 50, reprise 50, total_ht 270, vat 54, total_ttc 324 ; items : location avec productId, ligne custom (kind=custom, ref STL-400×1500×400-CHENE). Livraison souhaitée 15/01/2027, après l'événement = à discuter, échantillons = oui. Statut pending, NON supprimée.
- custom_configs : 1 ligne (stele, ref, configuration, recap) ; vignette custom-previews/166fd130…/22baef45….jpg (8 371 o).
- Confirmation : n° W-00001, récap des deux lignes, totaux, lien « Reprendre / partager » (pointe vers catalogue.setup.paris).
- A.4 : le lien de reprise restaure H 1500 et corps chêne à l'identique.
- A.5 : 30 € × 2 j × 1 = 60 (pas de remise sous 2 unités) ; livraison 80 + 30 × 1 ligne de location = 110 ; +50 +50 → HT 270 ; TVA 20 % 54 ; TTC 324. Identique en base. La pièce sur mesure n'entre pas dans les frais.
- B (390 px) : /, /sur-mesure, /sur-mesure/stele, /devis (2 lignes), /contact sans débordement horizontal ; « Cotes », « Recadrer » et « Ajouter à ma demande » du configurateur sont libres (rien du site par-dessus).
- Défauts corrigés : libellé « Livraison & Reprise » sur les frais de livraison seuls (doublon visuel avec « Reprise ») → « Livraison » / « Delivery » ; 404 de S4 = /favicon.ico absent (demandé par l'iframe) → favicon ajouté et déclaré.
- Non vérifié : réception réelle des mails dans la boîte, admin à l'écran.
