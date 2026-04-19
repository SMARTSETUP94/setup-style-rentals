ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS delivery_time time,
  ADD COLUMN IF NOT EXISTS pickup_time time;