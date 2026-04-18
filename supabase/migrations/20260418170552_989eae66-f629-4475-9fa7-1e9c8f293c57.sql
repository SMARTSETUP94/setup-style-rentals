-- Product option categories (e.g. "Finition", "Couleur")
CREATE TABLE public.product_option_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_option_categories_product_id ON public.product_option_categories(product_id);

ALTER TABLE public.product_option_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Option categories viewable by everyone"
  ON public.product_option_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage option categories"
  ON public.product_option_categories
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_product_option_categories_updated_at
  BEFORE UPDATE ON public.product_option_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Product options (priced choices within a category)
CREATE TABLE public.product_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.product_option_categories(id) ON DELETE CASCADE,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_options_category_id ON public.product_options(category_id);

ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product options viewable by everyone"
  ON public.product_options
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product options"
  ON public.product_options
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_product_options_updated_at
  BEFORE UPDATE ON public.product_options
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();