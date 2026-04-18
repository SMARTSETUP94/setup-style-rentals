-- Replace permissive INSERT policy with validated one
DROP POLICY IF EXISTS "Anyone can submit a quote request" ON public.quote_requests;

CREATE POLICY "Public can submit valid quote requests" ON public.quote_requests
  FOR INSERT
  WITH CHECK (
    char_length(customer_name) BETWEEN 1 AND 200
    AND char_length(email) BETWEEN 3 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND jsonb_array_length(items) > 0
    AND jsonb_array_length(items) <= 100
    AND status = 'pending'
    AND (company IS NULL OR char_length(company) <= 200)
    AND (phone IS NULL OR char_length(phone) <= 50)
    AND (message IS NULL OR char_length(message) <= 5000)
    AND (event_location IS NULL OR char_length(event_location) <= 500)
  );