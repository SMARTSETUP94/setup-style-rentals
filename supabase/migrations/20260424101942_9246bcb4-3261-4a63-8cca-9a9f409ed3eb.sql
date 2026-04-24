-- Fix Mini-Golf to use Pro Netlify configurator like Basketball/Chamboule-tout
UPDATE public.products
SET configurator_url = 'https://setup-paris-configurators.netlify.app/mini-golf/'
WHERE slug = 'mini-golf';

-- Remove the duplicate DB-stored option categories — these are now handled
-- internally by the new 3D configurator (recap_html captures the choices)
DELETE FROM public.product_options
WHERE category_id IN (
  SELECT id FROM public.product_option_categories
  WHERE product_id = (SELECT id FROM public.products WHERE slug = 'mini-golf')
);

DELETE FROM public.product_option_categories
WHERE product_id = (SELECT id FROM public.products WHERE slug = 'mini-golf');