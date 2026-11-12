/**
 * Language-prefixed public URLs.
 *
 * Public:   /en/produit/stele?c=1   (English)   /produit/stele?c=1 (French)
 * Internal: /produit/stele?c=1&lang=en           /produit/stele?c=1
 *
 * The router rewrite (see src/router.tsx) maps public ⇄ internal, so every
 * route file serves both languages and `<Link to="/produit/$slug">` stays
 * under /en automatically (the root route retains the `lang` search key).
 */
export type UrlLang = "fr" | "en";

/** Paths that never get a language prefix. */
const UNPREFIXED = /^\/(admin|api|configurators|sitemap\.xml|robots\.txt|llms\.txt|favicon)/;

export function isEnPublicPath(pathname: string): boolean {
  return pathname === "/en" || pathname.startsWith("/en/");
}

/** Public → internal. Mutates and returns the URL. */
export function rewriteInput(url: URL): URL {
  if (isEnPublicPath(url.pathname)) {
    url.pathname = url.pathname.slice(3) || "/";
    url.searchParams.set("lang", "en");
  }
  return url;
}

/** Internal → public. Mutates and returns the URL. */
export function rewriteOutput(url: URL): URL {
  const lang = url.searchParams.get("lang");
  if (lang !== null) {
    url.searchParams.delete("lang");
    if (lang === "en" && !UNPREFIXED.test(url.pathname)) {
      url.pathname = url.pathname === "/" ? "/en" : `/en${url.pathname}`;
    }
  }
  return url;
}

/** Public path (no query) of a page in the given language. */
export function localizedPath(path: string, lang: UrlLang): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === "fr") return clean;
  return clean === "/" ? "/en" : `/en${clean}`;
}

/**
 * Legacy `?lang=xx` → equivalent clean URL (or null when no redirect needed).
 * Used by the server request middleware to issue a 301.
 */
export function legacyLangRedirect(url: URL): string | null {
  const lang = url.searchParams.get("lang");
  if (lang === null) return null;
  if (UNPREFIXED.test(url.pathname)) return null;
  const params = new URLSearchParams(url.search);
  params.delete("lang");
  const qs = params.toString();
  const base = isEnPublicPath(url.pathname) ? url.pathname.slice(3) || "/" : url.pathname;
  const path = localizedPath(base, lang === "en" ? "en" : "fr");
  return path + (qs ? `?${qs}` : "") + url.hash;
}
