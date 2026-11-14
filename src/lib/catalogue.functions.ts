import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/** Only public rental information: no admin client, private fields or inactive rows. */
export const getPublicCatalogue = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Public catalogue unavailable");
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const [products, categories] = await Promise.all([
    client.from("products").select("id,slug,name_fr,name_en,description_fr,description_en,category_slug,dimensions,price_day,price_week,price_month,deposit,image_url,configurator_url,configurator_options,stock_total,quantity_discounts,duration_discounts,price_event,event_days_included,price_extra_day,custom_label_fr,custom_label_en,custom_price,sort_order").eq("is_active", true).order("sort_order"),
    client.from("categories").select("id,slug,name_fr,name_en,color,image_url,sort_order,description_long_fr,description_long_en,faq").eq("is_active", true).order("sort_order"),
  ]);
  if (products.error || categories.error) throw new Error("Public catalogue unavailable");
  return { products: products.data ?? [], categories: categories.data ?? [] };
});

export const getPublicProductOptions = createServerFn({ method: "GET" })
  .inputValidator((input: { productId: string }) => input)
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) throw new Error("Public options unavailable");
    const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      } } });
    const active = await client.from("products").select("id").eq("id", data.productId).eq("is_active", true).maybeSingle();
    if (!active.data) return { optionCategories: [], productOptions: [] };
    const cats = await client.from("product_option_categories").select("id,name_fr,name_en,is_required,sort_order").eq("product_id", data.productId).order("sort_order");
    if (cats.error) throw new Error("Public options unavailable");
    const optionCategories = cats.data ?? [];
    if (!optionCategories.length) return { optionCategories, productOptions: [] };
    const opts = await client.from("product_options").select("id,category_id,name_fr,name_en,price,sort_order,is_active").in("category_id", optionCategories.map(c => c.id)).eq("is_active", true).order("sort_order");
    if (opts.error) throw new Error("Public options unavailable");
    return { optionCategories, productOptions: opts.data ?? [] };
  });