import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { canonicalUrl } from "@/lib/seo";
import { SUR_MESURE_PIECES } from "@/lib/sur-mesure";

/**
 * Dynamic sitemap.xml — lists static pages, all active categories and all
 * active products. Served from `/sitemap.xml` for search engine crawling.
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !key) return new Response("Sitemap unavailable", { status: 503 });
        const supabase = createClient<Database>(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { fetch: (input, init) => {
            const headers = new Headers(init?.headers);
            if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
            headers.set("apikey", key);
            return fetch(input, { ...init, headers });
          } },
        });
        // Ordered pagination prevents silently truncated or partial sitemaps.
        async function publicRows(table: "products" | "categories") {
          const rows: Array<{ slug: string; updated_at: string }> = [];
          for (let from = 0; ; from += 500) {
            const result = await supabase.from(table).select("slug, updated_at").eq("is_active", true).order("slug").range(from, from + 499);
            if (result.error) throw new Error("Sitemap public content unavailable");
            rows.push(...(result.data ?? []));
            if ((result.data ?? []).length < 500) return rows;
          }
        }
        let products: Array<{ slug: string; updated_at: string }>;
        let categories: Array<{ slug: string; updated_at: string }>;
        try { [products, categories] = await Promise.all([publicRows("products"), publicRows("categories")]); }
        catch { return new Response("Sitemap unavailable", { status: 503 }); }


        // Static, indexable pages.
        // Static pages carry no lastmod (no page-specific timestamp available).
        const staticUrls: Array<{ loc: string; lastmod?: string; priority: string; changefreq: string }> = [
          { loc: "/", priority: "1.0", changefreq: "weekly" },
          { loc: "/catalogue", priority: "0.9", changefreq: "weekly" },
          { loc: "/sur-mesure", priority: "0.85", changefreq: "monthly" },
          ...SUR_MESURE_PIECES.map((p) => ({ loc: `/sur-mesure/${encodeURIComponent(p.k)}`, priority: "0.6", changefreq: "monthly" })),
          { loc: "/contact", priority: "0.6", changefreq: "yearly" },
          { loc: "/devis", priority: "0.4", changefreq: "monthly" },
          { loc: "/cgl", priority: "0.3", changefreq: "yearly" },
          { loc: "/mentions-legales", priority: "0.3", changefreq: "yearly" },
        ];

        const productUrls = products.map((p) => ({
          loc: `/produit/${encodeURIComponent(p.slug)}`,
          lastmod: p.updated_at,
          priority: "0.8",
          changefreq: "weekly",
        }));

        const categoryUrls = categories.map((c) => ({
          loc: `/categorie/${encodeURIComponent(c.slug)}`,
          lastmod: c.updated_at,
          priority: "0.85",
          changefreq: "weekly",
        }));

        const all = [...staticUrls, ...categoryUrls, ...productUrls];

        // Both language variants are listed (French at the clean URL, English
        // under /en), each declaring fr/en/x-default alternates.
        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
          `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
          all
            .flatMap((u) => {
              const fr = canonicalUrl(u.loc, "fr");
              const en = canonicalUrl(u.loc, "en");
              const alts =
                `    <xhtml:link rel="alternate" hreflang="fr" href="${fr}"/>\n` +
                `    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>\n` +
                `    <xhtml:link rel="alternate" hreflang="x-default" href="${fr}"/>\n`;
              return [fr, en].map(
                (loc) =>
                  `  <url>\n` +
                  `    <loc>${loc}</loc>\n` +
                  (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : "") +
                  `    <changefreq>${u.changefreq}</changefreq>\n` +
                  `    <priority>${u.priority}</priority>\n` +
                  alts +
                  `  </url>`,
              );
            })
            .join("\n") +
          `\n</urlset>\n`;

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
