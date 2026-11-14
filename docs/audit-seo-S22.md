# Audit SEO S22 — Setup Paris

Audit du **14 novembre 2026, 09:23 UTC**. Origine publiée : https://catalogue.setup.paris.

## Périmètre et méthode

- Crawl HTTP effectué avec **curl**, sans navigateur ni exécution JavaScript : les 150 URL du sitemap publié, plus `/devis` et `/en/devis`, soit **152 URL**. Chaque réponse HTML initiale a été analysée.
- Comparaison avec les **152 URL locales corrigées**, également via curl. Les colonnes « publié » représentent une capture à un instant donné ; Gabin enrichissait les descriptions et catégories en parallèle. Une différence de contenu ne prouve donc pas un effet de code.
- Comptage des mots dans `<main>`, hors scripts, styles, navigation et pied de page. Les réponses de FAQ montées mais repliées sont présentes dans le HTML et incluses dans le texte indexable. Le contenu interne des iframes n’est pas compté.
- Aucune écriture en base, aucun prix modifié, aucune demande consultée ou modifiée, aucune demande envoyée, **aucune publication**.
- Les vérifications SEO antérieures sont périmées : elles ne servent pas de preuve actuelle. Cet audit ne mesure ni indexation Google, ni classement, ni trafic.

## Résultats

- **Publié : 152/152 HTTP 200**, un H1 par URL, canonical auto-référent et hreflang FR/EN/x-default présents. Aucun 404 du sitemap.
- Titres publiés dupliqués entre FR/EN : Cornhole, DJ booth, Plinko, Zig Zag. Plusieurs titres trop courts et descriptions trop courtes/longues ; détail ci-dessous.
- **Corrigé localement : 152/152 HTTP 200**, 152 titres uniques (30–65 caractères), 152 descriptions uniques (70–160 caractères), un H1 par URL. Canonical et hreflang auto-référents vérifiés.
- Les descriptions produits actuellement remplies par Gabin sont affichées en HTML initial ; les descriptions longues et les FAQ des 5 catégories apparaissent en FR/EN, sans modification des valeurs.
- Prix des 40 fiches et des cartes présents dans le HTML initial ; aucun montant sur les 24 pages de pièces sur mesure ni leur index.

## Corrections techniques

1. Accueil : données actives chargées au serveur, liens directs vers les 5 catégories et cartes tarifées dans le HTML initial. Organization/LocalBusiness avec adresse **8 avenue du Président Salvador Allende, Vitry-sur-Seine**, téléphone **06 01 41 61 11**, e-mail **smart@setup.paris**, repris du contact public.
2. Catalogue : liens indexables vers chaque catégorie ; title FR allongé. Suppression de l’image de partage générique sans rapport avec une image principale affichée.
3. Catégories : paragraphes sous le H1 depuis description_long_fr/en ; FAQ accessible avec réponses montées dans le HTML initial et masquées seulement quand repliées ; FAQPage lorsque des questions/réponses existent, BreadcrumbList, liens Product localisés, métadonnées propres.
4. Fiches : début de description normalisé ≤155 caractères, sans couper un mot ; texte complet dans Product.description ; image propre au produit, version 1200 px pour le partage lorsqu’une transformation existe ; alt nom + catégorie ; brand Setup Paris, Offer EUR, availability, prix inchangé price_event, unitText « par événement », additionalProperty Dimensions si renseignées.
5. Sur mesure : descriptions, cotes min/max réelles extraites du configurateur existant, finitions propres à la pièce, étapes et réponse sous 48 h ouvrées dans une page visible. 3D ouverte à la demande plutôt que superposée au texte ; aucun prix public. Service et BreadcrumbList, titres/descriptions uniques.
6. Sitemap : ajout de `/devis` FR/EN ; pagination ordonnée, réponse 503 en cas d’échec plutôt qu’un XML incomplet, client public sans session ; dates produits/catégories = **updated_at complet réel** plutôt que date tronquée.

## Sitemap et lastmod

| Ensemble | Publié | Local corrigé | Attendu |
|---|---:|---:|---:|
| Produits actifs FR+EN | 80 | 80 | 40 × 2 |
| Catégories actives FR+EN | 10 | 10 | 5 × 2 |
| Pièces sur mesure FR+EN | 48 | 48 | 24 × 2 |
| Pages statiques FR+EN | 12 | 14 | 7 × 2 |
| Total | 150 | 152 | 152 |

Inventaire confirmé en lecture seule : **40 produits actifs, 5 catégories actives**. Les slugs du sitemap publié correspondent à ceux du sitemap local filtré sur is_active=true ; aucun produit inactif et aucune entrée dupliquée. Les 7 statiques sont `/`, `/catalogue`, `/contact`, `/devis`, `/cgl`, `/mentions-legales`, `/sur-mesure`.
Le lastmod existant provenait déjà de updated_at, tronqué au jour : il n’était pas dérivé de la date de génération. Maintenant, le timestamp complet est conservé pour produits/catégories. **Statique et pièces sur mesure : lastmod omis**, faute de timestamp éditorial page par page faisant autorité ; aucun timestamp de compilation ou de génération inventé. Un updated_at métier peut aussi changer lors d’une modification non éditoriale : c’est la source demandée, non une mesure indépendante de fraîcheur du texte.

## Contrôles et tests

- `bun test` : **80 réussis, 0 échec, 214 assertions**. Nouveau test HTTP title/meta/H1/JSON-LD sur une fiche, une catégorie et une pièce, FR/EN ; prix et unitText, FAQ HTML, 24 limites, inventaire 152 URL.
- Contrôles navigateur **1440 et 390 px** : ouverture FAQ, texte sur mesure visible, ouverture du modèle 3D non vide ; aucune erreur JavaScript. Requêtes autres que GET/HEAD/OPTIONS bloquées pendant ces contrôles.
- Dernier contrôle compilation : OK. Les corrections restent locales et n’apparaîtront sur le domaine publié qu’à la prochaine publication autorisée.

## Contenu à compléter ou valider par Gabin

- Dimensions absentes : **auvent, cornhole, mange-debout, mini-golf, panier-basketball, plinko, puissance-4, stand-de-tir, triporteur, zig-zag**. Dimensions non numériques ou incomplètes à préciser : **dj-booth (« À préciser »), tabouret-atelier (« Standard »), pupitre-colonnes**, ainsi que hauteurs/largeurs/profondeurs partielles sur certaines fiches. Aucune valeur inventée.
- Cautions à valider : les enregistrements actifs avec caution 0 ne sont pas réputés erronés ; confirmer notamment assise-cube, banquette-droite, box-cabine, châssis borgniole 2/5 m², châssis imprimé, châssis plaqué autoporté, cimaise-sur-platine, dj-booth, lettres-geantes, mirolege, mur-autoporte, podium-rond, praticable-sur-pieds, pupitres, stele-ronde-pmma, table-alu, tabouret-atelier. **Aucune caution modifiée**.
- Les 40 actifs ont une URL d’image. L’existence d’une image ne certifie ni photo réelle ni conformité au stock : valider/remplacer les rendus ou photos génériques. Photos de catégories historiquement génériques à remplacer par des réalisations adaptées. Aucune image ni description écrasée.
- Les dimensions sur mesure listées sont les bornes du configurateur et non une garantie de faisabilité ; le texte l’indique. Délais de fabrication définitifs à confirmer au devis.
- Les descriptions courtes que Gabin peut modifier ultérieurement pourront passer sous 70 caractères : priorité au début fidèle du texte, sans remplissage inventé. Le test couvre les données actuelles.
- Images de partage produit transformées à 1200 px, sans recadrer le produit ; pas de ratio 1200×630 forcé au détriment de l’objet. Formats/poids des originaux non transformables et aperçus propres à chaque plateforme restent à contrôler après publication.

## Tableau complet — crawl publié et contrôle local

Les chemins sont relatifs à l’origine publique ci-dessus. T = titre, M = meta description ; « unique » compare les 152 URL, FR et EN ensemble. Les détails exacts de canonical, hreflang, Open Graph, images et liens figurent dans l’annexe par URL.

| URL | HTTP publié/local | T publié : caractères / unicité | M publié : caractères / unicité | H1 publié/local | Mots publié/local | Prix HTML publié/local | JSON-LD publié → local |
|---|---|---|---|---|---|---|---|
| / | 200/200 | 45 / unique | 144 / unique | 1/1 | 174/382 | non/oui | Organization → Organization, Organization/LocalBusiness |
| /catalogue | 200/200 | 23 / unique | 108 / unique | 1/1 | 491/491 | oui/oui | Organization → Organization |
| /categorie/decoration | 200/200 | 50 / unique | 90 / unique | 1/1 | 26/262 | oui/oui | Organization, ItemList → Organization, BreadcrumbList, ItemList, FAQPage |
| /categorie/jeux | 200/200 | 44 / unique | 84 / unique | 1/1 | 106/371 | oui/oui | Organization, ItemList → Organization, BreadcrumbList, ItemList, FAQPage |
| /categorie/mobilier | 200/200 | 48 / unique | 88 / unique | 1/1 | 187/478 | oui/oui | Organization, ItemList → Organization, BreadcrumbList, ItemList, FAQPage |
| /categorie/signaletique | 200/200 | 52 / unique | 92 / unique | 1/1 | 28/251 | oui/oui | Organization, ItemList → Organization, BreadcrumbList, ItemList, FAQPage |
| /categorie/structures | 200/200 | 50 / unique | 90 / unique | 1/1 | 133/438 | oui/oui | Organization, ItemList → Organization, BreadcrumbList, ItemList, FAQPage |
| /cgl | 200/200 | 46 / unique | 105 / unique | 1/1 | 1664/1664 | non/non | Organization → Organization |
| /contact | 200/200 | 54 / unique | 132 / unique | 1/1 | 59/59 | non/non | Organization → Organization |
| /devis | 200/200 | 24 / unique | 172 / unique | 1/1 | 70/70 | oui/oui | Organization → Organization |
| /en | 200/200 | 43 / unique | 138 / unique | 1/1 | 169/377 | non/oui | Organization → Organization, Organization/LocalBusiness |
| /en/catalogue | 200/200 | 37 / unique | 110 / unique | 1/1 | 490/490 | oui/oui | Organization → Organization |
| /en/categorie/decoration | 200/200 | 39 / unique | 83 / unique | 1/1 | 27/251 | oui/oui | Organization, ItemList → Organization, BreadcrumbList, ItemList, FAQPage |
| /en/categorie/jeux | 200/200 | 34 / unique | 78 / unique | 1/1 | 104/357 | oui/oui | Organization, ItemList → Organization, BreadcrumbList, ItemList, FAQPage |
| /en/categorie/mobilier | 200/200 | 38 / unique | 82 / unique | 1/1 | 186/467 | oui/oui | Organization, ItemList → Organization, BreadcrumbList, ItemList, FAQPage |
| /en/categorie/signaletique | 200/200 | 36 / unique | 80 / unique | 1/1 | 28/246 | oui/oui | Organization, ItemList → Organization, BreadcrumbList, ItemList, FAQPage |
| /en/categorie/structures | 200/200 | 39 / unique | 83 / unique | 1/1 | 139/435 | oui/oui | Organization, ItemList → Organization, BreadcrumbList, ItemList, FAQPage |
| /en/cgl | 200/200 | 34 / unique | 93 / unique | 1/1 | 1506/1506 | non/non | Organization → Organization |
| /en/contact | 200/200 | 43 / unique | 114 / unique | 1/1 | 64/64 | non/non | Organization → Organization |
| /en/devis | 200/200 | 24 / unique | 163 / unique | 1/1 | 72/72 | oui/oui | Organization → Organization |
| /en/mentions-legales | 200/200 | 26 / unique | 112 / unique | 1/1 | 656/656 | oui/oui | Organization → Organization |
| /en/produit/assise-cube | 200/200 | 23 / unique | 63 / unique | 1/1 | 180/227 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/auvent | 200/200 | 33 / unique | 44 / unique | 1/1 | 140/181 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/banquette-droite | 200/200 | 28 / unique | 49 / unique | 1/1 | 173/212 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/bar-arrondi | 200/200 | 24 / unique | 87 / unique | 1/1 | 216/247 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/bar-droit | 200/200 | 26 / unique | 73 / unique | 1/1 | 189/228 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/box-cabine | 200/200 | 25 / unique | 98 / unique | 1/1 | 184/215 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/chamboule-tout | 200/200 | 27 / unique | 160 / unique | 1/1 | 228/228 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/chassis-borgniole-noir-2m2 | 200/200 | 37 / unique | 64 / unique | 1/1 | 183/223 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/chassis-borgniole-noir-5m2 | 200/200 | 37 / unique | 69 / unique | 1/1 | 189/234 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/chassis-imprime | 200/200 | 27 / unique | 82 / unique | 1/1 | 139/171 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/chassis-plaque-autoporte | 200/200 | 37 / unique | 94 / unique | 1/1 | 181/220 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/cimaise-sur-platine | 200/200 | 41 / unique | 84 / unique | 1/1 | 175/214 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/cornhole | 200/200 | 22 / doublon | 53 / unique | 1/1 | 156/205 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/dj-booth | 200/200 | 22 / doublon | 54 / unique | 1/1 | 160/187 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/lettres-geantes | 200/200 | 27 / unique | 51 / unique | 1/1 | 117/167 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/mange-debout | 200/200 | 24 / unique | 25 / unique | 1/1 | 145/179 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/mini-golf | 200/200 | 23 / unique | 25 / unique | 1/1 | 153/202 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/mirolege | 200/200 | 35 / unique | 59 / unique | 1/1 | 147/181 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/mur-autoporte | 200/200 | 31 / unique | 75 / unique | 1/1 | 175/210 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/panier-basketball | 200/200 | 29 / unique | 53 / unique | 1/1 | 155/206 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/photobooth-balancoire | 200/200 | 30 / unique | 124 / unique | 1/1 | 159/159 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/plinko | 200/200 | 20 / doublon | 52 / unique | 1/1 | 157/199 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/podium | 200/200 | 31 / unique | 80 / unique | 1/1 | 200/246 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/podium-rond | 200/200 | 26 / unique | 58 / unique | 1/1 | 179/222 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/pouf | 200/200 | 25 / unique | 108 / unique | 1/1 | 174/216 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/praticable-sur-pieds | 200/200 | 33 / unique | 90 / unique | 1/1 | 171/192 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/puissance-4 | 200/200 | 29 / unique | 43 / unique | 1/1 | 157/204 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/pupitre-ceremonie | 200/200 | 30 / unique | 58 / unique | 1/1 | 160/191 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/pupitre-colonnes | 200/200 | 28 / unique | 42 / unique | 1/1 | 160/194 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/pupitre-plexi-noir | 200/200 | 41 / unique | 61 / unique | 1/1 | 164/195 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/samias | 200/200 | 31 / unique | 119 / unique | 1/1 | 188/223 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/stand-de-tir | 200/200 | 28 / unique | 49 / unique | 1/1 | 156/195 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/stele | 200/200 | 27 / unique | 42 / unique | 1/1 | 132/185 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/stele-miroir | 200/200 | 27 / unique | 121 / unique | 1/1 | 204/204 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/stele-ronde-pmma | 200/200 | 34 / unique | 75 / unique | 1/1 | 171/207 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/table-alu | 200/200 | 29 / unique | 71 / unique | 1/1 | 165/200 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/table-de-blackjack | 200/200 | 29 / unique | 160 / unique | 1/1 | 167/167 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/tabouret-atelier | 200/200 | 33 / unique | 51 / unique | 1/1 | 146/179 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/triporteur | 200/200 | 24 / unique | 45 / unique | 1/1 | 133/162 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/produit/zig-zag | 200/200 | 21 / doublon | 75 / unique | 1/1 | 160/206 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /en/sur-mesure | 200/200 | 41 / unique | 161 / unique | 1/1 | 544/544 | non/non | Organization, Service → Organization, Service |
| /en/sur-mesure/arche | 200/200 | 39 / unique | 158 / unique | 1/1 | 43/128 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/banc | 200/200 | 31 / unique | 156 / unique | 1/1 | 44/121 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/bar | 200/200 | 41 / unique | 196 / unique | 1/1 | 58/137 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/cacheRegie | 200/200 | 42 / unique | 152 / unique | 1/1 | 44/101 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/cadre | 200/200 | 43 / unique | 124 / unique | 1/1 | 37/96 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/claustra | 200/200 | 40 / unique | 161 / unique | 1/1 | 44/97 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/comptoir | 200/200 | 33 / unique | 160 / unique | 1/1 | 43/117 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/comptoirL | 200/200 | 40 / unique | 171 / unique | 1/1 | 49/127 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/cubes | 200/200 | 39 / unique | 165 / unique | 1/1 | 44/111 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/etagere | 200/200 | 40 / unique | 147 / unique | 1/1 | 40/114 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/gradin | 200/200 | 38 / unique | 144 / unique | 1/1 | 40/119 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/jardiniere | 200/200 | 33 / unique | 117 / unique | 1/1 | 36/110 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/lettres | 200/200 | 39 / unique | 155 / unique | 1/1 | 46/114 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/mangeDebout | 200/200 | 38 / unique | 169 / unique | 1/1 | 49/124 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/mur | 200/200 | 36 / unique | 122 / unique | 1/1 | 37/90 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/podium | 200/200 | 32 / unique | 143 / unique | 1/1 | 38/113 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/portant | 200/200 | 39 / unique | 172 / unique | 1/1 | 47/128 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/pouf | 200/200 | 30 / unique | 130 / unique | 1/1 | 37/89 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/pupitre | 200/200 | 33 / unique | 161 / unique | 1/1 | 44/118 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/socleRond | 200/200 | 38 / unique | 143 / unique | 1/1 | 41/103 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/stele | 200/200 | 32 / unique | 165 / unique | 1/1 | 43/119 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/table | 200/200 | 31 / unique | 186 / unique | 1/1 | 49/128 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/totem | 200/200 | 36 / unique | 154 / unique | 1/1 | 44/120 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /en/sur-mesure/urne | 200/200 | 36 / unique | 165 / unique | 1/1 | 44/125 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /mentions-legales | 200/200 | 30 / unique | 133 / unique | 1/1 | 682/682 | oui/oui | Organization → Organization |
| /produit/assise-cube | 200/200 | 25 / unique | 84 / unique | 1/1 | 181/230 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/auvent | 200/200 | 36 / unique | 49 / unique | 1/1 | 146/190 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/banquette-droite | 200/200 | 30 / unique | 73 / unique | 1/1 | 179/221 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/bar-arrondi | 200/200 | 25 / unique | 105 / unique | 1/1 | 219/250 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/bar-droit | 200/200 | 23 / unique | 78 / unique | 1/1 | 191/232 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/box-cabine | 200/200 | 24 / unique | 101 / unique | 1/1 | 179/214 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/chamboule-tout | 200/200 | 28 / unique | 160 / unique | 1/1 | 241/241 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/chassis-borgniole-noir-2m2 | 200/200 | 46 / unique | 71 / unique | 1/1 | 183/223 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/chassis-borgniole-noir-5m2 | 200/200 | 44 / unique | 76 / unique | 1/1 | 188/234 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/chassis-imprime | 200/200 | 29 / unique | 88 / unique | 1/1 | 142/175 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/chassis-plaque-autoporte | 200/200 | 38 / unique | 105 / unique | 1/1 | 180/219 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/cimaise-sur-platine | 200/200 | 33 / unique | 76 / unique | 1/1 | 170/210 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/cornhole | 200/200 | 22 / doublon | 64 / unique | 1/1 | 163/218 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/dj-booth | 200/200 | 22 / doublon | 57 / unique | 1/1 | 161/190 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/lettres-geantes | 200/200 | 29 / unique | 55 / unique | 1/1 | 124/177 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/mange-debout | 200/200 | 26 / unique | 27 / unique | 1/1 | 151/189 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/mini-golf | 200/200 | 23 / unique | 32 / unique | 1/1 | 158/206 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/mirolege | 200/200 | 22 / unique | 66 / unique | 1/1 | 150/183 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/mur-autoporte | 200/200 | 27 / unique | 87 / unique | 1/1 | 179/211 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/panier-basketball | 200/200 | 34 / unique | 67 / unique | 1/1 | 160/218 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/photobooth-balancoire | 200/200 | 35 / unique | 130 / unique | 1/1 | 162/162 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/plinko | 200/200 | 20 / doublon | 53 / unique | 1/1 | 161/212 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/podium | 200/200 | 30 / unique | 106 / unique | 1/1 | 205/249 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/podium-rond | 200/200 | 25 / unique | 80 / unique | 1/1 | 182/227 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/pouf | 200/200 | 27 / unique | 99 / unique | 1/1 | 178/223 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/praticable-sur-pieds | 200/200 | 34 / unique | 95 / unique | 1/1 | 173/193 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/puissance-4 | 200/200 | 31 / unique | 42 / unique | 1/1 | 160/211 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/pupitre-ceremonie | 200/200 | 34 / unique | 76 / unique | 1/1 | 165/199 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/pupitre-colonnes | 200/200 | 32 / unique | 48 / unique | 1/1 | 162/199 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/pupitre-plexi-noir | 200/200 | 40 / unique | 83 / unique | 1/1 | 169/199 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/samias | 200/200 | 30 / unique | 128 / unique | 1/1 | 192/225 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/stand-de-tir | 200/200 | 26 / unique | 64 / unique | 1/1 | 163/206 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/stele | 200/200 | 19 / unique | 51 / unique | 1/1 | 137/187 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/stele-miroir | 200/200 | 26 / unique | 105 / unique | 1/1 | 211/211 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/stele-ronde-pmma | 200/200 | 31 / unique | 85 / unique | 1/1 | 172/215 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/table-alu | 200/200 | 29 / unique | 83 / unique | 1/1 | 169/205 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/table-de-blackjack | 200/200 | 32 / unique | 160 / unique | 1/1 | 176/176 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/tabouret-atelier | 200/200 | 37 / unique | 57 / unique | 1/1 | 152/184 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/triporteur | 200/200 | 24 / unique | 49 / unique | 1/1 | 136/170 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /produit/zig-zag | 200/200 | 21 / doublon | 88 / unique | 1/1 | 166/212 | oui/oui | Organization, Product, BreadcrumbList → Organization, Product, BreadcrumbList |
| /sur-mesure | 200/200 | 46 / unique | 162 / unique | 1/1 | 526/526 | non/non | Organization, Service → Organization, Service |
| /sur-mesure/arche | 200/200 | 39 / unique | 142 / unique | 1/1 | 48/138 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/banc | 200/200 | 29 / unique | 138 / unique | 1/1 | 47/129 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/bar | 200/200 | 39 / unique | 188 / unique | 1/1 | 59/143 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/cacheRegie | 200/200 | 36 / unique | 130 / unique | 1/1 | 47/109 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/cadre | 200/200 | 42 / unique | 100 / unique | 1/1 | 41/105 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/claustra | 200/200 | 33 / unique | 125 / unique | 1/1 | 41/99 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/comptoir | 200/200 | 33 / unique | 133 / unique | 1/1 | 44/123 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/comptoirL | 200/200 | 41 / unique | 163 / unique | 1/1 | 53/136 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/cubes | 200/200 | 39 / unique | 148 / unique | 1/1 | 48/120 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/etagere | 200/200 | 42 / unique | 129 / unique | 1/1 | 44/123 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/gradin | 200/200 | 31 / unique | 133 / unique | 1/1 | 44/128 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/jardiniere | 200/200 | 35 / unique | 104 / unique | 1/1 | 40/119 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/lettres | 200/200 | 40 / unique | 131 / unique | 1/1 | 48/121 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/mangeDebout | 200/200 | 37 / unique | 147 / unique | 1/1 | 49/129 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/mur | 200/200 | 36 / unique | 100 / unique | 1/1 | 40/98 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/podium | 200/200 | 31 / unique | 131 / unique | 1/1 | 42/122 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/portant | 200/200 | 32 / unique | 154 / unique | 1/1 | 50/136 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/pouf | 200/200 | 29 / unique | 111 / unique | 1/1 | 40/97 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/pupitre | 200/200 | 32 / unique | 142 / unique | 1/1 | 43/122 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/socleRond | 200/200 | 35 / unique | 121 / unique | 1/1 | 42/109 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/stele | 200/200 | 30 / unique | 155 / unique | 1/1 | 48/129 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/table | 200/200 | 30 / unique | 181 / unique | 1/1 | 54/138 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/totem | 200/200 | 30 / unique | 141 / unique | 1/1 | 44/125 | non/non | Organization, Service → Organization, Service, BreadcrumbList |
| /sur-mesure/urne | 200/200 | 29 / unique | 145 / unique | 1/1 | 47/133 | non/non | Organization, Service → Organization, Service, BreadcrumbList |

## Annexe exhaustive par URL

Valeurs publiées suivies des valeurs locales quand différentes. Les références de photos stockées sont notées par nom de fichier pour éviter d’exposer les identifiants techniques de stockage. Les balises conservent les URL absolues réelles.

### /

- Title publié : Setup Paris — Location d'objets événementiels
- Description publiée : Personnalisez, configurez, louez. Catalogue d'objets événementiels avec configurateur 3D : jeux, structures, signalétique, décoration, mobilier.
- Title local (45 car.) : Setup Paris — Location d'objets événementiels
- Description locale (144 car.) : Personnalisez, configurez, louez. Catalogue d'objets événementiels avec configurateur 3D : jeux, structures, signalétique, décoration, mobilier.
- H1 : Location d'objets événementiels
- Canonical publié / local : / / /
- Hreflang publié : fr=/, en=/en, x-default=/
- Hreflang local : fr=/, en=/en, x-default=/
- og:title publié / local : Setup Paris — Location d'objets événementiels / Setup Paris — Location d'objets événementiels
- og:description publié / local : Personnalisez, configurez, louez. / Personnalisez, configurez, louez.
- og:image publié / local : https://setup-paris-configurators.netlify.app/setup-paris-presentation-poster.jpg / —
- Images/alt publiés : /assets/setup-hero-_U2Jrokk.jpg → Installation événementielle Setup Paris — rideau bleu Yonex Player Support; /assets/louis-vuitton-BrPrP0Xf.png → Louis Vuitton; /assets/hermes-CFe9XdrF.png → Hermès; /assets/canal-plus-fw-ow8gF.png → Canal+; /assets/france-tv-DYCqhjwG.png → France.tv; /assets/bbc-zk0HoPFi.png → BBC; /assets/warner-aiI9IKIZ.png → Warner Bros; /assets/m6-gDuebj9i.png → M6
- Images/alt locaux : /src/assets/hero/setup-hero.jpg → Installation événementielle Setup Paris — rideau bleu Yonex Player Support; https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=70 → Jeux; https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=70 → Structures; https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=70 → Signalétique; https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=70 → Décoration; https://images.unsplash.com/photo-1519302959554-a75be0afc82a?auto=format&fit=crop&w=800&q=70 → Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball — Jeux; Photo produit : 1777543043347-ze8rul.png → Cornhole — Jeux; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant — Jeux; Photo produit : 1777543737980-j52rup.jpg → Plinko — Jeux; Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf — Jeux; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball — Jeux; Photo produit : 1777543043347-ze8rul.png → Cornhole — Jeux; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant — Jeux; Photo produit : 1777543737980-j52rup.jpg → Plinko — Jeux; Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf — Jeux; /src/assets/clients/louis-vuitton.png → Louis Vuitton; /src/assets/clients/hermes.png → Hermès; /src/assets/clients/canal-plus.png → Canal+; /src/assets/clients/france-tv.png → France.tv; /src/assets/clients/bbc.png → BBC; /src/assets/clients/warner.png → Warner Bros; /src/assets/clients/m6.png → M6
- Liens internes publiés (6) : /catalogue, /sur-mesure
- Liens internes locaux (28) : /catalogue, /sur-mesure, /categorie/jeux, /categorie/structures, /categorie/signaletique, /categorie/decoration, /categorie/mobilier, /produit/bar-arrondi, /produit/podium, /produit/samias, /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/plinko, /produit/mini-golf

### /catalogue

- Title publié : Catalogue — Setup Paris
- Description publiée : Découvrez notre catalogue de location : jeux, structures, signalétique, décoration et mobilier événementiel.
- Title local (50 car.) : Catalogue de location événementielle — Setup Paris
- Description locale (108 car.) : Découvrez notre catalogue de location : jeux, structures, signalétique, décoration et mobilier événementiel.
- H1 : Catalogue
- Canonical publié / local : /catalogue / /catalogue
- Hreflang publié : fr=/catalogue, en=/en/catalogue, x-default=/catalogue
- Hreflang local : fr=/catalogue, en=/en/catalogue, x-default=/catalogue
- og:title publié / local : Catalogue — Setup Paris / Catalogue de location événementielle — Setup Paris
- og:description publié / local : Notre catalogue d'objets événementiels. / Notre catalogue d'objets événementiels.
- og:image publié / local : https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&h=630&q=80 / —
- Images/alt publiés : Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant; Photo produit : 1777543737980-j52rup.jpg → Plinko; Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf; Photo produit : 1777539884880-6v9tpq.png → Stand de Tir; Photo produit : auvent.png → Auvent Personnalisable; Photo produit : 1777544265578-g6rq7n.png → Zig Zag; Photo produit : 1777546178517-4sdg4e.jpg → Chamboule-tout; Photo produit : 1777539739806-lk7ch3.png → Table de Blackjack; Photo produit : lettres-geantes.jpg → Lettres Géantes; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur; Photo produit : 1777546380003-oqh8e9.png → Pouf / Assise; Photo produit : 1777544975776-65lgoj.png → Stèle Miroir; Photo produit : 1777547928218-y3xuzi.png → PhotoBooth Balançoire; Photo produit : 1780640879229-lu39vb.jpeg → Stèle; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté; Photo produit : mur-autoporte-1794598844256.png → Mur autoporté; Photo produit : cimaise-sur-platine-1794598844903.png → Cimaise sur platine; Photo produit : chassis-borgniole-noir-5m2-1794598845390.png → Châssis borgniolé noir — grand; Photo produit : chassis-borgniole-noir-2m2-1794598845844.png → Châssis borgniolé noir — bandeau; Photo produit : chassis-imprime-1794598846331.png → Châssis imprimé; Photo produit : stele-ronde-pmma-1794598847008.png → Stèle ronde plexi; Photo produit : bar-droit-1794598847891.png → Bar droit; Photo produit : table-alu-1794598848306.png → Table aluminium; Photo produit : assise-cube-1794598848687.png → Assise cube; Photo produit : banquette-droite-1794598849134.png → Banquette droite; Photo produit : pupitre-plexi-noir-1794598849721.png → Pupitre plexi caisson noir; Photo produit : pupitre-ceremonie-1794598850211.png → Pupitre de cérémonie; Photo produit : pupitre-colonnes-1794598850650.png → Pupitre à colonnes; Photo produit : tabouret-atelier-1794598851137.png → Tabouret haut d'atelier; Photo produit : dj-booth-1794598851542.png → DJ booth; Photo produit : mirolege-1794598851939.png → Mirolège; Photo produit : box-cabine-1794598852335.png → Box cabine; Photo produit : podium-rond-1794600085097.png → Podium rond
- Images/alt locaux : Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball — Jeux; Photo produit : 1777543043347-ze8rul.png → Cornhole — Jeux; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant — Jeux; Photo produit : 1777543737980-j52rup.jpg → Plinko — Jeux; Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf — Jeux; Photo produit : 1777539884880-6v9tpq.png → Stand de Tir — Jeux; Photo produit : auvent.png → Auvent Personnalisable — Structures; Photo produit : 1777544265578-g6rq7n.png → Zig Zag — Jeux; Photo produit : 1777546178517-4sdg4e.jpg → Chamboule-tout — Jeux; Photo produit : 1777539739806-lk7ch3.png → Table de Blackjack — Jeux; Photo produit : lettres-geantes.jpg → Lettres Géantes — Décoration; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier; Photo produit : 1777544975776-65lgoj.png → Stèle Miroir — Mobilier; Photo produit : 1777546380003-oqh8e9.png → Pouf / Assise — Mobilier; Photo produit : 1777547928218-y3xuzi.png → PhotoBooth Balançoire — Signalétique; Photo produit : 1780640879229-lu39vb.jpeg → Stèle — Décoration; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté — Structures; Photo produit : mur-autoporte-1794598844256.png → Mur autoporté — Structures; Photo produit : cimaise-sur-platine-1794598844903.png → Cimaise sur platine — Structures; Photo produit : chassis-borgniole-noir-5m2-1794598845390.png → Châssis borgniolé noir — grand — Structures; Photo produit : chassis-borgniole-noir-2m2-1794598845844.png → Châssis borgniolé noir — bandeau — Structures; Photo produit : chassis-imprime-1794598846331.png → Châssis imprimé — Signalétique; Photo produit : stele-ronde-pmma-1794598847008.png → Stèle ronde plexi — Mobilier; Photo produit : bar-droit-1794598847891.png → Bar droit — Mobilier; Photo produit : table-alu-1794598848306.png → Table aluminium — Mobilier; Photo produit : assise-cube-1794598848687.png → Assise cube — Mobilier; Photo produit : banquette-droite-1794598849134.png → Banquette droite — Mobilier; Photo produit : pupitre-plexi-noir-1794598849721.png → Pupitre plexi caisson noir — Mobilier; Photo produit : pupitre-ceremonie-1794598850211.png → Pupitre de cérémonie — Mobilier; Photo produit : pupitre-colonnes-1794598850650.png → Pupitre à colonnes — Mobilier; Photo produit : tabouret-atelier-1794598851137.png → Tabouret haut d'atelier — Mobilier; Photo produit : dj-booth-1794598851542.png → DJ booth — Mobilier; Photo produit : mirolege-1794598851939.png → Mirolège — Structures; Photo produit : box-cabine-1794598852335.png → Box cabine — Structures; Photo produit : podium-rond-1794600085097.png → Podium rond — Structures
- Liens internes publiés (40) : /produit/bar-arrondi, /produit/podium, /produit/samias, /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/plinko, /produit/mini-golf, /produit/stand-de-tir, /produit/auvent, /produit/zig-zag, /produit/chamboule-tout, /produit/table-de-blackjack, /produit/lettres-geantes, /produit/mange-debout, /produit/triporteur, /produit/pouf, /produit/stele-miroir, /produit/photobooth-balancoire, /produit/stele, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte, /produit/mur-autoporte, /produit/cimaise-sur-platine, /produit/chassis-borgniole-noir-5m2, /produit/chassis-borgniole-noir-2m2, /produit/chassis-imprime, /produit/stele-ronde-pmma, /produit/bar-droit, /produit/table-alu, /produit/assise-cube, /produit/banquette-droite, /produit/pupitre-plexi-noir, /produit/pupitre-ceremonie, /produit/pupitre-colonnes, /produit/tabouret-atelier, /produit/dj-booth, /produit/mirolege, /produit/box-cabine, /produit/podium-rond
- Liens internes locaux (40) : /produit/bar-arrondi, /produit/podium, /produit/samias, /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/plinko, /produit/mini-golf, /produit/stand-de-tir, /produit/auvent, /produit/zig-zag, /produit/chamboule-tout, /produit/table-de-blackjack, /produit/lettres-geantes, /produit/mange-debout, /produit/triporteur, /produit/stele-miroir, /produit/pouf, /produit/photobooth-balancoire, /produit/stele, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte, /produit/mur-autoporte, /produit/cimaise-sur-platine, /produit/chassis-borgniole-noir-5m2, /produit/chassis-borgniole-noir-2m2, /produit/chassis-imprime, /produit/stele-ronde-pmma, /produit/bar-droit, /produit/table-alu, /produit/assise-cube, /produit/banquette-droite, /produit/pupitre-plexi-noir, /produit/pupitre-ceremonie, /produit/pupitre-colonnes, /produit/tabouret-atelier, /produit/dj-booth, /produit/mirolege, /produit/box-cabine, /produit/podium-rond

### /categorie/decoration

- Title publié : Décoration — Location événementielle \| Setup Paris
- Description publiée : Location de décoration à Paris et en Île-de-France. Découvrez notre sélection Setup Paris.
- Title local (50 car.) : Décoration — Location événementielle \| Setup Paris
- Description locale (153 car.) : La décoration qui met en valeur : stèles carrées en menuiserie pour présenter un produit ou une information, lettres géantes en volume pour écrire un nom
- H1 : Décoration
- Canonical publié / local : /categorie/decoration / /categorie/decoration
- Hreflang publié : fr=/categorie/decoration, en=/en/categorie/decoration, x-default=/categorie/decoration
- Hreflang local : fr=/categorie/decoration, en=/en/categorie/decoration, x-default=/categorie/decoration
- og:title publié / local : Décoration — Location événementielle \| Setup Paris / Décoration — Location événementielle \| Setup Paris
- og:description publié / local : Location de décoration à Paris et en Île-de-France. Découvrez notre sélection Setup Paris. / La décoration qui met en valeur : stèles carrées en menuiserie pour présenter un produit ou une information, lettres géantes en volume pour écrire un nom
- og:image publié / local : https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&h=630&q=80 / —
- Images/alt publiés : Photo produit : lettres-geantes.jpg → Lettres Géantes; Photo produit : 1780640879229-lu39vb.jpeg → Stèle
- Images/alt locaux : Photo produit : lettres-geantes.jpg → Lettres Géantes — Décoration; Photo produit : 1780640879229-lu39vb.jpeg → Stèle — Décoration
- Liens internes publiés (2) : /produit/lettres-geantes, /produit/stele
- Liens internes locaux (2) : /produit/lettres-geantes, /produit/stele
- FAQPage : 4 questions/réponses, réponses présentes dans HTML initial.

### /categorie/jeux

- Title publié : Jeux — Location événementielle \| Setup Paris
- Description publiée : Location de jeux à Paris et en Île-de-France. Découvrez notre sélection Setup Paris.
- Title local (44 car.) : Jeux — Location événementielle \| Setup Paris
- Description locale (149 car.) : Des jeux géants pour animer un stand, un salon, un séminaire, une soirée d'entreprise ou un plateau TV : panier de basketball, zig zag, stand de tir,
- H1 : Jeux
- Canonical publié / local : /categorie/jeux / /categorie/jeux
- Hreflang publié : fr=/categorie/jeux, en=/en/categorie/jeux, x-default=/categorie/jeux
- Hreflang local : fr=/categorie/jeux, en=/en/categorie/jeux, x-default=/categorie/jeux
- og:title publié / local : Jeux — Location événementielle \| Setup Paris / Jeux — Location événementielle \| Setup Paris
- og:description publié / local : Location de jeux à Paris et en Île-de-France. Découvrez notre sélection Setup Paris. / Des jeux géants pour animer un stand, un salon, un séminaire, une soirée d'entreprise ou un plateau TV : panier de basketball, zig zag, stand de tir,
- og:image publié / local : https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&h=630&q=80 / —
- Images/alt publiés : Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant; Photo produit : 1777543737980-j52rup.jpg → Plinko; Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf; Photo produit : 1777539884880-6v9tpq.png → Stand de Tir; Photo produit : 1777544265578-g6rq7n.png → Zig Zag; Photo produit : 1777546178517-4sdg4e.jpg → Chamboule-tout; Photo produit : 1777539739806-lk7ch3.png → Table de Blackjack
- Images/alt locaux : Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball — Jeux; Photo produit : 1777543043347-ze8rul.png → Cornhole — Jeux; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant — Jeux; Photo produit : 1777543737980-j52rup.jpg → Plinko — Jeux; Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf — Jeux; Photo produit : 1777539884880-6v9tpq.png → Stand de Tir — Jeux; Photo produit : 1777544265578-g6rq7n.png → Zig Zag — Jeux; Photo produit : 1777546178517-4sdg4e.jpg → Chamboule-tout — Jeux; Photo produit : 1777539739806-lk7ch3.png → Table de Blackjack — Jeux
- Liens internes publiés (9) : /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/plinko, /produit/mini-golf, /produit/stand-de-tir, /produit/zig-zag, /produit/chamboule-tout, /produit/table-de-blackjack
- Liens internes locaux (9) : /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/plinko, /produit/mini-golf, /produit/stand-de-tir, /produit/zig-zag, /produit/chamboule-tout, /produit/table-de-blackjack
- FAQPage : 4 questions/réponses, réponses présentes dans HTML initial.

### /categorie/mobilier

- Title publié : Mobilier — Location événementielle \| Setup Paris
- Description publiée : Location de mobilier à Paris et en Île-de-France. Découvrez notre sélection Setup Paris.
- Title local (48 car.) : Mobilier — Location événementielle \| Setup Paris
- Description locale (154 car.) : Le mobilier événementiel pour accueillir, servir et asseoir : bars droits et arrondis, tables, mange-debout, tabourets, poufs, cubes, banquettes, pupitres
- H1 : Mobilier
- Canonical publié / local : /categorie/mobilier / /categorie/mobilier
- Hreflang publié : fr=/categorie/mobilier, en=/en/categorie/mobilier, x-default=/categorie/mobilier
- Hreflang local : fr=/categorie/mobilier, en=/en/categorie/mobilier, x-default=/categorie/mobilier
- og:title publié / local : Mobilier — Location événementielle \| Setup Paris / Mobilier — Location événementielle \| Setup Paris
- og:description publié / local : Location de mobilier à Paris et en Île-de-France. Découvrez notre sélection Setup Paris. / Le mobilier événementiel pour accueillir, servir et asseoir : bars droits et arrondis, tables, mange-debout, tabourets, poufs, cubes, banquettes, pupitres
- og:image publié / local : https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&h=630&q=80 / —
- Images/alt publiés : Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur; Photo produit : 1777546380003-oqh8e9.png → Pouf / Assise; Photo produit : 1777544975776-65lgoj.png → Stèle Miroir; Photo produit : stele-ronde-pmma-1794598847008.png → Stèle ronde plexi; Photo produit : bar-droit-1794598847891.png → Bar droit; Photo produit : table-alu-1794598848306.png → Table aluminium; Photo produit : assise-cube-1794598848687.png → Assise cube; Photo produit : banquette-droite-1794598849134.png → Banquette droite; Photo produit : pupitre-plexi-noir-1794598849721.png → Pupitre plexi caisson noir; Photo produit : pupitre-ceremonie-1794598850211.png → Pupitre de cérémonie; Photo produit : pupitre-colonnes-1794598850650.png → Pupitre à colonnes; Photo produit : tabouret-atelier-1794598851137.png → Tabouret haut d'atelier; Photo produit : dj-booth-1794598851542.png → DJ booth
- Images/alt locaux : Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier; Photo produit : 1777544975776-65lgoj.png → Stèle Miroir — Mobilier; Photo produit : 1777546380003-oqh8e9.png → Pouf / Assise — Mobilier; Photo produit : stele-ronde-pmma-1794598847008.png → Stèle ronde plexi — Mobilier; Photo produit : bar-droit-1794598847891.png → Bar droit — Mobilier; Photo produit : table-alu-1794598848306.png → Table aluminium — Mobilier; Photo produit : assise-cube-1794598848687.png → Assise cube — Mobilier; Photo produit : banquette-droite-1794598849134.png → Banquette droite — Mobilier; Photo produit : pupitre-plexi-noir-1794598849721.png → Pupitre plexi caisson noir — Mobilier; Photo produit : pupitre-ceremonie-1794598850211.png → Pupitre de cérémonie — Mobilier; Photo produit : pupitre-colonnes-1794598850650.png → Pupitre à colonnes — Mobilier; Photo produit : tabouret-atelier-1794598851137.png → Tabouret haut d'atelier — Mobilier; Photo produit : dj-booth-1794598851542.png → DJ booth — Mobilier
- Liens internes publiés (16) : /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur, /produit/pouf, /produit/stele-miroir, /produit/stele-ronde-pmma, /produit/bar-droit, /produit/table-alu, /produit/assise-cube, /produit/banquette-droite, /produit/pupitre-plexi-noir, /produit/pupitre-ceremonie, /produit/pupitre-colonnes, /produit/tabouret-atelier, /produit/dj-booth
- Liens internes locaux (16) : /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur, /produit/stele-miroir, /produit/pouf, /produit/stele-ronde-pmma, /produit/bar-droit, /produit/table-alu, /produit/assise-cube, /produit/banquette-droite, /produit/pupitre-plexi-noir, /produit/pupitre-ceremonie, /produit/pupitre-colonnes, /produit/tabouret-atelier, /produit/dj-booth
- FAQPage : 5 questions/réponses, réponses présentes dans HTML initial.

### /categorie/signaletique

- Title publié : Signalétique — Location événementielle \| Setup Paris
- Description publiée : Location de signalétique à Paris et en Île-de-France. Découvrez notre sélection Setup Paris.
- Title local (52 car.) : Signalétique — Location événementielle \| Setup Paris
- Description locale (148 car.) : La signalétique et les éléments de marque qui portent votre message : châssis à bâche imprimée tendue pour fonds de marque et photocalls, balançoire
- H1 : Signalétique
- Canonical publié / local : /categorie/signaletique / /categorie/signaletique
- Hreflang publié : fr=/categorie/signaletique, en=/en/categorie/signaletique, x-default=/categorie/signaletique
- Hreflang local : fr=/categorie/signaletique, en=/en/categorie/signaletique, x-default=/categorie/signaletique
- og:title publié / local : Signalétique — Location événementielle \| Setup Paris / Signalétique — Location événementielle \| Setup Paris
- og:description publié / local : Location de signalétique à Paris et en Île-de-France. Découvrez notre sélection Setup Paris. / La signalétique et les éléments de marque qui portent votre message : châssis à bâche imprimée tendue pour fonds de marque et photocalls, balançoire
- og:image publié / local : https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&h=630&q=80 / —
- Images/alt publiés : Photo produit : 1777547928218-y3xuzi.png → PhotoBooth Balançoire; Photo produit : chassis-imprime-1794598846331.png → Châssis imprimé
- Images/alt locaux : Photo produit : 1777547928218-y3xuzi.png → PhotoBooth Balançoire — Signalétique; Photo produit : chassis-imprime-1794598846331.png → Châssis imprimé — Signalétique
- Liens internes publiés (2) : /produit/photobooth-balancoire, /produit/chassis-imprime
- Liens internes locaux (2) : /produit/photobooth-balancoire, /produit/chassis-imprime
- FAQPage : 4 questions/réponses, réponses présentes dans HTML initial.

### /categorie/structures

- Title publié : Structures — Location événementielle \| Setup Paris
- Description publiée : Location de structures à Paris et en Île-de-France. Découvrez notre sélection Setup Paris.
- Title local (50 car.) : Structures — Location événementielle \| Setup Paris
- Description locale (146 car.) : Les structures qui construisent un espace : praticables Samia et praticables sur pieds pour les scènes et estrades, podiums ronds, murs et châssis
- H1 : Structures
- Canonical publié / local : /categorie/structures / /categorie/structures
- Hreflang publié : fr=/categorie/structures, en=/en/categorie/structures, x-default=/categorie/structures
- Hreflang local : fr=/categorie/structures, en=/en/categorie/structures, x-default=/categorie/structures
- og:title publié / local : Structures — Location événementielle \| Setup Paris / Structures — Location événementielle \| Setup Paris
- og:description publié / local : Location de structures à Paris et en Île-de-France. Découvrez notre sélection Setup Paris. / Les structures qui construisent un espace : praticables Samia et praticables sur pieds pour les scènes et estrades, podiums ronds, murs et châssis
- og:image publié / local : https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&h=630&q=80 / —
- Images/alt publiés : Photo produit : 1780642935830-p7n1l2.png → Praticable Samia; Photo produit : auvent.png → Auvent Personnalisable; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté; Photo produit : mur-autoporte-1794598844256.png → Mur autoporté; Photo produit : cimaise-sur-platine-1794598844903.png → Cimaise sur platine; Photo produit : chassis-borgniole-noir-5m2-1794598845390.png → Châssis borgniolé noir — grand; Photo produit : chassis-borgniole-noir-2m2-1794598845844.png → Châssis borgniolé noir — bandeau; Photo produit : mirolege-1794598851939.png → Mirolège; Photo produit : box-cabine-1794598852335.png → Box cabine; Photo produit : podium-rond-1794600085097.png → Podium rond
- Images/alt locaux : Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : auvent.png → Auvent Personnalisable — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté — Structures; Photo produit : mur-autoporte-1794598844256.png → Mur autoporté — Structures; Photo produit : cimaise-sur-platine-1794598844903.png → Cimaise sur platine — Structures; Photo produit : chassis-borgniole-noir-5m2-1794598845390.png → Châssis borgniolé noir — grand — Structures; Photo produit : chassis-borgniole-noir-2m2-1794598845844.png → Châssis borgniolé noir — bandeau — Structures; Photo produit : mirolege-1794598851939.png → Mirolège — Structures; Photo produit : box-cabine-1794598852335.png → Box cabine — Structures; Photo produit : podium-rond-1794600085097.png → Podium rond — Structures
- Liens internes publiés (11) : /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte, /produit/mur-autoporte, /produit/cimaise-sur-platine, /produit/chassis-borgniole-noir-5m2, /produit/chassis-borgniole-noir-2m2, /produit/mirolege, /produit/box-cabine, /produit/podium-rond
- Liens internes locaux (11) : /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte, /produit/mur-autoporte, /produit/cimaise-sur-platine, /produit/chassis-borgniole-noir-5m2, /produit/chassis-borgniole-noir-2m2, /produit/mirolege, /produit/box-cabine, /produit/podium-rond
- FAQPage : 5 questions/réponses, réponses présentes dans HTML initial.

### /cgl

- Title publié : Conditions générales de location — Setup Paris
- Description publiée : Conditions générales de location de mobilier et d'objets événementiels Setup Paris (Smart Restructuring).
- Title local (46 car.) : Conditions générales de location — Setup Paris
- Description locale (105 car.) : Conditions générales de location de mobilier et d'objets événementiels Setup Paris (Smart Restructuring).
- H1 : Conditions générales de location
- Canonical publié / local : /cgl / /cgl
- Hreflang publié : fr=/cgl, en=/en/cgl, x-default=/cgl
- Hreflang local : fr=/cgl, en=/en/cgl, x-default=/cgl
- og:title publié / local : Conditions générales de location — Setup Paris / Conditions générales de location — Setup Paris
- og:description publié / local : Conditions générales de location de mobilier et d'objets événementiels Setup Paris. / Conditions générales de location de mobilier et d'objets événementiels Setup Paris.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /
- Liens internes locaux (1) : /

### /contact

- Title publié : Contact — Setup Paris, location d'objets événementiels
- Description publiée : Contactez Setup Paris pour vos locations d'objets et jeux événementiels à Paris et en Île-de-France : téléphone, mail et formulaire.
- Title local (54 car.) : Contact — Setup Paris, location d'objets événementiels
- Description locale (132 car.) : Contactez Setup Paris pour vos locations d'objets et jeux événementiels à Paris et en Île-de-France : téléphone, mail et formulaire.
- H1 : Parlons de votre événement
- Canonical publié / local : /contact / /contact
- Hreflang publié : fr=/contact, en=/en/contact, x-default=/contact
- Hreflang local : fr=/contact, en=/en/contact, x-default=/contact
- og:title publié / local : Contact — Setup Paris, location d'objets événementiels / Contact — Setup Paris, location d'objets événementiels
- og:description publié / local : Une question sur une location événementielle ? Écrivez-nous ou appelez-nous. / Une question sur une location événementielle ? Écrivez-nous ou appelez-nous.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /mentions-legales
- Liens internes locaux (1) : /mentions-legales

### /devis

- Title publié : Ma demande — Setup Paris
- Description publiée : Ma demande : demande de devis en ligne, réponse sous 24 h ouvrées. Livraison, installation et reprise : forfait indicatif pour Paris et l'Île-de-France, confirmé par devis.
- Title local (33 car.) : Ma demande de devis — Setup Paris
- Description locale (141 car.) : Votre demande de devis Setup Paris : location événementielle, livraison, installation et reprise en Île-de-France. Réponse sous 24 h ouvrées.
- H1 : Ma demande
- Canonical publié / local : /devis / /devis
- Hreflang publié : fr=/devis, en=/en/devis, x-default=/devis
- Hreflang local : fr=/devis, en=/en/devis, x-default=/devis
- og:title publié / local : Ma demande — Setup Paris / Ma demande de devis — Setup Paris
- og:description publié / local : Demande de devis en ligne, réponse sous 24 h ouvrées. / Demande de devis en ligne, réponse sous 24 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball
- Images/alt locaux : Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball — Jeux
- Liens internes publiés (6) : /catalogue, /contact, /produit/bar-arrondi, /produit/podium, /produit/samias, /produit/panier-basketball
- Liens internes locaux (6) : /catalogue, /contact, /produit/bar-arrondi, /produit/podium, /produit/samias, /produit/panier-basketball

### /en

- Title publié : Setup Paris — Event object rentals in Paris
- Description publiée : Customize, configure, rent. A catalogue of event objects with a 3D configurator: games, structures, signage, decor and furniture in Paris.
- Title local (43 car.) : Setup Paris — Event object rentals in Paris
- Description locale (138 car.) : Customize, configure, rent. A catalogue of event objects with a 3D configurator: games, structures, signage, decor and furniture in Paris.
- H1 : Event object rentals
- Canonical publié / local : /en / /en
- Hreflang publié : fr=/, en=/en, x-default=/
- Hreflang local : fr=/, en=/en, x-default=/
- og:title publié / local : Setup Paris — Event object rentals in Paris / Setup Paris — Event object rentals in Paris
- og:description publié / local : Customize, configure, rent. / Customize, configure, rent.
- og:image publié / local : https://setup-paris-configurators.netlify.app/setup-paris-presentation-poster.jpg / —
- Images/alt publiés : /assets/setup-hero-_U2Jrokk.jpg → Installation événementielle Setup Paris — rideau bleu Yonex Player Support; /assets/louis-vuitton-BrPrP0Xf.png → Louis Vuitton; /assets/hermes-CFe9XdrF.png → Hermès; /assets/canal-plus-fw-ow8gF.png → Canal+; /assets/france-tv-DYCqhjwG.png → France.tv; /assets/bbc-zk0HoPFi.png → BBC; /assets/warner-aiI9IKIZ.png → Warner Bros; /assets/m6-gDuebj9i.png → M6
- Images/alt locaux : /src/assets/hero/setup-hero.jpg → Installation événementielle Setup Paris — rideau bleu Yonex Player Support; https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=70 → Games; https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=70 → Structures; https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=70 → Signage; https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=70 → Decoration; https://images.unsplash.com/photo-1519302959554-a75be0afc82a?auto=format&fit=crop&w=800&q=70 → Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop — Games; Photo produit : 1777543043347-ze8rul.png → Cornhole — Games; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4 — Games; Photo produit : 1777543737980-j52rup.jpg → Plinko — Games; Photo produit : 1777542191380-3w77wj.jpg → Mini Golf — Games; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop — Games; Photo produit : 1777543043347-ze8rul.png → Cornhole — Games; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4 — Games; Photo produit : 1777543737980-j52rup.jpg → Plinko — Games; Photo produit : 1777542191380-3w77wj.jpg → Mini Golf — Games; /src/assets/clients/louis-vuitton.png → Louis Vuitton; /src/assets/clients/hermes.png → Hermès; /src/assets/clients/canal-plus.png → Canal+; /src/assets/clients/france-tv.png → France.tv; /src/assets/clients/bbc.png → BBC; /src/assets/clients/warner.png → Warner Bros; /src/assets/clients/m6.png → M6
- Liens internes publiés (6) : /en/catalogue, /en/sur-mesure
- Liens internes locaux (28) : /en/catalogue, /en/sur-mesure, /en/categorie/jeux, /en/categorie/structures, /en/categorie/signaletique, /en/categorie/decoration, /en/categorie/mobilier, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/samias, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko, /en/produit/mini-golf

### /en/catalogue

- Title publié : Catalogue — Setup Paris event rentals
- Description publiée : Browse our rental catalogue: games, structures, signage, decor and event furniture in Paris and Île-de-France.
- Title local (37 car.) : Catalogue — Setup Paris event rentals
- Description locale (110 car.) : Browse our rental catalogue: games, structures, signage, decor and event furniture in Paris and Île-de-France.
- H1 : Catalog
- Canonical publié / local : /en/catalogue / /en/catalogue
- Hreflang publié : fr=/catalogue, en=/en/catalogue, x-default=/catalogue
- Hreflang local : fr=/catalogue, en=/en/catalogue, x-default=/catalogue
- og:title publié / local : Catalogue — Setup Paris event rentals / Catalogue — Setup Paris event rentals
- og:description publié / local : Our catalogue of event objects. / Our catalogue of event objects.
- og:image publié / local : https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&h=630&q=80 / —
- Images/alt publiés : Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4; Photo produit : 1777543737980-j52rup.jpg → Plinko; Photo produit : 1777542191380-3w77wj.jpg → Mini Golf; Photo produit : 1777539884880-6v9tpq.png → Shooting Stand; Photo produit : auvent.png → Customizable Awning; Photo produit : 1777544265578-g6rq7n.png → Zig Zag; Photo produit : 1777546178517-4sdg4e.jpg → Tin Can Alley; Photo produit : 1777539739806-lk7ch3.png → Blackjack Table; Photo produit : lettres-geantes.jpg → Giant Letters; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike; Photo produit : 1777546380003-oqh8e9.png → Pouf / Seat; Photo produit : 1777544975776-65lgoj.png → Mirror Plinth; Photo produit : 1777547928218-y3xuzi.png → Swing PhotoBooth; Photo produit : 1780640879229-lu39vb.jpeg → Welcome Stele; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel; Photo produit : mur-autoporte-1794598844256.png → Freestanding wall; Photo produit : cimaise-sur-platine-1794598844903.png → Display panel on base plate; Photo produit : chassis-borgniole-noir-5m2-1794598845390.png → Black-out frame — large; Photo produit : chassis-borgniole-noir-2m2-1794598845844.png → Black-out frame — strip; Photo produit : chassis-imprime-1794598846331.png → Printed frame; Photo produit : stele-ronde-pmma-1794598847008.png → Round acrylic plinth; Photo produit : bar-droit-1794598847891.png → Straight bar; Photo produit : table-alu-1794598848306.png → Aluminium table; Photo produit : assise-cube-1794598848687.png → Cube seat; Photo produit : banquette-droite-1794598849134.png → Straight bench; Photo produit : pupitre-plexi-noir-1794598849721.png → Acrylic lectern, black base; Photo produit : pupitre-ceremonie-1794598850211.png → Ceremony lectern; Photo produit : pupitre-colonnes-1794598850650.png → Column lectern; Photo produit : tabouret-atelier-1794598851137.png → Workshop high stool; Photo produit : dj-booth-1794598851542.png → DJ booth; Photo produit : mirolege-1794598851939.png → Mirolège mirror panel; Photo produit : box-cabine-1794598852335.png → Booth cabin; Photo produit : podium-rond-1794600085097.png → Round podium
- Images/alt locaux : Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop — Games; Photo produit : 1777543043347-ze8rul.png → Cornhole — Games; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4 — Games; Photo produit : 1777543737980-j52rup.jpg → Plinko — Games; Photo produit : 1777542191380-3w77wj.jpg → Mini Golf — Games; Photo produit : 1777539884880-6v9tpq.png → Shooting Stand — Games; Photo produit : auvent.png → Customizable Awning — Structures; Photo produit : 1777544265578-g6rq7n.png → Zig Zag — Games; Photo produit : 1777546178517-4sdg4e.jpg → Tin Can Alley — Games; Photo produit : 1777539739806-lk7ch3.png → Blackjack Table — Games; Photo produit : lettres-geantes.jpg → Giant Letters — Decoration; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture; Photo produit : 1777544975776-65lgoj.png → Mirror Plinth — Furniture; Photo produit : 1777546380003-oqh8e9.png → Pouf / Seat — Furniture; Photo produit : 1777547928218-y3xuzi.png → Swing PhotoBooth — Signage; Photo produit : 1780640879229-lu39vb.jpeg → Welcome Stele — Decoration; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel — Structures; Photo produit : mur-autoporte-1794598844256.png → Freestanding wall — Structures; Photo produit : cimaise-sur-platine-1794598844903.png → Display panel on base plate — Structures; Photo produit : chassis-borgniole-noir-5m2-1794598845390.png → Black-out frame — large — Structures; Photo produit : chassis-borgniole-noir-2m2-1794598845844.png → Black-out frame — strip — Structures; Photo produit : chassis-imprime-1794598846331.png → Printed frame — Signage; Photo produit : stele-ronde-pmma-1794598847008.png → Round acrylic plinth — Furniture; Photo produit : bar-droit-1794598847891.png → Straight bar — Furniture; Photo produit : table-alu-1794598848306.png → Aluminium table — Furniture; Photo produit : assise-cube-1794598848687.png → Cube seat — Furniture; Photo produit : banquette-droite-1794598849134.png → Straight bench — Furniture; Photo produit : pupitre-plexi-noir-1794598849721.png → Acrylic lectern, black base — Furniture; Photo produit : pupitre-ceremonie-1794598850211.png → Ceremony lectern — Furniture; Photo produit : pupitre-colonnes-1794598850650.png → Column lectern — Furniture; Photo produit : tabouret-atelier-1794598851137.png → Workshop high stool — Furniture; Photo produit : dj-booth-1794598851542.png → DJ booth — Furniture; Photo produit : mirolege-1794598851939.png → Mirolège mirror panel — Structures; Photo produit : box-cabine-1794598852335.png → Booth cabin — Structures; Photo produit : podium-rond-1794600085097.png → Round podium — Structures
- Liens internes publiés (40) : /en/produit/bar-arrondi, /en/produit/podium, /en/produit/samias, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko, /en/produit/mini-golf, /en/produit/stand-de-tir, /en/produit/auvent, /en/produit/zig-zag, /en/produit/chamboule-tout, /en/produit/table-de-blackjack, /en/produit/lettres-geantes, /en/produit/mange-debout, /en/produit/triporteur, /en/produit/pouf, /en/produit/stele-miroir, /en/produit/photobooth-balancoire, /en/produit/stele, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte, /en/produit/mur-autoporte, /en/produit/cimaise-sur-platine, /en/produit/chassis-borgniole-noir-5m2, /en/produit/chassis-borgniole-noir-2m2, /en/produit/chassis-imprime, /en/produit/stele-ronde-pmma, /en/produit/bar-droit, /en/produit/table-alu, /en/produit/assise-cube, /en/produit/banquette-droite, /en/produit/pupitre-plexi-noir, /en/produit/pupitre-ceremonie, /en/produit/pupitre-colonnes, /en/produit/tabouret-atelier, /en/produit/dj-booth, /en/produit/mirolege, /en/produit/box-cabine, /en/produit/podium-rond
- Liens internes locaux (40) : /en/produit/bar-arrondi, /en/produit/podium, /en/produit/samias, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko, /en/produit/mini-golf, /en/produit/stand-de-tir, /en/produit/auvent, /en/produit/zig-zag, /en/produit/chamboule-tout, /en/produit/table-de-blackjack, /en/produit/lettres-geantes, /en/produit/mange-debout, /en/produit/triporteur, /en/produit/stele-miroir, /en/produit/pouf, /en/produit/photobooth-balancoire, /en/produit/stele, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte, /en/produit/mur-autoporte, /en/produit/cimaise-sur-platine, /en/produit/chassis-borgniole-noir-5m2, /en/produit/chassis-borgniole-noir-2m2, /en/produit/chassis-imprime, /en/produit/stele-ronde-pmma, /en/produit/bar-droit, /en/produit/table-alu, /en/produit/assise-cube, /en/produit/banquette-droite, /en/produit/pupitre-plexi-noir, /en/produit/pupitre-ceremonie, /en/produit/pupitre-colonnes, /en/produit/tabouret-atelier, /en/produit/dj-booth, /en/produit/mirolege, /en/produit/box-cabine, /en/produit/podium-rond

### /en/categorie/decoration

- Title publié : Decoration — Event rental \| Setup Paris
- Description publiée : Decoration for hire in Paris and Île-de-France. Discover the Setup Paris selection.
- Title local (40 car.) : Decoration — Event rentals \| Setup Paris
- Description locale (153 car.) : Decor that showcases: square wooden plinths to present a product or information, and giant 3D letters to spell out a name or a word. Simple volumes whose
- H1 : Decoration
- Canonical publié / local : /en/categorie/decoration / /en/categorie/decoration
- Hreflang publié : fr=/categorie/decoration, en=/en/categorie/decoration, x-default=/categorie/decoration
- Hreflang local : fr=/categorie/decoration, en=/en/categorie/decoration, x-default=/categorie/decoration
- og:title publié / local : Decoration — Event rental \| Setup Paris / Decoration — Event rentals \| Setup Paris
- og:description publié / local : Decoration for hire in Paris and Île-de-France. Discover the Setup Paris selection. / Decor that showcases: square wooden plinths to present a product or information, and giant 3D letters to spell out a name or a word. Simple volumes whose
- og:image publié / local : https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&h=630&q=80 / —
- Images/alt publiés : Photo produit : lettres-geantes.jpg → Giant Letters; Photo produit : 1780640879229-lu39vb.jpeg → Welcome Stele
- Images/alt locaux : Photo produit : lettres-geantes.jpg → Giant Letters — Decoration; Photo produit : 1780640879229-lu39vb.jpeg → Welcome Stele — Decoration
- Liens internes publiés (2) : /en/produit/lettres-geantes, /en/produit/stele
- Liens internes locaux (2) : /en/produit/lettres-geantes, /en/produit/stele
- FAQPage : 4 questions/réponses, réponses présentes dans HTML initial.

### /en/categorie/jeux

- Title publié : Games — Event rental \| Setup Paris
- Description publiée : Games for hire in Paris and Île-de-France. Discover the Setup Paris selection.
- Title local (35 car.) : Games — Event rentals \| Setup Paris
- Description locale (155 car.) : Giant games to liven up a booth, a trade show, a corporate retreat, a company party or a TV set: basketball hoop, zig zag, shooting gallery, mini golf, tin
- H1 : Games
- Canonical publié / local : /en/categorie/jeux / /en/categorie/jeux
- Hreflang publié : fr=/categorie/jeux, en=/en/categorie/jeux, x-default=/categorie/jeux
- Hreflang local : fr=/categorie/jeux, en=/en/categorie/jeux, x-default=/categorie/jeux
- og:title publié / local : Games — Event rental \| Setup Paris / Games — Event rentals \| Setup Paris
- og:description publié / local : Games for hire in Paris and Île-de-France. Discover the Setup Paris selection. / Giant games to liven up a booth, a trade show, a corporate retreat, a company party or a TV set: basketball hoop, zig zag, shooting gallery, mini golf, tin
- og:image publié / local : https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&h=630&q=80 / —
- Images/alt publiés : Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4; Photo produit : 1777543737980-j52rup.jpg → Plinko; Photo produit : 1777542191380-3w77wj.jpg → Mini Golf; Photo produit : 1777539884880-6v9tpq.png → Shooting Stand; Photo produit : 1777544265578-g6rq7n.png → Zig Zag; Photo produit : 1777546178517-4sdg4e.jpg → Tin Can Alley; Photo produit : 1777539739806-lk7ch3.png → Blackjack Table
- Images/alt locaux : Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop — Games; Photo produit : 1777543043347-ze8rul.png → Cornhole — Games; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4 — Games; Photo produit : 1777543737980-j52rup.jpg → Plinko — Games; Photo produit : 1777542191380-3w77wj.jpg → Mini Golf — Games; Photo produit : 1777539884880-6v9tpq.png → Shooting Stand — Games; Photo produit : 1777544265578-g6rq7n.png → Zig Zag — Games; Photo produit : 1777546178517-4sdg4e.jpg → Tin Can Alley — Games; Photo produit : 1777539739806-lk7ch3.png → Blackjack Table — Games
- Liens internes publiés (9) : /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko, /en/produit/mini-golf, /en/produit/stand-de-tir, /en/produit/zig-zag, /en/produit/chamboule-tout, /en/produit/table-de-blackjack
- Liens internes locaux (9) : /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko, /en/produit/mini-golf, /en/produit/stand-de-tir, /en/produit/zig-zag, /en/produit/chamboule-tout, /en/produit/table-de-blackjack
- FAQPage : 4 questions/réponses, réponses présentes dans HTML initial.

### /en/categorie/mobilier

- Title publié : Furniture — Event rental \| Setup Paris
- Description publiée : Furniture for hire in Paris and Île-de-France. Discover the Setup Paris selection.
- Title local (39 car.) : Furniture — Event rentals \| Setup Paris
- Description locale (155 car.) : Event furniture to welcome, serve and seat: straight and curved bars, tables, high tables, stools, poufs, cubes, benches, conference and ceremony lecterns,
- H1 : Furniture
- Canonical publié / local : /en/categorie/mobilier / /en/categorie/mobilier
- Hreflang publié : fr=/categorie/mobilier, en=/en/categorie/mobilier, x-default=/categorie/mobilier
- Hreflang local : fr=/categorie/mobilier, en=/en/categorie/mobilier, x-default=/categorie/mobilier
- og:title publié / local : Furniture — Event rental \| Setup Paris / Furniture — Event rentals \| Setup Paris
- og:description publié / local : Furniture for hire in Paris and Île-de-France. Discover the Setup Paris selection. / Event furniture to welcome, serve and seat: straight and curved bars, tables, high tables, stools, poufs, cubes, benches, conference and ceremony lecterns,
- og:image publié / local : https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&h=630&q=80 / —
- Images/alt publiés : Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike; Photo produit : 1777546380003-oqh8e9.png → Pouf / Seat; Photo produit : 1777544975776-65lgoj.png → Mirror Plinth; Photo produit : stele-ronde-pmma-1794598847008.png → Round acrylic plinth; Photo produit : bar-droit-1794598847891.png → Straight bar; Photo produit : table-alu-1794598848306.png → Aluminium table; Photo produit : assise-cube-1794598848687.png → Cube seat; Photo produit : banquette-droite-1794598849134.png → Straight bench; Photo produit : pupitre-plexi-noir-1794598849721.png → Acrylic lectern, black base; Photo produit : pupitre-ceremonie-1794598850211.png → Ceremony lectern; Photo produit : pupitre-colonnes-1794598850650.png → Column lectern; Photo produit : tabouret-atelier-1794598851137.png → Workshop high stool; Photo produit : dj-booth-1794598851542.png → DJ booth
- Images/alt locaux : Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture; Photo produit : 1777544975776-65lgoj.png → Mirror Plinth — Furniture; Photo produit : 1777546380003-oqh8e9.png → Pouf / Seat — Furniture; Photo produit : stele-ronde-pmma-1794598847008.png → Round acrylic plinth — Furniture; Photo produit : bar-droit-1794598847891.png → Straight bar — Furniture; Photo produit : table-alu-1794598848306.png → Aluminium table — Furniture; Photo produit : assise-cube-1794598848687.png → Cube seat — Furniture; Photo produit : banquette-droite-1794598849134.png → Straight bench — Furniture; Photo produit : pupitre-plexi-noir-1794598849721.png → Acrylic lectern, black base — Furniture; Photo produit : pupitre-ceremonie-1794598850211.png → Ceremony lectern — Furniture; Photo produit : pupitre-colonnes-1794598850650.png → Column lectern — Furniture; Photo produit : tabouret-atelier-1794598851137.png → Workshop high stool — Furniture; Photo produit : dj-booth-1794598851542.png → DJ booth — Furniture
- Liens internes publiés (16) : /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur, /en/produit/pouf, /en/produit/stele-miroir, /en/produit/stele-ronde-pmma, /en/produit/bar-droit, /en/produit/table-alu, /en/produit/assise-cube, /en/produit/banquette-droite, /en/produit/pupitre-plexi-noir, /en/produit/pupitre-ceremonie, /en/produit/pupitre-colonnes, /en/produit/tabouret-atelier, /en/produit/dj-booth
- Liens internes locaux (16) : /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur, /en/produit/stele-miroir, /en/produit/pouf, /en/produit/stele-ronde-pmma, /en/produit/bar-droit, /en/produit/table-alu, /en/produit/assise-cube, /en/produit/banquette-droite, /en/produit/pupitre-plexi-noir, /en/produit/pupitre-ceremonie, /en/produit/pupitre-colonnes, /en/produit/tabouret-atelier, /en/produit/dj-booth
- FAQPage : 5 questions/réponses, réponses présentes dans HTML initial.

### /en/categorie/signaletique

- Title publié : Signage — Event rental \| Setup Paris
- Description publiée : Signage for hire in Paris and Île-de-France. Discover the Setup Paris selection.
- Title local (37 car.) : Signage — Event rentals \| Setup Paris
- Description locale (154 car.) : Signage and brand elements that carry your message: frames with stretched printed banners for brand backdrops and photo walls, and a fully printable swing
- H1 : Signage
- Canonical publié / local : /en/categorie/signaletique / /en/categorie/signaletique
- Hreflang publié : fr=/categorie/signaletique, en=/en/categorie/signaletique, x-default=/categorie/signaletique
- Hreflang local : fr=/categorie/signaletique, en=/en/categorie/signaletique, x-default=/categorie/signaletique
- og:title publié / local : Signage — Event rental \| Setup Paris / Signage — Event rentals \| Setup Paris
- og:description publié / local : Signage for hire in Paris and Île-de-France. Discover the Setup Paris selection. / Signage and brand elements that carry your message: frames with stretched printed banners for brand backdrops and photo walls, and a fully printable swing
- og:image publié / local : https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&h=630&q=80 / —
- Images/alt publiés : Photo produit : 1777547928218-y3xuzi.png → Swing PhotoBooth; Photo produit : chassis-imprime-1794598846331.png → Printed frame
- Images/alt locaux : Photo produit : 1777547928218-y3xuzi.png → Swing PhotoBooth — Signage; Photo produit : chassis-imprime-1794598846331.png → Printed frame — Signage
- Liens internes publiés (2) : /en/produit/photobooth-balancoire, /en/produit/chassis-imprime
- Liens internes locaux (2) : /en/produit/photobooth-balancoire, /en/produit/chassis-imprime
- FAQPage : 4 questions/réponses, réponses présentes dans HTML initial.

### /en/categorie/structures

- Title publié : Structures — Event rental \| Setup Paris
- Description publiée : Structures for hire in Paris and Île-de-France. Discover the Setup Paris selection.
- Title local (40 car.) : Structures — Event rentals \| Setup Paris
- Description locale (153 car.) : Structures that build a space: Samia and leg-mounted stage risers for stages and platforms, round podiums, freestanding walls and panels, display panels,
- H1 : Structures
- Canonical publié / local : /en/categorie/structures / /en/categorie/structures
- Hreflang publié : fr=/categorie/structures, en=/en/categorie/structures, x-default=/categorie/structures
- Hreflang local : fr=/categorie/structures, en=/en/categorie/structures, x-default=/categorie/structures
- og:title publié / local : Structures — Event rental \| Setup Paris / Structures — Event rentals \| Setup Paris
- og:description publié / local : Structures for hire in Paris and Île-de-France. Discover the Setup Paris selection. / Structures that build a space: Samia and leg-mounted stage risers for stages and platforms, round podiums, freestanding walls and panels, display panels,
- og:image publié / local : https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&h=630&q=80 / —
- Images/alt publiés : Photo produit : 1780642935830-p7n1l2.png → Samia stage riser; Photo produit : auvent.png → Customizable Awning; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel; Photo produit : mur-autoporte-1794598844256.png → Freestanding wall; Photo produit : cimaise-sur-platine-1794598844903.png → Display panel on base plate; Photo produit : chassis-borgniole-noir-5m2-1794598845390.png → Black-out frame — large; Photo produit : chassis-borgniole-noir-2m2-1794598845844.png → Black-out frame — strip; Photo produit : mirolege-1794598851939.png → Mirolège mirror panel; Photo produit : box-cabine-1794598852335.png → Booth cabin; Photo produit : podium-rond-1794600085097.png → Round podium
- Images/alt locaux : Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : auvent.png → Customizable Awning — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel — Structures; Photo produit : mur-autoporte-1794598844256.png → Freestanding wall — Structures; Photo produit : cimaise-sur-platine-1794598844903.png → Display panel on base plate — Structures; Photo produit : chassis-borgniole-noir-5m2-1794598845390.png → Black-out frame — large — Structures; Photo produit : chassis-borgniole-noir-2m2-1794598845844.png → Black-out frame — strip — Structures; Photo produit : mirolege-1794598851939.png → Mirolège mirror panel — Structures; Photo produit : box-cabine-1794598852335.png → Booth cabin — Structures; Photo produit : podium-rond-1794600085097.png → Round podium — Structures
- Liens internes publiés (11) : /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte, /en/produit/mur-autoporte, /en/produit/cimaise-sur-platine, /en/produit/chassis-borgniole-noir-5m2, /en/produit/chassis-borgniole-noir-2m2, /en/produit/mirolege, /en/produit/box-cabine, /en/produit/podium-rond
- Liens internes locaux (11) : /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte, /en/produit/mur-autoporte, /en/produit/cimaise-sur-platine, /en/produit/chassis-borgniole-noir-5m2, /en/produit/chassis-borgniole-noir-2m2, /en/produit/mirolege, /en/produit/box-cabine, /en/produit/podium-rond
- FAQPage : 5 questions/réponses, réponses présentes dans HTML initial.

### /en/cgl

- Title publié : General rental terms — Setup Paris
- Description publiée : General terms for renting event furniture and objects from Setup Paris (Smart Restructuring).
- Title local (34 car.) : General rental terms — Setup Paris
- Description locale (93 car.) : General terms for renting event furniture and objects from Setup Paris (Smart Restructuring).
- H1 : General rental terms and conditions
- Canonical publié / local : /en/cgl / /en/cgl
- Hreflang publié : fr=/cgl, en=/en/cgl, x-default=/cgl
- Hreflang local : fr=/cgl, en=/en/cgl, x-default=/cgl
- og:title publié / local : General rental terms — Setup Paris / General rental terms — Setup Paris
- og:description publié / local : General terms for renting event furniture and objects from Setup Paris. / General terms for renting event furniture and objects from Setup Paris.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en
- Liens internes locaux (1) : /en

### /en/contact

- Title publié : Contact — Setup Paris, event object rentals
- Description publiée : Contact Setup Paris about event object and game rentals in Paris and Île-de-France: phone, email and contact form.
- Title local (43 car.) : Contact — Setup Paris, event object rentals
- Description locale (114 car.) : Contact Setup Paris about event object and game rentals in Paris and Île-de-France: phone, email and contact form.
- H1 : Let's talk about your event
- Canonical publié / local : /en/contact / /en/contact
- Hreflang publié : fr=/contact, en=/en/contact, x-default=/contact
- Hreflang local : fr=/contact, en=/en/contact, x-default=/contact
- og:title publié / local : Contact — Setup Paris, event object rentals / Contact — Setup Paris, event object rentals
- og:description publié / local : A question about an event rental? Write to us or call us. / A question about an event rental? Write to us or call us.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/mentions-legales
- Liens internes locaux (1) : /en/mentions-legales

### /en/devis

- Title publié : My request — Setup Paris
- Description publiée : My request: online quote request, reply within one business day. Delivery, setup and pickup: indicative flat fee for Paris & Île-de-France, confirmed in the quote.
- Title local (37 car.) : My event rental request — Setup Paris
- Description locale (137 car.) : Your Setup Paris event rental quotation: delivery, installation and collection in Paris and Île-de-France. Reply within one business day.
- H1 : My request
- Canonical publié / local : /en/devis / /en/devis
- Hreflang publié : fr=/devis, en=/en/devis, x-default=/devis
- Hreflang local : fr=/devis, en=/en/devis, x-default=/devis
- og:title publié / local : My request — Setup Paris / My event rental request — Setup Paris
- og:description publié / local : Online quote request, reply within one business day. / Online quote request, reply within one business day.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop
- Images/alt locaux : Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop — Games
- Liens internes publiés (6) : /en/catalogue, /en/contact, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/samias, /en/produit/panier-basketball
- Liens internes locaux (6) : /en/catalogue, /en/contact, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/samias, /en/produit/panier-basketball

### /en/mentions-legales

- Title publié : Legal notice — Setup Paris
- Description publiée : Legal notice and general terms of Smart Restructuring (Setup Paris): orders, payment, delivery, liability, GDPR.
- Title local (40 car.) : Legal notice and publisher — Setup Paris
- Description locale (112 car.) : Legal notice and general terms of Smart Restructuring (Setup Paris): orders, payment, delivery, liability, GDPR.
- H1 : Legal notice
- Canonical publié / local : /en/mentions-legales / /en/mentions-legales
- Hreflang publié : fr=/mentions-legales, en=/en/mentions-legales, x-default=/mentions-legales
- Hreflang local : fr=/mentions-legales, en=/en/mentions-legales, x-default=/mentions-legales
- og:title publié / local : Legal notice — Setup Paris / Legal notice and publisher — Setup Paris
- og:description publié / local : Legal notice of Setup Paris (Smart Restructuring). / Legal notice of Setup Paris (Smart Restructuring).
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (2) : /en, /en/cgl
- Liens internes locaux (2) : /en, /en/cgl

### /en/produit/assise-cube

- Title publié : Cube seat — Setup Paris
- Description publiée : 45 cm MDF cube, to use as a seat, a display or a decor element.
- Title local (39 car.) : Cube seat — Event rentals \| Setup Paris
- Description locale (149 car.) : 45 × 45 × 45 cm MDF cube: a simple seat, a display or a modular decor element. Available in large numbers to furnish a conference area, a lounge or a
- H1 : Cube seat
- Canonical publié / local : /en/produit/assise-cube / /en/produit/assise-cube
- Hreflang publié : fr=/produit/assise-cube, en=/en/produit/assise-cube, x-default=/produit/assise-cube
- Hreflang local : fr=/produit/assise-cube, en=/en/produit/assise-cube, x-default=/produit/assise-cube
- og:title publié / local : Cube seat — Setup Paris / Cube seat — Event rentals \| Setup Paris
- og:description publié / local : 45 cm MDF cube, to use as a seat, a display or a decor element. / 45 × 45 × 45 cm MDF cube: a simple seat, a display or a modular decor element. Available in large numbers to furnish a conference area, a lounge or a
- og:image publié / local : Photo produit : assise-cube-1794598848687.png / Photo produit : assise-cube-1794598848687.png (1200 px)
- Images/alt publiés : Photo produit : assise-cube-1794598848687.png → Cube seat; Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike
- Images/alt locaux : Photo produit : assise-cube-1794598848687.png → Cube seat — Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture
- Liens internes publiés (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Liens internes locaux (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Product local : description 324 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/auvent

- Title publié : Customizable Awning — Setup Paris
- Description publiée : Covered welcome structure for site entrance.
- Title local (49 car.) : Customizable Awning — Event rentals \| Setup Paris
- Description locale (153 car.) : Awning, a covered welcome structure to mark the entrance of a venue, an outdoor stand or an event village. Fabric, frame and base colours customisable on
- H1 : Customizable Awning
- Canonical publié / local : /en/produit/auvent / /en/produit/auvent
- Hreflang publié : fr=/produit/auvent, en=/en/produit/auvent, x-default=/produit/auvent
- Hreflang local : fr=/produit/auvent, en=/en/produit/auvent, x-default=/produit/auvent
- og:title publié / local : Customizable Awning — Setup Paris / Customizable Awning — Event rentals \| Setup Paris
- og:description publié / local : Covered welcome structure for site entrance. / Awning, a covered welcome structure to mark the entrance of a venue, an outdoor stand or an event village. Fabric, frame and base colours customisable on
- og:image publié / local : Photo produit : auvent.png / Photo produit : auvent.png (1200 px)
- Images/alt publiés : Photo produit : auvent.png → Customizable Awning; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel; Photo produit : mur-autoporte-1794598844256.png → Freestanding wall
- Images/alt locaux : Photo produit : auvent.png → Customizable Awning — Structures; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel — Structures; Photo produit : mur-autoporte-1794598844256.png → Freestanding wall — Structures
- Liens internes publiés (5) : /en/catalogue, /en/produit/samias, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte, /en/produit/mur-autoporte
- Liens internes locaux (5) : /en/catalogue, /en/produit/samias, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte, /en/produit/mur-autoporte
- Product local : description 267 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /en/produit/banquette-droite

- Title publié : Straight bench — Setup Paris
- Description publiée : 2 m bench for waiting, lounge or screening areas.
- Title local (44 car.) : Straight bench — Event rentals \| Setup Paris
- Description locale (152 car.) : Straight bench, 2 m long, 40 cm deep and 45 cm high, for waiting, lounge, screening or conference areas. Paint or fabric covering as an option. Quantity
- H1 : Straight bench
- Canonical publié / local : /en/produit/banquette-droite / /en/produit/banquette-droite
- Hreflang publié : fr=/produit/banquette-droite, en=/en/produit/banquette-droite, x-default=/produit/banquette-droite
- Hreflang local : fr=/produit/banquette-droite, en=/en/produit/banquette-droite, x-default=/produit/banquette-droite
- og:title publié / local : Straight bench — Setup Paris / Straight bench — Event rentals \| Setup Paris
- og:description publié / local : 2 m bench for waiting, lounge or screening areas. / Straight bench, 2 m long, 40 cm deep and 45 cm high, for waiting, lounge, screening or conference areas. Paint or fabric covering as an option. Quantity
- og:image publié / local : Photo produit : banquette-droite-1794598849134.png / Photo produit : banquette-droite-1794598849134.png (1200 px)
- Images/alt publiés : Photo produit : banquette-droite-1794598849134.png → Straight bench; Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike
- Images/alt locaux : Photo produit : banquette-droite-1794598849134.png → Straight bench — Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture
- Liens internes publiés (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Liens internes locaux (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Product local : description 256 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/bar-arrondi

- Title publié : curved bar — Setup Paris
- Description publiée : 2.8 m curved bar for reception or service, chrome or marble laminate finish on request.
- Title local (40 car.) : curved bar — Event rentals \| Setup Paris
- Description locale (149 car.) : 2.8 m curved bar for reception desks, catering service or cocktails. Its curved shape structures the space and makes service easier. Chrome or marble
- H1 : curved bar
- Canonical publié / local : /en/produit/bar-arrondi / /en/produit/bar-arrondi
- Hreflang publié : fr=/produit/bar-arrondi, en=/en/produit/bar-arrondi, x-default=/produit/bar-arrondi
- Hreflang local : fr=/produit/bar-arrondi, en=/en/produit/bar-arrondi, x-default=/produit/bar-arrondi
- og:title publié / local : curved bar — Setup Paris / curved bar — Event rentals \| Setup Paris
- og:description publié / local : 2.8 m curved bar for reception or service, chrome or marble laminate finish on request. / 2.8 m curved bar for reception desks, catering service or cocktails. Its curved shape structures the space and makes service easier. Chrome or marble
- og:image publié / local : Photo produit : bar-arrondi-1794598842618.png / Photo produit : bar-arrondi-1794598842618.png (1200 px)
- Images/alt publiés : Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike; Photo produit : 1777546380003-oqh8e9.png → Pouf / Seat
- Images/alt locaux : Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture; Photo produit : 1777544975776-65lgoj.png → Mirror Plinth — Furniture
- Liens internes publiés (6) : /en/catalogue, /en/sur-mesure/bar, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur, /en/produit/pouf
- Liens internes locaux (6) : /en/catalogue, /en/sur-mesure/bar, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur, /en/produit/stele-miroir
- Product local : description 259 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/bar-droit

- Title publié : Straight bar — Setup Paris
- Description publiée : 2 m straight bar in brushed aluminium laminate, for service or reception.
- Title local (42 car.) : Straight bar — Event rentals \| Setup Paris
- Description locale (153 car.) : Straight bar, 2 m long, 1.10 m high and 80 cm deep, in brushed aluminium laminate, for reception, service or a booth counter. Paint in the colour of your
- H1 : Straight bar
- Canonical publié / local : /en/produit/bar-droit / /en/produit/bar-droit
- Hreflang publié : fr=/produit/bar-droit, en=/en/produit/bar-droit, x-default=/produit/bar-droit
- Hreflang local : fr=/produit/bar-droit, en=/en/produit/bar-droit, x-default=/produit/bar-droit
- og:title publié / local : Straight bar — Setup Paris / Straight bar — Event rentals \| Setup Paris
- og:description publié / local : 2 m straight bar in brushed aluminium laminate, for service or reception. / Straight bar, 2 m long, 1.10 m high and 80 cm deep, in brushed aluminium laminate, for reception, service or a booth counter. Paint in the colour of your
- og:image publié / local : Photo produit : bar-droit-1794598847891.png / Photo produit : bar-droit-1794598847891.png (1200 px)
- Images/alt publiés : Photo produit : bar-droit-1794598847891.png → Straight bar; Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike
- Images/alt locaux : Photo produit : bar-droit-1794598847891.png → Straight bar — Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture
- Liens internes publiés (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Liens internes locaux (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Product local : description 254 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/box-cabine

- Title publié : Booth cabin — Setup Paris
- Description publiée : Cabin on a frame for a private space, an activation or a photo booth, can be dressed on all sides.
- Title local (41 car.) : Booth cabin — Event rentals \| Setup Paris
- Description locale (155 car.) : Booth cabin on a frame, about 2 × 1 × 2.5 m, to create a private space, a photo booth, a listening room or a brand activation. Chrome adhesive on all faces
- H1 : Booth cabin
- Canonical publié / local : /en/produit/box-cabine / /en/produit/box-cabine
- Hreflang publié : fr=/produit/box-cabine, en=/en/produit/box-cabine, x-default=/produit/box-cabine
- Hreflang local : fr=/produit/box-cabine, en=/en/produit/box-cabine, x-default=/produit/box-cabine
- og:title publié / local : Booth cabin — Setup Paris / Booth cabin — Event rentals \| Setup Paris
- og:description publié / local : Cabin on a frame for a private space, an activation or a photo booth, can be dressed on all sides. / Booth cabin on a frame, about 2 × 1 × 2.5 m, to create a private space, a photo booth, a listening room or a brand activation. Chrome adhesive on all faces
- og:image publié / local : Photo produit : box-cabine-1794598852335.png / Photo produit : box-cabine-1794598852335.png (1200 px)
- Images/alt publiés : Photo produit : box-cabine-1794598852335.png → Booth cabin; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser; Photo produit : auvent.png → Customizable Awning; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel
- Images/alt locaux : Photo produit : box-cabine-1794598852335.png → Booth cabin — Structures; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : auvent.png → Customizable Awning — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel — Structures
- Liens internes publiés (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte
- Liens internes locaux (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte
- Product local : description 249 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/chamboule-tout

- Title publié : Tin Can Alley — Setup Paris
- Description publiée : The classic fairground game, reimagined by SET UP. Our event tin can alley is fully customizable: structure color, can graphics, base wrapping. Easy transport, 
- Title local (43 car.) : Tin Can Alley — Event rentals \| Setup Paris
- Description locale (148 car.) : The classic fairground game, reimagined by SET UP. Our event tin can alley is fully customizable: structure color, can graphics, base wrapping. Easy
- H1 : Tin Can Alley
- Canonical publié / local : /en/produit/chamboule-tout / /en/produit/chamboule-tout
- Hreflang publié : fr=/produit/chamboule-tout, en=/en/produit/chamboule-tout, x-default=/produit/chamboule-tout
- Hreflang local : fr=/produit/chamboule-tout, en=/en/produit/chamboule-tout, x-default=/produit/chamboule-tout
- og:title publié / local : Tin Can Alley — Setup Paris / Tin Can Alley — Event rentals \| Setup Paris
- og:description publié / local : The classic fairground game, reimagined by SET UP. Our event tin can alley is fully customizable: structure color, can graphics, base wrapping. Easy transport,  / The classic fairground game, reimagined by SET UP. Our event tin can alley is fully customizable: structure color, can graphics, base wrapping. Easy
- og:image publié / local : Photo produit : 1777546178517-4sdg4e.jpg / Photo produit : 1777546178517-4sdg4e.jpg (1200 px)
- Images/alt publiés : Photo produit : 1777546178517-4sdg4e.jpg → Tin Can Alley; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4; Photo produit : 1777543737980-j52rup.jpg → Plinko
- Images/alt locaux : Photo produit : 1777546178517-4sdg4e.jpg → Tin Can Alley — Games; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop — Games; Photo produit : 1777543043347-ze8rul.png → Cornhole — Games; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4 — Games; Photo produit : 1777543737980-j52rup.jpg → Plinko — Games
- Liens internes publiés (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko
- Liens internes locaux (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko
- Product local : description 398 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/chassis-borgniole-noir-2m2

- Title publié : Black-out frame — strip — Setup Paris
- Description publiée : Black-out fabric strip on a frame, to complete the large frames.
- Title local (53 car.) : Black-out frame — strip — Event rentals \| Setup Paris
- Description locale (155 car.) : 4 × 0.5 m strip covered with black-out fabric, to complete the large frames, hide a stage base or dress a control area. Printed paper applied as an option.
- H1 : Black-out frame — strip
- Canonical publié / local : /en/produit/chassis-borgniole-noir-2m2 / /en/produit/chassis-borgniole-noir-2m2
- Hreflang publié : fr=/produit/chassis-borgniole-noir-2m2, en=/en/produit/chassis-borgniole-noir-2m2, x-default=/produit/chassis-borgniole-noir-2m2
- Hreflang local : fr=/produit/chassis-borgniole-noir-2m2, en=/en/produit/chassis-borgniole-noir-2m2, x-default=/produit/chassis-borgniole-noir-2m2
- og:title publié / local : Black-out frame — strip — Setup Paris / Black-out frame — strip — Event rentals \| Setup Paris
- og:description publié / local : Black-out fabric strip on a frame, to complete the large frames. / 4 × 0.5 m strip covered with black-out fabric, to complete the large frames, hide a stage base or dress a control area. Printed paper applied as an option.
- og:image publié / local : Photo produit : chassis-borgniole-noir-2m2-1794598845844.png / Photo produit : chassis-borgniole-noir-2m2-1794598845844.png (1200 px)
- Images/alt publiés : Photo produit : chassis-borgniole-noir-2m2-1794598845844.png → Black-out frame — strip; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser; Photo produit : auvent.png → Customizable Awning; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel
- Images/alt locaux : Photo produit : chassis-borgniole-noir-2m2-1794598845844.png → Black-out frame — strip — Structures; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : auvent.png → Customizable Awning — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel — Structures
- Liens internes publiés (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte
- Liens internes locaux (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte
- Product local : description 268 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/chassis-borgniole-noir-5m2

- Title publié : Black-out frame — large — Setup Paris
- Description publiée : Frame covered with black-out fabric to mask, darken or dress a space.
- Title local (53 car.) : Black-out frame — large — Event rentals \| Setup Paris
- Description locale (150 car.) : 4 × 1.25 m frame covered with black-out fabric to mask, darken or dress a space: backstage, control room, stage backdrop, TV set. Printed paper in the
- H1 : Black-out frame — large
- Canonical publié / local : /en/produit/chassis-borgniole-noir-5m2 / /en/produit/chassis-borgniole-noir-5m2
- Hreflang publié : fr=/produit/chassis-borgniole-noir-5m2, en=/en/produit/chassis-borgniole-noir-5m2, x-default=/produit/chassis-borgniole-noir-5m2
- Hreflang local : fr=/produit/chassis-borgniole-noir-5m2, en=/en/produit/chassis-borgniole-noir-5m2, x-default=/produit/chassis-borgniole-noir-5m2
- og:title publié / local : Black-out frame — large — Setup Paris / Black-out frame — large — Event rentals \| Setup Paris
- og:description publié / local : Frame covered with black-out fabric to mask, darken or dress a space. / 4 × 1.25 m frame covered with black-out fabric to mask, darken or dress a space: backstage, control room, stage backdrop, TV set. Printed paper in the
- og:image publié / local : Photo produit : chassis-borgniole-noir-5m2-1794598845390.png / Photo produit : chassis-borgniole-noir-5m2-1794598845390.png (1200 px)
- Images/alt publiés : Photo produit : chassis-borgniole-noir-5m2-1794598845390.png → Black-out frame — large; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser; Photo produit : auvent.png → Customizable Awning; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel
- Images/alt locaux : Photo produit : chassis-borgniole-noir-5m2-1794598845390.png → Black-out frame — large — Structures; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : auvent.png → Customizable Awning — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel — Structures
- Liens internes publiés (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte
- Liens internes locaux (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte
- Product local : description 306 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/chassis-imprime

- Title publié : Printed frame — Setup Paris
- Description publiée : 3 × 1 m frame for a stretched printed banner: brand backdrop, signage, photo wall.
- Title local (43 car.) : Printed frame — Event rentals \| Setup Paris
- Description locale (149 car.) : 3 × 1 m frame holding a stretched printed banner: brand backdrop, signage, photo wall or space dressing. Printing of your visual as an option (3 m²).
- H1 : Printed frame
- Canonical publié / local : /en/produit/chassis-imprime / /en/produit/chassis-imprime
- Hreflang publié : fr=/produit/chassis-imprime, en=/en/produit/chassis-imprime, x-default=/produit/chassis-imprime
- Hreflang local : fr=/produit/chassis-imprime, en=/en/produit/chassis-imprime, x-default=/produit/chassis-imprime
- og:title publié / local : Printed frame — Setup Paris / Printed frame — Event rentals \| Setup Paris
- og:description publié / local : 3 × 1 m frame for a stretched printed banner: brand backdrop, signage, photo wall. / 3 × 1 m frame holding a stretched printed banner: brand backdrop, signage, photo wall or space dressing. Printing of your visual as an option (3 m²).
- og:image publié / local : Photo produit : chassis-imprime-1794598846331.png / Photo produit : chassis-imprime-1794598846331.png (1200 px)
- Images/alt publiés : Photo produit : chassis-imprime-1794598846331.png → Printed frame; Photo produit : 1777547928218-y3xuzi.png → Swing PhotoBooth
- Images/alt locaux : Photo produit : chassis-imprime-1794598846331.png → Printed frame — Signage; Photo produit : 1777547928218-y3xuzi.png → Swing PhotoBooth — Signage
- Liens internes publiés (2) : /en/catalogue, /en/produit/photobooth-balancoire
- Liens internes locaux (2) : /en/catalogue, /en/produit/photobooth-balancoire
- Product local : description 254 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/chassis-plaque-autoporte

- Title publié : Freestanding flat panel — Setup Paris
- Description publiée : Freestanding flat panel on a steel base, to divide a space, build a backdrop or carry signage.
- Title local (53 car.) : Freestanding flat panel — Event rentals \| Setup Paris
- Description locale (152 car.) : Freestanding flat panel on a steel base, up to 1 × 2.5 m, to divide a space, build a backdrop or carry signage at trade shows, exhibitions or showrooms.
- H1 : Freestanding flat panel
- Canonical publié / local : /en/produit/chassis-plaque-autoporte / /en/produit/chassis-plaque-autoporte
- Hreflang publié : fr=/produit/chassis-plaque-autoporte, en=/en/produit/chassis-plaque-autoporte, x-default=/produit/chassis-plaque-autoporte
- Hreflang local : fr=/produit/chassis-plaque-autoporte, en=/en/produit/chassis-plaque-autoporte, x-default=/produit/chassis-plaque-autoporte
- og:title publié / local : Freestanding flat panel — Setup Paris / Freestanding flat panel — Event rentals \| Setup Paris
- og:description publié / local : Freestanding flat panel on a steel base, to divide a space, build a backdrop or carry signage. / Freestanding flat panel on a steel base, up to 1 × 2.5 m, to divide a space, build a backdrop or carry signage at trade shows, exhibitions or showrooms.
- og:image publié / local : Photo produit : chassis-plaque-autoporte-1794598843772.png / Photo produit : chassis-plaque-autoporte-1794598843772.png (1200 px)
- Images/alt publiés : Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser; Photo produit : auvent.png → Customizable Awning; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs; Photo produit : mur-autoporte-1794598844256.png → Freestanding wall
- Images/alt locaux : Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel — Structures; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : auvent.png → Customizable Awning — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs — Structures; Photo produit : mur-autoporte-1794598844256.png → Freestanding wall — Structures
- Liens internes publiés (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/mur-autoporte
- Liens internes locaux (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/mur-autoporte
- Product local : description 281 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/cimaise-sur-platine

- Title publié : Display panel on base plate — Setup Paris
- Description publiée : Freestanding display panel on a base plate to show visuals, artworks or information.
- Title local (57 car.) : Display panel on base plate — Event rentals \| Setup Paris
- Description locale (154 car.) : Freestanding 1 × 2.5 m display panel on a base plate to show visuals, artworks or information: exhibitions, pop-up galleries, trade shows, visitor routes.
- H1 : Display panel on base plate
- Canonical publié / local : /en/produit/cimaise-sur-platine / /en/produit/cimaise-sur-platine
- Hreflang publié : fr=/produit/cimaise-sur-platine, en=/en/produit/cimaise-sur-platine, x-default=/produit/cimaise-sur-platine
- Hreflang local : fr=/produit/cimaise-sur-platine, en=/en/produit/cimaise-sur-platine, x-default=/produit/cimaise-sur-platine
- og:title publié / local : Display panel on base plate — Setup Paris / Display panel on base plate — Event rentals \| Setup Paris
- og:description publié / local : Freestanding display panel on a base plate to show visuals, artworks or information. / Freestanding 1 × 2.5 m display panel on a base plate to show visuals, artworks or information: exhibitions, pop-up galleries, trade shows, visitor routes.
- og:image publié / local : Photo produit : cimaise-sur-platine-1794598844903.png / Photo produit : cimaise-sur-platine-1794598844903.png (1200 px)
- Images/alt publiés : Photo produit : cimaise-sur-platine-1794598844903.png → Display panel on base plate; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser; Photo produit : auvent.png → Customizable Awning; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel
- Images/alt locaux : Photo produit : cimaise-sur-platine-1794598844903.png → Display panel on base plate — Structures; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : auvent.png → Customizable Awning — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel — Structures
- Liens internes publiés (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte
- Liens internes locaux (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte
- Product local : description 283 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/cornhole

- Title publié : Cornhole — Setup Paris
- Description publiée : American throwing game, ideal for outdoor activities.
- Title local (38 car.) : Cornhole — Event rentals \| Setup Paris
- Description locale (148 car.) : Cornhole, the American bean-bag toss game: two sloped boards with a hole, bags to throw, quick games anyone can play. Perfect for booth activations,
- H1 : Cornhole
- Canonical publié / local : /en/produit/cornhole / /en/produit/cornhole
- Hreflang publié : fr=/produit/cornhole, en=/en/produit/cornhole, x-default=/produit/cornhole
- Hreflang local : fr=/produit/cornhole, en=/en/produit/cornhole, x-default=/produit/cornhole
- og:title publié / local : Cornhole — Setup Paris / Cornhole — Event rentals \| Setup Paris
- og:description publié / local : American throwing game, ideal for outdoor activities. / Cornhole, the American bean-bag toss game: two sloped boards with a hole, bags to throw, quick games anyone can play. Perfect for booth activations,
- og:image publié / local : Photo produit : 1777543043347-ze8rul.png / Photo produit : 1777543043347-ze8rul.png (1200 px)
- Images/alt publiés : Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4; Photo produit : 1777543737980-j52rup.jpg → Plinko; Photo produit : 1777542191380-3w77wj.jpg → Mini Golf
- Images/alt locaux : Photo produit : 1777543043347-ze8rul.png → Cornhole — Games; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop — Games; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4 — Games; Photo produit : 1777543737980-j52rup.jpg → Plinko — Games; Photo produit : 1777542191380-3w77wj.jpg → Mini Golf — Games
- Liens internes publiés (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/puissance-4, /en/produit/plinko, /en/produit/mini-golf
- Liens internes locaux (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/puissance-4, /en/produit/plinko, /en/produit/mini-golf
- Product local : description 325 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /en/produit/dj-booth

- Title publié : DJ booth — Setup Paris
- Description publiée : DJ booth, customisable with paint or lacquer and LEDs.
- Title local (38 car.) : DJ booth — Event rentals \| Setup Paris
- Description locale (153 car.) : DJ booth for parties, launches and brand events. Customisable with paint or lacquer and LED lighting. Dimensions on request. Delivery, set-up and pick-up
- H1 : DJ booth
- Canonical publié / local : /en/produit/dj-booth / /en/produit/dj-booth
- Hreflang publié : fr=/produit/dj-booth, en=/en/produit/dj-booth, x-default=/produit/dj-booth
- Hreflang local : fr=/produit/dj-booth, en=/en/produit/dj-booth, x-default=/produit/dj-booth
- og:title publié / local : DJ booth — Setup Paris / DJ booth — Event rentals \| Setup Paris
- og:description publié / local : DJ booth, customisable with paint or lacquer and LEDs. / DJ booth for parties, launches and brand events. Customisable with paint or lacquer and LED lighting. Dimensions on request. Delivery, set-up and pick-up
- og:image publié / local : Photo produit : dj-booth-1794598851542.png / Photo produit : dj-booth-1794598851542.png (1200 px)
- Images/alt publiés : Photo produit : dj-booth-1794598851542.png → DJ booth; Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike
- Images/alt locaux : Photo produit : dj-booth-1794598851542.png → DJ booth — Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture
- Liens internes publiés (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Liens internes locaux (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Product local : description 204 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/lettres-geantes

- Title publié : Giant Letters — Setup Paris
- Description publiée : Customizable 3D volumetric letters for your events.
- Title local (43 car.) : Giant Letters — Event rentals \| Setup Paris
- Description locale (150 car.) : Giant 3D letters, 1 m high and 15 cm deep, to spell out a brand name, a word or a hashtag at the heart of your event. Ideal for photo walls, stages or
- H1 : Giant Letters
- Canonical publié / local : /en/produit/lettres-geantes / /en/produit/lettres-geantes
- Hreflang publié : fr=/produit/lettres-geantes, en=/en/produit/lettres-geantes, x-default=/produit/lettres-geantes
- Hreflang local : fr=/produit/lettres-geantes, en=/en/produit/lettres-geantes, x-default=/produit/lettres-geantes
- og:title publié / local : Giant Letters — Setup Paris / Giant Letters — Event rentals \| Setup Paris
- og:description publié / local : Customizable 3D volumetric letters for your events. / Giant 3D letters, 1 m high and 15 cm deep, to spell out a brand name, a word or a hashtag at the heart of your event. Ideal for photo walls, stages or
- og:image publié / local : Photo produit : lettres-geantes.jpg / Photo produit : lettres-geantes.jpg (1200 px)
- Images/alt publiés : Photo produit : lettres-geantes.jpg → Giant Letters; Photo produit : 1780640879229-lu39vb.jpeg → Welcome Stele
- Images/alt locaux : Photo produit : lettres-geantes.jpg → Giant Letters — Decoration; Photo produit : 1780640879229-lu39vb.jpeg → Welcome Stele — Decoration
- Liens internes publiés (3) : /en/catalogue, /en/sur-mesure/lettres, /en/produit/stele
- Liens internes locaux (3) : /en/catalogue, /en/sur-mesure/lettres, /en/produit/stele
- Product local : description 280 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/mange-debout

- Title publié : High Table — Setup Paris
- Description publiée : High table for cocktails.
- Title local (40 car.) : High Table — Event rentals \| Setup Paris
- Description locale (153 car.) : High standing table for cocktails, afterworks, trade shows and networking areas. Simple furniture that encourages conversation. Quantity discount from 10
- H1 : High Table
- Canonical publié / local : /en/produit/mange-debout / /en/produit/mange-debout
- Hreflang publié : fr=/produit/mange-debout, en=/en/produit/mange-debout, x-default=/produit/mange-debout
- Hreflang local : fr=/produit/mange-debout, en=/en/produit/mange-debout, x-default=/produit/mange-debout
- og:title publié / local : High Table — Setup Paris / High Table — Event rentals \| Setup Paris
- og:description publié / local : High table for cocktails. / High standing table for cocktails, afterworks, trade shows and networking areas. Simple furniture that encourages conversation. Quantity discount from 10
- og:image publié / local : Photo produit : mange-debout.png / Photo produit : mange-debout.png (1200 px)
- Images/alt publiés : Photo produit : mange-debout.png → High Table; Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : triporteur.png → Cargo Bike; Photo produit : 1777546380003-oqh8e9.png → Pouf / Seat
- Images/alt locaux : Photo produit : mange-debout.png → High Table — Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture; Photo produit : 1777544975776-65lgoj.png → Mirror Plinth — Furniture
- Liens internes publiés (6) : /en/catalogue, /en/sur-mesure/mangeDebout, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/triporteur, /en/produit/pouf
- Liens internes locaux (6) : /en/catalogue, /en/sur-mesure/mangeDebout, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/triporteur, /en/produit/stele-miroir
- Product local : description 240 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /en/produit/mini-golf

- Title publié : Mini Golf — Setup Paris
- Description publiée : Modular mini golf course.
- Title local (39 car.) : Mini Golf — Event rentals \| Setup Paris
- Description locale (149 car.) : Modular mini-golf course to liven up a booth, a corporate village, a retreat or a party. Obstacles can be combined to fit the available space. Can be
- H1 : Mini Golf
- Canonical publié / local : /en/produit/mini-golf / /en/produit/mini-golf
- Hreflang publié : fr=/produit/mini-golf, en=/en/produit/mini-golf, x-default=/produit/mini-golf
- Hreflang local : fr=/produit/mini-golf, en=/en/produit/mini-golf, x-default=/produit/mini-golf
- og:title publié / local : Mini Golf — Setup Paris / Mini Golf — Event rentals \| Setup Paris
- og:description publié / local : Modular mini golf course. / Modular mini-golf course to liven up a booth, a corporate village, a retreat or a party. Obstacles can be combined to fit the available space. Can be
- og:image publié / local : Photo produit : 1777542191380-3w77wj.jpg / Photo produit : 1777542191380-3w77wj.jpg (1200 px)
- Images/alt publiés : Photo produit : 1777542191380-3w77wj.jpg → Mini Golf; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4; Photo produit : 1777543737980-j52rup.jpg → Plinko
- Images/alt locaux : Photo produit : 1777542191380-3w77wj.jpg → Mini Golf — Games; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop — Games; Photo produit : 1777543043347-ze8rul.png → Cornhole — Games; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4 — Games; Photo produit : 1777543737980-j52rup.jpg → Plinko — Games
- Liens internes publiés (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko
- Liens internes locaux (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko
- Product local : description 283 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /en/produit/mirolege

- Title publié : Mirolège mirror panel — Setup Paris
- Description publiée : Lightweight 4 m mirror panel on stands for sets and decors.
- Title local (51 car.) : Mirolège mirror panel — Event rentals \| Setup Paris
- Description locale (150 car.) : Mirolège: lightweight 1 × 4 m mirror panel on stands, to visually enlarge a space or create reflections on a TV set or in a scenography. Several units
- H1 : Mirolège mirror panel
- Canonical publié / local : /en/produit/mirolege / /en/produit/mirolege
- Hreflang publié : fr=/produit/mirolege, en=/en/produit/mirolege, x-default=/produit/mirolege
- Hreflang local : fr=/produit/mirolege, en=/en/produit/mirolege, x-default=/produit/mirolege
- og:title publié / local : Mirolège mirror panel — Setup Paris / Mirolège mirror panel — Event rentals \| Setup Paris
- og:description publié / local : Lightweight 4 m mirror panel on stands for sets and decors. / Mirolège: lightweight 1 × 4 m mirror panel on stands, to visually enlarge a space or create reflections on a TV set or in a scenography. Several units
- og:image publié / local : Photo produit : mirolege-1794598851939.png / Photo produit : mirolege-1794598851939.png (1200 px)
- Images/alt publiés : Photo produit : mirolege-1794598851939.png → Mirolège mirror panel; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser; Photo produit : auvent.png → Customizable Awning; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel
- Images/alt locaux : Photo produit : mirolege-1794598851939.png → Mirolège mirror panel — Structures; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : auvent.png → Customizable Awning — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel — Structures
- Liens internes publiés (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte
- Liens internes locaux (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte
- Product local : description 241 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/mur-autoporte

- Title publié : Freestanding wall — Setup Paris
- Description publiée : 3.5 m freestanding wall for a stage backdrop, a photo wall or a brand wall.
- Title local (47 car.) : Freestanding wall — Event rentals \| Setup Paris
- Description locale (155 car.) : Freestanding 3.5 × 2.5 m wall for a stage backdrop, a photo wall, a brand wall or a space divider. Paint in the colour of your choice as an option, logo on
- H1 : Freestanding wall
- Canonical publié / local : /en/produit/mur-autoporte / /en/produit/mur-autoporte
- Hreflang publié : fr=/produit/mur-autoporte, en=/en/produit/mur-autoporte, x-default=/produit/mur-autoporte
- Hreflang local : fr=/produit/mur-autoporte, en=/en/produit/mur-autoporte, x-default=/produit/mur-autoporte
- og:title publié / local : Freestanding wall — Setup Paris / Freestanding wall — Event rentals \| Setup Paris
- og:description publié / local : 3.5 m freestanding wall for a stage backdrop, a photo wall or a brand wall. / Freestanding 3.5 × 2.5 m wall for a stage backdrop, a photo wall, a brand wall or a space divider. Paint in the colour of your choice as an option, logo on
- og:image publié / local : Photo produit : mur-autoporte-1794598844256.png / Photo produit : mur-autoporte-1794598844256.png (1200 px)
- Images/alt publiés : Photo produit : mur-autoporte-1794598844256.png → Freestanding wall; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser; Photo produit : auvent.png → Customizable Awning; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel
- Images/alt locaux : Photo produit : mur-autoporte-1794598844256.png → Freestanding wall — Structures; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : auvent.png → Customizable Awning — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel — Structures
- Liens internes publiés (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte
- Liens internes locaux (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte
- Product local : description 246 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/panier-basketball

- Title publié : Basketball Hoop — Setup Paris
- Description publiée : Professional basketball hoop for event entertainment.
- Title local (45 car.) : Basketball Hoop — Event rentals \| Setup Paris
- Description locale (146 car.) : Event basketball hoop for shooting challenges at booths, trade shows, TV sets or corporate parties. An activation that draws people in and creates
- H1 : Basketball Hoop
- Canonical publié / local : /en/produit/panier-basketball / /en/produit/panier-basketball
- Hreflang publié : fr=/produit/panier-basketball, en=/en/produit/panier-basketball, x-default=/produit/panier-basketball
- Hreflang local : fr=/produit/panier-basketball, en=/en/produit/panier-basketball, x-default=/produit/panier-basketball
- og:title publié / local : Basketball Hoop — Setup Paris / Basketball Hoop — Event rentals \| Setup Paris
- og:description publié / local : Professional basketball hoop for event entertainment. / Event basketball hoop for shooting challenges at booths, trade shows, TV sets or corporate parties. An activation that draws people in and creates
- og:image publié / local : Photo produit : 1777542145171-dwbrhe.png / Photo produit : 1777542145171-dwbrhe.png (1200 px)
- Images/alt publiés : Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4; Photo produit : 1777543737980-j52rup.jpg → Plinko; Photo produit : 1777542191380-3w77wj.jpg → Mini Golf
- Images/alt locaux : Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop — Games; Photo produit : 1777543043347-ze8rul.png → Cornhole — Games; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4 — Games; Photo produit : 1777543737980-j52rup.jpg → Plinko — Games; Photo produit : 1777542191380-3w77wj.jpg → Mini Golf — Games
- Liens internes publiés (5) : /en/catalogue, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko, /en/produit/mini-golf
- Liens internes locaux (5) : /en/catalogue, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko, /en/produit/mini-golf
- Product local : description 337 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /en/produit/photobooth-balancoire

- Title publié : Swing PhotoBooth — Setup Paris
- Description publiée : Original photobooth featuring an integrated swing. Customizable interior and exterior cladding, LED, logo and swing options.
- Title local (46 car.) : Swing PhotoBooth — Event rentals \| Setup Paris
- Description locale (124 car.) : Original photobooth featuring an integrated swing. Customizable interior and exterior cladding, LED, logo and swing options.
- H1 : Swing PhotoBooth
- Canonical publié / local : /en/produit/photobooth-balancoire / /en/produit/photobooth-balancoire
- Hreflang publié : fr=/produit/photobooth-balancoire, en=/en/produit/photobooth-balancoire, x-default=/produit/photobooth-balancoire
- Hreflang local : fr=/produit/photobooth-balancoire, en=/en/produit/photobooth-balancoire, x-default=/produit/photobooth-balancoire
- og:title publié / local : Swing PhotoBooth — Setup Paris / Swing PhotoBooth — Event rentals \| Setup Paris
- og:description publié / local : Original photobooth featuring an integrated swing. Customizable interior and exterior cladding, LED, logo and swing options. / Original photobooth featuring an integrated swing. Customizable interior and exterior cladding, LED, logo and swing options.
- og:image publié / local : Photo produit : 1777547928218-y3xuzi.png / Photo produit : 1777547928218-y3xuzi.png (1200 px)
- Images/alt publiés : Photo produit : 1777547928218-y3xuzi.png → Swing PhotoBooth; Photo produit : chassis-imprime-1794598846331.png → Printed frame
- Images/alt locaux : Photo produit : 1777547928218-y3xuzi.png → Swing PhotoBooth — Signage; Photo produit : chassis-imprime-1794598846331.png → Printed frame — Signage
- Liens internes publiés (2) : /en/catalogue, /en/produit/chassis-imprime
- Liens internes locaux (2) : /en/catalogue, /en/produit/chassis-imprime
- Product local : description 124 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/plinko

- Title publié : Plinko — Setup Paris
- Description publiée : Spectacular game of chance with balls and obstacles.
- Title local (36 car.) : Plinko — Event rentals \| Setup Paris
- Description locale (144 car.) : Giant Plinko: a ball dropped from the top bounces off pegs into a winning slot. A spectacular game of chance for prize draws, contests and booth
- H1 : Plinko
- Canonical publié / local : /en/produit/plinko / /en/produit/plinko
- Hreflang publié : fr=/produit/plinko, en=/en/produit/plinko, x-default=/produit/plinko
- Hreflang local : fr=/produit/plinko, en=/en/produit/plinko, x-default=/produit/plinko
- og:title publié / local : Plinko — Setup Paris / Plinko — Event rentals \| Setup Paris
- og:description publié / local : Spectacular game of chance with balls and obstacles. / Giant Plinko: a ball dropped from the top bounces off pegs into a winning slot. A spectacular game of chance for prize draws, contests and booth
- og:image publié / local : Photo produit : 1777543737980-j52rup.jpg / Photo produit : 1777543737980-j52rup.jpg (1200 px)
- Images/alt publiés : Photo produit : 1777543737980-j52rup.jpg → Plinko; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4; Photo produit : 1777542191380-3w77wj.jpg → Mini Golf
- Images/alt locaux : Photo produit : 1777543737980-j52rup.jpg → Plinko — Games; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop — Games; Photo produit : 1777543043347-ze8rul.png → Cornhole — Games; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4 — Games; Photo produit : 1777542191380-3w77wj.jpg → Mini Golf — Games
- Liens internes publiés (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/mini-golf
- Liens internes locaux (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/mini-golf
- Product local : description 269 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /en/produit/podium

- Title publié : Three-tier podium — Setup Paris
- Description publiée : Set of three podiums of decreasing size for product staging or award ceremonies.
- Title local (47 car.) : Three-tier podium — Event rentals \| Setup Paris
- Description locale (155 car.) : Three-tier podium: three podiums of decreasing size (1.5 m, 1 m and 0.5 m bases, each 40 cm high) to stage products, an award ceremony or a window display.
- H1 : Three-tier podium
- Canonical publié / local : /en/produit/podium / /en/produit/podium
- Hreflang publié : fr=/produit/podium, en=/en/produit/podium, x-default=/produit/podium
- Hreflang local : fr=/produit/podium, en=/en/produit/podium, x-default=/produit/podium
- og:title publié / local : Three-tier podium — Setup Paris / Three-tier podium — Event rentals \| Setup Paris
- og:description publié / local : Set of three podiums of decreasing size for product staging or award ceremonies. / Three-tier podium: three podiums of decreasing size (1.5 m, 1 m and 0.5 m bases, each 40 cm high) to stage products, an award ceremony or a window display.
- og:image publié / local : Photo produit : 1780640415544-z8kjr6.jpeg / Photo produit : 1780640415544-z8kjr6.jpeg (1200 px)
- Images/alt publiés : Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike; Photo produit : 1777546380003-oqh8e9.png → Pouf / Seat
- Images/alt locaux : Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture; Photo produit : 1777544975776-65lgoj.png → Mirror Plinth — Furniture
- Liens internes publiés (6) : /en/catalogue, /en/sur-mesure/podium, /en/produit/bar-arrondi, /en/produit/mange-debout, /en/produit/triporteur, /en/produit/pouf
- Liens internes locaux (6) : /en/catalogue, /en/sur-mesure/podium, /en/produit/bar-arrondi, /en/produit/mange-debout, /en/produit/triporteur, /en/produit/stele-miroir
- Product local : description 288 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/podium-rond

- Title publié : Round podium — Setup Paris
- Description publiée : Round podium to showcase a product, a DJ set or a speaker.
- Title local (42 car.) : Round podium — Event rentals \| Setup Paris
- Description locale (153 car.) : Round podium, 2 to 3 m in diameter and 30 to 40 cm high, to stage a product, a DJ, a performer or a speaker. Top covering and skirt in the colour of your
- H1 : Round podium
- Canonical publié / local : /en/produit/podium-rond / /en/produit/podium-rond
- Hreflang publié : fr=/produit/podium-rond, en=/en/produit/podium-rond, x-default=/produit/podium-rond
- Hreflang local : fr=/produit/podium-rond, en=/en/produit/podium-rond, x-default=/produit/podium-rond
- og:title publié / local : Round podium — Setup Paris / Round podium — Event rentals \| Setup Paris
- og:description publié / local : Round podium to showcase a product, a DJ set or a speaker. / Round podium, 2 to 3 m in diameter and 30 to 40 cm high, to stage a product, a DJ, a performer or a speaker. Top covering and skirt in the colour of your
- og:image publié / local : Photo produit : podium-rond-1794600085097.png / Photo produit : podium-rond-1794600085097.png (1200 px)
- Images/alt publiés : Photo produit : podium-rond-1794600085097.png → Round podium; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser; Photo produit : auvent.png → Customizable Awning; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel
- Images/alt locaux : Photo produit : podium-rond-1794600085097.png → Round podium — Structures; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : auvent.png → Customizable Awning — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel — Structures
- Liens internes publiés (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte
- Liens internes locaux (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte
- Product local : description 254 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/pouf

- Title publié : Pouf / Seat — Setup Paris
- Description publiée : Customizable pouf available in cylindrical, square or rectangular shapes. Optional cover finish and cushion.
- Title local (41 car.) : Pouf / Seat — Event rentals \| Setup Paris
- Description locale (154 car.) : Pouf, 40 cm in diameter and 49 cm high, in cylindrical, square or rectangular shapes, to create a lounge, a waiting area or a chill-out corner. Cushion as
- H1 : Pouf / Seat
- Canonical publié / local : /en/produit/pouf / /en/produit/pouf
- Hreflang publié : fr=/produit/pouf, en=/en/produit/pouf, x-default=/produit/pouf
- Hreflang local : fr=/produit/pouf, en=/en/produit/pouf, x-default=/produit/pouf
- og:title publié / local : Pouf / Seat — Setup Paris / Pouf / Seat — Event rentals \| Setup Paris
- og:description publié / local : Customizable pouf available in cylindrical, square or rectangular shapes. Optional cover finish and cushion. / Pouf, 40 cm in diameter and 49 cm high, in cylindrical, square or rectangular shapes, to create a lounge, a waiting area or a chill-out corner. Cushion as
- og:image publié / local : Photo produit : 1777546380003-oqh8e9.png / Photo produit : 1777546380003-oqh8e9.png (1200 px)
- Images/alt publiés : Photo produit : 1777546380003-oqh8e9.png → Pouf / Seat; Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike
- Images/alt locaux : Photo produit : 1777546380003-oqh8e9.png → Pouf / Seat — Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture
- Liens internes publiés (6) : /en/catalogue, /en/sur-mesure/pouf, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Liens internes locaux (6) : /en/catalogue, /en/sur-mesure/pouf, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Product local : description 301 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/praticable-sur-pieds

- Title publié : Stage riser on legs — Setup Paris
- Description publiée : 40 cm high stage riser on legs for low stages and platforms, with optional black skirting.
- Title local (49 car.) : Stage riser on legs — Event rentals \| Setup Paris
- Description locale (151 car.) : 40 cm high stage riser on legs to build platforms, low stages and podiums. Black fabric skirt as an option. Delivery, set-up and pick-up by our team in
- H1 : Stage riser on legs
- Canonical publié / local : /en/produit/praticable-sur-pieds / /en/produit/praticable-sur-pieds
- Hreflang publié : fr=/produit/praticable-sur-pieds, en=/en/produit/praticable-sur-pieds, x-default=/produit/praticable-sur-pieds
- Hreflang local : fr=/produit/praticable-sur-pieds, en=/en/produit/praticable-sur-pieds, x-default=/produit/praticable-sur-pieds
- og:title publié / local : Stage riser on legs — Setup Paris / Stage riser on legs — Event rentals \| Setup Paris
- og:description publié / local : 40 cm high stage riser on legs for low stages and platforms, with optional black skirting. / 40 cm high stage riser on legs to build platforms, low stages and podiums. Black fabric skirt as an option. Delivery, set-up and pick-up by our team in
- og:image publié / local : Photo produit : praticable-sur-pieds-1794598843289.png / Photo produit : praticable-sur-pieds-1794598843289.png (1200 px)
- Images/alt publiés : Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser; Photo produit : auvent.png → Customizable Awning; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel; Photo produit : mur-autoporte-1794598844256.png → Freestanding wall
- Images/alt locaux : Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs — Structures; Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : auvent.png → Customizable Awning — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel — Structures; Photo produit : mur-autoporte-1794598844256.png → Freestanding wall — Structures
- Liens internes publiés (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/chassis-plaque-autoporte, /en/produit/mur-autoporte
- Liens internes locaux (5) : /en/catalogue, /en/produit/samias, /en/produit/auvent, /en/produit/chassis-plaque-autoporte, /en/produit/mur-autoporte
- Product local : description 187 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/puissance-4

- Title publié : Giant Connect 4 — Setup Paris
- Description publiée : Giant version of the famous Connect 4 game.
- Title local (45 car.) : Giant Connect 4 — Event rentals \| Setup Paris
- Description locale (154 car.) : Giant Connect 4, the large-format version of the famous four-in-a-row game, for friendly matches between colleagues, visitors or guests. Ideal for welcome
- H1 : Giant Connect 4
- Canonical publié / local : /en/produit/puissance-4 / /en/produit/puissance-4
- Hreflang publié : fr=/produit/puissance-4, en=/en/produit/puissance-4, x-default=/produit/puissance-4
- Hreflang local : fr=/produit/puissance-4, en=/en/produit/puissance-4, x-default=/produit/puissance-4
- og:title publié / local : Giant Connect 4 — Setup Paris / Giant Connect 4 — Event rentals \| Setup Paris
- og:description publié / local : Giant version of the famous Connect 4 game. / Giant Connect 4, the large-format version of the famous four-in-a-row game, for friendly matches between colleagues, visitors or guests. Ideal for welcome
- og:image publié / local : Photo produit : 1777543689794-or8pkd.png / Photo produit : 1777543689794-or8pkd.png (1200 px)
- Images/alt publiés : Photo produit : 1777543689794-or8pkd.png → Giant Connect 4; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543737980-j52rup.jpg → Plinko; Photo produit : 1777542191380-3w77wj.jpg → Mini Golf
- Images/alt locaux : Photo produit : 1777543689794-or8pkd.png → Giant Connect 4 — Games; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop — Games; Photo produit : 1777543043347-ze8rul.png → Cornhole — Games; Photo produit : 1777543737980-j52rup.jpg → Plinko — Games; Photo produit : 1777542191380-3w77wj.jpg → Mini Golf — Games
- Liens internes publiés (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/plinko, /en/produit/mini-golf
- Liens internes locaux (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/plinko, /en/produit/mini-golf
- Product local : description 309 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /en/produit/pupitre-ceremonie

- Title publié : Ceremony lectern — Setup Paris
- Description publiée : Ceremony lectern for awards, speeches and official events.
- Title local (46 car.) : Ceremony lectern — Event rentals \| Setup Paris
- Description locale (151 car.) : Ceremony lectern, 90 × 40 cm, 1.02 m high, for awards, speeches, press conferences and official events. Logo sticker as an option. Delivery, set-up and
- H1 : Ceremony lectern
- Canonical publié / local : /en/produit/pupitre-ceremonie / /en/produit/pupitre-ceremonie
- Hreflang publié : fr=/produit/pupitre-ceremonie, en=/en/produit/pupitre-ceremonie, x-default=/produit/pupitre-ceremonie
- Hreflang local : fr=/produit/pupitre-ceremonie, en=/en/produit/pupitre-ceremonie, x-default=/produit/pupitre-ceremonie
- og:title publié / local : Ceremony lectern — Setup Paris / Ceremony lectern — Event rentals \| Setup Paris
- og:description publié / local : Ceremony lectern for awards, speeches and official events. / Ceremony lectern, 90 × 40 cm, 1.02 m high, for awards, speeches, press conferences and official events. Logo sticker as an option. Delivery, set-up and
- og:image publié / local : Photo produit : pupitre-ceremonie-1794598850211.png / Photo produit : pupitre-ceremonie-1794598850211.png (1200 px)
- Images/alt publiés : Photo produit : pupitre-ceremonie-1794598850211.png → Ceremony lectern; Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike
- Images/alt locaux : Photo produit : pupitre-ceremonie-1794598850211.png → Ceremony lectern — Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture
- Liens internes publiés (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Liens internes locaux (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Product local : description 210 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/pupitre-colonnes

- Title publié : Column lectern — Setup Paris
- Description publiée : Acrylic lectern on a black or gold column.
- Title local (44 car.) : Column lectern — Event rentals \| Setup Paris
- Description locale (154 car.) : Acrylic lectern on a black or gold column, elegant and light, for conferences, panel talks and speeches. Logo sticker as an option. Dimensions on request.
- H1 : Column lectern
- Canonical publié / local : /en/produit/pupitre-colonnes / /en/produit/pupitre-colonnes
- Hreflang publié : fr=/produit/pupitre-colonnes, en=/en/produit/pupitre-colonnes, x-default=/produit/pupitre-colonnes
- Hreflang local : fr=/produit/pupitre-colonnes, en=/en/produit/pupitre-colonnes, x-default=/produit/pupitre-colonnes
- og:title publié / local : Column lectern — Setup Paris / Column lectern — Event rentals \| Setup Paris
- og:description publié / local : Acrylic lectern on a black or gold column. / Acrylic lectern on a black or gold column, elegant and light, for conferences, panel talks and speeches. Logo sticker as an option. Dimensions on request.
- og:image publié / local : Photo produit : pupitre-colonnes-1794598850650.png / Photo produit : pupitre-colonnes-1794598850650.png (1200 px)
- Images/alt publiés : Photo produit : pupitre-colonnes-1794598850650.png → Column lectern; Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike
- Images/alt locaux : Photo produit : pupitre-colonnes-1794598850650.png → Column lectern — Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture
- Liens internes publiés (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Liens internes locaux (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Product local : description 234 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/pupitre-plexi-noir

- Title publié : Acrylic lectern, black base — Setup Paris
- Description publiée : Acrylic lectern on a black base for speeches and conferences.
- Title local (57 car.) : Acrylic lectern, black base — Event rentals \| Setup Paris
- Description locale (151 car.) : Acrylic lectern on a black base, 90 × 45 cm, 1 m high, for conferences, seminars and on-stage speeches. Logo sticker as an option. Delivery, set-up and
- H1 : Acrylic lectern, black base
- Canonical publié / local : /en/produit/pupitre-plexi-noir / /en/produit/pupitre-plexi-noir
- Hreflang publié : fr=/produit/pupitre-plexi-noir, en=/en/produit/pupitre-plexi-noir, x-default=/produit/pupitre-plexi-noir
- Hreflang local : fr=/produit/pupitre-plexi-noir, en=/en/produit/pupitre-plexi-noir, x-default=/produit/pupitre-plexi-noir
- og:title publié / local : Acrylic lectern, black base — Setup Paris / Acrylic lectern, black base — Event rentals \| Setup Paris
- og:description publié / local : Acrylic lectern on a black base for speeches and conferences. / Acrylic lectern on a black base, 90 × 45 cm, 1 m high, for conferences, seminars and on-stage speeches. Logo sticker as an option. Delivery, set-up and
- og:image publié / local : Photo produit : pupitre-plexi-noir-1794598849721.png / Photo produit : pupitre-plexi-noir-1794598849721.png (1200 px)
- Images/alt publiés : Photo produit : pupitre-plexi-noir-1794598849721.png → Acrylic lectern, black base; Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike
- Images/alt locaux : Photo produit : pupitre-plexi-noir-1794598849721.png → Acrylic lectern, black base — Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture
- Liens internes publiés (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Liens internes locaux (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Product local : description 210 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/samias

- Title publié : Samia stage riser — Setup Paris
- Description publiée : Modular 2 × 1 m stage riser to build stages, platforms and podiums. Adjustable height from 14 to 47 cm, block assembly.
- Title local (47 car.) : Samia stage riser — Event rentals \| Setup Paris
- Description locale (150 car.) : Samia stage riser, 2 × 1 m, adjustable height from 14 to 47 cm, assembled block by block to build stages, platforms and podiums of any size. Fabric or
- H1 : Samia stage riser
- Canonical publié / local : /en/produit/samias / /en/produit/samias
- Hreflang publié : fr=/produit/samias, en=/en/produit/samias, x-default=/produit/samias
- Hreflang local : fr=/produit/samias, en=/en/produit/samias, x-default=/produit/samias
- og:title publié / local : Samia stage riser — Setup Paris / Samia stage riser — Event rentals \| Setup Paris
- og:description publié / local : Modular 2 × 1 m stage riser to build stages, platforms and podiums. Adjustable height from 14 to 47 cm, block assembly. / Samia stage riser, 2 × 1 m, adjustable height from 14 to 47 cm, assembled block by block to build stages, platforms and podiums of any size. Fabric or
- og:image publié / local : Photo produit : 1780642935830-p7n1l2.png / Photo produit : 1780642935830-p7n1l2.png (1200 px)
- Images/alt publiés : Photo produit : 1780642935830-p7n1l2.png → Samia stage riser; Photo produit : auvent.png → Customizable Awning; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel; Photo produit : mur-autoporte-1794598844256.png → Freestanding wall
- Images/alt locaux : Photo produit : 1780642935830-p7n1l2.png → Samia stage riser — Structures; Photo produit : auvent.png → Customizable Awning — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Stage riser on legs — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Freestanding flat panel — Structures; Photo produit : mur-autoporte-1794598844256.png → Freestanding wall — Structures
- Liens internes publiés (5) : /en/catalogue, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte, /en/produit/mur-autoporte
- Liens internes locaux (5) : /en/catalogue, /en/produit/auvent, /en/produit/praticable-sur-pieds, /en/produit/chassis-plaque-autoporte, /en/produit/mur-autoporte
- Product local : description 289 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/stand-de-tir

- Title publié : Shooting Stand — Setup Paris
- Description publiée : Giant customizable shooting stand for fun events.
- Title local (44 car.) : Shooting Stand — Event rentals \| Setup Paris
- Description locale (154 car.) : Giant shooting gallery, a fun and safe skill game for booth activations, trade shows, company parties or TV shows. Can be branded in your colours (printed
- H1 : Shooting Stand
- Canonical publié / local : /en/produit/stand-de-tir / /en/produit/stand-de-tir
- Hreflang publié : fr=/produit/stand-de-tir, en=/en/produit/stand-de-tir, x-default=/produit/stand-de-tir
- Hreflang local : fr=/produit/stand-de-tir, en=/en/produit/stand-de-tir, x-default=/produit/stand-de-tir
- og:title publié / local : Shooting Stand — Setup Paris / Shooting Stand — Event rentals \| Setup Paris
- og:description publié / local : Giant customizable shooting stand for fun events. / Giant shooting gallery, a fun and safe skill game for booth activations, trade shows, company parties or TV shows. Can be branded in your colours (printed
- og:image publié / local : Photo produit : 1777539884880-6v9tpq.png / Photo produit : 1777539884880-6v9tpq.png (1200 px)
- Images/alt publiés : Photo produit : 1777539884880-6v9tpq.png → Shooting Stand; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4; Photo produit : 1777543737980-j52rup.jpg → Plinko
- Images/alt locaux : Photo produit : 1777539884880-6v9tpq.png → Shooting Stand — Games; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop — Games; Photo produit : 1777543043347-ze8rul.png → Cornhole — Games; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4 — Games; Photo produit : 1777543737980-j52rup.jpg → Plinko — Games
- Liens internes publiés (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko
- Liens internes locaux (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko
- Product local : description 255 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /en/produit/stele

- Title publié : Welcome Stele — Setup Paris
- Description publiée : Customizable welcome stele for your events
- Title local (43 car.) : Welcome Stele — Event rentals \| Setup Paris
- Description locale (150 car.) : Square wooden plinth to present a product, an object, a document or information: launches, exhibitions, window displays, trade shows or pop-up stores.
- H1 : Welcome Stele
- Canonical publié / local : /en/produit/stele / /en/produit/stele
- Hreflang publié : fr=/produit/stele, en=/en/produit/stele, x-default=/produit/stele
- Hreflang local : fr=/produit/stele, en=/en/produit/stele, x-default=/produit/stele
- og:title publié / local : Welcome Stele — Setup Paris / Welcome Stele — Event rentals \| Setup Paris
- og:description publié / local : Customizable welcome stele for your events / Square wooden plinth to present a product, an object, a document or information: launches, exhibitions, window displays, trade shows or pop-up stores.
- og:image publié / local : Photo produit : 1780640879229-lu39vb.jpeg / Photo produit : 1780640879229-lu39vb.jpeg (1200 px)
- Images/alt publiés : Photo produit : 1780640879229-lu39vb.jpeg → Welcome Stele; Photo produit : lettres-geantes.jpg → Giant Letters
- Images/alt locaux : Photo produit : 1780640879229-lu39vb.jpeg → Welcome Stele — Decoration; Photo produit : lettres-geantes.jpg → Giant Letters — Decoration
- Liens internes publiés (3) : /en/catalogue, /en/sur-mesure/stele, /en/produit/lettres-geantes
- Liens internes locaux (3) : /en/catalogue, /en/sur-mesure/stele, /en/produit/lettres-geantes
- Product local : description 345 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/stele-miroir

- Title publié : Mirror Plinth — Setup Paris
- Description publiée : Polished stainless-steel plinth with mirror finish. Ideal for product showcasing, sculpture display, or event decoration.
- Title local (43 car.) : Mirror Plinth — Event rentals \| Setup Paris
- Description locale (121 car.) : Polished stainless-steel plinth with mirror finish. Ideal for product showcasing, sculpture display, or event decoration.
- H1 : Mirror Plinth
- Canonical publié / local : /en/produit/stele-miroir / /en/produit/stele-miroir
- Hreflang publié : fr=/produit/stele-miroir, en=/en/produit/stele-miroir, x-default=/produit/stele-miroir
- Hreflang local : fr=/produit/stele-miroir, en=/en/produit/stele-miroir, x-default=/produit/stele-miroir
- og:title publié / local : Mirror Plinth — Setup Paris / Mirror Plinth — Event rentals \| Setup Paris
- og:description publié / local : Polished stainless-steel plinth with mirror finish. Ideal for product showcasing, sculpture display, or event decoration. / Polished stainless-steel plinth with mirror finish. Ideal for product showcasing, sculpture display, or event decoration.
- og:image publié / local : Photo produit : 1777544975776-65lgoj.png / Photo produit : 1777544975776-65lgoj.png (1200 px)
- Images/alt publiés : Photo produit : 1777544975776-65lgoj.png → Mirror Plinth; Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike
- Images/alt locaux : Photo produit : 1777544975776-65lgoj.png → Mirror Plinth — Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture
- Liens internes publiés (6) : /en/catalogue, /en/sur-mesure/stele, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Liens internes locaux (6) : /en/catalogue, /en/sur-mesure/stele, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Product local : description 121 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/stele-ronde-pmma

- Title publié : Round acrylic plinth — Setup Paris
- Description publiée : Round acrylic plinth with a top shelf, to present a product or information.
- Title local (50 car.) : Round acrylic plinth — Event rentals \| Setup Paris
- Description locale (155 car.) : Round acrylic plinth: 30 cm diameter base, 15 cm column and 40 × 25 cm top shelf. Clear and discreet, it showcases a product, a bottle or information. Logo
- H1 : Round acrylic plinth
- Canonical publié / local : /en/produit/stele-ronde-pmma / /en/produit/stele-ronde-pmma
- Hreflang publié : fr=/produit/stele-ronde-pmma, en=/en/produit/stele-ronde-pmma, x-default=/produit/stele-ronde-pmma
- Hreflang local : fr=/produit/stele-ronde-pmma, en=/en/produit/stele-ronde-pmma, x-default=/produit/stele-ronde-pmma
- og:title publié / local : Round acrylic plinth — Setup Paris / Round acrylic plinth — Event rentals \| Setup Paris
- og:description publié / local : Round acrylic plinth with a top shelf, to present a product or information. / Round acrylic plinth: 30 cm diameter base, 15 cm column and 40 × 25 cm top shelf. Clear and discreet, it showcases a product, a bottle or information. Logo
- og:image publié / local : Photo produit : stele-ronde-pmma-1794598847008.png / Photo produit : stele-ronde-pmma-1794598847008.png (1200 px)
- Images/alt publiés : Photo produit : stele-ronde-pmma-1794598847008.png → Round acrylic plinth; Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike
- Images/alt locaux : Photo produit : stele-ronde-pmma-1794598847008.png → Round acrylic plinth — Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture
- Liens internes publiés (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Liens internes locaux (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Product local : description 257 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/table-alu

- Title publié : Aluminium table — Setup Paris
- Description publiée : Large 2.5 m table, brushed aluminium laminate top, aluminium tube legs.
- Title local (45 car.) : Aluminium table — Event rentals \| Setup Paris
- Description locale (154 car.) : Large 2.5 m × 1 m table, 75 cm high, brushed aluminium laminate top and aluminium tube legs, for meetings, workshops, buffets or product displays. Painted
- H1 : Aluminium table
- Canonical publié / local : /en/produit/table-alu / /en/produit/table-alu
- Hreflang publié : fr=/produit/table-alu, en=/en/produit/table-alu, x-default=/produit/table-alu
- Hreflang local : fr=/produit/table-alu, en=/en/produit/table-alu, x-default=/produit/table-alu
- og:title publié / local : Aluminium table — Setup Paris / Aluminium table — Event rentals \| Setup Paris
- og:description publié / local : Large 2.5 m table, brushed aluminium laminate top, aluminium tube legs. / Large 2.5 m × 1 m table, 75 cm high, brushed aluminium laminate top and aluminium tube legs, for meetings, workshops, buffets or product displays. Painted
- og:image publié / local : Photo produit : table-alu-1794598848306.png / Photo produit : table-alu-1794598848306.png (1200 px)
- Images/alt publiés : Photo produit : table-alu-1794598848306.png → Aluminium table; Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike
- Images/alt locaux : Photo produit : table-alu-1794598848306.png → Aluminium table — Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture
- Liens internes publiés (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Liens internes locaux (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Product local : description 252 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/table-de-blackjack

- Title publié : Blackjack Table — Setup Paris
- Description publiée : Half-circle blackjack table in true casino style, perfect for casino nights, corporate events or cocktail receptions. Fully customizable (felt color, rim, legs 
- Title local (45 car.) : Blackjack Table — Event rentals \| Setup Paris
- Description locale (154 car.) : Half-circle blackjack table in true casino style, perfect for casino nights, corporate events or cocktail receptions. Fully customizable (felt color, rim,
- H1 : Blackjack Table
- Canonical publié / local : /en/produit/table-de-blackjack / /en/produit/table-de-blackjack
- Hreflang publié : fr=/produit/table-de-blackjack, en=/en/produit/table-de-blackjack, x-default=/produit/table-de-blackjack
- Hreflang local : fr=/produit/table-de-blackjack, en=/en/produit/table-de-blackjack, x-default=/produit/table-de-blackjack
- og:title publié / local : Blackjack Table — Setup Paris / Blackjack Table — Event rentals \| Setup Paris
- og:description publié / local : Half-circle blackjack table in true casino style, perfect for casino nights, corporate events or cocktail receptions. Fully customizable (felt color, rim, legs  / Half-circle blackjack table in true casino style, perfect for casino nights, corporate events or cocktail receptions. Fully customizable (felt color, rim,
- og:image publié / local : Photo produit : 1777539739806-lk7ch3.png / Photo produit : 1777539739806-lk7ch3.png (1200 px)
- Images/alt publiés : Photo produit : 1777539739806-lk7ch3.png → Blackjack Table; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4; Photo produit : 1777543737980-j52rup.jpg → Plinko
- Images/alt locaux : Photo produit : 1777539739806-lk7ch3.png → Blackjack Table — Games; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop — Games; Photo produit : 1777543043347-ze8rul.png → Cornhole — Games; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4 — Games; Photo produit : 1777543737980-j52rup.jpg → Plinko — Games
- Liens internes publiés (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko
- Liens internes locaux (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko
- Product local : description 231 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/tabouret-atelier

- Title publié : Workshop high stool — Setup Paris
- Description publiée : Workshop-style high stool for bars and high tables.
- Title local (49 car.) : Workshop high stool — Event rentals \| Setup Paris
- Description locale (154 car.) : Workshop-style high stool, wooden seat and metal frame, to go with a bar, a counter or a high table. Quantity discount from 10 units. Delivery, set-up and
- H1 : Workshop high stool
- Canonical publié / local : /en/produit/tabouret-atelier / /en/produit/tabouret-atelier
- Hreflang publié : fr=/produit/tabouret-atelier, en=/en/produit/tabouret-atelier, x-default=/produit/tabouret-atelier
- Hreflang local : fr=/produit/tabouret-atelier, en=/en/produit/tabouret-atelier, x-default=/produit/tabouret-atelier
- og:title publié / local : Workshop high stool — Setup Paris / Workshop high stool — Event rentals \| Setup Paris
- og:description publié / local : Workshop-style high stool for bars and high tables. / Workshop-style high stool, wooden seat and metal frame, to go with a bar, a counter or a high table. Quantity discount from 10 units. Delivery, set-up and
- og:image publié / local : Photo produit : tabouret-atelier-1794598851137.png / Photo produit : tabouret-atelier-1794598851137.png (1200 px)
- Images/alt publiés : Photo produit : tabouret-atelier-1794598851137.png → Workshop high stool; Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : mange-debout.png → High Table; Photo produit : triporteur.png → Cargo Bike
- Images/alt locaux : Photo produit : tabouret-atelier-1794598851137.png → Workshop high stool — Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : triporteur.png → Cargo Bike — Furniture
- Liens internes publiés (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Liens internes locaux (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/triporteur
- Product local : description 213 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /en/produit/triporteur

- Title publié : Cargo Bike — Setup Paris
- Description publiée : Customizable cargo bike for street marketing.
- Title local (40 car.) : Cargo Bike — Event rentals \| Setup Paris
- Description locale (151 car.) : Customisable cargo bike for street marketing, sampling, a mobile stand or an outdoor brand activation. Customisation on quotation. Delivery, set-up and
- H1 : Cargo Bike
- Canonical publié / local : /en/produit/triporteur / /en/produit/triporteur
- Hreflang publié : fr=/produit/triporteur, en=/en/produit/triporteur, x-default=/produit/triporteur
- Hreflang local : fr=/produit/triporteur, en=/en/produit/triporteur, x-default=/produit/triporteur
- og:title publié / local : Cargo Bike — Setup Paris / Cargo Bike — Event rentals \| Setup Paris
- og:description publié / local : Customizable cargo bike for street marketing. / Customisable cargo bike for street marketing, sampling, a mobile stand or an outdoor brand activation. Customisation on quotation. Delivery, set-up and
- og:image publié / local : Photo produit : triporteur.png / Photo produit : triporteur.png (1200 px)
- Images/alt publiés : Photo produit : triporteur.png → Cargo Bike; Photo produit : bar-arrondi-1794598842618.png → curved bar; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium; Photo produit : mange-debout.png → High Table; Photo produit : 1777546380003-oqh8e9.png → Pouf / Seat
- Images/alt locaux : Photo produit : triporteur.png → Cargo Bike — Furniture; Photo produit : bar-arrondi-1794598842618.png → curved bar — Furniture; Photo produit : 1780640415544-z8kjr6.jpeg → Three-tier podium — Furniture; Photo produit : mange-debout.png → High Table — Furniture; Photo produit : 1777544975776-65lgoj.png → Mirror Plinth — Furniture
- Liens internes publiés (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/pouf
- Liens internes locaux (5) : /en/catalogue, /en/produit/bar-arrondi, /en/produit/podium, /en/produit/mange-debout, /en/produit/stele-miroir
- Product local : description 210 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /en/produit/zig-zag

- Title publié : Zig Zag — Setup Paris
- Description publiée : Giant Zig Zag game fully customizable: structure, background and ball path.
- Title local (37 car.) : Zig Zag — Event rentals \| Setup Paris
- Description locale (155 car.) : Giant Zig Zag game: guide the ball along the track without dropping it. An eye-catching skill game that draws visitors to a booth, a trade show or a party.
- H1 : Zig Zag
- Canonical publié / local : /en/produit/zig-zag / /en/produit/zig-zag
- Hreflang publié : fr=/produit/zig-zag, en=/en/produit/zig-zag, x-default=/produit/zig-zag
- Hreflang local : fr=/produit/zig-zag, en=/en/produit/zig-zag, x-default=/produit/zig-zag
- og:title publié / local : Zig Zag — Setup Paris / Zig Zag — Event rentals \| Setup Paris
- og:description publié / local : Giant Zig Zag game fully customizable: structure, background and ball path. / Giant Zig Zag game: guide the ball along the track without dropping it. An eye-catching skill game that draws visitors to a booth, a trade show or a party.
- og:image publié / local : Photo produit : 1777544265578-g6rq7n.png / Photo produit : 1777544265578-g6rq7n.png (1200 px)
- Images/alt publiés : Photo produit : 1777544265578-g6rq7n.png → Zig Zag; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4; Photo produit : 1777543737980-j52rup.jpg → Plinko
- Images/alt locaux : Photo produit : 1777544265578-g6rq7n.png → Zig Zag — Games; Photo produit : 1777542145171-dwbrhe.png → Basketball Hoop — Games; Photo produit : 1777543043347-ze8rul.png → Cornhole — Games; Photo produit : 1777543689794-or8pkd.png → Giant Connect 4 — Games; Photo produit : 1777543737980-j52rup.jpg → Plinko — Games
- Liens internes publiés (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko
- Liens internes locaux (5) : /en/catalogue, /en/produit/panier-basketball, /en/produit/cornhole, /en/produit/puissance-4, /en/produit/plinko
- Product local : description 317 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /en/sur-mesure

- Title publié : Custom-made event furniture — Setup Paris
- Description publiée : Have your event furniture custom-made: counters, plinths, podiums, totems, arches… Configure in 3D; price and production time confirmed within two business days.
- Title local (41 car.) : Custom-made event furniture — Setup Paris
- Description locale (147 car.) : Custom-made event furniture: 24 pieces with bespoke dimensions and finishes. Setup Paris reviews your project and replies within 48 business hours.
- H1 : Custom-made event furniture
- Canonical publié / local : /en/sur-mesure / /en/sur-mesure
- Hreflang publié : fr=/sur-mesure, en=/en/sur-mesure, x-default=/sur-mesure
- Hreflang local : fr=/sur-mesure, en=/en/sur-mesure, x-default=/sur-mesure
- og:title publié / local : Custom-made event furniture — Setup Paris / Custom-made event furniture — Setup Paris
- og:description publié / local : 24 pieces to your dimensions and finishes, configured in 3D. Price and production time confirmed within two business days. / 24 pieces to your dimensions and finishes, configured in 3D. Price and production time confirmed within two business days.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (26) : /en/catalogue, /en/sur-mesure/comptoir, /en/sur-mesure/comptoirL, /en/sur-mesure/bar, /en/sur-mesure/pupitre, /en/sur-mesure/table, /en/sur-mesure/mangeDebout, /en/sur-mesure/stele, /en/sur-mesure/podium, /en/sur-mesure/socleRond, /en/sur-mesure/cubes, /en/sur-mesure/gradin, /en/sur-mesure/etagere, /en/sur-mesure/urne, /en/sur-mesure/portant, /en/sur-mesure/totem, /en/sur-mesure/mur, /en/sur-mesure/cacheRegie, /en/sur-mesure/arche, /en/sur-mesure/lettres, /en/sur-mesure/cadre, /en/sur-mesure/claustra, /en/sur-mesure/banc, /en/sur-mesure/pouf, /en/sur-mesure/jardiniere, /en/contact
- Liens internes locaux (26) : /en/catalogue, /en/sur-mesure/comptoir, /en/sur-mesure/comptoirL, /en/sur-mesure/bar, /en/sur-mesure/pupitre, /en/sur-mesure/table, /en/sur-mesure/mangeDebout, /en/sur-mesure/stele, /en/sur-mesure/podium, /en/sur-mesure/socleRond, /en/sur-mesure/cubes, /en/sur-mesure/gradin, /en/sur-mesure/etagere, /en/sur-mesure/urne, /en/sur-mesure/portant, /en/sur-mesure/totem, /en/sur-mesure/mur, /en/sur-mesure/cacheRegie, /en/sur-mesure/arche, /en/sur-mesure/lettres, /en/sur-mesure/cadre, /en/sur-mesure/claustra, /en/sur-mesure/banc, /en/sur-mesure/pouf, /en/sur-mesure/jardiniere, /en/contact

### /en/sur-mesure/arche

- Title publié : Custom-made entrance arch — Setup Paris
- Description publiée : Box-built entrance gateway with a straight or curved lintel carrying your logo. Configure in 3D; price and production time confirmed within two business days.
- Title local (39 car.) : Custom-made entrance arch \| Setup Paris
- Description locale (126 car.) : Box-built entrance gateway with a straight or curved lintel carrying your logo. Made to order; reply within 48 business hours.
- H1 : Entrance arch custom-made
- Canonical publié / local : /en/sur-mesure/arche / /en/sur-mesure/arche
- Hreflang publié : fr=/sur-mesure/arche, en=/en/sur-mesure/arche, x-default=/sur-mesure/arche
- Hreflang local : fr=/sur-mesure/arche, en=/en/sur-mesure/arche, x-default=/sur-mesure/arche
- og:title publié / local : Custom-made entrance arch — Setup Paris / Custom-made entrance arch \| Setup Paris
- og:description publié / local : Box-built entrance gateway with a straight or curved lintel carrying your logo. / Box-built entrance gateway with a straight or curved lintel carrying your logo. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/banc

- Title publié : Custom-made bench — Setup Paris
- Description publiée : Box-built bench or banquette with a wooden seat or a foam-and-fabric cushion. Configure in 3D; price and production time confirmed within two business days.
- Title local (31 car.) : Custom-made bench \| Setup Paris
- Description locale (124 car.) : Box-built bench or banquette with a wooden seat or a foam-and-fabric cushion. Made to order; reply within 48 business hours.
- H1 : Bench custom-made
- Canonical publié / local : /en/sur-mesure/banc / /en/sur-mesure/banc
- Hreflang publié : fr=/sur-mesure/banc, en=/en/sur-mesure/banc, x-default=/sur-mesure/banc
- Hreflang local : fr=/sur-mesure/banc, en=/en/sur-mesure/banc, x-default=/sur-mesure/banc
- og:title publié / local : Custom-made bench — Setup Paris / Custom-made bench \| Setup Paris
- og:description publié / local : Box-built bench or banquette with a wooden seat or a foam-and-fabric cushion. / Box-built bench or banquette with a wooden seat or a foam-and-fabric cushion. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/bar

- Title publié : Custom-made bar or dj booth — Setup Paris
- Description publiée : Two-level unit: a high shelf on the guest side and a lower worktop on the service side. Works as a bar or a DJ booth. Configure in 3D; price and production time confirmed within two business days.
- Title local (41 car.) : Custom-made bar or dj booth \| Setup Paris
- Description locale (148 car.) : Two-level unit: a high shelf on the guest side and a lower worktop on the service side. Works as a bar or a DJ booth. Made to order; reply within 48
- H1 : Bar or DJ booth custom-made
- Canonical publié / local : /en/sur-mesure/bar / /en/sur-mesure/bar
- Hreflang publié : fr=/sur-mesure/bar, en=/en/sur-mesure/bar, x-default=/sur-mesure/bar
- Hreflang local : fr=/sur-mesure/bar, en=/en/sur-mesure/bar, x-default=/sur-mesure/bar
- og:title publié / local : Custom-made bar or dj booth — Setup Paris / Custom-made bar or dj booth \| Setup Paris
- og:description publié / local : Two-level unit: a high shelf on the guest side and a lower worktop on the service side. Works as a bar or a DJ booth. / Two-level unit: a high shelf on the guest side and a lower worktop on the service side. Works as a bar or a DJ booth. Made to order; reply within 48
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/cacheRegie

- Title publié : Custom-made tech-desk screen — Setup Paris
- Description publiée : Low U-shaped screen that hides a technical control desk or a workstation. Configure in 3D; price and production time confirmed within two business days.
- Title local (42 car.) : Custom-made tech-desk screen \| Setup Paris
- Description locale (120 car.) : Low U-shaped screen that hides a technical control desk or a workstation. Made to order; reply within 48 business hours.
- H1 : Tech-desk screen custom-made
- Canonical publié / local : /en/sur-mesure/cacheRegie / /en/sur-mesure/cacheRegie
- Hreflang publié : fr=/sur-mesure/cacheRegie, en=/en/sur-mesure/cacheRegie, x-default=/sur-mesure/cacheRegie
- Hreflang local : fr=/sur-mesure/cacheRegie, en=/en/sur-mesure/cacheRegie, x-default=/sur-mesure/cacheRegie
- og:title publié / local : Custom-made tech-desk screen — Setup Paris / Custom-made tech-desk screen \| Setup Paris
- og:description publié / local : Low U-shaped screen that hides a technical control desk or a workstation. / Low U-shaped screen that hides a technical control desk or a workstation. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/cadre

- Title publié : Custom-made giant photo frame — Setup Paris
- Description publiée : Lightweight selfie frame, painted or printed. Configure in 3D; price and production time confirmed within two business days.
- Title local (43 car.) : Custom-made giant photo frame \| Setup Paris
- Description locale (92 car.) : Lightweight selfie frame, painted or printed. Made to order; reply within 48 business hours.
- H1 : Giant photo frame custom-made
- Canonical publié / local : /en/sur-mesure/cadre / /en/sur-mesure/cadre
- Hreflang publié : fr=/sur-mesure/cadre, en=/en/sur-mesure/cadre, x-default=/sur-mesure/cadre
- Hreflang local : fr=/sur-mesure/cadre, en=/en/sur-mesure/cadre, x-default=/sur-mesure/cadre
- og:title publié / local : Custom-made giant photo frame — Setup Paris / Custom-made giant photo frame \| Setup Paris
- og:description publié / local : Lightweight selfie frame, painted or printed. / Lightweight selfie frame, painted or printed. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/claustra

- Title publié : Custom-made slatted screen — Setup Paris
- Description publiée : Open partition made of vertical battens, to divide a space without closing it off. Configure in 3D; price and production time confirmed within two business days.
- Title local (40 car.) : Custom-made slatted screen \| Setup Paris
- Description locale (129 car.) : Open partition made of vertical battens, to divide a space without closing it off. Made to order; reply within 48 business hours.
- H1 : Slatted screen custom-made
- Canonical publié / local : /en/sur-mesure/claustra / /en/sur-mesure/claustra
- Hreflang publié : fr=/sur-mesure/claustra, en=/en/sur-mesure/claustra, x-default=/sur-mesure/claustra
- Hreflang local : fr=/sur-mesure/claustra, en=/en/sur-mesure/claustra, x-default=/sur-mesure/claustra
- og:title publié / local : Custom-made slatted screen — Setup Paris / Custom-made slatted screen \| Setup Paris
- og:description publié / local : Open partition made of vertical battens, to divide a space without closing it off. / Open partition made of vertical battens, to divide a space without closing it off. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/comptoir

- Title publié : Custom-made counter — Setup Paris
- Description publiée : Straight reception counter, open on the service side or closed on all four sides. Configure in 3D; price and production time confirmed within two business days.
- Title local (33 car.) : Custom-made counter \| Setup Paris
- Description locale (128 car.) : Straight reception counter, open on the service side or closed on all four sides. Made to order; reply within 48 business hours.
- H1 : Counter custom-made
- Canonical publié / local : /en/sur-mesure/comptoir / /en/sur-mesure/comptoir
- Hreflang publié : fr=/sur-mesure/comptoir, en=/en/sur-mesure/comptoir, x-default=/sur-mesure/comptoir
- Hreflang local : fr=/sur-mesure/comptoir, en=/en/sur-mesure/comptoir, x-default=/sur-mesure/comptoir
- og:title publié / local : Custom-made counter — Setup Paris / Custom-made counter \| Setup Paris
- og:description publié / local : Straight reception counter, open on the service side or closed on all four sides. / Straight reception counter, open on the service side or closed on all four sides. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/comptoirL

- Title publié : Custom-made corner counter — Setup Paris
- Description publiée : L-shaped counter: a main front and a return, to hold a corner or close off a reception area. Configure in 3D; price and production time confirmed within two business days.
- Title local (40 car.) : Custom-made corner counter \| Setup Paris
- Description locale (139 car.) : L-shaped counter: a main front and a return, to hold a corner or close off a reception area. Made to order; reply within 48 business hours.
- H1 : Corner counter custom-made
- Canonical publié / local : /en/sur-mesure/comptoirL / /en/sur-mesure/comptoirL
- Hreflang publié : fr=/sur-mesure/comptoirL, en=/en/sur-mesure/comptoirL, x-default=/sur-mesure/comptoirL
- Hreflang local : fr=/sur-mesure/comptoirL, en=/en/sur-mesure/comptoirL, x-default=/sur-mesure/comptoirL
- og:title publié / local : Custom-made corner counter — Setup Paris / Custom-made corner counter \| Setup Paris
- og:description publié / local : L-shaped counter: a main front and a return, to hold a corner or close off a reception area. / L-shaped counter: a main front and a return, to hold a corner or close off a reception area. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/cubes

- Title publié : Custom-made nesting cubes — Setup Paris
- Description publiée : Set of five-sided cubes in decreasing sizes that nest inside each other for transport. Configure in 3D; price and production time confirmed within two business days.
- Title local (39 car.) : Custom-made nesting cubes \| Setup Paris
- Description locale (133 car.) : Set of five-sided cubes in decreasing sizes that nest inside each other for transport. Made to order; reply within 48 business hours.
- H1 : Nesting cubes custom-made
- Canonical publié / local : /en/sur-mesure/cubes / /en/sur-mesure/cubes
- Hreflang publié : fr=/sur-mesure/cubes, en=/en/sur-mesure/cubes, x-default=/sur-mesure/cubes
- Hreflang local : fr=/sur-mesure/cubes, en=/en/sur-mesure/cubes, x-default=/sur-mesure/cubes
- og:title publié / local : Custom-made nesting cubes — Setup Paris / Custom-made nesting cubes \| Setup Paris
- og:description publié / local : Set of five-sided cubes in decreasing sizes that nest inside each other for transport. / Set of five-sided cubes in decreasing sizes that nest inside each other for transport. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/etagere

- Title publié : Custom-made cubby shelving — Setup Paris
- Description publiée : Display bookcase with regular cubbies, with or without a back panel. Configure in 3D; price and production time confirmed within two business days.
- Title local (40 car.) : Custom-made cubby shelving \| Setup Paris
- Description locale (115 car.) : Display bookcase with regular cubbies, with or without a back panel. Made to order; reply within 48 business hours.
- H1 : Cubby shelving custom-made
- Canonical publié / local : /en/sur-mesure/etagere / /en/sur-mesure/etagere
- Hreflang publié : fr=/sur-mesure/etagere, en=/en/sur-mesure/etagere, x-default=/sur-mesure/etagere
- Hreflang local : fr=/sur-mesure/etagere, en=/en/sur-mesure/etagere, x-default=/sur-mesure/etagere
- og:title publié / local : Custom-made cubby shelving — Setup Paris / Custom-made cubby shelving \| Setup Paris
- og:description publié / local : Display bookcase with regular cubbies, with or without a back panel. / Display bookcase with regular cubbies, with or without a back panel. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/gradin

- Title publié : Custom-made tiered stand — Setup Paris
- Description publiée : Stepped display to tier products, or a small bleacher-style seat. Configure in 3D; price and production time confirmed within two business days.
- Title local (38 car.) : Custom-made tiered stand \| Setup Paris
- Description locale (112 car.) : Stepped display to tier products, or a small bleacher-style seat. Made to order; reply within 48 business hours.
- H1 : Tiered stand custom-made
- Canonical publié / local : /en/sur-mesure/gradin / /en/sur-mesure/gradin
- Hreflang publié : fr=/sur-mesure/gradin, en=/en/sur-mesure/gradin, x-default=/sur-mesure/gradin
- Hreflang local : fr=/sur-mesure/gradin, en=/en/sur-mesure/gradin, x-default=/sur-mesure/gradin
- og:title publié / local : Custom-made tiered stand — Setup Paris / Custom-made tiered stand \| Setup Paris
- og:description publié / local : Stepped display to tier products, or a small bleacher-style seat. / Stepped display to tier products, or a small bleacher-style seat. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/jardiniere

- Title publié : Custom-made planter — Setup Paris
- Description publiée : Box-built planter with a false bottom. Configure in 3D; price and production time confirmed within two business days.
- Title local (33 car.) : Custom-made planter \| Setup Paris
- Description locale (85 car.) : Box-built planter with a false bottom. Made to order; reply within 48 business hours.
- H1 : Planter custom-made
- Canonical publié / local : /en/sur-mesure/jardiniere / /en/sur-mesure/jardiniere
- Hreflang publié : fr=/sur-mesure/jardiniere, en=/en/sur-mesure/jardiniere, x-default=/sur-mesure/jardiniere
- Hreflang local : fr=/sur-mesure/jardiniere, en=/en/sur-mesure/jardiniere, x-default=/sur-mesure/jardiniere
- og:title publié / local : Custom-made planter — Setup Paris / Custom-made planter \| Setup Paris
- og:description publié / local : Box-built planter with a false bottom. / Box-built planter with a false bottom. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/lettres

- Title publié : Custom-made giant letters — Setup Paris
- Description publiée : A word or initials in 3D letters, standing on the floor or on a shared base. Configure in 3D; price and production time confirmed within two business days.
- Title local (39 car.) : Custom-made giant letters \| Setup Paris
- Description locale (123 car.) : A word or initials in 3D letters, standing on the floor or on a shared base. Made to order; reply within 48 business hours.
- H1 : Giant letters custom-made
- Canonical publié / local : /en/sur-mesure/lettres / /en/sur-mesure/lettres
- Hreflang publié : fr=/sur-mesure/lettres, en=/en/sur-mesure/lettres, x-default=/sur-mesure/lettres
- Hreflang local : fr=/sur-mesure/lettres, en=/en/sur-mesure/lettres, x-default=/sur-mesure/lettres
- og:title publié / local : Custom-made giant letters — Setup Paris / Custom-made giant letters \| Setup Paris
- og:description publié / local : A word or initials in 3D letters, standing on the floor or on a shared base. / A word or initials in 3D letters, standing on the floor or on a shared base. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/mangeDebout

- Title publié : Custom-made poseur table — Setup Paris
- Description publiée : High table with a round or square top, on a wooden column or a steel post with base plate. Configure in 3D; price and production time confirmed within two business days.
- Title local (38 car.) : Custom-made poseur table \| Setup Paris
- Description locale (137 car.) : High table with a round or square top, on a wooden column or a steel post with base plate. Made to order; reply within 48 business hours.
- H1 : Poseur table custom-made
- Canonical publié / local : /en/sur-mesure/mangeDebout / /en/sur-mesure/mangeDebout
- Hreflang publié : fr=/sur-mesure/mangeDebout, en=/en/sur-mesure/mangeDebout, x-default=/sur-mesure/mangeDebout
- Hreflang local : fr=/sur-mesure/mangeDebout, en=/en/sur-mesure/mangeDebout, x-default=/sur-mesure/mangeDebout
- og:title publié / local : Custom-made poseur table — Setup Paris / Custom-made poseur table \| Setup Paris
- og:description publié / local : High table with a round or square top, on a wooden column or a steel post with base plate. / High table with a round or square top, on a wooden column or a steel post with base plate. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/mur

- Title publié : Custom-made image wall — Setup Paris
- Description publiée : Free-standing stage backdrop or photo wall. Configure in 3D; price and production time confirmed within two business days.
- Title local (36 car.) : Custom-made image wall \| Setup Paris
- Description locale (90 car.) : Free-standing stage backdrop or photo wall. Made to order; reply within 48 business hours.
- H1 : Image wall custom-made
- Canonical publié / local : /en/sur-mesure/mur / /en/sur-mesure/mur
- Hreflang publié : fr=/sur-mesure/mur, en=/en/sur-mesure/mur, x-default=/sur-mesure/mur
- Hreflang local : fr=/sur-mesure/mur, en=/en/sur-mesure/mur, x-default=/sur-mesure/mur
- og:title publié / local : Custom-made image wall — Setup Paris / Custom-made image wall \| Setup Paris
- og:description publié / local : Free-standing stage backdrop or photo wall. / Free-standing stage backdrop or photo wall. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/podium

- Title publié : Custom-made podium — Setup Paris
- Description publiée : Low rectangular podium with a painted, veneered or carpeted top. Configure in 3D; price and production time confirmed within two business days.
- Title local (32 car.) : Custom-made podium \| Setup Paris
- Description locale (111 car.) : Low rectangular podium with a painted, veneered or carpeted top. Made to order; reply within 48 business hours.
- H1 : Podium custom-made
- Canonical publié / local : /en/sur-mesure/podium / /en/sur-mesure/podium
- Hreflang publié : fr=/sur-mesure/podium, en=/en/sur-mesure/podium, x-default=/sur-mesure/podium
- Hreflang local : fr=/sur-mesure/podium, en=/en/sur-mesure/podium, x-default=/sur-mesure/podium
- og:title publié / local : Custom-made podium — Setup Paris / Custom-made podium \| Setup Paris
- og:description publié / local : Low rectangular podium with a painted, veneered or carpeted top. / Low rectangular podium with a painted, veneered or carpeted top. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/portant

- Title publié : Custom-made clothing rail — Setup Paris
- Description publiée : Steel-tube clothing rail with an optional lower shelf, for a pop-up store or a dressing room. Configure in 3D; price and production time confirmed within two business days.
- Title local (39 car.) : Custom-made clothing rail \| Setup Paris
- Description locale (140 car.) : Steel-tube clothing rail with an optional lower shelf, for a pop-up store or a dressing room. Made to order; reply within 48 business hours.
- H1 : Clothing rail custom-made
- Canonical publié / local : /en/sur-mesure/portant / /en/sur-mesure/portant
- Hreflang publié : fr=/sur-mesure/portant, en=/en/sur-mesure/portant, x-default=/sur-mesure/portant
- Hreflang local : fr=/sur-mesure/portant, en=/en/sur-mesure/portant, x-default=/sur-mesure/portant
- og:title publié / local : Custom-made clothing rail — Setup Paris / Custom-made clothing rail \| Setup Paris
- og:description publié / local : Steel-tube clothing rail with an optional lower shelf, for a pop-up store or a dressing room. / Steel-tube clothing rail with an optional lower shelf, for a pop-up store or a dressing room. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/pouf

- Title publié : Custom-made pouf — Setup Paris
- Description publiée : Cube or cylinder pouf, fully upholstered in fabric. Configure in 3D; price and production time confirmed within two business days.
- Title local (30 car.) : Custom-made pouf \| Setup Paris
- Description locale (98 car.) : Cube or cylinder pouf, fully upholstered in fabric. Made to order; reply within 48 business hours.
- H1 : Pouf custom-made
- Canonical publié / local : /en/sur-mesure/pouf / /en/sur-mesure/pouf
- Hreflang publié : fr=/sur-mesure/pouf, en=/en/sur-mesure/pouf, x-default=/sur-mesure/pouf
- Hreflang local : fr=/sur-mesure/pouf, en=/en/sur-mesure/pouf, x-default=/sur-mesure/pouf
- og:title publié / local : Custom-made pouf — Setup Paris / Custom-made pouf \| Setup Paris
- og:description publié / local : Cube or cylinder pouf, fully upholstered in fabric. / Cube or cylinder pouf, fully upholstered in fabric. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/pupitre

- Title publié : Custom-made lectern — Setup Paris
- Description publiée : Speaker's lectern with a sloped, lipped top and a solid front facing the audience. Configure in 3D; price and production time confirmed within two business days.
- Title local (33 car.) : Custom-made lectern \| Setup Paris
- Description locale (129 car.) : Speaker's lectern with a sloped, lipped top and a solid front facing the audience. Made to order; reply within 48 business hours.
- H1 : Lectern custom-made
- Canonical publié / local : /en/sur-mesure/pupitre / /en/sur-mesure/pupitre
- Hreflang publié : fr=/sur-mesure/pupitre, en=/en/sur-mesure/pupitre, x-default=/sur-mesure/pupitre
- Hreflang local : fr=/sur-mesure/pupitre, en=/en/sur-mesure/pupitre, x-default=/sur-mesure/pupitre
- og:title publié / local : Custom-made lectern — Setup Paris / Custom-made lectern \| Setup Paris
- og:description publié / local : Speaker's lectern with a sloped, lipped top and a solid front facing the audience. / Speaker's lectern with a sloped, lipped top and a solid front facing the audience. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/socleRond

- Title publié : Custom-made round plinth — Setup Paris
- Description publiée : Cylindrical plinth or podium with a curved skirt and a disc top. Configure in 3D; price and production time confirmed within two business days.
- Title local (38 car.) : Custom-made round plinth \| Setup Paris
- Description locale (111 car.) : Cylindrical plinth or podium with a curved skirt and a disc top. Made to order; reply within 48 business hours.
- H1 : Round plinth custom-made
- Canonical publié / local : /en/sur-mesure/socleRond / /en/sur-mesure/socleRond
- Hreflang publié : fr=/sur-mesure/socleRond, en=/en/sur-mesure/socleRond, x-default=/sur-mesure/socleRond
- Hreflang local : fr=/sur-mesure/socleRond, en=/en/sur-mesure/socleRond, x-default=/sur-mesure/socleRond
- og:title publié / local : Custom-made round plinth — Setup Paris / Custom-made round plinth \| Setup Paris
- og:description publié / local : Cylindrical plinth or podium with a curved skirt and a disc top. / Cylindrical plinth or podium with a curved skirt and a disc top. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/stele

- Title publié : Custom-made plinth — Setup Paris
- Description publiée : Four-sided display plinth, with an optional acrylic cover to protect the item on show. Configure in 3D; price and production time confirmed within two business days.
- Title local (32 car.) : Custom-made plinth \| Setup Paris
- Description locale (133 car.) : Four-sided display plinth, with an optional acrylic cover to protect the item on show. Made to order; reply within 48 business hours.
- H1 : Plinth custom-made
- Canonical publié / local : /en/sur-mesure/stele / /en/sur-mesure/stele
- Hreflang publié : fr=/sur-mesure/stele, en=/en/sur-mesure/stele, x-default=/sur-mesure/stele
- Hreflang local : fr=/sur-mesure/stele, en=/en/sur-mesure/stele, x-default=/sur-mesure/stele
- og:title publié / local : Custom-made plinth — Setup Paris / Custom-made plinth \| Setup Paris
- og:description publié / local : Four-sided display plinth, with an optional acrylic cover to protect the item on show. / Four-sided display plinth, with an optional acrylic cover to protect the item on show. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/table

- Title publié : Custom-made table — Setup Paris
- Description publiée : Made-to-measure table, from worktop to display table, on side panels, a cabinet base or a steel-tube frame. Configure in 3D; price and production time confirmed within two business days.
- Title local (31 car.) : Custom-made table \| Setup Paris
- Description locale (154 car.) : Made-to-measure table, from worktop to display table, on side panels, a cabinet base or a steel-tube frame. Made to order; reply within 48 business hours.
- H1 : Table custom-made
- Canonical publié / local : /en/sur-mesure/table / /en/sur-mesure/table
- Hreflang publié : fr=/sur-mesure/table, en=/en/sur-mesure/table, x-default=/sur-mesure/table
- Hreflang local : fr=/sur-mesure/table, en=/en/sur-mesure/table, x-default=/sur-mesure/table
- og:title publié / local : Custom-made table — Setup Paris / Custom-made table \| Setup Paris
- og:description publié / local : Made-to-measure table, from worktop to display table, on side panels, a cabinet base or a steel-tube frame. / Made-to-measure table, from worktop to display table, on side panels, a cabinet base or a steel-tube frame. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/totem

- Title publié : Custom-made totem sign — Setup Paris
- Description publiée : Box-built signage totem, printed on one or two sides, on an oversized base. Configure in 3D; price and production time confirmed within two business days.
- Title local (36 car.) : Custom-made totem sign \| Setup Paris
- Description locale (122 car.) : Box-built signage totem, printed on one or two sides, on an oversized base. Made to order; reply within 48 business hours.
- H1 : Totem sign custom-made
- Canonical publié / local : /en/sur-mesure/totem / /en/sur-mesure/totem
- Hreflang publié : fr=/sur-mesure/totem, en=/en/sur-mesure/totem, x-default=/sur-mesure/totem
- Hreflang local : fr=/sur-mesure/totem, en=/en/sur-mesure/totem, x-default=/sur-mesure/totem
- og:title publié / local : Custom-made totem sign — Setup Paris / Custom-made totem sign \| Setup Paris
- og:description publié / local : Box-built signage totem, printed on one or two sides, on an oversized base. / Box-built signage totem, printed on one or two sides, on an oversized base. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /en/sur-mesure/urne

- Title publié : Custom-made ballot box — Setup Paris
- Description publiée : Acrylic box with a slot for prize draws, votes or collections, with an optional stand. Configure in 3D; price and production time confirmed within two business days.
- Title local (36 car.) : Custom-made ballot box \| Setup Paris
- Description locale (133 car.) : Acrylic box with a slot for prize draws, votes or collections, with an optional stand. Made to order; reply within 48 business hours.
- H1 : Ballot box custom-made
- Canonical publié / local : /en/sur-mesure/urne / /en/sur-mesure/urne
- Hreflang publié : fr=/sur-mesure/urne, en=/en/sur-mesure/urne, x-default=/sur-mesure/urne
- Hreflang local : fr=/sur-mesure/urne, en=/en/sur-mesure/urne, x-default=/sur-mesure/urne
- og:title publié / local : Custom-made ballot box — Setup Paris / Custom-made ballot box \| Setup Paris
- og:description publié / local : Acrylic box with a slot for prize draws, votes or collections, with an optional stand. / Acrylic box with a slot for prize draws, votes or collections, with an optional stand. Made to order; reply within 48 business hours.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /en/sur-mesure
- Liens internes locaux (1) : /en/sur-mesure

### /mentions-legales

- Title publié : Mentions légales — Setup Paris
- Description publiée : Mentions légales et conditions générales de Smart Restructuring (Setup Paris) : commandes, paiement, livraison, responsabilité, RGPD.
- Title local (41 car.) : Mentions légales et éditeur — Setup Paris
- Description locale (133 car.) : Mentions légales et conditions générales de Smart Restructuring (Setup Paris) : commandes, paiement, livraison, responsabilité, RGPD.
- H1 : Mentions légales
- Canonical publié / local : /mentions-legales / /mentions-legales
- Hreflang publié : fr=/mentions-legales, en=/en/mentions-legales, x-default=/mentions-legales
- Hreflang local : fr=/mentions-legales, en=/en/mentions-legales, x-default=/mentions-legales
- og:title publié / local : Mentions légales — Setup Paris / Mentions légales et éditeur — Setup Paris
- og:description publié / local : Mentions légales de Setup Paris (Smart Restructuring). / Mentions légales de Setup Paris (Smart Restructuring).
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (2) : /, /cgl
- Liens internes locaux (2) : /, /cgl

### /produit/assise-cube

- Title publié : Assise cube — Setup Paris
- Description publiée : Cube de 45 cm en médium, utilisable en assise, en présentoir ou en élément de décor.
- Title local (51 car.) : Assise cube — Location événementielle \| Setup Paris
- Description locale (155 car.) : Cube de 45 × 45 × 45 cm en médium : une assise simple, un présentoir ou un élément de décor modulable. Disponible en grand nombre pour équiper un espace de
- H1 : Assise cube
- Canonical publié / local : /produit/assise-cube / /produit/assise-cube
- Hreflang publié : fr=/produit/assise-cube, en=/en/produit/assise-cube, x-default=/produit/assise-cube
- Hreflang local : fr=/produit/assise-cube, en=/en/produit/assise-cube, x-default=/produit/assise-cube
- og:title publié / local : Assise cube — Setup Paris / Assise cube — Location événementielle \| Setup Paris
- og:description publié / local : Cube de 45 cm en médium, utilisable en assise, en présentoir ou en élément de décor. / Cube de 45 × 45 × 45 cm en médium : une assise simple, un présentoir ou un élément de décor modulable. Disponible en grand nombre pour équiper un espace de
- og:image publié / local : Photo produit : assise-cube-1794598848687.png / Photo produit : assise-cube-1794598848687.png (1200 px)
- Images/alt publiés : Photo produit : assise-cube-1794598848687.png → Assise cube; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur
- Images/alt locaux : Photo produit : assise-cube-1794598848687.png → Assise cube — Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier
- Liens internes publiés (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Liens internes locaux (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Product local : description 364 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/auvent

- Title publié : Auvent Personnalisable — Setup Paris
- Description publiée : Structure d'accueil couverte pour entrée de site.
- Title local (62 car.) : Auvent Personnalisable — Location événementielle \| Setup Paris
- Description locale (155 car.) : Auvent, structure d'accueil couverte pour marquer l'entrée d'un site, d'un stand extérieur ou d'un village événementiel. Couleurs de tissu, de structure et
- H1 : Auvent Personnalisable
- Canonical publié / local : /produit/auvent / /produit/auvent
- Hreflang publié : fr=/produit/auvent, en=/en/produit/auvent, x-default=/produit/auvent
- Hreflang local : fr=/produit/auvent, en=/en/produit/auvent, x-default=/produit/auvent
- og:title publié / local : Auvent Personnalisable — Setup Paris / Auvent Personnalisable — Location événementielle \| Setup Paris
- og:description publié / local : Structure d'accueil couverte pour entrée de site. / Auvent, structure d'accueil couverte pour marquer l'entrée d'un site, d'un stand extérieur ou d'un village événementiel. Couleurs de tissu, de structure et
- og:image publié / local : Photo produit : auvent.png / Photo produit : auvent.png (1200 px)
- Images/alt publiés : Photo produit : auvent.png → Auvent Personnalisable; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté; Photo produit : mur-autoporte-1794598844256.png → Mur autoporté
- Images/alt locaux : Photo produit : auvent.png → Auvent Personnalisable — Structures; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté — Structures; Photo produit : mur-autoporte-1794598844256.png → Mur autoporté — Structures
- Liens internes publiés (5) : /catalogue, /produit/samias, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte, /produit/mur-autoporte
- Liens internes locaux (5) : /catalogue, /produit/samias, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte, /produit/mur-autoporte
- Product local : description 309 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /produit/banquette-droite

- Title publié : Banquette droite — Setup Paris
- Description publiée : Banquette de 2 m pour les espaces d'attente, de détente ou de projection.
- Title local (56 car.) : Banquette droite — Location événementielle \| Setup Paris
- Description locale (154 car.) : Banquette droite de 2 m de long, 40 cm de profondeur et 45 cm de hauteur, pour les espaces d'attente, de détente, de projection ou de conférence. Peinture
- H1 : Banquette droite
- Canonical publié / local : /produit/banquette-droite / /produit/banquette-droite
- Hreflang publié : fr=/produit/banquette-droite, en=/en/produit/banquette-droite, x-default=/produit/banquette-droite
- Hreflang local : fr=/produit/banquette-droite, en=/en/produit/banquette-droite, x-default=/produit/banquette-droite
- og:title publié / local : Banquette droite — Setup Paris / Banquette droite — Location événementielle \| Setup Paris
- og:description publié / local : Banquette de 2 m pour les espaces d'attente, de détente ou de projection. / Banquette droite de 2 m de long, 40 cm de profondeur et 45 cm de hauteur, pour les espaces d'attente, de détente, de projection ou de conférence. Peinture
- og:image publié / local : Photo produit : banquette-droite-1794598849134.png / Photo produit : banquette-droite-1794598849134.png (1200 px)
- Images/alt publiés : Photo produit : banquette-droite-1794598849134.png → Banquette droite; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur
- Images/alt locaux : Photo produit : banquette-droite-1794598849134.png → Banquette droite — Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier
- Liens internes publiés (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Liens internes locaux (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Product local : description 302 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/bar-arrondi

- Title publié : Bar arrondi — Setup Paris
- Description publiée : Bar arrondi de 2,8 m pour un accueil ou un service, finition plaqué chromé ou stratifié marbre en option.
- Title local (51 car.) : Bar arrondi — Location événementielle \| Setup Paris
- Description locale (149 car.) : Bar arrondi de 2,8 m de long pour un accueil, un service traiteur ou un cocktail. Sa forme courbe structure l'espace et facilite le service. Finition
- H1 : Bar arrondi
- Canonical publié / local : /produit/bar-arrondi / /produit/bar-arrondi
- Hreflang publié : fr=/produit/bar-arrondi, en=/en/produit/bar-arrondi, x-default=/produit/bar-arrondi
- Hreflang local : fr=/produit/bar-arrondi, en=/en/produit/bar-arrondi, x-default=/produit/bar-arrondi
- og:title publié / local : Bar arrondi — Setup Paris / Bar arrondi — Location événementielle \| Setup Paris
- og:description publié / local : Bar arrondi de 2,8 m pour un accueil ou un service, finition plaqué chromé ou stratifié marbre en option. / Bar arrondi de 2,8 m de long pour un accueil, un service traiteur ou un cocktail. Sa forme courbe structure l'espace et facilite le service. Finition
- og:image publié / local : Photo produit : bar-arrondi-1794598842618.png / Photo produit : bar-arrondi-1794598842618.png (1200 px)
- Images/alt publiés : Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur; Photo produit : 1777546380003-oqh8e9.png → Pouf / Assise
- Images/alt locaux : Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier; Photo produit : 1777544975776-65lgoj.png → Stèle Miroir — Mobilier
- Liens internes publiés (6) : /catalogue, /sur-mesure/bar, /produit/podium, /produit/mange-debout, /produit/triporteur, /produit/pouf
- Liens internes locaux (6) : /catalogue, /sur-mesure/bar, /produit/podium, /produit/mange-debout, /produit/triporteur, /produit/stele-miroir
- Product local : description 277 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/bar-droit

- Title publié : Bar droit — Setup Paris
- Description publiée : Bar droit de 2 m en stratifié aluminium brossé, pour un service ou un accueil.
- Title local (49 car.) : Bar droit — Location événementielle \| Setup Paris
- Description locale (148 car.) : Bar droit de 2 m de long, 1,10 m de haut et 80 cm de profondeur, en stratifié aluminium brossé, pour un accueil, un service ou un comptoir de stand.
- H1 : Bar droit
- Canonical publié / local : /produit/bar-droit / /produit/bar-droit
- Hreflang publié : fr=/produit/bar-droit, en=/en/produit/bar-droit, x-default=/produit/bar-droit
- Hreflang local : fr=/produit/bar-droit, en=/en/produit/bar-droit, x-default=/produit/bar-droit
- og:title publié / local : Bar droit — Setup Paris / Bar droit — Location événementielle \| Setup Paris
- og:description publié / local : Bar droit de 2 m en stratifié aluminium brossé, pour un service ou un accueil. / Bar droit de 2 m de long, 1,10 m de haut et 80 cm de profondeur, en stratifié aluminium brossé, pour un accueil, un service ou un comptoir de stand.
- og:image publié / local : Photo produit : bar-droit-1794598847891.png / Photo produit : bar-droit-1794598847891.png (1200 px)
- Images/alt publiés : Photo produit : bar-droit-1794598847891.png → Bar droit; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur
- Images/alt locaux : Photo produit : bar-droit-1794598847891.png → Bar droit — Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier
- Liens internes publiés (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Liens internes locaux (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Product local : description 279 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/box-cabine

- Title publié : Box cabine — Setup Paris
- Description publiée : Cabine sur châssis pour un espace privatif, une activation ou un photomaton, habillable toutes faces.
- Title local (50 car.) : Box cabine — Location événementielle \| Setup Paris
- Description locale (153 car.) : Box cabine sur châssis, environ 2 × 1 × 2,5 m, pour créer un espace privatif, une cabine photo, un espace d'écoute ou une activation de marque. Habillage
- H1 : Box cabine
- Canonical publié / local : /produit/box-cabine / /produit/box-cabine
- Hreflang publié : fr=/produit/box-cabine, en=/en/produit/box-cabine, x-default=/produit/box-cabine
- Hreflang local : fr=/produit/box-cabine, en=/en/produit/box-cabine, x-default=/produit/box-cabine
- og:title publié / local : Box cabine — Setup Paris / Box cabine — Location événementielle \| Setup Paris
- og:description publié / local : Cabine sur châssis pour un espace privatif, une activation ou un photomaton, habillable toutes faces. / Box cabine sur châssis, environ 2 × 1 × 2,5 m, pour créer un espace privatif, une cabine photo, un espace d'écoute ou une activation de marque. Habillage
- og:image publié / local : Photo produit : box-cabine-1794598852335.png / Photo produit : box-cabine-1794598852335.png (1200 px)
- Images/alt publiés : Photo produit : box-cabine-1794598852335.png → Box cabine; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia; Photo produit : auvent.png → Auvent Personnalisable; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté
- Images/alt locaux : Photo produit : box-cabine-1794598852335.png → Box cabine — Structures; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : auvent.png → Auvent Personnalisable — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté — Structures
- Liens internes publiés (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte
- Liens internes locaux (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte
- Product local : description 275 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/chamboule-tout

- Title publié : Chamboule-tout — Setup Paris
- Description publiée : Le grand classique des fêtes foraines, revisité par SET UP. Notre chamboule-tout événementiel se personnalise intégralement : couleur de structure, graphisme de
- Title local (54 car.) : Chamboule-tout — Location événementielle \| Setup Paris
- Description locale (147 car.) : Le grand classique des fêtes foraines, revisité par SET UP. Notre chamboule-tout événementiel se personnalise intégralement : couleur de structure,
- H1 : Chamboule-tout
- Canonical publié / local : /produit/chamboule-tout / /produit/chamboule-tout
- Hreflang publié : fr=/produit/chamboule-tout, en=/en/produit/chamboule-tout, x-default=/produit/chamboule-tout
- Hreflang local : fr=/produit/chamboule-tout, en=/en/produit/chamboule-tout, x-default=/produit/chamboule-tout
- og:title publié / local : Chamboule-tout — Setup Paris / Chamboule-tout — Location événementielle \| Setup Paris
- og:description publié / local : Le grand classique des fêtes foraines, revisité par SET UP. Notre chamboule-tout événementiel se personnalise intégralement : couleur de structure, graphisme de / Le grand classique des fêtes foraines, revisité par SET UP. Notre chamboule-tout événementiel se personnalise intégralement : couleur de structure,
- og:image publié / local : Photo produit : 1777546178517-4sdg4e.jpg / Photo produit : 1777546178517-4sdg4e.jpg (1200 px)
- Images/alt publiés : Photo produit : 1777546178517-4sdg4e.jpg → Chamboule-tout; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant; Photo produit : 1777543737980-j52rup.jpg → Plinko
- Images/alt locaux : Photo produit : 1777546178517-4sdg4e.jpg → Chamboule-tout — Jeux; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball — Jeux; Photo produit : 1777543043347-ze8rul.png → Cornhole — Jeux; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant — Jeux; Photo produit : 1777543737980-j52rup.jpg → Plinko — Jeux
- Liens internes publiés (5) : /catalogue, /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/plinko
- Liens internes locaux (5) : /catalogue, /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/plinko
- Product local : description 487 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/chassis-borgniole-noir-2m2

- Title publié : Châssis borgniolé noir — bandeau — Setup Paris
- Description publiée : Bandeau de borgniol noir sur châssis, en complément des grands châssis.
- Title local (46 car.) : Châssis borgniolé noir — bandeau — Setup Paris
- Description locale (150 car.) : Bandeau de 4 × 0,5 m tendu de borgniol noir, pour compléter les grands châssis, masquer un pied de scène ou habiller une régie. Papier imprimé posé en
- H1 : Châssis borgniolé noir — bandeau
- Canonical publié / local : /produit/chassis-borgniole-noir-2m2 / /produit/chassis-borgniole-noir-2m2
- Hreflang publié : fr=/produit/chassis-borgniole-noir-2m2, en=/en/produit/chassis-borgniole-noir-2m2, x-default=/produit/chassis-borgniole-noir-2m2
- Hreflang local : fr=/produit/chassis-borgniole-noir-2m2, en=/en/produit/chassis-borgniole-noir-2m2, x-default=/produit/chassis-borgniole-noir-2m2
- og:title publié / local : Châssis borgniolé noir — bandeau — Setup Paris / Châssis borgniolé noir — bandeau — Setup Paris
- og:description publié / local : Bandeau de borgniol noir sur châssis, en complément des grands châssis. / Bandeau de 4 × 0,5 m tendu de borgniol noir, pour compléter les grands châssis, masquer un pied de scène ou habiller une régie. Papier imprimé posé en
- og:image publié / local : Photo produit : chassis-borgniole-noir-2m2-1794598845844.png / Photo produit : chassis-borgniole-noir-2m2-1794598845844.png (1200 px)
- Images/alt publiés : Photo produit : chassis-borgniole-noir-2m2-1794598845844.png → Châssis borgniolé noir — bandeau; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia; Photo produit : auvent.png → Auvent Personnalisable; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté
- Images/alt locaux : Photo produit : chassis-borgniole-noir-2m2-1794598845844.png → Châssis borgniolé noir — bandeau — Structures; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : auvent.png → Auvent Personnalisable — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté — Structures
- Liens internes publiés (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte
- Liens internes locaux (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte
- Product local : description 276 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/chassis-borgniole-noir-5m2

- Title publié : Châssis borgniolé noir — grand — Setup Paris
- Description publiée : Châssis tendu de borgniol noir pour masquer, occulter ou habiller un espace.
- Title local (44 car.) : Châssis borgniolé noir — grand — Setup Paris
- Description locale (151 car.) : Châssis de 4 × 1,25 m tendu de borgniol noir pour masquer, occulter ou habiller un espace : coulisses, régie, fond de scène, plateau TV. Papier imprimé
- H1 : Châssis borgniolé noir — grand
- Canonical publié / local : /produit/chassis-borgniole-noir-5m2 / /produit/chassis-borgniole-noir-5m2
- Hreflang publié : fr=/produit/chassis-borgniole-noir-5m2, en=/en/produit/chassis-borgniole-noir-5m2, x-default=/produit/chassis-borgniole-noir-5m2
- Hreflang local : fr=/produit/chassis-borgniole-noir-5m2, en=/en/produit/chassis-borgniole-noir-5m2, x-default=/produit/chassis-borgniole-noir-5m2
- og:title publié / local : Châssis borgniolé noir — grand — Setup Paris / Châssis borgniolé noir — grand — Setup Paris
- og:description publié / local : Châssis tendu de borgniol noir pour masquer, occulter ou habiller un espace. / Châssis de 4 × 1,25 m tendu de borgniol noir pour masquer, occulter ou habiller un espace : coulisses, régie, fond de scène, plateau TV. Papier imprimé
- og:image publié / local : Photo produit : chassis-borgniole-noir-5m2-1794598845390.png / Photo produit : chassis-borgniole-noir-5m2-1794598845390.png (1200 px)
- Images/alt publiés : Photo produit : chassis-borgniole-noir-5m2-1794598845390.png → Châssis borgniolé noir — grand; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia; Photo produit : auvent.png → Auvent Personnalisable; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté
- Images/alt locaux : Photo produit : chassis-borgniole-noir-5m2-1794598845390.png → Châssis borgniolé noir — grand — Structures; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : auvent.png → Auvent Personnalisable — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté — Structures
- Liens internes publiés (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte
- Liens internes locaux (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte
- Product local : description 320 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/chassis-imprime

- Title publié : Châssis imprimé — Setup Paris
- Description publiée : Châssis de 3 × 1 m pour bâche imprimée tendue : fond de marque, signalétique, photocall.
- Title local (55 car.) : Châssis imprimé — Location événementielle \| Setup Paris
- Description locale (155 car.) : Châssis de 3 × 1 m recevant une bâche imprimée tendue : fond de marque, signalétique, photocall ou habillage d'espace. Impression de votre visuel en option
- H1 : Châssis imprimé
- Canonical publié / local : /produit/chassis-imprime / /produit/chassis-imprime
- Hreflang publié : fr=/produit/chassis-imprime, en=/en/produit/chassis-imprime, x-default=/produit/chassis-imprime
- Hreflang local : fr=/produit/chassis-imprime, en=/en/produit/chassis-imprime, x-default=/produit/chassis-imprime
- og:title publié / local : Châssis imprimé — Setup Paris / Châssis imprimé — Location événementielle \| Setup Paris
- og:description publié / local : Châssis de 3 × 1 m pour bâche imprimée tendue : fond de marque, signalétique, photocall. / Châssis de 3 × 1 m recevant une bâche imprimée tendue : fond de marque, signalétique, photocall ou habillage d'espace. Impression de votre visuel en option
- og:image publié / local : Photo produit : chassis-imprime-1794598846331.png / Photo produit : chassis-imprime-1794598846331.png (1200 px)
- Images/alt publiés : Photo produit : chassis-imprime-1794598846331.png → Châssis imprimé; Photo produit : 1777547928218-y3xuzi.png → PhotoBooth Balançoire
- Images/alt locaux : Photo produit : chassis-imprime-1794598846331.png → Châssis imprimé — Signalétique; Photo produit : 1777547928218-y3xuzi.png → PhotoBooth Balançoire — Signalétique
- Liens internes publiés (2) : /catalogue, /produit/photobooth-balancoire
- Liens internes locaux (2) : /catalogue, /produit/photobooth-balancoire
- Product local : description 283 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/chassis-plaque-autoporte

- Title publié : Châssis plaqué autoporté — Setup Paris
- Description publiée : Châssis plaqué autoporté sur méplat, pour cloisonner un espace, créer un fond ou porter une signalétique.
- Title local (64 car.) : Châssis plaqué autoporté — Location événementielle \| Setup Paris
- Description locale (155 car.) : Châssis plaqué autoporté sur méplat, jusqu'à 1 × 2,5 m, pour cloisonner un espace, créer un fond ou porter une signalétique sur un salon, une exposition ou
- H1 : Châssis plaqué autoporté
- Canonical publié / local : /produit/chassis-plaque-autoporte / /produit/chassis-plaque-autoporte
- Hreflang publié : fr=/produit/chassis-plaque-autoporte, en=/en/produit/chassis-plaque-autoporte, x-default=/produit/chassis-plaque-autoporte
- Hreflang local : fr=/produit/chassis-plaque-autoporte, en=/en/produit/chassis-plaque-autoporte, x-default=/produit/chassis-plaque-autoporte
- og:title publié / local : Châssis plaqué autoporté — Setup Paris / Châssis plaqué autoporté — Location événementielle \| Setup Paris
- og:description publié / local : Châssis plaqué autoporté sur méplat, pour cloisonner un espace, créer un fond ou porter une signalétique. / Châssis plaqué autoporté sur méplat, jusqu'à 1 × 2,5 m, pour cloisonner un espace, créer un fond ou porter une signalétique sur un salon, une exposition ou
- og:image publié / local : Photo produit : chassis-plaque-autoporte-1794598843772.png / Photo produit : chassis-plaque-autoporte-1794598843772.png (1200 px)
- Images/alt publiés : Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia; Photo produit : auvent.png → Auvent Personnalisable; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds; Photo produit : mur-autoporte-1794598844256.png → Mur autoporté
- Images/alt locaux : Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté — Structures; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : auvent.png → Auvent Personnalisable — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds — Structures; Photo produit : mur-autoporte-1794598844256.png → Mur autoporté — Structures
- Liens internes publiés (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/mur-autoporte
- Liens internes locaux (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/mur-autoporte
- Product local : description 298 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/cimaise-sur-platine

- Title publié : Cimaise sur platine — Setup Paris
- Description publiée : Cimaise autoportée sur platine pour exposer visuels, œuvres ou informations.
- Title local (59 car.) : Cimaise sur platine — Location événementielle \| Setup Paris
- Description locale (151 car.) : Cimaise autoportée de 1 × 2,5 m sur platine pour exposer des visuels, des œuvres ou des informations : exposition, galerie éphémère, salon, parcours de
- H1 : Cimaise sur platine
- Canonical publié / local : /produit/cimaise-sur-platine / /produit/cimaise-sur-platine
- Hreflang publié : fr=/produit/cimaise-sur-platine, en=/en/produit/cimaise-sur-platine, x-default=/produit/cimaise-sur-platine
- Hreflang local : fr=/produit/cimaise-sur-platine, en=/en/produit/cimaise-sur-platine, x-default=/produit/cimaise-sur-platine
- og:title publié / local : Cimaise sur platine — Setup Paris / Cimaise sur platine — Location événementielle \| Setup Paris
- og:description publié / local : Cimaise autoportée sur platine pour exposer visuels, œuvres ou informations. / Cimaise autoportée de 1 × 2,5 m sur platine pour exposer des visuels, des œuvres ou des informations : exposition, galerie éphémère, salon, parcours de
- og:image publié / local : Photo produit : cimaise-sur-platine-1794598844903.png / Photo produit : cimaise-sur-platine-1794598844903.png (1200 px)
- Images/alt publiés : Photo produit : cimaise-sur-platine-1794598844903.png → Cimaise sur platine; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia; Photo produit : auvent.png → Auvent Personnalisable; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté
- Images/alt locaux : Photo produit : cimaise-sur-platine-1794598844903.png → Cimaise sur platine — Structures; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : auvent.png → Auvent Personnalisable — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté — Structures
- Liens internes publiés (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte
- Liens internes locaux (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte
- Product local : description 289 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/cornhole

- Title publié : Cornhole — Setup Paris
- Description publiée : Jeu de lancer américain, idéal pour les animations en extérieur.
- Title local (48 car.) : Cornhole — Location événementielle \| Setup Paris
- Description locale (153 car.) : Cornhole, jeu de lancer de sacs venu des États-Unis : deux planches inclinées percées, des sacs à lancer, des parties rapides accessibles à tous. Parfait
- H1 : Cornhole
- Canonical publié / local : /produit/cornhole / /produit/cornhole
- Hreflang publié : fr=/produit/cornhole, en=/en/produit/cornhole, x-default=/produit/cornhole
- Hreflang local : fr=/produit/cornhole, en=/en/produit/cornhole, x-default=/produit/cornhole
- og:title publié / local : Cornhole — Setup Paris / Cornhole — Location événementielle \| Setup Paris
- og:description publié / local : Jeu de lancer américain, idéal pour les animations en extérieur. / Cornhole, jeu de lancer de sacs venu des États-Unis : deux planches inclinées percées, des sacs à lancer, des parties rapides accessibles à tous. Parfait
- og:image publié / local : Photo produit : 1777543043347-ze8rul.png / Photo produit : 1777543043347-ze8rul.png (1200 px)
- Images/alt publiés : Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant; Photo produit : 1777543737980-j52rup.jpg → Plinko; Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf
- Images/alt locaux : Photo produit : 1777543043347-ze8rul.png → Cornhole — Jeux; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball — Jeux; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant — Jeux; Photo produit : 1777543737980-j52rup.jpg → Plinko — Jeux; Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf — Jeux
- Liens internes publiés (5) : /catalogue, /produit/panier-basketball, /produit/puissance-4, /produit/plinko, /produit/mini-golf
- Liens internes locaux (5) : /catalogue, /produit/panier-basketball, /produit/puissance-4, /produit/plinko, /produit/mini-golf
- Product local : description 396 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /produit/dj-booth

- Title publié : DJ booth — Setup Paris
- Description publiée : Cabine DJ, personnalisable en peinture ou laque avec LED.
- Title local (48 car.) : DJ booth — Location événementielle \| Setup Paris
- Description locale (154 car.) : Cabine DJ pour soirées, lancements et événements de marque. Personnalisable en peinture ou en laque, avec éclairage LED. Dimensions précisées sur demande.
- H1 : DJ booth
- Canonical publié / local : /produit/dj-booth / /produit/dj-booth
- Hreflang publié : fr=/produit/dj-booth, en=/en/produit/dj-booth, x-default=/produit/dj-booth
- Hreflang local : fr=/produit/dj-booth, en=/en/produit/dj-booth, x-default=/produit/dj-booth
- og:title publié / local : DJ booth — Setup Paris / DJ booth — Location événementielle \| Setup Paris
- og:description publié / local : Cabine DJ, personnalisable en peinture ou laque avec LED. / Cabine DJ pour soirées, lancements et événements de marque. Personnalisable en peinture ou en laque, avec éclairage LED. Dimensions précisées sur demande.
- og:image publié / local : Photo produit : dj-booth-1794598851542.png / Photo produit : dj-booth-1794598851542.png (1200 px)
- Images/alt publiés : Photo produit : dj-booth-1794598851542.png → DJ booth; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur
- Images/alt locaux : Photo produit : dj-booth-1794598851542.png → DJ booth — Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier
- Liens internes publiés (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Liens internes locaux (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Product local : description 237 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/lettres-geantes

- Title publié : Lettres Géantes — Setup Paris
- Description publiée : Lettres en volume personnalisables pour vos événements.
- Title local (55 car.) : Lettres Géantes — Location événementielle \| Setup Paris
- Description locale (149 car.) : Lettres géantes en volume, hauteur 1 m et profondeur 15 cm, pour écrire un nom de marque, un mot ou un hashtag au cœur de votre événement. Idéales en
- H1 : Lettres Géantes
- Canonical publié / local : /produit/lettres-geantes / /produit/lettres-geantes
- Hreflang publié : fr=/produit/lettres-geantes, en=/en/produit/lettres-geantes, x-default=/produit/lettres-geantes
- Hreflang local : fr=/produit/lettres-geantes, en=/en/produit/lettres-geantes, x-default=/produit/lettres-geantes
- og:title publié / local : Lettres Géantes — Setup Paris / Lettres Géantes — Location événementielle \| Setup Paris
- og:description publié / local : Lettres en volume personnalisables pour vos événements. / Lettres géantes en volume, hauteur 1 m et profondeur 15 cm, pour écrire un nom de marque, un mot ou un hashtag au cœur de votre événement. Idéales en
- og:image publié / local : Photo produit : lettres-geantes.jpg / Photo produit : lettres-geantes.jpg (1200 px)
- Images/alt publiés : Photo produit : lettres-geantes.jpg → Lettres Géantes; Photo produit : 1780640879229-lu39vb.jpeg → Stèle
- Images/alt locaux : Photo produit : lettres-geantes.jpg → Lettres Géantes — Décoration; Photo produit : 1780640879229-lu39vb.jpeg → Stèle — Décoration
- Liens internes publiés (3) : /catalogue, /sur-mesure/lettres, /produit/stele
- Liens internes locaux (3) : /catalogue, /sur-mesure/lettres, /produit/stele
- Product local : description 317 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/mange-debout

- Title publié : Mange-Debout — Setup Paris
- Description publiée : Table haute pour cocktails.
- Title local (52 car.) : Mange-Debout — Location événementielle \| Setup Paris
- Description locale (150 car.) : Mange-debout, table haute pour cocktails, afterworks, salons et espaces de networking. Un mobilier simple qui favorise les échanges debout. Remise sur
- H1 : Mange-Debout
- Canonical publié / local : /produit/mange-debout / /produit/mange-debout
- Hreflang publié : fr=/produit/mange-debout, en=/en/produit/mange-debout, x-default=/produit/mange-debout
- Hreflang local : fr=/produit/mange-debout, en=/en/produit/mange-debout, x-default=/produit/mange-debout
- og:title publié / local : Mange-Debout — Setup Paris / Mange-Debout — Location événementielle \| Setup Paris
- og:description publié / local : Table haute pour cocktails. / Mange-debout, table haute pour cocktails, afterworks, salons et espaces de networking. Un mobilier simple qui favorise les échanges debout. Remise sur
- og:image publié / local : Photo produit : mange-debout.png / Photo produit : mange-debout.png (1200 px)
- Images/alt publiés : Photo produit : mange-debout.png → Mange-Debout; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : triporteur.png → Triporteur; Photo produit : 1777546380003-oqh8e9.png → Pouf / Assise
- Images/alt locaux : Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier; Photo produit : 1777544975776-65lgoj.png → Stèle Miroir — Mobilier
- Liens internes publiés (6) : /catalogue, /sur-mesure/mangeDebout, /produit/bar-arrondi, /produit/podium, /produit/triporteur, /produit/pouf
- Liens internes locaux (6) : /catalogue, /sur-mesure/mangeDebout, /produit/bar-arrondi, /produit/podium, /produit/triporteur, /produit/stele-miroir
- Product local : description 257 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /produit/mini-golf

- Title publié : Mini-Golf — Setup Paris
- Description publiée : Parcours de mini-golf modulable.
- Title local (49 car.) : Mini-Golf — Location événementielle \| Setup Paris
- Description locale (148 car.) : Parcours de mini-golf modulable pour animer un stand, un village d'entreprise, un séminaire ou une soirée. Les obstacles se combinent selon l'espace
- H1 : Mini-Golf
- Canonical publié / local : /produit/mini-golf / /produit/mini-golf
- Hreflang publié : fr=/produit/mini-golf, en=/en/produit/mini-golf, x-default=/produit/mini-golf
- Hreflang local : fr=/produit/mini-golf, en=/en/produit/mini-golf, x-default=/produit/mini-golf
- og:title publié / local : Mini-Golf — Setup Paris / Mini-Golf — Location événementielle \| Setup Paris
- og:description publié / local : Parcours de mini-golf modulable. / Parcours de mini-golf modulable pour animer un stand, un village d'entreprise, un séminaire ou une soirée. Les obstacles se combinent selon l'espace
- og:image publié / local : Photo produit : 1777542191380-3w77wj.jpg / Photo produit : 1777542191380-3w77wj.jpg (1200 px)
- Images/alt publiés : Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant; Photo produit : 1777543737980-j52rup.jpg → Plinko
- Images/alt locaux : Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf — Jeux; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball — Jeux; Photo produit : 1777543043347-ze8rul.png → Cornhole — Jeux; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant — Jeux; Photo produit : 1777543737980-j52rup.jpg → Plinko — Jeux
- Liens internes publiés (5) : /catalogue, /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/plinko
- Liens internes locaux (5) : /catalogue, /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/plinko
- Product local : description 331 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /produit/mirolege

- Title publié : Mirolège — Setup Paris
- Description publiée : Panneau miroir léger de 4 m sur béquilles pour plateaux et décors.
- Title local (48 car.) : Mirolège — Location événementielle \| Setup Paris
- Description locale (152 car.) : Mirolège : panneau miroir léger de 1 × 4 m sur béquilles, pour agrandir visuellement un espace, créer des reflets sur un plateau TV ou une scénographie.
- H1 : Mirolège
- Canonical publié / local : /produit/mirolege / /produit/mirolege
- Hreflang publié : fr=/produit/mirolege, en=/en/produit/mirolege, x-default=/produit/mirolege
- Hreflang local : fr=/produit/mirolege, en=/en/produit/mirolege, x-default=/produit/mirolege
- og:title publié / local : Mirolège — Setup Paris / Mirolège — Location événementielle \| Setup Paris
- og:description publié / local : Panneau miroir léger de 4 m sur béquilles pour plateaux et décors. / Mirolège : panneau miroir léger de 1 × 4 m sur béquilles, pour agrandir visuellement un espace, créer des reflets sur un plateau TV ou une scénographie.
- og:image publié / local : Photo produit : mirolege-1794598851939.png / Photo produit : mirolege-1794598851939.png (1200 px)
- Images/alt publiés : Photo produit : mirolege-1794598851939.png → Mirolège; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia; Photo produit : auvent.png → Auvent Personnalisable; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté
- Images/alt locaux : Photo produit : mirolege-1794598851939.png → Mirolège — Structures; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : auvent.png → Auvent Personnalisable — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté — Structures
- Liens internes publiés (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte
- Liens internes locaux (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte
- Product local : description 272 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/mur-autoporte

- Title publié : Mur autoporté — Setup Paris
- Description publiée : Mur autoporté de 3,5 m de long pour un fond de scène, un photocall ou un mur de marque.
- Title local (53 car.) : Mur autoporté — Location événementielle \| Setup Paris
- Description locale (149 car.) : Mur autoporté de 3,5 × 2,5 m pour un fond de scène, un photocall, un mur de marque ou une séparation d'espace. Peinture à la teinte de votre choix en
- H1 : Mur autoporté
- Canonical publié / local : /produit/mur-autoporte / /produit/mur-autoporte
- Hreflang publié : fr=/produit/mur-autoporte, en=/en/produit/mur-autoporte, x-default=/produit/mur-autoporte
- Hreflang local : fr=/produit/mur-autoporte, en=/en/produit/mur-autoporte, x-default=/produit/mur-autoporte
- og:title publié / local : Mur autoporté — Setup Paris / Mur autoporté — Location événementielle \| Setup Paris
- og:description publié / local : Mur autoporté de 3,5 m de long pour un fond de scène, un photocall ou un mur de marque. / Mur autoporté de 3,5 × 2,5 m pour un fond de scène, un photocall, un mur de marque ou une séparation d'espace. Peinture à la teinte de votre choix en
- og:image publié / local : Photo produit : mur-autoporte-1794598844256.png / Photo produit : mur-autoporte-1794598844256.png (1200 px)
- Images/alt publiés : Photo produit : mur-autoporte-1794598844256.png → Mur autoporté; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia; Photo produit : auvent.png → Auvent Personnalisable; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté
- Images/alt locaux : Photo produit : mur-autoporte-1794598844256.png → Mur autoporté — Structures; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : auvent.png → Auvent Personnalisable — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté — Structures
- Liens internes publiés (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte
- Liens internes locaux (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte
- Product local : description 256 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/panier-basketball

- Title publié : Panier de Basketball — Setup Paris
- Description publiée : Panier de basketball professionnel pour animations événementielles.
- Title local (60 car.) : Panier de Basketball — Location événementielle \| Setup Paris
- Description locale (150 car.) : Panier de basketball événementiel pour des défis d'adresse sur un stand, un salon, un tournage ou une soirée d'entreprise. Une animation qui attire le
- H1 : Panier de Basketball
- Canonical publié / local : /produit/panier-basketball / /produit/panier-basketball
- Hreflang publié : fr=/produit/panier-basketball, en=/en/produit/panier-basketball, x-default=/produit/panier-basketball
- Hreflang local : fr=/produit/panier-basketball, en=/en/produit/panier-basketball, x-default=/produit/panier-basketball
- og:title publié / local : Panier de Basketball — Setup Paris / Panier de Basketball — Location événementielle \| Setup Paris
- og:description publié / local : Panier de basketball professionnel pour animations événementielles. / Panier de basketball événementiel pour des défis d'adresse sur un stand, un salon, un tournage ou une soirée d'entreprise. Une animation qui attire le
- og:image publié / local : Photo produit : 1777542145171-dwbrhe.png / Photo produit : 1777542145171-dwbrhe.png (1200 px)
- Images/alt publiés : Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant; Photo produit : 1777543737980-j52rup.jpg → Plinko; Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf
- Images/alt locaux : Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball — Jeux; Photo produit : 1777543043347-ze8rul.png → Cornhole — Jeux; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant — Jeux; Photo produit : 1777543737980-j52rup.jpg → Plinko — Jeux; Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf — Jeux
- Liens internes publiés (5) : /catalogue, /produit/cornhole, /produit/puissance-4, /produit/plinko, /produit/mini-golf
- Liens internes locaux (5) : /catalogue, /produit/cornhole, /produit/puissance-4, /produit/plinko, /produit/mini-golf
- Product local : description 396 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /produit/photobooth-balancoire

- Title publié : PhotoBooth Balançoire — Setup Paris
- Description publiée : PhotoBooth original avec balançoire intégrée. Habillage extérieur et intérieur personnalisables, LED, logo et balançoire au choix.
- Title local (61 car.) : PhotoBooth Balançoire — Location événementielle \| Setup Paris
- Description locale (130 car.) : PhotoBooth original avec balançoire intégrée. Habillage extérieur et intérieur personnalisables, LED, logo et balançoire au choix.
- H1 : PhotoBooth Balançoire
- Canonical publié / local : /produit/photobooth-balancoire / /produit/photobooth-balancoire
- Hreflang publié : fr=/produit/photobooth-balancoire, en=/en/produit/photobooth-balancoire, x-default=/produit/photobooth-balancoire
- Hreflang local : fr=/produit/photobooth-balancoire, en=/en/produit/photobooth-balancoire, x-default=/produit/photobooth-balancoire
- og:title publié / local : PhotoBooth Balançoire — Setup Paris / PhotoBooth Balançoire — Location événementielle \| Setup Paris
- og:description publié / local : PhotoBooth original avec balançoire intégrée. Habillage extérieur et intérieur personnalisables, LED, logo et balançoire au choix. / PhotoBooth original avec balançoire intégrée. Habillage extérieur et intérieur personnalisables, LED, logo et balançoire au choix.
- og:image publié / local : Photo produit : 1777547928218-y3xuzi.png / Photo produit : 1777547928218-y3xuzi.png (1200 px)
- Images/alt publiés : Photo produit : 1777547928218-y3xuzi.png → PhotoBooth Balançoire; Photo produit : chassis-imprime-1794598846331.png → Châssis imprimé
- Images/alt locaux : Photo produit : 1777547928218-y3xuzi.png → PhotoBooth Balançoire — Signalétique; Photo produit : chassis-imprime-1794598846331.png → Châssis imprimé — Signalétique
- Liens internes publiés (2) : /catalogue, /produit/chassis-imprime
- Liens internes locaux (2) : /catalogue, /produit/chassis-imprime
- Product local : description 130 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/plinko

- Title publié : Plinko — Setup Paris
- Description publiée : Jeu de hasard spectaculaire avec billes et obstacles.
- Title local (46 car.) : Plinko — Location événementielle \| Setup Paris
- Description locale (155 car.) : Plinko géant : une bille lâchée en haut du plateau rebondit sur les obstacles jusqu'à une case gagnante. Un jeu de hasard spectaculaire pour des tirages au
- H1 : Plinko
- Canonical publié / local : /produit/plinko / /produit/plinko
- Hreflang publié : fr=/produit/plinko, en=/en/produit/plinko, x-default=/produit/plinko
- Hreflang local : fr=/produit/plinko, en=/en/produit/plinko, x-default=/produit/plinko
- og:title publié / local : Plinko — Setup Paris / Plinko — Location événementielle \| Setup Paris
- og:description publié / local : Jeu de hasard spectaculaire avec billes et obstacles. / Plinko géant : une bille lâchée en haut du plateau rebondit sur les obstacles jusqu'à une case gagnante. Un jeu de hasard spectaculaire pour des tirages au
- og:image publié / local : Photo produit : 1777543737980-j52rup.jpg / Photo produit : 1777543737980-j52rup.jpg (1200 px)
- Images/alt publiés : Photo produit : 1777543737980-j52rup.jpg → Plinko; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant; Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf
- Images/alt locaux : Photo produit : 1777543737980-j52rup.jpg → Plinko — Jeux; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball — Jeux; Photo produit : 1777543043347-ze8rul.png → Cornhole — Jeux; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant — Jeux; Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf — Jeux
- Liens internes publiés (5) : /catalogue, /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/mini-golf
- Liens internes locaux (5) : /catalogue, /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/mini-golf
- Product local : description 347 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /produit/podium

- Title publié : Podium triptyque — Setup Paris
- Description publiée : Ensemble de trois podiums de tailles dégressives pour une mise en scène de produits ou une remise de prix.
- Title local (56 car.) : Podium triptyque — Location événementielle \| Setup Paris
- Description locale (155 car.) : Podium triptyque : trois podiums de tailles dégressives (bases de 1,5 m, 1 m et 0,5 m, 40 cm de haut chacune) pour mettre en scène des produits, une remise
- H1 : Podium triptyque
- Canonical publié / local : /produit/podium / /produit/podium
- Hreflang publié : fr=/produit/podium, en=/en/produit/podium, x-default=/produit/podium
- Hreflang local : fr=/produit/podium, en=/en/produit/podium, x-default=/produit/podium
- og:title publié / local : Podium triptyque — Setup Paris / Podium triptyque — Location événementielle \| Setup Paris
- og:description publié / local : Ensemble de trois podiums de tailles dégressives pour une mise en scène de produits ou une remise de prix. / Podium triptyque : trois podiums de tailles dégressives (bases de 1,5 m, 1 m et 0,5 m, 40 cm de haut chacune) pour mettre en scène des produits, une remise
- og:image publié / local : Photo produit : 1780640415544-z8kjr6.jpeg / Photo produit : 1780640415544-z8kjr6.jpeg (1200 px)
- Images/alt publiés : Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur; Photo produit : 1777546380003-oqh8e9.png → Pouf / Assise
- Images/alt locaux : Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier; Photo produit : 1777544975776-65lgoj.png → Stèle Miroir — Mobilier
- Liens internes publiés (6) : /catalogue, /sur-mesure/podium, /produit/bar-arrondi, /produit/mange-debout, /produit/triporteur, /produit/pouf
- Liens internes locaux (6) : /catalogue, /sur-mesure/podium, /produit/bar-arrondi, /produit/mange-debout, /produit/triporteur, /produit/stele-miroir
- Product local : description 323 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/podium-rond

- Title publié : Podium rond — Setup Paris
- Description publiée : Podium circulaire pour mettre en scène un produit, un DJ ou une prise de parole.
- Title local (51 car.) : Podium rond — Location événementielle \| Setup Paris
- Description locale (154 car.) : Podium rond de 2 à 3 m de diamètre et 30 à 40 cm de haut pour mettre en scène un produit, un DJ, un artiste ou une prise de parole. Habillage du dessus et
- H1 : Podium rond
- Canonical publié / local : /produit/podium-rond / /produit/podium-rond
- Hreflang publié : fr=/produit/podium-rond, en=/en/produit/podium-rond, x-default=/produit/podium-rond
- Hreflang local : fr=/produit/podium-rond, en=/en/produit/podium-rond, x-default=/produit/podium-rond
- og:title publié / local : Podium rond — Setup Paris / Podium rond — Location événementielle \| Setup Paris
- og:description publié / local : Podium circulaire pour mettre en scène un produit, un DJ ou une prise de parole. / Podium rond de 2 à 3 m de diamètre et 30 à 40 cm de haut pour mettre en scène un produit, un DJ, un artiste ou une prise de parole. Habillage du dessus et
- og:image publié / local : Photo produit : podium-rond-1794600085097.png / Photo produit : podium-rond-1794600085097.png (1200 px)
- Images/alt publiés : Photo produit : podium-rond-1794600085097.png → Podium rond; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia; Photo produit : auvent.png → Auvent Personnalisable; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté
- Images/alt locaux : Photo produit : podium-rond-1794600085097.png → Podium rond — Structures; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : auvent.png → Auvent Personnalisable — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté — Structures
- Liens internes publiés (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte
- Liens internes locaux (5) : /catalogue, /produit/samias, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte
- Product local : description 281 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/pouf

- Title publié : Pouf / Assise — Setup Paris
- Description publiée : Pouf personnalisable en forme cylindrique, carrée ou rectangulaire. Habillage et coussin en option.
- Title local (53 car.) : Pouf / Assise — Location événementielle \| Setup Paris
- Description locale (152 car.) : Pouf de 40 cm de diamètre et 49 cm de haut, en forme cylindrique, carrée ou rectangulaire, pour composer un espace lounge, une zone d'attente ou un coin
- H1 : Pouf / Assise
- Canonical publié / local : /produit/pouf / /produit/pouf
- Hreflang publié : fr=/produit/pouf, en=/en/produit/pouf, x-default=/produit/pouf
- Hreflang local : fr=/produit/pouf, en=/en/produit/pouf, x-default=/produit/pouf
- og:title publié / local : Pouf / Assise — Setup Paris / Pouf / Assise — Location événementielle \| Setup Paris
- og:description publié / local : Pouf personnalisable en forme cylindrique, carrée ou rectangulaire. Habillage et coussin en option. / Pouf de 40 cm de diamètre et 49 cm de haut, en forme cylindrique, carrée ou rectangulaire, pour composer un espace lounge, une zone d'attente ou un coin
- og:image publié / local : Photo produit : 1777546380003-oqh8e9.png / Photo produit : 1777546380003-oqh8e9.png (1200 px)
- Images/alt publiés : Photo produit : 1777546380003-oqh8e9.png → Pouf / Assise; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur
- Images/alt locaux : Photo produit : 1777546380003-oqh8e9.png → Pouf / Assise — Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier
- Liens internes publiés (6) : /catalogue, /sur-mesure/pouf, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Liens internes locaux (6) : /catalogue, /sur-mesure/pouf, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Product local : description 319 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/praticable-sur-pieds

- Title publié : Praticable sur pieds — Setup Paris
- Description publiée : Praticable sur pieds de 40 cm de haut pour estrades et scènes basses, juponnable en tissu noir.
- Title local (60 car.) : Praticable sur pieds — Location événementielle \| Setup Paris
- Description locale (151 car.) : Praticable sur pieds de 40 cm de haut pour composer estrades, scènes basses et podiums. Jupe en tissu noir en option. Livré, installé et repris par nos
- H1 : Praticable sur pieds
- Canonical publié / local : /produit/praticable-sur-pieds / /produit/praticable-sur-pieds
- Hreflang publié : fr=/produit/praticable-sur-pieds, en=/en/produit/praticable-sur-pieds, x-default=/produit/praticable-sur-pieds
- Hreflang local : fr=/produit/praticable-sur-pieds, en=/en/produit/praticable-sur-pieds, x-default=/produit/praticable-sur-pieds
- og:title publié / local : Praticable sur pieds — Setup Paris / Praticable sur pieds — Location événementielle \| Setup Paris
- og:description publié / local : Praticable sur pieds de 40 cm de haut pour estrades et scènes basses, juponnable en tissu noir. / Praticable sur pieds de 40 cm de haut pour composer estrades, scènes basses et podiums. Jupe en tissu noir en option. Livré, installé et repris par nos
- og:image publié / local : Photo produit : praticable-sur-pieds-1794598843289.png / Photo produit : praticable-sur-pieds-1794598843289.png (1200 px)
- Images/alt publiés : Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia; Photo produit : auvent.png → Auvent Personnalisable; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté; Photo produit : mur-autoporte-1794598844256.png → Mur autoporté
- Images/alt locaux : Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds — Structures; Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : auvent.png → Auvent Personnalisable — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté — Structures; Photo produit : mur-autoporte-1794598844256.png → Mur autoporté — Structures
- Liens internes publiés (5) : /catalogue, /produit/samias, /produit/auvent, /produit/chassis-plaque-autoporte, /produit/mur-autoporte
- Liens internes locaux (5) : /catalogue, /produit/samias, /produit/auvent, /produit/chassis-plaque-autoporte, /produit/mur-autoporte
- Product local : description 200 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/puissance-4

- Title publié : Puissance 4 Géant — Setup Paris
- Description publiée : Version géante du célèbre jeu Puissance 4.
- Title local (57 car.) : Puissance 4 Géant — Location événementielle \| Setup Paris
- Description locale (148 car.) : Puissance 4 géant, la version grand format du célèbre jeu d'alignement, pour des parties conviviales entre collègues, visiteurs ou invités. Idéal en
- H1 : Puissance 4 Géant
- Canonical publié / local : /produit/puissance-4 / /produit/puissance-4
- Hreflang publié : fr=/produit/puissance-4, en=/en/produit/puissance-4, x-default=/produit/puissance-4
- Hreflang local : fr=/produit/puissance-4, en=/en/produit/puissance-4, x-default=/produit/puissance-4
- og:title publié / local : Puissance 4 Géant — Setup Paris / Puissance 4 Géant — Location événementielle \| Setup Paris
- og:description publié / local : Version géante du célèbre jeu Puissance 4. / Puissance 4 géant, la version grand format du célèbre jeu d'alignement, pour des parties conviviales entre collègues, visiteurs ou invités. Idéal en
- og:image publié / local : Photo produit : 1777543689794-or8pkd.png / Photo produit : 1777543689794-or8pkd.png (1200 px)
- Images/alt publiés : Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543737980-j52rup.jpg → Plinko; Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf
- Images/alt locaux : Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant — Jeux; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball — Jeux; Photo produit : 1777543043347-ze8rul.png → Cornhole — Jeux; Photo produit : 1777543737980-j52rup.jpg → Plinko — Jeux; Photo produit : 1777542191380-3w77wj.jpg → Mini-Golf — Jeux
- Liens internes publiés (5) : /catalogue, /produit/panier-basketball, /produit/cornhole, /produit/plinko, /produit/mini-golf
- Liens internes locaux (5) : /catalogue, /produit/panier-basketball, /produit/cornhole, /produit/plinko, /produit/mini-golf
- Product local : description 354 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /produit/pupitre-ceremonie

- Title publié : Pupitre de cérémonie — Setup Paris
- Description publiée : Pupitre de cérémonie pour remises de prix, discours et événements officiels.
- Title local (60 car.) : Pupitre de cérémonie — Location événementielle \| Setup Paris
- Description locale (154 car.) : Pupitre de cérémonie de 90 × 40 cm, 1,02 m de haut, pour remises de prix, discours, conférences de presse et événements officiels. Adhésif à votre logo en
- H1 : Pupitre de cérémonie
- Canonical publié / local : /produit/pupitre-ceremonie / /produit/pupitre-ceremonie
- Hreflang publié : fr=/produit/pupitre-ceremonie, en=/en/produit/pupitre-ceremonie, x-default=/produit/pupitre-ceremonie
- Hreflang local : fr=/produit/pupitre-ceremonie, en=/en/produit/pupitre-ceremonie, x-default=/produit/pupitre-ceremonie
- og:title publié / local : Pupitre de cérémonie — Setup Paris / Pupitre de cérémonie — Location événementielle \| Setup Paris
- og:description publié / local : Pupitre de cérémonie pour remises de prix, discours et événements officiels. / Pupitre de cérémonie de 90 × 40 cm, 1,02 m de haut, pour remises de prix, discours, conférences de presse et événements officiels. Adhésif à votre logo en
- og:image publié / local : Photo produit : pupitre-ceremonie-1794598850211.png / Photo produit : pupitre-ceremonie-1794598850211.png (1200 px)
- Images/alt publiés : Photo produit : pupitre-ceremonie-1794598850211.png → Pupitre de cérémonie; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur
- Images/alt locaux : Photo produit : pupitre-ceremonie-1794598850211.png → Pupitre de cérémonie — Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier
- Liens internes publiés (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Liens internes locaux (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Product local : description 245 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/pupitre-colonnes

- Title publié : Pupitre à colonnes — Setup Paris
- Description publiée : Pupitre en plexiglas sur colonne noire ou dorée.
- Title local (58 car.) : Pupitre à colonnes — Location événementielle \| Setup Paris
- Description locale (151 car.) : Pupitre en plexiglas sur colonne noire ou dorée, élégant et léger, pour conférences, tables rondes et prises de parole. Adhésif à votre logo en option.
- H1 : Pupitre à colonnes
- Canonical publié / local : /produit/pupitre-colonnes / /produit/pupitre-colonnes
- Hreflang publié : fr=/produit/pupitre-colonnes, en=/en/produit/pupitre-colonnes, x-default=/produit/pupitre-colonnes
- Hreflang local : fr=/produit/pupitre-colonnes, en=/en/produit/pupitre-colonnes, x-default=/produit/pupitre-colonnes
- og:title publié / local : Pupitre à colonnes — Setup Paris / Pupitre à colonnes — Location événementielle \| Setup Paris
- og:description publié / local : Pupitre en plexiglas sur colonne noire ou dorée. / Pupitre en plexiglas sur colonne noire ou dorée, élégant et léger, pour conférences, tables rondes et prises de parole. Adhésif à votre logo en option.
- og:image publié / local : Photo produit : pupitre-colonnes-1794598850650.png / Photo produit : pupitre-colonnes-1794598850650.png (1200 px)
- Images/alt publiés : Photo produit : pupitre-colonnes-1794598850650.png → Pupitre à colonnes; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur
- Images/alt locaux : Photo produit : pupitre-colonnes-1794598850650.png → Pupitre à colonnes — Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier
- Liens internes publiés (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Liens internes locaux (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Product local : description 268 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/pupitre-plexi-noir

- Title publié : Pupitre plexi caisson noir — Setup Paris
- Description publiée : Pupitre en plexiglas sur caisson noir pour les prises de parole et les conférences.
- Title local (40 car.) : Pupitre plexi caisson noir — Setup Paris
- Description locale (155 car.) : Pupitre en plexiglas sur caisson noir, 90 × 45 cm, 1 m de haut, pour conférences, séminaires et prises de parole sur scène. Adhésif à votre logo en option.
- H1 : Pupitre plexi caisson noir
- Canonical publié / local : /produit/pupitre-plexi-noir / /produit/pupitre-plexi-noir
- Hreflang publié : fr=/produit/pupitre-plexi-noir, en=/en/produit/pupitre-plexi-noir, x-default=/produit/pupitre-plexi-noir
- Hreflang local : fr=/produit/pupitre-plexi-noir, en=/en/produit/pupitre-plexi-noir, x-default=/produit/pupitre-plexi-noir
- og:title publié / local : Pupitre plexi caisson noir — Setup Paris / Pupitre plexi caisson noir — Setup Paris
- og:description publié / local : Pupitre en plexiglas sur caisson noir pour les prises de parole et les conférences. / Pupitre en plexiglas sur caisson noir, 90 × 45 cm, 1 m de haut, pour conférences, séminaires et prises de parole sur scène. Adhésif à votre logo en option.
- og:image publié / local : Photo produit : pupitre-plexi-noir-1794598849721.png / Photo produit : pupitre-plexi-noir-1794598849721.png (1200 px)
- Images/alt publiés : Photo produit : pupitre-plexi-noir-1794598849721.png → Pupitre plexi caisson noir; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur
- Images/alt locaux : Photo produit : pupitre-plexi-noir-1794598849721.png → Pupitre plexi caisson noir — Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier
- Liens internes publiés (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Liens internes locaux (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Product local : description 238 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/samias

- Title publié : Praticable Samia — Setup Paris
- Description publiée : Praticable modulable de 2 × 1 m pour composer scènes, estrades et podiums. Hauteur réglable de 14 à 47 cm, assemblage par blocs.
- Title local (56 car.) : Praticable Samia — Location événementielle \| Setup Paris
- Description locale (151 car.) : Praticable Samia de 2 × 1 m, hauteur réglable de 14 à 47 cm, à assembler par blocs pour composer scènes, estrades et podiums de toutes tailles. Jupe en
- H1 : Praticable Samia
- Canonical publié / local : /produit/samias / /produit/samias
- Hreflang publié : fr=/produit/samias, en=/en/produit/samias, x-default=/produit/samias
- Hreflang local : fr=/produit/samias, en=/en/produit/samias, x-default=/produit/samias
- og:title publié / local : Praticable Samia — Setup Paris / Praticable Samia — Location événementielle \| Setup Paris
- og:description publié / local : Praticable modulable de 2 × 1 m pour composer scènes, estrades et podiums. Hauteur réglable de 14 à 47 cm, assemblage par blocs. / Praticable Samia de 2 × 1 m, hauteur réglable de 14 à 47 cm, à assembler par blocs pour composer scènes, estrades et podiums de toutes tailles. Jupe en
- og:image publié / local : Photo produit : 1780642935830-p7n1l2.png / Photo produit : 1780642935830-p7n1l2.png (1200 px)
- Images/alt publiés : Photo produit : 1780642935830-p7n1l2.png → Praticable Samia; Photo produit : auvent.png → Auvent Personnalisable; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté; Photo produit : mur-autoporte-1794598844256.png → Mur autoporté
- Images/alt locaux : Photo produit : 1780642935830-p7n1l2.png → Praticable Samia — Structures; Photo produit : auvent.png → Auvent Personnalisable — Structures; Photo produit : praticable-sur-pieds-1794598843289.png → Praticable sur pieds — Structures; Photo produit : chassis-plaque-autoporte-1794598843772.png → Châssis plaqué autoporté — Structures; Photo produit : mur-autoporte-1794598844256.png → Mur autoporté — Structures
- Liens internes publiés (5) : /catalogue, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte, /produit/mur-autoporte
- Liens internes locaux (5) : /catalogue, /produit/auvent, /produit/praticable-sur-pieds, /produit/chassis-plaque-autoporte, /produit/mur-autoporte
- Product local : description 293 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/stand-de-tir

- Title publié : Stand de Tir — Setup Paris
- Description publiée : Stand de tir géant personnalisable pour vos événements ludiques.
- Title local (52 car.) : Stand de Tir — Location événementielle \| Setup Paris
- Description locale (155 car.) : Stand de tir géant, jeu d'adresse ludique et sans danger, pour une animation de stand, un salon, une fête d'entreprise ou une émission. Personnalisable aux
- H1 : Stand de Tir
- Canonical publié / local : /produit/stand-de-tir / /produit/stand-de-tir
- Hreflang publié : fr=/produit/stand-de-tir, en=/en/produit/stand-de-tir, x-default=/produit/stand-de-tir
- Hreflang local : fr=/produit/stand-de-tir, en=/en/produit/stand-de-tir, x-default=/produit/stand-de-tir
- og:title publié / local : Stand de Tir — Setup Paris / Stand de Tir — Location événementielle \| Setup Paris
- og:description publié / local : Stand de tir géant personnalisable pour vos événements ludiques. / Stand de tir géant, jeu d'adresse ludique et sans danger, pour une animation de stand, un salon, une fête d'entreprise ou une émission. Personnalisable aux
- og:image publié / local : Photo produit : 1777539884880-6v9tpq.png / Photo produit : 1777539884880-6v9tpq.png (1200 px)
- Images/alt publiés : Photo produit : 1777539884880-6v9tpq.png → Stand de Tir; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant; Photo produit : 1777543737980-j52rup.jpg → Plinko
- Images/alt locaux : Photo produit : 1777539884880-6v9tpq.png → Stand de Tir — Jeux; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball — Jeux; Photo produit : 1777543043347-ze8rul.png → Cornhole — Jeux; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant — Jeux; Photo produit : 1777543737980-j52rup.jpg → Plinko — Jeux
- Liens internes publiés (5) : /catalogue, /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/plinko
- Liens internes locaux (5) : /catalogue, /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/plinko
- Product local : description 306 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /produit/stele

- Title publié : Stèle — Setup Paris
- Description publiée : Stèle d'accueil personnalisable pour vos événements
- Title local (45 car.) : Stèle — Location événementielle \| Setup Paris
- Description locale (146 car.) : Stèle carrée en menuiserie pour présenter un produit, un objet, un document ou une information : lancement, exposition, vitrine, salon ou boutique
- H1 : Stèle
- Canonical publié / local : /produit/stele / /produit/stele
- Hreflang publié : fr=/produit/stele, en=/en/produit/stele, x-default=/produit/stele
- Hreflang local : fr=/produit/stele, en=/en/produit/stele, x-default=/produit/stele
- og:title publié / local : Stèle — Setup Paris / Stèle — Location événementielle \| Setup Paris
- og:description publié / local : Stèle d'accueil personnalisable pour vos événements / Stèle carrée en menuiserie pour présenter un produit, un objet, un document ou une information : lancement, exposition, vitrine, salon ou boutique
- og:image publié / local : Photo produit : 1780640879229-lu39vb.jpeg / Photo produit : 1780640879229-lu39vb.jpeg (1200 px)
- Images/alt publiés : Photo produit : 1780640879229-lu39vb.jpeg → Stèle; Photo produit : lettres-geantes.jpg → Lettres Géantes
- Images/alt locaux : Photo produit : 1780640879229-lu39vb.jpeg → Stèle — Décoration; Photo produit : lettres-geantes.jpg → Lettres Géantes — Décoration
- Liens internes publiés (3) : /catalogue, /sur-mesure/stele, /produit/lettres-geantes
- Liens internes locaux (3) : /catalogue, /sur-mesure/stele, /produit/lettres-geantes
- Product local : description 369 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/stele-miroir

- Title publié : Stèle Miroir — Setup Paris
- Description publiée : Stèle inox poli effet miroir. Idéale pour mise en valeur produit, sculpture ou décoration événementielle.
- Title local (52 car.) : Stèle Miroir — Location événementielle \| Setup Paris
- Description locale (105 car.) : Stèle inox poli effet miroir. Idéale pour mise en valeur produit, sculpture ou décoration événementielle.
- H1 : Stèle Miroir
- Canonical publié / local : /produit/stele-miroir / /produit/stele-miroir
- Hreflang publié : fr=/produit/stele-miroir, en=/en/produit/stele-miroir, x-default=/produit/stele-miroir
- Hreflang local : fr=/produit/stele-miroir, en=/en/produit/stele-miroir, x-default=/produit/stele-miroir
- og:title publié / local : Stèle Miroir — Setup Paris / Stèle Miroir — Location événementielle \| Setup Paris
- og:description publié / local : Stèle inox poli effet miroir. Idéale pour mise en valeur produit, sculpture ou décoration événementielle. / Stèle inox poli effet miroir. Idéale pour mise en valeur produit, sculpture ou décoration événementielle.
- og:image publié / local : Photo produit : 1777544975776-65lgoj.png / Photo produit : 1777544975776-65lgoj.png (1200 px)
- Images/alt publiés : Photo produit : 1777544975776-65lgoj.png → Stèle Miroir; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur
- Images/alt locaux : Photo produit : 1777544975776-65lgoj.png → Stèle Miroir — Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier
- Liens internes publiés (6) : /catalogue, /sur-mesure/stele, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Liens internes locaux (6) : /catalogue, /sur-mesure/stele, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Product local : description 105 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/stele-ronde-pmma

- Title publié : Stèle ronde plexi — Setup Paris
- Description publiée : Stèle ronde en plexiglas avec tablette, pour présenter un produit ou une information.
- Title local (57 car.) : Stèle ronde plexi — Location événementielle \| Setup Paris
- Description locale (155 car.) : Stèle ronde en plexiglas : socle de 30 cm de diamètre, colonne de 15 cm et tablette de 40 × 25 cm. Transparente et discrète, elle met en valeur un produit,
- H1 : Stèle ronde plexi
- Canonical publié / local : /produit/stele-ronde-pmma / /produit/stele-ronde-pmma
- Hreflang publié : fr=/produit/stele-ronde-pmma, en=/en/produit/stele-ronde-pmma, x-default=/produit/stele-ronde-pmma
- Hreflang local : fr=/produit/stele-ronde-pmma, en=/en/produit/stele-ronde-pmma, x-default=/produit/stele-ronde-pmma
- og:title publié / local : Stèle ronde plexi — Setup Paris / Stèle ronde plexi — Location événementielle \| Setup Paris
- og:description publié / local : Stèle ronde en plexiglas avec tablette, pour présenter un produit ou une information. / Stèle ronde en plexiglas : socle de 30 cm de diamètre, colonne de 15 cm et tablette de 40 × 25 cm. Transparente et discrète, elle met en valeur un produit,
- og:image publié / local : Photo produit : stele-ronde-pmma-1794598847008.png / Photo produit : stele-ronde-pmma-1794598847008.png (1200 px)
- Images/alt publiés : Photo produit : stele-ronde-pmma-1794598847008.png → Stèle ronde plexi; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur
- Images/alt locaux : Photo produit : stele-ronde-pmma-1794598847008.png → Stèle ronde plexi — Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier
- Liens internes publiés (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Liens internes locaux (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Product local : description 300 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/table-alu

- Title publié : Table aluminium — Setup Paris
- Description publiée : Grande table de 2,5 m, plateau stratifié aluminium brossé, pieds en tube aluminium.
- Title local (55 car.) : Table aluminium — Location événementielle \| Setup Paris
- Description locale (145 car.) : Grande table de 2,5 m × 1 m, 75 cm de haut, plateau en stratifié aluminium brossé et pieds en tube aluminium, pour réunions, ateliers, buffets ou
- H1 : Table aluminium
- Canonical publié / local : /produit/table-alu / /produit/table-alu
- Hreflang publié : fr=/produit/table-alu, en=/en/produit/table-alu, x-default=/produit/table-alu
- Hreflang local : fr=/produit/table-alu, en=/en/produit/table-alu, x-default=/produit/table-alu
- og:title publié / local : Table aluminium — Setup Paris / Table aluminium — Location événementielle \| Setup Paris
- og:description publié / local : Grande table de 2,5 m, plateau stratifié aluminium brossé, pieds en tube aluminium. / Grande table de 2,5 m × 1 m, 75 cm de haut, plateau en stratifié aluminium brossé et pieds en tube aluminium, pour réunions, ateliers, buffets ou
- og:image publié / local : Photo produit : table-alu-1794598848306.png / Photo produit : table-alu-1794598848306.png (1200 px)
- Images/alt publiés : Photo produit : table-alu-1794598848306.png → Table aluminium; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur
- Images/alt locaux : Photo produit : table-alu-1794598848306.png → Table aluminium — Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier
- Liens internes publiés (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Liens internes locaux (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Product local : description 283 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/table-de-blackjack

- Title publié : Table de Blackjack — Setup Paris
- Description publiée : Table de blackjack demi-cercle façon casino, idéale pour vos soirées casino, animations corporate ou cocktails évènementiels. Personnalisable (couleur du tapis,
- Title local (58 car.) : Table de Blackjack — Location événementielle \| Setup Paris
- Description locale (153 car.) : Table de blackjack demi-cercle façon casino, idéale pour vos soirées casino, animations corporate ou cocktails évènementiels. Personnalisable (couleur du
- H1 : Table de Blackjack
- Canonical publié / local : /produit/table-de-blackjack / /produit/table-de-blackjack
- Hreflang publié : fr=/produit/table-de-blackjack, en=/en/produit/table-de-blackjack, x-default=/produit/table-de-blackjack
- Hreflang local : fr=/produit/table-de-blackjack, en=/en/produit/table-de-blackjack, x-default=/produit/table-de-blackjack
- og:title publié / local : Table de Blackjack — Setup Paris / Table de Blackjack — Location événementielle \| Setup Paris
- og:description publié / local : Table de blackjack demi-cercle façon casino, idéale pour vos soirées casino, animations corporate ou cocktails évènementiels. Personnalisable (couleur du tapis, / Table de blackjack demi-cercle façon casino, idéale pour vos soirées casino, animations corporate ou cocktails évènementiels. Personnalisable (couleur du
- og:image publié / local : Photo produit : 1777539739806-lk7ch3.png / Photo produit : 1777539739806-lk7ch3.png (1200 px)
- Images/alt publiés : Photo produit : 1777539739806-lk7ch3.png → Table de Blackjack; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant; Photo produit : 1777543737980-j52rup.jpg → Plinko
- Images/alt locaux : Photo produit : 1777539739806-lk7ch3.png → Table de Blackjack — Jeux; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball — Jeux; Photo produit : 1777543043347-ze8rul.png → Cornhole — Jeux; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant — Jeux; Photo produit : 1777543737980-j52rup.jpg → Plinko — Jeux
- Liens internes publiés (5) : /catalogue, /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/plinko
- Liens internes locaux (5) : /catalogue, /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/plinko
- Product local : description 259 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/tabouret-atelier

- Title publié : Tabouret haut d'atelier — Setup Paris
- Description publiée : Tabouret haut de style atelier pour bars et mange-debout.
- Title local (63 car.) : Tabouret haut d'atelier — Location événementielle \| Setup Paris
- Description locale (155 car.) : Tabouret haut de style atelier, assise bois et structure métal, pour accompagner un bar, un comptoir ou un mange-debout. Remise sur quantité dès 10 unités.
- H1 : Tabouret haut d'atelier
- Canonical publié / local : /produit/tabouret-atelier / /produit/tabouret-atelier
- Hreflang publié : fr=/produit/tabouret-atelier, en=/en/produit/tabouret-atelier, x-default=/produit/tabouret-atelier
- Hreflang local : fr=/produit/tabouret-atelier, en=/en/produit/tabouret-atelier, x-default=/produit/tabouret-atelier
- og:title publié / local : Tabouret haut d'atelier — Setup Paris / Tabouret haut d'atelier — Location événementielle \| Setup Paris
- og:description publié / local : Tabouret haut de style atelier pour bars et mange-debout. / Tabouret haut de style atelier, assise bois et structure métal, pour accompagner un bar, un comptoir ou un mange-debout. Remise sur quantité dès 10 unités.
- og:image publié / local : Photo produit : tabouret-atelier-1794598851137.png / Photo produit : tabouret-atelier-1794598851137.png (1200 px)
- Images/alt publiés : Photo produit : tabouret-atelier-1794598851137.png → Tabouret haut d'atelier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : mange-debout.png → Mange-Debout; Photo produit : triporteur.png → Triporteur
- Images/alt locaux : Photo produit : tabouret-atelier-1794598851137.png → Tabouret haut d'atelier — Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : triporteur.png → Triporteur — Mobilier
- Liens internes publiés (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Liens internes locaux (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/triporteur
- Product local : description 238 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions présentes.

### /produit/triporteur

- Title publié : Triporteur — Setup Paris
- Description publiée : Triporteur personnalisable pour street marketing.
- Title local (50 car.) : Triporteur — Location événementielle \| Setup Paris
- Description locale (142 car.) : Triporteur personnalisable pour le street marketing, la distribution d'échantillons, un stand mobile ou une activation de marque en extérieur.
- H1 : Triporteur
- Canonical publié / local : /produit/triporteur / /produit/triporteur
- Hreflang publié : fr=/produit/triporteur, en=/en/produit/triporteur, x-default=/produit/triporteur
- Hreflang local : fr=/produit/triporteur, en=/en/produit/triporteur, x-default=/produit/triporteur
- og:title publié / local : Triporteur — Setup Paris / Triporteur — Location événementielle \| Setup Paris
- og:description publié / local : Triporteur personnalisable pour street marketing. / Triporteur personnalisable pour le street marketing, la distribution d'échantillons, un stand mobile ou une activation de marque en extérieur.
- og:image publié / local : Photo produit : triporteur.png / Photo produit : triporteur.png (1200 px)
- Images/alt publiés : Photo produit : triporteur.png → Triporteur; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque; Photo produit : mange-debout.png → Mange-Debout; Photo produit : 1777546380003-oqh8e9.png → Pouf / Assise
- Images/alt locaux : Photo produit : triporteur.png → Triporteur — Mobilier; Photo produit : bar-arrondi-1794598842618.png → Bar arrondi — Mobilier; Photo produit : 1780640415544-z8kjr6.jpeg → Podium triptyque — Mobilier; Photo produit : mange-debout.png → Mange-Debout — Mobilier; Photo produit : 1777544975776-65lgoj.png → Stèle Miroir — Mobilier
- Liens internes publiés (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/pouf
- Liens internes locaux (5) : /catalogue, /produit/bar-arrondi, /produit/podium, /produit/mange-debout, /produit/stele-miroir
- Product local : description 253 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /produit/zig-zag

- Title publié : Zig Zag — Setup Paris
- Description publiée : Jeu Zig Zag géant entièrement personnalisable : structure, fond et parcours de la bille.
- Title local (47 car.) : Zig Zag — Location événementielle \| Setup Paris
- Description locale (152 car.) : Jeu Zig Zag géant : guider la bille le long du parcours sans la faire tomber. Un jeu d'adresse visuel qui attire le public sur un stand, un salon ou une
- H1 : Zig Zag
- Canonical publié / local : /produit/zig-zag / /produit/zig-zag
- Hreflang publié : fr=/produit/zig-zag, en=/en/produit/zig-zag, x-default=/produit/zig-zag
- Hreflang local : fr=/produit/zig-zag, en=/en/produit/zig-zag, x-default=/produit/zig-zag
- og:title publié / local : Zig Zag — Setup Paris / Zig Zag — Location événementielle \| Setup Paris
- og:description publié / local : Jeu Zig Zag géant entièrement personnalisable : structure, fond et parcours de la bille. / Jeu Zig Zag géant : guider la bille le long du parcours sans la faire tomber. Un jeu d'adresse visuel qui attire le public sur un stand, un salon ou une
- og:image publié / local : Photo produit : 1777544265578-g6rq7n.png / Photo produit : 1777544265578-g6rq7n.png (1200 px)
- Images/alt publiés : Photo produit : 1777544265578-g6rq7n.png → Zig Zag; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball; Photo produit : 1777543043347-ze8rul.png → Cornhole; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant; Photo produit : 1777543737980-j52rup.jpg → Plinko
- Images/alt locaux : Photo produit : 1777544265578-g6rq7n.png → Zig Zag — Jeux; Photo produit : 1777542145171-dwbrhe.png → Panier de Basketball — Jeux; Photo produit : 1777543043347-ze8rul.png → Cornhole — Jeux; Photo produit : 1777543689794-or8pkd.png → Puissance 4 Géant — Jeux; Photo produit : 1777543737980-j52rup.jpg → Plinko — Jeux
- Liens internes publiés (5) : /catalogue, /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/plinko
- Liens internes locaux (5) : /catalogue, /produit/panier-basketball, /produit/cornhole, /produit/puissance-4, /produit/plinko
- Product local : description 344 caractères ; image propre au produit oui ; brand Setup Paris ; Offer EUR, availability InStock ; unitText par événement ; dimensions non renseignées.

### /sur-mesure

- Title publié : Mobilier événementiel sur mesure — Setup Paris
- Description publiée : Faites fabriquer votre mobilier événementiel sur mesure : comptoirs, stèles, podiums, totems, arches… Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (46 car.) : Mobilier événementiel sur mesure — Setup Paris
- Description locale (141 car.) : Mobilier événementiel fabriqué sur mesure : 24 pièces, cotes et finitions personnalisées. Étude et réponse sous 48 h ouvrées par Setup Paris.
- H1 : Mobilier événementiel sur mesure
- Canonical publié / local : /sur-mesure / /sur-mesure
- Hreflang publié : fr=/sur-mesure, en=/en/sur-mesure, x-default=/sur-mesure
- Hreflang local : fr=/sur-mesure, en=/en/sur-mesure, x-default=/sur-mesure
- og:title publié / local : Mobilier événementiel sur mesure — Setup Paris / Mobilier événementiel sur mesure — Setup Paris
- og:description publié / local : 24 pièces à vos cotes et finitions, configurées en 3D. Prix et délai confirmés sous 48 h ouvrées. / 24 pièces à vos cotes et finitions, configurées en 3D. Prix et délai confirmés sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (26) : /catalogue, /sur-mesure/comptoir, /sur-mesure/comptoirL, /sur-mesure/bar, /sur-mesure/pupitre, /sur-mesure/table, /sur-mesure/mangeDebout, /sur-mesure/stele, /sur-mesure/podium, /sur-mesure/socleRond, /sur-mesure/cubes, /sur-mesure/gradin, /sur-mesure/etagere, /sur-mesure/urne, /sur-mesure/portant, /sur-mesure/totem, /sur-mesure/mur, /sur-mesure/cacheRegie, /sur-mesure/arche, /sur-mesure/lettres, /sur-mesure/cadre, /sur-mesure/claustra, /sur-mesure/banc, /sur-mesure/pouf, /sur-mesure/jardiniere, /contact
- Liens internes locaux (26) : /catalogue, /sur-mesure/comptoir, /sur-mesure/comptoirL, /sur-mesure/bar, /sur-mesure/pupitre, /sur-mesure/table, /sur-mesure/mangeDebout, /sur-mesure/stele, /sur-mesure/podium, /sur-mesure/socleRond, /sur-mesure/cubes, /sur-mesure/gradin, /sur-mesure/etagere, /sur-mesure/urne, /sur-mesure/portant, /sur-mesure/totem, /sur-mesure/mur, /sur-mesure/cacheRegie, /sur-mesure/arche, /sur-mesure/lettres, /sur-mesure/cadre, /sur-mesure/claustra, /sur-mesure/banc, /sur-mesure/pouf, /sur-mesure/jardiniere, /contact

### /sur-mesure/arche

- Title publié : Arche d'entrée sur mesure — Setup Paris
- Description publiée : Portique d'entrée en caissons, linteau droit ou cintré, avec logo sur le linteau. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (47 car.) : Arche d'entrée sur mesure \| Atelier Setup Paris
- Description locale (132 car.) : Portique d'entrée en caissons, linteau droit ou cintré, avec logo sur le linteau. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Arche d'entrée sur mesure
- Canonical publié / local : /sur-mesure/arche / /sur-mesure/arche
- Hreflang publié : fr=/sur-mesure/arche, en=/en/sur-mesure/arche, x-default=/sur-mesure/arche
- Hreflang local : fr=/sur-mesure/arche, en=/en/sur-mesure/arche, x-default=/sur-mesure/arche
- og:title publié / local : Arche d'entrée sur mesure — Setup Paris / Arche d'entrée sur mesure \| Atelier Setup Paris
- og:description publié / local : Portique d'entrée en caissons, linteau droit ou cintré, avec logo sur le linteau. / Portique d'entrée en caissons, linteau droit ou cintré, avec logo sur le linteau. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/banc

- Title publié : Banc sur mesure — Setup Paris
- Description publiée : Banc ou banquette en caisson, assise en bois ou garnie de mousse et de tissu. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (37 car.) : Banc sur mesure \| Atelier Setup Paris
- Description locale (128 car.) : Banc ou banquette en caisson, assise en bois ou garnie de mousse et de tissu. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Banc sur mesure
- Canonical publié / local : /sur-mesure/banc / /sur-mesure/banc
- Hreflang publié : fr=/sur-mesure/banc, en=/en/sur-mesure/banc, x-default=/sur-mesure/banc
- Hreflang local : fr=/sur-mesure/banc, en=/en/sur-mesure/banc, x-default=/sur-mesure/banc
- og:title publié / local : Banc sur mesure — Setup Paris / Banc sur mesure \| Atelier Setup Paris
- og:description publié / local : Banc ou banquette en caisson, assise en bois ou garnie de mousse et de tissu. / Banc ou banquette en caisson, assise en bois ou garnie de mousse et de tissu. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/bar

- Title publié : Bar ou desk DJ sur mesure — Setup Paris
- Description publiée : Meuble à deux niveaux : une tablette haute côté public, un plan de travail plus bas côté service. Sert de bar comme de desk DJ. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (47 car.) : Bar ou desk DJ sur mesure \| Atelier Setup Paris
- Description locale (151 car.) : Meuble à deux niveaux : une tablette haute côté public, un plan de travail plus bas côté service. Sert de bar comme de desk DJ. Fabrication sur mesure,
- H1 : Bar ou desk DJ sur mesure
- Canonical publié / local : /sur-mesure/bar / /sur-mesure/bar
- Hreflang publié : fr=/sur-mesure/bar, en=/en/sur-mesure/bar, x-default=/sur-mesure/bar
- Hreflang local : fr=/sur-mesure/bar, en=/en/sur-mesure/bar, x-default=/sur-mesure/bar
- og:title publié / local : Bar ou desk DJ sur mesure — Setup Paris / Bar ou desk DJ sur mesure \| Atelier Setup Paris
- og:description publié / local : Meuble à deux niveaux : une tablette haute côté public, un plan de travail plus bas côté service. Sert de bar comme de desk DJ. / Meuble à deux niveaux : une tablette haute côté public, un plan de travail plus bas côté service. Sert de bar comme de desk DJ. Fabrication sur mesure,
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/cacheRegie

- Title publié : Cache-régie sur mesure — Setup Paris
- Description publiée : Écran bas en U qui masque une régie technique ou un poste de travail. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (44 car.) : Cache-régie sur mesure \| Atelier Setup Paris
- Description locale (120 car.) : Écran bas en U qui masque une régie technique ou un poste de travail. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Cache-régie sur mesure
- Canonical publié / local : /sur-mesure/cacheRegie / /sur-mesure/cacheRegie
- Hreflang publié : fr=/sur-mesure/cacheRegie, en=/en/sur-mesure/cacheRegie, x-default=/sur-mesure/cacheRegie
- Hreflang local : fr=/sur-mesure/cacheRegie, en=/en/sur-mesure/cacheRegie, x-default=/sur-mesure/cacheRegie
- og:title publié / local : Cache-régie sur mesure — Setup Paris / Cache-régie sur mesure \| Atelier Setup Paris
- og:description publié / local : Écran bas en U qui masque une régie technique ou un poste de travail. / Écran bas en U qui masque une régie technique ou un poste de travail. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/cadre

- Title publié : Cadre photo géant sur mesure — Setup Paris
- Description publiée : Cadre à selfie léger, peint ou imprimé. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (50 car.) : Cadre photo géant sur mesure \| Atelier Setup Paris
- Description locale (90 car.) : Cadre à selfie léger, peint ou imprimé. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Cadre photo géant sur mesure
- Canonical publié / local : /sur-mesure/cadre / /sur-mesure/cadre
- Hreflang publié : fr=/sur-mesure/cadre, en=/en/sur-mesure/cadre, x-default=/sur-mesure/cadre
- Hreflang local : fr=/sur-mesure/cadre, en=/en/sur-mesure/cadre, x-default=/sur-mesure/cadre
- og:title publié / local : Cadre photo géant sur mesure — Setup Paris / Cadre photo géant sur mesure \| Atelier Setup Paris
- og:description publié / local : Cadre à selfie léger, peint ou imprimé. / Cadre à selfie léger, peint ou imprimé. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/claustra

- Title publié : Claustra sur mesure — Setup Paris
- Description publiée : Cloison ajourée en tasseaux verticaux, pour séparer sans fermer. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (41 car.) : Claustra sur mesure \| Atelier Setup Paris
- Description locale (115 car.) : Cloison ajourée en tasseaux verticaux, pour séparer sans fermer. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Claustra sur mesure
- Canonical publié / local : /sur-mesure/claustra / /sur-mesure/claustra
- Hreflang publié : fr=/sur-mesure/claustra, en=/en/sur-mesure/claustra, x-default=/sur-mesure/claustra
- Hreflang local : fr=/sur-mesure/claustra, en=/en/sur-mesure/claustra, x-default=/sur-mesure/claustra
- og:title publié / local : Claustra sur mesure — Setup Paris / Claustra sur mesure \| Atelier Setup Paris
- og:description publié / local : Cloison ajourée en tasseaux verticaux, pour séparer sans fermer. / Cloison ajourée en tasseaux verticaux, pour séparer sans fermer. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/comptoir

- Title publié : Comptoir sur mesure — Setup Paris
- Description publiée : Comptoir d'accueil droit, ouvert côté service ou fermé sur quatre faces. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (41 car.) : Comptoir sur mesure \| Atelier Setup Paris
- Description locale (123 car.) : Comptoir d'accueil droit, ouvert côté service ou fermé sur quatre faces. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Comptoir sur mesure
- Canonical publié / local : /sur-mesure/comptoir / /sur-mesure/comptoir
- Hreflang publié : fr=/sur-mesure/comptoir, en=/en/sur-mesure/comptoir, x-default=/sur-mesure/comptoir
- Hreflang local : fr=/sur-mesure/comptoir, en=/en/sur-mesure/comptoir, x-default=/sur-mesure/comptoir
- og:title publié / local : Comptoir sur mesure — Setup Paris / Comptoir sur mesure \| Atelier Setup Paris
- og:description publié / local : Comptoir d'accueil droit, ouvert côté service ou fermé sur quatre faces. / Comptoir d'accueil droit, ouvert côté service ou fermé sur quatre faces. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/comptoirL

- Title publié : Comptoir d'angle sur mesure — Setup Paris
- Description publiée : Comptoir en L : une façade principale et un retour, pour tenir un angle ou fermer un espace d'accueil. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (49 car.) : Comptoir d'angle sur mesure \| Atelier Setup Paris
- Description locale (153 car.) : Comptoir en L : une façade principale et un retour, pour tenir un angle ou fermer un espace d'accueil. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Comptoir d'angle sur mesure
- Canonical publié / local : /sur-mesure/comptoirL / /sur-mesure/comptoirL
- Hreflang publié : fr=/sur-mesure/comptoirL, en=/en/sur-mesure/comptoirL, x-default=/sur-mesure/comptoirL
- Hreflang local : fr=/sur-mesure/comptoirL, en=/en/sur-mesure/comptoirL, x-default=/sur-mesure/comptoirL
- og:title publié / local : Comptoir d'angle sur mesure — Setup Paris / Comptoir d'angle sur mesure \| Atelier Setup Paris
- og:description publié / local : Comptoir en L : une façade principale et un retour, pour tenir un angle ou fermer un espace d'accueil. / Comptoir en L : une façade principale et un retour, pour tenir un angle ou fermer un espace d'accueil. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/cubes

- Title publié : Cubes gigognes sur mesure — Setup Paris
- Description publiée : Série de cubes à cinq faces, de taille décroissante, qui s'emboîtent pour le transport. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (47 car.) : Cubes gigognes sur mesure \| Atelier Setup Paris
- Description locale (138 car.) : Série de cubes à cinq faces, de taille décroissante, qui s'emboîtent pour le transport. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Cubes gigognes sur mesure
- Canonical publié / local : /sur-mesure/cubes / /sur-mesure/cubes
- Hreflang publié : fr=/sur-mesure/cubes, en=/en/sur-mesure/cubes, x-default=/sur-mesure/cubes
- Hreflang local : fr=/sur-mesure/cubes, en=/en/sur-mesure/cubes, x-default=/sur-mesure/cubes
- og:title publié / local : Cubes gigognes sur mesure — Setup Paris / Cubes gigognes sur mesure \| Atelier Setup Paris
- og:description publié / local : Série de cubes à cinq faces, de taille décroissante, qui s'emboîtent pour le transport. / Série de cubes à cinq faces, de taille décroissante, qui s'emboîtent pour le transport. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/etagere

- Title publié : Étagère à casiers sur mesure — Setup Paris
- Description publiée : Bibliothèque de présentation à casiers réguliers, avec ou sans fond. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (50 car.) : Étagère à casiers sur mesure \| Atelier Setup Paris
- Description locale (119 car.) : Bibliothèque de présentation à casiers réguliers, avec ou sans fond. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Étagère à casiers sur mesure
- Canonical publié / local : /sur-mesure/etagere / /sur-mesure/etagere
- Hreflang publié : fr=/sur-mesure/etagere, en=/en/sur-mesure/etagere, x-default=/sur-mesure/etagere
- Hreflang local : fr=/sur-mesure/etagere, en=/en/sur-mesure/etagere, x-default=/sur-mesure/etagere
- og:title publié / local : Étagère à casiers sur mesure — Setup Paris / Étagère à casiers sur mesure \| Atelier Setup Paris
- og:description publié / local : Bibliothèque de présentation à casiers réguliers, avec ou sans fond. / Bibliothèque de présentation à casiers réguliers, avec ou sans fond. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/gradin

- Title publié : Gradin sur mesure — Setup Paris
- Description publiée : Présentoir à marches pour étager des produits, ou petit gradin d'assise. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (39 car.) : Gradin sur mesure \| Atelier Setup Paris
- Description locale (123 car.) : Présentoir à marches pour étager des produits, ou petit gradin d'assise. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Gradin sur mesure
- Canonical publié / local : /sur-mesure/gradin / /sur-mesure/gradin
- Hreflang publié : fr=/sur-mesure/gradin, en=/en/sur-mesure/gradin, x-default=/sur-mesure/gradin
- Hreflang local : fr=/sur-mesure/gradin, en=/en/sur-mesure/gradin, x-default=/sur-mesure/gradin
- og:title publié / local : Gradin sur mesure — Setup Paris / Gradin sur mesure \| Atelier Setup Paris
- og:description publié / local : Présentoir à marches pour étager des produits, ou petit gradin d'assise. / Présentoir à marches pour étager des produits, ou petit gradin d'assise. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/jardiniere

- Title publié : Jardinière sur mesure — Setup Paris
- Description publiée : Bac à plantes en caisson, avec double fond. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (43 car.) : Jardinière sur mesure \| Atelier Setup Paris
- Description locale (94 car.) : Bac à plantes en caisson, avec double fond. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Jardinière sur mesure
- Canonical publié / local : /sur-mesure/jardiniere / /sur-mesure/jardiniere
- Hreflang publié : fr=/sur-mesure/jardiniere, en=/en/sur-mesure/jardiniere, x-default=/sur-mesure/jardiniere
- Hreflang local : fr=/sur-mesure/jardiniere, en=/en/sur-mesure/jardiniere, x-default=/sur-mesure/jardiniere
- og:title publié / local : Jardinière sur mesure — Setup Paris / Jardinière sur mesure \| Atelier Setup Paris
- og:description publié / local : Bac à plantes en caisson, avec double fond. / Bac à plantes en caisson, avec double fond. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/lettres

- Title publié : Lettres géantes sur mesure — Setup Paris
- Description publiée : Mot ou sigle en lettres volume, à poser au sol ou sur un socle commun. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (48 car.) : Lettres géantes sur mesure \| Atelier Setup Paris
- Description locale (121 car.) : Mot ou sigle en lettres volume, à poser au sol ou sur un socle commun. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Lettres géantes sur mesure
- Canonical publié / local : /sur-mesure/lettres / /sur-mesure/lettres
- Hreflang publié : fr=/sur-mesure/lettres, en=/en/sur-mesure/lettres, x-default=/sur-mesure/lettres
- Hreflang local : fr=/sur-mesure/lettres, en=/en/sur-mesure/lettres, x-default=/sur-mesure/lettres
- og:title publié / local : Lettres géantes sur mesure — Setup Paris / Lettres géantes sur mesure \| Atelier Setup Paris
- og:description publié / local : Mot ou sigle en lettres volume, à poser au sol ou sur un socle commun. / Mot ou sigle en lettres volume, à poser au sol ou sur un socle commun. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/mangeDebout

- Title publié : Mange-debout sur mesure — Setup Paris
- Description publiée : Table haute, plateau rond ou carré, sur colonne en bois ou sur fût acier avec platine. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (45 car.) : Mange-debout sur mesure \| Atelier Setup Paris
- Description locale (137 car.) : Table haute, plateau rond ou carré, sur colonne en bois ou sur fût acier avec platine. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Mange-debout sur mesure
- Canonical publié / local : /sur-mesure/mangeDebout / /sur-mesure/mangeDebout
- Hreflang publié : fr=/sur-mesure/mangeDebout, en=/en/sur-mesure/mangeDebout, x-default=/sur-mesure/mangeDebout
- Hreflang local : fr=/sur-mesure/mangeDebout, en=/en/sur-mesure/mangeDebout, x-default=/sur-mesure/mangeDebout
- og:title publié / local : Mange-debout sur mesure — Setup Paris / Mange-debout sur mesure \| Atelier Setup Paris
- og:description publié / local : Table haute, plateau rond ou carré, sur colonne en bois ou sur fût acier avec platine. / Table haute, plateau rond ou carré, sur colonne en bois ou sur fût acier avec platine. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/mur

- Title publié : Mur d'image sur mesure — Setup Paris
- Description publiée : Fond de scène ou photocall autoportant. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (44 car.) : Mur d'image sur mesure \| Atelier Setup Paris
- Description locale (90 car.) : Fond de scène ou photocall autoportant. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Mur d'image sur mesure
- Canonical publié / local : /sur-mesure/mur / /sur-mesure/mur
- Hreflang publié : fr=/sur-mesure/mur, en=/en/sur-mesure/mur, x-default=/sur-mesure/mur
- Hreflang local : fr=/sur-mesure/mur, en=/en/sur-mesure/mur, x-default=/sur-mesure/mur
- og:title publié / local : Mur d'image sur mesure — Setup Paris / Mur d'image sur mesure \| Atelier Setup Paris
- og:description publié / local : Fond de scène ou photocall autoportant. / Fond de scène ou photocall autoportant. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/podium

- Title publié : Podium sur mesure — Setup Paris
- Description publiée : Podium bas rectangulaire, dessus peint, plaqué ou habillé de moquette. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (39 car.) : Podium sur mesure \| Atelier Setup Paris
- Description locale (121 car.) : Podium bas rectangulaire, dessus peint, plaqué ou habillé de moquette. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Podium sur mesure
- Canonical publié / local : /sur-mesure/podium / /sur-mesure/podium
- Hreflang publié : fr=/sur-mesure/podium, en=/en/sur-mesure/podium, x-default=/sur-mesure/podium
- Hreflang local : fr=/sur-mesure/podium, en=/en/sur-mesure/podium, x-default=/sur-mesure/podium
- og:title publié / local : Podium sur mesure — Setup Paris / Podium sur mesure \| Atelier Setup Paris
- og:description publié / local : Podium bas rectangulaire, dessus peint, plaqué ou habillé de moquette. / Podium bas rectangulaire, dessus peint, plaqué ou habillé de moquette. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/portant

- Title publié : Portant sur mesure — Setup Paris
- Description publiée : Portant à vêtements en tube acier, avec tablette basse en option, pour un pop-up ou une loge. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (40 car.) : Portant sur mesure \| Atelier Setup Paris
- Description locale (144 car.) : Portant à vêtements en tube acier, avec tablette basse en option, pour un pop-up ou une loge. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Portant sur mesure
- Canonical publié / local : /sur-mesure/portant / /sur-mesure/portant
- Hreflang publié : fr=/sur-mesure/portant, en=/en/sur-mesure/portant, x-default=/sur-mesure/portant
- Hreflang local : fr=/sur-mesure/portant, en=/en/sur-mesure/portant, x-default=/sur-mesure/portant
- og:title publié / local : Portant sur mesure — Setup Paris / Portant sur mesure \| Atelier Setup Paris
- og:description publié / local : Portant à vêtements en tube acier, avec tablette basse en option, pour un pop-up ou une loge. / Portant à vêtements en tube acier, avec tablette basse en option, pour un pop-up ou une loge. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/pouf

- Title publié : Pouf sur mesure — Setup Paris
- Description publiée : Pouf cube ou cylindre, entièrement garni de tissu. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (37 car.) : Pouf sur mesure \| Atelier Setup Paris
- Description locale (101 car.) : Pouf cube ou cylindre, entièrement garni de tissu. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Pouf sur mesure
- Canonical publié / local : /sur-mesure/pouf / /sur-mesure/pouf
- Hreflang publié : fr=/sur-mesure/pouf, en=/en/sur-mesure/pouf, x-default=/sur-mesure/pouf
- Hreflang local : fr=/sur-mesure/pouf, en=/en/sur-mesure/pouf, x-default=/sur-mesure/pouf
- og:title publié / local : Pouf sur mesure — Setup Paris / Pouf sur mesure \| Atelier Setup Paris
- og:description publié / local : Pouf cube ou cylindre, entièrement garni de tissu. / Pouf cube ou cylindre, entièrement garni de tissu. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/pupitre

- Title publié : Pupitre sur mesure — Setup Paris
- Description publiée : Pupitre de conférencier, tablette inclinée avec rebord, façade pleine côté salle. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (40 car.) : Pupitre sur mesure \| Atelier Setup Paris
- Description locale (132 car.) : Pupitre de conférencier, tablette inclinée avec rebord, façade pleine côté salle. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Pupitre sur mesure
- Canonical publié / local : /sur-mesure/pupitre / /sur-mesure/pupitre
- Hreflang publié : fr=/sur-mesure/pupitre, en=/en/sur-mesure/pupitre, x-default=/sur-mesure/pupitre
- Hreflang local : fr=/sur-mesure/pupitre, en=/en/sur-mesure/pupitre, x-default=/sur-mesure/pupitre
- og:title publié / local : Pupitre sur mesure — Setup Paris / Pupitre sur mesure \| Atelier Setup Paris
- og:description publié / local : Pupitre de conférencier, tablette inclinée avec rebord, façade pleine côté salle. / Pupitre de conférencier, tablette inclinée avec rebord, façade pleine côté salle. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/socleRond

- Title publié : Socle rond sur mesure — Setup Paris
- Description publiée : Socle ou podium cylindrique, jupe cintrée, dessus en disque. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (43 car.) : Socle rond sur mesure \| Atelier Setup Paris
- Description locale (111 car.) : Socle ou podium cylindrique, jupe cintrée, dessus en disque. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Socle rond sur mesure
- Canonical publié / local : /sur-mesure/socleRond / /sur-mesure/socleRond
- Hreflang publié : fr=/sur-mesure/socleRond, en=/en/sur-mesure/socleRond, x-default=/sur-mesure/socleRond
- Hreflang local : fr=/sur-mesure/socleRond, en=/en/sur-mesure/socleRond, x-default=/sur-mesure/socleRond
- og:title publié / local : Socle rond sur mesure — Setup Paris / Socle rond sur mesure \| Atelier Setup Paris
- og:description publié / local : Socle ou podium cylindrique, jupe cintrée, dessus en disque. / Socle ou podium cylindrique, jupe cintrée, dessus en disque. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/stele

- Title publié : Stèle sur mesure — Setup Paris
- Description publiée : Socle de présentation à quatre faces, avec capot plexi en option pour protéger l'objet exposé. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (38 car.) : Stèle sur mesure \| Atelier Setup Paris
- Description locale (145 car.) : Socle de présentation à quatre faces, avec capot plexi en option pour protéger l'objet exposé. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Stèle sur mesure
- Canonical publié / local : /sur-mesure/stele / /sur-mesure/stele
- Hreflang publié : fr=/sur-mesure/stele, en=/en/sur-mesure/stele, x-default=/sur-mesure/stele
- Hreflang local : fr=/sur-mesure/stele, en=/en/sur-mesure/stele, x-default=/sur-mesure/stele
- og:title publié / local : Stèle sur mesure — Setup Paris / Stèle sur mesure \| Atelier Setup Paris
- og:description publié / local : Socle de présentation à quatre faces, avec capot plexi en option pour protéger l'objet exposé. / Socle de présentation à quatre faces, avec capot plexi en option pour protéger l'objet exposé. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/table

- Title publié : Table sur mesure — Setup Paris
- Description publiée : Table sur mesure, du plan de travail à la table de présentation, sur jouées, sur caisson ou sur piètement en tube acier. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (38 car.) : Table sur mesure \| Atelier Setup Paris
- Description locale (152 car.) : Table sur mesure, du plan de travail à la table de présentation, sur jouées, sur caisson ou sur piètement en tube acier. Fabrication sur mesure, réponse
- H1 : Table sur mesure
- Canonical publié / local : /sur-mesure/table / /sur-mesure/table
- Hreflang publié : fr=/sur-mesure/table, en=/en/sur-mesure/table, x-default=/sur-mesure/table
- Hreflang local : fr=/sur-mesure/table, en=/en/sur-mesure/table, x-default=/sur-mesure/table
- og:title publié / local : Table sur mesure — Setup Paris / Table sur mesure \| Atelier Setup Paris
- og:description publié / local : Table sur mesure, du plan de travail à la table de présentation, sur jouées, sur caisson ou sur piètement en tube acier. / Table sur mesure, du plan de travail à la table de présentation, sur jouées, sur caisson ou sur piètement en tube acier. Fabrication sur mesure, réponse
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/totem

- Title publié : Totem sur mesure — Setup Paris
- Description publiée : Totem signalétique en caisson, une ou deux faces imprimées, sur socle débordant. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (38 car.) : Totem sur mesure \| Atelier Setup Paris
- Description locale (131 car.) : Totem signalétique en caisson, une ou deux faces imprimées, sur socle débordant. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Totem sur mesure
- Canonical publié / local : /sur-mesure/totem / /sur-mesure/totem
- Hreflang publié : fr=/sur-mesure/totem, en=/en/sur-mesure/totem, x-default=/sur-mesure/totem
- Hreflang local : fr=/sur-mesure/totem, en=/en/sur-mesure/totem, x-default=/sur-mesure/totem
- og:title publié / local : Totem sur mesure — Setup Paris / Totem sur mesure \| Atelier Setup Paris
- og:description publié / local : Totem signalétique en caisson, une ou deux faces imprimées, sur socle débordant. / Totem signalétique en caisson, une ou deux faces imprimées, sur socle débordant. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure

### /sur-mesure/urne

- Title publié : Urne sur mesure — Setup Paris
- Description publiée : Urne en plexi avec fente, pour jeu-concours, votes ou collecte, sur socle en option. Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.
- Title local (37 car.) : Urne sur mesure \| Atelier Setup Paris
- Description locale (135 car.) : Urne en plexi avec fente, pour jeu-concours, votes ou collecte, sur socle en option. Fabrication sur mesure, réponse sous 48 h ouvrées.
- H1 : Urne sur mesure
- Canonical publié / local : /sur-mesure/urne / /sur-mesure/urne
- Hreflang publié : fr=/sur-mesure/urne, en=/en/sur-mesure/urne, x-default=/sur-mesure/urne
- Hreflang local : fr=/sur-mesure/urne, en=/en/sur-mesure/urne, x-default=/sur-mesure/urne
- og:title publié / local : Urne sur mesure — Setup Paris / Urne sur mesure \| Atelier Setup Paris
- og:description publié / local : Urne en plexi avec fente, pour jeu-concours, votes ou collecte, sur socle en option. / Urne en plexi avec fente, pour jeu-concours, votes ou collecte, sur socle en option. Fabrication sur mesure, réponse sous 48 h ouvrées.
- og:image publié / local : https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png / —
- Images/alt publiés : aucune image dans main
- Images/alt locaux : aucune image dans main
- Liens internes publiés (1) : /sur-mesure
- Liens internes locaux (1) : /sur-mesure
