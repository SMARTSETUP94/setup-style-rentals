-- Update Basketball product: configurator URL and base price
UPDATE public.products
SET configurator_url = 'https://setup-paris-configurators.netlify.app/basketball/',
    price_day = 150
WHERE id = 'ea5a981e-e26e-4f04-bce2-022df0c806a9';

-- Remove the legacy "Finition" category (and any orphan options for Basketball)
-- that doesn't match the new spec. Keep the 3 new categories already inserted.
DELETE FROM public.product_options
WHERE category_id IN (
  SELECT id FROM public.product_option_categories
  WHERE product_id = 'ea5a981e-e26e-4f04-bce2-022df0c806a9'
    AND name_fr NOT IN (
      'Habillage panneaux (finition)',
      'Cadre extérieur (structure métallique)',
      'Personnalisation fond de décor (panneau arrière)'
    )
);

DELETE FROM public.product_option_categories
WHERE product_id = 'ea5a981e-e26e-4f04-bce2-022df0c806a9'
  AND name_fr NOT IN (
    'Habillage panneaux (finition)',
    'Cadre extérieur (structure métallique)',
    'Personnalisation fond de décor (panneau arrière)'
  );