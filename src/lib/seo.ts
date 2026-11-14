import { localizedPath } from "./lang-url";
/**
 * Centralised SEO constants and helpers.
 * Single source of truth for the canonical site URL.
 */
export const SITE_URL = "https://catalogue.setup.paris";

/** Plain-text snippet, never split the final word or change stored content. */
export function seoDescription(text: string, max = 155): string {
  const clean = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const part = clean.slice(0, max + 1);
  const end = part.lastIndexOf(" ");
  return (end > 0 ? part.slice(0, end) : "").trim();
}

export function rentalTitle(name: string, lang: SeoLang): string {
  const suffix = L(lang, " — Location | Setup Paris", " — Rental | Setup Paris");
  const title = `${name}${suffix}`;
  return title.length <= 65 ? title : `${name} — Setup Paris`;
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>, lang: SeoLang) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, i) => ({
    "@type": "ListItem", position: i + 1, name: item.name, item: canonicalUrl(item.path, lang),
  })) };
}

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
