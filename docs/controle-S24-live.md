# Contrôle S24 en ligne — fourchette ±20 % (lecture seule)

Date : 17/11/2026 · Site : https://catalogue.setup.paris · Chromium 1440 px et 390 px · aucune demande envoyée, aucune modification.

## Fourchettes relevées (HT, par unité)

| Pièce | Par défaut | Après changement de cote | Quantité 3 (unité → total) |
|---|---|---|---|
| comptoir | 1 230 – 1 850 € | largeur 1600→1280 : 1 070 – 1 620 € | 890 – 1 340 € → 2 670 – 4 020 € |
| stele | 710 – 1 080 € | largeur 400→320 : 690 – 1 050 € | 460 – 700 € → 1 380 – 2 100 € |
| bar | 2 230 – 3 350 € | largeur 2000→1600 : 2 000 – 3 010 € | 1 640 – 2 470 € → 4 920 – 7 410 € |
| table | 1 130 – 1 700 € | longueur 1800→1440 : 1 070 – 1 620 € | 760 – 1 150 € → 2 280 – 3 450 € |
| totem | 1 360 – 2 050 € | largeur 800→640 : 1 170 – 1 760 € | 970 – 1 460 € → 2 910 – 4 380 € |

Mêmes valeurs à 390 px (comptoir FR, bar EN).

## Résultats

- Fourchette par défaut : OK, identique aux valeurs du journal S24 pour comptoir et stèle.
- Change avec une cote : OK sur les 5 pièces.
- Réserves (texte complet) : OK sous la fourchette, FR et EN.
- Total suit la quantité : OK (total = unité × 3 ; le prix unitaire baisse avec la quantité, c'est le calcul du moteur).
- Alerte bloquante : table à 2 800 mm (portée > 2 m) → « Cette configuration nécessite une étude : prix et délai confirmés sous 48 h ouvrées. » ; réponse `{enabled, per, study:true}`, sans montant. OK.
- Réponse /api/sur-mesure/estimate : uniquement `enabled, low, high, per, study` sur toutes les réponses observées. OK.
- EN : /en/sur-mesure/stele et /en/sur-mesure/bar → « Indicative estimate: €710 – €1,080 excl. VAT », total et réserves en anglais. OK.
- Aucune erreur console, aucun débordement horizontal (1440 et 390).

## Points à signaler

1. La fourchette s'affiche dans un bandeau fixé en bas de l'écran, au-dessus de la 3D. Mais le cadre de prix intégré à la 3D, lui, affiche toujours « Prix sur devis » juste sous la vue. Les deux messages se contredisent visuellement.
2. À 1440 px, la fin des réserves (dernière ligne, à droite) est masquée par le badge « Edit with Lovable » du site publié.
3. Comptoir à 2 700 mm : pas d'étude (fourchette 1 430 – 2 150 €/u) ; l'alerte « portée > 2 m » ne concerne que la table.

Captures : [table étude](captures-S24-live/1440-fr-table-study.png), [comptoir 1440](captures-S24-live/1440-fr-comptoir.png), [stèle EN](captures-S24-live/1440-en-stele.png), [comptoir 390](captures-S24-live/390-fr-comptoir.png), [bar EN 390](captures-S24-live/390-en-bar.png).
