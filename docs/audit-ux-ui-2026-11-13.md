# Audit UX/UI — catalogue.setup.paris — 13/11/2026

Périmètre : site publié https://catalogue.setup.paris, 1440 px et 390 px, partie publique et admin.
Méthode : navigateur piloté (Playwright, Chromium). Envois de devis et de contact interceptés : rien n'a été envoyé. Admin consulté avec la session de test (smart@setup.paris), écritures en base bloquées par le script. Aucune donnée modifiée.
Captures : `/tmp/browser/audit/shots/` (temporaire, dans le bac à sable). Elles sont nommées `<page>_<largeur>.png`.

## Synthèse

| Gravité | Nombre |
|---|---|
| Bloquant | 2 |
| Important | 9 |
| Mineur | 12 |

Points positifs : pas d'erreur console ni de requête en échec sur les pages publiques (sauf le 404 voulu), pas de défilement horizontal à 390 px, un seul h1 par page, toutes les images ont un attribut alt, et un lien « Aller au contenu » visible au clavier. Le sous-titrage de la vidéo s'affiche, et la version EN est servie en anglais (title et lang="en").

## Constats

| # | Page | Gravité | Description | Preuve | Recommandation |
|---|---|---|---|---|---|
| 1 | Admin › Clients | **Bloquant** | La page affiche « Aucun client. » alors qu'il existe 6 demandes (3 e-mails distincts). En base, la table `clients` contient 0 ligne : ni le backfill ni l'ajout à la soumission ne fonctionnent, ou ils ne sont pas déployés. | `adm_admin_clients_1440.png` ; requête lecture : clients=0, quote_requests=6 | Vérifier l'ajout dans `/api/quotes/submit` et relancer le backfill. |
| 2 | Catalogue (HTML initial) | **Bloquant (SEO / IA)** | Le HTML servi avant JavaScript ne contient aucun lien `/produit/…` (0). Même chose pour les fiches produit : pas de prix dans le HTML initial, seulement title, meta et 1 JSON-LD. Google et les moteurs IA ne voient pas le catalogue sans exécuter JS. | `curl /catalogue` → 0 lien produit | Charger les produits dans le loader de route (rendu serveur) pour /catalogue, /categorie/$slug et /produit/$slug. |
| 3 | En-tête (toutes pages) | Important | Marque incohérente : l'en-tête affiche « CatLoc BY SETUP.PARIS », le pied de page et l'admin « SETUP PARIS », la vidéo « SET UP Paris » (logo S orange), les titres « Setup Paris ». | `home_1440.png`, `home_video_1440.png` | Choisir un seul nom et logo. Retirer « CatLoc » si c'est un nom interne. |
| 4 | Fiches produit avec 3D (15 sur 20) | Important | « Ajouter » est grisé avec « Configurez d'abord votre produit en 3D » : on ne peut pas louer sans ouvrir le configurateur, même en gardant les options par défaut. Sur mobile, c'est un frein fort. | Pouf : bouton `[disabled]` | Permettre l'ajout avec la configuration par défaut, la 3D restant facultative ou recommandée. |
| 5 | Fiche produit (podium) | Important | L'option requise « Finition » n'est pas présélectionnée, alors qu'une option « Brut — Inclus » existe. Au clic sur Ajouter, un message « Veuillez sélectionner les options requises » apparaît en haut, loin du bouton. | `flow_added.png` | Présélectionner l'option incluse. Placer l'erreur à côté du champ concerné. |
| 6 | Fiche → Ma demande | Important | Avec seulement une date de début choisie (3/12/2026), l'ajout est accepté mais la ligne arrive dans /devis avec « Choisir les dates de location » : la date est perdue. | `flow_added.png` → `flow_devis.png` | Reprendre la date de début avec une fin égale au début (1 jour), ou exiger la fin avant l'ajout. |
| 7 | Ma demande — récapitulatif | Important | « Livraison 110 € » porte la mention « Livraison, installation et reprise : forfait… », puis « Installation 50 € » et « Reprise 50 € » sont ajoutées à part. On croit à un double comptage. | `flow_devis.png` | Mettre la mention sous un total « Logistique », ou la reformuler. |
| 8 | Fiches produit | Important | Le prix s'affiche « 50 € / Jour » sans mention HT dans le bloc tarifs. HT n'apparaît que plus bas (« Total HT ») et le catalogue dit « À partir de 325 € / jour ». | `produit_stele_1440.png` | Écrire « 50 € HT / jour » partout, catalogue compris. |
| 9 | Fiches produit | Important | Aucun produit lié sur les 20 fiches (0 lien vers une autre fiche). C'est une impasse de navigation. | Script : `related 0` sur les 20 | Ajouter « Dans la même catégorie » (3 ou 4 produits). |
| 10 | Admin › Devis | Important | Le statut se change par une liste déroulante directement dans le tableau, ce qui expose à des changements accidentels. Le total affiche « 0 € » pour les demandes 100 % sur mesure, ce qui ressemble à une demande gratuite. La colonne « Mails » montre « A: sent C: sent », peu lisible. | `adm_w2_1440.png` | Afficher « Sur devis » au lieu de 0 €, des icônes ou libellés « Admin ✓ / Client ✓ », et faire confirmer le changement de statut. |
| 11 | Admin › Tableau de bord | Important | « Taux envoi / ajout panier 120.0 % » est incohérent (plus de demandes que d'ajouts : 6 contre 5). Le pipeline et les devis récents affichent 0 € pour le sur-mesure. On lit aussi « 1 unités ». | `adm_admin_1440.png` | Plafonner ou redéfinir l'indicateur, gérer le singulier, montrer l'estimation interne pour le sur-mesure. |
| 12 | Admin › Produits | Mineur | /admin/produits renvoie 404 (la page s'appelle /admin/products, alors que le menu est en français). | `adm_admin_produits_1440.png` | Rediriger /admin/produits vers /admin/products. |
| 13 | Admin › Devis | Mineur | Un clic sur « W-00002 » dans la liste n'a pas ouvert de détail dans le test ; la manière d'ouvrir une demande n'est pas évidente. | `adm_w2_1440.png` | Rendre toute la ligne cliquable, avec un curseur et un bouton « Voir ». |
| 14 | Admin (mobile 390) | Mineur | Le tableau des devis déborde à droite : on ne voit que N°, Date et Client, et le total et le statut sont cachés. | `adm_admin_devis_390.png` | Sur mobile, afficher une carte par demande. |
| 15 | Accueil | Mineur | Numérotation des sections : 01 dans le hero, puis le catalogue en 02, Ma demande en 05 et le contact en 06. Ni le sur-mesure ni les sections de l'accueil n'ont de numéro : la suite paraît arbitraire. | `home_1440.png`, `flow_devis.png` | Supprimer la numérotation ou la rendre continue et logique. |
| 16 | Accueil | Mineur | Le surtitre or « 01 — SETUP PARIS — LOCATION ÉVÉNEMENTIELLE » sur la photo est peu contrasté (petites capitales espacées). À 390 px, il passe sur deux lignes. | `home_390.png` | Le passer en blanc, ou l'appuyer sur un voile plus sombre. |
| 17 | Accueil — vidéo | Mineur | Vidéo de 51 s en lecture automatique sans bouton pause visible (critère WCAG 2.2.2). Elle pèse environ 1,5 Mo sur la page et est chargée depuis netlify.app. | `home_video_1440.png`, poids de l'accueil ≈ 1 539 Ko | Ajouter un bouton pause et l'héberger sur le domaine. |
| 18 | Page 404 | Mineur | Le statut 404 est correct, mais le titre de l'onglet est celui de l'accueil (« Setup Paris — Location d'objets… »). | `page-inexistante-xyz_390.png` | Titre « Page introuvable — Setup Paris ». |
| 19 | Fiche produit | Mineur | Le champ « Durée » a une icône superposée « +– » à gauche. | `flow_added.png` | Corriger l'alignement des boutons − / +. |
| 20 | Catalogue | Mineur | Le filtre « Prix / jour : 15 € – 750 € » n'a qu'un curseur visible, collé à gauche : on ne comprend pas si c'est un minimum ou un maximum. | `catalogue_390.png` | Deux poignées (min et max) avec les valeurs affichées. |
| 21 | Libellés | Mineur | Le même geste porte plusieurs noms : « Ajouter au devis » (location), « Ajouter à ma demande » (sur mesure), « Ma demande », « Ma demande de devis », « Votre devis est vide ». | Captures fiche et devis | Un seul vocabulaire : « Ajouter à ma demande » et « Ma demande ». |
| 22 | Ma demande | Mineur | La référence sur mesure apparaît deux fois sur la ligne. Le champ date affiche « mm/dd/yyyy » quand le navigateur est en anglais (champ natif). Le message d'échec « Erreur lors de l'envoi. » est générique et n'indique pas quoi faire. | Texte /devis, `flow_dbl.png` | Retirer le doublon. Prévoir un message « Réessayez ou écrivez à … ». |
| 23 | Accessibilité | Mineur | Les boutons de date ont un nom accessible différent du texte visible (« Choisir une date » n'est pas trouvable par son rôle), ce qui gêne la commande vocale. Les champs n'ont pas d'attribut `name` (ids `_r_1_`), donc pas d'autoremplissage fiable. | Script Playwright | Aligner aria-label et texte. Ajouter `name` et `autocomplete` (name, email, tel, organization). |

## Contrôles effectués et résultats

- **Pages publiques (14 adresses × 2 largeurs) :** toutes répondent 200, sauf /page-inexistante-xyz qui répond 404 comme prévu. Aucune erreur console. Pages chargées en 1 à 3,4 s.
- **Accueil FR/EN :** h1 unique, lang fr/en correct. 16 liens produits. La vidéo se lance avec des sous-titres FR.
- **Catalogue :** 20 produits affichés, filtres catégorie, recherche, tri, dates et prix présents. Pas de requête en échec.
- **Fiches testées :**
  - Stèle (décor, 3D) : 50 €/j, caution 100 €.
  - Pouf (mobilier, 3D) : 25 €/j, caution 50 €.
  - Podium (mobilier, sans 3D) : 325 €/j, caution 200 €.
  - Le lien « Le faire fabriquer sur mesure » est présent. Remises volume et durée affichées.
- **Parcours location jusqu'à l'envoi (intercepté) :**
  - Champs vides : la validation du navigateur bloque Nom et Email.
  - E-mail « pasunmail » : refusé.
  - Double clic sur Envoyer : **une seule** requête part, vers `POST /api/quotes/submit`.
- **Sur mesure / comptoir :**
  - L'iframe charge, et les messages `sur-mesure-ready` et `sur-mesure-config` arrivent.
  - La silhouette d'échelle est visible, avec les boutons Échelle, Cotes et Recadrer, et les cotes en cm.
  - « Prix sur devis » s'affiche : aucun appel à `/api/sur-mesure/estimate`, la fourchette est bien **désactivée**.
  - « Ajouter à ma demande » fonctionne : la confirmation « Voir ma demande » s'affiche et la ligne apparaît dans /devis.
  - Le bouton « Copier le lien de cette configuration » est présent.
- **Contact, CGL, mentions légales :** ces pages s'affichent. Coordonnées vues :
  - Partout : smart@setup.paris et 06 01 41 61 11.
  - Mentions légales seulement : contact@setup.paris et 01 43 91 10 45. **Trois adresses mail et deux téléphones différents sur le site : à harmoniser.**
- **Admin :** le tableau de bord, Devis, Calendrier, Clients, Sur mesure et Chiffrage s'ouvrent, à 1440 et 390 px. Aucune écriture déclenchée (0 requête bloquée). Une nouvelle demande réelle est présente : W-00006 (SEBASTIAO, 13/11).
- **Badge « Edit with Lovable » :** visible sur **toutes** les pages publiques et admin, en bas à droite. Sur mobile, il recouvre une partie du contenu. Gravité : important pour l'image de marque. À masquer dans les réglages de publication.
- **Version publiée :**
  - L'envoi passe par `POST /api/quotes/submit` : une requête vide reçoit 400 `invalid_payload`.
  - L'ancienne route `/api/send-quote-emails` répond 410.
  - `?lang=en` redirige (307) vers /en, et le sitemap contient 110 adresses.
  - La publication correspond donc au code récent (tickets S10 à S15 au moins).
  - Date exacte de la dernière publication : **inconnue**, le serveur ne renvoie pas d'en-tête Last-Modified.

## Non testé, et pourquoi

- **Envoi réel d'une demande ou d'un message de contact :** interdit par la consigne, les envois ont été interceptés. Le formulaire contact n'a pas été rempli.
- **Le lien de partage collé dans un nouvel onglet :** le presse-papiers n'est pas lisible de façon fiable en mode sans écran.
- **Détail de W-00002 :** le clic sur la ligne n'a pas ouvert le détail dans le script, et je n'ai pas insisté pour ne pas risquer une modification.
- **Admin Produits, Catégories, Paramètres et Roadmap :** non parcourus, en dehors du constat 404 sur /admin/produits.
- **Configurateurs 3D des fiches de location (hébergés sur netlify) :** non rouverts dans cet audit (vérifiés au ticket S14).
- **Rendu sur vrais appareils iOS et Android :** seul Chromium a été utilisé. Le zoom, le lecteur d'écran et la navigation clavier complète dans les calendriers et l'iframe n'ont pas été testés.
- **Contraste mesuré au pixel sur la photo d'accueil :** jugé à l'œil sur capture.
- **Scores Lighthouse et Core Web Vitals :** non mesurés. Seul le poids transféré a été relevé (accueil ≈ 1,5 Mo, catalogue ≈ 390 Ko, fiche ≈ 100 Ko).
