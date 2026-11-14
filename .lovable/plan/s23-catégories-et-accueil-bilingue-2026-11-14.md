# S23 — Catégories et accueil bilingue

## Résultat
- Rediriger définitivement les trois anciennes catégories vers leurs remplaçantes en français et en anglais ; conserver une erreur 404 pour les autres catégories absentes ou inactives.
- Recomposer l’accueil dans l’ordre demandé, avec la photo actuelle, les cinq catégories et leurs nombres réels d’objets, les six produits indiqués, les promesses, les quatre étapes, les logos conservés et trois réponses FAQ reprises des catégories.
- Retirer la vidéo de l’accueil sans supprimer son fichier ; conserver le nom et le logo actuels de l’en-tête.
- Vérifier les filtres, liens et listes d’administration ; proposer uniquement les catégories actives dans le formulaire produit.

## Détails techniques
- Réutiliser les données publiques chargées côté serveur et les styles existants, sans écrire en base ni changer les prix ou demandes.
- Préserver le fonctionnement des URL `/en`, les canonical, hreflang et données Organization/LocalBusiness ; ajouter la FAQPage correspondant aux réponses affichées.
- Le sitemap existant sélectionne déjà les catégories actives : vérifier ses cinq paires FR/EN et conserver uniquement les dates propres aux contenus.
- Ajouter des tests des redirections, 404 et données d’accueil ; exécuter `bun test`, contrôler le HTML initial avec curl et l’affichage FR/EN à 1440 et 390 px.
- Consigner les résultats et captures dans `docs/journal-S23.md`. Ne pas publier.