import DOMPurify from "dompurify";
import type { Lang } from "@/lib/i18n";
import { translateRecapHtml } from "@/lib/recap-i18n";

/**
 * Sanitize the configurator-provided HTML recap before rendering it via
 * `dangerouslySetInnerHTML`. Strips scripts, event handlers, dangerous URI
 * schemes (javascript:, data: in non-images, vbscript:), and disallowed tags.
 *
 * The configurator iframes are first-party today, but `recap_html` arrives
 * via cross-origin `postMessage`, so it MUST be treated as untrusted input.
 * SSR-safe: returns "" when `window` is unavailable (DOMPurify needs DOM).
 */
export function sanitizeRecapHtml(html: string | null | undefined): string {
  if (!html) return "";
  if (typeof window === "undefined") return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "div", "span", "p", "br", "hr",
      "strong", "b", "em", "i", "u", "small", "sup", "sub", "mark",
      "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "table", "thead", "tbody", "tr", "th", "td",
      "img",
    ],
    ALLOWED_ATTR: ["class", "style", "src", "alt", "title", "width", "height"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus"],
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize and then translate a configurator-provided recap HTML so the
 * visible labels match the active site language. Use this on UI surfaces
 * (product page, quote page) where the FR/EN toggle should also affect
 * the 3D recap. The plain `sanitizeRecapHtml` stays available for places
 * that want raw output (e.g. server-side email rendering).
 */
export function sanitizeAndTranslateRecapHtml(
  html: string | null | undefined,
  lang: Lang,
): string {
  const safe = sanitizeRecapHtml(html);
  if (!safe) return "";
  return translateRecapHtml(safe, lang);
}