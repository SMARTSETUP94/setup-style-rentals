# S11 — Envoi de test réel (serveur de développement, navigateur piloté)
- Contenu : pupitre sur mesure (largeur 600 → 700 mm) + location « Podium Tryptique » le 11/12/2026 (1 jour). Nom « TEST CLAUDE 3 — à supprimer », société TEST, client gabinchaussegros@gmail.com, téléphone vide.
- /api/quotes/submit : 200 {"ok":true,"number":"W-00004","email":{"admin":true,"client":true}}.
- En base : email_admin_status = sent, email_client_status = sent, has_custom = true. Demande conservée.
- Journaux serveur : aucune erreur Resend pour les deux envois (2xx). L'identifiant du message Resend n'est pas journalisé par le code (seuls les échecs le sont), donc non relevé.
- Aucun autre mail envoyé, aucune modification de code, rien publié.
