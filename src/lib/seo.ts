import { localizedPath } from "./lang-url";
/**
 * Centralised SEO constants and helpers.
 * Single source of truth for the canonical site URL.
 */
export const SITE_URL = "https://catalogue.setup.paris";

/**
 * Build an absolute canonical URL from a path (with or without leading slash).
 * Strips query strings and trailing slashes (except root) for canonical stability.
 */
export function canonicalUrl(path: string = "/", lang: SeoLang = "fr"): string {
  const clean = path.split("?")[0].split("#")[0];
  const withSlash = clean.startsWith("/") ? clean : `/${clean}`;
  const normalized = withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
  return `${SITE_URL}${localizedPath(normalized, lang)}`;
}

export type SeoLang = "fr" | "en";

/** Language of a route match inside `head()` (internal `?lang=en` ⇐ public /en/...). */
export function headLang(match: { search?: unknown } | undefined): SeoLang {
  return (match?.search as { lang?: string } | undefined)?.lang === "en" ? "en" : "fr";
}

/** Pick FR/EN copy. */
export const L = (lang: SeoLang, fr: string, en: string) => (lang === "en" ? en : fr);

/** canonical (self) + hreflang fr/en/x-default for a page. */
export function seoLinks(path: string, lang: SeoLang) {
  return [canonicalLink(path, lang), ...hreflangLinks(path)];
}

/** Locale meta for a page. */
export function localeMeta(lang: SeoLang) {
  return [
    { property: "og:locale", content: lang === "en" ? "en_GB" : "fr_FR" },
    { property: "og:locale:alternate", content: lang === "en" ? "fr_FR" : "en_GB" },
  ];
}

/**
 * Convenience helper for TanStack Router `head().links` arrays.
 */
export function canonicalLink(path: string = "/", lang: SeoLang = "fr") {
  return { rel: "canonical", href: canonicalUrl(path, lang) } as const;
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
 * hreflang alternates: French at the clean URL, English under /en,
 * x-default = French. Never a `?lang=` variant (legacy, 301-redirected).
 */
export function hreflangLinks(path: string = "/") {
  return [
    { rel: "alternate", hrefLang: "fr", href: canonicalUrl(path, "fr") },
    { rel: "alternate", hrefLang: "en", href: canonicalUrl(path, "en") },
    { rel: "alternate", hrefLang: "x-default", href: canonicalUrl(path, "fr") },
  ] as const;
}

/** Schema.org Service for custom-made pages (no price on purpose). */
export function serviceJsonLd(name: string, description: string, url: string, lang: SeoLang = "fr") {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: lang === "en" ? "Custom-made event furniture production" : "Fabrication de mobilier événementiel sur mesure",
    inLanguage: lang,
    name,
    description,
    url,
    provider: { "@type": "Organization", name: "Setup Paris", url: SITE_URL },
    areaServed: [
      { "@type": "City", name: "Paris" },
      { "@type": "AdministrativeArea", name: "Île-de-France" },
    ],
  };
}
