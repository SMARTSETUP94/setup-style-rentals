# Journal S16 — Location : 3D facultative

## Changements
- Fiche location : bouton principal « Ajouter à ma demande », actif sans ouvrir la 3D. Toutes les catégories d'options sont présélectionnées sur l'option incluse à 0 € (préférence « inclus / origine / standard / sans », jamais « personnalisée »), y compris les options obligatoires des produits sans 3D (podium « Finition »). `src/lib/default-options.ts`.
- Erreur d'option obligatoire affichée sous le champ concerné (défilement jusqu'à lui), plus de message en haut de page.
- 3D : bouton secondaire « Personnaliser en 3D » sur les 8 objets de marque (stele, stele-miroir, photobooth-balancoire, lettres-geantes, plinko, panier-basketball, cornhole, puissance-4). Sur pouf, chamboule-tout, auvent, mini-golf, zig-zag, stand-de-tir, table-de-blackjack : photo produit + lien discret « Voir en 3D » (la base n'a qu'une photo par produit, pas de galerie multiple). Options conservées, rien supprimé.
- La config 3D remplace la config par défaut (mécanisme de présélection S14 inchangé : il écrase les choix non manuels).
- « Ma demande » : mention « Version standard » sur une ligne d'un produit à 3D non personnalisé (`standardVersion`, stocké dans le panier, non envoyé au serveur). Lignes « inclus » au lieu de « +0 € » sur la fiche.
- Le total de la fiche utilise `computeLine` (même fonction que /api/quotes/submit) → prix affiché = prix serveur. Le serveur accepte une ligne sans option payante (option_ids à 0 € ou vide), aucune modification serveur nécessaire.
- Aucune migration, aucun prix modifié, W-00001…W-00006 intacts.

## Inventaire des 7 configurateurs (setup-paris-configurators.netlify.app)
Les configurateurs ne contiennent aucun prix : les prix viennent des options de la fiche (base). `configurator_options` vaut `{}` pour les 7.
| Produit | Zones / options dans la 3D | Options fiche (prix base) |
|---|---|---|
| pouf | Forme (Cylindrique, Carrée, Rectangulaire), Dimensions, Habillage (Blanc, Papier peint, Placage bois, Moquette), Coussin (Sans, Avec) | Forme 0/0/0 · Habillage Blanc 0, Papier peint 100, Placage bois 100, Moquette 50 · Coussin Sans 0, Avec 75 |
| chamboule-tout | Structure bois, Structure métal, Platform & déco ; palette couleurs (origine Violet / Noir / Bois brun foncé + ~20 teintes + teinte libre) | Personnalisation : boîtes 50, base brandée 80, animateur/jour 250 |
| auvent | Couleur du tissu (Rayures jaune & blanc, personnalisées : rayure 1/2), Festons (Ondulé, Triangle, Créneau, Droit), Structure (Bois naturel, perso), Socle (Noir, perso), Montants (60×1000 mm, perso L/H) | Tissu perso 150 · Festons 0 · Structure perso 100 · Socle perso 75 · Montants perso 100 |
| mini-golf | Surface de jeu (feutrine), Bordures, Modules, Balle ; Obstacles (Rampe G/D, Chicane, Bumpers, Tunnel, Pont, Passage étroit, Zigzag) ; couleurs | 4 catégories, toutes à 0 € (origine / perso) |
| zig-zag | Caisson, Revêtement de jeu, Chicanes ; couleurs (origine Bordeaux, Beige…) | Structure perso 200 · Fond adhésif 75 / peinture 75 · Parcours perso 150 |
| stand-de-tir | Structure bois, Déco secondaire, Fond (toile), Cibles, Cible centrale ; couleurs | 5 catégories, toutes à 0 € |
| table-de-blackjack | Tapis de jeu (vert feutre, perso, visuel client oui/non), Bordure / anneau, Pieds & structure ; couleurs | 3 catégories, toutes à 0 € |

## Tests
- `bun test scripts/` : 35/35 (dont 6 nouveaux dans `scripts/tests/standard-version.test.ts` : défauts inclus, podium « Brut », 3D remplace défaut, prix serveur = prix affiché). `node scripts/chiffrage-regression.mjs` OK.
- Navigateur 1440 et 390 px, envoi intercepté (0 requête /api/quotes/submit) : pouf sans 3D → 25 € HT, ajouté, « Version standard » dans Ma demande ✔ ; stèle avec 3D (message `product-config` Placage bois) → 150 € HT, Placage bois +100 € repris, récap 3D dans Ma demande ✔. Aucune erreur de page.
- Captures : `docs/captures-S16/` (d_ = 1440, m_ = 390).

## Non vérifié
- Mail interne/client : n'indique pas encore « Version standard » (aucun mail envoyé).
- Podium vérifié : « Brut » présélectionné, 325 € HT, affichage « Inclus ».
