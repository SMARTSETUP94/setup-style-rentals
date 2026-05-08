/**
 * Centralised SEO constants and helpers.
 * Single source of truth for the canonical site URL.
 */
export const SITE_URL = "https://catalogue.setup.paris";

/**
 * Build an absolute canonical URL from a path (with or without leading slash).
 * Strips query strings and trailing slashes (except root) for canonical stability.
 */
export function canonicalUrl(path: string = "/"): string {
  const clean = path.split("?")[0].split("#")[0];
  const withSlash = clean.startsWith("/") ? clean : `/${clean}`;
  const normalized = withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
  return `${SITE_URL}${normalized}`;
}

/**
 * Convenience helper for TanStack Router `head().links` arrays.
 */
export function canonicalLink(path: string = "/") {
  return { rel: "canonical", href: canonicalUrl(path) } as const;
}

/**
 * Default Open Graph share image (1200×630 recommended).
 * Hosted on the Setup Paris configurator CDN for stable absolute URL.
 */
export const DEFAULT_OG_IMAGE =
  "https://setup-paris-configurators.netlify.app/setup-paris-presentation-poster.jpg";

/**
 * Build a standard set of og:image / twitter:image meta tags for a route.
 * Pass an absolute URL. Width/height default to the standard 1200×630 ratio.
 */
export function ogImageMeta(
  url: string = DEFAULT_OG_IMAGE,
  { width = 1200, height = 630, alt = "Setup Paris" }: { width?: number; height?: number; alt?: string } = {},
) {
  return [
    { property: "og:image", content: url },
    { property: "og:image:width", content: String(width) },
    { property: "og:image:height", content: String(height) },
    { property: "og:image:alt", content: alt },
    { name: "twitter:image", content: url },
  ];
}

/**
 * Build hreflang alternate links for a given route path.
 * Uses `?lang=fr|en` query so Google can index both language variants
 * of the same canonical page. `x-default` points to the FR (default) URL.
 */
export function hreflangLinks(path: string = "/") {
  const base = canonicalUrl(path);
  return [
    { rel: "alternate", hrefLang: "fr", href: `${base}?lang=fr` },
    { rel: "alternate", hrefLang: "en", href: `${base}?lang=en` },
    { rel: "alternate", hrefLang: "x-default", href: base },
  ] as const;
}
