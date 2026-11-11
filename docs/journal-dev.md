
## S1-fin
- Créés : src/routes/contact.tsx, src/routes/api.contact.ts, drizzle/migrations/0001_s1_fin_hardening.sql.
- Modifiés : admin.devis.tsx (n° W-, état mails + pastille, source, recherche, filtre statut), admin-i18n.tsx, produit.$slug.tsx (liste blanche origin/source, postMessage ciblé), Navbar, Footer, i18n.tsx, devis.tsx (lien contact panier vide), sitemap[.]xml.ts (+/contact, −/devis, lastmod retiré des pages statiques).
- SQL : roadmap_items lecture publique → admins (has_role) ; CHECK quote_requests.status NOT VALID puis VALIDATE ; upsert_client_from_quote ne remplit que les champs vides, déclencheur AFTER INSERT remplacé par AFTER UPDATE OF status (hors pending/rejected), SECURITY DEFINER + search_path.
- Buckets : quote-uploads 10 Mo, product-images et category-images 15 Mo (via outil stockage).
- Non fait : types MIME autorisés des buckets — l'outil ne le permet pas et le SQL sur storage.buckets est refusé.
- Non vérifié : envoi réel du mail contact (Resend, expéditeur test), 429 contact, déclencheur client sur changement de statut (aucune demande en base), configurateurs 3D réels avec la liste blanche, affichage admin à l'écran.
