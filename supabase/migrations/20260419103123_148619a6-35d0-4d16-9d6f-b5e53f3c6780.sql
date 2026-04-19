-- 1. Stock column on products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_total integer NOT NULL DEFAULT 1;

-- 2. Helper function: compute available stock for a product in a date range
-- Reserved = sum of quantities across quote_requests whose status is in
-- ('confirmed', 'accepted', 'paid') and whose [start_date, end_date] overlaps
-- the requested window. Items shape: [{ productId, quantity, startDate, endDate, ... }]
CREATE OR REPLACE FUNCTION public.get_available_stock(
  _product_id uuid,
  _start_date date,
  _end_date date
)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total integer;
  reserved integer;
BEGIN
  SELECT stock_total INTO total FROM public.products WHERE id = _product_id;
  IF total IS NULL THEN
    RETURN 0;
  END IF;

  SELECT COALESCE(SUM((item->>'quantity')::int), 0)
  INTO reserved
  FROM public.quote_requests qr,
       jsonb_array_elements(qr.items) AS item
  WHERE qr.status IN ('confirmed', 'accepted', 'paid')
    AND (item->>'productId')::uuid = _product_id
    AND (item->>'startDate') IS NOT NULL
    AND (item->>'endDate') IS NOT NULL
    AND daterange(
          (item->>'startDate')::date,
          (item->>'endDate')::date,
          '[]'
        ) && daterange(_start_date, _end_date, '[]');

  RETURN GREATEST(total - COALESCE(reserved, 0), 0);
END;
$$;

-- Allow public (anon + authenticated) to call this read-only function
GRANT EXECUTE ON FUNCTION public.get_available_stock(uuid, date, date) TO anon, authenticated;