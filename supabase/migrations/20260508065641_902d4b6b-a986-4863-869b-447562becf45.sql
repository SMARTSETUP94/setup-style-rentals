-- Clients (CRM) table
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  company text,
  phone text,
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage clients" ON public.clients
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_clients_email ON public.clients (email);

-- Normalize email helper
CREATE OR REPLACE FUNCTION public.normalize_email()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.email = lower(trim(NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER clients_normalize_email
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.normalize_email();

-- Auto-upsert client on new quote_request
CREATE OR REPLACE FUNCTION public.upsert_client_from_quote()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email IS NULL OR length(trim(NEW.email)) = 0 THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.clients (email, name, company, phone)
  VALUES (lower(trim(NEW.email)), NEW.customer_name, NEW.company, NEW.phone)
  ON CONFLICT (email) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.clients.name),
    company = COALESCE(EXCLUDED.company, public.clients.company),
    phone = COALESCE(EXCLUDED.phone, public.clients.phone),
    updated_at = now();

  RETURN NEW;
END;
$$;

CREATE TRIGGER quote_requests_upsert_client
  AFTER INSERT ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.upsert_client_from_quote();

-- Backfill from existing quote_requests
INSERT INTO public.clients (email, name, company, phone, created_at)
SELECT
  lower(trim(email)) AS email,
  (array_agg(customer_name ORDER BY created_at DESC))[1] AS name,
  (array_agg(company ORDER BY created_at DESC) FILTER (WHERE company IS NOT NULL))[1] AS company,
  (array_agg(phone ORDER BY created_at DESC) FILTER (WHERE phone IS NOT NULL))[1] AS phone,
  MIN(created_at) AS created_at
FROM public.quote_requests
WHERE email IS NOT NULL AND length(trim(email)) > 0
GROUP BY lower(trim(email))
ON CONFLICT (email) DO NOTHING;