# S9 — Mail interne des demandes
- Récap sur mesure (2 mails) : lignes « Référence : » / « Poids estimé : » retirées du bloc (restent dans l'en-tête) via `src/lib/chiffrage-split.ts`.
- Mail interne : lien cliquable {SITE_URL}/admin/devis, lien « Ouvrir dans le chiffrage » (?config_id) sous chaque pièce, badge Location/Sur mesure/Mixte, téléphone en tel:, livraison souhaitée + « après l'événement » sous les coordonnées.
- `non_chiffre` séparé en « Postes non chiffrés » / « À noter » dans le mail interne et ChiffragePanel.
- Vérifié : rendu HTML des 2 mails sur données de test (bun, aucun envoi) ; mail client sans estimation ni doublon de référence ; typecheck OK.
- Non vérifié : affichage réel dans un client mail. Rien publié, aucune migration.
