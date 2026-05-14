import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SITE_URL } from "@/lib/seo";

/**
 * Dynamic sitemap.xml — lists static pages, all active categories and all
 * active products. Served from `/sitemap.xml` for search engine crawling.
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const supabase = createClient<Database>(
          process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "",
          process.env.SUPABASE_PUBLISHABLE_KEY ??
            process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
            "",
        );

        const productsRes = await supabase
          .from("products")
          .select("slug, updated_at")
          .eq("is_active", true);

        const categoriesRes = await supabase
          .from("categories")
          .select("slug, updated_at")
          .eq("is_active", true);

        const today = new Date().toISOString().slice(0, 10);

        // Static, indexable pages.
        const staticUrls: Array<{ loc: string; lastmod: string; priority: string; changefreq: string }> = [
          { loc: "/", lastmod: today, priority: "1.0", changefreq: "weekly" },
          { loc: "/catalogue", lastmod: today, priority: "0.9", changefreq: "weekly" },
          { loc: "/devis", lastmod: today, priority: "0.6", changefreq: "monthly" },
          { loc: "/cgl", lastmod: today, priority: "0.3", changefreq: "yearly" },
          { loc: "/mentions-legales", lastmod: today, priority: "0.3", changefreq: "yearly" },
        ];

        const productUrls = (productsRes.data ?? []).map((p) => ({
          loc: `/produit/${encodeURIComponent(p.slug)}`,
          lastmod: p.updated_at?.slice(0, 10) ?? today,
          priority: "0.8",
          changefreq: "weekly",
        }));

        const categoryUrls = (categoriesRes.data ?? []).map((c) => ({
          loc: `/categorie/${encodeURIComponent(c.slug)}`,
          lastmod: c.updated_at?.slice(0, 10) ?? today,
          priority: "0.85",
          changefreq: "weekly",
        }));

        const all = [...staticUrls, ...categoryUrls, ...productUrls];

        // Each canonical URL is listed once (no ?lang param to avoid
        // duplicate-content). FR/EN variants are declared via
        // <xhtml:link rel="alternate" hreflang="..."> inside the same <url>
        // entry, per Google's sitemap hreflang spec.
        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
          `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
          all
            .map((u) => {
              const canonical = `${SITE_URL}${u.loc}`;
              return (
                `  <url>\n` +
                `    <loc>${canonical}</loc>\n` +
                `    <lastmod>${u.lastmod}</lastmod>\n` +
                `    <changefreq>${u.changefreq}</changefreq>\n` +
                `    <priority>${u.priority}</priority>\n` +
                `    <xhtml:link rel="alternate" hreflang="fr" href="${canonical}"/>\n` +
                `    <xhtml:link rel="alternate" hreflang="x-default" href="${canonical}"/>\n` +
                `  </url>`
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
