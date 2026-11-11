# S13 — Correctifs configurateur + moteur (appliqués par script, empreintes vérifiées)
- Lot lu avec la clé de service (3 lignes, 10240 car., md5 13f823…cec01 ; JSON 242769…566f) ; anciens md5 conformes. Écrits : sur-mesure.html 985d211d8f8cf05468a7a66728bfd1fc (115 048 o), chiffrage.server.js 4806f52e782edd58a3ba5756706959b5 (56 137 o). Script temporaire hors projet ; tmp_transfer conservée.
- chiffrage-regression.mjs : 7/7 OK (anciens cas + lettres 1829.19, « SETUP 2026 » Hl 1200 4705.34, incomplet = false).
- Fuite (build jetable) : « CIF Bois », « 72.5 … suivi », hypothesesParDefaut absents du bundle client. « Masterflex » et `bouche-pore 19 mm",prix` : un fichier client chacun, comme en S7 (sans doute la copie de sur-mesure.html, prix à 0) ; build supprimé avant de vérifier quel fichier.
- Navigateur /sur-mesure/comptoir : sur-mesure-ready reçu, silhouette visible, « Échelle » la masque, cotes en cm (160/110/60 cm), ajout → ligne dans /devis OK.
- 390 px : Échelle / Cotes / Recadrer sur une ligne, sous le bouton Fermer du site (pas de recouvrement). La référence passe sur 2 lignes et sa fin est partiellement masquée par les boutons — interne au configurateur, non corrigeable côté site.
- /admin/chiffrage?piece=lettres (admin connecté) : prix complet 1 829,19 €, aucune mention « partiel ». Aucune mention propre aux lettres à retirer dans le site (gestion générique d'`incomplet` conservée).
- Non vérifié : rendu des exports avec silhouette masquée.
