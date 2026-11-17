# Journal S24 — Fourchette ±20 % sur mesure (non activée)

Non publié. `custom_pricing.range_enabled` reste **false** sur les 24 pièces. Aucune demande touchée ni créée.

## Calcul (serveur uniquement)
- `src/lib/price-range.ts` : `publicRange` (bas arrondi à la dizaine inférieure, haut à la dizaine supérieure, plancher `floor_ht`) et `publicEstimate` (liste blanche `low`, `high`, `per`, `study`).
- `/api/sur-mesure/estimate` : réponse `{enabled, low, high, per, study}` uniquement ; `study=true` sans montant si alertes bloquantes, configuration incomplète (`incomplet` = postes non chiffrés) ou échec du moteur. Limite de débit (40 / 10 min / IP) conservée.
- Les exclusions standard listées par le moteur (encre, quincaillerie, livraison et pose) ne déclenchent pas l'étude : elles figurent toutes dans les réserves.
- Forçage d'affichage pour les tests : en-tête `x-dev-force-range: 1`, actif **seulement sur le serveur de dev** (`import.meta.env.DEV`, retiré du build publié).

## Affichage
- Sous le configurateur (dans la 3D et sur la page) : « Estimation indicative : X € – Y € HT », total pour la quantité, puis réserves en petit (texte exact FR/EN). Anti-rebond 400 ms. Étude : « Cette configuration nécessite une étude… ». Fourchette éteinte : rien de changé.
- Ma demande : « Estimation indicative : X € – Y € HT par unité ».
- Mail client : fourchette recalculée par le serveur (+ total + réserves), uniquement si la pièce est activée. Mail interne : estimation interne exacte inchangée.

## Admin › Sur mesure
- Interrupteur « Fourchette publique », champs − % / + % (valeurs par défaut 20/20), bouton « Mettre toutes les pièces à ± 20 % » (ne touche pas aux interrupteurs).
- Mise à jour équivalente exécutée : 24 pièces à 20/20, `range_enabled=false` partout, `floor_ht=0`.

## 3 exemples (serveur de dev, `/api/sur-mesure/estimate`, quantité 1)
| Configuration | Estimation interne (non publique) | Fourchette publique |
|---|---|---|
| Comptoir par défaut | 1 539,71 € | **1 230 € – 1 850 € HT** |
| Stèle par défaut | 899,02 € | **710 € – 1 080 € HT** |
| Bar de W-00002 (2000×1150×700, laqué RAL 9005, plateau chêne, acier peint, plinthe, logo) | 2 448,35 € | **1 950 € – 2 940 € HT** |

Sans le forçage, les trois appels renvoient `{"enabled":false}`.

## Contrôles
- `bun test` : 101 réussis, 0 échec (dont `scripts/tests/S24-range.test.ts` : arrondis, plancher, étude, aucun champ interne dans la réponse publique, total × quantité).
- Navigateur (fourchette simulée dans le test uniquement, en interceptant la lecture des prix publics) : 1440 FR comptoir, 1440 EN stèle, 390 FR stèle, 390 EN comptoir, 1440 FR bar — fourchette + total + réserves visibles dans la 3D, 0 erreur console, aucun débordement. Après une cote modifiée dans la 3D : comptoir 1 230–1 860 €, stèle 720–1 090 €.
- Ma demande (1440 FR) : ligne « Estimation indicative : 1 230 € – 1 860 € HT par unité ».
- Message « étude » (réponse simulée) : FR 1440 et EN 390 affichés.
- Admin (lecture seule, écritures bloquées) 1440/390 : bouton ± 20 % présent, 24 interrupteurs tous éteints, 24 pièces à 20 %.
- Total pour la quantité : désormais calculé sur la quantité réellement estimée ; vérifié par test unitaire (la quantité n'a pas été changée dans la 3D en navigateur).
- Non vérifié : le mail client réel (aucune demande envoyée).

Captures : [comptoir 1440 FR](captures-S24/1440-fr-comptoir-3d.png), [stèle 1440 EN](captures-S24/1440-en-stele-3d.png), [stèle 390 FR](captures-S24/390-fr-stele-3d.png), [comptoir 390 EN](captures-S24/390-en-comptoir-3d.png), [bar 1440 FR](captures-S24/1440-fr-bar-3d.png), [Ma demande](captures-S24/1440-fr-devis.png), [étude FR](captures-S24/1440-fr-study.png), [étude EN](captures-S24/390-en-study.png), [admin 1440](captures-S24/1440-admin.png), [admin 390](captures-S24/390-admin.png).
