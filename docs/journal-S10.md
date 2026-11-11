# S10 — Expéditeur des mails
- Défauts (api.quotes.submit.ts, api.contact.ts — seuls envois de mails) : expéditeur « Setup Paris <devis@setup.paris> », internes devis@setup.paris + smart@setup.paris.
- Reply-To : mail client → devis@setup.paris ; mail interne et contact → adresse du client. Refus Resend : journalisé (code + message) et stocké `failed:<code>:<message>` (≤120 car.) dans email_*_status.
- checklist-publication.md : RESEND_FROM / QUOTE_NOTIFY_TO facultatives. Compilation OK ; aucun mail envoyé, aucune migration, rien publié.
