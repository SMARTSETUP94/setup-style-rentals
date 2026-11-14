# S23 — Catégories et nouvel accueil

Contrôles effectués le 14 novembre 2026 sur `http://localhost:8080`, sans publication. Aucune écriture en base : demandes, prix, descriptions et catégories conservés tels que renseignés par Gabin.

## Réalisation
- Accueil FR/EN réorganisé dans l’ordre demandé : photo actuelle et nouveau H1, trois promesses, cinq catégories, six produits, louer/fabriquer, quatre étapes, logos clients inchangés, FAQ puis Contact / Ma demande.
- En-tête CatLoc / by setup.paris inchangé. Ancien surtitre supprimé. Vidéo retirée du rendu ; aucune suppression du fichier vidéo distant.
- Images des catégories issues de `image_url`, nombres calculés sur les produits actifs ; noms, prix et FAQ réutilisés depuis le catalogue public chargé au rendu serveur.
- FAQ prix/livraison/réservation reprise sans réécrire les réponses ; JSON-LD FAQPage correspond aux trois réponses affichées. Organization/LocalBusiness, canonical et hreflang conservés, title/meta adaptés au nouveau H1.
- Formulaire et filtre des produits admin : uniquement les cinq catégories actives ; liste produit : noms des catégories courantes. L’écran de gestion des catégories conserve les huit enregistrements, dont les trois inactifs, afin de ne pas masquer leur statut ni modifier les données. Ses compteurs historiques comptent tous les produits, contrairement aux nombres publics qui comptent les actifs.
- Anciennes références de présentation supprimées : seuls les trois alias nécessaires aux redirections restent dans le helper dédié. Les textes juridiques contenant les mots « structures » ou « décoration » ne sont pas des références de slugs et restent inchangés.

## Contrôles curl, sans JavaScript

| URL ancienne | Statut | Destination |
|---|---|---|
| `/categorie/structures` | 301 | `/categorie/scenes-podiums` |
| `/categorie/signaletique` | 301 | `/categorie/decor-signaletique` |
| `/categorie/decoration` | 301 | `/categorie/decor-signaletique` |
| `/en/categorie/structures` | 301 | `/en/categorie/scenes-podiums` |
| `/en/categorie/signaletique` | 301 | `/en/categorie/decor-signaletique` |
| `/en/categorie/decoration` | 301 | `/en/categorie/decor-signaletique` |
| `/categorie/inactive-unknown` et variante EN | 404 | aucune |

Les adresses `/` et `/en` retournent le H1 demandé, cinq cartes catégories, six prix événement et trois questions/réponses dans le HTML initial. `/en/` se normalise vers `/en`, adresse canonique anglaise.

Catégories affichées : Jeux & animations **12**, Scènes & podiums **4**, Décor & signalétique **9**, Accueil & présentation **9**, Mobilier & assises **6**.

Sélection et prix lus, sans modification : stèle **50 €**, panier-basketball **300 €**, photobooth-balancoire **750 €**, bar-arrondi **560 €**, samias **50 €**, pouf **20 € HT / événement**.

Sitemap vérifié : uniquement les cinq catégories actives, chacune en FR et EN, soit dix URL catégories ; aucun des trois anciens slugs. Le générateur existant filtre déjà `is_active=true` et n’a pas été remplacé. Dates `lastmod` issues de `updated_at` propres à chaque produit/catégorie, sans date courante de génération ; aucune date ajoutée pour les pages statiques.

## Tests et navigateur
- `bun test` : **93 réussis, 0 échec, 248 assertions**, 14 fichiers.
- Tests S23 : mapping exact des trois alias, réponses FAQ verbatim FR/EN, six redirections HTTP, deux 404, sélection SSR et cinq paires catégories dans le sitemap.
- Accueil contrôlé à **1440 et 390 px**, FR et EN : aucune erreur console ou JavaScript, aucune image manquante, aucun débordement horizontal. FAQ ouverte et captures relues.
- Catalogue : les cinq filtres FR rendent respectivement 12/4/9/9/6 produits ; liens et fil d’Ariane de la nouvelle catégorie scènes/podiums vérifiés en FR/EN.
- Administration vérifiée dans une session autorisée : filtre produit et formulaire proposent les cinq catégories ; écran catégories affiche cinq actives et trois inactives. Formulaire ouvert puis fermé sans enregistrement. Requêtes non nécessaires à la lecture bloquées durant les contrôles.
- Compilation automatique : dernier état `build OK`.

## Captures

Les captures sont conservées dans `docs/captures-S23/`.

| Affichage | Accueil | Catégories | Sélection | FAQ ouverte |
|---|---|---|---|---|
| FR 1440 | [accueil](captures-S23/1440-fr-home.png) | [catégories](captures-S23/1440-fr-home-categories.png) | [sélection](captures-S23/1440-fr-home-selection.png) | [FAQ](captures-S23/1440-fr-faq.png) |
| EN 1440 | [accueil](captures-S23/1440-en-home.png) | [catégories](captures-S23/1440-en-home-categories.png) | [sélection](captures-S23/1440-en-home-selection.png) | [FAQ](captures-S23/1440-en-faq.png) |
| FR 390 | [accueil](captures-S23/390-fr-home.png) | [catégories](captures-S23/390-fr-home-categories.png) | [sélection](captures-S23/390-fr-home-selection.png) | [FAQ](captures-S23/390-fr-faq.png) |
| EN 390 | [accueil](captures-S23/390-en-home.png) | [catégories](captures-S23/390-en-home-categories.png) | [sélection](captures-S23/390-en-home-selection.png) | [FAQ](captures-S23/390-en-faq.png) |

[Liste catégories admin](captures-S23/admin-categories.png) · [Formulaire produit](captures-S23/admin-product-category.png).

Les changements de pages et redirections atteindront le site publié uniquement à une prochaine publication ; aucune publication effectuée pour S23.