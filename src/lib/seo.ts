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
