# Journal S17 — Prix par événement, personnalisation, import d'images

- **Base** : products + price_event, event_days_included (déf. 3), price_extra_day, custom_label_fr/en, custom_price. Table image_imports (RLS, service role seul). Migration additive.
- **Calcul** (`src/lib/pricing.ts`) : si price_event renseigné → qté × (price_event + max(0, jours − inclus) × price_extra_day) + (perso ? qté × custom_price : 0), aucune remise ; les options payantes éventuelles restent ajoutées par unité. Sinon ancien calcul inchangé. /api/quotes/submit recalcule avec la même fonction (nouveau champ `custom_chosen`) et stocke le détail sur la ligne.
- **Affichage** : cartes « X € HT / événement » ; fiche « … HT par événement (jusqu'à N jours) » + « … HT par jour supplémentaire », case « Personnaliser » (masquée si prix vide/0) ; Ma demande + PDF, mails client/interne, admin détail + colonne CSV `detail_lignes`. FR/EN.
- **Admin produits** : 6 champs éditables. Aucune galerie en base → image_url conservée.
- **Import** : `scripts/import-images.mjs` (https, image/*, ≤ 15 Mo, bucket product-images, `<slug>-<horodatage>.<ext>`). Non exécuté (attend « lance l'import »). Images non principales : stockées et signalées dans `error`, faute de galerie.
- **Fiche produit** : un admin connecté peut prévisualiser un produit inactif ; les visiteurs ne le voient toujours pas.
- **Tests** : `bun test` 43/43 (8 nouveaux : 1/3/5 j, qté 10, perso, prix 0, ancien modèle, schéma).
- **Navigateur** 1440 et 390 px, produit test inactif zz-test-evenement (300 €/3 j, +60 €/j, perso 40 €) : 1 j 300 €, 3 j 300 €, 5 j 420 €, 5 j + perso 460 € ; Ma demande détaillée ; pouf inchangé (25 €, Version standard). Envoi intercepté : `custom_chosen:true` transmis. Aucune demande réelle. Produit test supprimé. Captures : `docs/captures-S17/`.
- **Remarque** : à 390 px, le compteur « Durée » chevauche le bouton + (défaut existant, non corrigé).
