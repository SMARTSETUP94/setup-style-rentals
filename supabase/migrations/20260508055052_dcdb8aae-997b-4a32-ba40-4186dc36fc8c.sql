
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS description_long_fr text,
  ADD COLUMN IF NOT EXISTS description_long_en text,
  ADD COLUMN IF NOT EXISTS faq jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public.get_available_stock_bulk(_product_ids uuid[], _start_date date, _end_date date)
RETURNS TABLE(product_id uuid, available integer)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH reserved AS (
    SELECT (item->>'productId')::uuid AS pid,
           SUM((item->>'quantity')::int)::int AS qty
    FROM public.quote_requests qr,
         jsonb_array_elements(qr.items) AS item
    WHERE qr.status IN ('confirmed', 'completed')
      AND (item->>'productId')::uuid = ANY(_product_ids)
      AND (item->>'startDate') IS NOT NULL
      AND (item->>'endDate') IS NOT NULL
      AND daterange(
            (item->>'startDate')::date,
            (item->>'endDate')::date,
            '[]'
          ) && daterange(_start_date, _end_date, '[]')
    GROUP BY (item->>'productId')::uuid
  )
  SELECT p.id,
         GREATEST(p.stock_total - COALESCE(r.qty, 0), 0)
  FROM public.products p
  LEFT JOIN reserved r ON r.pid = p.id
  WHERE p.id = ANY(_product_ids);
END;
$$;
