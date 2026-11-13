# S18 — Mention « objet tel qu'en stock » (texte uniquement)

Validé par Gabin. Aucune migration, aucun changement de prix, rien de publié.

## Changements

1. **Fiche produit** (`src/routes/produit.$slug.tsx`) : sous « + Y € HT par jour supplémentaire », dans le bloc prix événement (`data-testid="event-price"`), ligne discrète (11 px, `text-muted-foreground`) : « Objet tel qu'en stock. Finitions et personnalisation en supplément ; livraison, installation et reprise en sus. »
2. **Ma demande** (`src/routes/devis.tsx`) : même mention en une ligne, sous la liste des lignes de location (`data-testid="stock-note"`), affichée dès qu'il y a au moins une ligne de location.
3. **Mail client** (`src/routes/api.quotes.submit.ts`) : même mention en une ligne dans le bloc Location, entre le tableau des lignes et les totaux. Le mail interne (`adminEmail`) utilise le même bloc mais sans la mention (`showStockNote` à `false` par défaut, passé à `true` uniquement depuis `clientEmail`).
4. **Traduction** (`src/lib/i18n.tsx`) : clé `product.stockNote`, FR + EN (« Item as in stock. Finishes and customisation extra; delivery, setup and pickup extra. »).
5. **Catalogue** : rien changé (point 3 du ticket).

## Contrôles

- `bun test` : 43 pass / 0 fail (7 fichiers).
- Build : OK (`/tmp/observability/build-errors.log`).
- Navigateur 1280 px et 390 px, envoi de demande bloqué (`api/quotes/submit` interrompu, aucune demande réelle) :
  - stele FR et EN : mention présente dans le bloc prix → « 50 € HT par événement (jusqu'à 3 jours) | + 10 € HT par jour supplémentaire | Objet tel qu'en stock… ».
  - cornhole FR et EN : mention présente dans le bloc prix.
  - Ma demande (stele + cornhole ajoutés) : mention présente, 1 seule fois, à 1280 et à 390 px.
  - Aucune erreur console.
- Captures : `/tmp/browser/s18/screenshots/` (stele/cornhole FR-EN, devis 1280 et 390).

## Non vérifié

- Rendu de la mention dans le mail réellement envoyé (aucun mail envoyé).
- Ligne « Durée » qui chevauche son bouton + à 390 px : défaut antérieur, hors périmètre.
