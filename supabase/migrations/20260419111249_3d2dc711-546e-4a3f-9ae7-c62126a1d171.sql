
CREATE OR REPLACE FUNCTION public.get_available_stock(_product_id uuid, _start_date date, _end_date date)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  WHERE qr.status IN ('confirmed', 'completed')
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
$function$;
