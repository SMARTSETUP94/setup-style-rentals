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


        // Static, indexable pages.
        // Static pages carry no lastmod (no page-specific timestamp available).
        const staticUrls: Array<{ loc: string; lastmod?: string; priority: string; changefreq: string }> = [
          { loc: "/", priority: "1.0", changefreq: "weekly" },
          { loc: "/catalogue", priority: "0.9", changefreq: "weekly" },
          { loc: "/sur-mesure", priority: "0.85", changefreq: "monthly" },
          ...SUR_MESURE_PIECES.map((p) => ({ loc: `/sur-mesure/${encodeURIComponent(p.k)}`, priority: "0.6", changefreq: "monthly" })),
          { loc: "/contact", priority: "0.6", changefreq: "yearly" },
          { loc: "/cgl", priority: "0.3", changefreq: "yearly" },
          { loc: "/mentions-legales", priority: "0.3", changefreq: "yearly" },
        ];

        const productUrls = (productsRes.data ?? []).map((p) => ({
          loc: `/produit/${encodeURIComponent(p.slug)}`,
          lastmod: p.updated_at?.slice(0, 10),
          priority: "0.8",
          changefreq: "weekly",
        }));

        const categoryUrls = (categoriesRes.data ?? []).map((c) => ({
          loc: `/categorie/${encodeURIComponent(c.slug)}`,
          lastmod: c.updated_at?.slice(0, 10),
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
