# S21 — Prix unifiés et CGL

14 novembre 2026. Aucun déploiement, aucune demande réelle ni mail ; W-00001…W-00006 inchangées. Aucune migration nécessaire ; mises à jour ciblées de produits et options uniquement.

## Données
- Désactivées sans suppression : bar-droit **Stratifié** (`9b880ca6-dd51-4c5a-ab8d-cde000631362`), **Papier peint** (`ac8da181-63d7-4241-841f-6d362f2c8d2f`) ; basketball **Couleur personnalisée 150 €** (`e3d61570-bda9-471f-afb5-2406992a8352`), **Peinture 50 €** (`33801925-02e7-4b8a-b1c2-a953bd8c1174`), **adhésif visuel 75 €** (`a700828c-d600-4feb-b71a-730a7d6105ee`) ; chamboule-tout **graphisme des boîtes 50 €** (`6d69939e-e80d-4a58-aa3a-f96d722707c8`), **habillage base brandé 80 €** (`5580220b-0716-454e-a912-9af1431f92fc`). Les sept états inactifs ont été relus.
- **Animateur dédié** conservé actif, séparé sous Services : **250 € HT / jour / unité**, multiplié par la durée côté client et serveur.
- `custom_price` / libellés FR/EN : huit jeux à **680 €** Branding (visuels imprimés + peinture), stèle **25 €** Peinture, photobooth-balancoire **430 €** Impression des faces ; stèle-miroir sans personnalisation, ouverture du configurateur retirée.
- Paliers **10 u −10 %, 20 u −15 %, 50 u −20 %** sur les sept produits en série demandés. Anciens paliers retirés des autres produits événement pour éviter leur application involontaire. Remise sur location (base + jours sup.) seulement, jamais options/personnalisation.

## Présentation et calcul
- Liste Personnalisation unique : case tarifée et options restantes ; tous les suppléments affichent HT / unité. Les anciennes options des visualisations à tarif unique sont masquées dans la présentation (pas supprimées en base), afin d'éviter un double chiffrage. LED et coussin restent disponibles.
- Les modes personnalisés 3D sélectionnent la case ; revenir au standard l'enlève. Détection partagée avec le recalcul serveur, qui utilise toujours les prix en base.
- Bandeau de prix intégré à la vue 3D avec supplément par unité et total réel. Stèle : copie locale du visualiseur locatif, messages à chaque choix ; seuls Blanc/Peinture restent proposés en finition, sans inventer un tarif de placage/stratifié. Configurateur sur-mesure non modifié.
- Accueil FR/EN, cartes « objet tel qu'en stock », tarif par unité/événement de livraison à reprise, lignes événement/jours sup./personnalisation/remise dans Ma demande et mail client. CGL FR/EN : article 3, nouvel article 3 bis, articles 5/6/7 et date novembre 2026.

## Personnalisations sans prix validé
- **lettres-geantes** : peinture RAL ; **table-de-blackjack** : couleurs personnalisées ; **pouf** : papier peint, placage, moquette ; **auvent** : couleurs tissu/structure/socle et montants. Ces capacités ont été constatées dans les visualiseurs hébergés. Options tarifées de personnalisation masquées sur les fiches, mention **sur devis**, aucun prix inventé ; coussin du pouf conservé comme option séparée.
- **triporteur** : aucune URL 3D en base ; mention sur devis, aucun tarif créé.

## Vérifications
- `bun test` : **71 tests réussis, 129 assertions**, dont 15 tests S21 ; compilation automatique **OK**.
- Navigateur local **1440/390 px** : basketball personnalisé **300 + 680 = 980 € HT**, stèle **50 + 25 = 75 € HT** ; supplément visible dans la vue 3D, case cochée sur fiche et lignes détaillées dans Ma demande. Retour standard : cases décochées, totaux **300/50 €**.
- Bar : une seule case, boutons Stratifié/Papier peint absents ; animateur affiché séparément sous Services. **20 poufs : 20 × 20 = 400 €, remise 15 % = 60 €, total 340 € HT** aux deux tailles, paliers visibles. Prix actuel du pouf relu à 20 €, non modifié par S21.
- CGL FR et EN ouvertes aux deux tailles ; article 3 bis présent. **0 erreur JavaScript** sur le parcours principal. Captures et relevés : `/tmp/browser/S21/` (temporaires).
- Envoi de demande bloqué dans le navigateur ; aucun bouton d'envoi actionné, aucune identité saisie. Recalcul serveur vérifié par le module partagé et ses tests, sans soumission réelle ; mail réel non testé. Les autres visualiseurs que basketball/stèle ont été inspectés pour leurs modes mais pas tous rejoués de bout en bout.
- Les mises à jour de données sont communes au site publié et à la préversion ; les changements d'affichage/code restent non publiés.