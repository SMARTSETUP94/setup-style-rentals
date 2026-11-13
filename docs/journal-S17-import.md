# S17 — Import des images (13/11/2026)

`bun scripts/import-images.mjs` : **21 lignes traitées, 21 `done`, 0 erreur**. Images PNG 1168×880 dans `product-images`, `image_url` mis à jour. Les 20 nouvelles fiches restent **inactives** (vérifié en base). Aucun code modifié, aucune demande envoyée.
Contrôle : chaque image vue une par une ; chaque fiche ouverte en prévisualisation admin (1280 px), texte relevé automatiquement. Prix affichés = valeurs en base pour les 31 fiches. Case « Personnaliser » présente ⇔ prix de personnalisation > 0.

## 21 images importées

| slug | import | image | affichage fiche |
|---|---|---|---|
| bar-arrondi (active) | done | OK — comptoir blanc courbe | OK — 560 € / +112 € / Personnaliser |
| praticable-sur-pieds | done | OK — praticable noir bas | OK — 50 € / +10 € / Personnaliser |
| chassis-plaque-autoporte | done | OK — panneau blanc sur platine (quasi identique à cimaise) | OK — 62,50 € / +12 € / Personnaliser |
| mur-autoporte | done | OK — mur blanc avec béquilles | OK — 220 € / +44 € / Personnaliser |
| cimaise-sur-platine | done | OK — panneau 1000×2500 sur platine | OK — 100 € / +20 € / Personnaliser |
| chassis-borgniole-noir-5m2 | done | OK — toile noire 4 m, plus haute | OK — 50 € / +10 € / Personnaliser |
| chassis-borgniole-noir-2m2 | done | OK — bandeau noir 4 m × 0,5 m | OK — 20 € / +5 € / Personnaliser |
| chassis-imprime | done | OK — visuel dégradé abstrait, sans texte | OK — 62,50 € / +12 € / Personnaliser |
| stele-ronde-pmma | done | OK — colonne plexi, socle rond, tablette | OK — 65 € / +13 € / Personnaliser |
| presentoir-triptyque | done | OK — 3 bases blanches gigognes | OK — 300 € / +60 € / Personnaliser |
| bar-droit | done | OK — bar inox brossé | OK — 350 € / +70 € / Personnaliser |
| table-alu | done | OK — table alu longue | OK — 375 € / +75 € / Personnaliser |
| assise-cube | done | OK — cube blanc | OK — 25 € / +5 € / Personnaliser |
| banquette-droite | done | OK — banquette blanche 2 m | OK — 80 € / +16 € / Personnaliser |
| pupitre-plexi-noir | done | OK — caisson noir, façade plexi | OK — 125 € / +25 € / Personnaliser |
| pupitre-ceremonie | done | OK — pupitre noir mouluré | OK — 275 € / +55 € / Personnaliser |
| pupitre-colonnes | done | OK — plexi sur colonne noire | OK — 163 € / +33 € / Personnaliser |
| tabouret-atelier | done | OK — tabouret bois/métal | OK — 58 € / +12 € / pas de case (prix vide) |
| dj-booth | done | OK — meuble blanc, LED en pied (dimensions « À préciser ») | OK — 84 € / +17 € / Personnaliser |
| mirolege | done | OK — grand miroir sur béquille (proportion ~1:3,5 vs 1:4) | OK — 625 € / +125 € / pas de case (prix vide) |
| box-cabine | done | OK — cabine blanche cadre alu | OK — 600 € / +120 € / Personnaliser |

Aucun texte, logo, filigrane ni déformation grossière constaté. Remarque : chassis-plaque-autoporte et cimaise-sur-platine ont des images presque identiques.

## 10 autres fiches existantes (actives)

| slug | prix affiché | 3D |
|---|---|---|
| samias | 50 € / +10 € / Personnaliser | aucune, ajout direct OK |
| podium | 300 € / +60 € / Personnaliser | aucune, ajout direct OK |
| stele | 50 € / +10 € | « Personnaliser en 3D » facultatif, ajout direct OK |
| stele-miroir | 50 € / +10 € | « Personnaliser en 3D » facultatif |
| panier-basketball | 300 € / +60 € | « Personnaliser en 3D » facultatif |
| photobooth-balancoire | 750 € / +150 € | « Personnaliser en 3D » facultatif |
| chamboule-tout | 300 € / +60 € | lien « Voir en 3D » |
| zig-zag | 300 € / +60 € | lien « Voir en 3D » |
| stand-de-tir | 300 € / +60 € | lien « Voir en 3D » |
| mini-golf | 300 € / +60 € | lien « Voir en 3D » |

Toutes les fiches affichent « X € HT par événement (jusqu'à 3 jours) » et « + Y € HT par jour supplémentaire », et le bouton « Ajouter à ma demande » sans 3D. Non testé : 390 px et version EN pour ce lot.
