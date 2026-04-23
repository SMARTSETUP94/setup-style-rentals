-- Roadmap items table
CREATE TABLE public.roadmap_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('done', 'in-progress', 'planned')),
  date text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;

-- Public can read (roadmap is shown in admin only but no PII, keep simple)
CREATE POLICY "Roadmap items viewable by everyone"
ON public.roadmap_items FOR SELECT
USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage roadmap items"
ON public.roadmap_items FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_roadmap_items_updated_at
BEFORE UPDATE ON public.roadmap_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with current items
INSERT INTO public.roadmap_items (title, description, status, date, sort_order) VALUES
  ('Catalogue produits avec fiches détaillées', 'Pages produits complètes avec descriptions, dimensions, prix et galeries.', 'done', 'Mars 2025', 10),
  ('Configurateurs 3D intégrés (17 produits)', 'Iframes interactives avec postMessage pour personnalisation en temps réel.', 'done', 'Mars 2025', 20),
  ('Système de devis / panier', 'Ajout au panier, demande de devis, calcul HT/TTC, caution et frais logistiques.', 'done', 'Mars 2025', 30),
  ('Page admin avec gestion produits', 'Création, édition, activation, options et remises par produit.', 'done', 'Mars 2025', 40),
  ('Gestion des catégories', 'CRUD complet des catégories avec visuels, ordre et statut actif.', 'done', 'Mars 2025', 50),
  ('Gestion des configurateurs 3D', 'Upload HTML ou URL externe, options JSON envoyées via postMessage.', 'done', 'Avril 2025', 60),
  ('Intégration Netlify pour les configurateurs', 'Hébergement dédié sur setup-paris-configurators.netlify.app.', 'done', 'Avril 2025', 70),
  ('Notifications email', 'Système d''emails transactionnels (confirmation, rappel, suivi).', 'in-progress', NULL, 100),
  ('Analytics & dashboard admin', 'Statistiques détaillées : conversion, top produits, revenus.', 'in-progress', NULL, 110),
  ('Paiement en ligne', 'Acompte ou règlement complet via Stripe / Paddle.', 'planned', NULL, 200),
  ('Espace client', 'Compte client avec suivi et historique des commandes.', 'planned', NULL, 210),
  ('Gestion des disponibilités', 'Calendrier de stock par produit avec blocage automatique.', 'planned', NULL, 220),
  ('Système d''avis clients', 'Recueil et affichage des avis vérifiés post-événement.', 'planned', NULL, 230),
  ('Intégration CRM', 'Synchronisation des contacts et devis avec un CRM externe.', 'planned', NULL, 240);