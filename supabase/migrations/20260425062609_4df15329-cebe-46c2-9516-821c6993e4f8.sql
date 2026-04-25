-- Delete product_options first, then their categories
-- Basketball: drop "Habillage panneaux" and "Cadre extérieur"
DELETE FROM public.product_options
WHERE category_id IN (
  SELECT poc.id
  FROM public.product_option_categories poc
  JOIN public.products p ON p.id = poc.product_id
  WHERE p.slug = 'panier-basketball'
    AND poc.name_fr IN ('Habillage panneaux (finition)', 'Cadre extérieur (structure métallique)')
);

DELETE FROM public.product_option_categories
WHERE id IN (
  SELECT poc.id
  FROM public.product_option_categories poc
  JOIN public.products p ON p.id = poc.product_id
  WHERE p.slug = 'panier-basketball'
    AND poc.name_fr IN ('Habillage panneaux (finition)', 'Cadre extérieur (structure métallique)')
);

-- Plinko: drop "Couleur du panneau" and "Couleur des picots"
DELETE FROM public.product_options
WHERE category_id IN (
  SELECT poc.id
  FROM public.product_option_categories poc
  JOIN public.products p ON p.id = poc.product_id
  WHERE p.slug = 'plinko'
    AND poc.name_fr IN ('Couleur du panneau', 'Couleur des picots')
);

DELETE FROM public.product_option_categories
WHERE id IN (
  SELECT poc.id
  FROM public.product_option_categories poc
  JOIN public.products p ON p.id = poc.product_id
  WHERE p.slug = 'plinko'
    AND poc.name_fr IN ('Couleur du panneau', 'Couleur des picots')
);

-- Stand de tir: drop "Finition structure" and "Couleur des cibles"
DELETE FROM public.product_options
WHERE category_id IN (
  SELECT poc.id
  FROM public.product_option_categories poc
  JOIN public.products p ON p.id = poc.product_id
  WHERE p.slug = 'stand-de-tir'
    AND poc.name_fr IN ('Finition structure', 'Couleur des cibles')
);

DELETE FROM public.product_option_categories
WHERE id IN (
  SELECT poc.id
  FROM public.product_option_categories poc
  JOIN public.products p ON p.id = poc.product_id
  WHERE p.slug = 'stand-de-tir'
    AND poc.name_fr IN ('Finition structure', 'Couleur des cibles')
);