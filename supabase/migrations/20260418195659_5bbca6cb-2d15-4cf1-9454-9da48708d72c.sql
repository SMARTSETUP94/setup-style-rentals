-- 1. Add JSON column to store configurator options per product
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS configurator_options jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.products.configurator_options IS
  'Per-product configurator options & pricing, consumed by the 3D iframe via postMessage. Shape depends on the configurator (e.g. {"plateau":[{value,label,price}],...}).';

-- 2. Seed default config for the cornhole product (if it exists)
UPDATE public.products
SET configurator_options = '{
  "plateau":[
    {"value":"blanc","label":"Peinture blanche mate","price":0},
    {"value":"couleur","label":"Peinture couleur au choix","price":50},
    {"value":"placage","label":"Placage dibond/tôle/stratifié","price":100},
    {"value":"adhesif","label":"Adhésif surface","price":75}
  ],
  "champs":[
    {"value":"blanc","label":"Peinture blanche mate","price":0},
    {"value":"couleur","label":"Peinture couleur au choix","price":25},
    {"value":"placage","label":"Placage dibond/tôle/stratifié","price":50}
  ],
  "sacs":[
    {"value":"standard","label":"Standard bleu+rouge ×6","price":0},
    {"value":"couleur","label":"Tissu couleur au choix ×6","price":100}
  ]
}'::jsonb
WHERE slug = 'cornhole'
  AND configurator_options = '{}'::jsonb;