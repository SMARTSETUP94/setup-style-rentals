UPDATE public.products
SET is_active = false
WHERE slug NOT IN (
  'panier-basketball',
  'cornhole',
  'puissance-4',
  'mini-golf',
  'stand-de-tir',
  'zig-zag',
  'bar-led'
);