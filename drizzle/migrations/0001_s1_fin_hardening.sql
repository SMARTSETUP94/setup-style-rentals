DROP POLICY IF EXISTS "Roadmap items viewable by everyone" ON public.roadmap_items;
CREATE POLICY "Admins can view roadmap items" ON public.roadmap_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

ALTER TABLE public.quote_requests ADD CONSTRAINT quote_requests_status_check CHECK (status IN ('pending','contacted','confirmed','completed','rejected')) NOT VALID;
ALTER TABLE public.quote_requests VALIDATE CONSTRAINT quote_requests_status_check;

CREATE OR REPLACE FUNCTION public.upsert_client_from_quote()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status IN ('pending','rejected') OR NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;
  IF NEW.email IS NULL OR length(trim(NEW.email)) = 0 THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.clients (email, name, company, phone)
  VALUES (lower(trim(NEW.email)), NEW.customer_name, NEW.company, NEW.phone)
  ON CONFLICT (email) DO UPDATE SET
    name = COALESCE(NULLIF(public.clients.name, ''), EXCLUDED.name),
    company = COALESCE(NULLIF(public.clients.company, ''), EXCLUDED.company),
    phone = COALESCE(NULLIF(public.clients.phone, ''), EXCLUDED.phone),
    updated_at = now();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS quote_requests_upsert_client ON public.quote_requests;
CREATE TRIGGER quote_requests_upsert_client_on_status AFTER UPDATE OF status ON public.quote_requests FOR EACH ROW EXECUTE FUNCTION public.upsert_client_from_quote();