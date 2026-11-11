# S12 — Finitions des mails et de la confirmation
- Mails (api.quotes.submit.ts) : « Le JJ/MM/AAAA » si début = fin ; option à 0 € → « inclus » ; « Finition : Brut » ; caution « Caution, non incluse dans le total » ; salutation « Bonjour Prénom, » (1er mot, lettres 2–20) sinon « Bonjour, », puis « Merci pour votre demande. ».
- 48 h une seule fois dans le mail client (intro) : ligne « Prix : … » retirée du récap (chiffrage-split.ts), phrase sous le bloc sur mesure gardée seulement dans le mail interne. Échantillons affichés seulement si Oui.
- Confirmation /devis : « Le … » si un seul jour ; ligne sur mesure « Sur devis » (48 h seulement dans l'intro). Pas d'options ni d'échantillons affichés sur cet écran.
- Vérifié : compilation OK, HTML des deux mails relu sur données de test (48 h : 1 occurrence). Aucun mail envoyé, aucune migration, rien publié.
