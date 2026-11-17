# Journal S24bis — fourchette affichée dans le configurateur

Non publié. Aucune écriture en base, aucune demande envoyée.

## Changement
- La page `/sur-mesure/$piece` envoie à l'iframe `{type:"price-range", text, sub}` à chaque nouvelle estimation (et à l'ouverture du configurateur). Textes FR/EN produits côté site (`iframePriceMessage`).
- L'iframe (`public/configurators/sur-mesure.html`) accepte le message seulement depuis le parent avec une origine autorisée (même contrôle que `restore-config`), vérifie que `text`/`sub` sont des chaînes ≤ 160 caractères, puis affiche le texte reçu dans `pUnit`, `pTot` et la barre mobile. Aucun calcul de prix dans l'iframe.
- Fourchette : « Estimation indicative : X – Y € HT / unité » + « Prix confirmé sous 48 h ouvrées ». Étude : « Étude nécessaire : prix sous 48 h ouvrées ». Fourchette inactive : aucun message, « Prix sur devis » inchangé.

## Contrôles (serveur de dev, fourchette active en base par Gabin)
- `bun test` : 106 réussis, 0 échec (nouveau `scripts/tests/S24bis-iframe-price.test.ts`).
- Navigateur 1440 et 390 px, FR et EN, aucune erreur console, aucun débordement :
  - comptoir : « Estimation indicative : 1 230 – 1 850 € HT / unité » / « Prix confirmé sous 48 h ouvrées » ; EN « Indicative estimate: €1,230 – €1,850 excl. VAT / unit ».
  - table à 2 800 mm : « Étude nécessaire : prix sous 48 h ouvrées » (EN « Design study required… »), sans montant.
- Mobile 390 px : la barre du bas du configurateur reste dans l'iframe ; les réserves s'affichent en entier en dessous, non masquées.

Captures : [comptoir 390 FR](captures-S24bis/390-fr-comptoir.png), [table 390 FR](captures-S24bis/390-fr-table.png), [comptoir 1440 FR](captures-S24bis/1440-fr-comptoir.png), [table 1440 EN](captures-S24bis/1440-en-table.png).
